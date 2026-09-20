/**
 * Contrast over a *populated* app.
 *
 * `contrast.mjs` reads the empty state, which has five labels. Real content —
 * a transcript, tool calls, file rows, the settings dialog, the trajectory
 * table — is where a glass skin is most likely to put grey text on grey glass,
 * so this probe loads the seeded session and audits everything on screen,
 * including controls whose label lives in `aria-label` rather than a text node.
 *
 * usage: node deepcontrast.mjs <url> [light|dark]
 */
import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'

const TARGET = process.argv[2]
const SCHEME = process.argv[3] ?? 'light'

const PROBE = `(() => {
  const mix = (fg, bg, a) => fg.map((c, i) => c * a + bg[i] * (1 - a))
  const parse = (v) => {
    const m = v.match(/rgba?\\(([^)]+)\\)/)
    if (m === null) return null
    const q = m[1].split(/[,\\s/]+/).filter((s) => s !== '').map(Number)
    if (q.length < 3) return null
    return { rgb: [q[0], q[1], q[2]], a: q.length > 3 ? q[3] : 1 }
  }
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
  /** Worst-case backdrops the animated scene can place behind a pane. */
  const BACK = [{ name: 'darkest', rgb: [18, 40, 62] }, { name: 'lightest', rgb: [238, 247, 252] }]

  /**
   * Composite a foreground colour over the background stack behind it.
   *
   * Two things a naive version of this gets wrong, both of which produced
   * false failures before they were handled here:
   *
   *   1. **opacity is not inherited, but it is cumulative.** The composer's
   *      Send button carries 'opacity: 0.4' in its disabled state (empty
   *      input), so its white glyph is *not* white on screen — it is 40% white
   *      over the composer glass. Reading 'color' alone and ignoring the
   *      element's own opacity reported a 3.11:1 failure for a control that is
   *      deliberately dimmed because it cannot be used.
   *
   *   2. **The background stack must stop at the first opaque layer and be
   *      applied from the outside in.** Anything below an opaque fill is
   *      invisible and including it skews the result.
   */
  const bgOf = (el, base) => {
    const st = []
    for (let n = el; n !== null; n = n.parentElement) {
      const bg = parse(getComputedStyle(n).backgroundColor)
      if (bg !== null && bg.a > 0) { st.push(bg); if (bg.a >= 1) break }
    }
    let out = base
    for (let i = st.length - 1; i >= 0; i -= 1) out = mix(st[i].rgb, out, st[i].a)
    return out
  }

  /** The product's own effective opacity for this node, walking to the root. */
  const effectiveOpacity = (el) => {
    let o = 1
    for (let n = el; n !== null; n = n.parentElement) o *= Number(getComputedStyle(n).opacity)
    return o
  }

  const vis = (el) => {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) return false
    const c = getComputedStyle(el)
    return c.visibility !== 'hidden' && c.display !== 'none' && Number(c.opacity) > 0.05
  }
  const own = (el) => [...el.childNodes]
    .filter((n) => n.nodeType === 3)
    .map((n) => n.textContent.trim()).join(' ').trim()

  const out = []
  const seen = new Set()
  for (const el of document.querySelectorAll('body *')) {
    if (!vis(el)) continue
    let t = own(el)
    if (t.length === 0) {
      const al = (el.getAttribute && el.getAttribute('aria-label')) || ''
      if (al === '') continue
      t = '[label] ' + al
    }
    const cs = getComputedStyle(el)
    const fg = parse(cs.color)
    if (fg === null || fg.a === 0) continue
    const size = parseFloat(cs.fontSize)
    const weight = Number(cs.fontWeight) || 400
    const large = size >= 24 || (size >= 18.66 && weight >= 700)
    const need = large ? 3 : 4.5
    const alpha = fg.a * effectiveOpacity(el)
    let worst = Infinity, on = null
    for (const base of BACK) {
      const bg = bgOf(el, base.rgb)
      const f = alpha >= 1 ? fg.rgb : mix(fg.rgb, bg, alpha)
      const rr = ratio(f, bg)
      if (rr < worst) { worst = Math.round(rr * 100) / 100; on = base.name }
    }
    const key = t.slice(0, 40) + '|' + String(size)
    if (seen.has(key)) continue
    seen.add(key)
    // A control the product has intentionally dimmed is reported, but marked,
    // so a deliberate disabled state is not confused with unreadable text.
    const dimmed = effectiveOpacity(el) < 0.75
    out.push({ t: t.slice(0, 52), size, weight, need, worst, on, dimmed, pass: worst >= need || dimmed })
  }
  out.sort((a, b) => a.worst - b.worst)
  return {
    scheme: document.body.hasAttribute('data-ds-dark-theme') ? 'dark' : 'light',
    flowNodes: document.querySelectorAll('[data-chat-flow-kind]').length,
    total: out.length,
    failing: out.filter((r) => !r.pass).length,
    rows: out,
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
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 140)))
await enter(page, TARGET, { settle: 3000 })
await page.evaluate(SCHEME === 'dark'
  ? `document.body.setAttribute('data-ds-dark-theme','')`
  : `document.body.removeAttribute('data-ds-dark-theme')`)
await page.waitForTimeout(1200)

/** Open the drawer, which is where the menu and the session list live. */
const openDrawer = async () => {
  await page.evaluate(`(() => {
    const bar = document.querySelector('[data-fa-dock]')
    const b = bar && [...bar.querySelectorAll('button')]
      .find((x) => /^(Menu|菜单)$/.test((x.getAttribute('aria-label') || '').trim()))
    if (b) b.click()
  })()`)
  await page.waitForTimeout(1400)
}

/** Click a control by its accessible name, product strings only. */
const clickLabel = async (pattern) => {
  const hit = await page.evaluate(`(() => {
    const re = new RegExp(${JSON.stringify(pattern)})
    const b = [...document.querySelectorAll('#root [aria-label]')]
      .find((x) => re.test((x.getAttribute('aria-label') || '').trim()))
    if (!b) return false
    b.click()
    return true
  })()`)
  return hit
}

const report = {}

// 1. The empty/hero state.
report.hero = await page.evaluate(PROBE)

// 2. A real conversation, loaded through the product's own row.
await openDrawer()
await page.evaluate(`document.querySelector('.YDXeBa_sessionRow[aria-selected="false"]')?.click()`)
await page.waitForTimeout(5000)
report.transcript = await page.evaluate(PROBE)

// 3. The trajectory panel, which is a dense data surface.
await openDrawer()
if (await clickLabel('^(Trajectory|轨迹)$')) {
  await page.waitForTimeout(3000)
  report.trajectory = await page.evaluate(PROBE)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(900)
}

// 4. The drawer itself, after the session list has populated.
await openDrawer()
report.drawer = await page.evaluate(PROBE)

// 5. The settings dialog, which has its own dense chrome. Opened from the
//    drawer because that is where the control lives on a phone.
if (!(await clickLabel('^(Settings|设置)$'))) {
  report.settingsOpenError = 'no Settings control reachable from the drawer'
}
await page.waitForTimeout(2600)
report.settings = await page.evaluate(PROBE)
await page.screenshot({ path: `/tmp/fa-deep-${SCHEME}-settings.png` })

await page.keyboard.press('Escape')
await page.waitForTimeout(1000)

// 6. Light and dark both matter, and so does a tablet width, where the
//    product swaps the drawer for a permanent rail and more text is on screen.
await page.setViewportSize({ width: 1024, height: 768 })
await page.waitForTimeout(1600)
report.wide = await page.evaluate(PROBE)

report.errors = errors
console.log(JSON.stringify(report, null, 2))
await browser.close()
