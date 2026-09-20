import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'
import fs from 'node:fs'

const URL = process.argv[2]
const OUT = process.argv[3]
const TIER = process.argv[4] ?? 'full'
fs.mkdirSync(OUT, { recursive: true })
const browser = await launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
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
  // The drawer has to actually be open before its rows can be clicked: the
  // sidebar is off-canvas and `visibility: hidden` on a phone, so a row lookup
  // finds nothing and the "session" never opens. Prove the drawer state
  // instead of assuming a click landed.
  if (mobile) await openDrawer(page)

  const row = page.locator('[data-fa-col="sidebar"] [data-session-id], [data-fa-col="sidebar"] a[href*="session"]').first()
  const byRow = await row.count()
  let ok = false
  if (byRow > 0) {
    ok = await row.click({ timeout: 6000 }).then(() => true).catch(() => false)
  } else {
    const named = page.locator('[data-fa-col="sidebar"]').getByText(/便携|plugin|移动/, { exact: false }).first()
    if (await named.count() > 0) ok = await named.click({ timeout: 6000 }).then(() => true).catch(() => false)
  }
  await page.waitForTimeout(6000)
  if (mobile) await closeDrawer(page)
  return ok
}

/** Click the dock's Menu button, or the rail toggle, and prove the drawer opened. */
async function openDrawer(page) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (await page.evaluate(`document.body.hasAttribute('data-fa-drawer')`)) return true
    await dockClick(page, 'Menu')
    const rail = page.locator('#root [aria-label="Open sidebar"], #root [aria-label="打开侧边栏"]')
    if (await rail.count() > 0) await rail.first().click({ timeout: 4000, force: true }).catch(() => {})
    await page.waitForTimeout(1200)
  }
  return page.evaluate(`document.body.hasAttribute('data-fa-drawer')`)
}

/** Close the drawer the way a phone user would — through the scrim. */
async function closeDrawer(page) {
  if (!(await page.evaluate(`document.body.hasAttribute('data-fa-drawer')`))) return true
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const size = page.viewportSize()
    await page.mouse.click(Math.round(size.width * 0.94), Math.round(size.height * 0.35))
    await page.waitForTimeout(1100)
    if (!(await page.evaluate(`document.body.hasAttribute('data-fa-drawer')`))) return true
  }
  return false
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
  await enter(page, URL)
  if (TIER) { await page.evaluate(`localStorage.setItem('frutiger-aero:effects', ${JSON.stringify(TIER)})`); await enter(page, URL, { gates: false, settle: 3200 }) }
  const opening = await page.evaluate(PROBE)
  const opened = await openSession(page, mobile)
  out[name] = { opening, opened, after: await page.evaluate(PROBE), errors }
  await page.screenshot({ path: `${OUT}/${name}.png` })

  if (mobile) {
    out[name].drawerOpened = await openDrawer(page)
    out[name].drawerOpen = await page.evaluate(PROBE)
    await page.screenshot({ path: `${OUT}/${name}-drawer.png` })
    out[name].drawerClosedOk = await closeDrawer(page)
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
  if (v.drawerOpen) console.log('   drawerOpen(' + v.drawerOpened + '): drawer=' + v.drawerOpen.drawer + ' sidebar=' + v.drawerOpen.sidebar + ' scrim=' + v.drawerOpen.scrim + ' dock=' + (v.drawerOpen.dock && v.drawerOpen.dock.box))
  if (v.drawerClosed) console.log('   drawerClosed(' + v.drawerClosedOk + '): drawer=' + v.drawerClosed.drawer + ' sidebar=' + v.drawerClosed.sidebar + ' vis=' + v.drawerClosed.sidebarVis)
  if (v.errors.length) console.log('   ERRORS:', v.errors.slice(0, 4))
}
