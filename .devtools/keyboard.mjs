/**
 * Does the software keyboard eat the composer?
 *
 * The skin tracks `visualViewport` and lifts `[data-composer-seat]` by the
 * occluded height. Nothing had ever *verified* that, because Playwright has no
 * software keyboard — the inset simply never becomes non-zero in a normal run.
 *
 * How the inset is simulated, and why this exact way:
 *
 * `window.visualViewport` is a getter on `window` returning an *instance* of
 * `VisualViewport`. The plugin reads that object once, at boot, and subscribes
 * to it. So the faithful simulation is **not** to replace
 * `window.visualViewport` with a stand-in: that swaps the property for
 * everything that reads it later while the plugin keeps listening to the
 * original, and the result is a probe that reports the feature as broken when
 * it is working. (That is exactly what the first version of this file did, and
 * it produced a confidently wrong 'the keyboard inset never fires' finding.)
 *
 * Instead the *instance's own* `height` / `offsetTop` accessors are shadowed
 * with `Object.defineProperty`, which overrides the prototype accessor for
 * every reader of that same object, and then `resize` is dispatched on it —
 * the same event the browser fires when a keyboard opens. Nothing is replaced,
 * so the plugin's own subscription is what runs.
 *
 * What must hold while the inset is applied:
 *
 *   - `--fa-keyboard` equals the simulated height.
 *   - `body[data-fa-keyboard]` is set above the threshold and clear below it.
 *   - the composer's *bottom* is above the occluded band, so nothing the user
 *     types into is behind the keyboard.
 *   - the dock is hidden, because a floating dock on top of a keyboard is in
 *     the way and unreachable.
 *   - the conversation still scrolls, i.e. the centre column did not collapse.
 *   - and it all unwinds when the keyboard closes, or the composer stays
 *     stranded off the top of the screen — the classic bug in this pattern.
 *
 * usage: node keyboard.mjs <url> [insetPx]
 */
import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'

const TARGET = process.argv[2]
const INSET = Number(process.argv[3] ?? 336)

const browser = await launch()
const page = await freshPage(browser, {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 160)))
await enter(page, TARGET, { settle: 3200 })

/** Read the geometry that the keyboard inset is supposed to affect. */
const GEOM = `(() => {
  const box = (sel) => {
    const el = document.querySelector(sel)
    if (el === null) return null
    const r = el.getBoundingClientRect()
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) }
  }
  const root = getComputedStyle(document.documentElement)
  const dock = document.querySelector('[data-fa-dock]')
  const dockStyle = dock === null ? null : getComputedStyle(dock)
  const dockRect = dock === null ? null : dock.getBoundingClientRect()
  return {
    keyboardVar: root.getPropertyValue('--fa-keyboard').trim(),
    flag: document.body.hasAttribute('data-fa-keyboard'),
    composer: box('[data-composer-seat]'),
    dock: box('[data-fa-dock]'),
    /**
     * The dock is hidden by sliding it out and dropping its opacity, NOT by
     * 'display: none' — it keeps its layout box so the transition can run, and
     * asserting on 'display' reports a working dock as a failure. What matters
     * is that it cannot be seen or hit: zero opacity, no pointer events, and
     * its whole box outside the viewport.
     */
    dock: dockRect === null ? null : {
      top: Math.round(dockRect.top), bottom: Math.round(dockRect.bottom),
      opacity: Number(dockStyle.opacity),
      pointerEvents: dockStyle.pointerEvents,
    },
    dockHidden: dockStyle === null ? null
      : Number(dockStyle.opacity) === 0
        && dockStyle.pointerEvents === 'none'
        && dockRect.top >= window.innerHeight,
    scroll: box('[data-conversation-scroll]'),
    innerHeight: window.innerHeight,
    vvHeight: window.visualViewport === null || window.visualViewport === undefined
      ? null : Math.round(window.visualViewport.height),
  }
})()`

/**
 * Apply or clear a simulated keyboard inset on the live viewport object.
 *
 * @param inset - occluded height in CSS px, or 0 to clear.
 */
const setInset = async (inset) => {
  await page.evaluate(`(() => {
    const vv = window.visualViewport
    const inset = ${inset}
    if (inset > 0) {
      Object.defineProperty(vv, 'height', { get: () => window.innerHeight - inset, configurable: true })
      Object.defineProperty(vv, 'offsetTop', { get: () => 0, configurable: true })
      Object.defineProperty(vv, 'width', { get: () => window.innerWidth, configurable: true })
    } else {
      delete vv.height
      delete vv.offsetTop
      delete vv.width
    }
    vv.dispatchEvent(new Event('resize'))
  })()`)
  await page.waitForTimeout(1200)
}

const before = await page.evaluate(GEOM)
console.log('--- before (no keyboard) ---')
console.log(JSON.stringify(before, null, 2))

// Put the caret in the composer so the state is realistic, then open the
// simulated keyboard.
await page.evaluate(`(() => {
  const ta = document.querySelector('[data-composer-card] textarea, [data-composer-card] input, textarea')
  if (ta) ta.focus()
})()`)
await page.waitForTimeout(600)

await setInset(INSET)
const after = await page.evaluate(GEOM)
console.log('--- after (simulated keyboard) ---')
console.log(JSON.stringify(after, null, 2))

const checks = []
const ok = (name, cond, detail) => checks.push({ name, ok: Boolean(cond), detail })

ok('--fa-keyboard equals the inset', after.keyboardVar === `${INSET}px`, `got '${after.keyboardVar}', want '${INSET}px'`)
ok('body flag set', after.flag === true, `flag=${String(after.flag)}`)
ok('composer present', after.composer !== null, 'no [data-composer-seat]')
if (after.composer !== null) {
  // The composer must sit entirely above the occluded band, which begins at
  // innerHeight - inset with no offsetTop.
  const bandTop = after.innerHeight - INSET
  ok('composer above the keyboard', after.composer.bottom <= bandTop + 1,
    `composer bottom ${after.composer.bottom}, keyboard band starts ${bandTop}`)
  ok('composer pushed up from its resting place',
    before.composer === null || after.composer.top !== before.composer.top,
    `before top ${before.composer === null ? 'n/a' : before.composer.top}, after ${after.composer.top}`)
  ok('composer did not collapse to nothing', after.composer.h > 40, `height ${after.composer.h}`)
}
ok('dock is hidden while typing', after.dockHidden === true || after.dock === null,
  after.dock === null ? 'no dock'
    : `opacity=${after.dock.opacity} pointer-events=${after.dock.pointerEvents} top=${after.dock.top}`)
ok('conversation column still present', after.scroll !== null && after.scroll.h > 40,
  after.scroll === null ? 'no [data-conversation-scroll]' : `height ${after.scroll.h}`)

// And it must all unwind cleanly.
await setInset(0)
const restored = await page.evaluate(GEOM)
console.log('--- restored (keyboard closed) ---')
console.log(JSON.stringify(restored, null, 2))
ok('--fa-keyboard cleared', restored.keyboardVar === '' || restored.keyboardVar === '0px',
  `got '${restored.keyboardVar}'`)
ok('body flag cleared', restored.flag === false, `flag=${String(restored.flag)}`)
ok('composer back to its resting place',
  before.composer === null || restored.composer === null
    || Math.abs(restored.composer.top - before.composer.top) <= 2,
  `before ${before.composer === null ? 'n/a' : before.composer.top}, restored ${restored.composer === null ? 'n/a' : restored.composer.top}`)
ok('dock back on screen',
  restored.dockHidden === false,
  restored.dock === null ? 'no dock' : `opacity=${restored.dock.opacity} top=${restored.dock.top}`)

// A short inset — an emoji strip or a hardware keyboard's suggestion bar —
// must not trip the flag; the threshold exists so the layout does not twitch.
await setInset(60)
const tiny = await page.evaluate(GEOM)
ok('small inset does not raise the flag', tiny.flag === false, `flag=${String(tiny.flag)} at 60px`)
ok('small inset is still published', tiny.keyboardVar === '60px', `got '${tiny.keyboardVar}'`)
await setInset(0)

console.log('')
let failed = 0
for (const c of checks) {
  if (!c.ok) failed += 1
  console.log(`${c.ok ? 'ok  ' : 'FAIL'} ${c.name}${c.ok ? '' : `   (${c.detail})`}`)
}
if (errors.length > 0) {
  console.log(`\npage errors: ${errors.length}`)
  for (const e of errors.slice(0, 5)) console.log(`  ${e}`)
}
console.log(`\n${checks.length - failed}/${checks.length} checks passed`)
await browser.close()
process.exit(failed > 0 ? 1 : 0)
