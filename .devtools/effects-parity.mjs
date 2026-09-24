// effects-parity.mjs — the same effects in English and in Chinese.
//
// Turn 4 asked for one thing that no other probe in this directory covers:
// "确保英文和中文环境下完全一致". That is a claim about *two entire sessions*, and
// the failure mode it is guarding against is specific and easy to cause.
//
// ## Why this can break
//
// Every effect in this skin is attached by a **structural selector** —
// `[data-fa-col="sidebar"]`, `[data-composer-card]`,
// `[data-slot="sidebar.brand.mark"]` — rather than by a class name it owns. That
// is deliberate: the plugin may only paint, so it addresses nodes it does not
// own. But it means the effects are addressed by *position in a layout*, and the
// two locales do not produce the same layout. English labels are wider than
// their Chinese translations, so:
//
//   - a column can cross a breakpoint in one locale and not the other, which
//     switches a whole `@media` block on or off;
//   - a label can wrap in one locale, changing an element's height, which
//     changes which of two stacked rules wins a `:hover` or `:focus-within`;
//   - an element that exists in one locale's markup may be absent in the other,
//     because a translated string can be empty while its counterpart is not.
//
// None of those show up as a broken layout. They show up as one language having
// a slightly different animation, which is exactly the sort of defect that
// survives to release because nobody runs the whole suite twice.
//
// ## What "identical" can actually mean
//
// Not pixel equality — the text is different, so geometry must differ. The
// claim that is both checkable and the one that matters is about the **motion**:
// for each named effect, the animation name, duration, iteration count, timing
// function and play state must be the same, and the effect must be present in
// both. A ticker that runs 6.4s in English and 1.5s in Chinese is a different
// effect, whatever the screenshot looks like.
//
// The width of the measured element is reported beside each row, never asserted.
// When a row does differ, that column is usually the explanation, and having it
// on screen is what turns a failure into a fix.
//
// usage: effects-parity.mjs <url>

import { launch } from './lib/chromium.mjs'
import { freshPage, passGates } from './lib/gates.mjs'

const TARGET = process.argv[2]
if (!TARGET) {
  console.error('usage: effects-parity.mjs <url>')
  process.exit(2)
}

/**
 * Every effect worth comparing, addressed the way the plugin addresses it.
 *
 * A region selector is used rather than a plugin-owned class because the
 * selectors themselves are the thing under test: if `[data-fa-col="sidebar"]`
 * resolves differently in the two locales, that *is* the finding, and naming the
 * node by a class the plugin adds would hide it.
 */
const TARGETS = [
  // Wallpaper. Present in both locales, and its geometry must not shift.
  ['wallpaper sun', '.fa-scene__sun', null],
  ['wallpaper aurora', '.fa-scene__aurora', null],
  ['wallpaper haze', '.fa-scene__haze', null],
  ['wallpaper rays', '.fa-scene__rays', null],
  ['wallpaper clouds', '.fa-scene__clouds', null],
  ['wallpaper hills far', '.fa-scene__hills.fa-scene__far', null],
  ['wallpaper hills near', '.fa-scene__hills.fa-scene__near', null],
  ['wallpaper water', '.fa-scene__water', null],
  ['wallpaper caustics', '.fa-scene__caustics', null],
  ['wallpaper veil', '.fa-scene__veil', null],
  ['wallpaper bubble', '.fa-scene__bubble', null],
  // Sidebar.
  ['sidebar brand', '[data-slot="sidebar.brand.mark"] > *', null],
  ['sidebar rail glow', '[data-fa-col="sidebar"]', '::after'],
  ['sidebar column', '[data-fa-col="sidebar"]', null],
  // Canvas and composer.
  ['canvas column', '[data-fa-col="center"]', null],
  ['composer card', '[data-composer-card]', null],
  ['composer placeholder', '[data-composer-placeholder]', null],
  ['scroll edge top', '[data-fa-scroll-edge="top"]', null],
  ['scroll edge bottom', '[data-fa-scroll-edge="bottom"]', null],
]

/**
 * The effects whose *rendered* motion is compared between locales.
 *
 * This is a shorter list than `TARGETS` on purpose. `TARGETS` answers "did both
 * sessions get the same declaration"; these answer "do both sessions actually
 * paint the same thing", which needs a running animation that a pinned phase can
 * read. The windows are chosen for that: they are always moving, they are never
 * mid-entrance, and none of them is a surface the user's focus can change — a
 * focused caret or a hovered row would make the sample depend on the session
 * rather than on the locale, which is precisely the confound this probe exists
 * to remove.
 */
const PHASE_PROBES = [
  ['wallpaper sun', '.fa-scene__sun', null],
  ['wallpaper haze', '.fa-scene__haze', null],
  ['wallpaper water', '.fa-scene__water', null],
  ['wallpaper bubble', '.fa-scene__bubble', null],
  ['sidebar brand', '[data-slot="sidebar.brand.mark"] > *', null],
  ['sidebar rail glow', '[data-fa-col="sidebar"]', '::after'],
  ['composer glint', '[data-composer-card]', '::after'],
  ['composer placeholder', '[data-composer-placeholder]', null],
]

/** Phases of the curve to pin, as a fraction of the active duration. */
const PHASE_POINTS = [0, 0.25, 0.5, 0.75]

/**
 * The locale, set the way a user sets it.
 *
 * There is no storage key to seed. The product keeps the language in its own
 * settings scope, which is *not* `localStorage` — measured: switching to 中文 and
 * reloading keeps `zh-CN`, while `Object.keys(localStorage)` shows only the
 * workspace view and the current session. An earlier version of this probe
 * seeded `@deepseek-ai/dsh-client-locale:lang`, a key that looked right and does
 * not exist, and the result was that **both sessions rendered identical English
 * text** — a parity check comparing a page against itself, which is the most
 * expensive kind of green.
 *
 * So the locale is driven through the settings dialog, which is also the only
 * way to be sure the two sessions differ before comparing them.
 */
async function setLocale(page, wanted) {
  await page.evaluate(`(() => {
    const root = document.getElementById('root')
    const b = root && root.querySelector('[aria-label*="ettings"], [aria-label*="设置"]')
    if (b) b.click()
  })()`)
  await page.waitForTimeout(1800)

  const done = await page.evaluate(`(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
    const label = ${JSON.stringify(wanted)}
    // The language row shows the *current* language, so it is addressed by
    // either name — the dialog is otherwise unlocalised at this point in the
    // flow and the row is the only button whose text is a bare language name.
    const row = [...document.querySelectorAll('button')].find((b) =>
      /^(English|中文|简体中文)$/.test((b.textContent || '').trim()))
    if (!row) return { ok: false, why: 'no language row' }
    row.click()
    await sleep(1200)
    const option = [...document.querySelectorAll('button[role="menuitem"]')].find((b) =>
      (b.textContent || '').trim() === label)
    if (!option) {
      const seen = [...document.querySelectorAll('button[role="menuitem"]')].map((b) => (b.textContent || '').trim())
      return { ok: false, why: 'no option ' + label + '; saw ' + JSON.stringify(seen) }
    }
    option.click()
    await sleep(1200)
    return { ok: true }
  })()`)

  if (!done.ok) throw new Error(`setLocale(${wanted}): ${done.why}`)
  // Close the dialog so the effects layer is measured on the app, not behind a
  // modal scrim — the scrim is itself a transition target and would be measured
  // as part of the composer region.
  await page.evaluate(`(() => {
    const close = [...document.querySelectorAll('[role="dialog"] button')]
      .find((b) => /^(Close|关闭)$/.test((b.textContent || '').trim()))
    if (close) close.click()
  })()`)
  await page.waitForTimeout(1500)
  return page.evaluate(`document.documentElement.getAttribute('lang')`)
}

const browser = await launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const measured = {}
const errors = []

for (const locale of ['en', 'zh']) {
  const page = await freshPage(browser, { viewport: { width: 1440, height: 900 } })
  page.on('pageerror', (e) => errors.push(`${locale}: ${String(e).slice(0, 140)}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`${locale}: ${m.text().slice(0, 140)}`)
  })

  // Only the tier is seeded. Seeding it also short-circuits the frame governor,
  // which would otherwise be free to downgrade one locale's session and not the
  // other's — and that would then be reported here as a locale difference.
  await page.addInitScript(() => {
    try {
      localStorage.setItem('frutiger-aero:effects', 'full')
    } catch (error) {
      /* a read-only storage would leave the tier to the governor */
    }
  })

  await page.goto(TARGET, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  await passGates(page)

  const wanted = locale === 'zh' ? '中文' : 'English'
  const htmlLang = await setLocale(page, wanted)

  // Give the tier and any layout reaction to the new text time to settle before
  // measuring. A locale switch changes label widths, which can cross a
  // breakpoint, which re-evaluates a media query — and measuring mid-flux would
  // read that as a difference between the languages rather than as a transient.
  await page.waitForTimeout(4500)

  measured[locale] = await page.evaluate(`(async () => {
    const TARGETS = ${JSON.stringify(TARGETS)}
    const rows = {}
    for (const [name, selector, pseudo] of TARGETS) {
      const el = document.querySelector(selector)
      if (el === null) { rows[name] = { found: false }; continue }
      const cs = getComputedStyle(el, pseudo || null)
      const r = el.getBoundingClientRect()
      rows[name] = {
        found: true,
        animation: cs.animationName,
        duration: cs.animationDuration,
        delay: cs.animationDelay,
        iteration: cs.animationIterationCount,
        timing: cs.animationTimingFunction,
        play: cs.animationPlayState,
        transitionProperty: cs.transitionProperty,
        transitionDuration: cs.transitionDuration,
        // Reported, never asserted: the two locales have different text, so a
        // geometry difference is expected. It is the likely explanation when a
        // motion difference appears.
        box: Math.round(r.width) + 'x' + Math.round(r.height),
      }
    }

    /*
     * Sampling the *computed* style is not enough, and this is the reason.
     *
     * A keyframe that declares both an animated property and a property the
     * animation does not mention still reports the mentioned-property's value
     * from the *cascade*, not from the animation — so two sessions can agree on
     * every name, duration and timing while one of them is being painted by a
     * different frame. Worse, the reverse: a running animation is sampled at an
     * arbitrary phase, so the same effect read twice returns two different
     * opacities and the comparison fails on nothing but timing.
     *
     * Both problems have one fix, and it is the *shape* of the motion rather
     * than a sample of it: pause every animation at a pinned phase, read the
     * rendered value, and do it for more than one phase. Pausing through
     * document.getAnimations() stops the element's own animation objects
     * without touching the stylesheet, and the phase is set with currentTime,
     * so both locales are read at exactly the same point of the same curve.
     */
    const PROBES = ${JSON.stringify(PHASE_PROBES)}
    const phases = ${JSON.stringify(PHASE_POINTS)}
    const rendered = {}
    for (const [name, selector, pseudo] of PROBES) {
      const el = document.querySelector(selector)
      if (el === null) { rendered[name] = { found: false }; continue }
      const anims = document.getAnimations().filter((a) => {
        const owner = a.effect && a.effect.target
        return owner === el
      })
      if (anims.length === 0) { rendered[name] = { found: true, animations: 0 }; continue }
      const samples = []
      for (const phase of phases) {
        for (const a of anims) {
          /*
           * NOT activeDuration. An infinite iteration count makes it Infinity,
           * and a currentTime of Infinity throws. The duration of *one* pass is
           * what a phase fraction is a fraction of, and it is the computed
           * duration — the keyframes' own length, independent of how many times
           * they repeat. That is also why the same phase fraction still lands on
           * the same frame if a duration is retuned later.
           */
          const one = a.effect.getComputedTiming().duration
          if (!Number.isFinite(one) || one <= 0) continue
          a.pause()
          a.currentTime = one * phase
        }
        // Two frames, so the compositor has actually presented the pin.
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
        const cs = getComputedStyle(el, pseudo || null)
        samples.push([cs.transform, cs.opacity].join('/'))
      }
      for (const a of anims) a.play()
      rendered[name] = { found: true, animations: anims.length, samples }
    }

    return {
      rows,
      rendered,
      htmlLang: document.documentElement.getAttribute('lang'),
      // The plugin's own view of the page. If these differ, the comparison is
      // between a full-tier session and a downgraded one.
      tier: document.documentElement.dataset.faTier,
      pointer: document.documentElement.dataset.faPointer,
      // A rough locale fingerprint, so a session that silently ignored the
      // seeded preference is visible rather than reported as parity.
      sample: (document.body.innerText || '').slice(0, 120).replace(/\\s+/g, ' '),
    }
  })()`)

  await page.__faContext?.close()
}

/* ── report ─────────────────────────────────────────────────────────────── */

const en = measured.en
const zh = measured.zh

console.log('── sessions ──')
for (const [label, data] of Object.entries(measured)) {
  console.log(`${label.padEnd(4)} html-lang=${String(data.htmlLang).padEnd(6)} tier=${String(data.tier).padEnd(5)} pointer=${String(data.pointer).padEnd(5)}`)
  console.log(`       body text: ${data.sample || '(empty)'}`)
}
console.log()

let failures = 0
const check = (label, ok, detail) => {
  if (!ok) failures += 1
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ' — ' + detail : ''}`)
}

console.log('── per effect ──')
console.log(`${'effect'.padEnd(24)} ${'en-US'.padEnd(34)} ${'zh-CN'.padEnd(34)} same`)

/** The motion signature: everything that decides what the user sees moving. */
const signature = (row) => row.found !== true
  ? 'absent'
  : [row.animation, row.duration, row.delay, row.iteration, row.timing, row.play].join('|')

for (const [name] of TARGETS) {
  const a = en.rows[name]
  const b = zh.rows[name]
  const sa = signature(a)
  const sb = signature(b)
  const same = sa === sb
  const render = (row, sig) => sig === 'absent'
    ? 'absent'
    : `${row.animation.replace('fa-', '').slice(0, 11)} ${row.duration}x${row.iteration.slice(0, 3)}`
  console.log(
    `${name.padEnd(24)} ${render(a, sa).padEnd(34)} ${render(b, sb).padEnd(34)} ${same ? 'yes' : 'NO'}`,
  )
  if (!same) {
    console.log(`      en-US: ${sa}`)
    console.log(`      zh-CN: ${sb}`)
    console.log(`      geometry: en=${a.found ? a.box : '-'} zh=${b.found ? b.box : '-'}`)
  }
}

console.log()
console.log('── assertions ──')

// 1. Both sessions have to be the same kind of session, or every comparison
//    below is between two different pages and means nothing. This is the
//    assertion that has caught the most mistakes in this directory's history.
check('both sessions resolved to the full tier', en.tier === 'full' && zh.tier === 'full',
  `en=${en.tier} zh=${zh.tier}`)
check('both sessions have the same pointer class', en.pointer === zh.pointer,
  `en=${en.pointer} zh=${zh.pointer}`)

// 2. The locales really are different pages. Without this, a harness that
//    ignored the seeded preference would make everything below trivially pass.
check('the two sessions render different text', en.sample !== zh.sample,
  en.sample === zh.sample ? 'identical body text — the locale seed was ignored' : 'text differs, as expected')

// 3. The effects themselves.
let differ = 0
let absent = 0
for (const [name] of TARGETS) {
  const a = en.rows[name]
  const b = zh.rows[name]
  if (a.found !== true || b.found !== true) {
    // Absence in one locale only is a real difference; absence in both is a
    // design decision (a `lite`-only layer, a phase-dependent node) and is
    // reported by `effects-tiers.mjs`, not here.
    if (a.found !== b.found) {
      absent += 1
      check(`${name}: present in both locales`, false, `en=${a.found} zh=${b.found}`)
    }
    continue
  }
  if (signature(a) !== signature(b)) {
    differ += 1
    check(`${name}: identical motion`, false, `en=${signature(a)} zh=${signature(b)}`)
  }
}

if (differ === 0 && absent === 0) {
  check(
    `all ${TARGETS.length} effects have identical motion in both locales`,
    true,
    'animation, duration, delay, iteration, timing and play state all match',
  )
}

// 4. The transitions are part of the effects layer too, and they are the ones
//    most likely to differ: a transition is declared on the element that
//    *receives* the state change, and which element that is can depend on the
//    locale's markup.
for (const name of ['composer card', 'scroll edge top', 'scroll edge bottom']) {
  const a = en.rows[name]
  const b = zh.rows[name]
  if (a.found !== true || b.found !== true) continue
  check(`${name}: identical transition`,
    a.transitionProperty === b.transitionProperty && a.transitionDuration === b.transitionDuration,
    `en=${a.transitionProperty} ${a.transitionDuration} | zh=${b.transitionProperty} ${b.transitionDuration}`)
}

// 5. The declarations agreeing is necessary and not sufficient: two sessions can
//    share every name and duration and still paint different pixels, because a
//    keyframe's other properties come from the cascade and a running animation
//    is sampled at whatever phase it happens to be in. So the moving windows are
//    pinned to the same phases of the same curve in both sessions and compared
//    as rendered values.
//
//    This is the assertion that would catch the failure this file is really
//    about — the same stylesheet, the same motion, in either language.
console.log()
console.log('── rendered motion (pinned phases) ──')
console.log(`${'effect'.padEnd(24)} ${'animations'.padEnd(11)} phases`)
let renderedDiffer = 0
let renderedAbsent = 0
for (const [name] of PHASE_PROBES) {
  const a = en.rendered[name]
  const b = zh.rendered[name]
  if (!a || !b || a.found !== true || b.found !== true) {
    if ((a && a.found) !== (b && b.found)) {
      renderedAbsent += 1
      check(`${name}: rendered in both locales`, false,
        `en=${a && a.found} zh=${b && b.found}`)
    }
    continue
  }
  // An element with no running animation would compare equal as two empty
  // arrays and silently contribute nothing. That is the vacuity this guards.
  if (a.animations === 0 || b.animations === 0) {
    renderedAbsent += 1
    check(`${name}: has a running animation to sample`, false,
      `en=${a.animations} zh=${b.animations} animations`)
    continue
  }
  const same = JSON.stringify(a.samples) === JSON.stringify(b.samples)
  console.log(`${name.padEnd(24)} ${String(a.animations + '/' + b.animations).padEnd(11)} ${same ? 'identical' : 'DIFFER'}`)
  if (!same) {
    renderedDiffer += 1
    check(`${name}: paints the same at every sampled phase`, false,
      `en=${a.samples.join(' ')} zh=${b.samples.join(' ')}`)
  }
}

if (renderedDiffer === 0 && renderedAbsent === 0) {
  check(
    `all ${PHASE_PROBES.length} sampled effects render identically in both locales`,
    true,
    `${PHASE_POINTS.length} phases per effect, transform and opacity compared`,
  )
}

if (errors.length > 0) {
  check('no console errors in either locale', false, errors.slice(0, 3).join(' | '))
} else {
  check('no console errors in either locale', true)
}

console.log()
console.log(failures === 0
  ? 'PASS  English and Chinese render the same effects'
  : `FAIL  ${failures} difference(s) between locales`)

await browser.close()
process.exit(failures === 0 ? 0 : 1)
