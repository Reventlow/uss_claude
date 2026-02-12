import { useState } from "react";
import { getOfficerNames, getOfficer, type OfficerName } from "@uss-claude/shared";
import type { BridgeAction } from "../state/bridge-state.js";

interface DebugPanelProps {
  dispatch: (action: BridgeAction) => void;
}

export function DebugPanel({ dispatch }: DebugPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        border: "1px solid #CC99CC",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      {/* Header / toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          background: "#CC99CC",
          color: "#000",
          border: "none",
          padding: "4px 8px",
          fontSize: "8px",
          fontFamily: '"Press Start 2P", monospace',
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        DEBUG {expanded ? "[-]" : "[+]"}
      </button>

      {expanded && (
        <div style={{ padding: 6, display: "flex", flexDirection: "column", gap: 6 }}>
          {/* Officer controls */}
          {getOfficerNames().map((name: OfficerName) => {
            const config = getOfficer(name);
            return (
              <div key={name} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span
                  style={{
                    fontSize: "7px",
                    fontFamily: '"Press Start 2P", monospace',
                    color: "#FF9900",
                    width: 50,
                  }}
                >
                  {config.displayName}
                </span>
                <DebugButton
                  label="START"
                  onClick={() => dispatch({ type: "DEBUG_OFFICER_START", officer: name })}
                />
                <DebugButton
                  label="DONE"
                  onClick={() => dispatch({ type: "DEBUG_OFFICER_DONE", officer: name })}
                />
              </div>
            );
          })}

          {/* Separator */}
          <div style={{ borderTop: "1px solid #333", margin: "2px 0" }} />

          {/* Laptop controls */}
          <div style={{ display: "flex", gap: 4 }}>
            <DebugButton
              label="CONNECT LAPTOP"
              onClick={() => dispatch({ type: "DEBUG_CONNECT_LAPTOP" })}
            />
            <DebugButton
              label="DISCONNECT"
              onClick={() => dispatch({ type: "DEBUG_DISCONNECT_LAPTOP" })}
            />
          </div>

          {/* Separator */}
          <div style={{ borderTop: "1px solid #333", margin: "2px 0" }} />

          {/* Cameo controls */}
          <div style={{ display: "flex", gap: 4 }}>
            <DebugButton
              label="TRIGGER CAMEO"
              onClick={() => dispatch({ type: "DEBUG_TRIGGER_CAMEO" })}
            />
          </div>

          {/* Separator */}
          <div style={{ borderTop: "1px solid #333", margin: "2px 0" }} />

          {/* Spotify controls */}
          <div style={{ display: "flex", gap: 4 }}>
            <DebugButton
              label="PLAY TRACK"
              onClick={() => dispatch({ type: "DEBUG_TRACK_PLAY" })}
            />
            <DebugButton
              label="STOP TRACK"
              onClick={() => dispatch({ type: "DEBUG_TRACK_STOP" })}
            />
          </div>

          {/* Separator */}
          <div style={{ borderTop: "1px solid #333", margin: "2px 0" }} />

          {/* Disco controls */}
          <div style={{ display: "flex", gap: 4 }}>
            <DebugButton
              label="DISCO!"
              onClick={() => dispatch({ type: "DEBUG_DISCO" })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DebugButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "#333",
        color: "#FF9900",
        border: "1px solid #FF9900",
        borderRadius: 2,
        padding: "2px 6px",
        fontSize: "6px",
        fontFamily: '"Press Start 2P", monospace',
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
