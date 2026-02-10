import type { IngestMessage } from "@uss-claude/shared";

const MAX_SIZE = 50;

/**
 * Circular buffer for offline event queuing.
 * When the WebSocket is disconnected, events are buffered here
 * and flushed on reconnect. Oldest events are dropped when full.
 */
export class EventBuffer {
  private buf: IngestMessage[] = [];

  /** Add an event to the buffer. Drops oldest if at capacity. */
  push(msg: IngestMessage): void {
    if (this.buf.length >= MAX_SIZE) {
      this.buf.shift();
    }
    this.buf.push(msg);
  }

  /** Drain all buffered events and return them in order. */
  flush(): IngestMessage[] {
    const items = this.buf;
    this.buf = [];
    return items;
  }

  /** Number of buffered events. */
  get size(): number {
    return this.buf.length;
  }
}
