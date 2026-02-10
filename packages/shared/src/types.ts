/** Names of the three MCP officer characters */
export type OfficerName = "glass" | "fizban" | "jasper";

/** All character names including captain and HR */
export type CharacterName = OfficerName | "calvin" | "dorte";

/** Division colors for uniforms */
export type DivisionColor = "gold" | "blue" | "red-orange" | "gray";

/** Officer role on the bridge */
export type OfficerRole = "comms" | "science" | "ops";

/** Configuration for each officer */
export interface OfficerConfig {
  name: OfficerName;
  displayName: string;
  role: OfficerRole;
  division: DivisionColor;
  mcpPrefixes: string[];
  /** Station position on the bridge grid */
  stationPosition: Point;
  /** Idle position when not at station */
  idlePosition: Point;
}

/** 2D point on the bridge grid */
export interface Point {
  x: number;
  y: number;
}

/** Officer behavioral states */
export enum OfficerState {
  /** At idle position, doing nothing */
  IDLE = "idle",
  /** Walking toward their station */
  WALKING_TO_STATION = "walking_to_station",
  /** Working at their station (animation) */
  WORKING = "working",
  /** Walking toward the captain to report */
  WALKING_TO_CAPTAIN = "walking_to_captain",
  /** Reporting to the captain */
  REPORTING = "reporting",
  /** Walking back to idle position */
  WALKING_TO_IDLE = "walking_to_idle",
  /** Wandering around (captain absent) */
  WANDERING = "wandering",
  /** Gossiping with another officer (captain absent) */
  GOSSIPING = "gossiping",
  /** Scattering when Dorte arrives */
  SCATTERING = "scattering",
}

/** Captain Calvin behavioral states */
export enum CalvinState {
  /** Not on the bridge */
  OFF_BRIDGE = "off_bridge",
  /** Walking from door to captain chair */
  ENTERING = "entering",
  /** Seated in captain chair */
  SEATED = "seated",
  /** Turning to listen to a reporting officer */
  LISTENING = "listening",
  /** Walking from chair to door */
  LEAVING = "leaving",
}

/** HR Dorte behavioral states */
export enum DorteState {
  /** Not on the bridge */
  OFF_BRIDGE = "off_bridge",
  /** Walking from door to center */
  ENTERING = "entering",
  /** Delivering a scolding */
  SCOLDING = "scolding",
  /** Walking back to door */
  LEAVING = "leaving",
}

/** Bridge lighting atmosphere */
export enum BridgeAtmosphere {
  /** Laptop not connected — slightly dimmed but still visible */
  OFFLINE = "offline",
  /** Laptop connected, Claude idle */
  STANDBY = "standby",
  /** Claude actively using MCP tools */
  ACTIVE = "active",
}

/** Overall bridge status from server */
export interface BridgeStatus {
  laptopConnected: boolean;
  claudeActive: boolean;
  lastHeartbeat: number | null;
  lastEvent: number | null;
}

/** A space pun exchange */
export interface PunExchange {
  setup: string;
  punchline: string;
}

/** A gossip exchange between officers */
export interface GossipExchange {
  speaker: OfficerName;
  listener: OfficerName;
  lines: string[];
}

/** Dorte scolding sequence */
export interface Scolding {
  entrance: string;
  scold: string;
  exit: string;
}

/** Render state for a character on the canvas */
export interface CharacterRenderState {
  name: CharacterName;
  position: Point;
  targetPosition: Point | null;
  direction: Direction;
  animFrame: number;
  visible: boolean;
  speechBubble: string | null;
  speechBubbleTimer: number;
}

/** Cardinal directions for sprite facing */
export type Direction = "up" | "down" | "left" | "right";
