import { GRID, BridgeAtmosphere } from "@uss-claude/shared";
import { COLORS } from "../sprites/colors.js";

const PS = GRID.PIXEL_SIZE;
const CANVAS_W = GRID.WIDTH * PS;
const CANVAS_H = GRID.HEIGHT * PS;

/** Draw CRT post-processing effects */
export function drawEffects(
  ctx: CanvasRenderingContext2D,
  atmosphere: BridgeAtmosphere,
): void {
  // Scanlines
  ctx.fillStyle = COLORS.scanline;
  for (let y = 0; y < CANVAS_H; y += 3) {
    ctx.fillRect(0, y, CANVAS_W, 1);
  }

  // Radial vignette
  const gradient = ctx.createRadialGradient(
    CANVAS_W / 2,
    CANVAS_H / 2,
    CANVAS_W * 0.3,
    CANVAS_W / 2,
    CANVAS_H / 2,
    CANVAS_W * 0.7,
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.4)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Active glow overlay
  if (atmosphere === BridgeAtmosphere.ACTIVE) {
    ctx.fillStyle = COLORS.glowActive;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }
}
