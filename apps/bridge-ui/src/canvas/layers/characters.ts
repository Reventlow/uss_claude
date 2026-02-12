import { GRID, CalvinState, OfficerState, type CharacterRenderState } from "@uss-claude/shared";
import { getSpriteFrame, type SpriteFrame } from "../sprites/sprite-data.js";
import { COLORS } from "../sprites/colors.js";

const PS = GRID.PIXEL_SIZE;
const CW = GRID.CHAR_WIDTH;
const CH = GRID.CHAR_HEIGHT;

/** Display names and role info for each character */
const CHARACTER_INFO: Record<string, { label: string; color: string }> = {
  glass: { label: "GLASS", color: COLORS.uniformGold },
  fizban: { label: "FIZBAN", color: COLORS.uniformBlue },
  jasper: { label: "JASPER", color: COLORS.uniformRedOrange },
  spoty: { label: "SPOTY", color: COLORS.spotifyGreen },
  calvin: { label: "CALVIN", color: COLORS.uniformGold },
  dorte: { label: "HR DORTE", color: COLORS.uniformGray },
};

/** Set of officer names currently in DANCING state (set externally before draw) */
let dancingOfficers: Set<string> = new Set();
/** Set of officer names currently in SLEEPING state (set externally before draw) */
let sleepingOfficers: Set<string> = new Set();

/** Call before drawCharacters to inform which officers are dancing */
export function setDancingOfficers(names: Set<string>): void {
  dancingOfficers = names;
}

/** Call before drawCharacters to inform which officers are sleeping */
export function setSleepingOfficers(names: Set<string>): void {
  sleepingOfficers = names;
}

/** Draw all visible characters, Y-sorted for depth */
export function drawCharacters(
  ctx: CanvasRenderingContext2D,
  characters: CharacterRenderState[],
  calvinState: CalvinState,
): void {
  // Filter to visible characters and sort by Y position
  const visible = characters.filter((c) => c.visible);
  visible.sort((a, b) => a.position.y - b.position.y);

  for (const char of visible) {
    const isSeated = char.name === "calvin" && (
      calvinState === CalvinState.SEATED || calvinState === CalvinState.LISTENING
    );
    const isDancing = dancingOfficers.has(char.name);
    const isSleeping = sleepingOfficers.has(char.name);

    const frame = getSpriteFrame(
      char.name,
      char.direction,
      char.animFrame,
      isSeated,
      isDancing,
      isSleeping,
    );

    drawSprite(ctx, frame, char.position.x, char.position.y);

    // Draw name label below the character
    const labelText = char.labelOverride ?? CHARACTER_INFO[char.name]?.label;
    const labelColor = char.labelColorOverride ?? CHARACTER_INFO[char.name]?.color;
    if (labelText && labelColor) {
      ctx.save();
      ctx.fillStyle = labelColor;
      ctx.font = `${PS * 2.5}px "Press Start 2P", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(
        labelText,
        Math.round(char.position.x * PS),
        Math.round((char.position.y + CH / 2 + 1) * PS),
      );
      ctx.restore();
    }
  }
}

/** Draw a single sprite frame at grid position (centered) */
function drawSprite(
  ctx: CanvasRenderingContext2D,
  frame: SpriteFrame,
  gridX: number,
  gridY: number,
): void {
  // Center the sprite on the position
  const startX = Math.round((gridX - CW / 2) * PS);
  const startY = Math.round((gridY - CH / 2) * PS);

  for (let row = 0; row < frame.length; row++) {
    for (let col = 0; col < frame[row].length; col++) {
      const color = frame[row][col];
      if (color === null) continue;
      ctx.fillStyle = color;
      ctx.fillRect(
        startX + col * PS,
        startY + row * PS,
        PS,
        PS,
      );
    }
  }
}
