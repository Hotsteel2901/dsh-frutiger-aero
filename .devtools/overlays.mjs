/**
 * The composer, the right panel and the overlay surfaces.
 *
 * Three groups, each with a different constraint: the composer already
 * transitions `box-shadow` and `border-color` (so no shadow animation), the
 * right panel already transitions `transform` (so no transform animation), and
 * the overlays mount on demand (so they can be measured only after being
 * opened, in their own locale).
 *
 * usage: overlays.mjs <url>
 */
import { launch } from './lib/chromium.mjs'
import { freshPage } from './lib/gates.mjs'

const URL = process.argv[2]
if (!URL) {
  console.error('usage: overlays.mjs <url>')
  process.exit(2)
}

const browser = await launch({ args: ['--no-sandbox'] })
const page = await freshPage(browser, { viewport: { width: 1440, height: 900 } })
await page.goto(URL, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2400)
await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3200)

const dump = async (label, expression) => {
  const out = await page.evaluate(expression)
  console.log(`── ${label} ──`)
  console.log(JSON.stringify(out, null, 1))
}

// ── the composer ───────────────────────────────────────────────────────────
await dump('composer', `(() => {
  const info = (el) => {
    if (el === null) return null
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      tag: el.tagName.toLowerCase(),
      cls: String(el.className || '').split(' ').map((s) => s.slice(0, 20)).join('.'),
      box: Math.round(r.width) + 'x' + Math.round(r.height),
      pos: cs.position,
      tr: cs.transitionProperty.slice(0, 56) + ' / ' + cs.transitionDuration.slice(0, 24),
      anim: cs.animationName,
      shadow: cs.boxShadow.slice(0, 40),
    }
  }
  const card = document.querySelector('[data-composer-card]')
  const seat = document.querySelector('[data-composer-seat]')
  const input = document.querySelector('[data-composer-input]')
  const placeholder = document.querySelector('[data-composer-placeholder]')
  const editor = document.querySelector('[data-lexical-editor]')
  const chain = []
  for (let e = card; e !== null && chain.length < 4; e = e.parentElement) chain.push(info(e))
  return {
    card: info(card), seat: info(seat), input: info(input),
    placeholder: info(placeholder), editor: info(editor),
    chain,
    phase: document.querySelector('[data-phase]') ? document.querySelector('[data-phase]').getAttribute('data-phase') : null,
  }
})()`)

// ── the right panel, opened ────────────────────────────────────────────────
console.log()
await page.evaluate(`(() => {
  const t = document.querySelector('[data-rightbar-col] button, [data-rightbar-col] [role="tab"]')
  if (t !== null) t.click()
})()`)
await page.waitForTimeout(900)
await dump('right panel (open)', `(() => {
  const info = (el) => {
    if (el === null) return null
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      tag: el.tagName.toLowerCase(),
      cls: String(el.className || '').split(' ').map((s) => s.slice(0, 22)).join('.'),
      slot: el.getAttribute('data-slot') || '',
      box: Math.round(r.width) + 'x' + Math.round(r.height),
      tr: cs.transitionProperty.slice(0, 50) + ' / ' + cs.transitionDuration.slice(0, 20),
    }
  }
  return {
    panel: info(document.querySelector('[data-sidebar-right-panel]')),
    rightbar: info(document.querySelector('[data-fa-col="rightbar"]')),
    dockkit: ['surface','strip','strip-tabs','tab','tab-quiet','pane','split-button','strip-chrome']
      .map((k) => ({ k, v: info(document.querySelector('[data-dockkit-' + k + ']')) })),
    guide: info(document.querySelector('[data-sidebar-right-guide]')),
  }
})()`)

// ── the settings dialog ────────────────────────────────────────────────────
console.log()
await page.evaluate(`(() => {
  const s = document.querySelector('[data-slot="sidebar.settings"] button, [data-slot="sidebar.settings"] [role="button"]')
  if (s !== null) s.click()
})()`)
await page.waitForTimeout(1100)
await dump('settings dialog (open)', `(() => {
  const info = (el) => {
    if (el === null) return null
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      tag: el.tagName.toLowerCase(),
      cls: String(el.className || '').split(' ').map((s) => s.slice(0, 22)).join('.'),
      slot: el.getAttribute('data-slot') || '',
      box: Math.round(r.width) + 'x' + Math.round(r.height),
      pos: cs.position,
      tr: cs.transitionProperty.slice(0, 46) + ' / ' + cs.transitionDuration.slice(0, 20),
      anim: cs.animationName,
    }
  }
  const dialogs = [...document.querySelectorAll('[role="dialog"]')].map(info)
  const scrims = [...document.querySelectorAll('[data-shell-overlay], [class*="scrim"], [class*="overlay"], [class*="mask"]')].map(info)
  return { dialogs, scrims: scrims.slice(0, 6), settingsSlot: info(document.querySelector('div[slot="sidebar.settings"]')) }
})()`)

// ── the transcripts' own rows, for the DO-NOT-animate note ─────────────────
console.log()
await dump('transcript rows', `(() => {
  const rows = [...document.querySelectorAll('[data-conversation-scroll] > * > *')].slice(0, 6)
  return rows.map((el) => {
    const cs = getComputedStyle(el)
    return {
      tag: el.tagName.toLowerCase(),
      cls: String(el.className || '').split(' ').map((s) => s.slice(0, 20)).join('.'),
      role: el.getAttribute('role') || '',
      anim: cs.animationName,
      tr: cs.transitionProperty.slice(0, 40),
    }
  })
})()`)

await browser.close()
