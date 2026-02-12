import type { Point } from "./types.js";

// --- Timing constants (in milliseconds) ---

export const TIMING = {
  /** WebSocket heartbeat interval */
  HEARTBEAT_INTERVAL: 15_000,
  /** Server considers laptop offline after this long without heartbeat */
  HEARTBEAT_TIMEOUT: 30_000,
  /** Server considers Claude inactive after this long without MCP event */
  IDLE_TIMEOUT: 60_000,
  /** Pun interval range when captain is present (ms) */
  PUN_INTERVAL_MIN: 20_000,
  PUN_INTERVAL_MAX: 30_000,
  /** Gossip interval range when captain is absent (ms) */
  GOSSIP_INTERVAL_MIN: 15_000,
  GOSSIP_INTERVAL_MAX: 25_000,
  /** Number of gossips before Dorte appears */
  DORTE_THRESHOLD_MIN: 3,
  DORTE_THRESHOLD_MAX: 5,
  /** How long a speech bubble stays visible (ms) */
  SPEECH_BUBBLE_DURATION: 4_000,
  /** How long an officer works at station before reporting (ms) */
  WORK_DURATION: 2_000,
  /** How long an officer reports to the captain (ms) */
  REPORT_DURATION: 2_000,
  /** How long Dorte scolds (ms) */
  SCOLD_DURATION: 4_000,
  /** Calvin listen animation duration (ms) */
  LISTEN_DURATION: 2_500,
  /** Auto-complete an officer stuck in WALKING_TO_STATION or WORKING (ms) */
  STUCK_TIMEOUT: 30_000,
  /** Dance animation frame cycle interval (ms) */
  DANCE_FRAME_INTERVAL: 300,
  /** Cameo event interval when captain is present (13 minutes) */
  CAMEO_INTERVAL: 780_000,
  /** How long the cameo character speaks (ms) */
  CAMEO_SPEAK_DURATION: 4_000,
  /** How long officers yell "GET OUT!" (ms) */
  CAMEO_REACTION_DURATION: 3_000,
  /** How long Dorte speaks during a cameo (ms) */
  CAMEO_DORTE_SPEAK_DURATION: 5_000,
  /** How long the cameo character repeats their corrected line (ms) */
  CAMEO_REPEAT_DURATION: 4_000,
  /** Disco ball descent duration (ms) */
  DISCO_BALL_DROP_DURATION: 2_000,
  /** Disco main dance phase duration (ms) */
  DISCO_DANCE_DURATION: 55_000,
  /** Disco ball ascent duration (ms) */
  DISCO_BALL_RAISE_DURATION: 3_000,
  /** Total disco event duration (ms) */
  DISCO_TOTAL_DURATION: 60_000,
  /** Time between disco speech bubbles (ms) */
  DISCO_BUBBLE_INTERVAL: 5_000,
  /** Trending chart refresh interval (ms) — 1 hour */
  DISCO_CHART_REFRESH: 3_600_000,
} as const;

// --- Grid constants ---

export const GRID = {
  /** Bridge grid width in logical pixels */
  WIDTH: 240,
  /** Bridge grid height in logical pixels */
  HEIGHT: 200,
  /** Scale factor from grid to screen pixels */
  PIXEL_SIZE: 3,
  /** Character sprite width in grid pixels */
  CHAR_WIDTH: 8,
  /** Character sprite height in grid pixels */
  CHAR_HEIGHT: 12,
  /** Walk speed in grid pixels per second */
  WALK_SPEED: 30,
} as const;

// --- Bridge positions (grid coordinates) ---

export const POSITIONS = {
  /** Captain's chair center */
  CAPTAIN_CHAIR: { x: 120, y: 150 } as Point,
  /** Turbolift door center */
  DOOR: { x: 120, y: 190 } as Point,
  /** Bridge entrance point (just inside from door) */
  ENTRANCE: { x: 120, y: 182 } as Point,

  // Officer stations (consoles)
  SPOTY_STATION: { x: 50, y: 70 } as Point,
  GLASS_STATION: { x: 50, y: 110 } as Point,
  FIZBAN_STATION: { x: 190, y: 70 } as Point,
  JASPER_STATION: { x: 120, y: 100 } as Point,

  // Officer idle positions (near their stations)
  SPOTY_IDLE: { x: 45, y: 85 } as Point,
  GLASS_IDLE: { x: 55, y: 125 } as Point,
  FIZBAN_IDLE: { x: 185, y: 85 } as Point,
  JASPER_IDLE: { x: 125, y: 115 } as Point,

  // Report positions (in front of captain, offset left to avoid overlap)
  REPORT_SPOT: { x: 100, y: 138 } as Point,

  // Dorte scolding position (offset left of captain)
  DORTE_SCOLD: { x: 95, y: 125 } as Point,

  // Cameo stop position (offset left of captain)
  CAMEO_STOP: { x: 100, y: 140 } as Point,

  // Wander bounds
  WANDER_MIN: { x: 40, y: 60 } as Point,
  WANDER_MAX: { x: 200, y: 170 } as Point,

  // Disco dance floor positions (center of bridge)
  DISCO_SPOTS: [
    { x: 100, y: 135 },  // Dance spot 1 (Glass)
    { x: 115, y: 140 },  // Dance spot 2 (Fizban)
    { x: 130, y: 135 },  // Dance spot 3 (Jasper)
    { x: 140, y: 140 },  // Dance spot 4 (Spoty)
    { x: 110, y: 150 },  // Dance spot 5 (Calvin)
    { x: 95, y: 145 },   // Dance spot 6 (Dorte)
  ] as Point[],
} as const;

// --- Captain ping parameters ---

export const CAPTAIN_PING = {
  /** Ping interval in milliseconds (2 minutes) */
  INTERVAL: 120_000,
  /** Number of consecutive missed pongs before captain leaves */
  MISS_THRESHOLD: 2,
} as const;

// --- Reconnection parameters ---

export const RECONNECT = {
  /** Initial reconnect delay (ms) */
  INITIAL_DELAY: 1_000,
  /** Maximum reconnect delay (ms) */
  MAX_DELAY: 60_000,
  /** Backoff multiplier */
  MULTIPLIER: 2,
} as const;

// --- Viewscreen ---

export const VIEWSCREEN = {
  /** Number of stars in parallax field */
  STAR_COUNT: 50,
  /** Viewscreen bounds */
  X: 40,
  Y: 8,
  WIDTH: 160,
  HEIGHT: 40,
} as const;
