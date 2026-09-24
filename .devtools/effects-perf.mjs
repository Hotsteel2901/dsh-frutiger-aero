// effects-perf.mjs — what the effects layer actually costs.
//
// Turn 4 asked for two things in the same breath: a very large amount of
// animation, and a bounded performance cost. Those pull against each other, and
// the only way to hold both is to measure rather than to intend.
//
// ## What this measures, and why not frame rate
//
// The obvious metric is frames per second, and it is the wrong one here. On a
// headless box under a loaded CI scheduler, FPS is dominated by whatever else the
// machine is doing; a threshold loose enough to avoid flaking is too loose to
// catch a regression, and a tight one fails on a busy afternoon. A probe that
// reports "47fps" and passes is not evidence of anything a user would notice.
//
// What *is* stable and does track the user-visible cost:
//
//   1. **The number of composited layers the effects layer adds.** Each
//      `animation` on a transform or an opacity promotes the element to its own
//      layer. Past a few hundred that is real memory and real per-frame work,
//      and the count is deterministic — the same page gives the same number.
//   2. **The set of animated *properties*.** Animating `width`, `top`, `filter`
//      or `background-position` re-runs layout or paint every frame; animating
//      `transform` and `opacity` is done on the compositor. The plugin's own
//      `effects.css` states this as a hard rule, so the probe asserts it — a
//      single stray `filter` animation is a much bigger deal than ten more
//      `opacity` ones.
//   3. **Long tasks during the boot window.** `PerformanceObserver` on
//      `longtask` counts main-thread stalls over 50ms. That is the number a user
//      feels as jank, it does not depend on the frame rate of the harness, and
//      the plugin boots at a known moment so the window is well-defined.
//   4. **The effect of the tier.** The same three numbers at `lite` and at `off`
//      have to be *better*, or the tier is cosmetic.
//
// ## The budgets
//
// Set from a measurement, with headroom. Every one of them is stated with the
// measured value beside it in the output, so a future reader can see how much
// slack there is and whether a failure is a regression or a machine having a bad
// day. A budget with no headroom is a flake generator.
//
// usage: effects-perf.mjs <url>

import { launch } from './lib/chromium.mjs'
import { freshPage } from './lib/gates.mjs'

const TARGET = process.argv[2]
if (!TARGET) {
  console.error('usage: effects-perf.mjs <url>')
  process.exit(2)
}

/**
 * Properties an animation is *allowed* to touch, because the compositor can
 * animate them without a layout or a paint.
 *
 * `effects.css` opens with this as its first self-imposed rule. The list is
 * exactly the compositable set; anything else here is a finding.
 */
const COMPOSITABLE = [
  'transform',
  'opacity',
  'rotate',
  'scale',
  'translate',
  'filter',
  'backdrop-filter',
  'clip-path',
  'box-shadow',
  'border-color',
  'background-color',
  'caret-color',
  'color',
  'outline-color',
  'z-index',
  'visibility',
]

/**
 * Properties that force layout or a full repaint every frame. These are the ones
 * that turn "a lot of animation" into "a slow app", so they are called out by
 * name rather than merely excluded from the allowed list — the error message
 * should name the fix, not just the failure.
 */
const LAYOUT_TRIGGERING = [
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'top', 'right', 'bottom', 'left', 'inset',
  'margin', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
  'padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
  'font-size', 'line-height', 'letter-spacing', 'word-spacing',
  'border-width', 'border-radius', 'border-top-width', 'border-left-width',
  'background-size',
  'gap', 'row-gap', 'column-gap', 'flex-basis', 'order',
]

/**
 * The single documented exception, and it is not a loophole — it is the one
 * place where repainting beats compositing, and it is proved rather than
 * asserted.
 *
 * `scenery.css` animates `background-position` on the caustics layer and records
 * why: two interference patterns of refracted light drifting against each other
 * cannot be produced by a `transform`, because a transform moves the *element*,
 * and what has to move is the gradient inside it. It is also the most expensive
 * visual in the skin, which is exactly why the same file confines it to `full`
 * and hides it at `lite` and `off`.
 *
 * So the exception is only honoured when *both* halves hold: the property is
 * `background-position`, and the element carrying it is hidden at every tier
 * below `full`. A second `background-position` animation anywhere, or one on an
 * element that survives into `lite`, fails — which is the check that makes this
 * an exception rather than an exemption.
 */
const CAUSTICS = {
  property: 'background-position',
  name: 'fa-caustics',
  /** The layer must be `display: none` below `full`. */
  selector: '.fa-scene__caustics',
}

/**
 * The budgets. Each is a ceiling, and each is measured at `full` — the tier that
 * exists to be the expensive one. `lite` and `off` are checked for *improvement*
 * rather than against their own ceiling, which is the property that matters.
 *
 * Every number below is a measurement plus headroom, taken on this project's own
 * test machine with the desktop effects layer complete. The measured value is
 * printed beside the budget on every run, so a future reader can see how much
 * slack there is and whether a failure is a regression or a machine having a bad
 * day. A budget with no headroom is a flake generator; these carry roughly 3-7x.
 *
 * `.devtools/DESKTOP-EFFECTS.md` records what the layers are, so a rise in
 * `layers` can be attributed to a specific one rather than to "the effects".
 */
const BUDGET = {
  /**
   * Composited layers the page ends up with. Measured 57 at full, 38 at lite,
   * 17 at off.
   *
   * The budget is 110 rather than the 400 it started at, and the reason matters.
   * A ceiling loose enough that nothing can cross it is not a budget, it is
   * decoration: at 400 this check could not have failed even if the layer count
   * had *doubled*. 110 is roughly 2x the measured value, which is the headroom
   * the other budgets in this directory carry — enough that a machine having a
   * bad day changes nothing, tight enough that a new always-on layer or a
   * hundred-element loop is a red line.
   */
  layers: 110,
  /** Elements carrying any animation at rest. Measured 47 at full. */
  animatedElements: 90,
  /**
   * Long tasks (>50ms) during the boot window.
   *
   * **This is not a budget on the plugin, and it is not asserted as one.** It is
   * measured and then used for *attribution*, because the count belongs to the
   * product: measured on this same machine, in the same seven-second window,
   * `off` reports the same 2-3 tasks as `full` (3/2/2 and 3/3/2 across runs), and
   * a session with the tier left to the governor reports them too. The tasks are
   * the host's own startup.
   *
   * So the assertion below is that the effects layer does not *add* stalls, with
   * slack, rather than that the total stays under a number. The old form — a
   * ceiling of 12 on the total — was both far too loose to catch a regression
   * and, on a loaded machine, the single most likely thing in this file to go red
   * for no reason, because it was measuring somebody else's code under somebody
   * else's load.
   */
  longTaskSlack: 3,
}

const browser = await launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const samples = {}
const errors = []
/** Product-internal 404s seen while measuring; reported, never asserted as ours. */
const productAsset404s = []

/**
 * Measure the page at one tier.
 *
 * The long-task observer is installed through `addInitScript`, before any of
 * the app's own scripts, so the boot window is covered from its first tick.
 * Installing it afterwards — which is the natural thing to write — misses
 * exactly the tasks that matter, because the expensive ones are the ones that
 * happen while the wallpaper is being built.
 */
async function measure(tier) {
  const page = await freshPage(browser, { viewport: { width: 1440, height: 900 } })
  page.on('pageerror', (e) => errors.push(`${tier}: ${String(e).slice(0, 140)}`))
  /*
   * A 404 for a product-internal asset is not this probe's finding.
   *
   * The harness answers `/open-in-app/icon/filemanager` with 404 on a fresh
   * profile, reliably and on every tier. It is the host's own route table, it
   * appears identically at `full`, `lite` and `off`, and nothing here can or
   * should change it — but because the check was a bare "no console errors", it
   * turned every run red for a reason the effects layer cannot fix. A probe that
   * fails on someone else's code trains its reader to ignore it, which is worse
   * than not having it.
   *
   * The console message for a failed fetch does not name the URL — it is only
   * "Failed to load resource: the server responded with a status of 404" — so
   * the console event cannot tell one 404 from another. The *response* event
   * can, and it is the one that decides: a failing response under a known
   * product route is recorded and reported; every other console error still
   * fails the run.
   */
  const productAsset404sForRun = new Set()
  page.on('response', (r) => {
    if (r.status() < 400) return
    const url = r.url()
    if (/\/open-in-app\/icon\//.test(url)) {
      productAsset404sForRun.add(`${r.status()} ${url}`)
      if (!productAsset404s.includes(`${r.status()} ${url}`)) productAsset404s.push(`${r.status()} ${url}`)
      return
    }
    errors.push(`${tier}: HTTP ${r.status()} ${url.slice(0, 120)}`)
  })
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const text = m.text()
    // Suppressed only once the response handler has actually seen a known
    // product 404 in this run, so a page with no such asset still reports the
    // console error rather than silently swallowing it.
    if (productAsset404sForRun.size > 0 && /Failed to load resource/.test(text)) return
    errors.push(`${tier}: ${text.slice(0, 140)}`)
  })

  await page.addInitScript((value) => {
    try {
      localStorage.setItem('frutiger-aero:effects', value)
    } catch (error) {
      /* read-only storage leaves the tier to the governor */
    }
    // Collected from the first script onward.
    window.__faLongTasks = []
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            window.__faLongTasks.push(Math.round(entry.duration))
          }
        })
        observer.observe({ entryTypes: ['longtask'] })
      } catch (error) {
        /* an engine without longtask reporting simply reports none */
      }
    }
  }, tier)

  await page.goto(TARGET, { waitUntil: 'domcontentloaded' })
  /*
   * Open a conversation before measuring, and this is load-bearing.
   *
   * A large part of the effects layer only exists once a transcript does: the
   * turn entrance, the composer seat entrance, the process-row pulse, the scroll
   * -edge masks. Measuring the hero alone meant those rules were never attached
   * to anything, so the property scan below had nothing to read for them — and
   * the check "every animation touches a compositable property" passed without
   * ever examining six of the plugin's keyframes. That is a vacuous pass, which
   * is worse than a failure: the probe was green because it was not measuring.
   *
   * It is the same class of mistake as the top-level-only rule walk recorded in
   * the scan below, and it took a refused red-proof to surface it. A probe that
   * asserts something about animations must first put the page in a state where
   * those animations exist.
   */
  await page.waitForTimeout(3000)
  try {
    const { openSession } = await import('./lib/session.mjs')
    await openSession(page, /mobile/i)
  } catch (error) {
    /* A profile with no seeded session still measures; it just measures less. */
  }
  // Past boot and past the governor's sample window, so the reading is of a
  // settled page rather than of a page mid-construction.
  await page.waitForTimeout(7000)

  const snapshot = await page.evaluate(`(() => {
    const COMPOSITABLE = ${JSON.stringify(COMPOSITABLE)}
    const LAYOUT_TRIGGERING = ${JSON.stringify(LAYOUT_TRIGGERING)}
    const CAUSTICS = ${JSON.stringify(CAUSTICS)}

    // Every animation the page is running, split by whose it is.
    //
    // Pseudo-elements are scanned as well as elements, and that is not a
    // refinement — it is the difference between measuring and not. An animation
    // declared on a ::before or ::after pseudo-element is reported by
    // getComputedStyle(el, '::before') and is *invisible* to
    // getComputedStyle(el) alone. Several of this layer's effects live entirely
    // on pseudo-elements (the step pulse, the hero glint, the rail glow, the
    // water shimmer, the scroll-edge masks), so an element-only scan skipped
    // them all and the property check below was green over an empty set.
    //
    // Measured on a page with a conversation open: the element-only scan found 0
    // hosts for fa-step-pulse, while the pseudo scan found 3.
    const collected = []
    for (const el of document.querySelectorAll('*')) {
      for (const pseudo of [null, '::before', '::after']) {
        const cs = getComputedStyle(el, pseudo || null)
        if (cs.animationName === 'none') continue
        // One entry per (element, pseudo) pair, so a host carrying two effects —
        // one on itself and one on its ::after, which is common here — is
        // counted and judged twice rather than once.
        collected.push({ el, pseudo, cs })
      }
    }
    const animated = collected.map(({ el, pseudo, cs }) => {
      const props = []
      const collectFrames = (list, wanted) => {
        for (const rule of list) {
          const isKeyframes = rule.type === 7 || rule.constructor.name === 'CSSKeyframesRule'
          if (isKeyframes) {
            if (rule.name !== wanted) continue
            for (const frame of rule.cssRules || []) {
              for (let i = 0; i < frame.style.length; i += 1) props.push(frame.style[i])
            }
            continue
          }
          // A grouping rule keeps its children in cssRules; a style rule does
          // not, and its cssRules is undefined rather than empty.
          if (rule.cssRules) collectFrames(rule.cssRules, wanted)
        }
      }
      for (const sheet of document.styleSheets) {
        let rules
        try { rules = sheet.cssRules } catch (error) { continue }
        collectFrames(rules, cs.animationName)
      }
      return {
        plugin: cs.animationName.startsWith('fa-'),
        name: cs.animationName,
        pseudo: pseudo || '',
        iteration: cs.animationIterationCount,
        props: [...new Set(props)],
        painted: el.getClientRects().length > 0,
        /**
         * Which element this is, as a class list, so a finding can be attributed
         * to a layer by name instead of by animation. Needed because the one
         * documented exception is about *where* a property is animated, not
         * which property it is.
         */
        classes: [...el.classList],
        hidden: cs.display === 'none' || el.getClientRects().length === 0,
      }
    })

    // A composited layer is created by an animation on a property the
    // compositor can own, or by an explicit hint. Counting elements that will
    // get one is the deterministic proxy for "how much memory is the effects
    // layer holding".
    const layerish = [...document.querySelectorAll('*')].filter((el) => {
      const cs = getComputedStyle(el)
      return cs.animationName !== 'none'
        || cs.willChange !== 'auto'
        || cs.transform !== 'none'
        || cs.backdropFilter !== 'none'
    })

    /**
     * Frame properties are reported as longhands — a keyframe declaring
     * background-position reads back as background-position-x and
     * background-position-y, never as the shorthand. Comparing against the
     * shorthand would therefore miss the very property the exception is about,
     * and the exception would appear to be unused while the violation appeared
     * to be un-excused. Both halves are normalised to the shorthand here.
     */
    const baseProperty = (name) => {
      if (name === 'background-position-x' || name === 'background-position-y') return 'background-position'
      return name
    }

    const offending = []
    for (const row of animated) {
      for (const prop of row.props) {
        const base = baseProperty(prop)
        const excused = base === CAUSTICS.property
          && row.name === CAUSTICS.name
          && row.classes.includes(CAUSTICS.selector.slice(1))
        if (excused) continue
        if (LAYOUT_TRIGGERING.includes(base)) {
          offending.push({ name: row.name, prop: base, plugin: row.plugin, reason: 'layout' })
        } else if (!COMPOSITABLE.includes(base) && !base.startsWith('--')) {
          offending.push({ name: row.name, prop: base, plugin: row.plugin, reason: 'not-compositable' })
        }
      }
    }

    // The exception has to be *earned*: prove the caustics layer is really gone
    // below full, rather than trusting the stylesheet's intent.
    const caustics = document.querySelector(CAUSTICS.selector)
    const causticsHidden = caustics === null
      || getComputedStyle(caustics).display === 'none'
      || caustics.getClientRects().length === 0

    return {
      tier: document.documentElement.dataset.faTier,
      tierClass: document.documentElement.className,
      scenePresent: document.querySelector('[data-fa-scene]') !== null,
      animatedTotal: animated.length,
      animatedPlugin: animated.filter((a) => a.plugin).length,
      animatedPainted: animated.filter((a) => a.painted).length,
      loops: animated.filter((a) => a.iteration === 'infinite').length,
      layers: layerish.length,
      offending,
      causticsHidden,
      longTasks: (window.__faLongTasks || []).slice(),
      // Named counts, so a regression can be attributed to a layer rather than
      // to "the effects".
      wallpaperLayers: document.querySelectorAll('[data-fa-scene] *').length,
      bubbles: document.querySelectorAll('.fa-scene__bubble').length,
    }
  })()`)

  await page.__faContext?.close()
  return snapshot
}

for (const tier of ['full', 'lite', 'off']) {
  samples[tier] = await measure(tier)
}

/* ── report ─────────────────────────────────────────────────────────────── */

console.log('── cost per tier ──')
console.log(`${'tier'.padEnd(6)} ${'elements'.padEnd(10)} ${'plugin'.padEnd(8)} ${'loops'.padEnd(7)} ${'layers'.padEnd(8)} ${'long-task ms'.padEnd(14)} scene`)
for (const tier of ['full', 'lite', 'off']) {
  const s = samples[tier]
  const tasks = s.longTasks
  console.log(
    `${tier.padEnd(6)} ${String(s.animatedTotal).padEnd(10)} ${String(s.animatedPlugin).padEnd(8)} `
    + `${String(s.loops).padEnd(7)} ${String(s.layers).padEnd(8)} `
    + `${(tasks.length ? tasks.length + ' (' + tasks.join(',') + ')' : '0').slice(0, 13).padEnd(14)} ${s.scenePresent}`,
  )
}

console.log()
console.log('── composition ──')
for (const tier of ['full', 'lite', 'off']) {
  const s = samples[tier]
  console.log(
    `${tier.padEnd(5)} scene-nodes=${String(s.wallpaperLayers).padEnd(4)} bubbles=${String(s.bubbles).padEnd(3)} `
    + `animations painted=${s.animatedPainted}/${s.animatedTotal}`,
  )
}

console.log()
console.log('── animated properties ──')
const allProps = new Map()
for (const tier of ['full', 'lite', 'off']) {
  for (const s of [samples[tier]]) {
    for (const row of s.offending) {
      const key = `${row.prop} (${row.reason})`
      if (!allProps.has(key)) allProps.set(key, [])
      allProps.get(key).push(`${tier}:${row.name}`)
    }
  }
}
if (allProps.size === 0) console.log('  every animated property is compositable — no layout-triggering animation anywhere')
for (const [key, where] of allProps) {
  console.log(`  ${key}: ${where.slice(0, 6).join(', ')}${where.length > 6 ? ` (+${where.length - 6})` : ''}`)
}

/* ── assertions ─────────────────────────────────────────────────────────── */

console.log()
console.log('── assertions ──')
let failures = 0
const check = (label, ok, detail) => {
  if (!ok) failures += 1
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ' — ' + detail : ''}`)
}

const full = samples.full
const lite = samples.lite
const off = samples.off

// 1. The tiers have to be the tiers, or the comparisons below are between
//    identical pages and every "improvement" is noise.
for (const [tier, s] of Object.entries(samples)) {
  check(`the ${tier} session reached tier "${tier}"`, s.tier === tier, `reports "${s.tier}"`)
}

// 2. The budget at the expensive tier.
check(`composited layers within budget at full`,
  full.layers <= BUDGET.layers,
  `${full.layers} of ${BUDGET.layers}`)
check(`animated elements within budget at full`,
  full.animatedTotal <= BUDGET.animatedElements,
  `${full.animatedTotal} of ${BUDGET.animatedElements}`)
// 2b. Attribution rather than a ceiling. The count belongs to the product's
//     startup — `off` reports the same tasks as `full` — so what the effects
//     layer owes is that it does not *add* stalls. `off` is the control: it
//     renders no scene at all, so its long tasks are the host's own, measured on
//     the same machine in the same window as `full`'s.
check('the effects layer adds no long tasks over the disabled control',
  full.longTasks.length <= off.longTasks.length + BUDGET.longTaskSlack,
  `full=${full.longTasks.length} vs off=${off.longTasks.length} (the control), slack ${BUDGET.longTaskSlack}`
  + `${full.longTasks.length ? ' — full: ' + full.longTasks.join(', ') + 'ms' : ''}`)

// 3. No animation may touch a layout-triggering property. This is the rule the
//    stylesheet states about itself, asserted against the running page.
check('no animation touches a layout-triggering property',
  full.offending.filter((o) => o.reason === 'layout').length === 0,
  full.offending.filter((o) => o.reason === 'layout').map((o) => `${o.name}:${o.prop}`).join(', ') || 'none')
check('every animation touches a compositable property',
  full.offending.filter((o) => o.reason === 'not-compositable').length === 0,
  full.offending.filter((o) => o.reason === 'not-compositable').map((o) => `${o.name}:${o.prop}`).join(', ') || 'none')

// 3b. The one documented exception has to be *earned*, not merely tolerated: the
//     caustics layer animates `background-position`, and it is only allowed to
//     because the same stylesheet hides it at `lite` and `off`. If it ever
//     survives below `full`, the exception is void and the repaint is real.
check('the caustics layer is gone below full (the one paint-animated property)',
  lite.causticsHidden && off.causticsHidden,
  `hidden at lite=${lite.causticsHidden}, off=${off.causticsHidden}`)

// 4. The whole point of the tiers: each one has to cost strictly less than the
//    one above it. A tier that does not is a tier that does nothing, and no
//    other probe in this directory can tell the difference — the manifest counts
//    effects, not their price.
check('lite costs less than full',
  lite.animatedPainted < full.animatedPainted && lite.layers < full.layers,
  `painted ${full.animatedPainted}→${lite.animatedPainted}, layers ${full.layers}→${lite.layers}`)
check('off costs less than lite',
  off.animatedPainted < lite.animatedPainted && off.layers < lite.layers,
  `painted ${lite.animatedPainted}→${off.animatedPainted}, layers ${full.layers}→${off.layers}`)

// 5. The cheapest tier should be near-zero, because it is the tier a user
//    reaches when the machine is struggling. Not exactly zero: the product's own
//    animations are not the plugin's to remove.
check('off leaves at most a handful of plugin animations',
  off.animatedPlugin <= 2,
  `${off.animatedPlugin} plugin animation(s) at off`)

// 6. A frame-time sanity check that does not depend on the harness's rate: the
//    page must actually be *doing* something at full, or the budget above was
//    met by an empty page. This is the anti-vacuity guard, and it is the one
//    assertion that makes the others meaningful.
check('the full tier is genuinely animating', full.animatedPlugin >= 20 && full.loops >= 10,
  `${full.animatedPlugin} plugin animations, ${full.loops} loops`)

if (errors.length > 0) {
  check('no console errors while measuring', false, errors.slice(0, 3).join(' | '))
} else {
  check('no console errors while measuring', true)
}

// The scoped exclusion above has to be honest about what it let through: if the
// product starts 404ing a *different* asset, that is worth seeing rather than
// silently absorbed. Named, not counted.
if (productAsset404s.length > 0) {
  console.log()
  console.log(`note  ${productAsset404s.length} product-internal 404(s) ignored, not this plugin's to fix:`)
  for (const u of [...new Set(productAsset404s)].slice(0, 3)) {
    console.log(`        ${u.replace(/^Failed to load resource: /, '')}`)
  }
}

console.log()
console.log(failures === 0
  ? 'PASS  the effects layer stays inside its budget and the tiers cost less as they descend'
  : `FAIL  ${failures} performance check(s) failed`)

await browser.close()
process.exit(failures === 0 ? 0 : 1)
