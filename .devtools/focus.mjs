import { launch } from './lib/chromium.mjs'
import { freshPage } from './lib/gates.mjs'
import { openSession } from './lib/session.mjs'
const browser = await launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const page = await freshPage(browser, { viewport: { width: 1440, height: 900 } })
await page.addInitScript(() => { try { localStorage.setItem('frutiger-aero:effects', 'full') } catch (e) { void e } })
await page.goto(process.argv[2], { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3500)
await openSession(page, /mobile/i)
await page.waitForTimeout(3000)
const before = await page.evaluate('(() => { const s = document.querySelector("[data-composer-stats]"); return s ? getComputedStyle(s).opacity : "absent" })()')
// Click a real control inside the composer so :focus-within can hold.
const spot = await page.evaluate('(() => { const e = document.querySelector("[data-composer-card] button, [data-composer-card] [role=button], [data-composer-input]"); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) } })()')
if (spot) { await page.mouse.click(spot.x, spot.y); await page.waitForTimeout(600) }
const state = await page.evaluate('(() => ({ within: !!document.querySelector("[data-composer-card]:focus-within"), tag: document.activeElement ? document.activeElement.tagName + "." + String(document.activeElement.className).slice(0, 40) : "none" }))()')
const after = await page.evaluate('(() => { const s = document.querySelector("[data-composer-stats]"); return s ? getComputedStyle(s).opacity : "absent" })()')
console.log('focus-within=' + state.within + ' active=' + state.tag)
console.log('composer-stats opacity: ' + before + ' -> ' + after)
console.log(Number(after) > Number(before) ? 'PASS  the composer stats brighten on focus' : 'FAIL  no change')
await browser.close()
