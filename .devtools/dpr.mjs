import { launch } from './lib/chromium.mjs'
import fs from 'node:fs'
const URL = process.argv[2]
fs.mkdirSync('/tmp/fa-dpr', { recursive: true })
const browser = await launch({ args: ['--no-sandbox'] })
for (const dpr of [1, 2, 3]) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: dpr })
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
  await page.waitForTimeout(2200)
  await page.screenshot({ path: `/tmp/fa-dpr/dpr${dpr}.png`, clip: { x: 0, y: 140, width: 390, height: 260 } })
  console.log('dpr', dpr, 'done')
  await context.close()
}
await browser.close()
