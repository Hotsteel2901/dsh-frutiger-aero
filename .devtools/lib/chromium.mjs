/**
 * One place that knows which Chromium to launch.
 *
 * `playwright-core` pins an exact browser *build number* and refuses to launch
 * anything else, so bumping the dependency silently breaks every script here
 * until `npx playwright install` downloads the matching build. On a machine
 * that already has a working Chromium under `PLAYWRIGHT_BROWSERS_PATH`, that
 * download is wasted work — and offline it is impossible.
 *
 * This module resolves a binary the same way Playwright would, but falls back
 * to whatever `chromium-*` build is actually present (or `FA_CHROME`, when
 * set), so the suite runs against the browser the machine has instead of the
 * one npm asked for.
 */
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/** Candidates, most specific first. */
function candidates() {
  const out = []
  if (process.env.FA_CHROME) out.push(process.env.FA_CHROME)

  const roots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    path.join(os.homedir(), '.cache', 'ms-playwright'),
    '/usr/lib/playwright',
    '/ms-playwright',
  ].filter(Boolean)

  for (const root of roots) {
    let entries = []
    try {
      entries = fs.readdirSync(root)
    } catch {
      continue
    }
    // Newest build number first: `chromium-1243` before `chromium-1208`.
    const builds = entries
      .map((name) => (/^chromium-(\d+)$/.exec(name) ?? [])[1])
      .filter(Boolean)
      .map(Number)
      .sort((a, b) => b - a)
    for (const build of builds) {
      out.push(path.join(root, `chromium-${String(build)}`, 'chrome-linux64', 'chrome'))
      out.push(path.join(root, `chromium-${String(build)}`, 'chrome-linux', 'chrome'))
    }
  }
  out.push('/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome')
  return out
}

/** The first candidate that exists, or `undefined` to let Playwright decide. */
export function chromePath() {
  for (const candidate of candidates()) {
    try {
      if (fs.statSync(candidate).isFile()) return candidate
    } catch {
      /* keep looking */
    }
  }
  return undefined
}

/**
 * Launch Chromium with the flags this suite always needs, on a binary that
 * exists.
 *
 * @param options - Playwright launch options; `args` are merged, not replaced.
 * @returns the browser handle.
 */
export function launch(options = {}) {
  const executablePath = chromePath()
  return chromium.launch({
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    ...options,
    ...(executablePath ? { executablePath } : {}),
  })
}

export { chromium }
