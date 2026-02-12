/** LCARS color palette for canvas rendering */
export const COLORS = {
  orange: "#FF9900",
  mauve: "#CC99CC",
  periwinkle: "#9999FF",
  salmon: "#FF9966",
  gold: "#FFCC66",
  red: "#CC6666",
  blue: "#9999CC",
  bg: "#000000",

  // Bridge structure
  floor: "#1A1A2E",
  floorLight: "#22223A",
  wall: "#2A2A3E",
  station: "#334",
  stationScreen: "#226644",
  stationScreenActive: "#33FF88",
  railing: "#444466",
  chair: "#553322",
  chairSeat: "#664433",
  door: "#555577",
  doorFrame: "#666688",
  viewscreenFrame: "#333355",
  viewscreenBg: "#000011",

  // Character skin/hair
  skin: "#FFCC99",
  skinDark: "#DDAA77",
  hair: "#553311",

  // Uniform divisions
  uniformGold: "#FFCC00",
  uniformGoldDark: "#CC9900",
  uniformBlue: "#6688CC",
  uniformBlueDark: "#4466AA",
  uniformRedOrange: "#DD6633",
  uniformRedOrangeDark: "#BB4411",
  uniformGray: "#888888",
  uniformGrayDark: "#666666",

  // Captain insignia
  captainPip: "#FFFFFF",

  // Spotify accent
  spotifyGreen: "#1DB954",

  // Speech bubbles
  bubbleBg: "#FFFFFF",
  bubbleBorder: "#000000",
  bubbleText: "#000000",

  // CRT effects
  scanline: "rgba(0, 0, 0, 0.15)",
  glow: "rgba(100, 200, 255, 0.05)",
  glowActive: "rgba(100, 200, 255, 0.12)",
} as const;
