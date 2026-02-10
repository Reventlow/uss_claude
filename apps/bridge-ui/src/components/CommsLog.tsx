import type { CommsLogEntry } from "../state/bridge-state.js";

interface CommsLogProps {
  entries: CommsLogEntry[];
}

export function CommsLog({ entries }: CommsLogProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        border: "1px solid #FF9900",
        borderRadius: 4,
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#FF9900",
          color: "#000",
          padding: "4px 8px",
          fontSize: "8px",
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        COMMS LOG
      </div>
      {/* Log entries */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: 4,
        }}
      >
        {entries.length === 0 ? (
          <div
            style={{
              color: "#666",
              fontSize: "7px",
              fontFamily: '"Press Start 2P", monospace',
              padding: 4,
            }}
          >
            Awaiting transmissions...
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              style={{
                fontSize: "7px",
                fontFamily: '"Press Start 2P", monospace',
                padding: "2px 4px",
                borderBottom: "1px solid #222",
                color: "#FF9966",
                lineHeight: "1.4",
              }}
            >
              <span style={{ color: "#666" }}>
                {formatTime(entry.timestamp)}
              </span>{" "}
              {entry.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
