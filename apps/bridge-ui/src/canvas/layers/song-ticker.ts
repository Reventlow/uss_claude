import { GRID, POSITIONS } from "@uss-claude/shared";
import { COLORS } from "../sprites/colors.js";

const PS = GRID.PIXEL_SIZE;

/**
 * Draw a comic-style thought bubble next to the comms console
 * showing the currently playing track.
 */
export function drawSongTicker(
  ctx: CanvasRenderingContext2D,
  currentTrack: { artist: string; title: string } | null,
): void {
  if (!currentTrack) return;

  ctx.save();

  // Bubble position — to the right of the comms console
  const stationX = POSITIONS.SPOTY_STATION.x * PS;
  const stationY = POSITIONS.SPOTY_STATION.y * PS;
  const bubbleX = stationX + 30 * PS;
  const bubbleY = stationY - 12 * PS;

  // Measure text to size the bubble
  const fontSize = PS * 2.5;
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  const noteText = "\u266A";
  const artistText = currentTrack.artist;
  const titleText = currentTrack.title;

  // Truncate long text
  const maxChars = 18;
  const truncArtist = artistText.length > maxChars ? artistText.slice(0, maxChars - 1) + "\u2026" : artistText;
  const truncTitle = titleText.length > maxChars ? titleText.slice(0, maxChars - 1) + "\u2026" : titleText;

  const line1 = `${noteText} ${truncArtist}`;
  const line2 = truncTitle;
  const line1Width = ctx.measureText(line1).width;
  const line2Width = ctx.measureText(line2).width;
  const textWidth = Math.max(line1Width, line2Width);

  const padX = 6;
  const padY = 5;
  const lineHeight = fontSize + 2;
  const bubbleW = textWidth + padX * 2;
  const bubbleH = lineHeight * 2 + padY * 2;
  const radius = 6;

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

  // Bubble body — rounded rectangle
  const bx = bubbleX - bubbleW / 2;
  const by = bubbleY - bubbleH / 2;

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

  // Text
  ctx.fillStyle = COLORS.spotifyGreen;
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const textCenterX = bubbleX;
  const textTopY = bubbleY - lineHeight / 2;
  ctx.fillText(line1, textCenterX, textTopY);
  ctx.fillText(line2, textCenterX, textTopY + lineHeight);

  ctx.restore();
}
