import {
  OfficerState,
  CalvinState,
  BridgeAtmosphere,
  type OfficerName,
  type BridgeStatus,
  type McpEventMessage,
  type StatusMessage,
  POSITIONS,
  CAPTAIN_PING,
  getOfficerNames,
  getOfficer,
  getRandomReport,
} from "@uss-claude/shared";
import {
  type OfficerFSM,
  createOfficerFSM,
  tickOfficer,
} from "./officer-state-machine.js";
import {
  type CalvinFSM,
  createCalvinFSM,
  tickCalvin,
  calvinEnter,
  calvinLeave,
  calvinListen,
} from "./calvin-state-machine.js";
import {
  type IdleBehaviorState,
  createIdleBehaviorState,
  tickIdleBehavior,
  setCaptainPresence,
} from "./idle-behavior-manager.js";

/** A log entry in the comms log */
export interface CommsLogEntry {
  id: number;
  timestamp: number;
  message: string;
}

/** Full bridge state */
export interface BridgeState {
  connected: boolean;
  atmosphere: BridgeAtmosphere;
  bridgeStatus: BridgeStatus;
  officers: Map<OfficerName, OfficerFSM>;
  calvin: CalvinFSM;
  idleBehavior: IdleBehaviorState;
  commsLog: CommsLogEntry[];
  logIdCounter: number;
  /** Consecutive pings sent without a pong response */
  missedPings: number;
  /** Whether we're waiting for a pong (ping sent but no pong yet) */
  awaitingPong: boolean;
}

/** All actions the reducer handles */
export type BridgeAction =
  | { type: "WS_CONNECTED" }
  | { type: "WS_DISCONNECTED" }
  | { type: "STATUS_UPDATE"; payload: StatusMessage }
  | { type: "MCP_EVENT"; payload: McpEventMessage }
  | { type: "TICK"; deltaMs: number }
  | { type: "IDLE_EVENT"; message: string }
  | { type: "PING_SENT" }
  | { type: "PONG_RECEIVED" }
  | { type: "DEBUG_OFFICER_START"; officer: OfficerName }
  | { type: "DEBUG_OFFICER_DONE"; officer: OfficerName }
  | { type: "DEBUG_CONNECT_LAPTOP" }
  | { type: "DEBUG_DISCONNECT_LAPTOP" };

/** Create initial bridge state */
export function createInitialState(): BridgeState {
  const officers = new Map<OfficerName, OfficerFSM>();
  for (const name of getOfficerNames()) {
    const config = getOfficer(name);
    officers.set(name, createOfficerFSM(name, config.idlePosition));
  }

  return {
    connected: false,
    atmosphere: BridgeAtmosphere.OFFLINE,
    bridgeStatus: {
      laptopConnected: false,
      claudeActive: false,
      lastHeartbeat: null,
      lastEvent: null,
    },
    officers,
    calvin: createCalvinFSM(),
    idleBehavior: createIdleBehaviorState(),
    commsLog: [],
    logIdCounter: 0,
    missedPings: 0,
    awaitingPong: false,
  };
}

const MAX_LOG_ENTRIES = 20;

function addLogEntry(state: BridgeState, message: string): void {
  state.logIdCounter++;
  state.commsLog.unshift({
    id: state.logIdCounter,
    timestamp: Date.now(),
    message,
  });
  if (state.commsLog.length > MAX_LOG_ENTRIES) {
    state.commsLog.length = MAX_LOG_ENTRIES;
  }
}

function computeAtmosphere(connected: boolean, status: BridgeStatus): BridgeAtmosphere {
  if (!connected) return BridgeAtmosphere.OFFLINE;
  if (status.claudeActive) return BridgeAtmosphere.ACTIVE;
  return BridgeAtmosphere.STANDBY;
}

/** Bridge state reducer — all state transitions happen here */
export function bridgeReducer(state: BridgeState, action: BridgeAction): BridgeState {
  // We mutate and return the same object for performance (canvas rendering needs to be fast).
  // React will still re-render because we return a new reference from the dispatch wrapper.
  const next = { ...state };
  next.officers = new Map(state.officers);
  next.commsLog = [...state.commsLog];

  switch (action.type) {
    case "WS_CONNECTED":
      next.connected = true;
      addLogEntry(next, "Bridge connection established.");
      break;

    case "WS_DISCONNECTED":
      next.connected = false;
      next.atmosphere = BridgeAtmosphere.OFFLINE;
      addLogEntry(next, "Bridge connection lost.");
      break;

    case "STATUS_UPDATE": {
      next.bridgeStatus = action.payload.status;
      next.atmosphere = computeAtmosphere(next.connected, action.payload.status);
      break;
    }

    case "PING_SENT": {
      if (next.awaitingPong) {
        // Previous ping had no pong — count as a miss
        next.missedPings++;
        if (next.missedPings >= CAPTAIN_PING.MISS_THRESHOLD) {
          // Captain leaves after 2 consecutive misses
          if (
            next.calvin.state !== CalvinState.OFF_BRIDGE &&
            next.calvin.state !== CalvinState.LEAVING
          ) {
            calvinLeave(next.calvin);
            setCaptainPresence(next.idleBehavior, false);
            addLogEntry(next, "Captain Calvin has left the bridge.");

            // Officers start wandering when captain leaves
            for (const [, officer] of next.officers) {
              if (officer.state === OfficerState.IDLE) {
                officer.state = OfficerState.WANDERING;
              }
            }
          }
        }
      }
      next.awaitingPong = true;
      break;
    }

    case "PONG_RECEIVED": {
      next.awaitingPong = false;
      next.missedPings = 0;

      // Captain enters on successful pong (if not already on bridge)
      if (next.calvin.state === CalvinState.OFF_BRIDGE) {
        calvinEnter(next.calvin);
        setCaptainPresence(next.idleBehavior, true);
        addLogEntry(next, "Captain Calvin has entered the bridge.");

        // Officers go to idle when captain arrives
        for (const [, officer] of next.officers) {
          if (
            officer.state === OfficerState.WANDERING ||
            officer.state === OfficerState.GOSSIPING
          ) {
            officer.state = OfficerState.WALKING_TO_IDLE;
          }
        }
      }
      break;
    }

    case "MCP_EVENT": {
      const { officer: name, action: mcpAction } = action.payload;
      const officerFsm = next.officers.get(name);
      if (!officerFsm) break;
      const config = getOfficer(name);

      if (mcpAction === "start") {
        // Officer starts working: walk to station
        if (
          officerFsm.state === OfficerState.IDLE ||
          officerFsm.state === OfficerState.WANDERING ||
          officerFsm.state === OfficerState.GOSSIPING
        ) {
          officerFsm.state = OfficerState.WALKING_TO_STATION;
          addLogEntry(next, `${config.displayName} proceeding to ${config.role} station.`);
        }
      } else if (mcpAction === "done") {
        // Captain is "on bridge" if seated, listening, or still walking to chair
        const captainOnBridge =
          next.calvin.state === CalvinState.SEATED ||
          next.calvin.state === CalvinState.LISTENING ||
          next.calvin.state === CalvinState.ENTERING;

        if (officerFsm.state === OfficerState.WORKING) {
          // Already working — transition to report/idle immediately
          if (captainOnBridge) {
            officerFsm.state = OfficerState.WALKING_TO_CAPTAIN;
            const report = getRandomReport(name);
            officerFsm.pendingReport = report;
            addLogEntry(next, `${config.displayName}: "${report}"`);
          } else {
            officerFsm.state = OfficerState.WALKING_TO_IDLE;
            addLogEntry(next, `${config.displayName} task complete.`);
          }
        } else if (officerFsm.state === OfficerState.WALKING_TO_STATION) {
          // Still walking — queue the done so it triggers when officer arrives
          officerFsm.pendingDone = true;
          const report = getRandomReport(name);
          officerFsm.pendingReport = report;
          addLogEntry(next, `${config.displayName}: "${report}"`);
        }
      }
      break;
    }

    case "TICK": {
      const captainPresent =
        next.calvin.state === CalvinState.SEATED ||
        next.calvin.state === CalvinState.LISTENING ||
        next.calvin.state === CalvinState.ENTERING;

      // Tick all officers
      for (const [name, officer] of next.officers) {
        const config = getOfficer(name);
        tickOfficer(
          officer,
          action.deltaMs,
          captainPresent,
          config.stationPosition,
          config.idlePosition,
        );

        // If officer just finished reporting, Calvin listens
        if (
          officer.state === OfficerState.REPORTING &&
          officer.timer === 0
        ) {
          calvinListen(next.calvin);
        }
      }

      // Tick Calvin
      tickCalvin(next.calvin, action.deltaMs);

      // Tick idle behavior
      const idleResult = tickIdleBehavior(
        next.idleBehavior,
        next.officers,
        action.deltaMs,
      );
      for (const msg of idleResult.logMessages) {
        addLogEntry(next, msg);
      }
      break;
    }

    case "IDLE_EVENT":
      addLogEntry(next, action.message);
      break;

    // Debug actions
    case "DEBUG_OFFICER_START": {
      const officerFsm = next.officers.get(action.officer);
      if (officerFsm) {
        officerFsm.state = OfficerState.WALKING_TO_STATION;
        const config = getOfficer(action.officer);
        addLogEntry(next, `[DEBUG] ${config.displayName} dispatched to station.`);
      }
      break;
    }

    case "DEBUG_OFFICER_DONE": {
      const officerFsm = next.officers.get(action.officer);
      if (officerFsm && officerFsm.state === OfficerState.WORKING) {
        officerFsm.timer = 0; // Force immediate completion
        addLogEntry(next, `[DEBUG] ${getOfficer(action.officer).displayName} task forced complete.`);
      }
      break;
    }

    case "DEBUG_CONNECT_LAPTOP":
      next.bridgeStatus = { ...next.bridgeStatus, laptopConnected: true };
      next.atmosphere = computeAtmosphere(next.connected, next.bridgeStatus);
      calvinEnter(next.calvin);
      setCaptainPresence(next.idleBehavior, true);
      addLogEntry(next, "[DEBUG] Laptop connected.");
      break;

    case "DEBUG_DISCONNECT_LAPTOP":
      next.bridgeStatus = { ...next.bridgeStatus, laptopConnected: false };
      next.atmosphere = computeAtmosphere(next.connected, next.bridgeStatus);
      calvinLeave(next.calvin);
      setCaptainPresence(next.idleBehavior, false);
      addLogEntry(next, "[DEBUG] Laptop disconnected.");
      break;
  }

  return next;
}
