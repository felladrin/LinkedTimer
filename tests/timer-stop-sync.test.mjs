/**
 * Timer stop-frame sync tests
 *
 * Verifies that the periodic sync broadcast by stopping the timer reports the timer as stopped,
 * not as still running. Regression test for issue #1202: the counter handler was registered
 * before the running-state handler, and since the counter handler triggers the broadcast while
 * reading isTimerRunning(), every stop emitted one frame of { isRunning: true, totalSeconds: 0 }.
 * Run with: npm run test:timer-stop-sync
 *
 * Same technique as tests/initial-sync.test.mjs: compile, then evaluate inside a vm context with
 * a stubbed `require`, relying on `module: "commonjs"` in src/webview/tsconfig.json. The real
 * create-pubsub and easytimer.js (ESM-only) are preloaded in the test realm and injected as the
 * modules those compiled files require. Each frame is captured through a JSON round-trip, the
 * same serialization room.ts:113 applies before the wire, so assertions see exactly the shape a
 * peer receives, as a plain same-realm object.
 *
 * Scope: this drives the synchronous `started`/`stopped` dispatch only. The natural-completion
 * boundary is NOT covered: on the final tick easytimer dispatches `secondsUpdated` while still
 * running, so the last tick still broadcasts { isRunning: true, totalSeconds: 0 } before the
 * `stopped` frame. That is a separate pre-existing issue; nothing interleaves with these tests
 * either way, because start/stop dispatch and the assertions all run synchronously in one turn.
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
let subscriptionSource, timerSource;
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
  subscriptionSource = readFileSync(
    join(outputDirectory, "src/webview/scripts/subscriptions/onTotalTimerSecondsUpdated.js"),
    "utf8"
  );
  timerSource = readFileSync(join(outputDirectory, "src/webview/scripts/constants/timer.js"), "utf8");
} finally {
  rmSync(outputDirectory, { recursive: true, force: true });
}

const createPubSubModule = await import("create-pubsub");
const easytimerNamespace = await import("easytimer.js");
const timerClass = easytimerNamespace.default?.default ?? easytimerNamespace.Timer;
const easytimerModule = { __esModule: true, default: timerClass };

function loadCompiledModule(source, sandbox) {
  const moduleExports = {};
  sandbox.module = { exports: moduleExports };
  sandbox.exports = moduleExports;
  runInNewContext(source, sandbox);
  return sandbox.module.exports;
}

function createSession() {
  const frames = [];
  const roomModule = { emitPeriodicSync: (frame) => frames.push(JSON.parse(JSON.stringify(frame))) };
  const requireFromSandbox = (request) => {
    if (request === "create-pubsub") return createPubSubModule;
    if (request === "easytimer.js") return easytimerModule;
    if (request === "../constants/room") return roomModule;
    throw new Error(`Unexpected import: ${request}`);
  };
  const sandbox = {
    window: { localStorage: { getItem: () => null } },
    // The sandboxed modules never call these. easytimer resolves its own interval in the host realm, so
    // ticks there are real; they cannot interleave because dispatch + assertions are one synchronous
    // turn, and every session that starts is stopped by its test below so no handle leaks past the run.
    setInterval: () => 0,
    clearInterval: () => {},
    setTimeout: () => 0,
    clearTimeout: () => {},
    require: requireFromSandbox,
  };

  const timerModule = loadCompiledModule(timerSource, { ...sandbox, require: requireFromSandbox });
  const subscriptionSandbox = {
    ...sandbox,
    require: (request) => (request === "../constants/timer" ? timerModule : requireFromSandbox(request)),
  };
  loadCompiledModule(subscriptionSource, subscriptionSandbox);
  timerModule.configureTimerEventHandlers();

  return {
    frames,
    start: () => timerModule.startTimer(),
    stop: () => timerModule.stopTimer(),
    clearFrames: () => (frames.length = 0),
  };
}

// Full frames, not an [isRunning, totalSeconds] projection: the consumer (handlePeriodicSyncEvent)
// acts on timeValues, whose freshness depends on setTimerValues running before setTotalTimerSeconds
// inside the counter handler, so the whole frame must be pinned.
test("start broadcasts one periodic sync with the running state and all fields up to date", () => {
  const session = createSession();
  session.start();
  try {
    assert.deepEqual(session.frames, [
      { isRunning: true, timeValues: { hours: 0, minutes: 0, seconds: 15 }, totalSeconds: 15 },
    ]);
  } finally {
    session.stop(); // a started easytimer holds a live 15s host-realm interval; release it or the run waits on it
  }
});

test("stop broadcasts one periodic sync with the stopped state and all fields reset", () => {
  const session = createSession();
  session.start();
  session.clearFrames();
  session.stop();
  assert.deepEqual(session.frames, [
    { isRunning: false, timeValues: { hours: 0, minutes: 0, seconds: 0 }, totalSeconds: 0 },
  ]);
});

// Scoped to the started/stopped dispatch this harness drives; the natural-completion tick is out of
// scope (see header) and still pairs running with reset counters until its own issue lands.
test("no start or stop dispatch ever pairs a running state with reset counters", () => {
  const session = createSession();
  session.start();
  session.stop();
  assert.equal(
    session.frames.some((frame) => frame.isRunning && frame.totalSeconds === 0),
    false
  );
});
