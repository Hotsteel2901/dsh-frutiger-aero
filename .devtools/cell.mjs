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
const r = await page.evaluate(`(() => {
  const pane = document.querySelector('[data-trajectory-scroll]')
  const rows = [...pane.querySelectorAll('tr[data-trajectory-row-key]')]
  const row = rows.find(r => r.getBoundingClientRect().height > 10 && (r.children[1] || {}).scrollWidth >= 0 && r.getBoundingClientRect().top > 100)
  const cell = row.children[1]
  const out = []
  const walk = (el, d) => {
    if (d > 4) return
    const cs = getComputedStyle(el)
    const b = el.getBoundingClientRect()
    out.push({
      d, tag: el.tagName.toLowerCase(),
      cls: typeof el.className === 'string' ? el.className.split(' ')[0].slice(0, 26) : '',
      display: cs.display,
      overflowX: cs.overflowX,
      overflowY: cs.overflowY,
      whiteSpace: cs.whiteSpace,
      textOverflow: cs.textOverflow,
      box: Math.round(b.width) + 'x' + Math.round(b.height),
      scrollW: el.scrollWidth,
      clientW: el.clientWidth,
      kids: el.children.length,
    })
    for (const c of el.children) walk(c, d + 1)
  }
  walk(cell, 0)
  return { paneScroll: { top: pane.scrollTop, h: pane.scrollHeight, c: pane.clientHeight }, tree: out }
})()`)
console.log('pane:', JSON.stringify(r.paneScroll))
for (const n of r.tree) {
  const clipped = n.scrollW > n.clientW + 4
  console.log(`  ${'  '.repeat(n.d)}${n.tag}.${n.cls} ${n.display} ovfX=${n.overflowX} ws=${n.whiteSpace} ${n.box} scrollW=${n.scrollW} clientW=${n.clientW} kids=${n.kids}${clipped ? '   <-- CLIPS ' + (n.scrollW - n.clientW) + 'px' : ''}`)
}
await browser.close()
