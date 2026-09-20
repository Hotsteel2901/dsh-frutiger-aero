import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'
import fs from 'node:fs'
import { openSession } from './lib/session.mjs'

const URL = process.argv[2]
const PROBE = fs.readFileSync('./probes/settings-surface.js', 'utf8')
const browser = await launch({ args: ['--no-sandbox'] })
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'zh-CN' })
const page = await context.newPage()
await page.goto(URL, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3200)
await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3600)
await openSession(page, '便携 DSH', { mobile: true })
await page.waitForTimeout(1500)

console.log('--- before ---')
console.log(JSON.stringify(await page.evaluate('(' + PROBE + ')()'), null, 1))

// exactly what the dock does
await page.evaluate(`(() => {
  const root = document.getElementById('root')
  const el = ['Settings', '设置'].map((n) => root.querySelector('[aria-label=' + JSON.stringify(n) + ']')).find(Boolean)
  if (el) el.click()
  return Boolean(el)
})()`)
await page.waitForTimeout(2500)

console.log('\n--- after tapping the dock Settings button ---')
const after = await page.evaluate('(' + PROBE + ')()')
console.log(JSON.stringify(after, null, 1))
await page.screenshot({ path: '/tmp/fa-settings-phone-after-tap.png' })

// and now what the user has to do: expand the sidebar
await page.evaluate(`(() => {
  const root = document.getElementById('root')
  const el = ['Open sidebar', '打开侧边栏'].map((n) => root.querySelector('[aria-label=' + JSON.stringify(n) + ']')).find(Boolean)
  if (el) el.click()
})()`)
await page.waitForTimeout(2000)
console.log('\n--- after also expanding the sidebar ---')
const expanded = await page.evaluate('(' + PROBE + ')()')
console.log(JSON.stringify({ sidebar: expanded.sidebar, dialogs: expanded.dialogs, dialogsInsideSidebar: expanded.dialogsInsideSidebar, firstDialogChain: expanded.firstDialogChain }, null, 1))
await page.screenshot({ path: '/tmp/fa-settings-phone-expanded.png' })
await browser.close()
