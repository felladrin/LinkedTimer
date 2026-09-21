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
 * modules those compiled files require. `frames` receives structuredClone'd payloads so the
 * assertions compare same-realm data and catch anything non-serializable reaching the wire.
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
  const roomModule = { emitPeriodicSync: (frame) => frames.push(structuredClone(frame)) };
  const requireFromSandbox = (request) => {
    if (request === "create-pubsub") return createPubSubModule;
    if (request === "easytimer.js") return easytimerModule;
    if (request === "../constants/room") return roomModule;
    throw new Error(`Unexpected import: ${request}`);
  };
  const sandbox = {
    window: { localStorage: { getItem: () => null } },
    // Fake timers: the tests only exercise the synchronous started/stopped dispatch, so no tick ever fires.
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

test("start broadcasts a periodic sync that reports the timer as running", () => {
  const session = createSession();
  session.start();
  assert.deepEqual(
    session.frames.map((frame) => [frame.isRunning, frame.totalSeconds]),
    [[true, 15]]
  );
});

test("stop broadcasts a periodic sync that reports the timer as stopped", () => {
  const session = createSession();
  session.start();
  session.clearFrames();
  session.stop();
  assert.deepEqual(
    session.frames.map((frame) => [frame.isRunning, frame.totalSeconds]),
    [[false, 0]]
  );
});

test("no broadcast ever pairs a running state with reset counters", () => {
  const session = createSession();
  session.start();
  session.stop();
  assert.equal(
    session.frames.some((frame) => frame.isRunning && frame.totalSeconds === 0),
    false
  );
});
