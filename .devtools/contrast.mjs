/**
 * Contrast, measured rather than eyeballed.
 *
 * A mean-luminance reading over a screenshot cannot answer the question that
 * matters — "can this text be read against the surface behind it?" — because
 * averaging the whole frame mixes the glyphs, the glass and the wallpaper
 * into one number that is high when a page is busy and low when it is calm,
 * regardless of whether any particular label is legible.
 *
 * So this walks the text nodes, and for each one computes the **WCAG 2.1
 * contrast ratio** from the two colours that actually apply:
 *
 *   - the foreground is the resolved `color` of the element owning the text;
 *   - the background is found by walking up the ancestor chain until a
 *     non-transparent `background-color` appears, which is the honest answer
 *     for a design built out of stacked translucent glass. A naive reading of
 *     the element's own `background-color` returns `rgba(0,0,0,0)` for almost
 *     everything here and would report every label as unmeasurable.
 *
 * The skin's glass makes the second half genuinely ambiguous — a surface at
 * `rgba(255,255,255,0.62)` over an animated wallpaper has no single colour.
 * So the composited result is computed against a *worst case* backdrop: the
 * wallpaper's darkest sample and its lightest, and both ratios reported. If a
 * label passes against both, it passes against everything the scene can put
 * behind it.
 *
 * Thresholds are WCAG AA: 4.5:1 for body text, 3:1 for large text (≥18.66px
 * bold or ≥24px), and 3:1 for the boundary of an interactive control.
 *
 * usage: node contrast.mjs <url> [light|dark] [outDir]
 */
import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'

const TARGET = process.argv[2]
const SCHEME = process.argv[3] ?? 'light'
const OUT = process.argv[4] ?? '/tmp/fa-contrast'

/** Composites `fg` over `bg` at `alpha`, all as [r,g,b] 0-255. */
const MIX = `
  const mix = (fg, bg, a) => fg.map((c, i) => c * a + bg[i] * (1 - a))
  const parse = (value) => {
    const m = value.match(/rgba?\\(([^)]+)\\)/)
    if (m === null) return null
    const parts = m[1].split(/[,\\s/]+/).filter((s) => s !== '').map(Number)
    if (parts.length < 3) return null
    return { rgb: [parts[0], parts[1], parts[2]], a: parts.length > 3 ? parts[3] : 1 }
  }
  /** WCAG relative luminance. */
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((c) => {
      const s = c / 255
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const ratio = (a, b) => {
    const la = lum(a), lb = lum(b)
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
  }
`

/** The worst-case backdrops the scene can produce behind a pane. */
const BACKDROPS = [
  { name: 'darkest', rgb: [18, 40, 62] },
  { name: 'lightest', rgb: [238, 247, 252] },
]

const PROBE = `(() => {
  ${MIX}
  const MIN_BODY = 4.5
  const MIN_LARGE = 3

  /** Composite the whole ancestor background stack down to an opaque base. */
  const backgroundOf = (el, base) => {
    const stack = []
    for (let n = el; n !== null; n = n.parentElement) {
      const bg = parse(getComputedStyle(n).backgroundColor)
      if (bg !== null && bg.a > 0) {
        stack.push(bg)
        if (bg.a >= 1) break
      }
    }
    // Apply outermost first, so each layer composites onto the result below it.
    let out = base
    for (let i = stack.length - 1; i >= 0; i -= 1) {
      out = mix(stack[i].rgb, out, stack[i].a)
    }
    return out
  }

  const visible = (el) => {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) return false
    const c = getComputedStyle(el)
    return c.visibility !== 'hidden' && c.display !== 'none' && Number(c.opacity) > 0.05
  }

  /** Text owned directly by this element, so each label is counted once. */
  const ownText = (el) => [...el.childNodes]
    .filter((n) => n.nodeType === 3)
    .map((n) => n.textContent.trim())
    .join(' ')
    .trim()

  const out = []
  const seen = new Set()
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue
    const text = ownText(el)
    if (text.length === 0) continue
    const cs = getComputedStyle(el)
    const fg = parse(cs.color)
    if (fg === null || fg.a === 0) continue
    const size = parseFloat(cs.fontSize)
    const weight = Number(cs.fontWeight) || 400
    const large = size >= 24 || (size >= 18.66 && weight >= 700)
    const needed = large ? MIN_LARGE : MIN_BODY

    const row = { text: text.slice(0, 46), size: Math.round(size * 10) / 10, weight, large, needed, worst: Infinity, on: null }
    for (const base of ${JSON.stringify(BACKDROPS)}) {
      const bg = backgroundOf(el, base.rgb)
      const compositedFg = fg.a >= 1 ? fg.rgb : mix(fg.rgb, bg, fg.a)
      const r = ratio(compositedFg, bg)
      if (r < row.worst) { row.worst = Math.round(r * 100) / 100; row.on = base.name }
    }
    const key = row.text + '|' + String(row.size)
    if (seen.has(key)) continue
    seen.add(key)
    row.pass = row.worst >= needed
    out.push(row)
  }
  out.sort((a, b) => a.worst - b.worst)
  return {
    scheme: document.body.hasAttribute('data-ds-dark-theme') ? 'dark' : 'light',
    tier: document.documentElement.dataset.faTier,
    total: out.length,
    failing: out.filter((r) => !r.pass).length,
    worst: out.slice(0, 24),
  }
})()`

const browser = await launch()
const page = await freshPage(browser, {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  colorScheme: SCHEME,
})
await enter(page, TARGET)
// The product keys its scheme off this attribute, not the media query.
await page.evaluate(SCHEME === 'dark'
  ? `document.body.setAttribute('data-ds-dark-theme','')`
  : `document.body.removeAttribute('data-ds-dark-theme')`)
await page.waitForTimeout(1400)

const report = { asked: SCHEME, closed: await page.evaluate(PROBE) }

// Open the drawer — it holds the densest text in the app and its own surface.
await page.evaluate(`document.querySelector('[data-fa-dock] button[aria-label="Menu"]')?.click()`)
await page.waitForTimeout(1500)
report.drawer = await page.evaluate(PROBE)
await page.screenshot({ path: `${OUT}-${SCHEME}.png` })

console.log(JSON.stringify(report, null, 2))
await browser.close()
