import { chromium } from 'playwright-core'
import fs from 'node:fs'
const URL = process.argv[2]
const OUT = '/tmp/fa-landing'
fs.mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const results = []
const check = (name, ok, detail) => { results.push({ name, ok }); console.log((ok ? 'PASS ' : 'FAIL ') + name.padEnd(44) + (detail ?? '')) }

// ── desktop ────────────────────────────────────────────────────────────────
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)) })
  const failedRequests = []
  page.on('requestfailed', (r) => failedRequests.push(r.url()))
  await page.goto(URL, { waitUntil: 'load', timeout: 40000 })
  await page.waitForTimeout(2500)

  const probe = await page.evaluate(`(() => {
    const root = document.documentElement
    return {
      tier: window.__LANDING__ && window.__LANDING__.tier,
      lang: root.getAttribute('data-lang'),
      scheme: root.getAttribute('data-scheme'),
      bubbles: document.querySelectorAll('.scene__bubble').length,
      sceneZ: getComputedStyle(document.querySelector('.scene')).zIndex,
      revealTotal: document.querySelectorAll('.reveal').length,
      revealed: document.querySelectorAll('.reveal.is-in').length,
      zhVisible: [...document.querySelectorAll('[data-lang-block="zh"]')].filter(e => e.offsetParent !== null).length,
      enVisible: [...document.querySelectorAll('[data-lang-block="en"]')].filter(e => e.offsetParent !== null).length,
      overflowX: root.scrollWidth - window.innerWidth,
      h1: document.querySelector('h1').textContent.trim().slice(0, 60),
    }
  })()`)
  console.log('desktop probe:', JSON.stringify(probe))
  check('tier resolved', probe.tier === 'full' || probe.tier === 'lite', probe.tier)
  check('bubbles built', probe.bubbles > 0, String(probe.bubbles))
  check('scene stays behind the page', probe.sceneZ === '-1', probe.sceneZ)
  check('only one language visible', probe.zhVisible === 0 && probe.enVisible > 40, `en=${probe.enVisible} zh=${probe.zhVisible}`)
  check('no horizontal overflow', probe.overflowX === 0, String(probe.overflowX))
  check('no console errors', errors.length === 0, errors.slice(0, 2).join(' | '))
  check('no failed requests', failedRequests.length === 0, failedRequests.slice(0, 2).join(' | '))

  await page.screenshot({ path: `${OUT}/desktop-top.png` })

  // Walk the page the way a reader does, then confirm every reveal fired and
  // the loop scopes that left the viewport paused themselves.
  // `scroll-behavior: smooth` makes a scripted `scrollTo` animate, so a loop of
  // them keeps re-targeting and the page never cleanly samples each position.
  await page.evaluate(`document.documentElement.style.scrollBehavior = 'auto'`)
  const height = await page.evaluate(`document.body.scrollHeight`)
  for (let y = 0; y < height; y += 500) {
    await page.evaluate(`window.scrollTo(0, ${y})`)
    await page.waitForTimeout(160)
  }
  await page.evaluate(`window.scrollTo(0, document.body.scrollHeight)`)
  await page.waitForTimeout(1600)
  const after = await page.evaluate(`(() => ({
    revealed: document.querySelectorAll('.reveal.is-in').length,
    total: document.querySelectorAll('.reveal').length,
    offscreen: document.querySelectorAll('.is-offscreen').length,
    scopes: document.querySelectorAll('[data-loop-scope]').length,
  }))()`)
  check('every reveal fires on scroll', after.revealed === after.total, `${after.revealed}/${after.total}`)
  check('off-screen loop scopes paused', after.offscreen > 0 && after.scopes > 0, JSON.stringify(after))
  await page.screenshot({ path: `${OUT}/desktop-bottom.png` })

  // language + scheme switching
  await page.evaluate(`window.scrollTo(0, 0)`)
  await page.locator('[data-set-lang="zh"]').click()
  await page.waitForTimeout(700)
  const zh = await page.evaluate(`(() => ({
    lang: document.documentElement.getAttribute('data-lang'),
    htmlLang: document.documentElement.lang,
    title: document.title,
    zhVisible: [...document.querySelectorAll('[data-lang-block="zh"]')].filter(e => e.offsetParent !== null).length,
    enVisible: [...document.querySelectorAll('[data-lang-block="en"]')].filter(e => e.offsetParent !== null).length,
    h1: document.querySelector('h1').textContent.trim().slice(0, 30),
  }))()`)
  check('language switch flips the page', zh.lang === 'zh' && zh.enVisible === 0 && zh.zhVisible > 40, JSON.stringify({ en: zh.enVisible, zh: zh.zhVisible, htmlLang: zh.htmlLang }))
  check('document title localised', /Frutiger/.test(zh.title), zh.title.slice(0, 40))
  await page.screenshot({ path: `${OUT}/desktop-zh.png` })

  await page.locator('[data-toggle-scheme]').click()
  await page.waitForTimeout(700)
  const dark = await page.evaluate(`document.documentElement.getAttribute('data-scheme')`)
  check('scheme toggle works', dark === 'dark', dark)
  await page.screenshot({ path: `${OUT}/desktop-zh-dark.png` })

  // copy button
  await page.locator('[data-set-lang="en"]').click()
  await page.locator('[data-toggle-scheme]').click()
  await page.waitForTimeout(500)
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.locator('.header ~ * [data-copy], main [data-copy]').first().click()
  await page.waitForTimeout(400)
  const copied = await page.evaluate(`document.querySelector('[data-copy][data-copied="true"]') !== null`)
  const label = await page.evaluate(`(() => { const b = document.querySelector('[data-copy]'); return { copy: getComputedStyle(b.querySelector('.cmd__label')).display, done: getComputedStyle(b.querySelector('.cmd__done')).display } })()`)
  check('copy feedback swaps a label, not text', copied && label.done !== 'none', JSON.stringify(label))
  await context.close()
}

// ── mobile ─────────────────────────────────────────────────────────────────
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)))
  await page.goto(URL, { waitUntil: 'load', timeout: 40000 })
  await page.waitForTimeout(2500)
  const probe = await page.evaluate(`(() => {
    const root = document.documentElement
    const taps = [...document.querySelectorAll('a, button')].filter(e => e.offsetParent !== null).map(e => { const r = e.getBoundingClientRect(); return Math.min(Math.round(r.width), Math.round(r.height)) })
    return {
      tier: window.__LANDING__ && window.__LANDING__.tier,
      overflowX: root.scrollWidth - window.innerWidth,
      minTap: taps.length ? Math.min.apply(null, taps.filter(n => n > 0)) : null,
      bubbles: document.querySelectorAll('.scene__bubble').length,
      blurOff: getComputedStyle(document.querySelector('.glass')).backdropFilter,
    }
  })()`)
  console.log('mobile probe:', JSON.stringify(probe))
  check('mobile tier drops to lite', probe.tier === 'lite', probe.tier)
  check('mobile: no horizontal overflow', probe.overflowX === 0, String(probe.overflowX))
  check('mobile: glass drops backdrop-filter', probe.blurOff === 'none', probe.blurOff)
  check('mobile: no console errors', errors.length === 0, errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: `${OUT}/mobile-top.png`, fullPage: false })
  await page.evaluate(`window.scrollTo(0, 900)`)
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${OUT}/mobile-mid.png` })
  await page.locator('[data-set-lang="zh"]').click()
  await page.waitForTimeout(600)
  await page.evaluate(`window.scrollTo(0, 0)`)
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/mobile-zh.png` })
  await context.close()
}

// ── reduced motion ─────────────────────────────────────────────────────────
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto(URL, { waitUntil: 'load' })
  await page.waitForTimeout(2000)
  const probe = await page.evaluate(`(() => ({
    tier: window.__LANDING__ && window.__LANDING__.tier,
    revealHidden: [...document.querySelectorAll('.reveal')].filter(e => getComputedStyle(e).opacity === '0').length,
    bubbleAnim: getComputedStyle(document.querySelector('.scene__bubble')).animationName,
  }))()`)
  check('reduced motion: page still complete', probe.revealHidden === 0, JSON.stringify(probe))
  check('reduced motion: tier is lite', probe.tier === 'lite', probe.tier)
  await page.screenshot({ path: `${OUT}/reduced-motion.png` })
  await context.close()
}

await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} landing checks passed${failed.length ? ' — FAILURES: ' + failed.map((f) => f.name).join(' | ') : ''}`)
