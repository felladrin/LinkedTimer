/**
 * Initial and periodic room sync tests
 *
 * Verifies that a client joining a room adopts the running state of the peers already in it, and that
 * neither the initial nor the periodic sync lets a peer that joined later move the state of the
 * earlier ones (issue #1203). Run with: npm run test:initial-sync
 *
 * The handler and the periodic-sync producer are each compiled and then evaluated in their own vm
 * context with a stubbed `require`, which relies on `module: "commonjs"` in
 * src/webview/tsconfig.json. Switching that to an ESM target makes the emitted `import` statements
 * throw a SyntaxError here.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const root = fileURLToPath(new URL("..", import.meta.url));
const typeScriptCompiler = join(dirname(createRequire(import.meta.url).resolve("typescript/package.json")), "bin/tsc");
const outputDirectory = mkdtempSync(join(tmpdir(), "linked-timer-test-"));
let outputText;
let producerText;
try {
  execFileSync(process.execPath, [
    typeScriptCompiler,
    "-p",
    join(root, "src/webview/tsconfig.json"),
    "--noCheck",
    "--rootDir",
    root,
    "--outDir",
    outputDirectory,
  ]);
  outputText = readFileSync(join(outputDirectory, "src/webview/scripts/subscriptions/onRoomUpdated.js"), "utf8");
  producerText = readFileSync(
    join(outputDirectory, "src/webview/scripts/subscriptions/onTotalTimerSecondsUpdated.js"),
    "utf8"
  );
} finally {
  rmSync(outputDirectory, { recursive: true, force: true });
}

function createSession({ running = false, seconds = 15 } = {}) {
  let receiveInitialSync;
  let receivePeriodicSync;
  const calls = [];
  const configuration = { hours: 0, minutes: 0, seconds: 15 };
  const room = { id: "test-room", creationTimestamp: 200, onPeerJoined() {} };
  const roomModule = {
    onRoomUpdated: (handler) => handler(room),
    getRoom: () => room,
    listenToInitialSync: (handler) => (receiveInitialSync = handler),
    listenToEditTimer() {},
    listenToStart() {},
    listenToStop() {},
    listenToPeriodicSync: (handler) => (receivePeriodicSync = handler),
  };
  const timerModule = {
    isTimerRunning: () => running,
    getTotalTimerSeconds: () => seconds,
    getTimerStartValues: () => configuration,
    startTimerWithValues: (values) => calls.push(["start", values]),
    stopTimer: () => calls.push(["stop"]),
    publishTimerStartValues: (values) => calls.push(["configure", values]),
  };
  runInNewContext(outputText, {
    exports: {},
    window: { location: {} },
    require: (path) => {
      if (path === "../constants/room") return roomModule;
      if (path === "../constants/timer") return timerModule;
      throw new Error(`Unexpected import: ${path}`);
    },
  });
  return {
    calls,
    receive: (overrides = {}) =>
      receiveInitialSync({
        isRunning: true,
        totalSeconds: 15,
        timeValues: { hours: 0, minutes: 0, seconds: 15 },
        timerEditorConfiguration: configuration,
        joinRoomTimestamp: 100,
        ...overrides,
      }),
    receivePeriodic: (overrides = {}) =>
      // Round-trip through JSON so the fixture matches the real transport: a joinRoomTimestamp
      // override of undefined serialises as an absent key, exactly like an old-version wire frame.
      receivePeriodicSync(
        JSON.parse(
          JSON.stringify({
            isRunning: true,
            totalSeconds: 40,
            timeValues: { hours: 0, minutes: 0, seconds: 40 },
            joinRoomTimestamp: 100,
            ...overrides,
          })
        ),
        "peer-under-review"
      ),
  };
}

for (const seconds of [14, 15, 16]) {
  test(`starts a stopped timer even when its value is within one second (${seconds}s)`, () => {
    const session = createSession({ seconds });
    session.receive();
    assert.deepEqual(session.calls, [["start", { hours: 0, minutes: 0, seconds: 15 }]]);
  });
}

test("does not start a timer when joining a stopped room", () => {
  const session = createSession();
  session.receive({ isRunning: false });
  assert.deepEqual(session.calls, []);
});

test("stops a running timer when joining a stopped room", () => {
  const session = createSession({ running: true });
  session.receive({ isRunning: false });
  assert.deepEqual(session.calls, [["stop"]]);
});

// The stop deliberately ignores the peer's remaining time: easytimer's stop() resets the
// counters, so an adopted value would be discarded on the same call. This pins that the
// editor configuration still gets adopted alongside the stop.
test("adopts the peer's editor configuration when it stops the local timer", () => {
  const session = createSession({ running: true });
  const peerConfiguration = { hours: 0, minutes: 5, seconds: 0 };
  session.receive({ isRunning: false, timerEditorConfiguration: peerConfiguration });
  assert.deepEqual(session.calls, [["stop"], ["configure", peerConfiguration]]);
});

test("does not restart a running timer already within the drift tolerance", () => {
  const session = createSession({ running: true, seconds: 14 });
  session.receive();
  assert.deepEqual(session.calls, []);
});

test("corrects a running timer outside the drift tolerance", () => {
  const session = createSession({ running: true, seconds: 30 });
  session.receive();
  assert.deepEqual(session.calls, [["start", { hours: 0, minutes: 0, seconds: 15 }]]);
});

test("ignores state and configuration from a peer that joined later", () => {
  const session = createSession({ running: true, seconds: 40 });
  session.receive({
    isRunning: false,
    joinRoomTimestamp: 300,
    timerEditorConfiguration: { hours: 0, minutes: 1, seconds: 0 },
  });
  assert.deepEqual(session.calls, []);
});

// Issue #1203: the periodic sync carried no join timestamp, so the older-peer guard that
// handleInitialSyncEvent applies was impossible there, and any peer could start any other.

test("ignores a periodic sync from a peer that joined later", () => {
  const session = createSession({ running: false });
  session.receivePeriodic({ joinRoomTimestamp: 300 });
  assert.deepEqual(session.calls, []);
});

test("applies a periodic sync with drift from a peer that joined earlier", () => {
  const session = createSession({ running: true, seconds: 15 });
  session.receivePeriodic({ joinRoomTimestamp: 100 });
  assert.deepEqual(session.calls, [["start", { hours: 0, minutes: 0, seconds: 40 }]]);
});

test("applies a periodic sync from an older-version peer that sends no join timestamp", () => {
  const session = createSession({ running: true, seconds: 15 });
  session.receivePeriodic({ joinRoomTimestamp: undefined });
  assert.deepEqual(session.calls, [["start", { hours: 0, minutes: 0, seconds: 40 }]]);
});

test("leaves a running timer untouched by a periodic sync within the drift tolerance", () => {
  const session = createSession({ running: true, seconds: 40 });
  session.receivePeriodic({ totalSeconds: 40 });
  assert.deepEqual(session.calls, []);
});

test("leaves the timer untouched by a periodic sync reporting a stopped peer", () => {
  const session = createSession({ running: true, seconds: 15 });
  session.receivePeriodic({ isRunning: false });
  assert.deepEqual(session.calls, []);
});

test("ignores a drift correction from a peer that joined later while the local timer runs", () => {
  const session = createSession({ running: true, seconds: 15 });
  session.receivePeriodic({ joinRoomTimestamp: 300 });
  assert.deepEqual(session.calls, []);
});

test("applies a periodic sync from a peer created in the same millisecond, since only a strictly later peer is ignored", () => {
  const session = createSession({ running: true, seconds: 15 });
  session.receivePeriodic({ joinRoomTimestamp: 200 });
  assert.deepEqual(session.calls, [["start", { hours: 0, minutes: 0, seconds: 40 }]]);
});

test("emits each periodic sync with the local room creation timestamp", () => {
  const emitted = [];
  let onTick;
  runInNewContext(producerText, {
    exports: {},
    require: (path) => {
      if (path === "../constants/room")
        return { emitPeriodicSync: (data) => emitted.push(data), getRoom: () => ({ creationTimestamp: 200 }) };
      if (path === "../constants/timer")
        return {
          isTimerRunning: () => true,
          getTimerValues: () => ({ hours: 0, minutes: 0, seconds: 40 }),
          getTotalTimerSeconds: () => 40,
          onTotalTimerSecondsUpdated: (handler) => (onTick = handler),
        };
      throw new Error(`Unexpected import: ${path}`);
    },
  });
  assert.equal(typeof onTick, "function");
  assert.deepEqual(emitted, []);
  onTick();
  // The emitted payload is constructed inside the vm context, so compare it after a JSON
  // round-trip — which is exactly what the real transport does before delivery.
  assert.equal(emitted.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(emitted[0])), {
    isRunning: true,
    timeValues: { hours: 0, minutes: 0, seconds: 40 },
    totalSeconds: 40,
    joinRoomTimestamp: 200,
  });
});
