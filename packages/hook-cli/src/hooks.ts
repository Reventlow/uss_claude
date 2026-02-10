import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { OFFICER_REGISTRY } from "@uss-claude/shared";

const CLAUDE_SETTINGS_PATH = join(homedir(), ".claude", "settings.json");

/** Tool prefix matchers for all registered officers */
function buildMatchers(): string[] {
  const matchers: string[] = [];
  for (const officer of OFFICER_REGISTRY.values()) {
    for (const prefix of officer.mcpPrefixes) {
      matchers.push(prefix);
    }
  }
  return matchers;
}

/** Build per-officer hook entries mapping each prefix to the officer name */
function buildHookEntries(action: string) {
  const entries = [];
  for (const officer of OFFICER_REGISTRY.values()) {
    for (const prefix of officer.mcpPrefixes) {
      entries.push({
        matcher: `${prefix}.*`,
        hooks: [
          {
            type: "command",
            command: `mcp-bridge emit ${officer.name} ${action}`,
          },
        ],
      });
    }
  }
  return entries;
}

/** Hook configuration entries for Claude Code settings */
function buildHookConfig(): Record<string, unknown> {
  return {
    hooks: {
      PreToolUse: buildHookEntries("start"),
      PostToolUse: buildHookEntries("done"),
      Stop: [
        {
          matcher: "",
          hooks: [
            {
              type: "command",
              command: "mcp-bridge emit system idle",
            },
          ],
        },
      ],
    },
  };
}

/**
 * Install hook configuration into ~/.claude/settings.json.
 * Merges with existing settings, preserving non-hook keys.
 */
export function installHooks(): void {
  // Ensure the directory exists
  const dir = join(homedir(), ".claude");
  mkdirSync(dir, { recursive: true });

  // Load existing settings
  let existing: Record<string, unknown> = {};
  try {
    const raw = readFileSync(CLAUDE_SETTINGS_PATH, "utf-8");
    existing = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    // File doesn't exist or is invalid — start fresh
  }

  // Merge hook config
  const hookConfig = buildHookConfig();
  const merged = { ...existing, ...hookConfig };

  writeFileSync(CLAUDE_SETTINGS_PATH, JSON.stringify(merged, null, 2) + "\n");
  console.log(`Hooks installed to ${CLAUDE_SETTINGS_PATH}`);
  console.log("Hook matchers:");
  for (const m of buildMatchers()) {
    console.log(`  - ${m}`);
  }
}
