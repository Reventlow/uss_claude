#!/usr/bin/env node
import { loadConfig } from "./config.js";
import { PlayerctlMonitor } from "./playerctl.js";
import { WsClient } from "./ws-client.js";

async function main(): Promise<void> {
  console.log("spoty-daemon — USS Claude Spotify monitor");

  const config = loadConfig();
  console.log(`Server: ${config.serverUrl}`);

  const ws = new WsClient(config);
  const monitor = new PlayerctlMonitor((msg) => {
    console.log(`[track] ${msg.action}: ${msg.artist ?? ""} - ${msg.title ?? ""}`);
    ws.send(msg);
  });

  // Connect to bridge server, then start monitoring
  ws.connect();
  monitor.start();

  // Graceful shutdown
  async function shutdown(signal: string): Promise<void> {
    console.log(`\n[${signal}] shutting down...`);
    monitor.stop();
    await ws.disconnect();
    process.exit(0);
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
