import { GRID, DiscoState } from "@uss-claude/shared";

const PS = GRID.PIXEL_SIZE;
const BALL_SIZE = 10; // grid pixels
const BALL_CENTER_X = 120; // center of bridge
const BALL_REST_Y = 55; // target Y when fully dropped (above characters)
const BALL_START_Y = -15; // off screen

const DISCO_COLORS = [
  "#FF0066", "#FF6600", "#FFCC00", "#00FF66", "#0066FF", "#CC00FF",
  "#FF3399", "#FF9933", "#FFFF00", "#33FF99", "#3399FF", "#FF33CC",
];

/** Draw the disco ball and light effects */
export function drawDiscoBall(
  ctx: CanvasRenderingContext2D,
  discoState: DiscoState,
  timer: number,
  maxTimer: number,
  deltaMs: number,
): void {
  if (discoState === DiscoState.INACTIVE) return;

  // Calculate ball Y position based on phase
  let ballY: number;
  const progress = 1 - (timer / maxTimer); // 0->1 as phase progresses

  switch (discoState) {
    case DiscoState.DROPPING_BALL:
      ballY = BALL_START_Y + (BALL_REST_Y - BALL_START_Y) * easeOutBounce(progress);
      break;
    case DiscoState.DANCING:
      ballY = BALL_REST_Y;
      break;
    case DiscoState.RAISING_BALL:
      ballY = BALL_REST_Y + (BALL_START_Y - BALL_REST_Y) * easeInQuad(progress);
      break;
    default:
      return;
  }

  const cx = BALL_CENTER_X * PS;
  const cy = ballY * PS;
  const r = (BALL_SIZE / 2) * PS;

  ctx.save();

  // Draw light rays during DANCING
  if (discoState === DiscoState.DANCING) {
    const time = Date.now() / 200;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + time * 0.3;
      const color = DISCO_COLORS[(i + Math.floor(time)) % DISCO_COLORS.length];
      const rayLen = 60 * PS;

      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 * PS;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * rayLen, cy + Math.sin(angle) * rayLen);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Draw string from ceiling to ball
  ctx.strokeStyle = "#888888";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, cy - r);
  ctx.stroke();

  // Draw ball body (circle made of pixel blocks)
  const gridR = BALL_SIZE / 2;
  for (let dy = -gridR; dy <= gridR; dy++) {
    for (let dx = -gridR; dx <= gridR; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > gridR) continue;

      // Determine facet color
      let color: string;
      if (discoState === DiscoState.DANCING) {
        const time = Date.now() / 300;
        const facetIndex = Math.abs(dx * 3 + dy * 7 + Math.floor(time)) % DISCO_COLORS.length;
        color = DISCO_COLORS[facetIndex];
      } else {
        // Silver/gray when not dancing
        const shade = 150 + Math.floor((1 - dist / gridR) * 80);
        color = `rgb(${shade}, ${shade}, ${shade + 20})`;
      }

      ctx.fillStyle = color;
      ctx.fillRect(
        cx + dx * PS - PS / 2,
        cy + dy * PS - PS / 2,
        PS,
        PS,
      );
    }
  }

  // Highlight spot (specular reflection)
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillRect(cx - 2 * PS, cy - 2 * PS, PS, PS);
  ctx.fillRect(cx - 1 * PS, cy - 3 * PS, PS, PS);

  ctx.restore();
}

function easeOutBounce(t: number): number {
  if (t < 1 / 2.75) return 7.5625 * t * t;
  if (t < 2 / 2.75) { t -= 1.5 / 2.75; return 7.5625 * t * t + 0.75; }
  if (t < 2.5 / 2.75) { t -= 2.25 / 2.75; return 7.5625 * t * t + 0.9375; }
  t -= 2.625 / 2.75;
  return 7.5625 * t * t + 0.984375;
}

function easeInQuad(t: number): number {
  return t * t;
}
