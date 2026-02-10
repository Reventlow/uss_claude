import { useEffect, useRef } from "react";
import type { BridgeAction } from "../state/bridge-state.js";

/** Hook that runs a requestAnimationFrame game loop, dispatching TICK actions */
export function useGameLoop(dispatch: (action: BridgeAction) => void) {
  const lastTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number>(0);

  useEffect(() => {
    function loop(timestamp: number) {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      const deltaMs = Math.min(timestamp - lastTimeRef.current, 100); // Cap at 100ms to avoid jumps
      lastTimeRef.current = timestamp;

      if (deltaMs > 0) {
        dispatch({ type: "TICK", deltaMs });
      }

      rafIdRef.current = requestAnimationFrame(loop);
    }

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [dispatch]);
}
