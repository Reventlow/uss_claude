import { GRID, BridgeAtmosphere } from "@uss-claude/shared";
import { COLORS } from "../sprites/colors.js";
import {
  FLOOR_RECTS,
  WALL_RECTS,
  STATIONS,
  CAPTAIN_CHAIR,
  RAILING,
  DOOR,
  VIEWSCREEN_RECT,
} from "../bridge-map.js";

const PS = GRID.PIXEL_SIZE;

let cachedCanvas: OffscreenCanvas | null = null;
let cachedAtmosphere: BridgeAtmosphere | null = null;

/** Draw a grid-space rectangle onto a context */
function fillRect(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.fillRect(x * PS, y * PS, w * PS, h * PS);
}

/** Draw the bridge background onto an OffscreenCanvas, cached per atmosphere */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  atmosphere: BridgeAtmosphere,
): void {
  // Return cached version if atmosphere hasn't changed
  if (cachedCanvas && cachedAtmosphere === atmosphere) {
    ctx.drawImage(cachedCanvas, 0, 0);
    return;
  }

  const offscreen = new OffscreenCanvas(GRID.WIDTH * PS, GRID.HEIGHT * PS);
  const oc = offscreen.getContext("2d")!;
  oc.imageSmoothingEnabled = false;

  // Brightness factor based on atmosphere
  const brightness =
    atmosphere === BridgeAtmosphere.OFFLINE ? 0.6 :
    atmosphere === BridgeAtmosphere.STANDBY ? 0.85 : 1.0;

  // Background
  oc.fillStyle = COLORS.bg;
  oc.fillRect(0, 0, GRID.WIDTH * PS, GRID.HEIGHT * PS);

  // Floor
  oc.fillStyle = applyBrightness(COLORS.floor, brightness);
  for (const r of FLOOR_RECTS) {
    fillRect(oc, r.x, r.y, r.w, r.h);
  }

  // Floor detail - lighter patches
  oc.fillStyle = applyBrightness(COLORS.floorLight, brightness);
  for (const r of FLOOR_RECTS) {
    fillRect(oc, r.x + 2, r.y + 1, r.w - 4, r.h - 2);
  }

  // Walls
  oc.fillStyle = applyBrightness(COLORS.wall, brightness);
  for (const r of WALL_RECTS) {
    fillRect(oc, r.x, r.y, r.w, r.h);
  }

  // Viewscreen frame
  oc.fillStyle = applyBrightness(COLORS.viewscreenFrame, brightness);
  fillRect(
    oc,
    VIEWSCREEN_RECT.x - 2,
    VIEWSCREEN_RECT.y - 2,
    VIEWSCREEN_RECT.w + 4,
    VIEWSCREEN_RECT.h + 4,
  );
  oc.fillStyle = COLORS.viewscreenBg;
  fillRect(oc, VIEWSCREEN_RECT.x, VIEWSCREEN_RECT.y, VIEWSCREEN_RECT.w, VIEWSCREEN_RECT.h);

  // Stations
  for (const s of STATIONS) {
    oc.fillStyle = applyBrightness(COLORS.station, brightness);
    fillRect(oc, s.x, s.y, s.w, s.h);
    // Screen on the console
    const screenActive = atmosphere === BridgeAtmosphere.ACTIVE;
    oc.fillStyle = applyBrightness(
      screenActive ? COLORS.stationScreenActive : COLORS.stationScreen,
      brightness,
    );
    fillRect(oc, s.x + 2, s.y + 1, s.w - 4, s.h - 3);

    // Station label above the console
    oc.fillStyle = applyBrightness(COLORS.orange, brightness);
    oc.font = `${PS * 3}px "Press Start 2P", monospace`;
    oc.textAlign = "center";
    oc.textBaseline = "bottom";
    oc.fillText(s.label, (s.x + s.w / 2) * PS, (s.y - 1) * PS);
  }

  // Railing
  oc.fillStyle = applyBrightness(COLORS.railing, brightness);
  fillRect(oc, RAILING.x, RAILING.y, RAILING.w, RAILING.h);

  // Captain's chair
  oc.fillStyle = applyBrightness(COLORS.chair, brightness);
  fillRect(oc, CAPTAIN_CHAIR.x, CAPTAIN_CHAIR.y, CAPTAIN_CHAIR.w, CAPTAIN_CHAIR.h);
  oc.fillStyle = applyBrightness(COLORS.chairSeat, brightness);
  fillRect(oc, CAPTAIN_CHAIR.x + 2, CAPTAIN_CHAIR.y + 1, CAPTAIN_CHAIR.w - 4, CAPTAIN_CHAIR.h - 2);

  // Turbolift door
  oc.fillStyle = applyBrightness(COLORS.doorFrame, brightness);
  fillRect(oc, DOOR.x - 1, DOOR.y - 1, DOOR.w + 2, DOOR.h + 2);
  oc.fillStyle = applyBrightness(COLORS.door, brightness);
  fillRect(oc, DOOR.x, DOOR.y, DOOR.w, DOOR.h);
  // Door split
  oc.fillStyle = applyBrightness(COLORS.bg, 1);
  fillRect(oc, DOOR.x + DOOR.w / 2, DOOR.y, 1, DOOR.h);

  // Cache
  cachedCanvas = offscreen;
  cachedAtmosphere = atmosphere;

  ctx.drawImage(offscreen, 0, 0);
}

/** Apply a brightness multiplier to a hex color */
function applyBrightness(hex: string, brightness: number): string {
  if (brightness >= 1) return hex;
  // Handle rgba colors
  if (hex.startsWith("rgba")) return hex;

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.round(r * brightness);
  const ng = Math.round(g * brightness);
  const nb = Math.round(b * brightness);
  return `rgb(${nr},${ng},${nb})`;
}

/** Invalidate the background cache (call when atmosphere changes) */
export function invalidateBackgroundCache(): void {
  cachedCanvas = null;
  cachedAtmosphere = null;
}
