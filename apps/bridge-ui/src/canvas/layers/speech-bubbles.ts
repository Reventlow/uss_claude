import { GRID, type CharacterRenderState } from "@uss-claude/shared";
import { COLORS } from "../sprites/colors.js";

const PS = GRID.PIXEL_SIZE;

/** Draw speech bubbles for all characters that have active speech */
export function drawSpeechBubbles(
  ctx: CanvasRenderingContext2D,
  characters: CharacterRenderState[],
  discoMode?: boolean,
): void {
  for (const char of characters) {
    if (!char.visible || !char.speechBubble) continue;
    drawBubble(ctx, char.speechBubble, char.position.x, char.position.y, discoMode);
  }
}

/** Draw a single speech bubble above a character */
function drawBubble(
  ctx: CanvasRenderingContext2D,
  text: string,
  gridX: number,
  gridY: number,
  discoMode?: boolean,
): void {
  ctx.save();
  const fontSize = discoMode ? PS * 5.5 : PS * 2.5;
  ctx.font = discoMode
    ? `${fontSize}px "Dekko", cursive`
    : `${fontSize}px "Press Start 2P", monospace`;

  // Measure text and wrap if needed
  const maxWidth = 150 * PS;
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  const lineHeight = discoMode ? PS * 6 : PS * 4;
  const padding = PS * 2;
  let bubbleWidth = 0;
  for (const line of lines) {
    const w = ctx.measureText(line).width;
    if (w > bubbleWidth) bubbleWidth = w;
  }
  bubbleWidth += padding * 2;
  const bubbleHeight = lines.length * lineHeight + padding * 2;

  // Position: centered above the character
  const bx = gridX * PS - bubbleWidth / 2;
  const by = (gridY - GRID.CHAR_HEIGHT / 2) * PS - bubbleHeight - PS * 4;

  // Clamp to canvas bounds
  const clampedX = Math.max(PS, Math.min(bx, GRID.WIDTH * PS - bubbleWidth - PS));
  const clampedY = Math.max(PS, by);

  // Draw bubble background
  ctx.fillStyle = COLORS.bubbleBg;
  ctx.strokeStyle = COLORS.bubbleBorder;
  ctx.lineWidth = PS;

  // Rounded rectangle
  const radius = PS * 2;
  ctx.beginPath();
  ctx.moveTo(clampedX + radius, clampedY);
  ctx.lineTo(clampedX + bubbleWidth - radius, clampedY);
  ctx.quadraticCurveTo(clampedX + bubbleWidth, clampedY, clampedX + bubbleWidth, clampedY + radius);
  ctx.lineTo(clampedX + bubbleWidth, clampedY + bubbleHeight - radius);
  ctx.quadraticCurveTo(
    clampedX + bubbleWidth,
    clampedY + bubbleHeight,
    clampedX + bubbleWidth - radius,
    clampedY + bubbleHeight,
  );
  ctx.lineTo(clampedX + radius, clampedY + bubbleHeight);
  ctx.quadraticCurveTo(clampedX, clampedY + bubbleHeight, clampedX, clampedY + bubbleHeight - radius);
  ctx.lineTo(clampedX, clampedY + radius);
  ctx.quadraticCurveTo(clampedX, clampedY, clampedX + radius, clampedY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Draw tail pointing down toward character
  const tailX = gridX * PS;
  const tailY = clampedY + bubbleHeight;
  ctx.beginPath();
  ctx.moveTo(tailX - PS * 2, tailY);
  ctx.lineTo(tailX, tailY + PS * 3);
  ctx.lineTo(tailX + PS * 2, tailY);
  ctx.closePath();
  ctx.fillStyle = COLORS.bubbleBg;
  ctx.fill();
  ctx.stroke();
  // Cover the border between bubble and tail
  ctx.fillStyle = COLORS.bubbleBg;
  ctx.fillRect(tailX - PS * 2 + PS, tailY - PS, PS * 4 - PS * 2, PS * 2);

  // Draw text
  ctx.fillStyle = COLORS.bubbleText;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], clampedX + padding, clampedY + padding + i * lineHeight);
  }

  ctx.restore();
}
