import type { BridgeStatus, StatusMessage, McpEventMessage } from "@uss-claude/shared";
import { TIMING } from "@uss-claude/shared";
import { logger } from "./logger.js";

/**
 * Tracks bridge state (laptop connectivity, Claude activity)
 * and broadcasts StatusMessage to bridge clients on state changes.
 */
export class StateTracker {
  private laptopConnected = false;
  private claudeActive = false;
  private lastHeartbeat: number | null = null;
  private lastEvent: number | null = null;

  private heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  private broadcastFn: ((msg: StatusMessage) => void) | null = null;

  /** Register the broadcast function for sending status to bridge clients */
  onBroadcast(fn: (msg: StatusMessage) => void): void {
    this.broadcastFn = fn;
  }

  /** Get current bridge status snapshot */
  getStatus(): BridgeStatus {
    return {
      laptopConnected: this.laptopConnected,
      claudeActive: this.claudeActive,
      lastHeartbeat: this.lastHeartbeat,
      lastEvent: this.lastEvent,
    };
  }

  /** Called when ingest client connects */
  onIngestConnect(): void {
    logger.info("state", "Ingest client connected");
    this.laptopConnected = true;
    this.lastHeartbeat = Date.now();
    this.resetHeartbeatTimer();
    this.broadcastStatus();
  }

  /** Called when ingest client disconnects */
  onIngestDisconnect(): void {
    logger.info("state", "Ingest client disconnected");
    this.laptopConnected = false;
    this.claudeActive = false;
    this.clearTimers();
    this.broadcastStatus();
  }

  /** Called when a heartbeat is received from ingest */
  onHeartbeat(): void {
    this.lastHeartbeat = Date.now();
    if (!this.laptopConnected) {
      this.laptopConnected = true;
      this.broadcastStatus();
    }
    this.resetHeartbeatTimer();
  }

  /** Called when an MCP event is received from ingest */
  onMcpEvent(msg: McpEventMessage): void {
    const now = Date.now();
    this.lastEvent = now;
    this.lastHeartbeat = now;
    this.resetHeartbeatTimer();

    if (!this.claudeActive) {
      this.claudeActive = true;
      this.broadcastStatus();
    }
    this.resetIdleTimer();
  }

  /** Called when a system_idle message is received */
  onSystemIdle(): void {
    if (this.claudeActive) {
      this.claudeActive = false;
      logger.info("state", "Claude went idle (system_idle message)");
      this.broadcastStatus();
    }
    this.clearIdleTimer();
  }

  /** Called when a disconnect message is received (graceful shutdown) */
  onDisconnectMessage(): void {
    logger.info("state", "Received graceful disconnect from ingest");
    this.laptopConnected = false;
    this.claudeActive = false;
    this.clearTimers();
    this.broadcastStatus();
  }

  private resetHeartbeatTimer(): void {
    if (this.heartbeatTimer) clearTimeout(this.heartbeatTimer);
    this.heartbeatTimer = setTimeout(() => {
      if (this.laptopConnected) {
        logger.warn("state", "Heartbeat timeout, marking laptop offline");
        this.laptopConnected = false;
        this.claudeActive = false;
        this.clearIdleTimer();
        this.broadcastStatus();
      }
    }, TIMING.HEARTBEAT_TIMEOUT);
  }

  private resetIdleTimer(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      if (this.claudeActive) {
        logger.info("state", "Claude idle timeout, marking inactive");
        this.claudeActive = false;
        this.broadcastStatus();
      }
    }, TIMING.IDLE_TIMEOUT);
  }

  private clearIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  private clearTimers(): void {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.clearIdleTimer();
  }

  private broadcastStatus(): void {
    const msg: StatusMessage = {
      type: "status",
      status: this.getStatus(),
      timestamp: Date.now(),
    };
    logger.info("state", "Broadcasting status", { status: msg.status });
    this.broadcastFn?.(msg);
  }

  /** Clean up timers */
  destroy(): void {
    this.clearTimers();
  }
}
