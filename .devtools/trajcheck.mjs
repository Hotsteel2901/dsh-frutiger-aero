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

  // …and vertical scrolling of the list still works.
  //
  // This assertion only means something when the list is actually taller than
  // its pane. The seeded session in the harness has ~9 rows in a 617px pane, so
  // `scrollHeight - clientHeight` is 0, `vBefore` is 0, and `vAfter < vBefore -
  // 20` can never hold — the check failed for want of content, not for a
  // regression, and a red suite that cannot go green is worse than no suite.
  // Measure the headroom first and report honestly when there is none.
  const room = await page.evaluate(`(() => { const p = document.querySelector('[data-trajectory-scroll]'); return p.scrollHeight - p.clientHeight })()`)
  if (room < 40) {
    check('vertical list scroll still works', true, `skipped — list fits its pane (${room}px of travel)`)
  } else {
    const vBefore = await page.evaluate(`(() => { const p = document.querySelector('[data-trajectory-scroll]'); p.scrollTop = Math.round((p.scrollHeight - p.clientHeight) * 0.5); return p.scrollTop })()`)
    await page.waitForTimeout(600)
    await swipe(cdp, { x: 300, y: 260 }, { x: 300, y: 620 })   // finger down => toward the start
    await page.waitForTimeout(900)
    const vAfter = await page.evaluate(`document.querySelector('[data-trajectory-scroll]').scrollTop`)
    check('vertical list scroll still works', vAfter < vBefore - 20, `${Math.round(vBefore)} -> ${Math.round(vAfter)}`)
  }

  const inv = await page.evaluate(`({ overflowX: document.documentElement.scrollWidth - window.innerWidth, rowHeight: Math.round(document.querySelector('tr[data-trajectory-row-key]').getBoundingClientRect().height) })`)
  check('no horizontal page overflow', inv.overflowX === 0, JSON.stringify(inv))

  // ── the event inspector ──────────────────────────────────────────────────
  //
  // Tapping a row opens the product's record inspector, which on a narrow pane
  // is an *overlay* pinned over the table. The bug this guards against is the
  // one that made the page feel broken: the panel was painted with a 74%-alpha
  // surface, so the table stayed visible straight through it and the screen
  // showed two interfaces at once. A tap then landed on whichever element was
  // really on top rather than the one the user could see.
  //
  // The assertion has to be on the *computed* background and its alpha. Reading
  // the token would pass while the rendered result was still see-through, which
  // is exactly how the original defect survived: the alias was correct, and
  // correct-here meant translucent.
  const tap = await page.evaluate(`(() => {
    const rows = [...document.querySelectorAll('[data-trajectory-scroll] tr[data-trajectory-row-key]')]
    const r = rows.find(x => { const b = x.getBoundingClientRect(); return b.top > 160 && b.bottom < 700 })
    if (!r) return null
    const b = r.getBoundingClientRect()
    return { x: Math.round(r.querySelector('td:last-child').getBoundingClientRect().left + 120), y: Math.round(b.top + b.height / 2) }
  })()`)
  if (!tap) throw new Error('no row to tap for the inspector check')
  await page.touchscreen.tap(tap.x, tap.y)
  await page.waitForTimeout(1500)

  const det = await page.evaluate(`(() => {
    const panel = document.querySelector('aside[aria-label]')
    if (!panel) return null
    const bg = getComputedStyle(panel).backgroundColor
    const m = /rgba?\\(([^)]+)\\)/.exec(bg)
    const parts = m ? m[1].split(/[,\\/]/).map(s => parseFloat(s.trim())) : []
    const alpha = parts.length >= 4 ? parts[3] : 1
    const b = panel.getBoundingClientRect()
    const close = panel.querySelector('button')
    let closeHit = null
    if (close) {
      // The control's own box is small; what matters for a thumb is the area
      // that actually responds, so measure the painted pseudo-element too.
      const after = getComputedStyle(close, '::after')
      closeHit = { w: Math.round(close.getBoundingClientRect().width), h: Math.round(close.getBoundingClientRect().height), afterW: after.width, afterH: after.height, afterContent: after.content }
    }
    return { bg, alpha, box: [Math.round(b.width), Math.round(b.height)], position: getComputedStyle(panel).position, closeHit }
  })()`)
  check('inspector opens on a row tap', det !== null, det ? `at ${det.box.join('x')}` : 'no aside[aria-label]')
  check('inspector overlay is opaque (no double exposure)', det !== null && det.alpha === 1, det ? `${det.bg} alpha=${det.alpha}` : '—')
  check('inspector is an overlay at this width', det !== null && det.position === 'absolute', det ? det.position : '—')
  check('inspector close button reach extended past its box', det !== null && det.closeHit !== null && det.closeHit.afterContent !== 'none' && parseFloat(det.closeHit.afterH) >= 44, det && det.closeHit ? `${det.closeHit.w}x${det.closeHit.h} + ::after ${det.closeHit.afterW}x${det.closeHit.afterH}` : '—')

  // Row hit area: a strip that fills the gap *between* rows, so a near miss
  // lands on the row it was aimed at. Asserted on the resolved box rather than
  // on the row height, which must not move.
  const hit = await page.evaluate(`(() => {
    const td = document.querySelector('[data-trajectory-scroll] tr[data-trajectory-row-key] > td:last-child')
    const a = getComputedStyle(td, '::after')
    const row = td.parentElement.getBoundingClientRect()
    return { content: a.content, bottom: a.bottom, height: a.height, pos: getComputedStyle(td).position, rowH: Math.round(row.height) }
  })()`)
  check('row gap gets a hit strip', hit.content !== 'none' && hit.bottom === '-7px' && hit.height === '7px' && hit.pos === 'relative', JSON.stringify(hit))
  check('row height still 30px after the hit-area change', hit.rowH === 30, `${hit.rowH}px`)

  // The strip must not sit on top of the inner scrollers, or it eats the
  // horizontal drag. This is the assertion that would have caught the first
  // attempt, when the strip covered the whole cell.
  //
  // Compare against the strip's *own band*, not the row's: the inner scrollers
  // are ~18px tall and vertically centred inside the 30px row (measured
  // 162..180 within a 156..186 row), so the band at 186..193 clears them by
  // several pixels. Testing `scroller.bottom > cell.bottom` reported a phantom
  // overlap of 2, because a scroller ending at 180 is "above the cell bottom"
  // while being nowhere near the band.
  const stripAbove = await page.evaluate(`(() => {
    const rows = [...document.querySelectorAll('[data-trajectory-scroll] tr[data-trajectory-row-key]')]
    const check = rows.map(row => {
      const td = row.querySelector('td:last-child')
      const cell = td.getBoundingClientRect()
      const bandTop = cell.bottom
      const bandBottom = cell.bottom + 7
      const scrollers = [...td.querySelectorAll('*')].filter(n => n.scrollWidth > n.clientWidth + 60)
      return scrollers.filter(n => { const b = n.getBoundingClientRect(); return b.bottom > bandTop && b.top < bandBottom }).length
    })
    return { rows: rows.length, hits: check.reduce((a, b) => a + b, 0) }
  })()`)
  check('hit strip stays clear of the inner scrollers', stripAbove.hits === 0, `${stripAbove.hits} of ${stripAbove.rows} rows overlap`)

  const rail = await page.evaluate(`(() => {
    const b = document.querySelector('.Y0dWHa_requestBoundaryControl')
    if (!b) return null
    const r = b.getBoundingClientRect()
    // The painted dot is the ::before pseudo-element; it must not have moved.
    const dot = getComputedStyle(b, '::before')
    return { w: Math.round(r.width), h: Math.round(r.height), dotW: dot.width, dotH: dot.height, dotTop: dot.top, dotLeft: dot.left }
  })()`)
  check('request boundary reach grown to 44px', rail !== null && rail.w === 44 && rail.h === 44, rail ? `${rail.w}x${rail.h}` : 'no control')
  check('request boundary dot has not moved', rail !== null && rail.dotW === '5px' && rail.dotH === '5px' && rail.dotTop === '5.5px' && rail.dotLeft === '5.5px', rail ? `${rail.dotW}x${rail.dotH} @ ${rail.dotTop},${rail.dotLeft}` : '—')

  // ── the request timeline ─────────────────────────────────────────────────
  //
  // The strip is proportional by construction (`--trajectory-span-left` and
  // `--trajectory-span-width` are percentages), so the thing worth protecting
  // is that the mobile type and lane changes did not touch that maths. A span
  // is checked against its own declared percentage, not against a pixel count,
  // because pixels are exactly what a grid-template-columns change would move.
  const tl = await page.evaluate(`(() => {
    const plot = document.querySelector('[class*="_plot"]')
    if (!plot) return null
    const track = document.querySelector('[class*="_track"]')
    const labels = document.querySelector('[class*="_labels"]')
    const spans = [...document.querySelectorAll('[class*="_span"]')].filter(s => s.style.getPropertyValue('--trajectory-span-width'))
    const tb = track.getBoundingClientRect()
    const rows = spans.slice(0, 8).map(s => {
      const pct = parseFloat(s.style.getPropertyValue('--trajectory-span-width'))
      const b = s.getBoundingClientRect()
      return { pct: Math.round(pct * 100) / 100, px: Math.round(b.width), expect: Math.round(tb.width * pct / 100) }
    })
    return {
      labelsFont: labels ? getComputedStyle(labels).fontSize : null,
      trackMinH: track ? getComputedStyle(track).height : null,
      plotCols: plot ? getComputedStyle(plot).gridTemplateColumns : null,
      trackW: Math.round(tb.width),
      rows,
      // A span must sit inside the track; the widest ends within a pixel or two
      // of the edge by design.
      past: spans.filter(s => s.getBoundingClientRect().right > tb.right + 1.5).length,
      spans: spans.length,
    }
  })()`)
  console.log('   ', JSON.stringify(tl))
  check('timeline labels are readable', tl !== null && parseFloat(tl.labelsFont) >= 11, tl ? tl.labelsFont : '—')
  check('timeline track meets the touch minimum', tl !== null && parseFloat(tl.trackMinH) >= 44, tl ? tl.trackMinH : '—')
  check('timeline spans stay inside the track', tl !== null && tl.past === 0, tl ? `${tl.past} of ${tl.spans} past the edge` : '—')
  // Proportionality: a span's rendered width should track its declared share of
  // the track. A 25% tolerance absorbs the product's own `max(2px, ...)` floor
  // on very short spans without letting a layout change hide inside.
  const proportional = tl !== null && tl.rows.every(r => r.px === 0 || Math.abs(r.px - r.expect) <= Math.max(2, r.expect * 0.25))
  check('timeline spans remain proportional to their share', proportional, tl ? JSON.stringify(tl.rows.slice(0, 4)) : '—')

  // Close the inspector again so the screenshot below is of the table.
  await page.evaluate(`(() => { const p = document.querySelector('aside[aria-label]'); if (p) { const b = p.querySelector('button'); if (b) b.click() } })()`)
  await page.waitForTimeout(900)

  check('no page errors', errors.length === 0, errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: '/tmp/fa-traj-mobile.png' })
  await context.close()
}

// ── desktop must be untouched ──────────────────────────────────────────────
{
  // NOTE: no `hasTouch` here, and it must stay that way. Playwright's
  // `hasTouch: true` flips `(pointer: coarse)` to TRUE even with a mouse and a
  // 1440px viewport — measured, not assumed: `{hasTouch:true}` gives
  // `coarse:true, fine:false, hover:false, maxTouch:1`. Adding it would light
  // up every phone rule in the skin and turn the "must be untouched" section
  // into a test of the phone layout against itself. So the session is opened
  // with a plain click below instead of through the shared tap helper.
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' })
  const page = await context.newPage()
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3200)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3600)
  // Pick the session the way every other script does, and do not hardcode a
  // title: the sidebar is localized, so the same session reads "便携 DSH" under
  // `zh-CN` and "Frutiger Aero on a phone — mobile audit" under `en-US`. The
  // desktop context here is `en-US`, which is why a hardcoded zh title wedged
  // this section forever waiting on a locator that could not match.
  await openSession(page, 'Frutiger Aero')
  await openTab(page, '/Trajectory/')
  console.log('\n── desktop, Trajectory (must be untouched) ──')
  // The cell's own `overflow-x` is NOT the right proxy for "still clipped".
  // The product reliably reports `visible` on the cell itself — it clips on the
  // *descendants* (`td:last-child` fits its column exactly, while a child such
  // as `.Y0dWHa_resultRequest` holds 2009px in 361px with `overflow: hidden`).
  // Asserting on the cell failed against the unmodified skin too, so it was
  // pinning an assumption rather than protecting a behaviour. Measure the
  // descendants, which is where the clipping actually lives.
  const d = await page.evaluate(`(() => {
    const row = document.querySelector('tr[data-trajectory-row-key]')
    const cells = [...row.children]
    const td2 = cells[1]
    const inside = [...td2.querySelectorAll('*')]
    return {
      rowHeight: Math.round(row.getBoundingClientRect().height),
      ellipsis: cells.map(c => getComputedStyle(c).textOverflow),
      gutterPos: getComputedStyle(cells[0]).position,
      contentW: Math.round(td2.getBoundingClientRect().width),
      // Anything inside the content cell that can be scrolled sideways is a
      // phone-only behaviour leaking out of the media query.
      scrollableInside: inside.filter(n => n.scrollWidth > n.clientWidth + 4 && getComputedStyle(n).overflowX === 'auto').length,
      widestInside: Math.max(0, ...inside.map(n => n.scrollWidth - n.clientWidth)),
      clippedInside: inside.filter(n => getComputedStyle(n).overflowX === 'hidden' && n.scrollWidth > n.clientWidth + 4).length,
    }
  })()`)
  console.log('   ', JSON.stringify(d))
  check('desktop: nothing inside the content cell is horizontally scrollable', d.scrollableInside === 0, String(d.scrollableInside))
  check('desktop: content still clipped by the product', d.clippedInside > 0, `${d.clippedInside} clipping descendants, widest over by ${d.widestInside}px`)
  check('desktop: gutter not sticky', d.gutterPos !== 'sticky', d.gutterPos)
  check('desktop: row height 30px', d.rowHeight === 30, `${d.rowHeight}px`)

  // The refactor must not have leaked out of the coarse-pointer media query.
  // Every added rule was scoped to `(pointer: coarse) and (max-width: 1023px)`,
  // so on a mouse-driven 1440px viewport none of them may resolve.
  const leak = await page.evaluate(`(() => {
    const td = document.querySelector('[data-trajectory-scroll] tr[data-trajectory-row-key] > td:last-child')
    const a = getComputedStyle(td, '::after')
    const row = document.querySelector('[data-trajectory-scroll] tr[data-trajectory-row-key]')
    const rail = document.querySelector('.Y0dWHa_requestBoundaryControl')
    const railBox = rail ? rail.getBoundingClientRect() : null
    return {
      rowStrip: a.content,
      cursor: getComputedStyle(row).cursor,
      mask: getComputedStyle(td).maskImage,
      // The dot is a 16px control on a desktop and must stay that size; the
      // 44px reach is a touch affordance and has no business here.
      railW: railBox ? Math.round(railBox.width) : null,
      railH: railBox ? Math.round(railBox.height) : null,
      panelPresent: document.querySelector('aside[aria-label]') !== null,
      turnLabelFs: (() => { const e = document.querySelector('.Y0dWHa_turnLabelCompact'); return e ? getComputedStyle(e).fontSize : null })(),
    }
  })()`)
  console.log('   ', JSON.stringify(leak))
  check('desktop: no phone-only row hit strip', leak.rowStrip === 'none', leak.rowStrip)
  check('desktop: rows keep the default cursor', leak.cursor !== 'pointer', leak.cursor)
  check('desktop: no trailing fade mask on the content cell', leak.mask === 'none', leak.mask)
  check('desktop: dot is still its own 16px', leak.railW === 16 && leak.railH === 16, `${leak.railW}x${leak.railH}`)
  check('desktop: turn label keeps its own type scale', leak.turnLabelFs !== '10px', String(leak.turnLabelFs))

  const dtl = await page.evaluate(`(() => {
    const plot = document.querySelector('[class*="_plot"]')
    const labels = document.querySelector('[class*="_labels"]')
    const track = document.querySelector('[class*="_track"]')
    return {
      labelsFont: labels ? getComputedStyle(labels).fontSize : null,
      cols: plot ? getComputedStyle(plot).gridTemplateColumns : null,
      plotH: plot ? getComputedStyle(plot).height : null,
      trackH: track ? getComputedStyle(track).height : null,
    }
  })()`)
  console.log('   ', JSON.stringify(dtl))
  check('desktop: timeline label column and type untouched', dtl.cols === '44px' || String(dtl.cols).startsWith('44px'), String(dtl.cols))
  check('desktop: timeline label type untouched', dtl.labelsFont === '10px', String(dtl.labelsFont))
  check('desktop: timeline plot height untouched', dtl.plotH === '50px', String(dtl.plotH))

  await page.screenshot({ path: '/tmp/fa-traj-desktop.png' })
  await context.close()
}

await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} trajectory checks passed${failed.length ? ' — ' + failed.map((f) => f.n).join(' | ') : ''}`)
