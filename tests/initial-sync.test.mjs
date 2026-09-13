/**
 * Initial room sync tests
 *
 * Verifies that a client joining a room adopts the running state of the peers already in it.
 * Run with: npm run test:initial-sync
 *
 * The handler is compiled and then evaluated inside a vm context with a stubbed `require`, which
 * relies on `module: "commonjs"` in src/webview/tsconfig.json. Switching that to an ESM target
 * makes the emitted `import` statements throw a SyntaxError here.
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
} finally {
  rmSync(outputDirectory, { recursive: true, force: true });
}

function createSession({ running = false, seconds = 15 } = {}) {
  let receiveInitialSync;
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
    listenToPeriodicSync() {},
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
