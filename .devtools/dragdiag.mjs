import { launch } from './lib/chromium.mjs'
import { openSession, openTab } from './lib/session.mjs'
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
await openTab(page, '/Trajectory|轨迹/')

const target = await page.evaluate(`(() => {
  const pane = document.querySelector('[data-trajectory-scroll]')
  const row = [...pane.querySelectorAll('tr[data-trajectory-row-key]')].find(r => {
    const b = r.getBoundingClientRect()
    return b.height > 10 && b.top > 200 && b.bottom < window.innerHeight - 200
  })
  if (!row) return null
  const cell = row.children[1]
  const b = cell.getBoundingClientRect()
  const x = Math.round(b.left + b.width * 0.6)
  const y = Math.round(b.top + b.height / 2)
  const at = document.elementFromPoint(x, y)
  const scroller = [...cell.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 4)
  return {
    x, y,
    cellBox: Math.round(b.left) + ',' + Math.round(b.top) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height),
    at: at ? at.tagName.toLowerCase() + '.' + (typeof at.className === 'string' ? at.className.split(' ')[0].slice(0, 26) : '') : null,
    atOverflowX: at ? getComputedStyle(at).overflowX : null,
    atTouchAction: at ? getComputedStyle(at).touchAction : null,
    scrollerCount: scroller.length,
    scrollers: scroller.slice(0, 4).map(e => ({
      cls: typeof e.className === 'string' ? e.className.split(' ')[0].slice(0, 26) : '',
      box: (r => Math.round(r.left) + ',' + Math.round(r.top) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height))(e.getBoundingClientRect()),
      scrollW: e.scrollWidth, clientW: e.clientWidth, ovfX: getComputedStyle(e).overflowX,
    })),
  }
})()`)
console.log('drag target:', JSON.stringify(target, null, 1))

const cdp = await context.newCDPSession(page)
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: target.x, y: target.y }] })
for (let i = 1; i <= 14; i++) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: target.x - i * 11, y: target.y }] })
  await new Promise((r) => setTimeout(r, 16))
}
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
await page.waitForTimeout(900)
console.log('\nafter swipe:', JSON.stringify(await page.evaluate(`(() => {
  const pane = document.querySelector('[data-trajectory-scroll]')
  const nodes = [...pane.querySelectorAll('tr[data-trajectory-row-key] > td:last-child, tr[data-trajectory-row-key] > td:last-child *')]
  const scrollers = nodes.filter(n => n.scrollWidth > n.clientWidth + 4)
  return { scrollers: scrollers.length, scrolled: scrollers.filter(n => n.scrollLeft > 2).length, max: Math.max(0, ...scrollers.map(n => n.scrollLeft)) }
})()`)))
await browser.close()
