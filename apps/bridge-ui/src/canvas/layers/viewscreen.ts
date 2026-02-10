import { GRID, VIEWSCREEN, BridgeAtmosphere } from "@uss-claude/shared";

const PS = GRID.PIXEL_SIZE;

interface Star {
  x: number;
  y: number;
  speed: number;
  brightness: number;
  size: number;
}

let stars: Star[] = [];
let initialized = false;

function initStars(): void {
  if (initialized) return;
  stars = [];
  for (let i = 0; i < VIEWSCREEN.STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * VIEWSCREEN.WIDTH,
      y: Math.random() * VIEWSCREEN.HEIGHT,
      speed: 0.5 + Math.random() * 2,
      brightness: 0.3 + Math.random() * 0.7,
      size: Math.random() > 0.8 ? 2 : 1,
    });
  }
  initialized = true;
}

/** Draw the viewscreen with parallax starfield */
export function drawViewscreen(
  ctx: CanvasRenderingContext2D,
  atmosphere: BridgeAtmosphere,
  deltaMs: number,
): void {
  initStars();

  const vx = VIEWSCREEN.X * PS;
  const vy = VIEWSCREEN.Y * PS;
  const vw = VIEWSCREEN.WIDTH * PS;
  const vh = VIEWSCREEN.HEIGHT * PS;

  ctx.save();
  ctx.beginPath();
  ctx.rect(vx, vy, vw, vh);
  ctx.clip();

  // Background
  ctx.fillStyle = "#000011";
  ctx.fillRect(vx, vy, vw, vh);

  if (atmosphere === BridgeAtmosphere.OFFLINE) {
    // Static noise effect
    drawNoise(ctx, vx, vy, vw, vh);
  } else {
    // Speed multiplier based on atmosphere
    const speedMul = atmosphere === BridgeAtmosphere.ACTIVE ? 3 : 1;
    const deltaS = deltaMs / 1000;

    // Update and draw stars
    for (const star of stars) {
      star.x -= star.speed * speedMul * deltaS * 20;
      if (star.x < 0) {
        star.x = VIEWSCREEN.WIDTH;
        star.y = Math.random() * VIEWSCREEN.HEIGHT;
      }

      const alpha = star.brightness;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(
        vx + star.x * PS,
        vy + star.y * PS,
        star.size * PS,
        PS,
      );
    }

    // Active glow effect
    if (atmosphere === BridgeAtmosphere.ACTIVE) {
      const gradient = ctx.createRadialGradient(
        vx + vw / 2, vy + vh / 2, 0,
        vx + vw / 2, vy + vh / 2, vw / 2,
      );
      gradient.addColorStop(0, "rgba(100, 200, 255, 0.08)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(vx, vy, vw, vh);
    }
  }

  ctx.restore();
}

/** Draw static noise for offline viewscreen */
function drawNoise(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const step = PS * 2;
  for (let py = y; py < y + h; py += step) {
    for (let px = x; px < x + w; px += step) {
      const v = Math.floor(Math.random() * 40);
      ctx.fillStyle = `rgb(${v},${v},${v + 10})`;
      ctx.fillRect(px, py, step, step);
    }
  }
}
