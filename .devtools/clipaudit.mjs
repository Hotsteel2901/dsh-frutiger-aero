/**
 * Text-clipping audit.
 *
 * Why this exists
 * ---------------
 * Four separate "the label is clipped" findings this session turned out to be
 * artefacts of the *measurement*, not defects in the product:
 *
 *   1. `scrollWidth > clientWidth` — fires on elements that are provably fine.
 *      A 20px close button reports scrollWidth 32; the tab strip reports
 *      392/390. Both include absolutely-positioned descendants and scroll room
 *      that has nothing to do with the text.
 *   2. `textContent` equality on a leaf node — never matches when the label
 *      lives in a node that also has element children (an icon, a close
 *      button), so the search silently returns nothing and looks like a pass.
 *   3. `clientWidth` on a `display: inline` element — always 0. Comparing a
 *      measured text width against it reports clipping on *every* inline run.
 *   4. Measuring the element you found rather than the one that is visible —
 *      the desktop frame stays in the DOM at phone widths, so a `0x0` copy of
 *      the same label sits there and answers every question about its size.
 *
 * The one honest test is the one the browser itself uses to decide whether to
 * paint an ellipsis: lay the text out in a Range and compare its width against
 * the *content box* of its containing block. This module does that, and refuses
 * to report on anything it cannot measure correctly.
 *
 * Usage: node .devtools/clipaudit.mjs <tokenised-url>
 */
import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'

const URL = process.argv[2]
const PHONE = { width: 390, height: 844 }

/**
 * The measurement, injected into the page.
 *
 * Returns every text run inside the current viewport, with the three numbers
 * that matter: how wide the text lays out (`textW`), how wide the box that has
 * to hold it is (`contentW`), and whether the run is even measurable.
 */
const PROBE = `(() => {
  /**
   * The screen-reader pattern: a 1x1 absolutely-positioned, clipped box that
   * carries a label for assistive tech and is never meant to be seen.
   *   clip:rect(0 0 0 0); width:1px; height:1px; position:absolute; overflow:hidden
   * Both the chat and the settings bundles ship it (.xzv4MW_visuallyHidden,
   * .VOzbGW_hiddenLabel). Its text measures ~34px in a 1px box, so it looks
   * exactly like a severe clip — and it is correct. Match the *mechanism*,
   * not the class name, so a new bundle with a new hash is still covered.
   */
  const isSrOnly = (e) => {
    const c = getComputedStyle(e)
    if (c.display === 'contents') return false
    return c.position === 'absolute'
      && c.overflow !== 'visible'
      && e.clientWidth <= 2
      && e.clientHeight <= 2
      && (e.getBoundingClientRect().width <= 2 && e.getBoundingClientRect().height <= 2)
  }
  /**
   * True when anything in the ancestor chain is the screen-reader box. The
   * text node's own parent may be a display:contents wrapper — the settings
   * bundle nests one inside the clipped span — so testing only the immediate
   * parent misses it and reports a false clip.
   */
  const insideSrOnly = (e) => {
    for (let n = e; n && n !== document.body; n = n.parentElement) if (isSrOnly(n)) return true
    return false
  }
  const isVisible = (e) => {
    for (let n = e; n && n !== document.body; n = n.parentElement) {
      const c = getComputedStyle(n)
      if (c.visibility === 'hidden' || c.display === 'none' || parseFloat(c.opacity) === 0) return false
      // A 0x0 box is the tell that hid the desktop frame's twin labels — EXCEPT
      // when the element is display:contents, which generates no box at all by
      // design and lets its children lay out in the grandparent. Flagging those
      // as invisible silently discarded every text run in the app: it reported
      // a pristine "0 clipped, PASS" on a tree of nine perfectly visible labels.
      if (c.display === 'contents') continue
      const r = n.getBoundingClientRect()
      if (r.width === 0 && r.height === 0 && n !== document.body) return false
    }
    return true
  }
  // Walk from #root, not document.body. The app mounts entirely under #root,
  // and a body-scoped walker finds 13 text nodes (the boot scripts and the
  // off-screen preview frames) — it reports a clean sheet and means nothing.
  const scope = document.getElementById('root') || document.body
  const runs = []
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT)
  let n
  while ((n = walker.nextNode())) {
    const text = (n.textContent || '').trim()
    if (!text) continue
    const el = n.parentElement
    if (!el) continue
    const cs = getComputedStyle(el)
    // clientWidth is 0 on an inline element, and a measured text width
    // compared against it reports clipping on every inline run. Skip them:
    // an inline box cannot clip its own text.
    if (cs.display === 'inline') continue
    if (insideSrOnly(el)) continue
    if (!isVisible(el)) continue
    const range = document.createRange()
    range.selectNodeContents(n)
    const textW = range.getBoundingClientRect().width
    // The containing block is what actually clips: an ancestor with
    // overflow != visible. Walk up to find the nearest one.
    let clipEl = null
    for (let p = el; p && p !== document.body; p = p.parentElement) {
      const pc = getComputedStyle(p)
      if (pc.overflowX !== 'visible' || pc.overflowY !== 'visible') { clipEl = p; break }
    }
    const box = clipEl || el
    const bcs = getComputedStyle(box)
    const pad = (parseFloat(bcs.paddingLeft) || 0) + (parseFloat(bcs.paddingRight) || 0)
    const border = (parseFloat(bcs.borderLeftWidth) || 0) + (parseFloat(bcs.borderRightWidth) || 0)
    const contentW = box.clientWidth - pad - border
    const elCs = cs
    runs.push({
      text: text.slice(0, 4),
      el: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ')[0] : ''),
      clip: box === el ? null : box.tagName.toLowerCase() + (typeof box.className === 'string' && box.className ? '.' + box.className.split(' ')[0] : ''),
      textW: Math.round(textW),
      contentW: Math.round(contentW),
      over: Math.round(textW - contentW),
      nowrap: elCs.whiteSpace !== 'normal',
      ellipsis: elCs.textOverflow === 'ellipsis',
      // A run is only *clipped* when it cannot wrap, its box genuinely cannot
      // hold it, and the ancestor does not opportunistically scroll it into
      // view instead. Ellipsis is a deliberate, readable outcome, not a bug.
      clipped: elCs.whiteSpace !== 'normal' && textW > contentW + 1 && !elCs.textOverflow.includes('ellipsis'),
      scrollable: box.scrollWidth > box.clientWidth + 1 && getComputedStyle(box).overflowX === 'auto',
    })
  }
  return runs
})()`

const b = await launch()
const p = await freshPage(b, { viewport: PHONE, isMobile: true, hasTouch: true, deviceScaleFactor: 3 })
await enter(p, URL, { settle: 3200 })

const SURFACES = [
  ['chat', async (pg) => pg.waitForTimeout(1200)],
  ['drawer', async (pg, { openDrawer }) => openDrawer(pg)],
  ['settings', async (pg) => {
    await pg.evaluate(`(() => { const e = ['Settings','设置'].map(n => document.getElementById('root').querySelector('[aria-label=' + JSON.stringify(n) + ']')).find(Boolean); if (e) e.click() })()`)
    await pg.waitForTimeout(2200)
  }],
  ['panel', async (pg, { openDrawer, openSession }) => {
    await openDrawer(pg)
    await openSession(pg)
    await pg.evaluate(`(() => { const e = ['Collapse right sidebar','Expand right sidebar','收起右侧栏','展开右侧栏'].map(n => document.getElementById('root').querySelector('[aria-label=' + JSON.stringify(n) + ']')).find(Boolean); if (e) e.click() })()`)
    await pg.waitForTimeout(3200)
  }],
]

const { openDrawer, openSession } = await import('./lib/session.mjs')
const helpers = { openDrawer, openSession }

const failures = []
const table = []
for (const [name, run] of SURFACES) {
  await p.evaluate('document.querySelectorAll("dialog[open]").forEach(d => d.close && d.close())')
  await run(p, helpers)
  const runs = await p.evaluate(PROBE)
  const bad = runs.filter((r) => r.clipped)
  table.push([name, runs.length, bad.length])
  if (bad.length) failures.push([name, bad])
}

console.log('\n=== text-clipping audit (phone, 390x844) ===')
for (const [name, total, bad] of table) {
  console.log(`  ${name.padEnd(10)} ${String(total).padStart(4)} measurable runs   ${bad === 0 ? 'clean' : bad + ' CLIPPED'}`)
}
if (failures.length) {
  console.log('\nclipped runs:')
  for (const [name, bad] of failures) {
    for (const r of bad) {
      console.log(`  [${name}] "${r.text}" in ${r.el} — text ${r.textW}px in ${r.contentW}px, over by ${r.over}px (clip: ${r.clip || 'self'})`)
    }
  }
}
console.log(failures.length ? `\nFAIL ${failures.reduce((a, f) => a + f[1].length, 0)} clipped run(s)` : '\nPASS no clipped text')
await b.close()
process.exit(failures.length ? 1 : 0)
