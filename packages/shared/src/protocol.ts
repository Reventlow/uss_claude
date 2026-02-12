import type { OfficerName, BridgeStatus } from "./types.js";

/** Actions an officer can perform */
export type McpAction = "start" | "done";

/** System-level actions */
export type SystemAction = "idle";

/** MCP event from a hook invocation */
export interface McpEventMessage {
  type: "mcp_event";
  officer: OfficerName;
  action: McpAction;
  timestamp: number;
}

/** Heartbeat from the CLI daemon */
export interface HeartbeatMessage {
  type: "heartbeat";
  timestamp: number;
}

/** Disconnect notification before closing */
export interface DisconnectMessage {
  type: "disconnect";
  timestamp: number;
}

/** System idle event (Claude stopped) */
export interface SystemIdleMessage {
  type: "system_idle";
  timestamp: number;
}

/** Spotify track event from the spoty-daemon */
export type TrackAction = "playing" | "changed" | "stopped";

export interface TrackEventMessage {
  type: "track_event";
  action: TrackAction;
  artist?: string;
  title?: string;
  timestamp: number;
}

/** Status broadcast from server to bridge clients */
export interface StatusMessage {
  type: "status";
  status: BridgeStatus;
  timestamp: number;
}

/** Ping from bridge UI to server */
export interface BridgePingMessage {
  type: "bridge_ping";
  timestamp: number;
}

/** Pong response from server to bridge UI */
export interface BridgePongMessage {
  type: "bridge_pong";
  timestamp: number;
}

/** All messages from ingest client to server */
export type IngestMessage =
  | McpEventMessage
  | HeartbeatMessage
  | DisconnectMessage
  | SystemIdleMessage
  | TrackEventMessage;

/** All messages from server to bridge clients */
export type BridgeMessage = McpEventMessage | StatusMessage | BridgePongMessage | TrackEventMessage;

/** All wire messages */
export type WireMessage = IngestMessage | BridgeMessage | BridgePingMessage;

// --- Type guards ---

export function isMcpEvent(msg: unknown): msg is McpEventMessage {
  return isObject(msg) && msg.type === "mcp_event";
}

export function isHeartbeat(msg: unknown): msg is HeartbeatMessage {
  return isObject(msg) && msg.type === "heartbeat";
}

export function isDisconnect(msg: unknown): msg is DisconnectMessage {
  return isObject(msg) && msg.type === "disconnect";
}

export function isSystemIdle(msg: unknown): msg is SystemIdleMessage {
  return isObject(msg) && msg.type === "system_idle";
}

export function isTrackEvent(msg: unknown): msg is TrackEventMessage {
  return isObject(msg) && msg.type === "track_event";
}

export function isStatusMessage(msg: unknown): msg is StatusMessage {
  return isObject(msg) && msg.type === "status";
}

export function isIngestMessage(msg: unknown): msg is IngestMessage {
  return isMcpEvent(msg) || isHeartbeat(msg) || isDisconnect(msg) || isSystemIdle(msg) || isTrackEvent(msg);
}

export function isBridgePing(msg: unknown): msg is BridgePingMessage {
  return isObject(msg) && msg.type === "bridge_ping";
}

export function isBridgePong(msg: unknown): msg is BridgePongMessage {
  return isObject(msg) && msg.type === "bridge_pong";
}

export function isBridgeMessage(msg: unknown): msg is BridgeMessage {
  return isMcpEvent(msg) || isStatusMessage(msg) || isBridgePong(msg) || isTrackEvent(msg);
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

/** Safely parse a JSON string into a typed message, or null on failure */
export function parseMessage(raw: string): WireMessage | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isObject(parsed) && typeof parsed.type === "string") {
      return parsed as unknown as WireMessage;
    }
    return null;
  } catch {
    return null;
  }
}
