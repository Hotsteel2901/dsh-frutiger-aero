import { chromium } from 'playwright-core'
import { openSession } from './lib/session.mjs'
const URL = process.argv[2]
const browser = await chromium.launch({ args: ['--no-sandbox'] })
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'zh-CN' })
const page = await context.newPage()
await page.goto(URL, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3200)
await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3600)
await openSession(page, '便携 DSH', { mobile: true })
await page.evaluate(`(() => { const r = document.getElementById('root'); const el = ['Open sidebar','打开侧边栏'].map(n => r.querySelector('[aria-label=' + JSON.stringify(n) + ']')).find(Boolean); if (el) el.click() })()`)
await page.waitForTimeout(1500)
await page.evaluate(`(() => { const r = document.getElementById('root'); const el = ['Settings','设置'].map(n => r.querySelector('[aria-label=' + JSON.stringify(n) + ']')).find(Boolean); if (el) el.click() })()`)
await page.waitForTimeout(2500)

const report = () => page.evaluate(`(() => {
  const panel = document.querySelector('[role="dialog"]')
  const col = document.querySelector('[data-fa-col="sidebar"]')
  const cs = getComputedStyle(panel)
  const colCs = getComputedStyle(col)
  const b = panel.getBoundingClientRect()
  return {
    panelPosition: cs.position,
    panelInset: [cs.top, cs.right, cs.bottom, cs.left].join(' '),
    panelBox: Math.round(b.width) + 'x' + Math.round(b.height) + '@' + Math.round(b.left) + ',' + Math.round(b.top),
    colTransform: colCs.transform,
    colVisibility: colCs.visibility,
    colLeft: colCs.left,
    colPosition: colCs.position,
    colBox: (x => Math.round(x.width) + 'x' + Math.round(x.height) + '@' + Math.round(x.left))(col.getBoundingClientRect()),
  }
})()`)

console.log('drawer OPEN (panel visible) :', JSON.stringify(await report(), null, 1))

// Simulate the fix: drop the transform, move the column with `left` instead.
await page.evaluate(`(() => {
  const col = document.querySelector('[data-fa-col="sidebar"]')
  col.style.setProperty('transform', 'none', 'important')
  col.style.setProperty('left', '-102%', 'important')
})()`)
await page.waitForTimeout(900)
console.log('\nwith transform:none + left:-102% :', JSON.stringify(await report(), null, 1))
await page.screenshot({ path: '/tmp/fa-settings-fix-probe.png' })
await browser.close()
