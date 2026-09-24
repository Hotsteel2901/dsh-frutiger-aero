/**
 * The idle governor: does a hidden tab actually stop animating?
 *
 * `installIdleGovernor` in `runtime.js` exists so that a background tab does
 * not keep compositing a wallpaper nobody is looking at — the stated trade is
 * that "a skin that quietly drains a battery is a worse trade than a still
 * wallpaper". It writes `data-fa-idle` onto `<body>`.
 *
 * Every rule that reads it is written `html[data-fa-idle] …`, which requires
 * the attribute on the **root element**. The two never meet, so the governor
 * has no effect and the claim above is not true of any shipped build.
 *
 * This probe tests the writer and the readers separately, because they fail
 * independently and a single assertion would conflate them:
 *
 *   1. **writer** — does hiding the page put the attribute on the element the
 *      rules target, and does it come off again on return?
 *   2. **reach** — with the attribute placed where the rules can see it, does
 *      every animation actually pause? A universal selector does not match
 *      pseudo-elements, so loops on `::before`/`::after` are a second, separate
 *      gap that survives fixing the first.
 *
 * Both assertions are stated so they go red on the current tree.
 *
 * usage: node idlecheck.mjs <url>
 */
import { launch } from './lib/chromium.mjs'
import { freshPage } from './lib/gates.mjs'

const URL = process.argv[2]
if (!URL) {
  console.error('usage: idlecheck.mjs <url>')
  process.exit(2)
}

const browser = await launch({ args: ['--no-sandbox'] })
const page = await freshPage(browser, { viewport: { width: 1440, height: 900 } })
await page.goto(URL, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2600)
await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3400)

/**
 * Plant one looping animation on a real element and one on its pseudo-element.
 *
 * Planted rather than observed, because the question is about the *rules'
 * reach*, not about any one shipped effect. A probe that only measured the
 * one-shot press ring would prove nothing: it is almost never running, so it
 * would report clean either way.
 */
await page.evaluate(`(() => {
  const host = document.createElement('div')
  host.id = 'fa-idle-probe'
  host.setAttribute('aria-hidden', 'true')
  host.style.cssText = 'position:fixed;left:-9999px;top:0;width:10px;height:10px'
  document.body.append(host)

  const style = document.createElement('style')
  style.textContent = [
    '@keyframes fa-idle-probe-loop { from { transform: scale(1) } to { transform: scale(1.4) } }',
    '#fa-idle-probe { animation: fa-idle-probe-loop 2s linear infinite }',
    '#fa-idle-probe::after { content: ""; position: absolute; inset: 0;',
    '  animation: fa-idle-probe-loop 2s linear infinite }',
  ].join('\\n')
  document.head.append(style)
})()`)

/**
 * Read play state from *computed style*, not from the Web Animations object.
 * `animation.playState` reports the JS-side timeline state and stays "running"
 * even when `animation-play-state: paused` has stopped the animation in the
 * cascade — measuring the wrong one is how a dead rule looks alive.
 */
const snapshot = `(() => {
  const el = document.getElementById('fa-idle-probe')
  const sun = document.querySelector('.fa-scene__sun')
  return {
    htmlIdle: document.documentElement.hasAttribute('data-fa-idle'),
    bodyIdle: document.body.hasAttribute('data-fa-idle'),
    probeElement: getComputedStyle(el).animationPlayState,
    probePseudo: getComputedStyle(el, '::after').animationPlayState,
    sceneSun: sun === null ? null : getComputedStyle(sun).animationPlayState,
  }
})()`

let failed = 0
const check = (ok, label, detail) => {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}${detail === undefined ? '' : `  ${detail}`}`)
  if (!ok) failed += 1
}

// ── 1. the writer ──────────────────────────────────────────────────────────
//
// Asserted as "the attribute and the rules agree on an element", not as "the
// attribute is on <body>". The body used to be where it went and the rules
// never saw it; the fix moved the writer to the root. A probe that pinned the
// old location would have had to be edited to accept the fix, which is exactly
// the shape of a check that is testing the code rather than the contract.
console.log('══ 1. does hiding the page reach the element the rules target? ══')
await page.evaluate(`(() => {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
  document.dispatchEvent(new Event('visibilitychange'))
})()`)
await page.waitForTimeout(500)

const hiddenState = await page.evaluate(snapshot)
console.log(`  ${JSON.stringify(hiddenState)}`)
check(
  hiddenState.htmlIdle || hiddenState.bodyIdle,
  'governor publishes the idle attribute',
  hiddenState.htmlIdle || hiddenState.bodyIdle ? '' : '— attribute never appeared',
)
check(
  hiddenState.htmlIdle,
  'the attribute lands where the CSS rules read it',
  hiddenState.htmlIdle ? '' : '— rules are html[data-fa-idle]…: the governor is inert',
)
check(
  hiddenState.sceneSun === 'paused',
  'and the wallpaper is actually paused by it',
  `play-state=${hiddenState.sceneSun}`,
)

// ── 2. the reach ───────────────────────────────────────────────────────────
console.log('')
console.log('══ 2. with the attribute placed where the rules can see it ══')
await page.evaluate(`document.documentElement.setAttribute('data-fa-idle', '')`)
await page.waitForTimeout(400)
const reached = await page.evaluate(snapshot)
console.log(`  ${JSON.stringify(reached)}`)
check(reached.probeElement === 'paused', 'an element loop pauses', `play-state=${reached.probeElement}`)
check(reached.probePseudo === 'paused', 'a pseudo-element loop pauses', `play-state=${reached.probePseudo}`)
check(reached.sceneSun === 'paused', 'the wallpaper pauses', `play-state=${reached.sceneSun}`)

// ── 3. and it comes back ───────────────────────────────────────────────────
console.log('')
console.log('══ 3. returning to the tab resumes ══')
await page.evaluate(`(() => {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
  document.dispatchEvent(new Event('visibilitychange'))
})()`)
await page.waitForTimeout(400)
const resumed = await page.evaluate(snapshot)
check(!resumed.htmlIdle, 'the idle attribute is withdrawn', resumed.htmlIdle ? '— still set' : '')
check(resumed.probeElement === 'running', 'an element loop resumes', `play-state=${resumed.probeElement}`)
check(resumed.probePseudo === 'running', 'a pseudo-element loop resumes', `play-state=${resumed.probePseudo}`)
check(resumed.sceneSun === 'running', 'the wallpaper resumes', `play-state=${resumed.sceneSun}`)

console.log('')
console.log(failed === 0 ? 'ok    idle governor works' : `FAIL  ${failed} idle-governor check(s) failed`)
await browser.close()
process.exit(failed === 0 ? 0 : 1)
