/**
 * Is the browser running the bundle on disk?
 *
 * `patchReload: live` reloads the client when the plugin's `lib/` changes, but
 * a reload is only as fresh as the bytes the browser is willing to accept: if
 * the module is served without a validator, the engine can reuse its cached
 * copy and every measurement after that describes the *previous* build. That
 * failure is invisible from the outside — the page renders, the console is
 * clean, and the numbers just quietly refuse to move.
 *
 * So this asks the page directly what it has, and reports the fetch's own
 * status and cache headers alongside it.
 *
 * usage: node probe-bundle.mjs <url> [needle]
 */
import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'

const TARGET = process.argv[2]
const NEEDLE = process.argv[3] ?? 'drawer dismissal on session choice'

const browser = await launch()
const page = await freshPage(browser, {
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 3,
})

/** Every request the page made, so the plugin's URL can be inspected directly. */
const seen = []
page.on('response', (response) => {
  const url = response.url()
  if (!url.includes('frutiger')) return
  seen.push({ url, status: response.status(), headers: response.headers() })
})

const { gates, errors } = await enter(page, TARGET)

// What the running factory actually holds. `exports.apply` is the plugin's
// entry point; its source is the only honest answer to "which build is this".
const inPage = await page.evaluate(`(async () => {
  const loader = window.__ModuleLoader__
  const out = { moduleLoader: typeof loader, needleInFactory: null, factoryChars: null }
  try {
    const res = await fetch(${JSON.stringify(TARGET)})
    const text = await res.text()
    out.needleInServerCopy = text.includes(${JSON.stringify(NEEDLE)})
    out.serverCopyChars = text.length
    out.serverStatus = res.status
  } catch (error) { out.fetchError = String(error) }
  return out
})()`)

console.log(JSON.stringify({ gates, errors, inPage, responses: seen }, null, 2))
await browser.close()
