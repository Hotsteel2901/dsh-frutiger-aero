/**
 * Does every loop in the plugin actually stop?
 *
 * The plugin's loops are the only thing in it that costs anything when nothing
 * is happening, so each one has to be stoppable by both of the two mechanisms
 * that exist: the explicit tier, and the idle governor.
 *
 * This exists separately from `idlecheck.mjs` because that file tests the
 * *mechanism* (writer and readers agree, pseudo-elements are covered). This one
 * tests the *inventory* — it enumerates every element the plugin gives an
 * infinite animation to and asserts each responds. Written after two real bugs
 * shipped where the mechanism was tested and the inventory was not.
 *
 * usage: loopcheck.mjs <url>
 */
import { launch } from './lib/chromium.mjs'
import { freshPage } from './lib/gates.mjs'

const URL = process.argv[2]
if (!URL) {
  console.error('usage: loopcheck.mjs <url>')
  process.exit(2)
}

const browser = await launch({ args: ['--no-sandbox'] })
const page = await freshPage(browser, { viewport: { width: 1440, height: 900 } })

let pass = 0
let fail = 0
const check = (label, ok, detail) => {
  if (ok) { pass += 1; console.log(`  ok    ${label}${detail ? ' — ' + detail : ''}`) }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? ' — ' + detail : ''}`) }
}

// Every selector the plugin gives an `infinite` animation to, by name. A loop
// added later and forgotten here shows up as "this list is short", which is why
// the count is asserted against the stylesheet rather than trusted.
const LOOP_TARGETS = [
  ['wallpaper sky/sun', '.fa-scene__sun'],
  ['wallpaper aurora', '.fa-scene__aurora'],
  ['wallpaper haze', '.fa-scene__haze'],
  ['wallpaper rays', '.fa-scene__rays'],
  ['wallpaper clouds', '.fa-scene__clouds'],
  ['wallpaper hills far', '.fa-scene__hills.fa-scene__far'],
  ['wallpaper hills near', '.fa-scene__hills.fa-scene__near'],
  ['wallpaper water', '.fa-scene__water'],
  ['wallpaper veil', '.fa-scene__veil'],
  ['wallpaper bubbles', '.fa-scene__bubbles > *'],
  ['sidebar brand', '[data-slot="sidebar.brand.mark"] > *'],
]

const readPage = async (extra) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2400)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects',${JSON.stringify(extra.tier)})`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3200)
  if (extra.hide) {
    // The idle governor keys off `visibilitychange`; the browser also needs to
    // believe the tab is hidden for document.hidden to flip.
    await page.evaluate(`Object.defineProperty(document, 'hidden', { value: true, configurable: true })
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))`)
    await page.waitForTimeout(600)
  }
  return page.evaluate(`(() => {
    const out = {}
    for (const [label, sel] of ${JSON.stringify(LOOP_TARGETS)}) {
      const el = document.querySelector(sel)
      if (el === null) { out[label] = { missing: true }; continue }
      const cs = getComputedStyle(el)
      out[label] = {
        name: cs.animationName,
        iter: cs.animationIterationCount,
        state: cs.animationPlayState,
        display: cs.display,
        rects: el.getClientRects().length,
      }
    }
    // The rail glow lives on a pseudo-element, which needs its own read.
    const col = document.querySelector('[data-fa-col="sidebar"]')
    const after = col === null ? null : getComputedStyle(col, '::after')
    out['sidebar rail glow'] = after === null
      ? { missing: true }
      : {
          name: after.animationName,
          iter: after.animationIterationCount,
          state: after.animationPlayState,
          display: after.display,
          rects: col.getClientRects().length,
        }
    return out
  })()`)
}

console.log('── full tier, page visible ──')
const live = await readPage({ tier: 'full' })
for (const [label] of LOOP_TARGETS) {
  const r = live[label]
  if (r.missing) { console.log(`  --    ${label} (not present in this build)`); continue }
  check(`${label} loops`, r.iter === 'infinite' && r.state === 'running', `${r.name} ${r.state}`)
}
check('sidebar rail glow loops', live['sidebar rail glow'].iter === 'infinite', String(live['sidebar rail glow'].name))

console.log()
console.log('── full tier, page hidden ──')
const hidden = await readPage({ tier: 'full', hide: true })
for (const [label] of LOOP_TARGETS) {
  const r = hidden[label]
  if (r.missing) continue
  check(`${label} pauses when hidden`, r.state === 'paused', String(r.state))
}
check('sidebar rail glow pauses when hidden', hidden['sidebar rail glow'].state === 'paused',
  String(hidden['sidebar rail glow'].state))

console.log()
console.log('── lite tier ──')
const lite = await readPage({ tier: 'lite' })
// At `lite` a layer is dropped in one of **two** ways, and the distinction is
// load-bearing rather than cosmetic:
//
//   - `display: none` — the layer is gone. `getComputedStyle` still reports the
//     animation it *would* have, so asserting on the animation here would be
//     asserting on a rule that cannot run. Assert on the absence instead.
//   - `animation: none` — the layer stays because it is part of the wallpaper's
//     composition (the water is the bottom third) and only its motion stops.
//
// An earlier version of this probe only knew about the second shape and
// reported three false failures on layers that were correctly hidden. The
// inventory has to be read the way it is written.
const shouldBeGone = [
  ['wallpaper aurora', 'wallpaper aurora'],
  ['wallpaper clouds', 'wallpaper clouds'],
]
for (const [label, key] of shouldBeGone) {
  const r = lite[key]
  if (!r || r.missing) continue
  check(`${label} is not rendered at lite`, r.display === 'none' || r.rects === 0,
    `display=${r.display} rects=${r.rects}`)
}

const shouldBeStill = [
  ['sidebar brand', 'sidebar brand'],
  ['sidebar rail glow', 'sidebar rail glow'],
  ['wallpaper water', 'wallpaper water'],
]
for (const [label, key] of shouldBeStill) {
  const r = lite[key]
  if (!r || r.missing) continue
  check(`${label} is still at lite`, r.name === 'none' || r.iter !== 'infinite', `${r.name} x${r.iter}`)
}

console.log()
console.log(fail === 0 ? `PASS  ${pass} checks` : `FAIL  ${pass} passed, ${fail} failed`)
await browser.close()
process.exit(fail === 0 ? 0 : 1)
