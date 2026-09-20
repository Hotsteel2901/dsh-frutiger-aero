import { launch } from './lib/chromium.mjs'
import fs from 'node:fs'
const URL = process.argv[2]
const OUT = '/tmp/fa-tiers'
fs.mkdirSync(OUT, { recursive: true })
const browser = await launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const results = []
for (const [vpName, viewport, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['phone', { width: 390, height: 844 }, true]]) {
  for (const tier of ['full', 'lite', 'off']) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)))
    await page.goto(URL, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    await page.evaluate(`localStorage.setItem('frutiger-aero:effects', ${JSON.stringify(tier)})`)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3200)
    if (mobile) {
      // On a portrait phone the rail is off-canvas, so the only reachable
      // affordance is the dock; that is the path to exercise.
      const dock = page.locator('[data-fa-dock] button[aria-label="Menu"]')
      if (await dock.count()) await dock.click({ timeout: 5000, force: true }).catch(() => {})
      await page.waitForTimeout(1200)
    }
    const link = page.locator('body').getByText('便携 DSH', { exact: false }).first()
    await link.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {})
    if (await link.count()) await link.click({ timeout: 7000, force: true }).catch(() => {})
    await page.waitForTimeout(8000)
    if (mobile) { await page.mouse.click(Math.round(viewport.width * 0.94), 300); await page.waitForTimeout(1800) }
    const probe = await page.evaluate(`(() => {
      const q = (s) => document.querySelector(s)
      const box = (el) => el ? (r => Math.round(r.width)+'x'+Math.round(r.height)+'@'+Math.round(r.left)+','+Math.round(r.top))(el.getBoundingClientRect()) : null
      return {
        tier: document.documentElement.dataset.faTier,
        scene: q('[data-fa-scene]') ? q('[data-fa-scene]').querySelectorAll('[data-fa-bubble]').length : null,
        sceneDisplay: q('[data-fa-scene]') ? getComputedStyle(q('[data-fa-scene]')).display : null,
        htmlBg: getComputedStyle(document.documentElement).backgroundColor,
        composerBlur: q('[data-composer-card]') ? getComputedStyle(q('[data-composer-card]')).backdropFilter : null,
        sidebarBlur: q('[data-fa-col="sidebar"]') ? getComputedStyle(q('[data-fa-col="sidebar"]')).backdropFilter : null,
        dock: box(q('[data-fa-dock]')) + ' ' + (q('[data-fa-dock]') ? getComputedStyle(q('[data-fa-dock]')).display : ''),
        turns: document.querySelectorAll('[data-chat-flow-kind]').length,
        overflowX: document.documentElement.scrollWidth - window.innerWidth,
        frames: (() => { let n = 0; const t0 = performance.now(); return new Promise(r => { const step = () => { n++; if (performance.now() - t0 > 1000) r(Math.round(n / ((performance.now() - t0) / 1000))); else requestAnimationFrame(step) }; requestAnimationFrame(step) }) })(),
      }
    })()`)
    results.push({ vpName, tier, probe, errors })
    await page.screenshot({ path: `${OUT}/${vpName}-${tier}.png` })
    await context.close()
  }
}
await browser.close()
for (const r of results) console.log(r.vpName.padEnd(8), r.tier.padEnd(5), JSON.stringify(r.probe), r.errors.length ? 'ERR ' + r.errors[0] : '')
