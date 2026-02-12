import { WebSocket } from "ws";
import type { IncomingMessage } from "node:http";
import { parseMessage, isMcpEvent, isHeartbeat, isDisconnect, isSystemIdle, isTrackEvent, TIMING } from "@uss-claude/shared";
import type { McpEventMessage, TrackEventMessage, DiscoEventMessage } from "@uss-claude/shared";
import { isTrackTrending, isTrackLofi } from "./chart-fetcher.js";
import type { StateTracker } from "./state-tracker.js";
import type { BridgeHandler } from "./bridge-handler.js";
import { logger } from "./logger.js";

/**
 * Handles ingest WebSocket connections from the CLI hook daemon
 * and other ingest clients (e.g. spoty-daemon).
 * Supports multiple named connections via ?client= query param.
 * Enforces per-client single-connection policy.
 */
export class IngestHandler {
  private connections: Map<string, WebSocket> = new Map();
  private bridgeToken: string;
  private stateTracker: StateTracker;
  private bridgeHandler: BridgeHandler;
  private discoTimer: ReturnType<typeof setTimeout> | null = null;
  private discoActive = false;

  constructor(bridgeToken: string, stateTracker: StateTracker, bridgeHandler: BridgeHandler) {
    this.bridgeToken = bridgeToken;
    this.stateTracker = stateTracker;
    this.bridgeHandler = bridgeHandler;
  }

  /** Handle a new ingest WebSocket connection */
  handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

    // Token authentication
    if (this.bridgeToken) {
      const token = url.searchParams.get("token");
      if (token !== this.bridgeToken) {
        logger.warn("ingest", "Rejected ingest client: invalid token");
        ws.close(4003, "Invalid token");
        return;
      }
    }

    // Identify connection source (default to "hook-cli" for backwards compat)
    const clientName = url.searchParams.get("client") ?? "hook-cli";

    // Per-client single-connection policy: close old connection with 4001
    const existing = this.connections.get(clientName);
    if (existing && existing.readyState === WebSocket.OPEN) {
      logger.info("ingest", `Replacing existing ${clientName} connection`);
      existing.close(4001, "Replaced by new connection");
    }

    this.connections.set(clientName, ws);
    // Only trigger laptop connect state for the main hook-cli client
    if (clientName === "hook-cli") {
      this.stateTracker.onIngestConnect();
    }
    logger.info("ingest", `Ingest client connected: ${clientName}`);

    ws.on("message", (raw) => {
      const data = typeof raw === "string" ? raw : raw.toString("utf-8");
      const msg = parseMessage(data);
      if (!msg) {
        logger.warn("ingest", "Received unparseable message", { raw: data.slice(0, 200) });
        return;
      }

      if (isMcpEvent(msg)) {
        this.stateTracker.onMcpEvent(msg as McpEventMessage);
        // Forward MCP events to bridge clients
        this.bridgeHandler.broadcast(msg as McpEventMessage);
      } else if (isTrackEvent(msg)) {
        const trackMsg = msg as TrackEventMessage;
        // Forward track events to bridge clients immediately
        this.bridgeHandler.broadcast(trackMsg);
        // Check for disco trigger and lofi tags
        if ((trackMsg.action === "playing" || trackMsg.action === "changed") && trackMsg.artist && trackMsg.title) {
          void this.checkDiscoTrigger(trackMsg.artist, trackMsg.title);
          void this.checkLofiTags(trackMsg);
        }
      } else if (isHeartbeat(msg)) {
        this.stateTracker.onHeartbeat();
      } else if (isDisconnect(msg)) {
        this.stateTracker.onDisconnectMessage();
      } else if (isSystemIdle(msg)) {
        this.stateTracker.onSystemIdle();
      } else {
        logger.warn("ingest", "Unknown message type", { type: String((msg as unknown as Record<string, unknown>).type) });
      }
    });

    ws.on("close", (code, reason) => {
      logger.info("ingest", `Ingest client disconnected: ${clientName}`, {
        code,
        reason: reason.toString("utf-8"),
      });
      if (this.connections.get(clientName) === ws) {
        this.connections.delete(clientName);
        // Only trigger laptop disconnect for the main hook-cli client
        if (clientName === "hook-cli") {
          this.stateTracker.onIngestDisconnect();
        }
      }
    });

    ws.on("error", (err) => {
      logger.error("ingest", `Ingest client error (${clientName})`, { error: err.message });
    });
  }

  /** Check if a track is trending and trigger disco mode */
  private async checkDiscoTrigger(artist: string, title: string): Promise<void> {
    if (this.discoActive) return;

    const trending = await isTrackTrending(artist, title);
    if (!trending) return;

    this.discoActive = true;
    logger.info("disco", `Chart-topping hit detected: ${artist} - ${title}! Initiating disco protocol!`);

    const startMsg: DiscoEventMessage = {
      type: "disco_event",
      action: "start",
      artist,
      title,
      timestamp: Date.now(),
    };
    this.bridgeHandler.broadcast(startMsg);

    // Clear previous timer if any
    if (this.discoTimer) clearTimeout(this.discoTimer);

    this.discoTimer = setTimeout(() => {
      const stopMsg: DiscoEventMessage = {
        type: "disco_event",
        action: "stop",
        timestamp: Date.now(),
      };
      this.bridgeHandler.broadcast(stopMsg);
      this.discoActive = false;
      this.discoTimer = null;
      logger.info("disco", "Disco protocol complete. Resuming normal operations.");
    }, TIMING.DISCO_TOTAL_DURATION);
  }

  /** Check Last.fm tags and re-broadcast with lofi flag if applicable */
  private async checkLofiTags(trackMsg: TrackEventMessage): Promise<void> {
    if (!trackMsg.artist || !trackMsg.title) return;
    const lofi = await isTrackLofi(trackMsg.artist, trackMsg.title);
    if (lofi) {
      // Re-broadcast with lofi flag so the UI knows
      const enriched: TrackEventMessage = { ...trackMsg, lofi: true };
      this.bridgeHandler.broadcast(enriched);
    }
  }

  /** Whether the main ingest client (hook-cli) is currently connected */
  get isConnected(): boolean {
    const main = this.connections.get("hook-cli");
    return main !== null && main !== undefined && main.readyState === WebSocket.OPEN;
  }
}
