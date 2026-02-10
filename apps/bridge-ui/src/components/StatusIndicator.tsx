import { BridgeAtmosphere } from "@uss-claude/shared";

interface StatusIndicatorProps {
  connected: boolean;
  atmosphere: BridgeAtmosphere;
}

const STATUS_COLORS: Record<BridgeAtmosphere, string> = {
  [BridgeAtmosphere.OFFLINE]: "#CC6666",
  [BridgeAtmosphere.STANDBY]: "#FFCC66",
  [BridgeAtmosphere.ACTIVE]: "#66CC66",
};

const STATUS_LABELS: Record<BridgeAtmosphere, string> = {
  [BridgeAtmosphere.OFFLINE]: "OFFLINE",
  [BridgeAtmosphere.STANDBY]: "STANDBY",
  [BridgeAtmosphere.ACTIVE]: "ACTIVE",
};

export function StatusIndicator({ connected, atmosphere }: StatusIndicatorProps) {
  const color = connected ? STATUS_COLORS[atmosphere] : "#CC6666";
  const label = connected ? STATUS_LABELS[atmosphere] : "DISCONNECTED";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: `0 0 4px ${color}`,
        }}
      />
      <span style={{ fontSize: "8px", color }}>{label}</span>
    </div>
  );
}
