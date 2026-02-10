import WebSocket from "ws";
import {
  RECONNECT,
  TIMING,
  type IngestMessage,
} from "@uss-claude/shared";
import { EventBuffer } from "./event-buffer.js";
import type { BridgeConfig } from "./config.js";

/**
 * WebSocket client with exponential backoff reconnection,
 * heartbeat keepalive, and offline event buffering.
 */
export class WsClient {
  private ws: WebSocket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay: number = RECONNECT.INITIAL_DELAY;
  private buffer = new EventBuffer();
  private closing = false;

  constructor(private readonly config: BridgeConfig) {}

  /** Whether the WebSocket is currently open and ready. */
  get connected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /** Establish the WebSocket connection. */
  connect(): void {
    this.closing = false;
    this.doConnect();
  }

  /** Send a message, buffering it if the socket is not connected. */
  send(msg: IngestMessage): void {
    if (this.connected) {
      this.ws!.send(JSON.stringify(msg));
    } else {
      this.buffer.push(msg);
    }
  }

  /** Gracefully disconnect — send disconnect message and close. */
  async disconnect(): Promise<void> {
    this.closing = true;
    this.stopHeartbeat();
    this.clearReconnect();

    if (this.connected) {
      const msg: IngestMessage = {
        type: "disconnect",
        timestamp: Date.now(),
      };
      this.ws!.send(JSON.stringify(msg));
      // Give the server a moment to receive it
      await new Promise<void>((resolve) => {
        this.ws!.once("close", resolve);
        this.ws!.close(1000, "daemon stopping");
        setTimeout(resolve, 500);
      });
    }

    this.ws = null;
  }

  // --- Internal ---

  private doConnect(): void {
    const url = `${this.config.serverUrl}/ws/ingest?token=${encodeURIComponent(this.config.token)}`;

    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      console.log("[ws] connected");
      this.reconnectDelay = RECONNECT.INITIAL_DELAY;
      this.startHeartbeat();
      this.flushBuffer();
    });

    this.ws.on("close", (_code, _reason) => {
      console.log("[ws] disconnected");
      this.stopHeartbeat();
      if (!this.closing) {
        this.scheduleReconnect();
      }
    });

    this.ws.on("error", (err) => {
      console.error(`[ws] error: ${err.message}`);
      // The 'close' event will fire after this, triggering reconnect
    });
  }

  private flushBuffer(): void {
    const events = this.buffer.flush();
    for (const msg of events) {
      this.ws!.send(JSON.stringify(msg));
    }
    if (events.length > 0) {
      console.log(`[ws] flushed ${events.length} buffered events`);
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.connected) {
        const msg: IngestMessage = {
          type: "heartbeat",
          timestamp: Date.now(),
        };
        this.ws!.send(JSON.stringify(msg));
      }
    }, TIMING.HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    this.clearReconnect();
    console.log(`[ws] reconnecting in ${this.reconnectDelay}ms`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectDelay = Math.min(
        this.reconnectDelay * RECONNECT.MULTIPLIER,
        RECONNECT.MAX_DELAY,
      );
      this.doConnect();
    }, this.reconnectDelay);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
