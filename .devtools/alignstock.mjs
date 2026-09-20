import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'
import fs from 'node:fs'

/* The same alignment probe against a **stock** profile.
 *
 * It cannot use lib/session.mjs: `data-fa-drawer` is this plugin's attribute and
 * does not exist without it. Stock is driven the way stock is driven — by its
 * own English labels — which is fine here because the whole point of this run is
 * to find out whether the geometry the skin reports also exists without it. */
const URL = process.argv[2]
const PROBE = fs.readFileSync('./probes/alignment.js', 'utf8')
const browser = await launch({ args: ['--no-sandbox'] })
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'en-US' })
const page = await context.newPage()
await page.goto(URL, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3500)

const clickLabel = (name) => page.evaluate(`(() => {
  const el = document.querySelector('[aria-label=' + JSON.stringify(${JSON.stringify(name)}) + ']')
  if (!el) return false
  el.click(); return true
})()`)

if (await clickLabel('Open sidebar')) await page.waitForTimeout(1600)
const session = page.locator('body').getByText('便携 DSH', { exact: false }).first()
if (await session.count()) await session.click({ timeout: 9000, force: true }).catch(() => {})
await page.waitForTimeout(9000)
if (await clickLabel('Collapse sidebar')) await page.waitForTimeout(1600)
await page.waitForTimeout(800)

const r = await page.evaluate('(' + PROBE + ')()')
console.log('### STOCK / chat')
console.log('  off-centre:', r.offCentre.length)
for (const o of r.offCentre) console.log(`    dx=${String(o.dx).padStart(6)} dy=${String(o.dy).padStart(6)}  ${o.box.padEnd(22)} ${JSON.stringify(o.label)}  ${o.where}`)
console.log('  clipped:', r.clipped.length)
const byClass = {}
for (const c of r.clipped) {
  const key = (c.where.split(' < ')[0] || '').slice(0, 40)
  byClass[key] = (byClass[key] || 0) + 1
}
for (const [k, v] of Object.entries(byClass)) console.log(`    ${String(v).padStart(3)}x  ${k}`)
await page.screenshot({ path: '/tmp/fa-align-stock.png' })
await browser.close()
