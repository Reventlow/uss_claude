import { spawn, type ChildProcess } from "node:child_process";
import type { TrackEventMessage } from "@uss-claude/shared";

const RESTART_DELAY = 5_000;

/** Callback for track events */
export type TrackEventCallback = (msg: TrackEventMessage) => void;

/**
 * Monitors Spotify playback via `playerctl --follow`.
 * Parses metadata changes and emits TrackEventMessages.
 */
export class PlayerctlMonitor {
  private proc: ChildProcess | null = null;
  private lastStatus: string | null = null;
  private lastArtist: string | null = null;
  private lastTitle: string | null = null;
  private stopping = false;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly onEvent: TrackEventCallback) {}

  /** Start monitoring. Spawns playerctl --follow. */
  start(): void {
    this.stopping = false;
    this.spawn();
  }

  /** Stop monitoring. Kills the playerctl process. */
  stop(): void {
    this.stopping = true;
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.proc) {
      this.proc.kill("SIGTERM");
      this.proc = null;
    }
  }

  private spawn(): void {
    if (this.stopping) return;

    console.log("[playerctl] spawning monitor");
    const proc = spawn("playerctl", [
      "-p", "spotify",
      "metadata",
      "--follow",
      "--format", "{{status}}\t{{artist}}\t{{title}}",
    ], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    this.proc = proc;

    let buffer = "";

    proc.stdout!.on("data", (chunk: Buffer) => {
      buffer += chunk.toString("utf-8");
      const lines = buffer.split("\n");
      // Keep incomplete last line in buffer
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        this.handleLine(line.trim());
      }
    });

    proc.stderr!.on("data", (chunk: Buffer) => {
      const msg = chunk.toString("utf-8").trim();
      if (msg) {
        console.error(`[playerctl] stderr: ${msg}`);
      }
    });

    proc.on("close", (code) => {
      console.log(`[playerctl] exited with code ${code}`);
      this.proc = null;

      // If we had a playing track, emit stopped
      if (this.lastStatus === "Playing") {
        this.lastStatus = null;
        this.onEvent({
          type: "track_event",
          action: "stopped",
          timestamp: Date.now(),
        });
      }

      // Auto-restart unless we're stopping
      if (!this.stopping) {
        console.log(`[playerctl] restarting in ${RESTART_DELAY}ms`);
        this.restartTimer = setTimeout(() => {
          this.restartTimer = null;
          this.spawn();
        }, RESTART_DELAY);
      }
    });

    proc.on("error", (err) => {
      console.error(`[playerctl] error: ${err.message}`);
    });
  }

  private handleLine(line: string): void {
    if (!line) return;

    const parts = line.split("\t");
    if (parts.length < 3) return;

    const [status, artist, title] = parts;

    if (status === "Playing") {
      const trackChanged = artist !== this.lastArtist || title !== this.lastTitle;
      const wasNotPlaying = this.lastStatus !== "Playing";

      this.lastStatus = status;
      this.lastArtist = artist;
      this.lastTitle = title;

      if (wasNotPlaying) {
        this.onEvent({
          type: "track_event",
          action: "playing",
          artist,
          title,
          timestamp: Date.now(),
        });
      } else if (trackChanged) {
        this.onEvent({
          type: "track_event",
          action: "changed",
          artist,
          title,
          timestamp: Date.now(),
        });
      }
    } else if (status === "Paused" || status === "Stopped") {
      if (this.lastStatus === "Playing") {
        this.onEvent({
          type: "track_event",
          action: "stopped",
          timestamp: Date.now(),
        });
      }
      this.lastStatus = status;
      this.lastArtist = artist;
      this.lastTitle = title;
    }
  }
}
