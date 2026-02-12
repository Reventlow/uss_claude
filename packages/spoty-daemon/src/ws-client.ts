import WebSocket from "ws";
import { RECONNECT } from "@uss-claude/shared";
import type { TrackEventMessage } from "@uss-claude/shared";
import type { SpotyConfig } from "./config.js";

/**
 * WebSocket client for the spoty-daemon.
 * Connects to the bridge server ingest endpoint with ?client=spoty-daemon.
 * Sends TrackEventMessages only (no heartbeats needed — track events
 * are orthogonal to Claude active/idle state).
 */
export class WsClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay: number = RECONNECT.INITIAL_DELAY;
  private closing = false;
  private pendingMessages: TrackEventMessage[] = [];

  constructor(private readonly config: SpotyConfig) {}

  get connected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  connect(): void {
    this.closing = false;
    this.doConnect();
  }

  send(msg: TrackEventMessage): void {
    if (this.connected) {
      this.ws!.send(JSON.stringify(msg));
    } else {
      // Buffer a small number of messages when offline
      if (this.pendingMessages.length < 10) {
        this.pendingMessages.push(msg);
      }
    }
  }

  async disconnect(): Promise<void> {
    this.closing = true;
    this.clearReconnect();

    if (this.connected) {
      await new Promise<void>((resolve) => {
        this.ws!.once("close", resolve);
        this.ws!.close(1000, "spoty-daemon stopping");
        setTimeout(resolve, 500);
      });
    }

    this.ws = null;
  }

  private doConnect(): void {
    const url = `${this.config.serverUrl}/ws/ingest?token=${encodeURIComponent(this.config.token)}&client=spoty-daemon`;

    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      console.log("[ws] connected to bridge server");
      this.reconnectDelay = RECONNECT.INITIAL_DELAY;
      this.flushPending();
    });

    this.ws.on("close", (_code, _reason) => {
      console.log("[ws] disconnected");
      if (!this.closing) {
        this.scheduleReconnect();
      }
    });

    this.ws.on("error", (err) => {
      console.error(`[ws] error: ${err.message}`);
    });
  }

  private flushPending(): void {
    const msgs = this.pendingMessages;
    this.pendingMessages = [];
    for (const msg of msgs) {
      this.ws!.send(JSON.stringify(msg));
    }
    if (msgs.length > 0) {
      console.log(`[ws] flushed ${msgs.length} buffered events`);
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
