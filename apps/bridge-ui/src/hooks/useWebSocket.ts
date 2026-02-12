import { useEffect, useRef } from "react";
import {
  parseMessage,
  isMcpEvent,
  isStatusMessage,
  isBridgePong,
  isTrackEvent,
  RECONNECT,
  CAPTAIN_PING,
} from "@uss-claude/shared";
import type { BridgeAction } from "../state/bridge-state.js";

/** Hook that manages WebSocket connection to the bridge server */
export function useWebSocket(dispatch: (action: BridgeAction) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelay = useRef<number>(RECONNECT.INITIAL_DELAY);

  useEffect(() => {
    let disposed = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let pingIntervalId: ReturnType<typeof setInterval> | null = null;

    function sendPing(ws: WebSocket) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "bridge_ping", timestamp: Date.now() }));
        dispatch({ type: "PING_SENT" });
      }
    }

    function startPingInterval(ws: WebSocket) {
      stopPingInterval();
      // Send first ping immediately on connect
      sendPing(ws);
      pingIntervalId = setInterval(() => sendPing(ws), CAPTAIN_PING.INTERVAL);
    }

    function stopPingInterval() {
      if (pingIntervalId) {
        clearInterval(pingIntervalId);
        pingIntervalId = null;
      }
    }

    function connect() {
      if (disposed) return;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const url = `${protocol}//${window.location.host}/ws/bridge`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectDelay.current = RECONNECT.INITIAL_DELAY;
        dispatch({ type: "WS_CONNECTED" });
        startPingInterval(ws);
      };

      ws.onmessage = (event) => {
        const msg = parseMessage(event.data as string);
        if (!msg) return;

        if (isMcpEvent(msg)) {
          dispatch({ type: "MCP_EVENT", payload: msg });
        } else if (isTrackEvent(msg)) {
          dispatch({ type: "TRACK_EVENT", payload: msg });
        } else if (isStatusMessage(msg)) {
          dispatch({ type: "STATUS_UPDATE", payload: msg });
        } else if (isBridgePong(msg)) {
          dispatch({ type: "PONG_RECEIVED" });
        }
      };

      ws.onclose = () => {
        stopPingInterval();
        dispatch({ type: "WS_DISCONNECTED" });
        if (!disposed) {
          timeoutId = setTimeout(() => {
            reconnectDelay.current = Math.min(
              reconnectDelay.current * RECONNECT.MULTIPLIER,
              RECONNECT.MAX_DELAY,
            );
            connect();
          }, reconnectDelay.current);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      disposed = true;
      stopPingInterval();
      if (timeoutId) clearTimeout(timeoutId);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [dispatch]);
}
