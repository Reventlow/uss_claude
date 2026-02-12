import { GRID, OfficerState, type CharacterRenderState } from "@uss-claude/shared";
import type { BridgeState } from "../state/bridge-state.js";
import { drawBackground } from "./layers/background.js";
import { drawViewscreen } from "./layers/viewscreen.js";
import { drawCharacters, setDancingOfficers } from "./layers/characters.js";
import { drawSpeechBubbles } from "./layers/speech-bubbles.js";
import { drawEffects } from "./layers/effects.js";
import { drawSongTicker } from "./layers/song-ticker.js";

const CANVAS_W = GRID.WIDTH * GRID.PIXEL_SIZE;
const CANVAS_H = GRID.HEIGHT * GRID.PIXEL_SIZE;

/** Initialize a canvas for pixel art rendering */
export function initCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  canvas.style.imageRendering = "pixelated";

  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

/** Collect all character render states from the bridge state */
function collectCharacters(state: BridgeState): CharacterRenderState[] {
  const chars: CharacterRenderState[] = [];
  for (const officer of state.officers.values()) {
    chars.push(officer.render);
  }
  chars.push(state.calvin.render);
  chars.push(state.idleBehavior.dorte.render);
  chars.push(state.idleBehavior.cameo.render);
  return chars;
}

/** Render one frame of the bridge */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  state: BridgeState,
  deltaMs: number,
): void {
  // Clear
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // Layer 1: Background (cached)
  drawBackground(ctx, state.atmosphere);

  // Layer 2: Viewscreen
  drawViewscreen(ctx, state.atmosphere, deltaMs);

  // Inform character renderer which officers are dancing
  const dancing = new Set<string>();
  for (const [name, officer] of state.officers) {
    if (officer.state === OfficerState.DANCING) {
      dancing.add(name);
    }
  }
  setDancingOfficers(dancing);

  // Layer 3: Characters (Y-sorted)
  const characters = collectCharacters(state);
  drawCharacters(ctx, characters, state.calvin.state);

  // Layer 4: Speech bubbles
  drawSpeechBubbles(ctx, characters);

  // Layer 5: Song ticker
  drawSongTicker(ctx, state.currentTrack);

  // Layer 6: CRT effects
  drawEffects(ctx, state.atmosphere);
}

/** Hit-test a mouse position against character positions. Returns character name or null. */
export function hitTestCharacter(
  state: BridgeState,
  canvasX: number,
  canvasY: number,
): string | null {
  const PS = GRID.PIXEL_SIZE;
  const CW = GRID.CHAR_WIDTH;
  const CH = GRID.CHAR_HEIGHT;
  const characters = collectCharacters(state);

  // Check in reverse Y-sort order (topmost drawn last = check first)
  const visible = characters.filter((c) => c.visible);
  visible.sort((a, b) => b.position.y - a.position.y);

  for (const char of visible) {
    const left = (char.position.x - CW / 2) * PS;
    const top = (char.position.y - CH / 2) * PS;
    const right = left + CW * PS;
    const bottom = top + CH * PS;

    if (canvasX >= left && canvasX <= right && canvasY >= top && canvasY <= bottom) {
      return char.name;
    }
  }

  return null;
}
