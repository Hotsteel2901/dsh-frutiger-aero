/**
 * Do the canvas effects land, and do the fog masks track the scroll?
 *
 * The scroll-edge masks are the only effect in the plugin with a *stateful*
 * half, so they get their own check: it seeds a long conversation, scrolls it,
 * and asserts the attribute follows. An attribute that is set once at boot and
 * never updated would pass every static probe and do nothing in use.
 *
 * usage: canvascheck.mjs <url>
 */
import { launch } from './lib/chromium.mjs'
import { freshPage } from './lib/gates.mjs'

const URL = process.argv[2]
if (!URL) {
  console.error('usage: canvascheck.mjs <url>')
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

// ── the static half ────────────────────────────────────────────────────────
const stat = await page.evaluate(`(() => {
  const canvas = document.querySelector('[data-fa-canvas]')
  const centre = document.querySelector('[data-fa-col="center"]')
  const header = centre === null ? null : centre.querySelector('[class*="header"]')
  const before = canvas === null ? null : getComputedStyle(canvas, '::before')
  const sheen = header === null ? null : getComputedStyle(header, '::after')
  const masks = [...document.querySelectorAll('[data-fa-scroll-edge]')].map((m) => {
    const cs = getComputedStyle(m)
    const r = m.getBoundingClientRect()
    return {
      side: m.getAttribute('data-fa-scroll-edge'),
      pos: cs.position,
      pe: cs.pointerEvents,
      opacity: cs.opacity,
      tr: cs.transitionProperty,
      box: Math.round(r.width) + 'x' + Math.round(r.height),
      parentsCanvas: canvas !== null && m.parentElement === canvas,
    }
  })
  const thumb = getComputedStyle(document.documentElement)
  return {
    canvasPos: canvas === null ? null : getComputedStyle(canvas).position,
    canvasBeforeContent: before === null ? null : before.content,
    canvasBeforeH: before === null ? null : before.height,
    centrePos: centre === null ? null : getComputedStyle(centre).position,
    headerFound: header !== null,
    sheenContent: sheen === null ? null : sheen.content,
    sheenAnim: sheen === null ? null : sheen.animationName,
    sheenIter: sheen === null ? null : sheen.animationIterationCount,
    masks,
  }
})()`)

console.log('── measured ──')
console.log(JSON.stringify(stat, null, 1))
console.log()

check('centre column is a containing block', stat.centrePos === 'relative', String(stat.centrePos))
check('header found inside the centre column', stat.headerFound === true)
check('header sheen pseudo-element exists', stat.sheenContent === '""', `content=${stat.sheenContent}`)
check('header sheen loops', stat.sheenAnim === 'fa-header-sheen' && stat.sheenIter === 'infinite',
  `${stat.sheenAnim} x${stat.sheenIter}`)
check('canvas top light is painted', stat.canvasBeforeContent === '""' && stat.canvasBeforeH === '160px',
  `${stat.canvasBeforeContent} ${stat.canvasBeforeH}`)
check('two fog masks were planted', stat.masks.length === 2, `${stat.masks.length} found`)
check('masks are positioned', stat.masks.every((m) => m.pos === 'absolute'), stat.masks.map((m) => m.pos).join(','))
check('masks do not eat clicks', stat.masks.every((m) => m.pe === 'none'), stat.masks.map((m) => m.pe).join(','))
check('masks live inside the canvas', stat.masks.every((m) => m.parentsCanvas === true))
check('masks are invisible at rest', stat.masks.every((m) => m.opacity === '0'),
  stat.masks.map((m) => `${m.side}=${m.opacity}`).join(' '))

// ── the stateful half ──────────────────────────────────────────────────────
// A transcript shorter than its viewport has nothing to fade towards, so the
// empty profile is first asserted to be quiet — otherwise "the mask turned on"
// below would be measuring nothing.
const idle = await page.evaluate(`(() => ({
  attr: document.querySelector('[data-fa-canvas]').getAttribute('data-fa-scrolled'),
  max: (() => { const s = document.querySelector('[data-conversation-scroll]'); return s === null ? null : s.scrollHeight - s.clientHeight })(),
}))()`)
console.log()
console.log('── empty transcript ──')
console.log('  ' + JSON.stringify(idle))
check('no fog on a transcript that cannot scroll', idle.attr === null || idle.max <= 1,
  `attr=${idle.attr} max=${idle.max}`)

// Seed enough content to scroll, then drive the scroll container directly. The
// product's virtualiser owns the real scroll, so this asks the element rather
// than synthesising wheel events that may not reach it.
const seeded = await page.evaluate(`(() => {
  const scroll = document.querySelector('[data-conversation-scroll]')
  if (scroll === null) return { err: 'no scroll container' }
  const spacer = document.createElement('div')
  spacer.setAttribute('data-fa-test-spacer', '')
  spacer.style.height = '3000px'
  spacer.style.flex = '0 0 auto'
  scroll.append(spacer)
  return { max: scroll.scrollHeight - scroll.clientHeight, h: scroll.clientHeight }
})()`)
await page.waitForTimeout(300)
console.log()
console.log('── after seeding a scrollable transcript ──')
console.log('  ' + JSON.stringify(seeded))

const edgeState = async () => page.evaluate(`(() => {
  const canvas = document.querySelector('[data-fa-canvas]')
  const mask = (side) => {
    const m = document.querySelector('[data-fa-scroll-edge="' + side + '"]')
    return m === null ? null : getComputedStyle(m).opacity
  }
  return {
    attr: canvas === null ? null : canvas.getAttribute('data-fa-scrolled'),
    topOpacity: mask('top'),
    bottomOpacity: mask('bottom'),
  }
})()`)

// Scroll to a position by *arriving* there. Assigning the value the element
// already holds fires no `scroll` event, so a probe that jumps straight to
// `scrollTop = 0` from a fresh element measures nothing — it reported "no fog"
// at the top of the document, where the fog is correctly absent but for the
// wrong reason. Every step below moves somewhere else first.
const scrollTo = async (expression) => {
  await page.evaluate(`(() => {
    const s = document.querySelector('[data-conversation-scroll]')
    if (s === null) return
    s.scrollTop = ${expression}
  })()`)
  await page.waitForTimeout(400)
}

const topState = await (async () => {
  // Go to the middle first, so 0 is a genuine change.
  await scrollTo('Math.round((s.scrollHeight - s.clientHeight) / 2)')
  await scrollTo('0')
  return edgeState()
})()
console.log('  at top:    ' + JSON.stringify(topState))
check('top of transcript: attribute is "top"', topState.attr === 'top', String(topState.attr))
check('top of transcript: only the top mask is shown',
  Number(topState.topOpacity) === 1 && Number(topState.bottomOpacity) === 0,
  `top=${topState.topOpacity} bottom=${topState.bottomOpacity}`)

const botState = await (async () => {
  await scrollTo('s.scrollHeight')
  return edgeState()
})()
console.log('  at bottom: ' + JSON.stringify(botState))
check('bottom of transcript: attribute is "bottom"', botState.attr === 'bottom', String(botState.attr))
check('bottom of transcript: only the bottom mask is shown',
  Number(botState.topOpacity) === 0 && Number(botState.bottomOpacity) === 1,
  `top=${botState.topOpacity} bottom=${botState.bottomOpacity}`)

const midState = await (async () => {
  await scrollTo('Math.round((s.scrollHeight - s.clientHeight) / 2)')
  return edgeState()
})()
console.log('  middle:    ' + JSON.stringify(midState))
check('middle of transcript: attribute is "middle"', midState.attr === 'middle', String(midState.attr))
check('middle of transcript: both masks are shown',
  Number(midState.topOpacity) === 1 && Number(midState.bottomOpacity) === 1,
  `top=${midState.topOpacity} bottom=${midState.bottomOpacity}`)

check('no console errors', errors.length === 0, errors.join(' | ').slice(0, 200))

console.log()
console.log(fail === 0 ? `PASS  ${pass} checks` : `FAIL  ${pass} passed, ${fail} failed`)
await browser.close()
process.exit(fail === 0 ? 0 : 1)
