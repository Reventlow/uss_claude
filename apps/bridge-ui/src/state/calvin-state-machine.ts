import {
  CalvinState,
  POSITIONS,
  GRID,
  TIMING,
  type CharacterRenderState,
} from "@uss-claude/shared";
import { directionTo, moveToward } from "./officer-state-machine.js";

/** Internal state for Calvin's FSM */
export interface CalvinFSM {
  state: CalvinState;
  render: CharacterRenderState;
  timer: number;
}

/** Create initial Calvin FSM (off bridge) */
export function createCalvinFSM(): CalvinFSM {
  return {
    state: CalvinState.OFF_BRIDGE,
    render: {
      name: "calvin",
      position: { ...POSITIONS.DOOR },
      targetPosition: null,
      direction: "down",
      animFrame: 0,
      visible: false,
      speechBubble: null,
      speechBubbleTimer: 0,
    },
    timer: 0,
  };
}

/** Advance Calvin's FSM by deltaMs */
export function tickCalvin(fsm: CalvinFSM, deltaMs: number): CalvinFSM {
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
    case CalvinState.OFF_BRIDGE:
      fsm.render.visible = false;
      break;

    case CalvinState.ENTERING: {
      fsm.render.visible = true;
      fsm.render.direction = directionTo(fsm.render.position, POSITIONS.CAPTAIN_CHAIR);
      const arrived = moveToward(fsm.render.position, POSITIONS.CAPTAIN_CHAIR, speed, deltaS);
      fsm.render.animFrame = arrived ? 0 : ((fsm.render.animFrame + (deltaMs > 100 ? 1 : 0)) % 3);
      if (arrived) {
        fsm.state = CalvinState.SEATED;
        fsm.render.direction = "down";
      }
      break;
    }

    case CalvinState.SEATED:
      fsm.render.animFrame = 0;
      fsm.render.direction = "down";
      break;

    case CalvinState.LISTENING:
      fsm.timer -= deltaMs;
      if (fsm.timer <= 0) {
        fsm.state = CalvinState.SEATED;
        fsm.render.direction = "down";
      }
      break;

    case CalvinState.LEAVING: {
      fsm.render.direction = directionTo(fsm.render.position, POSITIONS.DOOR);
      const arrived = moveToward(fsm.render.position, POSITIONS.DOOR, speed, deltaS);
      fsm.render.animFrame = arrived ? 0 : ((fsm.render.animFrame + (deltaMs > 100 ? 1 : 0)) % 3);
      if (arrived) {
        fsm.state = CalvinState.OFF_BRIDGE;
        fsm.render.visible = false;
      }
      break;
    }
  }

  return fsm;
}

/** Start Calvin entering the bridge */
export function calvinEnter(fsm: CalvinFSM): void {
  if (fsm.state === CalvinState.OFF_BRIDGE) {
    fsm.state = CalvinState.ENTERING;
    fsm.render.position = { ...POSITIONS.ENTRANCE };
    fsm.render.visible = true;
    fsm.render.direction = "up";
  }
}

/** Start Calvin leaving the bridge */
export function calvinLeave(fsm: CalvinFSM): void {
  if (fsm.state === CalvinState.SEATED || fsm.state === CalvinState.LISTENING) {
    fsm.state = CalvinState.LEAVING;
  }
}

/** Calvin starts listening to a report */
export function calvinListen(fsm: CalvinFSM): void {
  if (fsm.state === CalvinState.SEATED) {
    fsm.state = CalvinState.LISTENING;
    fsm.timer = TIMING.LISTEN_DURATION;
    // Turn toward the reporting officer
    fsm.render.direction = "up";
  }
}
