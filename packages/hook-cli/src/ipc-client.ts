import { connect } from "node:net";
import { IPC_SOCKET_PATH } from "./ipc-server.js";

/** IPC response from the daemon */
interface IpcResponse {
  ok: boolean;
  connected?: boolean;
  uptime?: number;
  error?: string;
}

/**
 * Send a single IPC command to the daemon and return the response.
 * Opens a short-lived Unix socket connection.
 */
export function ipcSend(cmd: Record<string, unknown>): Promise<IpcResponse> {
  return new Promise((resolve, reject) => {
    const socket = connect(IPC_SOCKET_PATH);
    let buffer = "";

    socket.on("connect", () => {
      socket.write(JSON.stringify(cmd) + "\n");
    });

    socket.on("data", (chunk) => {
      buffer += chunk.toString();
      const nlIdx = buffer.indexOf("\n");
      if (nlIdx !== -1) {
        const line = buffer.slice(0, nlIdx).trim();
        socket.end();
        try {
          resolve(JSON.parse(line) as IpcResponse);
        } catch {
          reject(new Error("Invalid response from daemon"));
        }
      }
    });

    socket.on("error", (err) => {
      if ((err as NodeJS.ErrnoException).code === "ECONNREFUSED" ||
          (err as NodeJS.ErrnoException).code === "ENOENT") {
        reject(new Error("Daemon is not running. Start it with: mcp-bridge start"));
      } else {
        reject(err);
      }
    });

    // Timeout after 5 seconds
    socket.setTimeout(5000, () => {
      socket.destroy();
      reject(new Error("IPC request timed out"));
    });
  });
}
