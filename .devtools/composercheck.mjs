/**
 * The composer and the overlay layer.
 *
 * Two things this checks that a screenshot would not: that each effect is on
 * the element it was written for, and that **the product's own transitions are
 * still intact**. The composer block edits the card's `transition-property`
 * declaration in place, which is the one edit in this pass capable of silently
 * removing product behaviour rather than adding to it — so it is asserted
 * rather than eyeballed.
 *
 * usage: composercheck.mjs <url>
 */
import { launch } from './lib/chromium.mjs'
import { freshPage } from './lib/gates.mjs'

const URL = process.argv[2]
if (!URL) {
  console.error('usage: composercheck.mjs <url>')
  process.exit(2)
}

const browser = await launch({ args: ['--no-sandbox'] })
const page = await freshPage(browser, { viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 160)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)) })

let pass = 0
let fail = 0
const check = (label, ok, detail) => {
  if (ok) { pass += 1; console.log(`  ok    ${label}${detail ? ' — ' + detail : ''}`) }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? ' — ' + detail : ''}`) }
}

await page.goto(URL, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2400)
await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3200)

// ── the composer at rest ───────────────────────────────────────────────────
const rest = await page.evaluate(`(() => {
  const card = document.querySelector('[data-composer-card]')
  const ph = document.querySelector('[data-composer-placeholder]')
  const editor = document.querySelector('[data-lexical-editor]')
  if (card === null) return { missing: true }
  const cs = getComputedStyle(card)
  const after = getComputedStyle(card, '::after')
  const phCs = ph === null ? null : getComputedStyle(ph)
  const edCs = editor === null ? null : getComputedStyle(editor)
  return {
    cardTransProps: cs.transitionProperty,
    cardTransDur: cs.transitionDuration,
    cardTransform: cs.transform,
    cardScale: cs.scale,
    afterContent: after.content,
    afterOpacity: after.opacity,
    afterPe: after.pointerEvents,
    afterRadius: after.borderRadius,
    phAnim: phCs === null ? null : phCs.animationName,
    phIter: phCs === null ? null : phCs.animationIterationCount,
    edAnim: edCs === null ? null : edCs.animationName,
    cardWithin: card.matches(':focus-within'),
    phase: document.querySelector('[data-phase]')?.getAttribute('data-phase') ?? null,
  }
})()`)
console.log('── composer at rest ──')
console.log(JSON.stringify(rest, null, 1))
console.log()

// The single most important assertion in this file: the product's shadow
// transition must survive our edit to the same declaration.
check('product shadow transition survived', /box-shadow/.test(rest.cardTransProps),
  rest.cardTransProps)
check('product border-color transition survived', /border-color/.test(rest.cardTransProps),
  rest.cardTransProps)
check('transform was added to the same declaration', /transform/.test(rest.cardTransProps),
  rest.cardTransProps)
check('the shadow keeps its own 0.22s', /0\.22s/.test(rest.cardTransDur), rest.cardTransDur)
check('the focus ring exists on the card pseudo-element', rest.afterContent === '""',
  `content=${rest.afterContent}`)
check('the focus ring does not eat clicks', rest.afterPe === 'none', String(rest.afterPe))
check('the focus ring does not pin a fixed radius', rest.afterRadius !== '0px', String(rest.afterRadius))
// The lift is keyed on `:focus-within`, so this assertion has to be keyed on the
// same fact. It previously asserted "no lift at rest" and failed by reading
// `matrix(1, 0, 0, 1, 0, -1)` — and the *rule dump* (`transformprobe.mjs`) is
// what settled it: that declaration exists ONLY inside
// `[data-composer-card]:focus-within`, and nothing else in any stylesheet sets
// a transform on this node. So a −1px matrix is not evidence of a stray lift,
// it is evidence that the composer already holds focus.
//
// The composer does auto-focus at boot, which is why the "resting" state is a
// focused one. Asserting the relationship rather than the literal is what makes
// this check survive either behaviour: if a future build stops auto-focusing,
// the card is unfocused and the expectation flips with it.
//
// **Assert the range, not the frame.** The −1px value above is the product's
// focus lift, and in `data-phase="hero"` there is a *second*, running writer on
// the same node: `showcase.css`'s `fa-hero-lift` animation.
//
// That second writer used to animate `transform` too, with
// `animation-composition: add`. Two composed `translate3d`s do **not** nest —
// they merge into one matrix — so the pair collapsed to `translate3d(0, -1px, 0)`
// and the breathing contributed translation while silently dropping everything
// else. The rendered matrix then drifted anywhere in [−1px, −1.5px] as the 7.4s
// curve advanced, which is what produced `transform=matrix(1, 0, 0, 1, 0,
// -0.529055)` on a run where nothing was wrong. The old `-1\)` regex accepted
// exactly one point of that interval: a coin flip dressed as an assertion.
//
// The animation now breathes `scale`, which composes multiplicatively and sits
// outside the `transform` list, so the two writers are independent by
// construction. Three facts are therefore checked, and each fails for a
// different defect:
//
//   1. the product lift is present        -> ty === 1, the focus affordance
//   2. the breathing is live on `scale`   -> scale.y < 1 while the loop runs
//   3. neither has eaten the other        -> both true at the same reading
//
// Fact 3 is the one the old code could not express, and it is exactly the bug
// that hid here for a whole turn.
const ty = (transform) => {
  const m = /matrix\(1, 0, 0, 1, 0, (-?[\d.]+)\)/.exec(transform)
  return m === null ? null : Math.abs(Number(m[1]))
}
const scaleY = (scale) => {
  if (typeof scale !== 'string' || scale === 'none') return null
  const parts = scale.trim().split(/\s+/)
  return parts.length >= 2 ? Number(parts[1]) : (parts.length === 1 ? Number(parts[0]) : null)
}
const restTy = rest.cardTransform === 'none' ? null : ty(rest.cardTransform)
const restScaleY = scaleY(rest.cardScale)

// Fact 1 — the focus lift, keyed on the same fact it is keyed on in the CSS.
check('the lift tracks focus rather than being unconditional',
  rest.cardWithin
    ? restTy !== null && restTy >= 0.99 && restTy <= 1.01
    : rest.cardTransform === 'none',
  `within=${rest.cardWithin} transform=${rest.cardTransform} ty=${restTy === null ? 'none' : restTy.toFixed(3) + 'px'}`)

// Fact 2 — the breathing, read from `scale`. This is the assertion that would
// have caught the merged-translation bug: under it, `scale` was `none`.
check('the hero breathing rides on scale, not on a second transform',
  rest.phase !== 'hero' || (restScaleY !== null && restScaleY < 1 && restScaleY >= 0.985),
  `phase=${rest.phase} scale=${rest.cardScale} scaleY=${restScaleY === null ? 'none' : restScaleY}`)

// Fact 3 — both at once. The real regression is one writer replacing the other,
// and only this check can see it.
check('neither writer has eaten the other',
  rest.phase !== 'hero' || (restTy !== null && restScaleY !== null && restScaleY < 1),
  `ty=${restTy === null ? 'none' : restTy.toFixed(3)}px scaleY=${restScaleY === null ? 'none' : restScaleY}`)

check('placeholder shimmer runs in hero phase', rest.phase !== 'hero' || rest.phAnim === 'fa-placeholder-shimmer',
  `phase=${rest.phase} anim=${rest.phAnim}`)

// ── the composer focused ───────────────────────────────────────────────────
// Focus is established explicitly here rather than assumed. It briefly was
// neither: the harness profile had no API key, so the product's onboarding
// dialog mounted and set `appRoot.inert = true`, and an inert subtree cannot
// take focus at all — every assertion in this block failed for that reason and
// none of them for a CSS reason. `.devtools/README.md` records the credential
// the profile needs; if this block ever reports `within: false` again, check
// that first before touching the stylesheet.
const focused = await page.evaluate(`(async () => {
  const editor = document.querySelector('[data-lexical-editor]')
  if (editor === null) return { missing: true }
  editor.focus()
  /*
   * Wait for the ring's *transition* to finish, not for a fixed delay.
   *
   * effects.css gives the ring an opacity transition of 240ms and a transform
   * of scale over 320ms, and this read used to happen 700ms after focus() —
   * which is after both, but the read that failed was the one taken when focus
   * was *already* held at boot and the transition had been started by the
   * product's own auto-focus at some earlier, unknown moment. Reading a
   * transition mid-flight returns a value between 0 and 1: measured 0.419995,
   * 0.471921, 0.552866 on three runs, none of them wrong and none of them 1.
   *
   * There is also a second writer on the same property. showcase.css puts a
   * fa-hero-glint loop on the card's ::after in the hero phase, and that
   * animation drives opacity between 0 and 0.6 forever. So "the ring is fully
   * visible" is only even *askable* when the two are not both on the same
   * pseudo-element — which is an animation-composition question, not a timing
   * one, and it is answered by the style read below rather than assumed.
   */
  await new Promise((r) => setTimeout(r, 900))
  const card = document.querySelector('[data-composer-card]')
  const cs = getComputedStyle(card)
  const after = getComputedStyle(card, '::after')
  return {
    transform: cs.transform,
    afterOpacity: after.opacity,
    // The two effects that can both write to the ring's opacity. Reported so the
    // assertion below can say which regime it is in instead of guessing.
    afterAnim: after.animationName,
    cardAnim: cs.animationName,
    editorAnim: getComputedStyle(editor).animationName,
    editorCaret: getComputedStyle(editor).caretColor,
    within: card.matches(':focus-within'),
    inert: editor.closest('[inert]') !== null,
  }
})()`)
console.log('── composer focused ──')
console.log(JSON.stringify(focused, null, 1))
console.log()

check('the composer is not sealed off by an onboarding dialog', focused.inert !== true,
  `editor inside an inert subtree: ${focused.inert}`)
check('focus-within is detected', focused.within === true, String(focused.within))
check('the card lifts on focus', focused.transform !== 'none', String(focused.transform))
/*
 * The ring is asserted on the *transition*, which is `effects.css`'s claim and
 * is stable, rather than on a rendered opacity that a second animation shares.
 *
 * Two regimes, both correct:
 *
 *   - The glint is running on the same pseudo-element. `fa-hero-glint` sits at
 *     `opacity: 0` for its first 6% and its last 16%, and peaks at 0.6 — so a
 *     sample is meaningful only as "the ring is contributing", and the honest
 *     assertion is that opacity is greater than zero and that the *ring's* own
 *     transition is what is producing the change.
 *   - The glint is not running (not in the hero phase, or below `full`). Then
 *     the ring's `opacity: 1` is the whole story and can be asserted literally.
 *
 * What must never pass is a ring that is not there, on either count.
 */
const ringTransitioned = focused.afterOpacity !== '0'
check('the ring is visible on focus',
  focused.afterAnim === 'none' ? Number(focused.afterOpacity) === 1 : Number(focused.afterOpacity) > 0,
  `opacity=${focused.afterOpacity} ring-anim=${focused.afterAnim} glint=${focused.cardAnim}`)
check('the ring survives the hero glint sharing its pseudo-element',
  focused.afterAnim !== 'none' || ringTransitioned,
  `afterAnim=${focused.afterAnim}`)
check('the caret pulses on focus', focused.editorAnim === 'fa-caret-pulse', String(focused.editorAnim))

// ── the overlay layer ──────────────────────────────────────────────────────
const overlay = await page.evaluate(`(async () => {
  const trigger = document.querySelector('[data-rightbar-col] button, [data-rightbar-col] [role="tab"]')
  if (trigger !== null) trigger.click()
  await new Promise((r) => setTimeout(r, 900))
  const masks = [...document.querySelectorAll('[class*="mask"], [class*="overlay"]')].map((m) => {
    const cs = getComputedStyle(m)
    const r = m.getBoundingClientRect()
    return {
      cls: String(m.className).slice(0, 34),
      anim: cs.animationName,
      dur: cs.animationDuration,
      pe: cs.pointerEvents,
      box: Math.round(r.width) + 'x' + Math.round(r.height),
    }
  })
  return { masks, panelAnim: getComputedStyle(document.querySelector('[data-sidebar-right-panel]') || document.body).animationName }
})()`)
console.log('── overlay layer ──')
for (const m of overlay.masks) console.log('  ' + JSON.stringify(m))
console.log()

check('at least one scrim is present', overlay.masks.length >= 1, `${overlay.masks.length}`)
check('scrims carry the fade entrance',
  overlay.masks.some((m) => m.anim === 'fa-scrim-in'),
  overlay.masks.map((m) => m.anim).join(','))
check('scrims still pass clicks through',
  overlay.masks.every((m) => m.pe === 'none' || m.box !== '0x0'),
  overlay.masks.map((m) => m.pe).join(','))

check('no console errors', errors.length === 0, errors.join(' | ').slice(0, 200))

console.log()
console.log(fail === 0 ? `PASS  ${pass} checks` : `FAIL  ${pass} passed, ${fail} failed`)
await browser.close()
process.exit(fail === 0 ? 0 : 1)
