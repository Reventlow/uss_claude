import {
  OfficerState,
  DorteState,
  CameoState,
  POSITIONS,
  GRID,
  TIMING,
  PUNS,
  GOSSIPS,
  SCOLDINGS,
  CAMEOS,
  type OfficerName,
  type CharacterRenderState,
  type CameoScript,
} from "@uss-claude/shared";
import { directionTo, moveToward } from "./officer-state-machine.js";
import type { OfficerFSM } from "./officer-state-machine.js";

/** Dorte FSM state */
export interface DorteFSM {
  state: DorteState;
  render: CharacterRenderState;
  timer: number;
}

/** Cameo FSM state */
export interface CameoFSM {
  state: CameoState;
  render: CharacterRenderState;
  timer: number;
  activeScript: CameoScript | null;
}

/** Idle behavior manager state */
export interface IdleBehaviorState {
  /** Whether captain is on the bridge */
  captainPresent: boolean;
  /** Time until next idle event */
  nextEventTimer: number;
  /** Gossip count since captain left (for Dorte threshold) */
  gossipCount: number;
  /** Random threshold for Dorte appearance */
  dorteThreshold: number;
  /** Dorte FSM */
  dorte: DorteFSM;
  /** Currently active pun/gossip (null if none) */
  activeExchange: {
    type: "pun" | "gossip";
    step: number;
    timer: number;
  } | null;
  /** Time until next cameo event (countdown when captain present) */
  cameoTimer: number;
  /** Cameo FSM */
  cameo: CameoFSM;
  /** Queued log messages from async callbacks (flushed each tick) */
  pendingLogMessages: string[];
}

/** Create initial idle behavior state */
export function createIdleBehaviorState(): IdleBehaviorState {
  return {
    captainPresent: false,
    nextEventTimer: randomInRange(TIMING.PUN_INTERVAL_MIN, TIMING.PUN_INTERVAL_MAX),
    gossipCount: 0,
    dorteThreshold: randomIntInRange(TIMING.DORTE_THRESHOLD_MIN, TIMING.DORTE_THRESHOLD_MAX),
    dorte: {
      state: DorteState.OFF_BRIDGE,
      render: {
        name: "dorte",
        position: { ...POSITIONS.DOOR },
        targetPosition: null,
        direction: "down",
        animFrame: 0,
        visible: false,
        speechBubble: null,
        speechBubbleTimer: 0,
      },
      timer: 0,
    },
    activeExchange: null,
    cameoTimer: TIMING.CAMEO_INTERVAL,
    cameo: {
      state: CameoState.INACTIVE,
      render: {
        name: "",
        position: { ...POSITIONS.DOOR },
        targetPosition: null,
        direction: "up",
        animFrame: 0,
        visible: false,
        speechBubble: null,
        speechBubbleTimer: 0,
      },
      timer: 0,
      activeScript: null,
    },
    pendingLogMessages: [],
  };
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomIntInRange(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Trigger a cameo event. Picks a random script and starts the ENTERING phase. */
export function triggerCameo(
  state: IdleBehaviorState,
  officers: Map<OfficerName, OfficerFSM>,
): void {
  const script = randomItem(CAMEOS);
  const cameo = state.cameo;
  cameo.state = CameoState.ENTERING;
  cameo.activeScript = script;
  cameo.render.name = script.characterId;
  cameo.render.position = { ...POSITIONS.ENTRANCE };
  cameo.render.visible = true;
  cameo.render.direction = "up";
  cameo.render.animFrame = 0;
  cameo.render.speechBubble = null;
  cameo.render.speechBubbleTimer = 0;
  cameo.render.labelOverride = script.displayName;
  cameo.render.labelColorOverride = script.labelColor;
  cameo.timer = 0;

  // Silence any active officer speech bubbles
  for (const officer of officers.values()) {
    officer.render.speechBubble = null;
    officer.render.speechBubbleTimer = 0;
  }

  state.pendingLogMessages.push(`ALERT: Unidentified visitor on the bridge — ${script.displayName}!`);
}

/** Tick the cameo FSM through its 7-phase sequence */
function tickCameo(
  state: IdleBehaviorState,
  officers: Map<OfficerName, OfficerFSM>,
  deltaMs: number,
): void {
  const cameo = state.cameo;
  if (cameo.state === CameoState.INACTIVE) return;

  const script = cameo.activeScript!;
  const deltaS = deltaMs / 1000;
  const speed = GRID.WALK_SPEED;

  // Decrement cameo speech bubble
  if (cameo.render.speechBubbleTimer > 0) {
    cameo.render.speechBubbleTimer -= deltaMs;
    if (cameo.render.speechBubbleTimer <= 0) {
      cameo.render.speechBubble = null;
      cameo.render.speechBubbleTimer = 0;
    }
  }

  switch (cameo.state) {
    case CameoState.ENTERING: {
      cameo.render.direction = directionTo(cameo.render.position, POSITIONS.CAMEO_STOP);
      const arrived = moveToward(cameo.render.position, POSITIONS.CAMEO_STOP, speed, deltaS);
      cameo.render.animFrame = arrived
        ? 0
        : (cameo.render.animFrame + (deltaMs > 100 ? 1 : 0)) % 3;
      if (arrived) {
        cameo.state = CameoState.SPEAKING;
        cameo.timer = TIMING.CAMEO_SPEAK_DURATION;
        cameo.render.speechBubble = script.entranceLine;
        cameo.render.speechBubbleTimer = TIMING.CAMEO_SPEAK_DURATION;
        state.pendingLogMessages.push(`${script.displayName}: ${script.entranceLine}`);
      }
      break;
    }

    case CameoState.SPEAKING:
      cameo.timer -= deltaMs;
      if (cameo.timer <= 0) {
        cameo.state = CameoState.OFFICERS_REACTING;
        cameo.timer = TIMING.CAMEO_REACTION_DURATION;
        // All officers simultaneously yell (custom reaction or "GET OUT!")
        const reaction = script.officerReaction ?? "GET OUT!";
        for (const officer of officers.values()) {
          officer.render.speechBubble = reaction;
          officer.render.speechBubbleTimer = TIMING.CAMEO_REACTION_DURATION;
        }
        state.pendingLogMessages.push(`ALL OFFICERS: ${reaction}`);
      }
      break;

    case CameoState.OFFICERS_REACTING:
      cameo.timer -= deltaMs;
      if (cameo.timer <= 0) {
        cameo.state = CameoState.DORTE_ENTERING;
        // Start Dorte walking in
        state.dorte.state = DorteState.ENTERING;
        state.dorte.render.position = { ...POSITIONS.ENTRANCE };
        state.dorte.render.visible = true;
        state.dorte.render.direction = "up";
        state.pendingLogMessages.push("ALERT: HR Director Dorte responding to the incident!");
      }
      break;

    case CameoState.DORTE_ENTERING: {
      // Dorte walks to her scold position (tickDorte handles movement)
      // We check when she arrives
      if (state.dorte.state === DorteState.SCOLDING) {
        cameo.state = CameoState.DORTE_SPEAKING;
        cameo.timer = TIMING.CAMEO_DORTE_SPEAK_DURATION;
        state.dorte.render.speechBubble = script.dorteLine;
        state.dorte.render.speechBubbleTimer = TIMING.CAMEO_DORTE_SPEAK_DURATION;
        state.dorte.timer = TIMING.CAMEO_DORTE_SPEAK_DURATION;
        state.pendingLogMessages.push(`DORTE: ${script.dorteLine}`);
      }
      break;
    }

    case CameoState.DORTE_SPEAKING:
      cameo.timer -= deltaMs;
      if (cameo.timer <= 0) {
        cameo.state = CameoState.CAMEO_REPEATING;
        cameo.timer = TIMING.CAMEO_REPEAT_DURATION;
        cameo.render.speechBubble = script.exitLine;
        cameo.render.speechBubbleTimer = TIMING.CAMEO_REPEAT_DURATION;
        state.pendingLogMessages.push(`${script.displayName}: ${script.exitLine}`);
      }
      break;

    case CameoState.CAMEO_REPEATING:
      cameo.timer -= deltaMs;
      if (cameo.timer <= 0) {
        cameo.state = CameoState.CAMEO_LEAVING;
        cameo.render.speechBubble = null;
        cameo.render.speechBubbleTimer = 0;
      }
      break;

    case CameoState.CAMEO_LEAVING: {
      cameo.render.direction = directionTo(cameo.render.position, POSITIONS.DOOR);
      const arrived = moveToward(cameo.render.position, POSITIONS.DOOR, speed, deltaS);
      cameo.render.animFrame = arrived
        ? 0
        : (cameo.render.animFrame + (deltaMs > 100 ? 1 : 0)) % 3;
      if (arrived) {
        cameo.render.visible = false;
        cameo.state = CameoState.DORTE_LEAVING;
        // Start Dorte leaving
        state.dorte.state = DorteState.LEAVING;
        state.dorte.render.speechBubble = null;
        state.dorte.render.speechBubbleTimer = 0;
      }
      break;
    }

    case CameoState.DORTE_LEAVING: {
      // tickDorte handles Dorte's movement back to door
      if (state.dorte.state === DorteState.OFF_BRIDGE) {
        // Both have left — cameo complete
        cameo.state = CameoState.INACTIVE;
        cameo.render.visible = false;
        cameo.activeScript = null;
        state.cameoTimer = TIMING.CAMEO_INTERVAL;
        state.pendingLogMessages.push("Visitor has been escorted off the bridge.");
      }
      break;
    }
  }
}

/** Returns true if a cameo event is currently active */
export function isCameoActive(state: IdleBehaviorState): boolean {
  return state.cameo.state !== CameoState.INACTIVE;
}

/** Schedule the next idle event timer based on captain presence */
function scheduleNext(state: IdleBehaviorState): void {
  if (state.captainPresent) {
    state.nextEventTimer = randomInRange(TIMING.PUN_INTERVAL_MIN, TIMING.PUN_INTERVAL_MAX);
  } else {
    state.nextEventTimer = randomInRange(TIMING.GOSSIP_INTERVAL_MIN, TIMING.GOSSIP_INTERVAL_MAX);
  }
}

export interface IdleTickResult {
  /** Log messages to add to comms log */
  logMessages: string[];
}

/** Tick the idle behavior manager. Mutates state in place. */
export function tickIdleBehavior(
  state: IdleBehaviorState,
  officers: Map<OfficerName, OfficerFSM>,
  deltaMs: number,
): IdleTickResult {
  const result: IdleTickResult = { logMessages: [] };

  // Flush pending log messages from async callbacks
  if (state.pendingLogMessages.length > 0) {
    result.logMessages.push(...state.pendingLogMessages);
    state.pendingLogMessages = [];
  }

  // Tick Dorte movement
  tickDorte(state.dorte, deltaMs);

  // Decrement dorte speech bubble
  if (state.dorte.render.speechBubbleTimer > 0) {
    state.dorte.render.speechBubbleTimer -= deltaMs;
    if (state.dorte.render.speechBubbleTimer <= 0) {
      state.dorte.render.speechBubble = null;
      state.dorte.render.speechBubbleTimer = 0;
    }
  }

  // Tick cameo FSM
  tickCameo(state, officers, deltaMs);

  // Block normal idle events during active cameo
  if (state.cameo.state !== CameoState.INACTIVE) {
    return result;
  }

  // Countdown cameo timer when captain is present and Dorte is off bridge
  if (state.captainPresent && state.dorte.state === DorteState.OFF_BRIDGE) {
    state.cameoTimer -= deltaMs;
    if (state.cameoTimer <= 0) {
      triggerCameo(state, officers);
      return result;
    }
  }

  // Don't schedule idle events while an exchange is active or Dorte is on bridge
  if (state.activeExchange || state.dorte.state !== DorteState.OFF_BRIDGE) {
    return result;
  }

  // Check if all officers are in a state that allows idle events
  // DANCING counts as "idle enough" for the purpose of allowing others to have idle events
  const allIdle = [...officers.values()].every(
    (o) =>
      o.state === OfficerState.IDLE ||
      o.state === OfficerState.WANDERING ||
      o.state === OfficerState.GOSSIPING ||
      o.state === OfficerState.DANCING,
  );

  if (!allIdle) return result;

  state.nextEventTimer -= deltaMs;
  if (state.nextEventTimer > 0) return result;

  // Time for an idle event!
  if (state.captainPresent) {
    // Pun exchange — only pick from idle officers to avoid overwriting reports
    const pun = randomItem(PUNS);
    const idleOfficerNames = [...officers.entries()]
      .filter(
        ([, o]) =>
          o.state === OfficerState.IDLE ||
          o.state === OfficerState.WANDERING ||
          o.state === OfficerState.GOSSIPING,
        // Exclude DANCING officers (e.g. Spoty) from pun selection
      )
      .map(([name]) => name);

    if (idleOfficerNames.length === 0) {
      // All officers busy, skip this pun and reschedule
      scheduleNext(state);
      return result;
    }

    const teller = randomItem(idleOfficerNames);
    const tellerFsm = officers.get(teller)!;

    tellerFsm.render.speechBubble = pun.setup;
    tellerFsm.render.speechBubbleTimer = TIMING.SPEECH_BUBBLE_DURATION;

    // Schedule punchline — guard against officer becoming busy
    setTimeout(() => {
      if (
        tellerFsm.state === OfficerState.IDLE ||
        tellerFsm.state === OfficerState.WANDERING ||
        tellerFsm.state === OfficerState.GOSSIPING
      ) {
        tellerFsm.render.speechBubble = pun.punchline;
        tellerFsm.render.speechBubbleTimer = TIMING.SPEECH_BUBBLE_DURATION;
      }
    }, TIMING.SPEECH_BUBBLE_DURATION + 500);

    result.logMessages.push(`${teller.toUpperCase()}: ${pun.setup}`);
    result.logMessages.push(`${teller.toUpperCase()}: ${pun.punchline}`);
  } else {
    // Gossip exchange (captain absent)
    const gossip = randomItem(GOSSIPS);
    const speakerFsm = officers.get(gossip.speaker);
    const listenerFsm = officers.get(gossip.listener);

    if (speakerFsm && listenerFsm) {
      // Move officers to face each other
      speakerFsm.state = OfficerState.GOSSIPING;
      listenerFsm.state = OfficerState.GOSSIPING;
      speakerFsm.render.direction = directionTo(
        speakerFsm.render.position,
        listenerFsm.render.position,
      );
      listenerFsm.render.direction = directionTo(
        listenerFsm.render.position,
        speakerFsm.render.position,
      );

      // Show gossip lines — guarded so Dorte scatter cancels them
      let delay = 0;
      for (const line of gossip.lines) {
        const currentDelay = delay;
        setTimeout(() => {
          if (speakerFsm.state === OfficerState.GOSSIPING) {
            speakerFsm.render.speechBubble = line;
            speakerFsm.render.speechBubbleTimer = TIMING.SPEECH_BUBBLE_DURATION;
          }
        }, currentDelay);
        delay += TIMING.SPEECH_BUBBLE_DURATION + 500;
      }

      // Return to wandering after gossip — guarded
      setTimeout(() => {
        if (speakerFsm.state === OfficerState.GOSSIPING) {
          speakerFsm.state = OfficerState.WANDERING;
        }
        if (listenerFsm.state === OfficerState.GOSSIPING) {
          listenerFsm.state = OfficerState.WANDERING;
        }
      }, delay);

      state.gossipCount++;

      // Log gossip dialogue
      for (const line of gossip.lines) {
        result.logMessages.push(`${gossip.speaker.toUpperCase()}: ${line}`);
      }

      // Check Dorte threshold — interrupt gossip immediately
      if (state.gossipCount >= state.dorteThreshold) {
        triggerDorte(state, officers);
        state.gossipCount = 0;
        state.dorteThreshold = randomIntInRange(
          TIMING.DORTE_THRESHOLD_MIN,
          TIMING.DORTE_THRESHOLD_MAX,
        );
        result.logMessages.push("ALERT: HR Director Dorte approaching the bridge!");
      }
    }
  }

  scheduleNext(state);
  return result;
}

/** Trigger Dorte's entrance and scolding sequence */
function triggerDorte(state: IdleBehaviorState, officers: Map<OfficerName, OfficerFSM>): void {
  const dorte = state.dorte;
  dorte.state = DorteState.ENTERING;
  dorte.render.position = { ...POSITIONS.ENTRANCE };
  dorte.render.visible = true;
  dorte.render.direction = "up";

  // Officers scatter
  for (const officer of officers.values()) {
    officer.state = OfficerState.SCATTERING;
  }

  const scolding = randomItem(SCOLDINGS);

  // Show entrance line and log it
  dorte.render.speechBubble = scolding.entrance;
  dorte.render.speechBubbleTimer = TIMING.SPEECH_BUBBLE_DURATION;
  state.pendingLogMessages.push(`DORTE: ${scolding.entrance}`);

  // After reaching scold position, show scolding
  setTimeout(() => {
    dorte.render.speechBubble = scolding.scold;
    dorte.render.speechBubbleTimer = TIMING.SCOLD_DURATION;
    dorte.state = DorteState.SCOLDING;
    dorte.timer = TIMING.SCOLD_DURATION;
    state.pendingLogMessages.push(`DORTE: ${scolding.scold}`);
  }, 3000);

  // After scolding, exit line and leave
  setTimeout(() => {
    dorte.render.speechBubble = scolding.exit;
    dorte.render.speechBubbleTimer = TIMING.SPEECH_BUBBLE_DURATION;
    dorte.state = DorteState.LEAVING;
    state.pendingLogMessages.push(`DORTE: ${scolding.exit}`);
  }, 3000 + TIMING.SCOLD_DURATION + 500);
}

/** Tick Dorte's movement FSM */
function tickDorte(dorte: DorteFSM, deltaMs: number): void {
  const deltaS = deltaMs / 1000;
  const speed = GRID.WALK_SPEED;

  switch (dorte.state) {
    case DorteState.OFF_BRIDGE:
      dorte.render.visible = false;
      break;

    case DorteState.ENTERING: {
      dorte.render.visible = true;
      dorte.render.direction = directionTo(dorte.render.position, POSITIONS.DORTE_SCOLD);
      const arrived = moveToward(dorte.render.position, POSITIONS.DORTE_SCOLD, speed, deltaS);
      dorte.render.animFrame = arrived
        ? 0
        : (dorte.render.animFrame + (deltaMs > 100 ? 1 : 0)) % 3;
      if (arrived) {
        dorte.state = DorteState.SCOLDING;
        dorte.timer = TIMING.SCOLD_DURATION;
      }
      break;
    }

    case DorteState.SCOLDING:
      dorte.timer -= deltaMs;
      dorte.render.animFrame = 0;
      break;

    case DorteState.LEAVING: {
      dorte.render.direction = directionTo(dorte.render.position, POSITIONS.DOOR);
      const arrived = moveToward(dorte.render.position, POSITIONS.DOOR, speed, deltaS);
      dorte.render.animFrame = arrived
        ? 0
        : (dorte.render.animFrame + (deltaMs > 100 ? 1 : 0)) % 3;
      if (arrived) {
        dorte.state = DorteState.OFF_BRIDGE;
        dorte.render.visible = false;
      }
      break;
    }
  }
}

/** Called when captain presence changes */
export function setCaptainPresence(state: IdleBehaviorState, present: boolean): void {
  state.captainPresent = present;
  if (present) {
    state.gossipCount = 0;
  }
  scheduleNext(state);
}
