import { loadConfig } from "./config.js";
import { WsClient } from "./ws-client.js";
import { IpcServer } from "./ipc-server.js";

/**
 * Run the daemon process.
 * Manages the WS client and IPC server, handles graceful shutdown.
 */
export async function startDaemon(foreground: boolean): Promise<void> {
  const config = loadConfig();
  const wsClient = new WsClient(config);
  const ipcServer = new IpcServer(wsClient, () => shutdown());

  let shuttingDown = false;

  async function shutdown(): Promise<void> {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log("[daemon] shutting down...");
    ipcServer.stop();
    await wsClient.disconnect();
    process.exit(0);
  }

  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());

  // Start services
  wsClient.connect();
  ipcServer.start();

  if (!foreground) {
    // Detach stdio so the parent process can exit
    // In practice the CLI spawns us with detached + unref,
    // so we just need to keep the event loop alive.
    console.log("[daemon] running in background (pid %d)", process.pid);
  } else {
    console.log("[daemon] running in foreground (pid %d)", process.pid);
  }
}
