import { chromium } from 'playwright-core'
import fs from 'node:fs'

const URL = process.argv[2]
const OUT = process.argv[3]
const TIER = process.argv[4] ?? 'full'
fs.mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const out = {}

const PROBE = `(() => {
  const q = (s) => document.querySelector(s)
  const box = (el) => el ? (r => Math.round(r.width)+'x'+Math.round(r.height)+'@'+Math.round(r.left)+','+Math.round(r.top))(el.getBoundingClientRect()) : null
  const sheetText = [...document.querySelectorAll('style[data-plugin="dsh-frutiger-aero"]')].map(s=>s.dataset.pluginCss).join(',')
  return {
    tier: document.documentElement.dataset.faTier,
    dark: document.body.hasAttribute('data-ds-dark-theme'),
    scene: q('[data-fa-scene]')?.querySelectorAll('[data-fa-bubble]').length ?? null,
    canvas: q('[data-fa-canvas]')?.tagName ?? null,
    frameCols: q('[data-fa-frame]') ? [...q('[data-fa-frame]').children].map(c=>c.getAttribute('data-fa-col') ?? (c.hasAttribute('data-shell-overlay')?'overlay':(c.hasAttribute('data-fa-scrim')?'scrim':'handle'))) : null,
    sidebar: box(q('[data-fa-col="sidebar"]')),
    sidebarVis: q('[data-fa-col="sidebar"]') && getComputedStyle(q('[data-fa-col="sidebar"]')).visibility,
    center: { box: box(q('[data-fa-col="center"]')), pad: getComputedStyle(q('[data-fa-col="center"]')).padding },
    dock: q('[data-fa-dock]') ? { display: getComputedStyle(q('[data-fa-dock]')).display, box: box(q('[data-fa-dock]')), items: [...q('[data-fa-dock]').querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).join('|') } : null,
    scrim: q('[data-fa-scrim]') ? getComputedStyle(q('[data-fa-scrim]')).opacity : null,
    drawer: document.body.hasAttribute('data-fa-drawer'),
    turns: document.querySelectorAll('[data-chat-flow-kind]').length,
    minTouch: (() => {
      const els = [...document.querySelectorAll('[data-fa-dock] button, [data-fa-col="sidebar"] button')].filter(e=>e.offsetParent !== null)
      const sizes = els.map(e => { const r = e.getBoundingClientRect(); return Math.min(Math.round(r.width), Math.round(r.height)) })
      return sizes.length ? Math.min(...sizes) : null
    })(),
    bodyTokens: { base: getComputedStyle(document.body).getPropertyValue('--dsw-alias-bg-base'), ink: getComputedStyle(document.body).getPropertyValue('--dsw-alias-label-primary'), brand: getComputedStyle(document.body).getPropertyValue('--dsw-alias-brand-primary') },
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    sheets: sheetText,
  }
})()`

async function dockClick(page, label) {
  const button = page.locator(`[data-fa-dock] button[aria-label="${label}"]`)
  if (await button.count() === 0) return false
  if (!(await button.isVisible().catch(() => false))) return false
  return button.click({ timeout: 5000, force: true }).then(() => true).catch(() => false)
}

async function openSession(page, mobile) {
  if (mobile) {
    const usedDock = await dockClick(page, 'Menu')
    if (!usedDock) {
      const rail = page.locator('[aria-label="Open sidebar"]')
      if (await rail.count() > 0) await rail.first().click({ timeout: 4000, force: true }).catch(() => {})
    }
    await page.waitForTimeout(800)
  }
  const loc = page.locator('[data-fa-col="sidebar"]').getByText('便携 DSH 插件移动端适配', { exact: false }).first()
  const ok = await loc.click({ timeout: 6000 }).then(() => true).catch(() => false)
  if (!ok) await loc.click({ timeout: 4000, force: true }).then(() => true).catch(() => false)
  await page.waitForTimeout(6000)
  if (mobile) {
    const size = page.viewportSize()
    // Close the drawer through the scrim, the way a phone user would.
    await page.mouse.click(Math.round(size.width * 0.94), Math.round(size.height * 0.35))
    await page.waitForTimeout(1100)
  }
  return ok
}

for (const [name, viewport, mobile] of [
  ['desktop', { width: 1440, height: 900 }, false],
  ['laptop', { width: 1280, height: 800 }, false],
  ['tablet', { width: 820, height: 1180 }, true],
  ['phone', { width: 390, height: 844 }, true],
  ['phone-landscape', { width: 844, height: 390 }, true],
]) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)))
  page.on('console', (m) => { if (m.type() === 'error' && !/ui-cordis|cordis-client-runner|404/.test(m.text())) errors.push(m.text().slice(0, 160)) })
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(3000)
  if (TIER) { await page.evaluate(`localStorage.setItem('frutiger-aero:effects', ${JSON.stringify(TIER)})`); await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForTimeout(3200) }
  const opening = await page.evaluate(PROBE)
  const opened = await openSession(page, mobile)
  out[name] = { opening, opened, after: await page.evaluate(PROBE), errors }
  await page.screenshot({ path: `${OUT}/${name}.png` })

  if (mobile) {
    const ok = await dockClick(page, 'Menu')
    if (!ok) {
      const rail = page.locator('[aria-label="Open sidebar"]')
      if (await rail.count() > 0) await rail.first().click({ timeout: 4000, force: true }).catch(() => {})
    }
    await page.waitForTimeout(1000)
    out[name].drawerOpen = await page.evaluate(PROBE)
    await page.screenshot({ path: `${OUT}/${name}-drawer.png` })
    await page.mouse.click(Math.round(viewport.width * 0.93), Math.round(viewport.height * 0.5))
    await page.waitForTimeout(900)
    out[name].drawerClosed = await page.evaluate(PROBE)
  }
  await context.close()
}
await browser.close()
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(out, null, 2))
for (const [k, v] of Object.entries(out)) {
  console.log(`\n== ${k} == opened=${v.opened} tier=${v.opening.tier} dark=${v.opening.dark} scene=${v.opening.scene} cols=${JSON.stringify(v.opening.frameCols)} overflowX=${v.opening.overflowX}`)
  console.log('   open :', JSON.stringify(v.opening.center), 'sidebar', v.opening.sidebar, v.opening.sidebarVis, 'dock', v.opening.dock && v.opening.dock.display, v.opening.dock && v.opening.dock.box)
  console.log('   after: turns=' + v.after.turns, 'sidebar', v.after.sidebar, v.after.sidebarVis, 'center', JSON.stringify(v.after.center), 'dock', v.after.dock && v.after.dock.box, 'minTouch', v.after.minTouch)
  console.log('   tokens:', JSON.stringify(v.opening.bodyTokens))
  if (v.drawerOpen) console.log('   drawerOpen: drawer=' + v.drawerOpen.drawer + ' sidebar=' + v.drawerOpen.sidebar + ' scrim=' + v.drawerOpen.scrim + ' dock=' + (v.drawerOpen.dock && v.drawerOpen.dock.box))
  if (v.drawerClosed) console.log('   drawerClosed: drawer=' + v.drawerClosed.drawer + ' sidebar=' + v.drawerClosed.sidebar + ' vis=' + v.drawerClosed.sidebarVis)
  if (v.errors.length) console.log('   ERRORS:', v.errors.slice(0, 4))
}
