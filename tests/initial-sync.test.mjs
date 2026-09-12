import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const root = fileURLToPath(new URL("..", import.meta.url));
const outputDirectory = mkdtempSync(join(tmpdir(), "linked-timer-test-"));
let outputText;
try {
  execFileSync(process.execPath, [
    join(root, "node_modules/typescript/bin/tsc"),
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
