'use strict';

let waitUntil;
try {
  ({ waitUntil } = require('@vercel/functions'));
} catch {
  waitUntil = null;
}

/**
 * Keep a fire-and-forget promise alive after the HTTP response is sent.
 *
 * On a long-running server this is a no-op: the process outlives the request,
 * so the promise simply finishes on its own. On Vercel, however, the function
 * instance may be SUSPENDED as soon as the response goes out — an in-flight
 * SMTP send freezes mid-handshake and later dies with "Connection timeout".
 * `waitUntil` tells the platform to keep the instance alive until the promise
 * settles, without delaying the response.
 *
 * The caller must attach its own `.catch(...)` — this util never swallows or
 * reports task errors itself.
 *
 * @param {Promise<unknown>} task an already-running promise
 */
const runInBackground = (task) => {
  if (!waitUntil) return;
  try {
    waitUntil(task);
  } catch {
    // Outside a Vercel request context (local dev, scripts, tests): nothing to
    // do — the long-lived process lets the promise finish naturally.
  }
};

module.exports = { runInBackground };
