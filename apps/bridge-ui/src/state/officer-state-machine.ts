import {
  OfficerState,
  CalvinState,
  POSITIONS,
  GRID,
  TIMING,
  type OfficerName,
  type Point,
  type CharacterRenderState,
  type Direction,
} from "@uss-claude/shared";

/** Internal state for an officer's FSM */
export interface OfficerFSM {
  name: OfficerName;
  state: OfficerState;
  render: CharacterRenderState;
  timer: number;
  wanderTarget: Point | null;
  /** Queued report line to show when officer reaches the captain */
  pendingReport: string | null;
  /** MCP "done" arrived while still walking to station */
  pendingDone: boolean;
  /** Elapsed ms in active task states (WALKING_TO_STATION + WORKING) */
  stuckTimer: number;
  /** Elapsed ms since last dance frame change */
  danceTimer: number;
}

/** Create initial officer FSM */
export function createOfficerFSM(name: OfficerName, idlePos: Point): OfficerFSM {
  return {
    name,
    state: OfficerState.IDLE,
    render: {
      name,
      position: { ...idlePos },
      targetPosition: null,
      direction: "down",
      animFrame: 0,
      visible: true,
      speechBubble: null,
      speechBubbleTimer: 0,
    },
    timer: 0,
    wanderTarget: null,
    pendingReport: null,
    pendingDone: false,
    stuckTimer: 0,
    danceTimer: 0,
  };
}

/** Calculate direction from current to target */
export function directionTo(from: Point, to: Point): Direction {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "down" : "up";
}

/** Move a point toward a target at given speed. Returns true when arrived. */
export function moveToward(pos: Point, target: Point, speed: number, deltaS: number): boolean {
  const dist = speed * deltaS;
  // Manhattan movement: horizontal first, then vertical
  const dx = target.x - pos.x;
  const dy = target.y - pos.y;

  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
    pos.x = target.x;
    pos.y = target.y;
    return true;
  }

  if (Math.abs(dx) > 0.5) {
    const step = Math.min(dist, Math.abs(dx));
    pos.x += Math.sign(dx) * step;
  } else {
    const step = Math.min(dist, Math.abs(dy));
    pos.y += Math.sign(dy) * step;
  }
  return false;
}

/** Pick a random wander target within bounds */
export function randomWanderTarget(): Point {
  return {
    x: POSITIONS.WANDER_MIN.x + Math.random() * (POSITIONS.WANDER_MAX.x - POSITIONS.WANDER_MIN.x),
    y: POSITIONS.WANDER_MIN.y + Math.random() * (POSITIONS.WANDER_MAX.y - POSITIONS.WANDER_MIN.y),
  };
}

/** Advance an officer FSM by deltaMs. Returns the FSM (mutated in-place). */
export function tickOfficer(
  fsm: OfficerFSM,
  deltaMs: number,
  captainPresent: boolean,
  stationPos: Point,
  idlePos: Point,
): OfficerFSM {
  const deltaS = deltaMs / 1000;
  const speed = GRID.WALK_SPEED;

  // Decrement speech bubble timer
  if (fsm.render.speechBubbleTimer > 0) {
    fsm.render.speechBubbleTimer -= deltaMs;
    if (fsm.render.speechBubbleTimer <= 0) {
      fsm.render.speechBubble = null;
      fsm.render.speechBubbleTimer = 0;
    }
  }

  switch (fsm.state) {
    case OfficerState.IDLE:
      // Just standing at idle position
      fsm.render.animFrame = 0;
      break;

    case OfficerState.WALKING_TO_STATION: {
      fsm.stuckTimer += deltaMs;
      fsm.render.direction = directionTo(fsm.render.position, stationPos);
      const arrived = moveToward(fsm.render.position, stationPos, speed, deltaS);
      fsm.render.animFrame = arrived ? 0 : ((fsm.render.animFrame + (deltaMs > 100 ? 1 : 0)) % 3);
      if (arrived) {
        fsm.state = OfficerState.WORKING;
        // If "done" arrived while walking, show brief work animation then transition
        fsm.timer = fsm.pendingDone ? TIMING.WORK_DURATION / 4 : TIMING.WORK_DURATION;
        fsm.pendingDone = false;
        fsm.render.direction = "up"; // Face the console
      }
      break;
    }

    case OfficerState.WORKING:
      fsm.stuckTimer += deltaMs;
      fsm.timer -= deltaMs;
      if (fsm.timer <= 0) {
        if (captainPresent) {
          fsm.state = OfficerState.WALKING_TO_CAPTAIN;
          fsm.render.targetPosition = { ...POSITIONS.REPORT_SPOT };
        } else {
          // No captain, just go back to idle
          fsm.state = OfficerState.WALKING_TO_IDLE;
        }
        fsm.stuckTimer = 0;
      }
      break;

    case OfficerState.WALKING_TO_CAPTAIN: {
      fsm.render.direction = directionTo(fsm.render.position, POSITIONS.REPORT_SPOT);
      const arrived = moveToward(fsm.render.position, POSITIONS.REPORT_SPOT, speed, deltaS);
      fsm.render.animFrame = arrived ? 0 : ((fsm.render.animFrame + (deltaMs > 100 ? 1 : 0)) % 3);
      if (arrived) {
        fsm.state = OfficerState.REPORTING;
        fsm.timer = TIMING.REPORT_DURATION;
        fsm.render.direction = "down"; // Face the captain

        // Show the queued report as a speech bubble
        if (fsm.pendingReport) {
          fsm.render.speechBubble = fsm.pendingReport;
          fsm.render.speechBubbleTimer = TIMING.REPORT_DURATION;
          fsm.pendingReport = null;
        }
      }
      break;
    }

    case OfficerState.REPORTING:
      fsm.timer -= deltaMs;
      if (fsm.timer <= 0) {
        fsm.state = OfficerState.WALKING_TO_IDLE;
      }
      break;

    case OfficerState.WALKING_TO_IDLE: {
      fsm.render.direction = directionTo(fsm.render.position, idlePos);
      const arrived = moveToward(fsm.render.position, idlePos, speed, deltaS);
      fsm.render.animFrame = arrived ? 0 : ((fsm.render.animFrame + (deltaMs > 100 ? 1 : 0)) % 3);
      if (arrived) {
        fsm.state = OfficerState.IDLE;
      }
      break;
    }

    case OfficerState.WANDERING: {
      if (!fsm.wanderTarget) {
        fsm.wanderTarget = randomWanderTarget();
      }
      fsm.render.direction = directionTo(fsm.render.position, fsm.wanderTarget);
      const arrived = moveToward(fsm.render.position, fsm.wanderTarget, speed * 0.5, deltaS);
      fsm.render.animFrame = arrived ? 0 : ((fsm.render.animFrame + (deltaMs > 100 ? 1 : 0)) % 3);
      if (arrived) {
        fsm.wanderTarget = randomWanderTarget();
      }
      break;
    }

    case OfficerState.GOSSIPING:
      // Stand still while gossiping
      fsm.render.animFrame = 0;
      break;

    case OfficerState.SCATTERING: {
      fsm.render.direction = directionTo(fsm.render.position, idlePos);
      const arrived = moveToward(fsm.render.position, idlePos, speed * 1.5, deltaS);
      fsm.render.animFrame = arrived ? 0 : ((fsm.render.animFrame + (deltaMs > 100 ? 1 : 0)) % 3);
      if (arrived) {
        fsm.state = OfficerState.IDLE;
      }
      break;
    }

    case OfficerState.DANCING: {
      // Cycle dance animation frames at DANCE_FRAME_INTERVAL pace
      fsm.danceTimer += deltaMs;
      if (fsm.danceTimer >= TIMING.DANCE_FRAME_INTERVAL) {
        fsm.danceTimer -= TIMING.DANCE_FRAME_INTERVAL;
        fsm.render.animFrame = (fsm.render.animFrame + 1) % 4;
      }
      break;
    }

    case OfficerState.SLEEPING:
      // Stay still, face down — sleep talk bubbles handled by bridge-state
      fsm.render.animFrame = 0;
      break;
  }

  return fsm;
}
