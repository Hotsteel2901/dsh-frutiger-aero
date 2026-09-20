/**
 * Any request the app makes that does not succeed.
 *
 * A 404 in the console is easy to wave away as noise, and on a reskin it
 * usually *is* — until it is the plugin's own bundle, or a font, or an icon
 * sprite, in which case the symptom shows up somewhere else entirely and costs
 * an afternoon to trace back. This lists every non-2xx/3xx response and every
 * failed request with its URL, so the answer is one line instead of a hunt.
 *
 * The endpoint is also re-requested from *inside the page*, because the
 * Harness gates every route twice: a Host/Origin fence, then a signed
 * browser-auth cookie. A request made from Node carries neither, so it answers
 * 401/403 and tells you nothing about whether the app itself can reach it.
 *
 * ## Known and accepted: `/open-in-app/icon/filemanager` 404
 *
 * The product's "open in app" feature probes which desktop applications exist
 * and offers a split button for the ones it finds. It first asks
 * `/open-in-app/apps` (which answers `{"apps":["filemanager"]}` here), then
 * lazily requests one icon per entry. `filemanager` is backed by `xdg-open`,
 * an executable with no `.desktop` file and no icon path, so the host's own
 * `iconOf` returns null and the route correctly answers 404. Nothing in the DOM
 * references the URL at rest — the image is only created when the button is
 * about to be shown.
 *
 * That is a property of the stock product on a headless Linux box, not of this
 * skin: the plugin is a token-only reskin and neither routes nor serves these.
 * It is listed here rather than filtered out so the next reader does not have
 * to redo the trace, and it does not fail the run.
 *
 * usage: node netcheck.mjs <url>
 */
import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'

const TARGET = process.argv[2]

/** A URL whose failure is understood, reproducible on a stock home, and not ours. */
const ACCEPTED = [
  {
    match: /\/open-in-app\/icon\/filemanager$/,
    reason: 'xdg-open has no icon; the host route answers 404 and the product hides the button',
  },
]

const isAccepted = (url) => ACCEPTED.find((a) => a.match.test(url))

const browser = await launch()
const page = await freshPage(browser, {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})

const bad = new Map()
page.on('response', (response) => {
  const status = response.status()
  if (status < 400) return
  const url = response.url()
  if (!bad.has(url)) bad.set(url, { status, type: response.request().resourceType() })
})
page.on('requestfailed', (request) => {
  const url = request.url()
  if (!bad.has(url)) bad.set(url, { status: `FAILED ${request.failure()?.errorText ?? '?'}`, type: request.resourceType() })
})

await enter(page, TARGET, { settle: 4000 })

// Navigate the app a little so lazily-loaded resources are requested too.
await page.evaluate(`(() => {
  const bar = document.querySelector('[data-fa-dock]')
  const b = bar && [...bar.querySelectorAll('button')]
    .find((x) => /^(Menu|菜单)$/.test((x.getAttribute('aria-label') || '').trim()))
  if (b) b.click()
})()`)
await page.waitForTimeout(1800)
await page.evaluate(`document.querySelector('.YDXeBa_sessionRow[aria-selected="false"]')?.click()`)
await page.waitForTimeout(4000)

let unexpected = 0
for (const [url, info] of bad) {
  const accepted = isAccepted(url)
  if (!accepted) unexpected += 1
  console.log(`${accepted ? 'ok  ' : 'FAIL'} ${String(info.status).padEnd(18)} ${info.type.padEnd(12)} ${url}`)
  if (accepted) console.log(`       accepted: ${accepted.reason}`)
}

if (bad.size === 0) console.log('ok  no failed or 4xx/5xx responses')
console.log(`\n${bad.size - unexpected} accepted, ${unexpected} unexpected`)

await browser.close()
process.exit(unexpected > 0 ? 1 : 0)
