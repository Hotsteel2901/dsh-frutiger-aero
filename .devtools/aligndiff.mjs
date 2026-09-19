import { chromium } from 'playwright-core'
import fs from 'node:fs'

/* Off-centre items that exist **only** with the skin.
 *
 * The probe's metric — painted centre versus box centre — genuinely flags
 * left-aligned content, which the product is full of and which is not a defect
 * (a menu row's label belongs on the left). So the report is only actionable as
 * a *difference*: run the same viewport against a stock profile and keep only
 * what the skin introduces. Everything else is the product being itself. */
const PROBE = fs.readFileSync('./probes/alignment.js', 'utf8')
const browser = await chromium.launch({ args: ['--no-sandbox'] })

async function scan(url, locale, labels) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3400)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3600)
  await page.evaluate(`(() => { const el = document.querySelector('[aria-label=' + JSON.stringify(${JSON.stringify(labels.open)}) + ']'); if (el) el.click() })()`)
  await page.waitForTimeout(1600)
  const s = page.locator('body').getByText('便携 DSH', { exact: false }).first()
  if (await s.count()) await s.click({ timeout: 9000, force: true }).catch(() => {})
  await page.waitForTimeout(9000)
  await page.evaluate(`(() => { const el = document.querySelector('[aria-label=' + JSON.stringify(${JSON.stringify(labels.close)}) + ']'); if (el) el.click() })()`)
  await page.waitForTimeout(1400)
  const r = await page.evaluate('(' + PROBE + ')()')
  await context.close()
  // Identify by structure, not by label: labels differ between the two runs.
  const shape = (o) => {
    const parts = o.where.split(' < ')
    const last = parts[parts.length - 1] || ''
    const first = parts[0] || ''
    return first.replace(/\.[A-Za-z0-9_-]+/, '') + ' | ' + last.replace(/\.[A-Za-z0-9_-]+/, '')
  }
  return r.offCentre.map((o) => ({ shape: shape(o), label: o.label, dx: o.dx, dy: o.dy, box: o.box }))
}

const stock = await scan(process.argv[2], 'en-US', { open: 'Open sidebar', close: 'Collapse sidebar' })
const skin = await scan(process.argv[3], 'zh-CN', { open: '打开侧边栏', close: '收起侧边栏' })

const stockShapes = new Set(stock.map((o) => o.shape))
const introduced = skin.filter((o) => !stockShapes.has(o.shape))

console.log(`stock off-centre items : ${stock.length}`)
for (const o of stock) console.log('   ', String(o.dx).padStart(7), o.box.padEnd(14), o.shape)
console.log(`\nskin off-centre items  : ${skin.length}`)
console.log(`introduced by the skin : ${introduced.length}`)
for (const o of introduced) console.log('   ', String(o.dx).padStart(7), o.box.padEnd(14), o.shape, JSON.stringify(o.label))
await browser.close()
process.exit(introduced.length === 0 ? 0 : 1)
