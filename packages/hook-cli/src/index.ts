#!/usr/bin/env node
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { startDaemon } from "./daemon.js";
import { ipcSend } from "./ipc-client.js";
import { printConfig } from "./config.js";
import { installHooks } from "./hooks.js";

const args = process.argv.slice(2);
const command = args[0];

async function main(): Promise<void> {
  switch (command) {
    case "start": {
      const foreground = args.includes("--foreground") || args.includes("-f");
      if (foreground) {
        await startDaemon(true);
      } else {
        // Spawn detached daemon process
        const scriptPath = fileURLToPath(import.meta.url);
        const child = spawn(process.execPath, [scriptPath, "start", "--foreground"], {
          detached: true,
          stdio: "ignore",
        });
        child.unref();
        console.log(`Daemon started (pid ${child.pid})`);
      }
      break;
    }

    case "stop": {
      try {
        const resp = await ipcSend({ cmd: "stop" });
        if (resp.ok) {
          console.log("Daemon stopping.");
        } else {
          console.error(`Error: ${resp.error}`);
          process.exit(1);
        }
      } catch (err) {
        console.error((err as Error).message);
        process.exit(1);
      }
      break;
    }

    case "status": {
      try {
        const resp = await ipcSend({ cmd: "status" });
        if (resp.ok) {
          const uptimeSec = Math.floor((resp.uptime ?? 0) / 1000);
          console.log(`Daemon running — uptime ${uptimeSec}s`);
          console.log(`WebSocket ${resp.connected ? "connected" : "disconnected"}`);
        } else {
          console.error(`Error: ${resp.error}`);
          process.exit(1);
        }
      } catch (err) {
        console.error((err as Error).message);
        process.exit(1);
      }
      break;
    }

    case "emit": {
      const officer = args[1];
      const action = args[2];
      if (!officer || !action) {
        console.error("Usage: mcp-bridge emit <officer> <action>");
        process.exit(1);
      }
      try {
        const resp = await ipcSend({ cmd: "emit", officer, action });
        if (!resp.ok) {
          console.error(`Error: ${resp.error}`);
          process.exit(1);
        }
      } catch (err) {
        console.error((err as Error).message);
        process.exit(1);
      }
      break;
    }

    case "install-hooks": {
      installHooks();
      break;
    }

    case "config": {
      printConfig();
      break;
    }

    default: {
      console.log(`mcp-bridge — USS Claude hook CLI

Usage:
  mcp-bridge start [--foreground]   Start the daemon
  mcp-bridge stop                   Stop the daemon
  mcp-bridge status                 Show daemon status
  mcp-bridge emit <officer> <action>  Send an MCP event
  mcp-bridge install-hooks          Install Claude Code hooks
  mcp-bridge config                 Show current configuration`);
      if (command) {
        console.error(`\nUnknown command: ${command}`);
        process.exit(1);
      }
      break;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
