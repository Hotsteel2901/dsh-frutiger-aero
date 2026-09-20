import { launch } from './lib/chromium.mjs'
import sharp from 'sharp'
import fs from 'node:fs'
const URL = process.argv[2]
fs.mkdirSync('/tmp/fa-lum2', { recursive: true })
const browser = await launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })

const stats = async (file) => {
  const { data } = await sharp(file).greyscale().raw().toBuffer({ resolveWithObject: true })
  let sum = 0, sum2 = 0
  for (let i = 0; i < data.length; i++) { sum += data[i]; sum2 += data[i] * data[i] }
  const mean = sum / data.length
  return { mean: +mean.toFixed(1), sd: +Math.sqrt(sum2 / data.length - mean * mean).toFixed(1) }
}

/** Every variant gets its own page, so nothing is cumulative. */
async function variant(label, setup) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3200)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3600)
  if (setup) { await page.evaluate(setup); await page.waitForTimeout(500) }
  await page.locator('[data-fa-dock] button[aria-label="Menu"]').click({ force: true }); await page.waitForTimeout(1300)
  await page.locator('body').getByText('便携 DSH', { exact: false }).first().click({ timeout: 9000, force: true }).catch(() => {})
  await page.waitForTimeout(9000)
  await page.touchscreen.tap(374, 300); await page.waitForTimeout(1800)
  const file = `/tmp/fa-lum2/${label}.png`
  await page.screenshot({ path: file, clip: { x: 0, y: 130, width: 390, height: 300 } })
  const s = await stats(file)
  console.log(`${label.padEnd(22)} mean=${String(s.mean).padStart(5)} sd=${String(s.sd).padStart(5)}`)
  await context.close()
  return s.sd
}

const kill = (name) => `document.querySelectorAll('style[data-plugin="dsh-frutiger-aero"]').forEach(s => { if (s.dataset.pluginCss.endsWith('/${name}')) s.disabled = true })`

await variant('baseline', null)
await variant('scene-removed', `document.querySelector('[data-fa-scene]')?.remove()`)
await variant('no-material', kill('material'))
await variant('no-base', kill('base'))
await variant('no-mobile', kill('mobile'))
await variant('no-effects', kill('effects'))
await variant('no-scenery-css', kill('scenery'))
await variant('all-off', `document.querySelectorAll('style[data-plugin="dsh-frutiger-aero"]').forEach(s => { s.disabled = true }); document.querySelector('[data-fa-scene]')?.remove()`)
await browser.close()
