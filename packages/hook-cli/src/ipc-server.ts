import { createServer, type Server, type Socket } from "node:net";
import { unlinkSync } from "node:fs";
import type { OfficerName, McpAction, IngestMessage } from "@uss-claude/shared";
import type { WsClient } from "./ws-client.js";

export const IPC_SOCKET_PATH = "/tmp/mcp-bridge.sock";

/** IPC commands sent from the CLI to the daemon */
interface IpcCommand {
  cmd: "emit" | "stop" | "status";
  officer?: string;
  action?: string;
}

/** IPC responses from the daemon to the CLI */
interface IpcResponse {
  ok: boolean;
  connected?: boolean;
  uptime?: number;
  error?: string;
}

/**
 * Unix domain socket IPC server.
 * Listens for JSON-line commands from the CLI and dispatches them.
 */
export class IpcServer {
  private server: Server | null = null;
  private startTime = Date.now();

  constructor(
    private readonly wsClient: WsClient,
    private readonly onStop: () => void,
  ) {}

  /** Start listening on the Unix socket. */
  start(): void {
    // Clean up stale socket
    try {
      unlinkSync(IPC_SOCKET_PATH);
    } catch {
      // Doesn't exist — fine
    }

    this.server = createServer((socket) => this.handleConnection(socket));
    this.server.listen(IPC_SOCKET_PATH, () => {
      console.log(`[ipc] listening on ${IPC_SOCKET_PATH}`);
    });

    this.server.on("error", (err) => {
      console.error(`[ipc] server error: ${err.message}`);
    });
  }

  /** Stop the IPC server. */
  stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
    try {
      unlinkSync(IPC_SOCKET_PATH);
    } catch {
      // Already gone
    }
  }

  private handleConnection(socket: Socket): void {
    let buffer = "";

    socket.on("data", (chunk) => {
      buffer += chunk.toString();
      // Process complete JSON lines
      let nlIdx: number;
      while ((nlIdx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, nlIdx).trim();
        buffer = buffer.slice(nlIdx + 1);
        if (line) {
          this.processCommand(line, socket);
        }
      }
    });

    socket.on("error", () => {
      // Client disconnected abruptly — ignore
    });
  }

  private processCommand(line: string, socket: Socket): void {
    let cmd: IpcCommand;
    try {
      cmd = JSON.parse(line) as IpcCommand;
    } catch {
      this.respond(socket, { ok: false, error: "invalid JSON" });
      return;
    }

    switch (cmd.cmd) {
      case "emit": {
        const officer = cmd.officer as OfficerName | undefined;
        const action = cmd.action as McpAction | undefined;
        if (!officer || !action) {
          this.respond(socket, { ok: false, error: "missing officer or action" });
          return;
        }
        const msg: IngestMessage = {
          type: "mcp_event",
          officer,
          action,
          timestamp: Date.now(),
        };
        this.wsClient.send(msg);
        this.respond(socket, { ok: true });
        break;
      }

      case "status": {
        this.respond(socket, {
          ok: true,
          connected: this.wsClient.connected,
          uptime: Date.now() - this.startTime,
        });
        break;
      }

      case "stop": {
        this.respond(socket, { ok: true });
        this.onStop();
        break;
      }

      default:
        this.respond(socket, { ok: false, error: `unknown command: ${(cmd as IpcCommand).cmd}` });
    }
  }

  private respond(socket: Socket, resp: IpcResponse): void {
    try {
      socket.write(JSON.stringify(resp) + "\n");
    } catch {
      // Socket may have closed
    }
  }
}
