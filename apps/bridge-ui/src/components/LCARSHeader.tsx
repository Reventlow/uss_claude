import { BridgeAtmosphere } from "@uss-claude/shared";
import { StatusIndicator } from "./StatusIndicator.js";

interface LCARSHeaderProps {
  stardate: string;
  connected: boolean;
  atmosphere: BridgeAtmosphere;
}

export function LCARSHeader({ stardate, connected, atmosphere }: LCARSHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: 4,
        height: 36,
      }}
    >
      {/* Left LCARS curved cap */}
      <div
        style={{
          width: 60,
          background: "#CC99CC",
          borderRadius: "16px 0 0 16px",
        }}
      />
      {/* Title bar */}
      <div
        style={{
          flex: 1,
          background: "#FF9900",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
        }}
      >
        <span
          style={{
            color: "#000",
            fontSize: "10px",
            fontFamily: '"Press Start 2P", monospace',
            letterSpacing: "1px",
          }}
        >
          USS CLAUDE — NCC-2026
        </span>
        <span
          style={{
            color: "#000",
            fontSize: "8px",
            fontFamily: '"Press Start 2P", monospace',
          }}
        >
          SD {stardate}
        </span>
      </div>
      {/* Status section */}
      <div
        style={{
          width: 120,
          background: "#9999FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "0 16px 16px 0",
        }}
      >
        <StatusIndicator connected={connected} atmosphere={atmosphere} />
      </div>
    </div>
  );
}
