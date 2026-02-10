import { WebSocket } from "ws";
import type { IncomingMessage } from "node:http";
import type { BridgeMessage, StatusMessage, BridgePongMessage } from "@uss-claude/shared";
import { isBridgePing } from "@uss-claude/shared";
import type { StateTracker } from "./state-tracker.js";
import { logger } from "./logger.js";

/**
 * Manages browser bridge WebSocket clients.
 * Browser clients are read-only: they receive events but cannot send upstream.
 */
export class BridgeHandler {
  private clients = new Set<WebSocket>();
  private bridgePassword: string | null;
  private stateTracker: StateTracker;

  constructor(stateTracker: StateTracker, bridgePassword: string | null) {
    this.stateTracker = stateTracker;
    this.bridgePassword = bridgePassword;
  }

  /** Handle a new bridge WebSocket connection */
  handleConnection(ws: WebSocket, req: IncomingMessage): void {
    // Optional password auth
    if (this.bridgePassword) {
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
      const password = url.searchParams.get("password");
      if (password !== this.bridgePassword) {
        logger.warn("bridge", "Rejected bridge client: invalid password");
        ws.close(4003, "Invalid password");
        return;
      }
    }

    this.clients.add(ws);
    logger.info("bridge", "Bridge client connected", { total: this.clients.size });

    // Send current status on connect
    const statusMsg: StatusMessage = {
      type: "status",
      status: this.stateTracker.getStatus(),
      timestamp: Date.now(),
    };
    ws.send(JSON.stringify(statusMsg));

    // Handle ping from bridge clients
    ws.on("message", (data) => {
      try {
        const msg: unknown = JSON.parse(data.toString());
        if (isBridgePing(msg)) {
          const pong: BridgePongMessage = { type: "bridge_pong", timestamp: Date.now() };
          ws.send(JSON.stringify(pong));
        }
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on("close", () => {
      this.clients.delete(ws);
      logger.info("bridge", "Bridge client disconnected", { total: this.clients.size });
    });

    ws.on("error", (err) => {
      logger.error("bridge", "Bridge client error", { error: err.message });
      this.clients.delete(ws);
    });
  }

  /** Broadcast a message to all connected bridge clients */
  broadcast(msg: BridgeMessage): void {
    const data = JSON.stringify(msg);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  /** Number of connected bridge clients */
  get clientCount(): number {
    return this.clients.size;
  }
}
