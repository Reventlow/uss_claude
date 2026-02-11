import { useRef, useEffect, useState, useCallback } from "react";
import type { BridgeState } from "../state/bridge-state.js";
import { initCanvas, renderFrame, hitTestCharacter } from "../canvas/renderer.js";
import { GRID } from "@uss-claude/shared";

interface BridgeCanvasProps {
  state: BridgeState;
}

const CANVAS_W = GRID.WIDTH * GRID.PIXEL_SIZE;
const CANVAS_H = GRID.HEIGHT * GRID.PIXEL_SIZE;

const CHARACTER_TOOLTIPS: Record<string, string> = {
  glass: "GLASS \u2014 Comms Officer",
  fizban: "FIZBAN \u2014 Science Officer",
  jasper: "JASPER \u2014 Ops Officer",
  calvin: "CALVIN \u2014 Captain",
  dorte: "HR DORTE \u2014 HR Director",
};

function getCharacterTooltip(name: string): string {
  return CHARACTER_TOOLTIPS[name] ?? name.toUpperCase();
}

export function BridgeCanvas({ state }: BridgeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const stateRef = useRef(state);
  const lastTimeRef = useRef(0);
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null);

  // Keep state ref current
  stateRef.current = state;

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = initCanvas(canvas);
  }, []);

  // Game render loop
  useEffect(() => {
    let rafId: number;

    function loop(timestamp: number) {
      const deltaMs = lastTimeRef.current === 0 ? 16 : Math.min(timestamp - lastTimeRef.current, 100);
      lastTimeRef.current = timestamp;

      const ctx = ctxRef.current;
      if (ctx) {
        renderFrame(ctx, stateRef.current, deltaMs);
      }
      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Mouse hover hit-testing for tooltips
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    const charName = hitTestCharacter(stateRef.current, canvasX, canvasY);
    if (charName) {
      setTooltip({ name: charName, x: e.clientX - rect.left, y: e.clientY - rect.top });
    } else {
      setTooltip(null);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  return (
    <div className="bridge-canvas-wrap" style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          width: "100%",
          maxWidth: CANVAS_W,
          height: "auto",
          aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
          imageRendering: "pixelated",
          cursor: tooltip ? "pointer" : "default",
        }}
      />
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x + 10,
            top: tooltip.y - 20,
            background: "#000",
            color: "#FF9900",
            border: "1px solid #FF9900",
            padding: "2px 6px",
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "8px",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {getCharacterTooltip(tooltip.name)}
        </div>
      )}
    </div>
  );
}
