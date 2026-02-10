import { WebSocketServer } from "ws";
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import type { IngestHandler } from "./ingest-handler.js";
import type { BridgeHandler } from "./bridge-handler.js";
import { logger } from "./logger.js";

/** WebSocket path for ingest connections (from CLI hook daemon) */
const INGEST_PATH = "/ws/ingest";
/** WebSocket path for bridge connections (from browser UI) */
const BRIDGE_PATH = "/ws/bridge";

/**
 * Manages WebSocket upgrades using noServer mode.
 * Routes connections to the appropriate handler by URL path.
 */
export class WsManager {
  private ingestWss: WebSocketServer;
  private bridgeWss: WebSocketServer;
  private ingestHandler: IngestHandler;
  private bridgeHandler: BridgeHandler;

  constructor(ingestHandler: IngestHandler, bridgeHandler: BridgeHandler) {
    this.ingestHandler = ingestHandler;
    this.bridgeHandler = bridgeHandler;

    // Create both WSS instances in noServer mode
    this.ingestWss = new WebSocketServer({ noServer: true });
    this.bridgeWss = new WebSocketServer({ noServer: true });

    // Wire up connection handlers
    this.ingestWss.on("connection", (ws, req) => {
      this.ingestHandler.handleConnection(ws, req);
    });

    this.bridgeWss.on("connection", (ws, req) => {
      this.bridgeHandler.handleConnection(ws, req);
    });
  }

  /**
   * Handle an HTTP upgrade request by routing to the correct WSS.
   * Attach this to the HTTP server's 'upgrade' event.
   */
  handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer): void {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const pathname = url.pathname;

    if (pathname === INGEST_PATH) {
      this.ingestWss.handleUpgrade(req, socket, head, (ws) => {
        this.ingestWss.emit("connection", ws, req);
      });
    } else if (pathname === BRIDGE_PATH) {
      this.bridgeWss.handleUpgrade(req, socket, head, (ws) => {
        this.bridgeWss.emit("connection", ws, req);
      });
    } else {
      logger.warn("ws", "Rejected upgrade for unknown path", { pathname });
      socket.destroy();
    }
  }

  /** Close both WebSocket servers */
  close(): void {
    this.ingestWss.close();
    this.bridgeWss.close();
  }
}
