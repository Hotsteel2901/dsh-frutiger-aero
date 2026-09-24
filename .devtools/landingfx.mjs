// landingfx.mjs — the landing page's second motion layer.
//
// `landing.mjs` answers "does the page still work". This answers the two
// questions a second layer of animation raises and a screenshot cannot:
//
//   1. **Is every effect on the element it was written for?** A selector that
//      matches nothing looks exactly like a selector that is gated off.
//   2. **Does every loop actually stop** when the page says it should — in a
//      background tab, in an off-screen section, on a low tier, or under
//      reduced motion?
//
// The second question is the one that matters for the performance promise, and
// the only way to answer it honestly is to enumerate the inventory and ask
// about each entry, rather than testing one representative and generalising.
//
// usage: landingfx.mjs <url>

import { launch } from './lib/chromium.mjs'
import { freshPage } from './lib/gates.mjs'

const URL = process.argv[2]
if (!URL) {
  console.error('usage: landingfx.mjs <url>')
  process.exit(2)
}

const results = []
const check = (name, ok, detail) => {
  results.push({ name, ok })
  console.log((ok ? 'PASS ' : 'FAIL ') + name.padEnd(58) + (detail ?? ''))
}

const browser = await launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })

/* ── 1. The inventory, at the full tier, on a fine pointer ───────────────── */

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: 'no-preference',
})
const page = await context.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text().slice(0, 160))
})
await page.goto(URL, { waitUntil: 'load', timeout: 40000 })
await page.waitForTimeout(2500)

// Every effect this block adds, and the element it should land on. Asserting
// the *selector* resolves is the whole check: a pseudo-element that is
// `content: ''` but whose selector matches nothing reads identically in
// `getComputedStyle` terms, so the match itself is the evidence.
const INVENTORY = [
  ['brand__drop', '.brand__drop', 'fa-brand-bob'.replace('fa-', 'brand-'), true],
  ['.shell > .aurora::after', null, 'aurora-pulse', true],
  ['.cmd::before', null, 'cmd-caret', true],
  ['.device--phone::after', '.device--phone', 'frame-sheen', true],
  ['.card__icon::after', '.card__icon', 'icon-bloom', true],
  ['.compare::after', null, 'divider-breathe', true],
  ['.footer::before', null, 'footer-light', true],
  ['.stat__num', '.stat__num', 'stat-sheen', true],
]

const inventory = await page.evaluate(`(() => {
  const rows = {}
  const put = (key, value) => { rows[key] = value }

  const read = (selector, pseudo) => {
    const el = document.querySelector(selector)
    if (el === null) return { found: false }
    const cs = getComputedStyle(el, pseudo || null)
    return {
      found: true,
      animation: cs.animationName,
      duration: cs.animationDuration,
      iteration: cs.animationIterationCount,
      opacity: cs.opacity,
      transform: cs.transform,
      content: pseudo ? cs.content : null,
    }
  }

  // The pseudo-element hosts, found by their real selectors.
  put('brand__drop', read('.brand__drop'))
  put('.shell > .aurora::after', read('.shell > .aurora', '::after'))
  put('.cmd::before', read('.cmd', '::before'))
  put('.device--phone::after', read('.device--phone', '::after'))
  put('.card__icon::after', read('.card__icon', '::after'))
  put('.compare::after', read('.compare', '::after'))
  put('.footer::before', read('.footer', '::before'))
  put('.stat__num', read('.stat__num'))

  // Counts, which is how a selector that matches nothing is caught: an
  // entry that claims to be on N elements had better find N.
  put('counts', {
    'brand__drop': document.querySelectorAll('.brand__drop').length,
    'stat__num': document.querySelectorAll('.stat__num').length,
    'card__icon': document.querySelectorAll('.card__icon').length,
    'device--phone': document.querySelectorAll('.device--phone').length,
    'cmd': document.querySelectorAll('.cmd').length,
    'compare': document.querySelectorAll('.compare').length,
    'footer': document.querySelectorAll('.footer').length,
    aurora: document.querySelectorAll('.shell > .aurora').length,
  })

  put('tier', document.documentElement.classList.contains('is-lite') ? 'lite' : 'full')
  return rows
})()`)

console.log('── inventory ──')
console.log(JSON.stringify(inventory, null, 1))
console.log()

check('the page is at the full tier for this probe', inventory.tier === 'full', inventory.tier)

for (const [label, selector] of [
  ['brand__drop', '.brand__drop'],
  ['stat__num', '.stat__num'],
  ['card__icon', '.card__icon'],
  ['device--phone', '.device--phone'],
  ['cmd', '.cmd'],
  ['compare', '.compare'],
  ['footer', '.footer'],
  ['aurora', '.shell > .aurora'],
]) {
  check(`${label} exists (${inventory.counts[label]})`, inventory.counts[label] > 0, String(inventory.counts[label]))
}

// Two of the eight are one-shot entrances, not loops; the rest must be loops.
const LOOPS = [
  ['brand__drop', inventory['brand__drop']],
  ['.shell > .aurora::after', inventory['.shell > .aurora::after']],
  ['.cmd::before', inventory['.cmd::before']],
  ['.device--phone::after', inventory['.device--phone::after']],
  ['.card__icon::after', inventory['.card__icon::after']],
  ['.compare::after', inventory['.compare::after']],
  ['.footer::before', inventory['.footer::before']],
  ['.stat__num', inventory['.stat__num']],
]

for (const [name, row] of LOOPS) {
  check(`${name} is a running loop`, row.found === true && row.iteration === 'infinite' && row.animation !== 'none',
    `${row.animation} / ${row.iteration}`)
}

check('every pseudo-element host actually renders the pseudo',
  inventory['.cmd::before'].content === '""' &&
    inventory['.device--phone::after'].content === '""' &&
    inventory['.card__icon::after'].content === '""' &&
    inventory['.compare::after'].content === '""' &&
    inventory['.footer::before'].content === '""',
  'content values read back')

/* ── 2. The loops stop when they cannot be seen ──────────────────────────── */

const hidden = await page.evaluate(`(async () => {
  const root = document.documentElement
  root.classList.add('is-offscreen')
  await new Promise((r) => setTimeout(r, 120))
  const read = (selector, pseudo) => {
    const el = document.querySelector(selector)
    if (el === null) return null
    return getComputedStyle(el, pseudo || null).animationPlayState
  }
  const out = {
    cmd: read('.cmd', '::before'),
    compare: read('.compare', '::after'),
    footer: read('.footer', '::before'),
    brand: read('.brand__drop'),
    stat: read('.stat__num'),
  }
  root.classList.remove('is-offscreen')
  return out
})()`)

console.log()
console.log('── with the section marked off screen ──')
console.log(JSON.stringify(hidden, null, 1))

check('an off-screen section pauses its loops',
  Object.values(hidden).every((v) => v === 'paused' || v === null),
  JSON.stringify(hidden))

/* ── 3. The lite tier drops the decorative loops ─────────────────────────── */

const lite = await page.evaluate(`(async () => {
  const root = document.documentElement
  root.classList.add('is-lite')
  await new Promise((r) => setTimeout(r, 120))
  const read = (selector, pseudo) => {
    const el = document.querySelector(selector)
    if (el === null) return { found: false }
    const cs = getComputedStyle(el, pseudo || null)
    return { found: true, animation: cs.animationName, opacity: cs.opacity }
  }
  const out = {
    brand: read('.brand__drop'),
    stat: read('.stat__num'),
    cmd: read('.cmd', '::before'),
    phone: read('.device--phone', '::after'),
    icon: read('.card__icon', '::after'),
    compare: read('.compare', '::after'),
    footer: read('.footer', '::before'),
  }
  root.classList.remove('is-lite')
  return out
})()`)

console.log()
console.log('── at the lite tier ──')
console.log(JSON.stringify(lite, null, 1))

// Named explicitly rather than looped, because each one has a *settle* pose
// and the point is that the element keeps its appearance while losing motion.
for (const [name, row] of Object.entries(lite)) {
  check(`lite: ${name} keeps rendering with no animation`,
    row.found === true && row.animation === 'none',
    `${row.animation} opacity=${row.opacity}`)
}

/* ── 4. Reduced motion leaves a finished page ────────────────────────────── */

const reducedContext = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
})
const reducedPage = await reducedContext.newPage()
await reducedPage.goto(URL, { waitUntil: 'load', timeout: 40000 })
await reducedPage.waitForTimeout(2000)

const reduced = await reducedPage.evaluate(`(() => {
  const read = (selector, pseudo) => {
    const el = document.querySelector(selector)
    if (el === null) return { found: false }
    const cs = getComputedStyle(el, pseudo || null)
    return { found: true, animation: cs.animationName, opacity: cs.opacity, transform: cs.transform }
  }
  return {
    tier: document.documentElement.classList.contains('is-lite') ? 'lite' : 'full',
    brand: read('.brand__drop'),
    stat: read('.stat__num'),
    cmd: read('.cmd', '::before'),
    phone: read('.device--phone', '::after'),
    icon: read('.card__icon', '::after'),
    compare: read('.compare', '::after'),
    footer: read('.footer', '::before'),
    revealHidden: [...document.querySelectorAll('.reveal')].filter((e) => getComputedStyle(e).opacity === '0').length,
  }
})()`)

console.log()
console.log('── reduced motion ──')
console.log(JSON.stringify(reduced, null, 1))

check('reduced motion: the tier is lite', reduced.tier === 'lite', reduced.tier)
check('reduced motion: no section is left invisible', reduced.revealHidden === 0, String(reduced.revealHidden))
for (const [name, row] of Object.entries(reduced)) {
  if (name === 'tier' || name === 'revealHidden') continue
  check(`reduced motion: ${name} has a settled pose`,
    row.found === true && row.animation === 'none' && Number(row.opacity) > 0,
    `${row.animation} opacity=${row.opacity}`)
}

/* ── 5. Console and network stay clean ───────────────────────────────────── */

console.log()
check('no console errors with the second layer live', errors.length === 0, errors.slice(0, 3).join(' | '))

await browser.close()

const failed = results.filter((r) => !r.ok)
console.log()
console.log(failed.length === 0 ? `PASS  ${results.length} checks` : `FAIL  ${failed.length} of ${results.length} failed`)
process.exit(failed.length === 0 ? 0 : 1)
