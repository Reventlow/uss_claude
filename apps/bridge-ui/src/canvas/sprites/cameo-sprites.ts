import type { CharacterSprites, SpriteFrame, SpriteSet } from "./sprite-data.js";
import { COLORS } from "./colors.js";

const _ = null;
const S = COLORS.skin;
const D = COLORS.skinDark;

// Helper to build a full sprite set from directional frame generators
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

// ===== Storm Trooper (white armor) =====
const TW = "#FFFFFF"; // White armor
const TD = "#CCCCCC"; // Dark armor
const TB = "#222222"; // Black visor

function makeStormtrooperDown(frame: number): SpriteFrame {
  const legL = frame === 1 ? TD : frame === 2 ? _ : TD;
  const legR = frame === 1 ? _ : frame === 2 ? TD : TD;
  return [
    [_, _, TW, TW, TW, TW, _, _],
    [_, TW, TW, TW, TW, TW, TW, _],
    [_, TW, TW, TW, TW, TW, TW, _],
    [_, TW, TB, TB, TB, TB, TW, _],
    [_, _, TW, TW, TW, TW, _, _],
    [_, TW, TW, TW, TW, TW, TW, _],
    [_, TW, TW, TW, TW, TW, TW, _],
    [_, TD, TW, TW, TW, TW, TD, _],
    [_, _, TD, TW, TW, TD, _, _],
    [_, _, TD, _, _, TD, _, _],
    [_, legL, TD, _, _, TD, legR, _],
    [_, _, TD, _, _, TD, _, _],
  ];
}

function makeStormtrooperUp(frame: number): SpriteFrame {
  const legL = frame === 1 ? TD : frame === 2 ? _ : TD;
  const legR = frame === 1 ? _ : frame === 2 ? TD : TD;
  return [
    [_, _, TW, TW, TW, TW, _, _],
    [_, TW, TW, TW, TW, TW, TW, _],
    [_, TW, TW, TW, TW, TW, TW, _],
    [_, TW, TW, TW, TW, TW, TW, _],
    [_, _, TW, TW, TW, TW, _, _],
    [_, TW, TW, TW, TW, TW, TW, _],
    [_, TW, TW, TW, TW, TW, TW, _],
    [_, TD, TW, TW, TW, TW, TD, _],
    [_, _, TD, TW, TW, TD, _, _],
    [_, _, TD, _, _, TD, _, _],
    [_, legL, TD, _, _, TD, legR, _],
    [_, _, TD, _, _, TD, _, _],
  ];
}

function makeStormtrooperLeft(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, TW, TW, TW, _, _, _],
    [_, TW, TW, TW, TW, TW, _, _],
    [_, TW, TW, TW, TW, _, _, _],
    [_, TB, TB, TW, TW, _, _, _],
    [_, _, TW, TW, _, _, _, _],
    [_, TW, TW, TW, TW, _, _, _],
    [_, TW, TW, TW, TW, TW, _, _],
    [TD, TW, TW, TW, TW, _, _, _],
    [_, TD, TD, TW, _, _, _, _],
    [_, _, TD, _, TD, _, _, _],
    [_, legOff >= 0 ? TD : _, TD, _, TD, legOff > 0 ? TD : _, _, _],
    [_, _, TD, _, TD, _, _, _],
  ];
}

function makeStormtrooperRight(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, _, TW, TW, TW, _, _],
    [_, _, TW, TW, TW, TW, TW, _],
    [_, _, _, TW, TW, TW, TW, _],
    [_, _, _, TW, TW, TB, TB, _],
    [_, _, _, _, TW, TW, _, _],
    [_, _, _, TW, TW, TW, TW, _],
    [_, _, TW, TW, TW, TW, TW, _],
    [_, _, _, TW, TW, TW, TW, TD],
    [_, _, _, _, TW, TD, TD, _],
    [_, _, _, TD, _, TD, _, _],
    [_, _, legOff > 0 ? TD : _, TD, _, TD, legOff >= 0 ? TD : _, _],
    [_, _, _, TD, _, TD, _, _],
  ];
}

// ===== Dalek (bronze dome with blue sensor dots) =====
const DK = "#CD853F"; // Bronze body
const DD = "#8B6914"; // Dark bronze
const DE = "#4488FF"; // Blue sensor

function makeDalekDown(frame: number): SpriteFrame {
  const wobble = frame === 1 ? DE : frame === 2 ? DD : DE;
  return [
    [_, _, _, DK, DK, _, _, _],
    [_, _, DK, DK, DK, DK, _, _],
    [_, DK, DK, DE, DE, DK, DK, _],
    [_, DK, DK, DK, DK, DK, DK, _],
    [_, DD, DK, DK, DK, DK, DD, _],
    [_, DK, wobble, DK, DK, wobble, DK, _],
    [_, DK, DK, DK, DK, DK, DK, _],
    [_, DK, wobble, DK, DK, wobble, DK, _],
    [_, DD, DK, DK, DK, DK, DD, _],
    [_, DD, DD, DD, DD, DD, DD, _],
    [_, _, DD, DD, DD, DD, _, _],
    [_, DD, DD, DD, DD, DD, DD, _],
  ];
}

function makeDalekUp(frame: number): SpriteFrame {
  const wobble = frame === 1 ? DE : frame === 2 ? DD : DE;
  return [
    [_, _, _, DK, DK, _, _, _],
    [_, _, DK, DK, DK, DK, _, _],
    [_, DK, DK, DK, DK, DK, DK, _],
    [_, DK, DK, DK, DK, DK, DK, _],
    [_, DD, DK, DK, DK, DK, DD, _],
    [_, DK, wobble, DK, DK, wobble, DK, _],
    [_, DK, DK, DK, DK, DK, DK, _],
    [_, DK, wobble, DK, DK, wobble, DK, _],
    [_, DD, DK, DK, DK, DK, DD, _],
    [_, DD, DD, DD, DD, DD, DD, _],
    [_, _, DD, DD, DD, DD, _, _],
    [_, DD, DD, DD, DD, DD, DD, _],
  ];
}

function makeDalekLeft(frame: number): SpriteFrame {
  const wobble = frame === 1 ? DE : frame === 2 ? DD : DE;
  return [
    [_, _, DK, DK, _, _, _, _],
    [_, DK, DK, DK, DK, _, _, _],
    [DE, DK, DK, DK, DK, _, _, _],
    [_, DK, DK, DK, DK, _, _, _],
    [_, DD, DK, DK, DK, _, _, _],
    [_, DK, wobble, DK, DK, _, _, _],
    [_, DK, DK, DK, DK, DK, _, _],
    [_, DK, wobble, DK, DK, _, _, _],
    [_, DD, DK, DK, DK, DD, _, _],
    [_, DD, DD, DD, DD, DD, _, _],
    [_, _, DD, DD, DD, _, _, _],
    [_, DD, DD, DD, DD, DD, _, _],
  ];
}

function makeDalekRight(frame: number): SpriteFrame {
  const wobble = frame === 1 ? DE : frame === 2 ? DD : DE;
  return [
    [_, _, _, _, DK, DK, _, _],
    [_, _, _, DK, DK, DK, DK, _],
    [_, _, _, DK, DK, DK, DK, DE],
    [_, _, _, DK, DK, DK, DK, _],
    [_, _, _, DK, DK, DK, DD, _],
    [_, _, _, DK, DK, wobble, DK, _],
    [_, _, DK, DK, DK, DK, DK, _],
    [_, _, _, DK, DK, wobble, DK, _],
    [_, _, DD, DK, DK, DK, DD, _],
    [_, _, DD, DD, DD, DD, DD, _],
    [_, _, _, DD, DD, DD, _, _],
    [_, _, DD, DD, DD, DD, DD, _],
  ];
}

// ===== Cylon (chrome body, red scanning eye) =====
const CY = "#C0C0C0"; // Chrome
const CK = "#808080"; // Dark chrome
const CR = "#FF0000"; // Red eye

function makeCylonDown(frame: number): SpriteFrame {
  const eyePos = frame; // Eye sweeps left-center-right
  const eyeRow = [_, CY, eyePos === 0 ? CR : CK, CK, CK, eyePos === 2 ? CR : CK, CY, _];
  if (eyePos === 1) { eyeRow[3] = CR; eyeRow[4] = CR; }
  const legL = frame === 1 ? CK : frame === 2 ? _ : CK;
  const legR = frame === 1 ? _ : frame === 2 ? CK : CK;
  return [
    [_, _, CY, CY, CY, CY, _, _],
    [_, CY, CY, CY, CY, CY, CY, _],
    [_, CY, CY, CY, CY, CY, CY, _],
    eyeRow,
    [_, _, CY, CY, CY, CY, _, _],
    [_, CY, CY, CY, CY, CY, CY, _],
    [_, CY, CY, CY, CY, CY, CY, _],
    [_, CK, CY, CY, CY, CY, CK, _],
    [_, _, CK, CY, CY, CK, _, _],
    [_, _, CK, _, _, CK, _, _],
    [_, legL, CK, _, _, CK, legR, _],
    [_, _, CK, _, _, CK, _, _],
  ];
}

function makeCylonUp(frame: number): SpriteFrame {
  const legL = frame === 1 ? CK : frame === 2 ? _ : CK;
  const legR = frame === 1 ? _ : frame === 2 ? CK : CK;
  return [
    [_, _, CY, CY, CY, CY, _, _],
    [_, CY, CY, CY, CY, CY, CY, _],
    [_, CY, CY, CY, CY, CY, CY, _],
    [_, CY, CY, CY, CY, CY, CY, _],
    [_, _, CY, CY, CY, CY, _, _],
    [_, CY, CY, CY, CY, CY, CY, _],
    [_, CY, CY, CY, CY, CY, CY, _],
    [_, CK, CY, CY, CY, CY, CK, _],
    [_, _, CK, CY, CY, CK, _, _],
    [_, _, CK, _, _, CK, _, _],
    [_, legL, CK, _, _, CK, legR, _],
    [_, _, CK, _, _, CK, _, _],
  ];
}

function makeCylonLeft(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, CY, CY, CY, _, _, _],
    [_, CY, CY, CY, CY, CY, _, _],
    [_, CY, CY, CY, CY, _, _, _],
    [_, CR, CK, CY, CY, _, _, _],
    [_, _, CY, CY, _, _, _, _],
    [_, CY, CY, CY, CY, _, _, _],
    [_, CY, CY, CY, CY, CY, _, _],
    [CK, CY, CY, CY, CY, _, _, _],
    [_, CK, CK, CY, _, _, _, _],
    [_, _, CK, _, CK, _, _, _],
    [_, legOff >= 0 ? CK : _, CK, _, CK, legOff > 0 ? CK : _, _, _],
    [_, _, CK, _, CK, _, _, _],
  ];
}

function makeCylonRight(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, _, CY, CY, CY, _, _],
    [_, _, CY, CY, CY, CY, CY, _],
    [_, _, _, CY, CY, CY, CY, _],
    [_, _, _, CY, CY, CK, CR, _],
    [_, _, _, _, CY, CY, _, _],
    [_, _, _, CY, CY, CY, CY, _],
    [_, _, CY, CY, CY, CY, CY, _],
    [_, _, _, CY, CY, CY, CY, CK],
    [_, _, _, _, CY, CK, CK, _],
    [_, _, _, CK, _, CK, _, _],
    [_, _, legOff > 0 ? CK : _, CK, _, CK, legOff >= 0 ? CK : _, _],
    [_, _, _, CK, _, CK, _, _],
  ];
}

// ===== Redshirt Ensign (red TOS uniform) =====
const RU = "#CC3333"; // Red uniform
const RD = "#991111"; // Dark red

function makeRedshirtDown(frame: number): SpriteFrame {
  const legL = frame === 1 ? RD : frame === 2 ? _ : RD;
  const legR = frame === 1 ? _ : frame === 2 ? RD : RD;
  return [
    [_, _, "#553311", "#553311", "#553311", "#553311", _, _],
    [_, "#553311", "#553311", "#553311", "#553311", "#553311", "#553311", _],
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

function makeRedshirtUp(frame: number): SpriteFrame {
  const legL = frame === 1 ? RD : frame === 2 ? _ : RD;
  const legR = frame === 1 ? _ : frame === 2 ? RD : RD;
  return [
    [_, _, "#553311", "#553311", "#553311", "#553311", _, _],
    [_, "#553311", "#553311", "#553311", "#553311", "#553311", "#553311", _],
    [_, "#553311", "#553311", "#553311", "#553311", "#553311", "#553311", _],
    [_, "#553311", "#553311", "#553311", "#553311", "#553311", "#553311", _],
    [_, _, "#553311", "#553311", "#553311", "#553311", _, _],
    [_, RU, RU, RU, RU, RU, RU, _],
    [_, RU, RU, RU, RU, RU, RU, _],
    [_, RD, RU, RU, RU, RU, RD, _],
    [_, _, RD, RU, RU, RD, _, _],
    [_, _, RD, _, _, RD, _, _],
    [_, legL, RD, _, _, RD, legR, _],
    [_, _, RD, _, _, RD, _, _],
  ];
}

function makeRedshirtLeft(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, "#553311", "#553311", "#553311", _, _, _],
    [_, "#553311", "#553311", "#553311", "#553311", "#553311", _, _],
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

function makeRedshirtRight(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, _, "#553311", "#553311", "#553311", _, _],
    [_, _, "#553311", "#553311", "#553311", "#553311", "#553311", _],
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

// ===== Mandalorian (silver beskar armor) =====
const MA = "#A8A9AD"; // Silver armor
const MD = "#6B6B6F"; // Dark armor
const MV = "#1A1A2E"; // Dark visor

function makeMandalorianDown(frame: number): SpriteFrame {
  const legL = frame === 1 ? MD : frame === 2 ? _ : MD;
  const legR = frame === 1 ? _ : frame === 2 ? MD : MD;
  return [
    [_, _, MA, MA, MA, MA, _, _],
    [_, MA, MA, MA, MA, MA, MA, _],
    [_, MA, MA, MA, MA, MA, MA, _],
    [_, MA, MV, MV, MV, MV, MA, _],
    [_, _, MA, MA, MA, MA, _, _],
    [_, MA, MA, MA, MA, MA, MA, _],
    [_, MA, MA, MA, MA, MA, MA, _],
    [_, MD, MA, MA, MA, MA, MD, _],
    [_, _, MD, MA, MA, MD, _, _],
    [_, _, MD, _, _, MD, _, _],
    [_, legL, MD, _, _, MD, legR, _],
    [_, _, MD, _, _, MD, _, _],
  ];
}

function makeMandalorianUp(frame: number): SpriteFrame {
  const legL = frame === 1 ? MD : frame === 2 ? _ : MD;
  const legR = frame === 1 ? _ : frame === 2 ? MD : MD;
  return [
    [_, _, MA, MA, MA, MA, _, _],
    [_, MA, MA, MA, MA, MA, MA, _],
    [_, MA, MA, MA, MA, MA, MA, _],
    [_, MA, MA, MA, MA, MA, MA, _],
    [_, _, MA, MA, MA, MA, _, _],
    [_, MA, MA, MA, MA, MA, MA, _],
    [_, MA, MA, MA, MA, MA, MA, _],
    [_, MD, MA, MA, MA, MA, MD, _],
    [_, _, MD, MA, MA, MD, _, _],
    [_, _, MD, _, _, MD, _, _],
    [_, legL, MD, _, _, MD, legR, _],
    [_, _, MD, _, _, MD, _, _],
  ];
}

function makeMandalorianLeft(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, MA, MA, MA, _, _, _],
    [_, MA, MA, MA, MA, MA, _, _],
    [_, MA, MA, MA, MA, _, _, _],
    [_, MV, MV, MA, MA, _, _, _],
    [_, _, MA, MA, _, _, _, _],
    [_, MA, MA, MA, MA, _, _, _],
    [_, MA, MA, MA, MA, MA, _, _],
    [MD, MA, MA, MA, MA, _, _, _],
    [_, MD, MD, MA, _, _, _, _],
    [_, _, MD, _, MD, _, _, _],
    [_, legOff >= 0 ? MD : _, MD, _, MD, legOff > 0 ? MD : _, _, _],
    [_, _, MD, _, MD, _, _, _],
  ];
}

function makeMandalorianRight(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, _, MA, MA, MA, _, _],
    [_, _, MA, MA, MA, MA, MA, _],
    [_, _, _, MA, MA, MA, MA, _],
    [_, _, _, MA, MA, MV, MV, _],
    [_, _, _, _, MA, MA, _, _],
    [_, _, _, MA, MA, MA, MA, _],
    [_, _, MA, MA, MA, MA, MA, _],
    [_, _, _, MA, MA, MA, MA, MD],
    [_, _, _, _, MA, MD, MD, _],
    [_, _, _, MD, _, MD, _, _],
    [_, _, legOff > 0 ? MD : _, MD, _, MD, legOff >= 0 ? MD : _, _],
    [_, _, _, MD, _, MD, _, _],
  ];
}

// ===== Xenomorph (dark body, elongated head, green highlights) =====
const XB = "#1A1A1A"; // Dark body
const XD = "#0D0D0D"; // Darker
const XG = "#2F4F2F"; // Green slime

function makeXenomorphDown(frame: number): SpriteFrame {
  const legL = frame === 1 ? XD : frame === 2 ? _ : XD;
  const legR = frame === 1 ? _ : frame === 2 ? XD : XD;
  return [
    [_, _, XB, XB, XB, XB, XB, _],
    [_, _, _, XB, XB, XB, _, _],
    [_, XB, XB, XB, XB, XB, XB, _],
    [_, XB, XG, XB, XB, XG, XB, _],
    [_, _, XB, XG, XG, XB, _, _],
    [_, XB, XB, XB, XB, XB, XB, _],
    [_, XB, XB, XB, XB, XB, XB, _],
    [_, XD, XB, XB, XB, XB, XD, _],
    [_, _, XD, XB, XB, XD, _, _],
    [_, _, XD, _, _, XD, _, _],
    [_, legL, XD, _, _, XD, legR, _],
    [_, _, XD, _, _, XD, _, _],
  ];
}

function makeXenomorphUp(frame: number): SpriteFrame {
  const legL = frame === 1 ? XD : frame === 2 ? _ : XD;
  const legR = frame === 1 ? _ : frame === 2 ? XD : XD;
  return [
    [_, _, XB, XB, XB, XB, XB, _],
    [_, _, _, XB, XB, XB, _, _],
    [_, XB, XB, XB, XB, XB, XB, _],
    [_, XB, XB, XB, XB, XB, XB, _],
    [_, _, XB, XB, XB, XB, _, _],
    [_, XB, XB, XB, XB, XB, XB, _],
    [_, XB, XB, XB, XB, XB, XB, _],
    [_, XD, XB, XB, XB, XB, XD, _],
    [_, _, XD, XB, XB, XD, _, _],
    [_, _, XD, _, _, XD, _, _],
    [_, legL, XD, _, _, XD, legR, _],
    [_, _, XD, _, _, XD, _, _],
  ];
}

function makeXenomorphLeft(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, XB, XB, XB, XB, _, _, _],
    [_, _, XB, XB, _, _, _, _],
    [_, XB, XB, XB, XB, _, _, _],
    [_, XG, XB, XB, XB, _, _, _],
    [_, _, XG, XB, _, _, _, _],
    [_, XB, XB, XB, XB, _, _, _],
    [_, XB, XB, XB, XB, XB, _, _],
    [XD, XB, XB, XB, XB, _, _, _],
    [_, XD, XD, XB, _, _, _, _],
    [_, _, XD, _, XD, _, _, _],
    [_, legOff >= 0 ? XD : _, XD, _, XD, legOff > 0 ? XD : _, _, _],
    [_, _, XD, _, XD, _, _, _],
  ];
}

function makeXenomorphRight(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, _, XB, XB, XB, XB, _],
    [_, _, _, _, XB, XB, _, _],
    [_, _, _, XB, XB, XB, XB, _],
    [_, _, _, XB, XB, XB, XG, _],
    [_, _, _, _, XB, XG, _, _],
    [_, _, _, XB, XB, XB, XB, _],
    [_, _, XB, XB, XB, XB, XB, _],
    [_, _, _, XB, XB, XB, XB, XD],
    [_, _, _, _, XB, XD, XD, _],
    [_, _, _, XD, _, XD, _, _],
    [_, _, legOff > 0 ? XD : _, XD, _, XD, legOff >= 0 ? XD : _, _],
    [_, _, _, XD, _, XD, _, _],
  ];
}

// ===== HAL 9000 (floating red eye/circle — no legs, just hovering) =====
const HB = "#333333"; // Body
const HD = "#222222"; // Dark body
const HR = "#FF0000"; // Red eye
const HY = "#FF6600"; // Eye ring

function makeHalDown(_frame: number): SpriteFrame {
  return [
    [_, _, _, _, _, _, _, _],
    [_, _, HB, HB, HB, HB, _, _],
    [_, HB, HB, HB, HB, HB, HB, _],
    [_, HB, HB, HY, HY, HB, HB, _],
    [_, HB, HY, HR, HR, HY, HB, _],
    [_, HB, HY, HR, HR, HY, HB, _],
    [_, HB, HB, HY, HY, HB, HB, _],
    [_, HB, HB, HB, HB, HB, HB, _],
    [_, _, HB, HB, HB, HB, _, _],
    [_, _, _, HD, HD, _, _, _],
    [_, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _],
  ];
}

function makeHalUp(_frame: number): SpriteFrame {
  return [
    [_, _, _, _, _, _, _, _],
    [_, _, HB, HB, HB, HB, _, _],
    [_, HB, HB, HB, HB, HB, HB, _],
    [_, HB, HB, HB, HB, HB, HB, _],
    [_, HB, HB, HB, HB, HB, HB, _],
    [_, HB, HB, HB, HB, HB, HB, _],
    [_, HB, HB, HB, HB, HB, HB, _],
    [_, HB, HB, HB, HB, HB, HB, _],
    [_, _, HB, HB, HB, HB, _, _],
    [_, _, _, HD, HD, _, _, _],
    [_, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _],
  ];
}

function makeHalLeft(_frame: number): SpriteFrame {
  return [
    [_, _, _, _, _, _, _, _],
    [_, _, HB, HB, HB, _, _, _],
    [_, HB, HB, HB, HB, HB, _, _],
    [_, HB, HY, HY, HB, HB, _, _],
    [_, HB, HR, HR, HY, HB, _, _],
    [_, HB, HR, HR, HY, HB, _, _],
    [_, HB, HY, HY, HB, HB, _, _],
    [_, HB, HB, HB, HB, HB, _, _],
    [_, _, HB, HB, HB, _, _, _],
    [_, _, _, HD, _, _, _, _],
    [_, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _],
  ];
}

function makeHalRight(_frame: number): SpriteFrame {
  return [
    [_, _, _, _, _, _, _, _],
    [_, _, _, HB, HB, HB, _, _],
    [_, _, HB, HB, HB, HB, HB, _],
    [_, _, HB, HB, HY, HY, HB, _],
    [_, _, HB, HY, HR, HR, HB, _],
    [_, _, HB, HY, HR, HR, HB, _],
    [_, _, HB, HB, HY, HY, HB, _],
    [_, _, HB, HB, HB, HB, HB, _],
    [_, _, _, HB, HB, HB, _, _],
    [_, _, _, _, HD, _, _, _],
    [_, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _],
  ];
}

// ===== Predator (olive/brown with dreadlocks, glowing eyes) =====
const PB = "#6B6B00"; // Olive body
const PD = "#4A4A00"; // Dark olive
const PH = "#3A3A3A"; // Dreadlocks
const PE = "#FFFF00"; // Glowing yellow eyes

function makePredatorDown(frame: number): SpriteFrame {
  const legL = frame === 1 ? PD : frame === 2 ? _ : PD;
  const legR = frame === 1 ? _ : frame === 2 ? PD : PD;
  return [
    [_, PH, PB, PB, PB, PB, PH, _],
    [PH, PB, PB, PB, PB, PB, PB, PH],
    [_, PB, PB, PB, PB, PB, PB, _],
    [_, PB, PE, PB, PB, PE, PB, _],
    [_, _, PB, PB, PB, PB, _, _],
    [_, PB, PB, PB, PB, PB, PB, _],
    [_, PB, PB, PB, PB, PB, PB, _],
    [_, PD, PB, PB, PB, PB, PD, _],
    [_, _, PD, PB, PB, PD, _, _],
    [_, _, PD, _, _, PD, _, _],
    [_, legL, PD, _, _, PD, legR, _],
    [_, _, PD, _, _, PD, _, _],
  ];
}

function makePredatorUp(frame: number): SpriteFrame {
  const legL = frame === 1 ? PD : frame === 2 ? _ : PD;
  const legR = frame === 1 ? _ : frame === 2 ? PD : PD;
  return [
    [_, PH, PB, PB, PB, PB, PH, _],
    [PH, PB, PB, PB, PB, PB, PB, PH],
    [_, PB, PB, PB, PB, PB, PB, _],
    [_, PB, PB, PB, PB, PB, PB, _],
    [_, _, PB, PB, PB, PB, _, _],
    [_, PB, PB, PB, PB, PB, PB, _],
    [_, PB, PB, PB, PB, PB, PB, _],
    [_, PD, PB, PB, PB, PB, PD, _],
    [_, _, PD, PB, PB, PD, _, _],
    [_, _, PD, _, _, PD, _, _],
    [_, legL, PD, _, _, PD, legR, _],
    [_, _, PD, _, _, PD, _, _],
  ];
}

function makePredatorLeft(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [PH, PB, PB, PB, PB, _, _, _],
    [PH, PB, PB, PB, PB, PH, _, _],
    [_, PB, PB, PB, PB, _, _, _],
    [_, PE, PB, PB, PB, _, _, _],
    [_, _, PB, PB, _, _, _, _],
    [_, PB, PB, PB, PB, _, _, _],
    [_, PB, PB, PB, PB, PB, _, _],
    [PD, PB, PB, PB, PB, _, _, _],
    [_, PD, PD, PB, _, _, _, _],
    [_, _, PD, _, PD, _, _, _],
    [_, legOff >= 0 ? PD : _, PD, _, PD, legOff > 0 ? PD : _, _, _],
    [_, _, PD, _, PD, _, _, _],
  ];
}

function makePredatorRight(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, _, PB, PB, PB, PB, PH],
    [_, _, PH, PB, PB, PB, PB, PH],
    [_, _, _, PB, PB, PB, PB, _],
    [_, _, _, PB, PB, PB, PE, _],
    [_, _, _, _, PB, PB, _, _],
    [_, _, _, PB, PB, PB, PB, _],
    [_, _, PB, PB, PB, PB, PB, _],
    [_, _, _, PB, PB, PB, PB, PD],
    [_, _, _, _, PB, PD, PD, _],
    [_, _, _, PD, _, PD, _, _],
    [_, _, legOff > 0 ? PD : _, PD, _, PD, legOff >= 0 ? PD : _, _],
    [_, _, _, PD, _, PD, _, _],
  ];
}

// ===== ALF (brown furry alien) =====
const AB = "#CC6633"; // Brown fur
const AD = "#995522"; // Dark brown
const AN = "#222222"; // Nose

function makeAlfDown(frame: number): SpriteFrame {
  const legL = frame === 1 ? AD : frame === 2 ? _ : AD;
  const legR = frame === 1 ? _ : frame === 2 ? AD : AD;
  return [
    [_, AB, AB, AB, AB, AB, AB, _],
    [AB, AB, AB, AB, AB, AB, AB, AB],
    [_, AB, AB, AB, AB, AB, AB, _],
    [_, AB, "#111", AB, AB, "#111", AB, _],
    [_, _, AB, AN, AN, AB, _, _],
    [_, AB, AB, AB, AB, AB, AB, _],
    [_, AB, AB, AB, AB, AB, AB, _],
    [_, AD, AB, AB, AB, AB, AD, _],
    [_, _, AD, AB, AB, AD, _, _],
    [_, _, AD, _, _, AD, _, _],
    [_, legL, AD, _, _, AD, legR, _],
    [_, _, AD, _, _, AD, _, _],
  ];
}

function makeAlfUp(frame: number): SpriteFrame {
  const legL = frame === 1 ? AD : frame === 2 ? _ : AD;
  const legR = frame === 1 ? _ : frame === 2 ? AD : AD;
  return [
    [_, AB, AB, AB, AB, AB, AB, _],
    [AB, AB, AB, AB, AB, AB, AB, AB],
    [_, AB, AB, AB, AB, AB, AB, _],
    [_, AB, AB, AB, AB, AB, AB, _],
    [_, _, AB, AB, AB, AB, _, _],
    [_, AB, AB, AB, AB, AB, AB, _],
    [_, AB, AB, AB, AB, AB, AB, _],
    [_, AD, AB, AB, AB, AB, AD, _],
    [_, _, AD, AB, AB, AD, _, _],
    [_, _, AD, _, _, AD, _, _],
    [_, legL, AD, _, _, AD, legR, _],
    [_, _, AD, _, _, AD, _, _],
  ];
}

function makeAlfLeft(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [AB, AB, AB, AB, AB, _, _, _],
    [AB, AB, AB, AB, AB, AB, _, _],
    [_, AB, AB, AB, AB, _, _, _],
    [_, "#111", AB, AB, AB, _, _, _],
    [_, AN, AB, AB, _, _, _, _],
    [_, AB, AB, AB, AB, _, _, _],
    [_, AB, AB, AB, AB, AB, _, _],
    [AD, AB, AB, AB, AB, _, _, _],
    [_, AD, AD, AB, _, _, _, _],
    [_, _, AD, _, AD, _, _, _],
    [_, legOff >= 0 ? AD : _, AD, _, AD, legOff > 0 ? AD : _, _, _],
    [_, _, AD, _, AD, _, _, _],
  ];
}

function makeAlfRight(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, _, AB, AB, AB, AB, AB],
    [_, _, AB, AB, AB, AB, AB, AB],
    [_, _, _, AB, AB, AB, AB, _],
    [_, _, _, AB, AB, AB, "#111", _],
    [_, _, _, _, AB, AB, AN, _],
    [_, _, _, AB, AB, AB, AB, _],
    [_, _, AB, AB, AB, AB, AB, _],
    [_, _, _, AB, AB, AB, AB, AD],
    [_, _, _, _, AB, AD, AD, _],
    [_, _, _, AD, _, AD, _, _],
    [_, _, legOff > 0 ? AD : _, AD, _, AD, legOff >= 0 ? AD : _, _],
    [_, _, _, AD, _, AD, _, _],
  ];
}

// ===== Donny (casual, bowling shirt vibes — tan/cream) =====
const DB2 = "#DDAA55"; // Tan shirt
const DD2 = "#BB8833"; // Dark tan

function makeDonnyDown(frame: number): SpriteFrame {
  const H2 = "#AA8844"; // Sandy hair
  const legL = frame === 1 ? DD2 : frame === 2 ? _ : DD2;
  const legR = frame === 1 ? _ : frame === 2 ? DD2 : DD2;
  return [
    [_, _, H2, H2, H2, H2, _, _],
    [_, H2, H2, H2, H2, H2, H2, _],
    [_, S, S, S, S, S, S, _],
    [_, S, D, S, S, D, S, _],
    [_, _, S, S, S, S, _, _],
    [_, DB2, DB2, DB2, DB2, DB2, DB2, _],
    [_, DB2, DB2, DB2, DB2, DB2, DB2, _],
    [_, DD2, DB2, DB2, DB2, DB2, DD2, _],
    [_, _, DD2, DB2, DB2, DD2, _, _],
    [_, _, DD2, _, _, DD2, _, _],
    [_, legL, DD2, _, _, DD2, legR, _],
    [_, _, DD2, _, _, DD2, _, _],
  ];
}

function makeDonnyUp(frame: number): SpriteFrame {
  const H2 = "#AA8844";
  const legL = frame === 1 ? DD2 : frame === 2 ? _ : DD2;
  const legR = frame === 1 ? _ : frame === 2 ? DD2 : DD2;
  return [
    [_, _, H2, H2, H2, H2, _, _],
    [_, H2, H2, H2, H2, H2, H2, _],
    [_, H2, H2, H2, H2, H2, H2, _],
    [_, H2, H2, H2, H2, H2, H2, _],
    [_, _, H2, H2, H2, H2, _, _],
    [_, DB2, DB2, DB2, DB2, DB2, DB2, _],
    [_, DB2, DB2, DB2, DB2, DB2, DB2, _],
    [_, DD2, DB2, DB2, DB2, DB2, DD2, _],
    [_, _, DD2, DB2, DB2, DD2, _, _],
    [_, _, DD2, _, _, DD2, _, _],
    [_, legL, DD2, _, _, DD2, legR, _],
    [_, _, DD2, _, _, DD2, _, _],
  ];
}

function makeDonnyLeft(frame: number): SpriteFrame {
  const H2 = "#AA8844";
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, H2, H2, H2, _, _, _],
    [_, H2, H2, H2, H2, H2, _, _],
    [_, S, S, S, S, _, _, _],
    [_, D, S, S, S, _, _, _],
    [_, _, S, S, _, _, _, _],
    [_, DB2, DB2, DB2, DB2, _, _, _],
    [_, DB2, DB2, DB2, DB2, DB2, _, _],
    [DD2, DB2, DB2, DB2, DB2, _, _, _],
    [_, DD2, DD2, DB2, _, _, _, _],
    [_, _, DD2, _, DD2, _, _, _],
    [_, legOff >= 0 ? DD2 : _, DD2, _, DD2, legOff > 0 ? DD2 : _, _, _],
    [_, _, DD2, _, DD2, _, _, _],
  ];
}

function makeDonnyRight(frame: number): SpriteFrame {
  const H2 = "#AA8844";
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, _, H2, H2, H2, _, _],
    [_, _, H2, H2, H2, H2, H2, _],
    [_, _, _, S, S, S, S, _],
    [_, _, _, S, S, S, D, _],
    [_, _, _, _, S, S, _, _],
    [_, _, _, DB2, DB2, DB2, DB2, _],
    [_, _, DB2, DB2, DB2, DB2, DB2, _],
    [_, _, _, DB2, DB2, DB2, DB2, DD2],
    [_, _, _, _, DB2, DD2, DD2, _],
    [_, _, _, DD2, _, DD2, _, _],
    [_, _, legOff > 0 ? DD2 : _, DD2, _, DD2, legOff >= 0 ? DD2 : _, _],
    [_, _, _, DD2, _, DD2, _, _],
  ];
}

// ===== Private Hudson (green military fatigues) =====
const HU = "#556B2F"; // Olive drab
const HK = "#3B4B1F"; // Dark olive

function makeHudsonDown(frame: number): SpriteFrame {
  const legL = frame === 1 ? HK : frame === 2 ? _ : HK;
  const legR = frame === 1 ? _ : frame === 2 ? HK : HK;
  return [
    [_, _, "#553311", "#553311", "#553311", "#553311", _, _],
    [_, "#553311", "#553311", "#553311", "#553311", "#553311", "#553311", _],
    [_, S, S, S, S, S, S, _],
    [_, S, D, S, S, D, S, _],
    [_, _, S, S, S, S, _, _],
    [_, HU, HU, HU, HU, HU, HU, _],
    [_, HU, HU, HU, HU, HU, HU, _],
    [_, HK, HU, HU, HU, HU, HK, _],
    [_, _, HK, HU, HU, HK, _, _],
    [_, _, HK, _, _, HK, _, _],
    [_, legL, HK, _, _, HK, legR, _],
    [_, _, HK, _, _, HK, _, _],
  ];
}

function makeHudsonUp(frame: number): SpriteFrame {
  const legL = frame === 1 ? HK : frame === 2 ? _ : HK;
  const legR = frame === 1 ? _ : frame === 2 ? HK : HK;
  return [
    [_, _, "#553311", "#553311", "#553311", "#553311", _, _],
    [_, "#553311", "#553311", "#553311", "#553311", "#553311", "#553311", _],
    [_, "#553311", "#553311", "#553311", "#553311", "#553311", "#553311", _],
    [_, "#553311", "#553311", "#553311", "#553311", "#553311", "#553311", _],
    [_, _, "#553311", "#553311", "#553311", "#553311", _, _],
    [_, HU, HU, HU, HU, HU, HU, _],
    [_, HU, HU, HU, HU, HU, HU, _],
    [_, HK, HU, HU, HU, HU, HK, _],
    [_, _, HK, HU, HU, HK, _, _],
    [_, _, HK, _, _, HK, _, _],
    [_, legL, HK, _, _, HK, legR, _],
    [_, _, HK, _, _, HK, _, _],
  ];
}

function makeHudsonLeft(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, "#553311", "#553311", "#553311", _, _, _],
    [_, "#553311", "#553311", "#553311", "#553311", "#553311", _, _],
    [_, S, S, S, S, _, _, _],
    [_, D, S, S, S, _, _, _],
    [_, _, S, S, _, _, _, _],
    [_, HU, HU, HU, HU, _, _, _],
    [_, HU, HU, HU, HU, HU, _, _],
    [HK, HU, HU, HU, HU, _, _, _],
    [_, HK, HK, HU, _, _, _, _],
    [_, _, HK, _, HK, _, _, _],
    [_, legOff >= 0 ? HK : _, HK, _, HK, legOff > 0 ? HK : _, _, _],
    [_, _, HK, _, HK, _, _, _],
  ];
}

function makeHudsonRight(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, _, "#553311", "#553311", "#553311", _, _],
    [_, _, "#553311", "#553311", "#553311", "#553311", "#553311", _],
    [_, _, _, S, S, S, S, _],
    [_, _, _, S, S, S, D, _],
    [_, _, _, _, S, S, _, _],
    [_, _, _, HU, HU, HU, HU, _],
    [_, _, HU, HU, HU, HU, HU, _],
    [_, _, _, HU, HU, HU, HU, HK],
    [_, _, _, _, HU, HK, HK, _],
    [_, _, _, HK, _, HK, _, _],
    [_, _, legOff > 0 ? HK : _, HK, _, HK, legOff >= 0 ? HK : _, _],
    [_, _, _, HK, _, HK, _, _],
  ];
}

// ===== Trump (dark suit, blonde hair, orange tint) =====
const TU2 = "#222244"; // Dark suit
const TD2 = "#111133"; // Darker suit
const TH = "#FFD700"; // Blonde hair
const TT = "#FF9933"; // Orange tie

function makeTrumpDown(frame: number): SpriteFrame {
  const legL = frame === 1 ? TD2 : frame === 2 ? _ : TD2;
  const legR = frame === 1 ? _ : frame === 2 ? TD2 : TD2;
  return [
    [_, _, TH, TH, TH, TH, _, _],
    [_, TH, TH, TH, TH, TH, TH, _],
    [_, "#FFBB88", "#FFBB88", "#FFBB88", "#FFBB88", "#FFBB88", "#FFBB88", _],
    [_, "#FFBB88", D, "#FFBB88", "#FFBB88", D, "#FFBB88", _],
    [_, _, "#FFBB88", "#FFBB88", "#FFBB88", "#FFBB88", _, _],
    [_, TU2, TU2, TT, TT, TU2, TU2, _],
    [_, TU2, TU2, TT, TU2, TU2, TU2, _],
    [_, TD2, TU2, TU2, TU2, TU2, TD2, _],
    [_, _, TD2, TU2, TU2, TD2, _, _],
    [_, _, TD2, _, _, TD2, _, _],
    [_, legL, TD2, _, _, TD2, legR, _],
    [_, _, TD2, _, _, TD2, _, _],
  ];
}

function makeTrumpUp(frame: number): SpriteFrame {
  const legL = frame === 1 ? TD2 : frame === 2 ? _ : TD2;
  const legR = frame === 1 ? _ : frame === 2 ? TD2 : TD2;
  return [
    [_, _, TH, TH, TH, TH, _, _],
    [_, TH, TH, TH, TH, TH, TH, _],
    [_, TH, TH, TH, TH, TH, TH, _],
    [_, TH, TH, TH, TH, TH, TH, _],
    [_, _, TH, TH, TH, TH, _, _],
    [_, TU2, TU2, TU2, TU2, TU2, TU2, _],
    [_, TU2, TU2, TU2, TU2, TU2, TU2, _],
    [_, TD2, TU2, TU2, TU2, TU2, TD2, _],
    [_, _, TD2, TU2, TU2, TD2, _, _],
    [_, _, TD2, _, _, TD2, _, _],
    [_, legL, TD2, _, _, TD2, legR, _],
    [_, _, TD2, _, _, TD2, _, _],
  ];
}

function makeTrumpLeft(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, TH, TH, TH, _, _, _],
    [_, TH, TH, TH, TH, TH, _, _],
    [_, "#FFBB88", "#FFBB88", "#FFBB88", "#FFBB88", _, _, _],
    [_, D, "#FFBB88", "#FFBB88", "#FFBB88", _, _, _],
    [_, _, "#FFBB88", "#FFBB88", _, _, _, _],
    [_, TU2, TT, TU2, TU2, _, _, _],
    [_, TU2, TU2, TU2, TU2, TU2, _, _],
    [TD2, TU2, TU2, TU2, TU2, _, _, _],
    [_, TD2, TD2, TU2, _, _, _, _],
    [_, _, TD2, _, TD2, _, _, _],
    [_, legOff >= 0 ? TD2 : _, TD2, _, TD2, legOff > 0 ? TD2 : _, _, _],
    [_, _, TD2, _, TD2, _, _, _],
  ];
}

function makeTrumpRight(frame: number): SpriteFrame {
  const legOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  return [
    [_, _, _, TH, TH, TH, _, _],
    [_, _, TH, TH, TH, TH, TH, _],
    [_, _, _, "#FFBB88", "#FFBB88", "#FFBB88", "#FFBB88", _],
    [_, _, _, "#FFBB88", "#FFBB88", "#FFBB88", D, _],
    [_, _, _, _, "#FFBB88", "#FFBB88", _, _],
    [_, _, _, TU2, TU2, TT, TU2, _],
    [_, _, TU2, TU2, TU2, TU2, TU2, _],
    [_, _, _, TU2, TU2, TU2, TU2, TD2],
    [_, _, _, _, TU2, TD2, TD2, _],
    [_, _, _, TD2, _, TD2, _, _],
    [_, _, legOff > 0 ? TD2 : _, TD2, _, TD2, legOff >= 0 ? TD2 : _, _],
    [_, _, _, TD2, _, TD2, _, _],
  ];
}

/** Cameo character sprite registry, keyed by characterId */
export const CAMEO_SPRITES: Record<string, CharacterSprites> = {
  stormtrooper: {
    walk: buildSpriteSet(makeStormtrooperDown, makeStormtrooperUp, makeStormtrooperLeft, makeStormtrooperRight),
  },
  dalek: {
    walk: buildSpriteSet(makeDalekDown, makeDalekUp, makeDalekLeft, makeDalekRight),
  },
  cylon: {
    walk: buildSpriteSet(makeCylonDown, makeCylonUp, makeCylonLeft, makeCylonRight),
  },
  redshirt: {
    walk: buildSpriteSet(makeRedshirtDown, makeRedshirtUp, makeRedshirtLeft, makeRedshirtRight),
  },
  mandalorian: {
    walk: buildSpriteSet(makeMandalorianDown, makeMandalorianUp, makeMandalorianLeft, makeMandalorianRight),
  },
  xenomorph: {
    walk: buildSpriteSet(makeXenomorphDown, makeXenomorphUp, makeXenomorphLeft, makeXenomorphRight),
  },
  hal9000: {
    walk: buildSpriteSet(makeHalDown, makeHalUp, makeHalLeft, makeHalRight),
  },
  predator: {
    walk: buildSpriteSet(makePredatorDown, makePredatorUp, makePredatorLeft, makePredatorRight),
  },
  alf: {
    walk: buildSpriteSet(makeAlfDown, makeAlfUp, makeAlfLeft, makeAlfRight),
  },
  donny: {
    walk: buildSpriteSet(makeDonnyDown, makeDonnyUp, makeDonnyLeft, makeDonnyRight),
  },
  hudson: {
    walk: buildSpriteSet(makeHudsonDown, makeHudsonUp, makeHudsonLeft, makeHudsonRight),
  },
  trump: {
    walk: buildSpriteSet(makeTrumpDown, makeTrumpUp, makeTrumpLeft, makeTrumpRight),
  },
};
