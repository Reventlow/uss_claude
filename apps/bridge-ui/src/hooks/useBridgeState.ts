import { useReducer, useCallback } from "react";
import {
  type BridgeState,
  type BridgeAction,
  bridgeReducer,
  createInitialState,
} from "../state/bridge-state.js";

/** Hook wrapping the bridge state reducer */
export function useBridgeState() {
  const [state, dispatch] = useReducer(bridgeReducer, null, createInitialState);

  const dispatchAction = useCallback(
    (action: BridgeAction) => dispatch(action),
    [],
  );

  return { state, dispatch: dispatchAction } as const;
}

export type { BridgeState, BridgeAction };
