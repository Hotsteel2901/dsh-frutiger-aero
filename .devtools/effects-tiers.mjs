// effects-tiers.mjs — the same inventory at the three tiers.
//
// `effects-manifest.mjs` answers "what does the skin animate at `full`". This
// answers the question that only exists because there *are* tiers: what happens
// to each of those effects at `lite` and at `off`.
//
// The reason this is a separate probe rather than a third column in the
// manifest: the two files can disagree in opposite directions and only one of
// them is a bug.
//
//   - A manifest failure means an effect **went missing** — something agreed to
//     exist and does not.
//   - A tiers failure means the tier inventory **disagrees with the rules** —
//     an effect runs where it should have stopped, or stopped where it should
//     have run. On a machine the governor has already downgraded, a loop that
//     survives `off` is exactly the cost the downgrade was meant to remove, and
//     no count will ever notice it.
//
// ## What "stops" is allowed to mean
//
// Three shapes, and all three are deliberate. This is why the assertions here
// are written per effect against a named expectation rather than as a blanket
// rule like "nothing runs below full":
//
//   1. `animation-name: none` — the element stays for its composition (the
//      wallpaper's water is the bottom third of the screen) and only the motion
//      stops.
//   2. `display: none` / zero client rects — the element is gone, so its
//      animation cannot run even though `getComputedStyle` still cheerfully
//      reports the name it would have had.
//   3. **absent from the DOM** — at `off` the runtime does not build the scene
//      at all (`renderScene` early-returns and removes the existing node when
//      the tier is `off`). So at `off` the whole wallpaper is shape 3, and no
//      per-layer reading is meaningful: the probe asserts on the scene's
//      absence instead.
//
// A `getComputedStyle` name on a `display: none` box is a *rule*, not an
// effect. An earlier probe in this directory only knew shape 1 and reported
// three false failures on layers that were correctly hidden, which is why
// `painted` exists below.
//
// ## Why the expectations are transcribed rather than inferred
//
// Because inferring them produced false failures, twice, in opposite
// directions. This file originally carried a `min` tier per effect and asserted
// "runs at or above the floor, does not run below it". That reads well and is
// wrong in two ways:
//
//   - At `off`, *nothing* plugin-authored is meant to run and every wallpaper
//     target is absent, so a floor of `full` and a floor of `lite` are equally
//     satisfied by "the element does not exist". Meanwhile a blanket "must not
//     run below its floor" is unsatisfiable at `off`, so it reported the whole
//     wallpaper as broken.
//   - It reported `rays` and `hills far` as failures for being *hidden* at
//     `lite`, when `scenery.css` hides them on purpose.
//
// It was then rewritten around a control page — "tier `off` must not be quieter
// than the bare product" — and that was wrong too, because the control only
// removed the *wallpaper*, not the skin, so it compared two pages on which the
// plugin was fully live and attributed the difference to the tier.
//
// The table below is transcribed from the two stylesheets instead, one row per
// rule group, with the source line in a comment. Where an expectation is subtle
// the comment says why, because the next reader's question will be "should this
// really stop here", and the answer is only useful next to the rule it came
// from.
//
// ## Why the tier is set through `localStorage`
//
// Because the URL override cannot survive this server. The Harness answers both
// `/` and `/?token=…` with `303 See Other` → `location: /`, so any query string
// the probe adds is gone before the first script runs, and `addInitScript`
// reads `location.search` as `""` on its first tick. `tierOverride()` reads the
// URL first and the stored preference second, so the store is the working lever
// — and seeding it also switches the frame governor off, which matters for a
// different reason: without it, a headless box load-sample downgrades the page
// to `lite` mid-run and the `full` column silently measures the `lite` one.
//
// ## One trap this file was written around, at some cost
//
// **`Element.matches()` ignores media conditions.** A rule inside
// `@media (prefers-reduced-motion: reduce)` will report as matching an element
// on a page where that query is false, because `matches()` answers only "does
// this selector match this element" — the at-rule wrapping it is not part of the
// question, and Chromium does not expose a `CSSMediaRule.matches` either, so the
// obvious follow-up check is also unavailable.
//
// That produced a false positive here: a probe that walked the CSSOM looking for
// "which rule is stopping this animation" found a reduced-motion declaration
// matching the brand mark on a normal page and concluded the block was leaking
// into every session. It was not leaking. The rule was correctly scoped; the
// probe's method could not see the scope.
//
// So this file never identifies a winning rule by `matches()`. It reads computed
// values, which are the cascade's answer rather than a candidate's, and it
// compares them against expectations transcribed from the stylesheets. When an
// expectation and a measurement disagree, the next step is to read the file —
// not to trust a selector match.
//
// usage: effects-tiers.mjs <url> [--json]

import { launch } from './lib/chromium.mjs'
import { freshPage } from './lib/gates.mjs'

const TARGET = process.argv[2]
const AS_JSON = process.argv.includes('--json')
if (!TARGET) {
  console.error('usage: effects-tiers.mjs <url> [--json]')
  process.exit(2)
}

/**
 * The wallpaper, which is all-or-nothing at `off` and per-layer at `lite`.
 *
 * `lite` has exactly two shapes: layers hidden outright, and layers kept with
 * their animation removed so the composition survives the motion being dropped.
 * The distinction is drawn in `scenery.css` itself — a hidden layer is
 * decoration, a still one is part of the picture — so it is preserved here
 * rather than flattened to "stopped".
 */
const WALLPAPER = [
  // scenery.css:155 — hidden at lite. The light shafts are the most expensive
  // layer in the scene: a masked gradient over the whole viewport.
  { name: 'rays', selector: '.fa-scene__rays', lite: 'hidden' },
  // scenery.css:87 — hidden at lite.
  { name: 'aurora', selector: '.fa-scene__aurora', lite: 'hidden' },
  // scenery.css:109 — hidden at lite.
  { name: 'clouds', selector: '.fa-scene__clouds', lite: 'hidden' },
  // scenery.css:197 — hidden at lite. The far ridge is the hazed one; the haze
  // layer above it would have to carry the depth alone, so it is the one to go.
  { name: 'hills far', selector: '.fa-scene__hills.fa-scene__far', lite: 'hidden' },
  // scenery.css:282 — hidden at lite.
  { name: 'caustics', selector: '.fa-scene__caustics', lite: 'hidden' },
  // scenery.css:251 — still at lite, and this is the load-bearing one: the
  // water is the bottom third of the picture, so removing it would leave the
  // horizon floating.
  { name: 'water', selector: '.fa-scene__water', lite: 'still' },
  // scenery.css:363 — the scene's own overlay, hidden at lite.
  { name: 'scene wash', selector: '.fa-scene', pseudo: '::after', lite: 'hidden' },
  // Kept at lite with their motion: these are the cheap ones, and without them
  // the wallpaper reads as a still photo rather than as a living sky.
  { name: 'sun', selector: '.fa-scene__sun', lite: 'runs' },
  { name: 'haze', selector: '.fa-scene__haze', lite: 'runs' },
  { name: 'hills near', selector: '.fa-scene__hills.fa-scene__near', lite: 'runs' },
  // scenery.css:321/325 — the bubble layer loses its gloss shadow at lite but
  // keeps its rise, and the count drops from 22 to 10 via `FA_BUBBLES`.
  { name: 'bubbles', selector: '.fa-scene__bubble', lite: 'runs' },
]

/**
 * Sidebar, canvas and composer. Transcribed from the tier blocks at the foot of
 * `effects.css` (lines 858-912 at the time of writing).
 */
const CHROME = [
  // effects.css:282 enables — inside the desktop media query — and the tier
  // block stops it at `lite` and `off`.
  //
  // The `lite` stop rule is redundant and kept on purpose; `effects.css` carries
  // the reasoning. The short version: both sidebar enable rules live inside
  //
  //     @media (min-width: 1024px) and (hover: hover) and (pointer: fine)
  //
  // and the brand's is additionally scoped to `fa-tier-full`, so at `lite` there
  // is nothing to stop. Removing that line changes no rendering, which means a
  // red-when-reverted test on it will pass — and that is the correct outcome,
  // not a broken probe. It is asserted here as *behaviour* (the brand is still
  // at `lite`), not as the presence of a declaration.
  { region: 'sidebar', name: 'brand breathe', selector: '[data-slot="sidebar.brand.mark"] > *', lite: 'still' },
  // effects.css:864. Stops at lite, because a loop never ends and is exactly
  // what the tier is for.
  { region: 'sidebar', name: 'rail glow', selector: '[data-fa-col="sidebar"]', pseudo: '::after', lite: 'still' },
  // effects.css:876-886 — "The header sheen is a loop and goes; the canvas top
  // light is static and stays." It stops at lite, and its resting frame is
  // opacity 0 rather than a frozen mid-pulse.
  //
  // `requiresPhase` marks the one effect that cannot be measured as *painted*
  // at rest: the product renders the header with `display: none` until a
  // conversation has content. `headercheck.mjs` lifts the product's own class
  // and owns the "it really renders" claim; here the assertion is the weaker
  // "the rule stopped", because nothing stronger is observable in this phase.
  {
    region: 'canvas',
    name: 'header sheen',
    selector: '[data-fa-col="center"] [class*="header"]',
    pseudo: '::after',
    lite: 'still',
    requiresPhase: 'conversation',
  },
  // effects.css:897-904 — "The composer and overlay loops stop below full: the
  // placeholder sheen, the caret pulse, the boot orbit."
  { region: 'composer', name: 'placeholder shimmer', selector: '[data-composer-placeholder]', lite: 'still' },
  { region: 'composer', name: 'caret pulse', selector: '[data-lexical-editor]', lite: 'still' },
]

/**
 * Effects that must survive at every tier above `off`, because they are state,
 * not decoration. Asserted separately: a scroll edge that stops fading is a
 * layout that looks broken rather than a wallpaper that stopped moving.
 *
 * `effects.css:878-890` says so in as many words — "the scroll-edge fog is a
 * transition on a scroll state, not decoration" — and then hides the masks at
 * `off` anyway, which is why `off` is excluded here rather than asserted.
 */
const PERSISTENT = [
  { region: 'canvas', name: 'scroll edge top', selector: '[data-fa-scroll-edge="top"]' },
  { region: 'canvas', name: 'scroll edge bottom', selector: '[data-fa-scroll-edge="bottom"]' },
  { region: 'composer', name: 'composer card', selector: '[data-composer-card]' },
]

const TIERS = ['full', 'lite', 'off']

const browser = await launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const collected = {}
const consoleErrors = []

for (const tier of TIERS) {
  const page = await freshPage(browser, { viewport: { width: 1440, height: 900 } })
  page.on('pageerror', (e) => consoleErrors.push(`${tier}: ${String(e).slice(0, 160)}`))
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(`${tier}: ${m.text().slice(0, 160)}`)
  })

  await page.addInitScript((value) => {
    try {
      localStorage.setItem('frutiger-aero:effects', value)
    } catch (error) {
      /* read-only storage leaves the tier to the governor */
    }
  }, tier)

  await page.goto(TARGET, { waitUntil: 'domcontentloaded' })
  // Past the governor's 75-frame sample even though the stored preference
  // short-circuits it: the point of waiting is to measure a settled page.
  await page.waitForTimeout(6000)

  collected[tier] = await page.evaluate(`(() => {
    const WALLPAPER = ${JSON.stringify(WALLPAPER)}
    const CHROME = ${JSON.stringify(CHROME)}
    const PERSISTENT = ${JSON.stringify(PERSISTENT)}

    const read = (selector, pseudo) => {
      const el = document.querySelector(selector)
      if (el === null) return { found: false }
      const cs = getComputedStyle(el, pseudo || null)
      const rects = el.getClientRects().length
      const painted = rects > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'
      return {
        found: true,
        painted,
        animation: cs.animationName,
        iteration: cs.animationIterationCount,
        duration: cs.animationDuration,
        play: cs.animationPlayState,
        opacity: cs.opacity,
        display: cs.display,
        rects,
      }
    }

    const rows = {}
    for (const item of WALLPAPER) rows['wallpaper/' + item.name] = read(item.selector, item.pseudo)
    for (const item of CHROME) rows[item.region + '/' + item.name] = read(item.selector, item.pseudo)

    const transitions = {}
    for (const item of PERSISTENT) {
      const el = document.querySelector(item.selector)
      if (el === null) { transitions[item.region + '/' + item.name] = { found: false }; continue }
      const cs = getComputedStyle(el)
      transitions[item.region + '/' + item.name] = {
        found: true,
        display: cs.display,
        rects: el.getClientRects().length,
        property: cs.transitionProperty,
        duration: cs.transitionDuration,
      }
    }

    // Every painted infinite animation on the page, split by who wrote it.
    // The split is by keyframe *name prefix*, not by DOM region: the plugin
    // owns every fa- keyframe and no others, so a name census is exact, whereas
    // a region selector misses an effect that was attached to an app node
    // rather than to plugin-owned furniture — which is most of the desktop
    // block. Do not put a CSS selector in backticks inside this template.
    const running = [...document.querySelectorAll('*')].filter((el) => {
      const cs = getComputedStyle(el)
      return cs.animationName !== 'none'
        && cs.animationIterationCount === 'infinite'
        && cs.animationPlayState === 'running'
        && el.getClientRects().length > 0
    }).map((el) => getComputedStyle(el).animationName)

    return {
      rows,
      transitions,
      tier: document.documentElement.dataset.faTier || '(unset)',
      classes: document.documentElement.className,
      // Shape 3, and the reason no per-layer wallpaper assertion is made at
      // off: the runtime does not build the scene at all.
      scenePresent: document.querySelector('[data-fa-scene]') !== null,
      bubbleCount: document.querySelectorAll('.fa-scene__bubble').length,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      running: running.length,
      pluginRunning: running.filter((n) => n.startsWith('fa-')).length,
    }
  })()`)

  await page.__faContext?.close()
}

/* ── report ─────────────────────────────────────────────────────────────── */

let failures = 0
const checks = []
const check = (label, ok, detail) => {
  checks.push({ label, ok })
  if (!ok) failures += 1
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ' — ' + detail : ''}`)
}

console.log('── tier report ──')
for (const tier of TIERS) {
  const c = collected[tier]
  // A stored preference is only honoured for a sane value, and the classifier
  // still gets a say in whether full is offered, so this reports what the
  // plugin recorded rather than what was asked for.
  console.log(
    `${tier.padEnd(5)} → tier=${c.tier} scene=${c.scenePresent} bubbles=${c.bubbleCount} running=${c.running} plugin=${c.pluginRunning} classes="${c.classes}"`,
  )
  if (c.reducedMotion) console.log(`        note: this context reports prefers-reduced-motion: reduce`)
}

console.log()
console.log('── per effect ──')
console.log(`${'effect'.padEnd(28)} ${TIERS.map((t) => t.padEnd(22)).join('')}`)
const ALL = [
  ...WALLPAPER.map((i) => ({ ...i, key: `wallpaper/${i.name}` })),
  ...CHROME.map((i) => ({ ...i, key: `${i.region}/${i.name}` })),
]
for (const item of ALL) {
  const cells = TIERS.map((tier) => {
    const row = collected[tier].rows[item.key]
    if (!row || row.found !== true) return 'absent'.padEnd(22)
    if (!row.painted) return `hidden(${row.animation.slice(0, 9)})`.padEnd(22)
    if (row.animation === 'none') return `still(${row.opacity})`.padEnd(22)
    return `${row.animation.replace('fa-', '').slice(0, 11)} x${row.iteration.slice(0, 4)}`.padEnd(22)
  })
  console.log(`${item.key.padEnd(28)} ${cells.join('')}`)
}

/* ── assertions ─────────────────────────────────────────────────────────── */

console.log()
console.log('── assertions ──')

// 1. Each tier is the tier it was asked for. Without this the columns below
//    compare a tier against itself and pass for the wrong reason.
for (const tier of TIERS) {
  const actual = collected[tier].tier
  check(`the page reaches tier "${tier}"`, actual === tier, `reports "${actual}"`)
}

// 2. off means off, and it means it by *not building the scene*. This is shape
//    3, and it is the strongest form of the guarantee: an effect that does not
//    exist cannot cost anything.
check(
  'tier off does not build the wallpaper at all',
  collected.off.scenePresent === false && collected.off.bubbleCount === 0,
  `scene=${collected.off.scenePresent} bubbles=${collected.off.bubbleCount}`,
)
check(
  'tier off leaves no plugin loop painted anywhere',
  collected.off.pluginRunning === 0,
  `${collected.off.pluginRunning} fa-* loops running`,
)
// The wallpaper is built at both of the other tiers, which is what makes the
// per-layer assertions below meaningful rather than vacuous.
for (const tier of ['full', 'lite']) {
  check(`tier ${tier} builds the wallpaper`, collected[tier].scenePresent === true,
    `scene=${collected[tier].scenePresent}`)
}

// 3. The wallpaper, per layer, against the shape scenery.css gives it.
for (const item of WALLPAPER) {
  const key = `wallpaper/${item.name}`
  const full = collected.full.rows[key]
  const lite = collected.lite.rows[key]

  check(`${key}: present at full`,
    full && full.found === true && full.painted === true,
    full && full.found ? `painted=${full.painted} display=${full.display}` : 'absent')

  if (!lite || lite.found !== true) {
    // A hidden layer is hidden, not removed: scenery.css sets display none, so
    // an absence here would mean the runtime stopped building it, which is a
    // different change from the one the stylesheet describes.
    check(`${key}: still in the DOM at lite`, false, 'absent')
    continue
  }

  if (item.lite === 'hidden') {
    check(`${key}: hidden at lite`, lite.painted === false, `display=${lite.display} rects=${lite.rects}`)
  } else if (item.lite === 'still') {
    check(`${key}: still at lite (visible, no animation)`,
      lite.animation === 'none' && lite.painted === true,
      `anim=${lite.animation} painted=${lite.painted}`)
  } else {
    check(`${key}: runs at lite`,
      lite.painted === true && lite.animation !== 'none' && lite.iteration === 'infinite',
      `${lite.animation} x${lite.iteration}`)
  }
}

// The bubble count is the one wallpaper quantity that is a *number* rather than
// a state, and it is the lever the density control moves. Asserted explicitly
// because "22 at full, 10 at lite" is a commitment, not an implementation
// detail: it is what the tier buys.
check(
  'the bubble population halves at lite',
  collected.lite.bubbleCount > 0 && collected.lite.bubbleCount < collected.full.bubbleCount,
  `full=${collected.full.bubbleCount} lite=${collected.lite.bubbleCount}`,
)

// 4. The chrome.
for (const item of CHROME) {
  const key = `${item.region}/${item.name}`
  const full = collected.full.rows[key]
  const lite = collected.lite.rows[key]
  const off = collected.off.rows[key]

  check(`${key}: rule present at full`,
    full && full.found === true && full.animation !== 'none',
    full && full.found ? `anim=${full.animation}` : 'element absent')

  if (item.requiresPhase === 'conversation') {
    // Weaker on purpose: see the requiresPhase note in CHROME.
    check(`${key}: stops at lite`,
      lite && lite.found === true && lite.animation === 'none',
      lite && lite.found ? `anim=${lite.animation}` : 'element absent')
    check(`${key}: stops at off`,
      off && off.found === true && off.animation === 'none',
      off && off.found ? `anim=${off.animation}` : 'element absent')
    continue
  }

  if (item.lite === 'runs') {
    // The effect is meant to survive `lite` — see the note on this entry. An
    // assertion that it *stops* here would be asserting dead code back into the
    // stylesheet.
    check(`${key}: runs at lite`,
      lite && lite.found === true && lite.painted === true
        && lite.animation !== 'none' && lite.iteration === 'infinite',
      lite && lite.found ? `anim=${lite.animation} painted=${lite.painted}` : 'element absent')
    check(`${key}: stops at off`,
      off && off.found === true && off.animation === 'none',
      off && off.found ? `anim=${off.animation}` : 'element absent')
    continue
  }

  check(`${key}: stops at lite but stays visible`,
    lite && lite.found === true && lite.painted === true && lite.animation === 'none',
    lite && lite.found ? `anim=${lite.animation} painted=${lite.painted}` : 'element absent')
  check(`${key}: stops at off`,
    off && off.found === true && off.animation === 'none',
    off && off.found ? `anim=${off.animation}` : 'element absent')
}

// 5. The state transitions survive above off. They are the effects that are not
//    decoration, so a silent loss here is a broken-looking layout rather than a
//    quiet wallpaper.
for (const item of PERSISTENT) {
  const key = `${item.region}/${item.name}`
  for (const tier of ['full', 'lite']) {
    const row = collected[tier].transitions[key]
    if (!row || row.found !== true) {
      check(`${key}: present at ${tier}`, false, 'element absent')
      continue
    }
    const props = String(row.property)
    check(`${key}: keeps a transition at ${tier}`,
      props !== 'all' && props !== 'none' && props !== '',
      `transition-property=${props}`)
  }
}

// 6. The tier is a *decoration* switch, not a capability switch. The claim is
//    that it may only remove the plugin's own paint, and it is checked by name
//    rather than by count.
//
//    Two earlier versions of this assertion were wrong, in instructive ways.
//
//    The first counted painted infinite animations and required the count to be
//    non-zero at every tier. It passed at `full` and `lite` and failed at `off`
//    — because at `off` the app is on the hero phase, and the hero screen has
//    no infinite animation on it whether the skin is present or not. The count
//    was measuring the *screen*, not the tier.
//
//    The second compared against a control page with the wallpaper removed,
//    reasoning that `off` must not be quieter than the bare product. That
//    compared two pages on which the plugin was **fully live** — turning the
//    scene preference off removes the wallpaper, not the skin — so it attributed
//    the whole difference to the tier. It reported three plugin-authored
//    keyframes as product casualties.
//
//    What is actually checkable from here is the population split: the plugin's
//    keyframes must shrink to nothing across the tiers, and the product's must
//    not shrink at all. `offcheck.mjs` carries the same comparison by *name* and
//    adds the live entrance it cannot observe from a single load; this states
//    the plugin half, which is the half that is a decision.
check(
  'the plugin\'s own animations vanish at off',
  collected.off.pluginRunning === 0 && collected.full.pluginRunning > 0,
  `full=${collected.full.pluginRunning} lite=${collected.lite.pluginRunning} off=${collected.off.pluginRunning}`,
)
check(
  'the plugin runs fewer animations at lite than at full',
  collected.lite.pluginRunning < collected.full.pluginRunning,
  `full=${collected.full.pluginRunning} lite=${collected.lite.pluginRunning}`,
)

if (consoleErrors.length > 0) {
  check('no console errors at any tier', false, consoleErrors.slice(0, 3).join(' | '))
} else {
  check('no console errors at any tier', true)
}

console.log()
console.log(failures === 0
  ? `PASS  ${checks.length} tier checks`
  : `FAIL  ${checks.length - failures} passed, ${failures} failed`)

if (AS_JSON) {
  console.log(JSON.stringify(
    Object.fromEntries(TIERS.map((t) => [t, {
      tier: collected[t].tier,
      scene: collected[t].scenePresent,
      bubbles: collected[t].bubbleCount,
      running: collected[t].running,
      pluginRunning: collected[t].pluginRunning,
    }])),
    null,
    1,
  ))
}

await browser.close()
process.exit(failures === 0 ? 0 : 1)
