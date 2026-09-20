/**
 * What a thumb can actually hit.
 *
 * The obvious audit — "is this button at least 44x44" — is measured on
 * `getBoundingClientRect()`, and on this product that number is a lie in both
 * directions. It over-reports: a control can be 44px tall and still be unusable
 * because something transparent sits on top of it. It under-reports: the
 * plugin grows targets with a `::before` overlay precisely so it does *not*
 * resize the box, so a 28x28 icon button is a genuine 44px target and the
 * box size says otherwise.
 *
 * So this probe measures the thing that matters: for each control, walk a grid
 * across its intended target area and ask `elementFromPoint` what a tap there
 * reaches. The reachable area is the count of samples that resolve to the
 * control or one of its ancestors/descendants. Anything smaller than 44x44
 * reachable, or occluded at its own centre, is a real defect.
 *
 * Reports, per control: box size, reachable width/height in CSS px, what
 * occludes the centre when it is occluded, and whether the control is a
 * dock button, a product control, or one the plugin grew.
 */
import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'

const URL = process.argv[2]
const OUT = process.argv[3] ?? '/tmp/fa-hit'
const WIDTH = Number(process.argv[4] ?? 390)
const HEIGHT = Number(process.argv[5] ?? 844)

/** Sample a control's neighbourhood and count the reachable sub-rectangle. */
const PROBE = `(() => {
  const MIN = 44
  const STEP = 4
  /** Sample reach over a target of intended size \`w\`x\`h\` centred on the box. */
  const measure = (el, w, h) => {
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const halfW = Math.max(r.width, w) / 2
    const halfH = Math.max(r.height, h) / 2
    const inside = (node) => node !== null && (el.contains(node) || node.contains(el))
    let reachW = 0
    for (let dx = -halfW + STEP / 2; dx <= halfW; dx += STEP) {
      if (inside(document.elementFromPoint(cx + dx, cy))) reachW += STEP
    }
    let reachH = 0
    for (let dy = -halfH + STEP / 2; dy <= halfH; dy += STEP) {
      if (inside(document.elementFromPoint(cx, cy + dy))) reachH += STEP
    }
    const centre = document.elementFromPoint(cx, cy)
    return {
      reachW: Math.min(reachW, Math.round(Math.max(r.width, w))),
      reachH: Math.min(reachH, Math.round(Math.max(r.height, h))),
      centre: centre === null ? null
        : (inside(centre) ? 'self'
          : (centre.className && typeof centre.className === 'string' ? '.' + centre.className.trim().split(/\\s+/)[0] : centre.tagName)),
    }
  }

  const visible = (el) => {
    if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return false
    const s = getComputedStyle(el)
    if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) < 0.05) return false
    const r = el.getBoundingClientRect()
    if (r.width < 1 || r.height < 1) return false
    // An element scrolled out of the viewport cannot be tapped at all.
    return r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth
  }

  const name = (el) => {
    const label = el.getAttribute('aria-label') || (el.textContent || '').trim().slice(0, 28) || el.title || ''
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\\s+/)[0] : ''
    return label || cls || el.tagName.toLowerCase()
  }

  const zone = (el) => {
    if (el.closest('[data-fa-dock]')) return 'dock'
    if (el.closest('[data-fa-col="sidebar"]')) return 'sidebar'
    if (el.closest('[data-fa-col="rightbar"]')) return 'rightbar'
    if (el.closest('[role="dialog"]')) return 'dialog'
    if (el.closest('[data-composer-card], [data-composer-seat]')) return 'composer'
    if (el.closest('[data-conversation-scroll]')) return 'transcript'
    return 'other'
  }

  const controls = [...document.querySelectorAll('button, [role="button"], [role="tab"], [role="menuitem"], [role="option"], summary, input, select, textarea, a[href]')]
    .filter(visible)
    .map((el) => {
      const r = el.getBoundingClientRect()
      // A composite control (a whole message row that is clickable) is not a
      // target; only things small enough to be aimed at are audited.
      if (r.width > 260 && r.height > 90) return null
      return { el, r }
    })
    .filter(Boolean)
    .map(({ el, r }) => {
      const hit = measure(el, MIN, MIN)
      return {
        name: name(el),
        zone: zone(el),
        box: Math.round(r.width) + 'x' + Math.round(r.height),
        reach: hit.reachW + 'x' + hit.reachH,
        small: hit.reachW < MIN || hit.reachH < MIN,
        occluded: hit.centre !== 'self',
        centre: hit.centre,
        at: Math.round(r.left) + ',' + Math.round(r.top),
      }
    })

  const seen = new Set()
  const unique = controls.filter((c) => {
    const key = c.name + '|' + c.zone + '|' + c.at
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const inputs = [...document.querySelectorAll('input, textarea, [contenteditable="true"]')]
    .filter(visible)
    .map((el) => ({ name: name(el), zone: zone(el), font: getComputedStyle(el).fontSize, box: (r => Math.round(r.width) + 'x' + Math.round(r.height))(el.getBoundingClientRect()) }))

  const text = [...document.querySelectorAll('body *')].filter((el) => {
    if (el.children.length > 0 || !(el.textContent || '').trim()) return false
    return visible(el)
  })
  const tiny = text.map((el) => ({ size: parseFloat(getComputedStyle(el).fontSize), text: (el.textContent || '').trim().slice(0, 30) }))
    .filter((t) => t.size < 12)

  return {
    viewport: innerWidth + 'x' + innerHeight,
    overflowX: document.documentElement.scrollWidth - innerWidth,
    overflowY: document.documentElement.scrollHeight - innerHeight,
    tier: document.documentElement.dataset.faTier,
    dark: document.body.hasAttribute('data-ds-dark-theme'),
    pointer: document.documentElement.dataset.faPointer,
    drawer: document.body.hasAttribute('data-fa-drawer'),
    keyboard: document.body.hasAttribute('data-fa-keyboard'),
    controls: unique,
    small: unique.filter((c) => c.small),
    occluded: unique.filter((c) => c.occluded),
    inputs,
    tinyText: tiny,
  }
})()`

const browser = await launch()
// Through `freshPage`, so the run gets a cold HTTP cache (the bundles are served
// `immutable` but their `?rev=` is a boot-time nonce, not a content hash — see
// the note on `freshPage`) and so the viewport is set the same way every other
// probe sets it. Doing it here by hand is how this file ended up reporting
// `viewport: 844x844` while every other probe reported the width it was asked
// for, which quietly turned a phone audit into a tablet one.
const page = await freshPage(browser, {
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
})
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 200)))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text().slice(0, 200))
})

await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForTimeout(2600)
await page.evaluate(`(() => {
  const want = /^(Continue|继续|Configure later|稍后配置|Skip|跳过)$/
  const b = [...document.querySelectorAll('button')].find((x) => want.test((x.textContent || '').trim()))
  if (b) b.click()
})()`)
await page.waitForTimeout(3000)

const report = { empty: await page.evaluate(PROBE) }

// Open the drawer and re-audit: the drawer holds most of the navigation.
await page.evaluate(`document.querySelector('[data-fa-dock] button[aria-label="Menu"]')?.click()`)
await page.waitForTimeout(1600)
report.drawer = await page.evaluate(PROBE)
await page.screenshot({ path: `${OUT}-drawer.png` })
await page.evaluate(`(() => {
  const el = document.elementFromPoint(innerWidth - 12, Math.round(innerHeight * 0.5))
  el?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
})()`)
await page.waitForTimeout(1200)

report.errors = errors
console.log(JSON.stringify(report, null, 2))
await browser.close()
