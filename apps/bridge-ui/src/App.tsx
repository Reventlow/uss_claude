import { useBridgeState } from "./hooks/useBridgeState.js";
import { useWebSocket } from "./hooks/useWebSocket.js";
import { useGameLoop } from "./hooks/useGameLoop.js";
import { useStardate } from "./hooks/useStardate.js";
import { BridgeCanvas } from "./components/BridgeCanvas.js";
import { LCARSHeader } from "./components/LCARSHeader.js";
import { CommsLog } from "./components/CommsLog.js";
import { DebugPanel } from "./components/DebugPanel.js";

export function App() {
  const { state, dispatch } = useBridgeState();
  const stardate = useStardate();

  useWebSocket(dispatch);
  useGameLoop(dispatch);

  return (
    <div className="bridge-app">
      <LCARSHeader
        stardate={stardate}
        connected={state.connected}
        atmosphere={state.atmosphere}
      />
      <div className="bridge-main">
        <BridgeCanvas state={state} />
        <div className="bridge-sidebar">
          <CommsLog entries={state.commsLog} />
          <DebugPanel dispatch={dispatch} />
        </div>
      </div>
    </div>
  );
}
