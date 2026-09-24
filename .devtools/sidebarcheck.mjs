/**
 * Does the sidebar block actually land?
 *
 * `envmatrix.mjs` reports *durations*; this reports the animation on the exact
 * node, which is the thing that can silently be zero because a selector missed.
 * A CSS rule that matches nothing and a CSS rule that matches something are
 * indistinguishable from the file — and this file has been written against a
 * slot wrapper (`[data-slot="sidebar.brand.mark"]`) that measures 0×0, so the
 * difference between "the rule is right" and "the rule is on a zero-area box"
 * is the whole question.
 *
 * usage: node sidebarcheck.mjs <url>
 */
import { launch } from './lib/chromium.mjs'
import { freshPage } from './lib/gates.mjs'

const URL = process.argv[2]
if (!URL) {
  console.error('usage: sidebarcheck.mjs <url>')
  process.exit(2)
}

const browser = await launch({ args: ['--no-sandbox'] })
const page = await freshPage(browser, { viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 160)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)) })

await page.goto(URL, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2400)
await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3200)

let pass = 0
let fail = 0
const check = (label, ok, detail) => {
  if (ok) { pass += 1; console.log(`  ok    ${label}${detail ? ' — ' + detail : ''}`) }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? ' — ' + detail : ''}`) }
}

const read = await page.evaluate(`(() => {
  const anim = (el) => {
    if (el === null) return null
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    return {
      name: cs.animationName,
      dur: cs.animationDuration,
      iter: cs.animationIterationCount,
      play: cs.animationPlayState,
      props: cs.animationTimingFunction,
      box: Math.round(r.width) + 'x' + Math.round(r.height),
    }
  }
  const slot = document.querySelector('[data-slot="sidebar.brand.mark"]')
  const col = document.querySelector('[data-fa-col="sidebar"]')
  const railAfter = col === null ? null : getComputedStyle(col, '::after')
  return {
    slotBox: slot === null ? null : (() => { const r = slot.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height) })(),
    slotChildCount: slot === null ? 0 : slot.children.length,
    slotChild: slot === null ? null : anim(slot.querySelector(':scope > *')),
    brandMarkVisible: anim(document.querySelector('[data-fa-col="sidebar"] [class*="brandMark"]')),
    railContent: railAfter === null ? null : railAfter.content,
    railAnim: railAfter === null ? null : railAfter.animationName,
    railOpacity: railAfter === null ? null : railAfter.opacity,
    // The product's own animations must still be intact.
    rowIn: anim(document.querySelector('[data-fa-col="sidebar"] [role="treeitem"][aria-selected="true"]')),
    sectionIn: anim(document.querySelector('[data-fa-col="sidebar"] [class*="sectionLabel"]')),
    // The chevron only exists under hover; check it is display:none at rest.
    chevDisplay: (() => {
      const c = document.querySelector('[data-fa-col="sidebar"] [class*="chevron"]')
      return c === null ? null : getComputedStyle(c).display
    })(),
  }
})()`)

console.log('── measured ──')
console.log(JSON.stringify(read, null, 1))
console.log()

check('brand mark slot is a wrapper, not the painted box', read.slotBox === '0x0',
  `slot measures ${read.slotBox}, ${read.slotChildCount} child`)
check('brand mark loop is on the slot\'s child', read.slotChild && read.slotChild.name === 'fa-brand-breathe',
  read.slotChild ? `${read.slotChild.name} ${read.slotChild.dur} x${read.slotChild.iter} on ${read.slotChild.box}` : 'no child')
check('brand mark loop is infinite', read.slotChild && read.slotChild.iter === 'infinite')
check('rail edge glow pseudo-element exists', read.railContent === '""',
  `content=${read.railContent}`)
check('rail edge glow is animating', read.railAnim === 'fa-rail-glow', String(read.railAnim))

check('product row entrance survives', read.rowIn && read.rowIn.name === 'YDXeBa_row-in',
  read.rowIn ? String(read.rowIn.name) : 'missing')
check('product section label entrance survives', read.sectionIn && read.sectionIn.name === 'bhn1Oq_wide-in',
  read.sectionIn ? String(read.sectionIn.name) : 'missing')
check('chevron is hidden at rest, so its animation is hover-scoped', read.chevDisplay === 'none',
  String(read.chevDisplay))

check('no console errors', errors.length === 0, errors.join(' | ').slice(0, 200))

console.log()
console.log(fail === 0 ? `PASS  ${pass} checks` : `FAIL  ${pass} passed, ${fail} failed`)
await browser.close()
process.exit(fail === 0 ? 0 : 1)
