import { GRID, POSITIONS } from "@uss-claude/shared";
import { COLORS } from "../sprites/colors.js";

const PS = GRID.PIXEL_SIZE;
const CANVAS_W = GRID.WIDTH * PS;

/**
 * Draw a comic-style thought bubble next to the comms console
 * showing the currently playing track. Expands to the right as needed.
 */
export function drawSongTicker(
  ctx: CanvasRenderingContext2D,
  currentTrack: { artist: string; title: string } | null,
): void {
  if (!currentTrack) return;

  ctx.save();

  const stationX = POSITIONS.SPOTY_STATION.x * PS;
  const stationY = POSITIONS.SPOTY_STATION.y * PS;

  // Bubble left edge anchored to the right of the thought circles
  const bubbleLeft = stationX + 28 * PS;
  const bubbleCenterY = stationY - 12 * PS;

  // Measure text to size the bubble dynamically
  const fontSize = PS * 2.5;
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;

  const line1 = `\u266A ${currentTrack.artist}`;
  const line2 = currentTrack.title;

  // Measure actual pixel widths
  const line1Width = ctx.measureText(line1).width;
  const line2Width = ctx.measureText(line2).width;
  const textWidth = Math.max(line1Width, line2Width);

  const padX = 6;
  const padY = 5;
  const lineHeight = fontSize + 2;
  const radius = 6;

  // Size bubble to fit text, but clamp to canvas right edge
  const maxBubbleW = CANVAS_W - bubbleLeft - 4;
  const bubbleW = Math.min(textWidth + padX * 2, maxBubbleW);
  const bubbleH = lineHeight * 2 + padY * 2;

  // If text is wider than bubble, truncate with ellipsis
  const availTextW = bubbleW - padX * 2;
  const drawLine1 = truncateToFit(ctx, line1, availTextW);
  const drawLine2 = truncateToFit(ctx, line2, availTextW);

  // Trailing thought circles (from console toward bubble)
  const circles = [
    { x: stationX + 10 * PS, y: stationY - 4 * PS, r: 1.5 * PS },
    { x: stationX + 18 * PS, y: stationY - 7 * PS, r: 2 * PS },
    { x: stationX + 25 * PS, y: stationY - 10 * PS, r: 2.5 * PS },
  ];

  for (const c of circles) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fill();
    ctx.strokeStyle = COLORS.spotifyGreen;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Bubble body — rounded rectangle, left-anchored
  const bx = bubbleLeft;
  const by = bubbleCenterY - bubbleH / 2;

  ctx.beginPath();
  ctx.moveTo(bx + radius, by);
  ctx.lineTo(bx + bubbleW - radius, by);
  ctx.quadraticCurveTo(bx + bubbleW, by, bx + bubbleW, by + radius);
  ctx.lineTo(bx + bubbleW, by + bubbleH - radius);
  ctx.quadraticCurveTo(bx + bubbleW, by + bubbleH, bx + bubbleW - radius, by + bubbleH);
  ctx.lineTo(bx + radius, by + bubbleH);
  ctx.quadraticCurveTo(bx, by + bubbleH, bx, by + bubbleH - radius);
  ctx.lineTo(bx, by + radius);
  ctx.quadraticCurveTo(bx, by, bx + radius, by);
  ctx.closePath();

  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fill();
  ctx.strokeStyle = COLORS.spotifyGreen;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Text — left-aligned inside bubble
  ctx.fillStyle = COLORS.spotifyGreen;
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const textLeft = bx + padX;
  const textTopY = bubbleCenterY - lineHeight / 2;
  ctx.fillText(drawLine1, textLeft, textTopY);
  ctx.fillText(drawLine2, textLeft, textTopY + lineHeight);

  ctx.restore();
}

/** Truncate text with ellipsis if it exceeds available pixel width */
function truncateToFit(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;

  const ellipsis = "\u2026";
  for (let i = text.length - 1; i > 0; i--) {
    const truncated = text.slice(0, i) + ellipsis;
    if (ctx.measureText(truncated).width <= maxWidth) {
      return truncated;
    }
  }
  return ellipsis;
}
