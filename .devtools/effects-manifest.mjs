// effects-manifest.mjs — what the skin actually gives an animation or a
// transition to, on the live page, at the desktop tier.
//
// The reason this exists rather than a grep over `effects.css`: **a rule that
// matches nothing is indistinguishable from a rule that is switched off**. Both
// produce the same absence at the point of use. Only asking the live document
// which elements carry which animation can tell them apart, and the difference
// matters — one is a typo, the other is a decision.
//
// It prints the inventory grouped by region and exits non-zero if the count
// drops below the floor recorded here. The floor is the point: it stops a
// refactor from silently deleting a region's effects, which is exactly what a
// count over the *stylesheet* cannot catch.
//
// usage: effects-manifest.mjs <url> [--json]

import { launch } from './lib/chromium.mjs'
import { freshPage } from './lib/gates.mjs'

const TARGET = process.argv[2]
const AS_JSON = process.argv.includes('--json')
if (!TARGET) {
  console.error('usage: effects-manifest.mjs <url> [--json]')
  process.exit(2)
}

// The floor per region, set from a measurement rather than from the number of
// rules written — the two differ, and only the first is worth asserting.
//
//   1. **Some targets only exist once a surface is open.** The settings dialog,
//      menus, listboxes and tooltips are absent from the resting page, so those
//      regions cannot be counted here at all. `composercheck.mjs` and
//      `overlays.mjs` open them and assert their effects. `OPENED_ELSEWHERE`
//      names them so a later reader does not mistake an unopened surface for a
//      missing effect.
//   2. **Some effects are transitions, not animations.** The scroll-edge masks
//      and the composer card are state changes on purpose. They are counted in
//      their own column, because a floor expressed in loops can never be met by
//      a transition.
//   3. **Some effects are only visible outside the hero phase.** The canvas
//      header sheen lives on `.wSkVaW_header`, which the product renders with
//      `display: none` until a conversation has content. At rest it measures
//      0x0 and its animation is real but unpainted — `headercheck.mjs` lifts the
//      product's own `headerHidden` class to prove the rule renders, and that is
//      a weaker claim than this probe can make, so it is not asserted here.
//
// Raise these by hand when a region gains effects. Lowering one is a deliberate
// act and should require editing this table, which is the moment to ask
// whether the effect was meant to go.
const FLOOR = {
  wallpaper: { loops: 11, oneShot: 0, transitions: 0 },
  sidebar: { loops: 2, oneShot: 0, transitions: 0 },
  // `[data-fa-canvas]::before` is the transcript's top wash; the two
  // `data-fa-scroll-edge` masks are `effects.css`'s. All three are opacity
  // transitions and all three need a *scrolled* conversation to become visible,
  // which is why they report here and are asserted for behaviour in
  // `canvascheck.mjs`.
  canvas: { loops: 0, oneShot: 0, transitions: 3 },
  // Three loops and one entrance. `transitions: 0` is the *correct* floor and
  // was `1` in error. The composer's only transitions belong to controls that
  // need a pointer to enter: the button lift is declared on `:hover`, and the
  // card's focus ring is a `transition` on a `::after` whose declared duration
  // is zero when the `:focus-within` rule has not matched — a real transition
  // that cannot be seen at rest. Requiring one here meant the floor could only
  // be satisfied by a phantom, which is exactly what the old `transitionProperty
  // !== 'all'` test provided. The hover behaviour is asserted by
  // `composercheck.mjs`, which can actually hover.
  composer: { loops: 3, oneShot: 1, transitions: 0 },
  overlays: { loops: 0, oneShot: 0, transitions: 0 },
}

// Regions whose effects are only reachable through an interaction, or only
// visible in a phase this probe cannot reach. Reported, never asserted against.
const OPENED_ELSEWHERE = ['overlays']

const browser = await launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const page = await freshPage(browser, { viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)))

// Pin the tier before the plugin boots, and do it through `localStorage`.
//
// Two traps, both measured, both of which made this probe report every desktop
// effect as absent:
//
//   1. **The frame governor downgrades a healthy machine.** The page boots at
//      `full` and, ~3.5s in, samples 75 frames; if the average is over 20ms it
//      moves to `lite` and never moves back. Headless Chromium on a loaded CI
//      box legitimately exceeds that during boot. The inventory has to be taken
//      after the governor has settled *and* with the governor neutralised.
//   2. **`?frutiger=full` cannot survive this server.** The harness answers
//      `/` **and** `/?token=…` with `303 See Other` → `location: /`, so the
//      entire query string is gone before the first script runs — `addInitScript`
//      reads `location.search` as `""` on its very first tick. The documented
//      URL override is therefore unreachable in this harness, which is why the
//      stored preference is the lever that works.
//
// `tierOverride()` reads the URL first and `localStorage` second, and returns
// early from the governor when either is set, so seeding the store both selects
// the tier and switches the governor off.
await page.addInitScript(() => {
  try {
    localStorage.setItem('frutiger-aero:effects', 'full')
  } catch (error) {
    /* a read-only storage would leave the tier to the governor */
  }
})

await page.goto(TARGET, { waitUntil: 'domcontentloaded' })
// Long enough for the 75-frame sample to have run and settled either way.
await page.waitForTimeout(6000)

const report = await page.evaluate(`(() => {
  // Every plugin-owned marker, plus the app surfaces the desktop block targets.
  // A region is defined by the DOM the effect is attached to, not by the file
  // the rule lives in, so this stays honest if a rule moves between sheets.
  // A region is the DOM an effect is attached to, so a rule that moves between
  // stylesheets does not move between regions here.
  //
  // The canvas and composer regions name the elements the desktop block really
  // styles. An earlier version of this table listed the header-sheen and
  // composer-decoration markers — names that looked plausible and appear in no
  // stylesheet and in no runtime file — so two regions reported zero effects
  // and the probe blamed the CSS for its own invented selectors. Only names
  // that appear in effects.css or in runtime.js belong here.
  const REGIONS = {
    wallpaper: ['.fa-scene__layer', '.fa-scene__aurora', '.fa-scene__clouds',
                '.fa-scene__sun', '.fa-scene__haze', '.fa-scene__water'],
    sidebar: ['[data-slot="sidebar.brand.mark"] > *', '[data-fa-col="sidebar"]',
              '[data-fa-col="sidebar"] [role="tree"] > *'],
    canvas: ['[data-fa-col="center"]', '[data-fa-canvas]',
             '[data-fa-scroll-edge="top"]', '[data-fa-scroll-edge="bottom"]'],
    composer: ['[data-composer-card]', '[data-composer-card]::after',
               '[data-composer-card] button', '[data-composer-card] [role="button"]',
               '[data-composer-placeholder]', '[data-composer-seat]'],
    overlays: ['[role="dialog"]', '[role="menu"]', '[role="listbox"]', '[role="status"]'],
  }

  const readElement = (el) => {
    const cs = getComputedStyle(el)
    return {
      tag: el.tagName.toLowerCase(),
      cls: typeof el.className === 'string' ? el.className.split(/\\s+/).filter(Boolean)[0] || '' : '',
      anim: cs.animationName,
      iter: cs.animationIterationCount,
      dur: cs.animationDuration,
      // Transitions are counted too, and reported as their own kind. Several
      // desktop effects are transitions on purpose — the scroll-edge masks and
      // the composer card are state changes, not loops — so counting only
      // animations reports those regions as empty.
      trans: cs.transitionProperty,
      transDur: cs.transitionDuration,
    }
  }

  const readPseudo = (el, which) => {
    const cs = getComputedStyle(el, which)
    return {
      tag: el.tagName.toLowerCase(),
      cls: typeof el.className === 'string' ? el.className.split(/\\s+/).filter(Boolean)[0] || '' : '',
      pseudo: which,
      anim: cs.animationName,
      iter: cs.animationIterationCount,
      dur: cs.animationDuration,
      // Pseudo-elements carry transitions too, and they are where several of the
      // desktop effects live — the composer's focus ring among them. Reading only
      // the animation here is what made the composer region look thinner than it
      // is.
      trans: cs.transitionProperty,
      transDur: cs.transitionDuration,
    }
  }

  const out = {}
  for (const [region, selectors] of Object.entries(REGIONS)) {
    const rows = []
    for (const selector of selectors) {
      let nodes = []
      try { nodes = [...document.querySelectorAll(selector)] } catch (e) { nodes = [] }
      for (const el of nodes.slice(0, 6)) {
        for (const which of [null, '::before', '::after']) {
          const row = which === null ? readElement(el) : readPseudo(el, which)
          const hasAnim = row.anim !== 'none' && row.anim !== ''
          /*
           * A transition counts only if it can actually be seen moving.
           *
           * A transition-property alone is not evidence: it is the CSS initial
           * value, so every element in the page reports "all", and a great many
           * report a real property at a duration of zero — a declaration that
           * exists and does nothing. Counting either produced a phantom
           * "transition" in every region and a floor that passed for the wrong
           * reason. The usable test is a *declared* property, neither "all" nor
           * "none", at a non-zero duration.
           */
          const hasTrans = typeof row.trans === 'string'
            && row.trans !== 'all' && row.trans !== 'none' && row.trans !== ''
            && typeof row.transDur === 'string' && row.transDur !== '0s'
          if (!hasAnim && !hasTrans) continue
          rows.push({
            ...row,
            selector,
            kind: hasAnim ? (row.iter === 'infinite' ? 'loop' : 'oneShot') : 'transition',
          })
        }
      }
    }
    out[region] = rows
  }

  // The tier and pointer class the measurement was taken under, because every
  // count below is only meaningful at the full tier.
  out.__meta = {
    tier: document.documentElement.dataset.faTier || '(unset)',
    pointer: document.documentElement.dataset.faPointer || '(unset)',
    classes: document.documentElement.className,
  }
  return out
})()`)

const meta = report.__meta
delete report.__meta

console.log('── effects manifest ──')
console.log(`tier=${meta.tier} pointer=${meta.pointer} classes=${meta.classes}`)
console.log()

let failures = 0
const summary = {}

for (const [region, rows] of Object.entries(report)) {
  const loops = rows.filter((r) => r.kind === 'loop')
  const oneShot = rows.filter((r) => r.kind === 'oneShot')
  const transitions = rows.filter((r) => r.kind === 'transition')
  summary[region] = { loops: loops.length, oneShot: oneShot.length, transitions: transitions.length }

  console.log(`${region}: ${loops.length} loops, ${oneShot.length} one-shot, ${transitions.length} transitions`)
  if (!AS_JSON) {
    for (const r of loops) {
      console.log(`  loop  ${r.anim.padEnd(22)} ${(r.pseudo || '').padEnd(9)} ${r.selector}`)
    }
    for (const r of oneShot) {
      console.log(`  once  ${r.anim.padEnd(22)} ${(r.pseudo || '').padEnd(9)} ${r.selector}`)
    }
    for (const r of transitions) {
      console.log(`  trans ${r.trans.slice(0, 22).padEnd(22)} ${(r.pseudo || '').padEnd(9)} ${r.selector}`)
    }
  }

  const floor = FLOOR[region]

  if (OPENED_ELSEWHERE.includes(region)) {
    console.log(`  note ${region}: ${loops.length + oneShot.length} at rest; its effects need an open surface`)
    console.log(`       (${region === 'overlays' ? 'composercheck.mjs and overlays.mjs open them' : 'see the file that opens it'})`)
    console.log()
    continue
  }

  if (floor === undefined) {
    console.log()
    continue
  }
  if (loops.length < floor.loops) {
    console.log(`  FAIL ${region}: ${loops.length} loops, floor is ${floor.loops}`)
    failures += 1
  }
  if (oneShot.length < floor.oneShot) {
    console.log(`  FAIL ${region}: ${oneShot.length} one-shot, floor is ${floor.oneShot}`)
    failures += 1
  }
  if (transitions.length < floor.transitions) {
    console.log(`  FAIL ${region}: ${transitions.length} transitions, floor is ${floor.transitions}`)
    failures += 1
  }
  console.log()
}

const totalLoops = Object.values(summary).reduce((n, s) => n + s.loops, 0)
const totalOneShot = Object.values(summary).reduce((n, s) => n + s.oneShot, 0)

console.log(`total: ${totalLoops} loops, ${totalOneShot} one-shot`)

if (meta.tier !== 'full') {
  // A manifest taken at `lite` is not a manifest. Say so loudly rather than
  // reporting a floor failure that belongs to the tier.
  console.log()
  console.log(`FAIL  the page is at tier "${meta.tier}", not "full"; every count above is understated`)
  failures += 1
}

if (errors.length > 0) {
  console.log()
  console.log(`FAIL  console errors: ${errors.slice(0, 2).join(' | ')}`)
  failures += 1
}

console.log()
console.log(failures === 0 ? 'PASS  manifest is above the floor' : `FAIL  ${failures} region(s) below the floor`)

if (AS_JSON) console.log(JSON.stringify({ summary, totalLoops, totalOneShot }, null, 1))

await browser.close()
process.exit(failures === 0 ? 0 : 1)
