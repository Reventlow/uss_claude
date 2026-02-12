import {
  OfficerState,
  CalvinState,
  DiscoState,
  DorteState,
  BridgeAtmosphere,
  type OfficerName,
  type BridgeStatus,
  type McpEventMessage,
  type StatusMessage,
  type TrackEventMessage,
  type DiscoEventMessage,
  type CharacterRenderState,
  POSITIONS,
  CAPTAIN_PING,
  TIMING,
  GRID,
  DISCO_LINES,
  getOfficerNames,
  getOfficer,
  getRandomReport,
} from "@uss-claude/shared";
import {
  type OfficerFSM,
  createOfficerFSM,
  tickOfficer,
  directionTo,
  moveToward,
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
  triggerCameo,
  isCameoActive,
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
  /** Currently playing Spotify track (null if nothing playing) */
  currentTrack: { artist: string; title: string; lofi?: boolean } | null;
  /** Disco mode state */
  disco: {
    state: DiscoState;
    timer: number;
    song: { artist: string; title: string } | null;
    bubbleTimer: number;
    /** Saved officer positions+states and Calvin state to restore after disco */
    savedStates: Map<string, { position: { x: number; y: number }; state: string }> | null;
  };
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
  | { type: "DEBUG_DISCONNECT_LAPTOP" }
  | { type: "DEBUG_TRIGGER_CAMEO" }
  | { type: "TRACK_EVENT"; payload: TrackEventMessage }
  | { type: "DEBUG_TRACK_PLAY" }
  | { type: "DEBUG_TRACK_STOP" }
  | { type: "DISCO_EVENT"; payload: DiscoEventMessage }
  | { type: "DEBUG_DISCO" };

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
    currentTrack: null,
    disco: {
      state: DiscoState.INACTIVE,
      timer: 0,
      song: null,
      bubbleTimer: 0,
      savedStates: null,
    },
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
      const prevLaptop = next.bridgeStatus.laptopConnected;
      next.bridgeStatus = action.payload.status;
      next.atmosphere = computeAtmosphere(next.connected, action.payload.status);

      // Calvin's presence tracks laptop connectivity
      if (action.payload.status.laptopConnected && !prevLaptop) {
        // Laptop just connected — captain enters
        if (next.calvin.state === CalvinState.OFF_BRIDGE) {
          calvinEnter(next.calvin);
          setCaptainPresence(next.idleBehavior, true);
          addLogEntry(next, "Captain Calvin has entered the bridge.");

          for (const [, officer] of next.officers) {
            if (
              officer.state === OfficerState.WANDERING ||
              officer.state === OfficerState.GOSSIPING
            ) {
              officer.state = OfficerState.WALKING_TO_IDLE;
            }
          }
        }
      } else if (!action.payload.status.laptopConnected && prevLaptop) {
        // Laptop disconnected — captain leaves
        if (
          next.calvin.state !== CalvinState.OFF_BRIDGE &&
          next.calvin.state !== CalvinState.LEAVING
        ) {
          calvinLeave(next.calvin);
          setCaptainPresence(next.idleBehavior, false);
          addLogEntry(next, "Captain Calvin has left the bridge.");

          for (const [, officer] of next.officers) {
            if (officer.state === OfficerState.IDLE) {
              officer.state = OfficerState.WANDERING;
            }
          }
        }
      }
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

      // Captain enters on successful pong only if laptop is actually connected
      if (next.calvin.state === CalvinState.OFF_BRIDGE && next.bridgeStatus.laptopConnected) {
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
      // Don't interrupt an active cameo scene
      if (isCameoActive(next.idleBehavior)) break;

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
          officerFsm.stuckTimer = 0;
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
          officerFsm.stuckTimer = 0;
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
      const discoActive = next.disco.state !== DiscoState.INACTIVE;

      // During disco, skip normal officer/Calvin/idle ticks — disco tick handles everything
      if (!discoActive) {
        const captainPresent =
          next.calvin.state === CalvinState.SEATED ||
          next.calvin.state === CalvinState.LISTENING ||
          next.calvin.state === CalvinState.ENTERING;

        // Tick all officers
        for (const [name, officer] of next.officers) {
          const config = getOfficer(name);
          const prevState = officer.state;

          tickOfficer(
            officer,
            action.deltaMs,
            captainPresent,
            config.stationPosition,
            config.idlePosition,
          );

          // Spoty override: transition to DANCING instead of WORKING when reaching station
          if (name === "spoty" && prevState === OfficerState.WALKING_TO_STATION && officer.state === OfficerState.WORKING) {
            officer.state = OfficerState.DANCING;
            officer.danceTimer = 0;
            officer.render.animFrame = 0;
            officer.render.direction = "up";
          }

          // Spoty recovery: if idle but track is playing, re-dispatch to station
          if (name === "spoty" && officer.state === OfficerState.IDLE && next.currentTrack !== null) {
            officer.state = OfficerState.WALKING_TO_STATION;
            officer.stuckTimer = 0;
          }

          // Auto-recover stuck officers (no "done" event received)
          // Skip stuck timeout for DANCING officers (they stay until track stops)
          if (
            officer.state !== OfficerState.DANCING &&
            officer.stuckTimer >= TIMING.STUCK_TIMEOUT &&
            (officer.state === OfficerState.WALKING_TO_STATION ||
             officer.state === OfficerState.WORKING)
          ) {
            officer.stuckTimer = 0;
            officer.pendingDone = false;
            officer.state = OfficerState.WALKING_TO_IDLE;
            addLogEntry(next, `${config.displayName} returning to post — no response received.`);
          }

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
      }

      // Tick disco mode
      if (next.disco.state !== DiscoState.INACTIVE) {
        next.disco.timer -= action.deltaMs;

        // Tick speech bubble timers (normally handled by tickOfficer/tickCalvin/tickDorte)
        for (const [, officer] of next.officers) {
          if (officer.render.speechBubbleTimer > 0) {
            officer.render.speechBubbleTimer -= action.deltaMs;
            if (officer.render.speechBubbleTimer <= 0) {
              officer.render.speechBubble = null;
              officer.render.speechBubbleTimer = 0;
            }
          }
        }
        if (next.calvin.render.speechBubbleTimer > 0) {
          next.calvin.render.speechBubbleTimer -= action.deltaMs;
          if (next.calvin.render.speechBubbleTimer <= 0) {
            next.calvin.render.speechBubble = null;
            next.calvin.render.speechBubbleTimer = 0;
          }
        }
        if (next.idleBehavior.dorte.render.speechBubbleTimer > 0) {
          next.idleBehavior.dorte.render.speechBubbleTimer -= action.deltaMs;
          if (next.idleBehavior.dorte.render.speechBubbleTimer <= 0) {
            next.idleBehavior.dorte.render.speechBubble = null;
            next.idleBehavior.dorte.render.speechBubbleTimer = 0;
          }
        }

        switch (next.disco.state) {
          case DiscoState.DROPPING_BALL: {
            // Move all characters toward dance spots
            const spots = POSITIONS.DISCO_SPOTS;
            const officerNames = [...next.officers.keys()];
            for (let i = 0; i < officerNames.length; i++) {
              const officer = next.officers.get(officerNames[i])!;
              const spot = spots[i % spots.length];
              officer.render.targetPosition = spot;
              const dir = directionTo(officer.render.position, spot);
              officer.render.direction = dir;
              moveToward(officer.render.position, spot, GRID.WALK_SPEED, action.deltaMs / 1000);
              officer.render.animFrame = (officer.render.animFrame + (action.deltaMs > 100 ? 1 : 0)) % 3;
            }
            // Calvin walks to dance spot
            {
              const calvinSpot = spots[4] ?? spots[0];
              const dir = directionTo(next.calvin.render.position, calvinSpot);
              next.calvin.render.direction = dir;
              moveToward(next.calvin.render.position, calvinSpot, GRID.WALK_SPEED, action.deltaMs / 1000);
              next.calvin.render.animFrame = (next.calvin.render.animFrame + (action.deltaMs > 100 ? 1 : 0)) % 3;
            }

            // Dorte walks to dance spot
            {
              const dorte = next.idleBehavior.dorte;
              const dorteSpot = spots[5] ?? spots[0];
              dorte.render.visible = true;
              const dir = directionTo(dorte.render.position, dorteSpot);
              dorte.render.direction = dir;
              moveToward(dorte.render.position, dorteSpot, GRID.WALK_SPEED, action.deltaMs / 1000);
              dorte.render.animFrame = (dorte.render.animFrame + (action.deltaMs > 100 ? 1 : 0)) % 3;
            }

            if (next.disco.timer <= 0) {
              // Transition to dancing
              next.disco.state = DiscoState.DANCING;
              next.disco.timer = TIMING.DISCO_DANCE_DURATION;
              // Set all officers to DANCING
              for (const [, officer] of next.officers) {
                officer.state = OfficerState.DANCING;
                officer.danceTimer = 0;
                officer.render.animFrame = 0;
              }
              addLogEntry(next, "All hands: DANCE!");
            }
            break;
          }

          case DiscoState.DANCING: {
            // Cycle dance frames for all officers
            for (const [, officer] of next.officers) {
              officer.danceTimer += action.deltaMs;
              if (officer.danceTimer >= TIMING.DANCE_FRAME_INTERVAL) {
                officer.danceTimer -= TIMING.DANCE_FRAME_INTERVAL;
                officer.render.animFrame = (officer.render.animFrame + 1) % 4;
              }
            }
            // Calvin dance animation
            next.calvin.timer = (next.calvin.timer ?? 0) + action.deltaMs;
            if (next.calvin.timer >= TIMING.DANCE_FRAME_INTERVAL) {
              next.calvin.timer -= TIMING.DANCE_FRAME_INTERVAL;
              next.calvin.render.animFrame = (next.calvin.render.animFrame + 1) % 4;
            }

            // Dorte dance animation
            {
              const dorte = next.idleBehavior.dorte;
              dorte.timer = (dorte.timer ?? 0) + action.deltaMs;
              if (dorte.timer >= TIMING.DANCE_FRAME_INTERVAL) {
                dorte.timer -= TIMING.DANCE_FRAME_INTERVAL;
                dorte.render.animFrame = (dorte.render.animFrame + 1) % 4;
              }
            }

            // Disco speech bubbles
            next.disco.bubbleTimer -= action.deltaMs;
            if (next.disco.bubbleTimer <= 0) {
              next.disco.bubbleTimer = TIMING.DISCO_BUBBLE_INTERVAL;
              // Pick a random character (officers, Calvin, or Dorte)
              const allRenders: CharacterRenderState[] = [
                ...[...next.officers.values()].map((o) => o.render),
                next.calvin.render,
                next.idleBehavior.dorte.render,
              ];
              const randomRender = allRenders[Math.floor(Math.random() * allRenders.length)];
              if (randomRender) {
                const line = DISCO_LINES[Math.floor(Math.random() * DISCO_LINES.length)];
                randomRender.speechBubble = line;
                randomRender.speechBubbleTimer = TIMING.SPEECH_BUBBLE_DURATION;
              }
            }

            if (next.disco.timer <= 0) {
              next.disco.state = DiscoState.RAISING_BALL;
              next.disco.timer = TIMING.DISCO_BALL_RAISE_DURATION;
            }
            break;
          }

          case DiscoState.RAISING_BALL: {
            if (next.disco.timer <= 0) {
              // Officers walk back to their idle positions (don't teleport)
              for (const [name, officer] of next.officers) {
                officer.danceTimer = 0;
                officer.render.animFrame = 0;
                officer.render.speechBubble = null;
                officer.render.speechBubbleTimer = 0;
                // If Spoty was dancing at station and music is still playing, go back to station
                if (name === "spoty" && next.currentTrack !== null) {
                  officer.state = OfficerState.WALKING_TO_STATION;
                  officer.stuckTimer = 0;
                } else {
                  officer.state = OfficerState.WALKING_TO_IDLE;
                }
              }

              // Calvin walks back to chair
              const calvinSaved = next.disco.savedStates?.get("calvin");
              if (calvinSaved && calvinSaved.state !== CalvinState.OFF_BRIDGE) {
                calvinEnter(next.calvin);
              } else {
                next.calvin.render.animFrame = 0;
              }

              // Dorte leaves
              next.idleBehavior.dorte.state = DorteState.LEAVING;
              next.idleBehavior.dorte.render.speechBubble = null;
              next.idleBehavior.dorte.render.speechBubbleTimer = 0;

              // Reset disco state
              next.disco = {
                state: DiscoState.INACTIVE,
                timer: 0,
                song: null,
                bubbleTimer: 0,
                savedStates: null,
              };

              addLogEntry(next, "Disco protocol complete. Resuming normal operations.");
            }
            break;
          }
        }
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

    case "DEBUG_TRIGGER_CAMEO":
      if (!isCameoActive(next.idleBehavior)) {
        triggerCameo(next.idleBehavior, next.officers);
        addLogEntry(next, "[DEBUG] Cameo event triggered.");
      }
      break;

    case "TRACK_EVENT": {
      const spotyFsm = next.officers.get("spoty");
      if (!spotyFsm) break;

      if (action.payload.action === "playing" || action.payload.action === "changed") {
        // Preserve existing lofi flag if this is an update without it
        const prevLofi = next.currentTrack?.lofi;
        next.currentTrack = {
          artist: action.payload.artist ?? "Unknown",
          title: action.payload.title ?? "Unknown",
          lofi: action.payload.lofi ?? prevLofi,
        };
        // Spoty walks to station if not already there/dancing
        if (
          spotyFsm.state === OfficerState.IDLE ||
          spotyFsm.state === OfficerState.WANDERING ||
          spotyFsm.state === OfficerState.GOSSIPING ||
          spotyFsm.state === OfficerState.WALKING_TO_IDLE
        ) {
          spotyFsm.state = OfficerState.WALKING_TO_STATION;
          spotyFsm.stuckTimer = 0;
        }
        addLogEntry(next, `SPOTY: Now playing — ${next.currentTrack.artist} - ${next.currentTrack.title}`);
      } else if (action.payload.action === "stopped") {
        next.currentTrack = null;
        // Spoty walks back to idle
        if (
          spotyFsm.state === OfficerState.DANCING ||
          spotyFsm.state === OfficerState.WORKING ||
          spotyFsm.state === OfficerState.WALKING_TO_STATION
        ) {
          spotyFsm.state = OfficerState.WALKING_TO_IDLE;
          spotyFsm.danceTimer = 0;
        }
        addLogEntry(next, "SPOTY: Playback stopped.");
      }
      break;
    }

    case "DEBUG_TRACK_PLAY": {
      const debugTrack: TrackEventMessage = {
        type: "track_event",
        action: "playing",
        artist: "Daft Punk",
        title: "Around The World",
        timestamp: Date.now(),
      };
      return bridgeReducer(next, { type: "TRACK_EVENT", payload: debugTrack });
    }

    case "DEBUG_TRACK_STOP": {
      const debugStop: TrackEventMessage = {
        type: "track_event",
        action: "stopped",
        timestamp: Date.now(),
      };
      return bridgeReducer(next, { type: "TRACK_EVENT", payload: debugStop });
    }

    case "DISCO_EVENT": {
      if (action.payload.action === "start" && next.disco.state === DiscoState.INACTIVE) {
        // Save current states for all characters
        const saved = new Map<string, { position: { x: number; y: number }; state: string }>();
        for (const [name, officer] of next.officers) {
          saved.set(name, {
            position: { ...officer.render.position },
            state: officer.state,
          });
        }
        saved.set("calvin", {
          position: { ...next.calvin.render.position },
          state: next.calvin.state,
        });

        next.disco = {
          state: DiscoState.DROPPING_BALL,
          timer: TIMING.DISCO_BALL_DROP_DURATION,
          song: action.payload.artist && action.payload.title
            ? { artist: action.payload.artist, title: action.payload.title }
            : next.currentTrack,
          bubbleTimer: TIMING.DISCO_BUBBLE_INTERVAL,
          savedStates: saved,
        };

        // Make Dorte visible and walk to dance position
        next.idleBehavior.dorte.render.visible = true;
        next.idleBehavior.dorte.render.position = { ...POSITIONS.ENTRANCE };
        next.idleBehavior.dorte.state = DorteState.ENTERING;

        addLogEntry(next, "ALERT: Chart-topping hit detected! Initiating disco protocol!");
      } else if (action.payload.action === "stop" && next.disco.state !== DiscoState.INACTIVE) {
        // Force to raising ball phase
        if (next.disco.state === DiscoState.DANCING) {
          next.disco.state = DiscoState.RAISING_BALL;
          next.disco.timer = TIMING.DISCO_BALL_RAISE_DURATION;
        }
      }
      break;
    }

    case "DEBUG_DISCO": {
      if (next.disco.state === DiscoState.INACTIVE) {
        const fakeEvent: DiscoEventMessage = {
          type: "disco_event",
          action: "start",
          artist: "Bee Gees",
          title: "Stayin' Alive",
          timestamp: Date.now(),
        };
        return bridgeReducer(next, { type: "DISCO_EVENT", payload: fakeEvent });
      }
      break;
    }
  }

  return next;
}
