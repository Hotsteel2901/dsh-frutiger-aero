import { launch } from './lib/chromium.mjs'
import fs from 'node:fs'

const URL = process.argv[2]
const RAW = '/tmp/fa-shots'
fs.mkdirSync(RAW, { recursive: true })
const browser = await launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })

const DESKTOP = { width: 1440, height: 900 }
const PHONE = { width: 390, height: 844 }

const closeDrawer = async (page) => {
  if (await page.evaluate(`document.body.hasAttribute('data-fa-drawer')`)) {
    await page.touchscreen.tap(374, 300).catch(() => {})
    await page.waitForTimeout(1500)
  }
}
const openDrawer = async (page) => {
  const dock = page.locator('[data-fa-dock] button[aria-label="Menu"]')
  if (await dock.count()) await dock.click({ force: true })
  await page.waitForTimeout(1400)
}
const scrollMid = (page) => page.evaluate(`(() => { const s = document.querySelector('[data-conversation-scroll]'); if (s) s.scrollTop = Math.round((s.scrollHeight - s.clientHeight) * 0.40) })()`)
/**
 * The colour scheme is a *durable user setting*, persisted server-side — so
 * whichever scheme a shot leaves behind is the one the next context loads.
 * Every shot therefore states the scheme it wants instead of inheriting it.
 */
const setScheme = async (page, label, mobile) => {
  if (await page.evaluate(`document.body.hasAttribute('data-fa-drawer')`)) await closeDrawer(page)
  const opener = mobile
    ? page.locator('[data-fa-dock] button[aria-label="Settings"]')
    : page.locator('[aria-label="Settings"]').first()
  if ((await opener.count()) === 0) return
  await opener.click({ force: true })
  await page.waitForTimeout(2400)
  await page.locator('[role="dialog"] button, [role="dialog"] [role="radio"], [role="dialog"] label').filter({ hasText: new RegExp(`^${label}$`) }).first().click({ force: true }).catch(() => {})
  await page.waitForTimeout(1800)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(1600)
  if (await page.evaluate(`document.body.hasAttribute('data-fa-drawer')`)) await closeDrawer(page)
}

async function load(viewport, dpr, mobile, colorScheme) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile, colorScheme })
  const page = await context.newPage()
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3200)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3600)
  if (mobile) await openDrawer(page)
  await page.locator('body').getByText('便携 DSH', { exact: false }).first().click({ timeout: 9000, force: true }).catch(() => {})
  await page.waitForTimeout(9000)
  await closeDrawer(page)
  return { context, page }
}

async function shot(name, viewport, dpr, mobile, prepare, scheme) {
  const { context, page } = await load(viewport, dpr, mobile, scheme === 'Dark' ? 'dark' : 'light')
  if (prepare) await prepare(page)
  await page.screenshot({ path: `${RAW}/${name}.png` })
  console.log('shot', name)
  await context.close()
}

await shot('desktop-light', DESKTOP, 2, false, async (p) => { await scrollMid(p); await p.waitForTimeout(1600) }, 'Light')
await shot('desktop-dark', DESKTOP, 2, false, async (p) => { await scrollMid(p); await p.waitForTimeout(1600) }, 'Dark')
await shot('desktop-settings', DESKTOP, 2, false, async (p) => {
  await p.locator('[aria-label="Settings"]').first().click({ force: true }); await p.waitForTimeout(2400)
}, 'Light')
await shot('phone-light', PHONE, 3, true, async (p) => { await p.waitForTimeout(800) }, 'Light')
await shot('phone-dark', PHONE, 3, true, async (p) => { await p.waitForTimeout(800) }, 'Dark')
await shot('phone-drawer', PHONE, 3, true, async (p) => { await openDrawer(p) }, 'Light')
await shot('phone-preview', PHONE, 3, true, async (p) => {
  const link = p.locator('[data-fa-canvas] button:has-text("install.mjs")').first()
  await link.scrollIntoViewIfNeeded().catch(() => {})
  await p.waitForTimeout(800)
  const b = await link.boundingBox()
  if (b) { await p.touchscreen.tap(Math.round(b.x + b.width / 2), Math.round(b.y + b.height / 2)); await p.waitForTimeout(3200) }
}, 'Light')
await browser.close()
console.log('done')
