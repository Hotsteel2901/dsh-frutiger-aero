import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'
import { openSession, openTab } from './lib/session.mjs'
const URL = process.argv[2]
const browser = await launch({ args: ['--no-sandbox'] })
const results = []
const check = (n, ok, d) => { results.push({ n, ok }); console.log((ok ? 'PASS ' : 'FAIL ') + n.padEnd(46) + (d ?? '')) }

async function swipe(cdp, from, to, steps = 14) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x, y: from.y }] })
  for (let i = 1; i <= steps; i++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: Math.round(from.x + ((to.x - from.x) * i) / steps), y: Math.round(from.y + ((to.y - from.y) * i) / steps) }],
    })
    await new Promise((r) => setTimeout(r, 16))
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

// ── phone ──────────────────────────────────────────────────────────────────
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'zh-CN' })
  const page = await context.newPage()
  const cdp = await context.newCDPSession(page)
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 140)))
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3200)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3600)
  await openSession(page, '便携 DSH', { mobile: true })
  await openTab(page, '/Trajectory|轨迹/')
  console.log('\n── phone, Trajectory ──')

  const before = await page.evaluate(`(() => {
    const pane = document.querySelector('[data-trajectory-scroll]')
    const row = [...pane.querySelectorAll('tr[data-trajectory-row-key]')].find(r => r.getBoundingClientRect().height > 10)
    const cells = [...row.children]
    return {
      rowHeight: Math.round(row.getBoundingClientRect().height),
      cellHeights: cells.map(c => Math.round(c.getBoundingClientRect().height)),
      cellWs: cells.map(c => getComputedStyle(c).whiteSpace),
      cellOvf: cells.map(c => getComputedStyle(c).overflowX),
      cellEllipsis: cells.map(c => getComputedStyle(c).textOverflow),
      gutterSticky: getComputedStyle(cells[0]).position,
      contentScrollW: cells[1].scrollWidth,
      contentClientW: cells[1].clientWidth,
      paneScrollTop: pane.scrollTop,
    }
  })()`)
  console.log('   ', JSON.stringify(before))
  check('row height unchanged at 30px (virtualiser intact)', before.rowHeight === 30, `${before.rowHeight}px`)
  check('truncation now shows an ellipsis', before.cellEllipsis[1] === 'ellipsis', before.cellEllipsis.join(','))
  check('content cell scrolls horizontally', before.cellOvf[1] === 'auto', before.cellOvf.join(','))
  check('timeline gutter is pinned', before.gutterSticky === 'sticky', before.gutterSticky)

  // Drag the scroller itself, found by its geometry.
  //
  // Picking a row and dragging from a fraction of its width looked reasonable
  // and was flaky: a row's content is several nested spans, and the point that
  // lands on the *scrolling* one depends on how long that row's text happens to
  // be. Two runs, two different rows, two different answers. Ask for a scroller
  // and drag from its centre.
  const cellBox = await page.evaluate(`(() => {
    const pane = document.querySelector('[data-trajectory-scroll]')
    const nodes = [...pane.querySelectorAll('tr[data-trajectory-row-key] > td:last-child *')]
    const scroller = nodes.find((n) => {
      const b = n.getBoundingClientRect()
      return n.scrollWidth > n.clientWidth + 60 && b.width > 60 && b.top > 140 && b.bottom < window.innerHeight - 180
    })
    if (!scroller) return null
    const b = scroller.getBoundingClientRect()
    return { x: Math.round(b.left + Math.min(b.width, 90) / 2), y: Math.round(b.top + b.height / 2) }
  })()`)
  if (!cellBox) throw new Error('no on-screen horizontal scroller found in the trajectory')
  await swipe(cdp, { x: cellBox.x, y: cellBox.y }, { x: Math.max(6, cellBox.x - 150), y: cellBox.y })
  await page.waitForTimeout(900)
  // The scrollers are the *descendants* that used to clip — the cell itself
  // fits its column exactly, so its own scrollLeft is always 0.
  const after = await page.evaluate(`(() => {
    const pane = document.querySelector('[data-trajectory-scroll]')
    const nodes = [...pane.querySelectorAll('tr[data-trajectory-row-key] > td:last-child, tr[data-trajectory-row-key] > td:last-child *')]
    const scrollers = nodes.filter(n => n.scrollWidth > n.clientWidth + 4)
    return {
      scrollerCount: scrollers.length,
      anyScrolled: scrollers.some(n => n.scrollLeft > 4),
      maxScrollLeft: Math.max(0, ...scrollers.map(n => n.scrollLeft)),
      widest: Math.max(0, ...scrollers.map(n => n.scrollWidth - n.clientWidth)),
    }
  })()`)
  check('a long line can be dragged into view', after.anyScrolled, JSON.stringify(after))

  // …and vertical scrolling of the list still works
  const vBefore = await page.evaluate(`(() => { const p = document.querySelector('[data-trajectory-scroll]'); p.scrollTop = Math.round((p.scrollHeight - p.clientHeight) * 0.5); return p.scrollTop })()`)
  await page.waitForTimeout(600)
  await swipe(cdp, { x: 300, y: 260 }, { x: 300, y: 620 })   // finger down => toward the start
  await page.waitForTimeout(900)
  const vAfter = await page.evaluate(`document.querySelector('[data-trajectory-scroll]').scrollTop`)
  check('vertical list scroll still works', vAfter < vBefore - 20, `${Math.round(vBefore)} -> ${Math.round(vAfter)}`)

  const inv = await page.evaluate(`({ overflowX: document.documentElement.scrollWidth - window.innerWidth, rowHeight: Math.round(document.querySelector('tr[data-trajectory-row-key]').getBoundingClientRect().height) })`)
  check('no horizontal page overflow', inv.overflowX === 0, JSON.stringify(inv))
  check('no page errors', errors.length === 0, errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: '/tmp/fa-traj-mobile.png' })
  await context.close()
}

// ── desktop must be untouched ──────────────────────────────────────────────
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' })
  const page = await context.newPage()
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3200)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3600)
  await page.locator('body').getByText('便携 DSH', { exact: false }).first().click({ timeout: 9000, force: true })
  await page.waitForTimeout(9000)
  await openTab(page, '/Trajectory/')
  console.log('\n── desktop, Trajectory (must be untouched) ──')
  const d = await page.evaluate(`(() => {
    const row = document.querySelector('tr[data-trajectory-row-key]')
    const cells = [...row.children]
    return {
      rowHeight: Math.round(row.getBoundingClientRect().height),
      ovf: cells.map(c => getComputedStyle(c).overflowX),
      ellipsis: cells.map(c => getComputedStyle(c).textOverflow),
      gutterPos: getComputedStyle(cells[0]).position,
      contentW: Math.round(cells[1].getBoundingClientRect().width),
    }
  })()`)
  console.log('   ', JSON.stringify(d))
  check('desktop: content still clipped, not scrollable', d.ovf[1] === 'hidden', d.ovf.join(','))
  check('desktop: gutter not sticky', d.gutterPos !== 'sticky', d.gutterPos)
  check('desktop: row height 30px', d.rowHeight === 30, `${d.rowHeight}px`)
  await page.screenshot({ path: '/tmp/fa-traj-desktop.png' })
  await context.close()
}

await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} trajectory checks passed${failed.length ? ' — ' + failed.map((f) => f.n).join(' | ') : ''}`)
