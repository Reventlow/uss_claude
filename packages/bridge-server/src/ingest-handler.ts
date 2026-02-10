import { WebSocket } from "ws";
import type { IncomingMessage } from "node:http";
import { parseMessage, isMcpEvent, isHeartbeat, isDisconnect, isSystemIdle } from "@uss-claude/shared";
import type { McpEventMessage } from "@uss-claude/shared";
import type { StateTracker } from "./state-tracker.js";
import type { BridgeHandler } from "./bridge-handler.js";
import { logger } from "./logger.js";

/**
 * Handles the single ingest WebSocket connection from the CLI hook daemon.
 * Enforces token auth and single-connection policy.
 */
export class IngestHandler {
  private currentConnection: WebSocket | null = null;
  private bridgeToken: string;
  private stateTracker: StateTracker;
  private bridgeHandler: BridgeHandler;

  constructor(bridgeToken: string, stateTracker: StateTracker, bridgeHandler: BridgeHandler) {
    this.bridgeToken = bridgeToken;
    this.stateTracker = stateTracker;
    this.bridgeHandler = bridgeHandler;
  }

  /** Handle a new ingest WebSocket connection */
  handleConnection(ws: WebSocket, req: IncomingMessage): void {
    // Token authentication
    if (this.bridgeToken) {
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
      const token = url.searchParams.get("token");
      if (token !== this.bridgeToken) {
        logger.warn("ingest", "Rejected ingest client: invalid token");
        ws.close(4003, "Invalid token");
        return;
      }
    }

    // Single connection policy: close old connection with 4001
    if (this.currentConnection && this.currentConnection.readyState === WebSocket.OPEN) {
      logger.info("ingest", "Replacing existing ingest connection");
      this.currentConnection.close(4001, "Replaced by new connection");
    }

    this.currentConnection = ws;
    this.stateTracker.onIngestConnect();
    logger.info("ingest", "Ingest client connected");

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
      logger.info("ingest", "Ingest client disconnected", {
        code,
        reason: reason.toString("utf-8"),
      });
      if (this.currentConnection === ws) {
        this.currentConnection = null;
        this.stateTracker.onIngestDisconnect();
      }
    });

    ws.on("error", (err) => {
      logger.error("ingest", "Ingest client error", { error: err.message });
    });
  }

  /** Whether the ingest client is currently connected */
  get isConnected(): boolean {
    return this.currentConnection !== null && this.currentConnection.readyState === WebSocket.OPEN;
  }
}
