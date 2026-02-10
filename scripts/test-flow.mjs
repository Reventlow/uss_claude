#!/usr/bin/env node

/**
 * Integration test script for USS Claude bridge server.
 *
 * Usage: node scripts/test-flow.mjs [server-url] [token]
 * Defaults: ws://localhost:3420, test-token
 *
 * Tests:
 * 1. Ingest auth (valid + invalid token)
 * 2. Bridge client receives status on connect
 * 3. MCP event forwarding from ingest to bridge
 * 4. Single ingest connection policy (code 4001)
 * 5. Heartbeat timeout → laptop offline
 */

import { WebSocket } from "ws";

const SERVER = process.argv[2] || "ws://localhost:3420";
const TOKEN = process.argv[3] || "test-token";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ ${message}`);
    failed++;
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function connectWs(path, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${SERVER}${path}`);
    const timer = setTimeout(() => {
      ws.close();
      reject(new Error(`Connection timeout: ${path}`));
    }, timeout);
    ws.on("open", () => {
      clearTimeout(timer);
      resolve(ws);
    });
    ws.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function waitForMessage(ws, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Message timeout")), timeout);
    ws.once("message", (data) => {
      clearTimeout(timer);
      try {
        resolve(JSON.parse(data.toString()));
      } catch {
        resolve(data.toString());
      }
    });
  });
}

/** Wait for a message of a specific type, skipping others */
function waitForMessageType(ws, type, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for ${type}`)), timeout);
    const handler = (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === type) {
          clearTimeout(timer);
          ws.removeListener("message", handler);
          resolve(msg);
        }
        // else keep listening
      } catch {
        // ignore parse errors
      }
    };
    ws.on("message", handler);
  });
}

function waitForClose(ws, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Close timeout")), timeout);
    ws.once("close", (code, reason) => {
      clearTimeout(timer);
      resolve({ code, reason: reason.toString() });
    });
  });
}

async function testInvalidToken() {
  console.log("\n--- Test: Invalid token rejected ---");
  try {
    const ws = new WebSocket(`${SERVER}/ws/ingest?token=bad-token`);
    const closePromise = waitForClose(ws, 5000);
    const openPromise = new Promise((resolve) => ws.on("open", () => resolve(true)));

    // It should either not open or close quickly
    const result = await Promise.race([
      closePromise.then((r) => ({ type: "closed", ...r })),
      openPromise.then(() => wait(1000).then(() => ({ type: "opened" }))),
    ]);

    if (result.type === "closed") {
      assert(true, "Connection rejected with invalid token");
    } else {
      // Server might accept then close — check if it closes
      ws.close();
      assert(false, "Connection was not rejected with invalid token");
    }
  } catch (err) {
    assert(true, `Connection rejected: ${err.message}`);
  }
}

async function testBridgeClientReceivesStatus() {
  console.log("\n--- Test: Bridge client receives status on connect ---");
  const bridge = await connectWs("/ws/bridge");
  const msg = await waitForMessage(bridge);
  assert(msg.type === "status", `Received status message (got type=${msg.type})`);
  assert(typeof msg.status === "object", "Status contains status object");
  assert(typeof msg.status.laptopConnected === "boolean", "Status has laptopConnected field");
  bridge.close();
}

async function testMcpEventForwarding() {
  console.log("\n--- Test: MCP event forwarding ---");
  const bridge = await connectWs("/ws/bridge");
  // Consume initial status message
  await waitForMessage(bridge);

  const ingest = await connectWs(`/ws/ingest?token=${TOKEN}`);

  // Wait for laptop-connected status (may arrive interleaved)
  await wait(500);

  // Send MCP event
  const event = {
    type: "mcp_event",
    officer: "glass",
    action: "start",
    timestamp: Date.now(),
  };
  ingest.send(JSON.stringify(event));

  // Wait specifically for mcp_event, skipping any status messages
  const forwarded = await waitForMessageType(bridge, "mcp_event", 5000);
  assert(forwarded.type === "mcp_event", "Bridge received forwarded MCP event");
  assert(forwarded.officer === "glass", "Officer name matches");
  assert(forwarded.action === "start", "Action matches");

  // Send done event
  const doneEvent = {
    type: "mcp_event",
    officer: "glass",
    action: "done",
    timestamp: Date.now(),
  };
  ingest.send(JSON.stringify(doneEvent));

  const forwarded2 = await waitForMessageType(bridge, "mcp_event", 5000);
  assert(forwarded2.type === "mcp_event" && forwarded2.action === "done",
    "Bridge received done event");

  ingest.close();
  bridge.close();
}

async function testSingleConnectionPolicy() {
  console.log("\n--- Test: Single ingest connection policy ---");
  const ingest1 = await connectWs(`/ws/ingest?token=${TOKEN}`);
  const closePromise = waitForClose(ingest1);

  await wait(200);
  const ingest2 = await connectWs(`/ws/ingest?token=${TOKEN}`);

  const { code } = await closePromise;
  assert(code === 4001, `First connection closed with code 4001 (got ${code})`);

  ingest2.close();
}

async function testHeartbeatTimeout() {
  console.log("\n--- Test: Heartbeat timeout ---");
  console.log("  (This test takes ~35 seconds...)");

  const bridge = await connectWs("/ws/bridge");
  // Consume initial status
  await waitForMessage(bridge);

  const ingest = await connectWs(`/ws/ingest?token=${TOKEN}`);

  // Wait for laptop connected status
  await wait(500);

  // Send one heartbeat
  ingest.send(JSON.stringify({ type: "heartbeat", timestamp: Date.now() }));
  await wait(200);

  // Now DON'T send heartbeats — wait for timeout (30s + buffer)
  // Close ingest without sending disconnect (simulate connection drop)
  ingest.terminate();

  // Wait for heartbeat timeout
  const startWait = Date.now();
  let offlineReceived = false;

  while (Date.now() - startWait < 35000) {
    try {
      const msg = await waitForMessage(bridge, 5000);
      if (msg.type === "status" && msg.status.laptopConnected === false) {
        offlineReceived = true;
        break;
      }
    } catch {
      // Timeout waiting for message, keep trying
    }
  }

  assert(offlineReceived, "Received laptop offline status after heartbeat timeout");
  bridge.close();
}

async function testAllOfficers() {
  console.log("\n--- Test: All officers event cycle ---");
  const bridge = await connectWs("/ws/bridge");
  await waitForMessage(bridge); // initial status

  const ingest = await connectWs(`/ws/ingest?token=${TOKEN}`);
  await wait(500);

  for (const officer of ["glass", "fizban", "jasper"]) {
    ingest.send(JSON.stringify({
      type: "mcp_event",
      officer,
      action: "start",
      timestamp: Date.now(),
    }));

    const msg = await waitForMessageType(bridge, "mcp_event", 5000);
    assert(msg.officer === officer && msg.action === "start",
      `${officer} start event forwarded`);

    await wait(100);

    ingest.send(JSON.stringify({
      type: "mcp_event",
      officer,
      action: "done",
      timestamp: Date.now(),
    }));

    const msg2 = await waitForMessageType(bridge, "mcp_event", 5000);
    assert(msg2.officer === officer && msg2.action === "done",
      `${officer} done event forwarded`);

    await wait(100);
  }

  ingest.close();
  bridge.close();
}

async function main() {
  console.log(`USS Claude Bridge Server — Integration Tests`);
  console.log(`Server: ${SERVER}`);
  console.log(`Token: ${TOKEN}`);

  try {
    await testInvalidToken();
    await testBridgeClientReceivesStatus();
    await testMcpEventForwarding();
    await testSingleConnectionPolicy();
    await testAllOfficers();
    // Heartbeat test is slow — run last
    await testHeartbeatTimeout();

    console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error(`\nFatal error: ${err.message}`);
    process.exit(1);
  }
}

main();
