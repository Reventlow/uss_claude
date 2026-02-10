import { POSITIONS, VIEWSCREEN } from "@uss-claude/shared";

/** Rectangle in grid coordinates */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Station console on the bridge */
export interface StationRect extends Rect {
  label: string;
}

/** Bridge floor bounds (oval approximation using rectangles) */
export const FLOOR_RECTS: Rect[] = [
  { x: 60, y: 8, w: 120, h: 10 }, // Top near viewscreen
  { x: 40, y: 18, w: 160, h: 20 }, // Upper
  { x: 30, y: 38, w: 180, h: 30 }, // Upper-mid
  { x: 25, y: 68, w: 190, h: 40 }, // Mid
  { x: 30, y: 108, w: 180, h: 30 }, // Lower-mid
  { x: 40, y: 138, w: 160, h: 30 }, // Lower
  { x: 60, y: 168, w: 120, h: 20 }, // Bottom near door
  { x: 80, y: 188, w: 80, h: 12 }, // Doorway area
];

/** Wall segments (slightly outside floor) */
export const WALL_RECTS: Rect[] = [
  { x: 55, y: 5, w: 130, h: 3 },
  { x: 35, y: 15, w: 20, h: 55 },
  { x: 185, y: 15, w: 20, h: 55 },
  { x: 20, y: 65, w: 10, h: 50 },
  { x: 210, y: 65, w: 10, h: 50 },
  { x: 25, y: 105, w: 15, h: 35 },
  { x: 200, y: 105, w: 15, h: 35 },
  { x: 35, y: 135, w: 20, h: 35 },
  { x: 185, y: 135, w: 20, h: 35 },
  { x: 55, y: 165, w: 25, h: 25 },
  { x: 160, y: 165, w: 25, h: 25 },
];

/** Station consoles */
export const STATIONS: StationRect[] = [
  {
    x: POSITIONS.GLASS_STATION.x - 8,
    y: POSITIONS.GLASS_STATION.y - 4,
    w: 16,
    h: 8,
    label: "COMMS",
  },
  {
    x: POSITIONS.FIZBAN_STATION.x - 8,
    y: POSITIONS.FIZBAN_STATION.y - 4,
    w: 16,
    h: 8,
    label: "SCI",
  },
  {
    x: POSITIONS.JASPER_STATION.x - 8,
    y: POSITIONS.JASPER_STATION.y - 4,
    w: 16,
    h: 8,
    label: "OPS",
  },
];

/** Captain's chair */
export const CAPTAIN_CHAIR: Rect = {
  x: POSITIONS.CAPTAIN_CHAIR.x - 6,
  y: POSITIONS.CAPTAIN_CHAIR.y - 4,
  w: 12,
  h: 8,
};

/** Railing between officer area and command area */
export const RAILING: Rect = {
  x: 50,
  y: 128,
  w: 140,
  h: 2,
};

/** Turbolift door */
export const DOOR: Rect = {
  x: POSITIONS.DOOR.x - 10,
  y: POSITIONS.DOOR.y - 4,
  w: 20,
  h: 8,
};

/** Viewscreen area */
export const VIEWSCREEN_RECT: Rect = {
  x: VIEWSCREEN.X,
  y: VIEWSCREEN.Y,
  w: VIEWSCREEN.WIDTH,
  h: VIEWSCREEN.HEIGHT,
};
