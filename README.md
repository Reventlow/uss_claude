# USS Claude

A Star Trek-themed bridge visualization that reacts to Claude Code's MCP tool usage. Officers animate on a pixel-art bridge when MCP tools are called — walking to their stations, working, and reporting back to the captain.

## Architecture

```
[Laptop: Claude Code + hook CLI] --ws--> [Server: bridge-server:3420] <--ws-- [Browser: bridge UI]
```

The project is a pnpm monorepo with four packages:

| Package | Description |
|---|---|
| `packages/shared` | Types, protocol, constants, officer registry, content (puns, gossip, reports) |
| `packages/bridge-server` | WebSocket server (port 3420), state tracker, ingest/bridge handlers |
| `packages/hook-cli` | CLI daemon that hooks into Claude Code PreToolUse/PostToolUse events |
| `apps/bridge-ui` | React + Vite canvas-based bridge UI |

## Officers

| Officer | Role | Division | MCP Prefix |
|---|---|---|---|
| **Glass** | Comms | Gold | `mcp__glass__*` (ServiceDesk Plus tickets) |
| **Fizban** | Science | Blue | `mcp__fizban__*` (documentation search) |
| **Jasper** | Ops | Red-orange | `mcp__jasper__*`, `mcp__protonmail__*` (email) |
| **Calvin** | Captain | — | Appears via UI ping/pong presence system |
| **Dorte** | HR Director | — | Appears to scold officers after excessive gossip |

### Officer State Machine

```
IDLE → WALKING_TO_STATION → WORKING → WALKING_TO_CAPTAIN → REPORTING → WALKING_TO_IDLE
```

- `captainPresent` includes SEATED, LISTENING, and ENTERING states
- `pendingDone` handles fast MCP tools that complete before the officer reaches their station
- Idle behaviors: puns (captain present), gossip (captain absent), Dorte scoldings (after gossip threshold)

## Deployment

### Server (Docker)

The bridge server and UI are published as a Docker image on Docker Hub.

```bash
# Pull the image
docker pull elohite/uss-claude:latest

# Configure environment
cp .env.example .env
# Edit .env with your token

# Start the server
docker compose up -d
```

The `docker-compose.yml` pulls from `elohite/uss-claude:latest` and expects a `.env` file. See `.env.example` for all configuration options.

#### Environment variables (server)

| Variable | Description | Default |
|---|---|---|
| `BRIDGE_PORT` | Host-side port mapping | `3420` |
| `BRIDGE_TOKEN` | Shared auth token (must match hook CLI) | — |
| `BRIDGE_PASSWORD` | Optional UI password | empty (disabled) |

### Hook CLI (laptop)

The hook CLI runs on the machine where Claude Code is installed. It connects to the bridge server over WebSocket and forwards MCP tool events.

#### Environment variables (laptop)

| Variable | Description |
|---|---|
| `MCP_BRIDGE_SERVER` | WebSocket URL of the bridge server, e.g. `ws://<server-ip>:3420` |
| `MCP_BRIDGE_TOKEN` | Must match `BRIDGE_TOKEN` on the server |

#### Running manually

```bash
node packages/hook-cli/dist/index.js start --foreground
```

#### Running as a systemd user service

Create the service file at `~/.config/systemd/user/mcp-bridge.service`:

```ini
[Unit]
Description=USS Claude MCP Bridge Hook CLI
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
EnvironmentFile=%h/.config/mcp-bridge/env
ExecStart=/usr/bin/node /path/to/uss_claude/packages/hook-cli/dist/index.js start --foreground
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

Create the environment file at `~/.config/mcp-bridge/env`:

```bash
MCP_BRIDGE_SERVER=ws://<server-ip>:3420
MCP_BRIDGE_TOKEN=<your-token>
```

Then enable and start:

```bash
systemctl --user daemon-reload
systemctl --user enable --now mcp-bridge
systemctl --user status mcp-bridge       # check status
journalctl --user -u mcp-bridge -f       # follow logs
```

### Hook CLI commands

```
mcp-bridge start [--foreground]        Start the daemon
mcp-bridge stop                        Stop the daemon
mcp-bridge status                      Show daemon status
mcp-bridge emit <officer> <action>     Send an MCP event
mcp-bridge install-hooks               Install Claude Code hooks
mcp-bridge config                      Show current configuration
```

## Local Development

Prerequisites: Node.js 22+, pnpm

```bash
pnpm install
pnpm build
```

Run the three components in separate terminals:

```bash
# Terminal 1: Bridge server
BRIDGE_TOKEN=test pnpm dev

# Terminal 2: Bridge UI (Vite dev server)
pnpm dev:ui

# Terminal 3: Hook CLI
MCP_BRIDGE_SERVER="ws://localhost:3420" MCP_BRIDGE_TOKEN="test" \
  node packages/hook-cli/dist/index.js start --foreground
```

The UI dev server runs at `http://localhost:5173/`. After editing UI code, do a full page refresh (Vite HMR can glitch with canvas rendering).

## CI/CD

Pushing to `main` triggers a GitHub Actions workflow that builds and pushes the Docker image to Docker Hub as `elohite/uss-claude:latest` (plus a SHA-tagged version).

## Key Notes

- The hook CLI connects to the base WebSocket URL (it appends `/ws/ingest` internally)
- Claude Code must be restarted to pick up hook matchers in `~/.claude/settings.json`
- If an MCP tool errors before PostToolUse fires, the officer can freeze (no "done" event). A stuck-officer timeout is a planned improvement.
