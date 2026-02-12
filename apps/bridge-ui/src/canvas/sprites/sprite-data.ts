import type { CharacterName, Direction } from "@uss-claude/shared";
import { COLORS } from "./colors.js";
import { CAMEO_SPRITES } from "./cameo-sprites.js";

/**
 * Sprite pixel data: 2D color arrays (8 wide x 12 tall).
 * null = transparent pixel.
 */
export type SpriteFrame = (string | null)[][];

export interface SpriteSet {
  up: [SpriteFrame, SpriteFrame, SpriteFrame];
  down: [SpriteFrame, SpriteFrame, SpriteFrame];
  left: [SpriteFrame, SpriteFrame, SpriteFrame];
  right: [SpriteFrame, SpriteFrame, SpriteFrame];
}

export interface CharacterSprites {
  walk: SpriteSet;
  seated?: SpriteFrame; // Only Calvin has a seated variant
  dance?: SpriteFrame[]; // Dance animation frames (Spoty)
}

const _ = null; // Shorthand for transparent
const S = COLORS.skin;
const D = COLORS.skinDark;
const H = COLORS.hair;

// --- Glass (Comms Officer, Gold uniform) ---
const GU = COLORS.uniformGold;
const GD = COLORS.uniformGoldDark;

function makeGlassDown(frame: number): SpriteFrame {
  const legL = frame === 1 ? GD : frame === 2 ? _ : GD;
  const legR = frame === 1 ? _ : frame === 2 ? GD : GD;
  return [
    [_, _, H, H, H, H, _, _],
    [_, H, H, H, H, H, H, _],
    [_, S, S, S, S, S, S, _],
    [_, S, D, S, S, D, S, _],
    [_, _, S, S, S, S, _, _],
    [_, GU, GU, GU, GU, GU, GU, _],
    [_, GU, GU, GU, GU, GU, GU, _],
    [_, GD, GU, GU, GU, GU, GD, _],
    [_, _, GD, GU, GU, GD, _, _],
    [_, _, GD, _, _, GD, _, _],
    [_, legL, GD, _, _, GD, legR, _],
    [_, _, GD, _, _, GD, _, _],
  ];
}

function makeGlassUp(frame: number): SpriteFrame {
  const legL = frame === 1 ? GD : frame === 2 ? _ : GD;
  const legR = frame === 1 ? _ : frame === 2 ? GD : GD;
  return [
    [_, _, H, H, H, H, _, _],
    [_, H, H, H, H, H, H, _],
    [_, H, H, H, H, H, H, _],
    [_, H, H, H, H, H, H, _],
    [_, _, H, H, H, H, _, _],
    [_, GU, GU, GU, GU, GU, GU, _],
    [_, GU, GU, GU, GU, GU, GU, _],
    [_, GD, GU, GU, GU, GU, GD, _],
    [_, _, GD, GU, GU, GD, _, _],
    [_, _, GD, _, _, GD, _, _],
    [_, legL, GD, _, _, GD, legR, _],
    [_, _, GD, _, _, GD, _, _],
  ];
}

function makeGlassLeft(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, H, H, H, _, _, _],
    [_, H, H, H, H, H, _, _],
    [_, S, S, S, S, _, _, _],
    [_, D, S, S, S, _, _, _],
    [_, _, S, S, _, _, _, _],
    [_, GU, GU, GU, GU, _, _, _],
    [_, GU, GU, GU, GU, GU, _, _],
    [GD, GU, GU, GU, GU, _, _, _],
    [_, GD, GD, GU, _, _, _, _],
    [_, _, GD, _, GD, _, _, _],
    [_, legOff >= 0 ? GD : _, GD, _, GD, legOff > 0 ? GD : _, _, _],
    [_, _, GD, _, GD, _, _, _],
  ];
}

function makeGlassRight(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, _, H, H, H, _, _],
    [_, _, H, H, H, H, H, _],
    [_, _, _, S, S, S, S, _],
    [_, _, _, S, S, S, D, _],
    [_, _, _, _, S, S, _, _],
    [_, _, _, GU, GU, GU, GU, _],
    [_, _, GU, GU, GU, GU, GU, _],
    [_, _, _, GU, GU, GU, GU, GD],
    [_, _, _, _, GU, GD, GD, _],
    [_, _, _, GD, _, GD, _, _],
    [_, _, legOff > 0 ? GD : _, GD, _, GD, legOff >= 0 ? GD : _, _],
    [_, _, _, GD, _, GD, _, _],
  ];
}

// --- Fizban (Science Officer, Blue uniform) ---
const BU = COLORS.uniformBlue;
const BD = COLORS.uniformBlueDark;

function makeFizbanDown(frame: number): SpriteFrame {
  const legL = frame === 1 ? BD : frame === 2 ? _ : BD;
  const legR = frame === 1 ? _ : frame === 2 ? BD : BD;
  return [
    [_, _, H, H, H, H, _, _],
    [_, H, H, H, H, H, H, _],
    [_, S, S, S, S, S, S, _],
    [_, S, D, S, S, D, S, _],
    [_, _, S, S, S, S, _, _],
    [_, BU, BU, BU, BU, BU, BU, _],
    [_, BU, BU, BU, BU, BU, BU, _],
    [_, BD, BU, BU, BU, BU, BD, _],
    [_, _, BD, BU, BU, BD, _, _],
    [_, _, BD, _, _, BD, _, _],
    [_, legL, BD, _, _, BD, legR, _],
    [_, _, BD, _, _, BD, _, _],
  ];
}

function makeFizbanUp(frame: number): SpriteFrame {
  const legL = frame === 1 ? BD : frame === 2 ? _ : BD;
  const legR = frame === 1 ? _ : frame === 2 ? BD : BD;
  return [
    [_, _, H, H, H, H, _, _],
    [_, H, H, H, H, H, H, _],
    [_, H, H, H, H, H, H, _],
    [_, H, H, H, H, H, H, _],
    [_, _, H, H, H, H, _, _],
    [_, BU, BU, BU, BU, BU, BU, _],
    [_, BU, BU, BU, BU, BU, BU, _],
    [_, BD, BU, BU, BU, BU, BD, _],
    [_, _, BD, BU, BU, BD, _, _],
    [_, _, BD, _, _, BD, _, _],
    [_, legL, BD, _, _, BD, legR, _],
    [_, _, BD, _, _, BD, _, _],
  ];
}

function makeFizbanLeft(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, H, H, H, _, _, _],
    [_, H, H, H, H, H, _, _],
    [_, S, S, S, S, _, _, _],
    [_, D, S, S, S, _, _, _],
    [_, _, S, S, _, _, _, _],
    [_, BU, BU, BU, BU, _, _, _],
    [_, BU, BU, BU, BU, BU, _, _],
    [BD, BU, BU, BU, BU, _, _, _],
    [_, BD, BD, BU, _, _, _, _],
    [_, _, BD, _, BD, _, _, _],
    [_, legOff >= 0 ? BD : _, BD, _, BD, legOff > 0 ? BD : _, _, _],
    [_, _, BD, _, BD, _, _, _],
  ];
}

function makeFizbanRight(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, _, H, H, H, _, _],
    [_, _, H, H, H, H, H, _],
    [_, _, _, S, S, S, S, _],
    [_, _, _, S, S, S, D, _],
    [_, _, _, _, S, S, _, _],
    [_, _, _, BU, BU, BU, BU, _],
    [_, _, BU, BU, BU, BU, BU, _],
    [_, _, _, BU, BU, BU, BU, BD],
    [_, _, _, _, BU, BD, BD, _],
    [_, _, _, BD, _, BD, _, _],
    [_, _, legOff > 0 ? BD : _, BD, _, BD, legOff >= 0 ? BD : _, _],
    [_, _, _, BD, _, BD, _, _],
  ];
}

// --- Jasper (Ops Officer, Red-Orange uniform) ---
const RU = COLORS.uniformRedOrange;
const RD = COLORS.uniformRedOrangeDark;

function makeJasperDown(frame: number): SpriteFrame {
  const legL = frame === 1 ? RD : frame === 2 ? _ : RD;
  const legR = frame === 1 ? _ : frame === 2 ? RD : RD;
  return [
    [_, _, H, H, H, H, _, _],
    [_, H, H, H, H, H, H, _],
    [_, S, S, S, S, S, S, _],
    [_, S, D, S, S, D, S, _],
    [_, _, S, S, S, S, _, _],
    [_, RU, RU, RU, RU, RU, RU, _],
    [_, RU, RU, RU, RU, RU, RU, _],
    [_, RD, RU, RU, RU, RU, RD, _],
    [_, _, RD, RU, RU, RD, _, _],
    [_, _, RD, _, _, RD, _, _],
    [_, legL, RD, _, _, RD, legR, _],
    [_, _, RD, _, _, RD, _, _],
  ];
}

function makeJasperUp(frame: number): SpriteFrame {
  const legL = frame === 1 ? RD : frame === 2 ? _ : RD;
  const legR = frame === 1 ? _ : frame === 2 ? RD : RD;
  return [
    [_, _, H, H, H, H, _, _],
    [_, H, H, H, H, H, H, _],
    [_, H, H, H, H, H, H, _],
    [_, H, H, H, H, H, H, _],
    [_, _, H, H, H, H, _, _],
    [_, RU, RU, RU, RU, RU, RU, _],
    [_, RU, RU, RU, RU, RU, RU, _],
    [_, RD, RU, RU, RU, RU, RD, _],
    [_, _, RD, RU, RU, RD, _, _],
    [_, _, RD, _, _, RD, _, _],
    [_, legL, RD, _, _, RD, legR, _],
    [_, _, RD, _, _, RD, _, _],
  ];
}

function makeJasperLeft(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, H, H, H, _, _, _],
    [_, H, H, H, H, H, _, _],
    [_, S, S, S, S, _, _, _],
    [_, D, S, S, S, _, _, _],
    [_, _, S, S, _, _, _, _],
    [_, RU, RU, RU, RU, _, _, _],
    [_, RU, RU, RU, RU, RU, _, _],
    [RD, RU, RU, RU, RU, _, _, _],
    [_, RD, RD, RU, _, _, _, _],
    [_, _, RD, _, RD, _, _, _],
    [_, legOff >= 0 ? RD : _, RD, _, RD, legOff > 0 ? RD : _, _, _],
    [_, _, RD, _, RD, _, _, _],
  ];
}

function makeJasperRight(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, _, H, H, H, _, _],
    [_, _, H, H, H, H, H, _],
    [_, _, _, S, S, S, S, _],
    [_, _, _, S, S, S, D, _],
    [_, _, _, _, S, S, _, _],
    [_, _, _, RU, RU, RU, RU, _],
    [_, _, RU, RU, RU, RU, RU, _],
    [_, _, _, RU, RU, RU, RU, RD],
    [_, _, _, _, RU, RD, RD, _],
    [_, _, _, RD, _, RD, _, _],
    [_, _, legOff > 0 ? RD : _, RD, _, RD, legOff >= 0 ? RD : _, _],
    [_, _, _, RD, _, RD, _, _],
  ];
}

// --- Spoty (Comms Officer, Gold uniform with headphones accent) ---
const SG = COLORS.spotifyGreen; // Headphones accent color

function makeSpotyDown(frame: number): SpriteFrame {
  const legL = frame === 1 ? GD : frame === 2 ? _ : GD;
  const legR = frame === 1 ? _ : frame === 2 ? GD : GD;
  return [
    [_, _, H, H, H, H, _, _],
    [_, H, H, H, H, H, H, _],
    [_, SG, S, S, S, S, SG, _],
    [_, S, D, S, S, D, S, _],
    [_, _, S, S, S, S, _, _],
    [_, GU, GU, GU, GU, GU, GU, _],
    [_, GU, GU, GU, GU, GU, GU, _],
    [_, GD, GU, GU, GU, GU, GD, _],
    [_, _, GD, GU, GU, GD, _, _],
    [_, _, GD, _, _, GD, _, _],
    [_, legL, GD, _, _, GD, legR, _],
    [_, _, GD, _, _, GD, _, _],
  ];
}

function makeSpotyUp(frame: number): SpriteFrame {
  const legL = frame === 1 ? GD : frame === 2 ? _ : GD;
  const legR = frame === 1 ? _ : frame === 2 ? GD : GD;
  return [
    [_, _, H, H, H, H, _, _],
    [_, H, H, H, H, H, H, _],
    [_, SG, H, H, H, H, SG, _],
    [_, H, H, H, H, H, H, _],
    [_, _, H, H, H, H, _, _],
    [_, GU, GU, GU, GU, GU, GU, _],
    [_, GU, GU, GU, GU, GU, GU, _],
    [_, GD, GU, GU, GU, GU, GD, _],
    [_, _, GD, GU, GU, GD, _, _],
    [_, _, GD, _, _, GD, _, _],
    [_, legL, GD, _, _, GD, legR, _],
    [_, _, GD, _, _, GD, _, _],
  ];
}

function makeSpotyLeft(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, H, H, H, _, _, _],
    [_, H, H, H, H, H, _, _],
    [_, SG, S, S, S, _, _, _],
    [_, D, S, S, S, _, _, _],
    [_, _, S, S, _, _, _, _],
    [_, GU, GU, GU, GU, _, _, _],
    [_, GU, GU, GU, GU, GU, _, _],
    [GD, GU, GU, GU, GU, _, _, _],
    [_, GD, GD, GU, _, _, _, _],
    [_, _, GD, _, GD, _, _, _],
    [_, legOff >= 0 ? GD : _, GD, _, GD, legOff > 0 ? GD : _, _, _],
    [_, _, GD, _, GD, _, _, _],
  ];
}

function makeSpotyRight(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, _, H, H, H, _, _],
    [_, _, H, H, H, H, H, _],
    [_, _, _, S, S, S, SG, _],
    [_, _, _, S, S, S, D, _],
    [_, _, _, _, S, S, _, _],
    [_, _, _, GU, GU, GU, GU, _],
    [_, _, GU, GU, GU, GU, GU, _],
    [_, _, _, GU, GU, GU, GU, GD],
    [_, _, _, _, GU, GD, GD, _],
    [_, _, _, GD, _, GD, _, _],
    [_, _, legOff > 0 ? GD : _, GD, _, GD, legOff >= 0 ? GD : _, _],
    [_, _, _, GD, _, GD, _, _],
  ];
}

/** Spoty dance frames — body sway/bob while facing up at console */
function makeSpotyDance(frame: number): SpriteFrame {
  // 4-frame cycle: neutral, lean left, neutral, lean right
  const leanOffset = frame === 1 ? -1 : frame === 3 ? 1 : 0;
  const bobUp = frame === 1 || frame === 3;
  const headY = bobUp ? -1 : 0;
  // Construct a "facing up" frame with lateral sway
  if (leanOffset === -1) {
    // Lean left
    return [
      [_, H, H, H, H, _, _, _],
      [H, H, H, H, H, H, _, _],
      [SG, H, H, H, H, SG, _, _],
      [_, H, H, H, H, _, _, _],
      [_, _, H, H, _, _, _, _],
      [GU, GU, GU, GU, GU, _, _, _],
      [GU, GU, GU, GU, GU, GU, _, _],
      [GD, GU, GU, GU, GU, GD, _, _],
      [_, GD, GU, GU, GD, _, _, _],
      [_, GD, _, _, GD, _, _, _],
      [_, GD, _, _, GD, _, _, _],
      [_, GD, _, _, GD, _, _, _],
    ];
  } else if (leanOffset === 1) {
    // Lean right
    return [
      [_, _, _, H, H, H, H, _],
      [_, _, H, H, H, H, H, H],
      [_, _, SG, H, H, H, H, SG],
      [_, _, _, H, H, H, H, _],
      [_, _, _, _, H, H, _, _],
      [_, _, _, GU, GU, GU, GU, GU],
      [_, _, GU, GU, GU, GU, GU, GU],
      [_, _, GD, GU, GU, GU, GU, GD],
      [_, _, _, GD, GU, GU, GD, _],
      [_, _, _, GD, _, _, GD, _],
      [_, _, _, GD, _, _, GD, _],
      [_, _, _, GD, _, _, GD, _],
    ];
  }
  // Neutral (same as up frame 0 but standing still)
  return [
    [_, _, H, H, H, H, _, _],
    [_, H, H, H, H, H, H, _],
    [_, SG, H, H, H, H, SG, _],
    [_, H, H, H, H, H, H, _],
    [_, _, H, H, H, H, _, _],
    [_, GU, GU, GU, GU, GU, GU, _],
    [_, GU, GU, GU, GU, GU, GU, _],
    [_, GD, GU, GU, GU, GU, GD, _],
    [_, _, GD, GU, GU, GD, _, _],
    [_, _, GD, _, _, GD, _, _],
    [_, _, GD, _, _, GD, _, _],
    [_, _, GD, _, _, GD, _, _],
  ];
}

// --- Calvin (Captain, Gold with pip insignia) ---
const CU = COLORS.uniformGold;
const CD = COLORS.uniformGoldDark;
const CP = COLORS.captainPip;

function makeCalvinDown(frame: number): SpriteFrame {
  const legL = frame === 1 ? CD : frame === 2 ? _ : CD;
  const legR = frame === 1 ? _ : frame === 2 ? CD : CD;
  return [
    [_, _, H, H, H, H, _, _],
    [_, H, H, H, H, H, H, _],
    [_, S, S, S, S, S, S, _],
    [_, S, D, S, S, D, S, _],
    [_, _, S, S, S, S, _, _],
    [_, CU, CP, CU, CU, CP, CU, _],
    [_, CU, CU, CU, CU, CU, CU, _],
    [_, CD, CU, CU, CU, CU, CD, _],
    [_, _, CD, CU, CU, CD, _, _],
    [_, _, CD, _, _, CD, _, _],
    [_, legL, CD, _, _, CD, legR, _],
    [_, _, CD, _, _, CD, _, _],
  ];
}

function makeCalvinUp(frame: number): SpriteFrame {
  const legL = frame === 1 ? CD : frame === 2 ? _ : CD;
  const legR = frame === 1 ? _ : frame === 2 ? CD : CD;
  return [
    [_, _, H, H, H, H, _, _],
    [_, H, H, H, H, H, H, _],
    [_, H, H, H, H, H, H, _],
    [_, H, H, H, H, H, H, _],
    [_, _, H, H, H, H, _, _],
    [_, CU, CP, CU, CU, CP, CU, _],
    [_, CU, CU, CU, CU, CU, CU, _],
    [_, CD, CU, CU, CU, CU, CD, _],
    [_, _, CD, CU, CU, CD, _, _],
    [_, _, CD, _, _, CD, _, _],
    [_, legL, CD, _, _, CD, legR, _],
    [_, _, CD, _, _, CD, _, _],
  ];
}

function makeCalvinLeft(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, H, H, H, _, _, _],
    [_, H, H, H, H, H, _, _],
    [_, S, S, S, S, _, _, _],
    [_, D, S, S, S, _, _, _],
    [_, _, S, S, _, _, _, _],
    [_, CP, CU, CU, CU, _, _, _],
    [_, CU, CU, CU, CU, CU, _, _],
    [CD, CU, CU, CU, CU, _, _, _],
    [_, CD, CD, CU, _, _, _, _],
    [_, _, CD, _, CD, _, _, _],
    [_, legOff >= 0 ? CD : _, CD, _, CD, legOff > 0 ? CD : _, _, _],
    [_, _, CD, _, CD, _, _, _],
  ];
}

function makeCalvinRight(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, _, H, H, H, _, _],
    [_, _, H, H, H, H, H, _],
    [_, _, _, S, S, S, S, _],
    [_, _, _, S, S, S, D, _],
    [_, _, _, _, S, S, _, _],
    [_, _, _, CU, CU, CU, CP, _],
    [_, _, CU, CU, CU, CU, CU, _],
    [_, _, _, CU, CU, CU, CU, CD],
    [_, _, _, _, CU, CD, CD, _],
    [_, _, _, CD, _, CD, _, _],
    [_, _, legOff > 0 ? CD : _, CD, _, CD, legOff >= 0 ? CD : _, _],
    [_, _, _, CD, _, CD, _, _],
  ];
}

/** Calvin seated in the captain's chair (facing down) */
const calvinSeated: SpriteFrame = [
  [_, _, H, H, H, H, _, _],
  [_, H, H, H, H, H, H, _],
  [_, S, S, S, S, S, S, _],
  [_, S, D, S, S, D, S, _],
  [_, _, S, S, S, S, _, _],
  [_, CU, CP, CU, CU, CP, CU, _],
  [_, CU, CU, CU, CU, CU, CU, _],
  [_, CD, CU, CU, CU, CU, CD, _],
  [_, CD, CD, CD, CD, CD, CD, _],
  [_, CD, CD, CD, CD, CD, CD, _],
  [_, _, CD, _, _, CD, _, _],
  [_, _, CD, _, _, CD, _, _],
];

// --- Dorte (HR, Gray uniform) ---
const YU = COLORS.uniformGray;
const YD = COLORS.uniformGrayDark;

function makeDorteDown(frame: number): SpriteFrame {
  const legL = frame === 1 ? YD : frame === 2 ? _ : YD;
  const legR = frame === 1 ? _ : frame === 2 ? YD : YD;
  return [
    [_, _, H, H, H, H, _, _],
    [_, H, H, H, H, H, H, _],
    [_, S, S, S, S, S, S, _],
    [_, S, D, S, S, D, S, _],
    [_, _, S, S, S, S, _, _],
    [_, YU, YU, YU, YU, YU, YU, _],
    [_, YU, YU, YU, YU, YU, YU, _],
    [_, YD, YU, YU, YU, YU, YD, _],
    [_, _, YD, YU, YU, YD, _, _],
    [_, _, YD, _, _, YD, _, _],
    [_, legL, YD, _, _, YD, legR, _],
    [_, _, YD, _, _, YD, _, _],
  ];
}

function makeDorteUp(frame: number): SpriteFrame {
  const legL = frame === 1 ? YD : frame === 2 ? _ : YD;
  const legR = frame === 1 ? _ : frame === 2 ? YD : YD;
  return [
    [_, _, H, H, H, H, _, _],
    [_, H, H, H, H, H, H, _],
    [_, H, H, H, H, H, H, _],
    [_, H, H, H, H, H, H, _],
    [_, _, H, H, H, H, _, _],
    [_, YU, YU, YU, YU, YU, YU, _],
    [_, YU, YU, YU, YU, YU, YU, _],
    [_, YD, YU, YU, YU, YU, YD, _],
    [_, _, YD, YU, YU, YD, _, _],
    [_, _, YD, _, _, YD, _, _],
    [_, legL, YD, _, _, YD, legR, _],
    [_, _, YD, _, _, YD, _, _],
  ];
}

function makeDorteLeft(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, H, H, H, _, _, _],
    [_, H, H, H, H, H, _, _],
    [_, S, S, S, S, _, _, _],
    [_, D, S, S, S, _, _, _],
    [_, _, S, S, _, _, _, _],
    [_, YU, YU, YU, YU, _, _, _],
    [_, YU, YU, YU, YU, YU, _, _],
    [YD, YU, YU, YU, YU, _, _, _],
    [_, YD, YD, YU, _, _, _, _],
    [_, _, YD, _, YD, _, _, _],
    [_, legOff >= 0 ? YD : _, YD, _, YD, legOff > 0 ? YD : _, _, _],
    [_, _, YD, _, YD, _, _, _],
  ];
}

function makeDorteRight(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, _, H, H, H, _, _],
    [_, _, H, H, H, H, H, _],
    [_, _, _, S, S, S, S, _],
    [_, _, _, S, S, S, D, _],
    [_, _, _, _, S, S, _, _],
    [_, _, _, YU, YU, YU, YU, _],
    [_, _, YU, YU, YU, YU, YU, _],
    [_, _, _, YU, YU, YU, YU, YD],
    [_, _, _, _, YU, YD, YD, _],
    [_, _, _, YD, _, YD, _, _],
    [_, _, legOff > 0 ? YD : _, YD, _, YD, legOff >= 0 ? YD : _, _],
    [_, _, _, YD, _, YD, _, _],
  ];
}

function buildSpriteSet(
  down: (f: number) => SpriteFrame,
  up: (f: number) => SpriteFrame,
  left: (f: number) => SpriteFrame,
  right: (f: number) => SpriteFrame,
): SpriteSet {
  return {
    down: [down(0), down(1), down(2)],
    up: [up(0), up(1), up(2)],
    left: [left(0), left(1), left(2)],
    right: [right(0), right(1), right(2)],
  };
}

/** All character sprite data, keyed by CharacterName */
export const SPRITES: Record<CharacterName, CharacterSprites> = {
  glass: { walk: buildSpriteSet(makeGlassDown, makeGlassUp, makeGlassLeft, makeGlassRight) },
  fizban: { walk: buildSpriteSet(makeFizbanDown, makeFizbanUp, makeFizbanLeft, makeFizbanRight) },
  jasper: { walk: buildSpriteSet(makeJasperDown, makeJasperUp, makeJasperLeft, makeJasperRight) },
  spoty: {
    walk: buildSpriteSet(makeSpotyDown, makeSpotyUp, makeSpotyLeft, makeSpotyRight),
    dance: [makeSpotyDance(0), makeSpotyDance(1), makeSpotyDance(2), makeSpotyDance(3)],
  },
  calvin: {
    walk: buildSpriteSet(makeCalvinDown, makeCalvinUp, makeCalvinLeft, makeCalvinRight),
    seated: calvinSeated,
  },
  dorte: { walk: buildSpriteSet(makeDorteDown, makeDorteUp, makeDorteLeft, makeDorteRight) },
};

/** Fallback magenta silhouette for unknown characters */
const FALLBACK_FRAME: SpriteFrame = [
  [_, _, "#FF00FF", "#FF00FF", "#FF00FF", "#FF00FF", _, _],
  [_, "#FF00FF", "#FF00FF", "#FF00FF", "#FF00FF", "#FF00FF", "#FF00FF", _],
  [_, "#FF00FF", "#FF00FF", "#FF00FF", "#FF00FF", "#FF00FF", "#FF00FF", _],
  [_, "#FF00FF", _, "#FF00FF", "#FF00FF", _, "#FF00FF", _],
  [_, _, "#FF00FF", "#FF00FF", "#FF00FF", "#FF00FF", _, _],
  [_, "#FF00FF", "#FF00FF", "#FF00FF", "#FF00FF", "#FF00FF", "#FF00FF", _],
  [_, "#FF00FF", "#FF00FF", "#FF00FF", "#FF00FF", "#FF00FF", "#FF00FF", _],
  [_, "#CC00CC", "#FF00FF", "#FF00FF", "#FF00FF", "#FF00FF", "#CC00CC", _],
  [_, _, "#CC00CC", "#FF00FF", "#FF00FF", "#CC00CC", _, _],
  [_, _, "#CC00CC", _, _, "#CC00CC", _, _],
  [_, _, "#CC00CC", _, _, "#CC00CC", _, _],
  [_, _, "#CC00CC", _, _, "#CC00CC", _, _],
];

/** Get the appropriate sprite frame for a character (supports cameo names) */
export function getSpriteFrame(
  name: string,
  direction: Direction,
  frame: number,
  seated?: boolean,
  dancing?: boolean,
): SpriteFrame {
  // Try main sprites first
  const mainSprites = SPRITES[name as CharacterName];
  if (mainSprites) {
    if (seated && mainSprites.seated) {
      return mainSprites.seated;
    }
    if (dancing && mainSprites.dance) {
      return mainSprites.dance[frame % mainSprites.dance.length];
    }
    return mainSprites.walk[direction][frame % 3];
  }

  // Try cameo sprites
  const cameoSprites = CAMEO_SPRITES[name];
  if (cameoSprites) {
    return cameoSprites.walk[direction][frame % 3];
  }

  // Fallback magenta silhouette
  return FALLBACK_FRAME;
}
