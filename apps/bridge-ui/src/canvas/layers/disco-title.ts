import { GRID, DiscoState } from "@uss-claude/shared";

const PS = GRID.PIXEL_SIZE;
const CANVAS_W = GRID.WIDTH * PS;

const DISCO_COLORS = [
  "#FF0066", "#FF6600", "#FFCC00", "#00FF66", "#0066FF", "#CC00FF",
];

/** Draw prominent disco song title at top of screen */
export function drawDiscoTitle(
  ctx: CanvasRenderingContext2D,
  discoState: DiscoState,
  song: { artist: string; title: string } | null,
): void {
  if (discoState !== DiscoState.DANCING || !song) return;

  ctx.save();

  const text = `NOW PLAYING: ${song.artist} - ${song.title}`;
  const fontSize = PS * 5;
  ctx.font = `${fontSize}px "Dekko", cursive`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const x = CANVAS_W / 2;
  const y = PS * 2;

  // Cycling color glow
  const colorIndex = Math.floor(Date.now() / 500) % DISCO_COLORS.length;
  const color = DISCO_COLORS[colorIndex];

  // Shadow/glow effect
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(text, x, y);

  // Draw again without shadow for crisp text
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);

  ctx.restore();
}
