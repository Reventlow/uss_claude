import type { OfficerConfig, OfficerName } from "./types.js";
import { POSITIONS } from "./constants.js";

/**
 * Data-driven officer registry.
 * Adding a future officer = adding one entry here.
 */
export const OFFICER_REGISTRY: ReadonlyMap<OfficerName, OfficerConfig> = new Map([
  [
    "glass",
    {
      name: "glass",
      displayName: "GLASS",
      role: "comms",
      division: "gold",
      mcpPrefixes: ["mcp__glass__"],
      stationPosition: POSITIONS.GLASS_STATION,
      idlePosition: POSITIONS.GLASS_IDLE,
    },
  ],
  [
    "fizban",
    {
      name: "fizban",
      displayName: "FIZBAN",
      role: "science",
      division: "blue",
      mcpPrefixes: ["mcp__fizban__"],
      stationPosition: POSITIONS.FIZBAN_STATION,
      idlePosition: POSITIONS.FIZBAN_IDLE,
    },
  ],
  [
    "jasper",
    {
      name: "jasper",
      displayName: "JASPER",
      role: "ops",
      division: "red-orange",
      mcpPrefixes: ["mcp__jasper__", "mcp__protonmail__"],
      stationPosition: POSITIONS.JASPER_STATION,
      idlePosition: POSITIONS.JASPER_IDLE,
    },
  ],
]);

/** Get all officer names */
export function getOfficerNames(): OfficerName[] {
  return [...OFFICER_REGISTRY.keys()];
}

/** Get officer config or throw */
export function getOfficer(name: OfficerName): OfficerConfig {
  const config = OFFICER_REGISTRY.get(name);
  if (!config) throw new Error(`Unknown officer: ${name}`);
  return config;
}
