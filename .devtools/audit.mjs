// Audit every showcase.css selector across every state the app can be in.
import { launch } from './lib/chromium.mjs'
import { freshPage } from './lib/gates.mjs'
import { openSession } from './lib/session.mjs'
const TARGET = process.argv[2]
const browser = await launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const page = await freshPage(browser, { viewport: { width: 1440, height: 900 } })
await page.addInitScript(() => { try { localStorage.setItem('frutiger-aero:effects', 'full') } catch (e) { void e } })
const probe = async () => page.evaluate('(() => {\n' +
  '  const sc = document.querySelector("[data-plugin-css=\\"dsh-frutiger-aero/showcase\\"]")\n' +
  '  const out = []\n' +
  '  const walk = (rules, base) => { for (const r of rules) { if (r.cssRules && r.conditionText !== undefined) { walk(r.cssRules, base); continue } if (!r.selectorText) continue; let n = 0; for (const s of r.selectorText.replace(/::[a-z-]+/g, "").split(",")) { try { n += document.querySelectorAll(s.trim()).length } catch (e) { n = -1 } } out.push([r.selectorText, n]) } }\n' +
  '  if (sc) walk(sc.sheet.cssRules, "")\n' +
  '  return out\n' +
  '})()')
await page.goto(TARGET, { waitUntil: 'domcontentloaded' })
// Sample hard through the boot window: the boot surface exists for ~600ms.
let best = null
for (let i = 0; i < 26; i += 1) {
  const rows = await probe()
  if (best === null || best.length !== rows.length) { best = rows; continue }
  else for (let j = 0; j < rows.length; j += 1) if (rows[j][1] > best[j][1]) best[j][1] = rows[j][1]
  await page.waitForTimeout(60)
}
for (let i = 0; i < 22; i += 1) {
  const rows = await probe()
  for (let j = 0; j < rows.length; j += 1) if (rows[j][1] > best[j][1]) best[j][1] = rows[j][1]
  await page.waitForTimeout(150)
}
try { await openSession(page, /mobile/i) } catch (e) { console.log('openSession: ' + String(e).slice(0, 120)) }
for (let i = 0; i < 16; i += 1) {
  const rows = await probe()
  for (let j = 0; j < rows.length; j += 1) if (rows[j][1] > best[j][1]) best[j][1] = rows[j][1]
  await page.waitForTimeout(200)
}
// Open the right panel and the settings dialog, then sample again.
await page.evaluate('(() => { const t = document.querySelector("[data-sidebar-right-toggle]"); if (t) t.click() })()')
await page.waitForTimeout(2000)
for (let i = 0; i < 10; i += 1) {
  const rows = await probe()
  for (let j = 0; j < rows.length; j += 1) if (rows[j][1] > best[j][1]) best[j][1] = rows[j][1]
  await page.waitForTimeout(200)
}
for (const [sel, n] of best) console.log((n === 0 ? 'DEAD' : '    ') + ' ' + String(n).padStart(5) + '  ' + sel.slice(0, 94))
console.log()
console.log('dead: ' + best.filter((x) => x[1] === 0).length + ' / ' + best.length)
await page.__faContext?.close()
await browser.close()
