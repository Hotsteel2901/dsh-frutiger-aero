import { launch } from './lib/chromium.mjs'
import fs from 'node:fs'

const URL = process.argv[2]
const OUT = process.argv[3]
const TIER = process.argv[4] ?? 'full'
fs.mkdirSync(OUT, { recursive: true })
const browser = await launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const log = []

const PROBE = `(() => {
  const q = (s) => document.querySelector(s)
  const box = (el) => el ? (r => Math.round(r.width)+'x'+Math.round(r.height)+'@'+Math.round(r.left)+','+Math.round(r.top))(el.getBoundingClientRect()) : null
  return {
    tier: document.documentElement.dataset.faTier,
    dark: document.body.hasAttribute('data-ds-dark-theme'),
    scene: q('[data-fa-scene]')?.querySelectorAll('[data-fa-bubble]').length ?? null,
    canvas: q('[data-fa-canvas]') ? q('[data-fa-canvas]').tagName + '.' + (typeof q('[data-fa-canvas]').className === 'string' ? q('[data-fa-canvas]').className.split(' ')[0] : '') : null,
    drawer: document.body.hasAttribute('data-fa-drawer'),
    scrim: q('[data-fa-scrim]') ? getComputedStyle(q('[data-fa-scrim]')).opacity : null,
    sidebar: box(q('[data-fa-col="sidebar"]')),
    dock: q('[data-fa-dock]') && getComputedStyle(q('[data-fa-dock]')).display !== 'none' ? box(q('[data-fa-dock]')) : null,
    transcript: box(q('[data-conversation-scroll]')),
    turns: document.querySelectorAll('[data-chat-flow-kind]').length,
    readWidth: q('[data-conversation-scroll]') ? getComputedStyle(q('[data-conversation-scroll]')).getPropertyValue('--dsh-chat-content-width') : null,
    dialogs: [...document.querySelectorAll('[role="dialog"]')].map(d => ({ box: box(d), bg: getComputedStyle(d).backgroundColor, blur: getComputedStyle(d).backdropFilter, radius: getComputedStyle(d).borderRadius })),
    menus: [...document.querySelectorAll('[role="menu"], [role="listbox"]')].map(d => ({ box: box(d), blur: getComputedStyle(d).backdropFilter })),
    composer: (c => c ? { box: box(c), bg: getComputedStyle(c).backgroundColor, blur: getComputedStyle(c).backdropFilter } : null)(q('[data-composer-card]')),
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
  }
})()`

async function settle(page, ms = 1400) { await page.waitForTimeout(ms) }

for (const [name, viewport, mobile] of [
  ['desktop', { width: 1440, height: 900 }, false],
  ['phone', { width: 390, height: 844 }, true],
]) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)))
  page.on('console', (m) => { if (m.type() === 'error' && !/ui-cordis|cordis-client-runner|404/.test(m.text())) errors.push(m.text().slice(0, 160)) })
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await settle(page, 3200)
  if (TIER) { await page.evaluate(`localStorage.setItem('frutiger-aero:effects', ${JSON.stringify(TIER)})`); await page.reload({ waitUntil: 'domcontentloaded' }); await settle(page, 3400) }
  const entry = { opening: await page.evaluate(PROBE), errors }

  // open the session
  if (mobile) {
    const rail = page.locator('[aria-label="Open sidebar"]')
    if (await rail.count()) await rail.first().click({ timeout: 4000, force: true }).catch(() => {})
    await settle(page, 900)
  }
  await page.locator('body').getByText('便携 DSH', { exact: false }).first().click({ timeout: 7000, force: true }).catch(() => {})
  await settle(page, 7000)
  if (mobile) { await page.mouse.click(Math.round(viewport.width * 0.94), 300); await settle(page, 1800) }
  entry.session = await page.evaluate(PROBE)
  await page.screenshot({ path: `${OUT}/${name}-chat.png` })

  // a dialog: the settings page
  const settings = page.locator('[aria-label="Settings"]').first()
  if (await settings.count()) {
    await settings.click({ timeout: 5000, force: true }).catch(() => {})
    await settle(page, 2200)
    entry.dialog = await page.evaluate(PROBE)
    await page.screenshot({ path: `${OUT}/${name}-settings.png` })
    await page.keyboard.press('Escape')
    await settle(page, 1200)
  }

  // a menu: the session row's actions
  if (mobile) {
    const rail = page.locator('[aria-label="Open sidebar"]')
    if (await rail.count()) await rail.first().click({ timeout: 4000, force: true }).catch(() => {})
    await settle(page, 900)
  }
  const actions = page.locator('[aria-label^="Session actions"]').first()
  if (await actions.count()) {
    await actions.click({ timeout: 5000, force: true }).catch(() => {})
    await settle(page, 1600)
    entry.menu = await page.evaluate(PROBE)
    await page.screenshot({ path: `${OUT}/${name}-menu.png` })
    await page.keyboard.press('Escape')
    await settle(page, 800)
  }
  log.push([name, entry])
  await context.close()
}
await browser.close()
fs.writeFileSync(`${OUT}/pass.json`, JSON.stringify(Object.fromEntries(log), null, 2))
for (const [name, e] of log) {
  console.log(`\n=== ${name} ===  tier=${e.opening.tier} dark=${e.opening.dark} scene=${e.opening.scene} canvas=${e.opening.canvas}`)
  console.log('  opening :', JSON.stringify(e.opening.composer), 'readWidth', e.opening.readWidth)
  console.log('  session :', JSON.stringify({ sidebar: e.session.sidebar, dock: e.session.dock, transcript: e.session.transcript, turns: e.session.turns, readWidth: e.session.readWidth, overflowX: e.session.overflowX, scrim: e.session.scrim }))
  if (e.dialog) console.log('  dialog  :', JSON.stringify(e.dialog.dialogs))
  if (e.menu) console.log('  menu    :', JSON.stringify(e.menu.menus))
  if (e.errors.length) console.log('  ERRORS  :', e.errors.slice(0, 4))
}
