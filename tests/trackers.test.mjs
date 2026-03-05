/**
 * Tracker availability tests
 *
 * Verifies that the WebSocket trackers used for peer discovery are reachable.
 * Run with: npm run test:trackers
 *
 * Requires Node.js 22+ (native WebSocket support).
 */

import { test } from "node:test";
import assert from "node:assert/strict";

const TRACKERS = [
  "wss://tracker.openwebtorrent.com",
  "wss://tracker.btorrent.xyz",
  "wss://tracker.webtorrent.dev",
];

const CONNECT_TIMEOUT_MS = 10_000;

for (const url of TRACKERS) {
  test(`Tracker is reachable: ${url}`, { timeout: CONNECT_TIMEOUT_MS + 2_000 }, async () => {
    await assert.doesNotReject(
      new Promise((resolve, reject) => {
        const ws = new WebSocket(url);

        const timer = setTimeout(() => {
          ws.close();
          reject(new Error(`Timed out after ${CONNECT_TIMEOUT_MS}ms connecting to ${url}`));
        }, CONNECT_TIMEOUT_MS);

        ws.addEventListener("open", () => {
          clearTimeout(timer);
          ws.close();
          resolve();
        });

        ws.addEventListener("error", () => {
          clearTimeout(timer);
          reject(new Error(`Failed to connect to ${url}`));
        });
      })
    );
  });
}
