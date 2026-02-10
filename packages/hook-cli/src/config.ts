import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

/** Runtime configuration for the MCP bridge daemon */
export interface BridgeConfig {
  /** WebSocket server URL (e.g. ws://server:3100) */
  serverUrl: string;
  /** Authentication token for the ingest endpoint */
  token: string;
}

const CONFIG_DIR = join(homedir(), ".config", "mcp-bridge");
const ENV_FILE = join(CONFIG_DIR, ".env");

/**
 * Load configuration from environment variables, falling back to
 * ~/.config/mcp-bridge/.env if present.
 */
export function loadConfig(): BridgeConfig {
  // Try loading the dotenv file manually (no external dep)
  loadDotenvFile(ENV_FILE);

  const serverUrl = process.env["MCP_BRIDGE_SERVER"];
  const token = process.env["MCP_BRIDGE_TOKEN"];

  if (!serverUrl) {
    throw new Error(
      "MCP_BRIDGE_SERVER not set. Export it or add to ~/.config/mcp-bridge/.env",
    );
  }
  if (!token) {
    throw new Error(
      "MCP_BRIDGE_TOKEN not set. Export it or add to ~/.config/mcp-bridge/.env",
    );
  }

  return { serverUrl, token };
}

/** Print the current configuration (masking the token) */
export function printConfig(): void {
  try {
    const cfg = loadConfig();
    console.log(`Server : ${cfg.serverUrl}`);
    console.log(`Token  : ${cfg.token.slice(0, 4)}${"*".repeat(Math.max(0, cfg.token.length - 4))}`);
  } catch (err) {
    console.error(`Config error: ${(err as Error).message}`);
    process.exit(1);
  }
}

/**
 * Minimal .env parser — reads KEY=VALUE lines, ignores comments and blanks.
 * Only sets vars that are not already in process.env.
 */
function loadDotenvFile(path: string): void {
  let content: string;
  try {
    content = readFileSync(path, "utf-8");
  } catch {
    return; // File doesn't exist — that's fine
  }

  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx < 1) continue;
    const key = line.slice(0, eqIdx).trim();
    let value = line.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}
