import { launch } from './lib/chromium.mjs'
import { openSession } from './lib/session.mjs'
const URL = process.argv[2]
const browser = await launch({ args: ['--no-sandbox'] })
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'zh-CN' })
const page = await context.newPage()
await page.goto(URL, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3200)
await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3600)
await openSession(page, '便携 DSH', { mobile: true })
const probe = () => page.evaluate(`(() => {
  const col = document.querySelector('[data-fa-col="sidebar"]')
  const inSidebar = col ? col.querySelectorAll('[role="dialog"]').length : -1
  const anywhere = document.querySelectorAll('[role="dialog"]').length
  const panel = col && col.querySelector('[role="dialog"]')
  return {
    dialogsAnywhere: anywhere,
    dialogsInSidebar: inSidebar,
    panelDisplay: panel ? getComputedStyle(panel).display : null,
    panelVisibility: panel ? getComputedStyle(panel).visibility : null,
    panelBox: panel ? (b => Math.round(b.width) + 'x' + Math.round(b.height))(panel.getBoundingClientRect()) : null,
    hasNavChild: panel ? panel.querySelector(':scope > nav') !== null : null,
  }
})()`)
console.log('before open  :', JSON.stringify(await probe()))
await page.evaluate(`(() => { const r = document.getElementById('root'); const el = ['Open sidebar','打开侧边栏'].map(n => r.querySelector('[aria-label=' + JSON.stringify(n) + ']')).find(Boolean); if (el) el.click() })()`)
await page.waitForTimeout(1500)
await page.evaluate(`(() => { const r = document.getElementById('root'); const el = ['Settings','设置'].map(n => r.querySelector('[aria-label=' + JSON.stringify(n) + ']')).find(Boolean); if (el) el.click() })()`)
await page.waitForTimeout(2500)
console.log('after open   :', JSON.stringify(await probe()))
await page.keyboard.press('Escape'); await page.waitForTimeout(1800)
console.log('after Escape :', JSON.stringify(await probe()))
await browser.close()
