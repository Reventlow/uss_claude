import { createServer } from "node:http";
import { loadConfig } from "./config.js";
import { createStaticHandler } from "./http-server.js";
import { StateTracker } from "./state-tracker.js";
import { BridgeHandler } from "./bridge-handler.js";
import { IngestHandler } from "./ingest-handler.js";
import { WsManager } from "./ws-manager.js";
import { logger } from "./logger.js";

const config = loadConfig();

// Create state tracker
const stateTracker = new StateTracker();

// Create bridge handler (browser clients)
const bridgeHandler = new BridgeHandler(stateTracker, config.bridgePassword);

// Wire state tracker broadcasts to bridge clients
stateTracker.onBroadcast((msg) => {
  bridgeHandler.broadcast(msg);
});

// Create ingest handler (CLI hook daemon)
const ingestHandler = new IngestHandler(config.bridgeToken, stateTracker, bridgeHandler);

// Create WebSocket manager
const wsManager = new WsManager(ingestHandler, bridgeHandler);

// Create HTTP server with static file serving
const staticHandler = createStaticHandler(config.staticDir);
const server = createServer(staticHandler);

// Route WebSocket upgrades
server.on("upgrade", (req, socket, head) => {
  wsManager.handleUpgrade(req, socket, head);
});

// Start listening
server.listen(config.port, config.host, () => {
  logger.info("server", `USS Claude bridge server listening on ${config.host}:${config.port}`);
  logger.info("server", `Static files: ${config.staticDir}`);
  logger.info("server", `WebSocket ingest: ws://${config.host}:${config.port}/ws/ingest`);
  logger.info("server", `WebSocket bridge: ws://${config.host}:${config.port}/ws/bridge`);
});

// Graceful shutdown
function shutdown(): void {
  logger.info("server", "Shutting down...");
  wsManager.close();
  stateTracker.destroy();
  server.close(() => {
    logger.info("server", "Server closed");
    process.exit(0);
  });
  // Force exit after 5s
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
