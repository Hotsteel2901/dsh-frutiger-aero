/**
 * What is there to animate? A desktop inventory.
 *
 * This is a reconnaissance probe, not an assertion suite. It opens the app at a
 * desktop viewport, drives it into every state the skin has to cover, and dumps
 * the structural facts an effects pass needs: which stable `data-*` hooks and
 * ARIA roles exist, where they live, how many elements carry each, and what the
 * currently-running animation inventory looks like.
 *
 * It exists because the alternative is guessing, and guessing at selectors for
 * an application you do not own is how a stylesheet ends up covering three
 * surfaces out of nine. The output is deliberately verbose and machine-readable
 * so a later pass can diff it.
 *
 * usage: node anatomy.mjs <url>
 */
import { launch } from './lib/chromium.mjs'
import { freshPage, enter } from './lib/gates.mjs'

const URL = process.argv[2]
if (!URL) {
  console.error('usage: anatomy.mjs <url>')
  process.exit(2)
}

const browser = await launch({ args: ['--no-sandbox'] })
const page = await freshPage(browser, { viewport: { width: 1440, height: 900 } })

// The tier is forced to `full` so the inventory describes the richest state the
// skin ships, not whatever the sandbox's frame pacing decided at boot.
await page.goto(URL, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2600)
await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3000)

const errors = []
page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 160)))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`CONSOLE ${m.text().slice(0, 160)}`)
})

/** The inventory of stable hooks, computed in the page. */
const inventory = await page.evaluate(`(() => {
  const count = (sel) => document.querySelectorAll(sel).length

  // Every data-* attribute actually present, with the number of elements
  // carrying it. This is the product's own stable vocabulary; class names are
  // hashed per build and are useless as selectors.
  const attrs = new Map()
  for (const el of document.querySelectorAll('*')) {
    for (const a of el.attributes) {
      if (!a.name.startsWith('data-')) continue
      const e = attrs.get(a.name) ?? { n: 0, values: new Set() }
      e.n += 1
      if (a.value && e.values.size < 4) e.values.add(a.value)
      attrs.set(a.name, e)
    }
  }
  const dataAttrs = [...attrs.entries()]
    .map(([name, e]) => ({ name, n: e.n, values: [...e.values] }))
    .sort((a, b) => b.n - a.n)

  // ARIA roles in use — the other half of the stable vocabulary, and the one
  // that carries meaning (dialog, menu, tooltip, status) rather than identity.
  const roles = new Map()
  for (const el of document.querySelectorAll('[role]')) {
    const r = el.getAttribute('role')
    roles.set(r, (roles.get(r) ?? 0) + 1)
  }

  // Which roots exist, and are they where the tagger says they are?
  const roots = {}
  for (const sel of [
    '#root', '[data-fa-frame]', '[data-fa-col]',
    '[data-fa-scene]', '[data-fa-scrim]', '[data-fa-dock]',
    '[data-conversation-scroll]', '[data-composer-card]',
    '[data-sidebar-right-panel]', '[data-shell-overlay]',
  ]) roots[sel] = count(sel)

  // The column geometry, so a later pass knows the grid it is painting into.
  const cols = [...document.querySelectorAll('[data-fa-col]')].map((el) => {
    const r = el.getBoundingClientRect()
    return { col: el.getAttribute('data-fa-col'), w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x) }
  })

  return {
    tier: document.documentElement.dataset.faTier,
    pointer: document.documentElement.dataset.faPointer,
    htmlClasses: [...document.documentElement.classList],
    dataAttrs,
    roles: [...roles.entries()].sort((a, b) => b[1] - a[1]),
    roots,
    cols,
    animationCount: document.getAnimations().length,
  }
})()`)

console.log('══ desktop anatomy (1440x900) ══')
console.log(JSON.stringify(inventory, null, 1))

/** Open the surfaces that are not on screen at rest and inventory them too. */
const surfaces = await page.evaluate(`(async () => {
  const out = {}
  const click = (sel) => {
    const el = document.querySelector(sel)
    if (el === null) return false
    el.click()
    return true
  }
  const tick = () => new Promise((r) => setTimeout(r, 700))

  // The right panel is the trajectory inspector; it mounts on demand.
  out.panelToggle = click('[data-rightbar-col] button, [data-rightbar-col] [role="tab"]')
  await tick()
  out.afterPanel = {
    panel: document.querySelectorAll('[data-sidebar-right-panel]').length,
    dialogs: document.querySelectorAll('[role="dialog"]').length,
    tabs: document.querySelectorAll('[role="tab"]').length,
    dataAttrs: [...new Set([...document.querySelectorAll('[data-rightbar-col] *')].flatMap((e) =>
      [...e.attributes].map((a) => a.name).filter((n) => n.startsWith('data-'))))].slice(0, 40),
  }
  return out
})()`)

console.log('══ on-demand surfaces ══')
console.log(JSON.stringify(surfaces, null, 1))

/** What is already animating, and what properties each animation touches. */
const running = await page.evaluate(`(() => {
  return document.getAnimations().map((a) => {
    const effect = a.effect
    const target = effect && effect.target
    const kf = effect && effect.getKeyframes ? effect.getKeyframes() : []
    const props = [...new Set(kf.flatMap((k) => Object.keys(k).filter((p) =>
      p !== 'offset' && p !== 'computedOffset' && p !== 'easing' && p !== 'composite')))]
    return {
      name: (a.animationName || a.transitionProperty || '?'),
      play: a.playState,
      props,
      el: target ? (target.tagName + '.' + String(target.className || '').split(' ')[0]).slice(0, 48) : null,
    }
  })
})()`)

const byName = new Map()
for (const r of running) {
  const key = `${r.name} [${r.props.join(',')}]`
  byName.set(key, (byName.get(key) ?? 0) + 1)
}
console.log('══ animations currently registered ══')
for (const [k, n] of [...byName.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(3)}  ${k}`)
console.log(`  total: ${running.length}`)

console.log('══ console errors ══')
console.log(errors.length === 0 ? '  none' : errors.map((e) => `  ${e}`).join('\n'))

await browser.close()
