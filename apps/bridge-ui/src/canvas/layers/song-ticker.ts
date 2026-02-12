import { GRID } from "@uss-claude/shared";
import { COLORS } from "../sprites/colors.js";

const PS = GRID.PIXEL_SIZE;
const CANVAS_W = GRID.WIDTH * PS;
const CANVAS_H = GRID.HEIGHT * PS;

/** Height of the ticker strip in screen pixels */
const STRIP_H = 14;

/** Draw the song ticker at the bottom of the canvas */
export function drawSongTicker(
  ctx: CanvasRenderingContext2D,
  currentTrack: { artist: string; title: string } | null,
): void {
  if (!currentTrack) return;

  const y = CANVAS_H - STRIP_H;

  // Semi-transparent dark background strip
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
  ctx.fillRect(0, y, CANVAS_W, STRIP_H);

  // Spotify green text, centered
  ctx.fillStyle = COLORS.spotifyGreen;
  ctx.font = `${PS * 2.5}px "Press Start 2P", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const text = `♪ ${currentTrack.artist} - ${currentTrack.title}`;
  // Truncate if too wide
  const maxWidth = CANVAS_W - 20;
  ctx.fillText(text, CANVAS_W / 2, y + STRIP_H / 2, maxWidth);
  ctx.restore();
}
