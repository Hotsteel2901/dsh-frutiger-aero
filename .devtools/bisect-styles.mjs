import { launch } from './lib/chromium.mjs'
import fs from 'node:fs'
const URL = process.argv[2]
fs.mkdirSync('/tmp/fa-bisect', { recursive: true })
const browser = await launch({ args: ['--no-sandbox'] })
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 })
const page = await context.newPage()
await page.goto(URL, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3200)
await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3400)
await page.locator('[data-fa-dock] button[aria-label="Menu"]').click({ timeout: 5000, force: true })
await page.waitForTimeout(1200)
await page.locator('body').getByText('便携 DSH', { exact: false }).first().click({ timeout: 8000, force: true }).catch(()=>{})
await page.waitForTimeout(8000)
await page.mouse.click(367, 300)
await page.waitForTimeout(2000)

// Measure "faintness": average luminance variance in the transcript band.
const measure = async (label) => {
  const buf = await page.screenshot({ clip: { x: 0, y: 120, width: 390, height: 320 } })
  fs.writeFileSync(`/tmp/fa-bisect/${label}.png`, buf)
  // crude contrast proxy: unique byte count of the PNG (more detail => larger file)
  return buf.length
}
console.log('all sheets on        ', await measure('00-all'))
const ids = await page.evaluate(`[...document.querySelectorAll('style[data-plugin="dsh-frutiger-aero"]')].map(s => s.dataset.pluginCss)`)
for (const id of ids) {
  const key = id.split('/')[1]
  await page.evaluate(`(() => { const s = [...document.querySelectorAll('style[data-plugin="dsh-frutiger-aero"]')].find(x => x.dataset.pluginCss === ${JSON.stringify(id)}); if (s) s.disabled = true })()`)
  await page.waitForTimeout(400)
  console.log(('without ' + key).padEnd(21), await measure('off-' + key))
  await page.evaluate(`(() => { const s = [...document.querySelectorAll('style[data-plugin="dsh-frutiger-aero"]')].find(x => x.dataset.pluginCss === ${JSON.stringify(id)}); if (s) s.disabled = false })()`)
  await page.waitForTimeout(300)
}
// also: scene removed entirely
await page.evaluate(`document.querySelector('[data-fa-scene]')?.remove()`)
await page.waitForTimeout(400)
console.log('no scene             ', await measure('99-no-scene'))
await browser.close()
