import { launch } from './lib/chromium.mjs'
import fs from 'node:fs'
import { openSession } from './lib/session.mjs'
const URL = process.argv[2]
const OUT = '/tmp/fa-settings'
fs.mkdirSync(OUT, { recursive: true })
const browser = await launch({ args: ['--no-sandbox'] })
const results = []
const check = (n, ok, d) => { results.push({ n, ok }); console.log((ok ? 'PASS ' : 'FAIL ') + n.padEnd(52) + (d ?? '')) }

for (const [tag, opts] of [['zh-CN', { locale: 'zh-CN' }], ['en-US', { locale: 'en-US' }]]) {
  console.log(`\n── phone 390x844 · ${tag} ──`)
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, ...opts })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 140)))
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3200)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3600)
  await openSession(page, '便携 DSH', { mobile: true })

  // Tap the dock's Settings button — the exact path the user reported broken.
  const dock = page.locator('[data-fa-dock] button[aria-label="Settings"]')
  const box = await dock.boundingBox()
  await page.touchscreen.tap(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2))
  await page.waitForTimeout(2600)

  const state = await page.evaluate(`(() => {
    const panel = document.querySelector('[role="dialog"]')
    if (!panel) return { open: false }
    const b = panel.getBoundingClientRect()
    const nav = panel.querySelector(':scope > nav')
    const content = panel.querySelector(':scope > div')
    const navBox = nav ? nav.getBoundingClientRect() : null
    const contentBox = content ? content.getBoundingClientRect() : null
    const rowInContent = content ? [...content.querySelectorAll('*')].find(e => e.children.length === 0 && (e.textContent || '').trim().length > 3) : null
    const cs = rowInContent ? getComputedStyle(rowInContent) : null
    const cb = rowInContent ? rowInContent.getBoundingClientRect() : null
    return {
      open: true,
      drawer: document.body.hasAttribute('data-fa-drawer'),
      bodyDialog: document.body.hasAttribute('data-fa-dialog'),
      panelBox: Math.round(b.left) + ',' + Math.round(b.top) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height),
      panelDir: getComputedStyle(panel).flexDirection,
      panelOnScreen: b.left < window.innerWidth && b.right > 0 && b.top < window.innerHeight && b.bottom > 0,
      navDir: nav ? getComputedStyle(nav).flexDirection : null,
      navBox: navBox ? Math.round(navBox.width) + 'x' + Math.round(navBox.height) : null,
      contentBox: contentBox ? Math.round(contentBox.width) + 'x' + Math.round(contentBox.height) : null,
      exampleText: rowInContent ? rowInContent.textContent.trim().slice(0, 14) : null,
      exampleBox: cb ? Math.round(cb.width) + 'x' + Math.round(cb.height) : null,
      exampleLines: cb && cs ? Math.round(cb.height / parseFloat(cs.lineHeight || '20')) : null,
      dockHidden: (d => { const c = getComputedStyle(d); return c.opacity === '0' && c.pointerEvents === 'none' })(document.querySelector('[data-fa-dock]')),
    }
  })()`)
  console.log('   ', JSON.stringify(state))
  check('dock Settings opens the dialog without opening the drawer', state.open === true && state.drawer === false, `drawer=${state.drawer}`)
  check('dialog is on screen', state.panelOnScreen === true)
  check('dialog fills the viewport', /^0,0 390x844$/.test(state.panelBox), state.panelBox)
  check('dialog stacks its two regions', state.panelDir === 'column', state.panelDir)
  check('nav rail became a horizontal strip', state.navDir === 'row', state.navDir)
  check('content column gets real width', parseInt(state.contentBox, 10) >= 370, state.contentBox)
  check('a content label no longer wraps per character', (state.exampleLines ?? 99) <= 3, `"${state.exampleText}" ${state.exampleBox} ≈ ${state.exampleLines} lines`)
  check('dock steps aside for the modal', state.dockHidden === true)
  await page.screenshot({ path: `${OUT}/settings-${tag}.png` })

  // …and it still closes
  const closed = await page.evaluate(`(() => {
    const panel = document.querySelector('[role="dialog"]')
    const root = document.getElementById('root')
    const btn = ['Close', '关闭'].map((n) => root.querySelector('[aria-label=' + JSON.stringify(n) + ']')).find(Boolean)
    if (btn) { btn.click(); return 'button' }
    return 'none'
  })()`)
  if (closed === 'none') await page.keyboard.press('Escape')
  await page.waitForTimeout(1800)
  const gone = await page.evaluate(`document.querySelector('[role="dialog"]') === null`)
  check('dialog closes', gone === true, `via ${closed}`)
  check('sidebar back off-canvas after closing', await page.evaluate(`!document.body.hasAttribute('data-fa-dialog')`))
  check('no page errors', errors.length === 0, errors.slice(0, 2).join(' | '))
  await page.screenshot({ path: `${OUT}/after-close-${tag}.png` })
  await context.close()
}

// desktop must be untouched
{
  console.log('\n── desktop 1440x900 ──')
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' })
  const page = await context.newPage()
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3200)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3600)
  await page.locator('body').getByText('便携 DSH', { exact: false }).first().click({ timeout: 9000, force: true })
  await page.waitForTimeout(9000)
  await page.evaluate(`(() => { const r = document.getElementById('root'); const el = ['Settings','设置'].map(n => r.querySelector('[aria-label=' + JSON.stringify(n) + ']')).find(Boolean); if (el) el.click() })()`)
  await page.waitForTimeout(2400)
  const d = await page.evaluate(`(() => {
    const panel = document.querySelector('[role="dialog"]')
    const b = panel.getBoundingClientRect()
    const nav = panel.querySelector(':scope > nav')
    return { box: Math.round(b.left) + ',' + Math.round(b.top) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height), dir: getComputedStyle(panel).flexDirection, navDir: nav ? getComputedStyle(nav).flexDirection : null }
  })()`)
  console.log('   ', JSON.stringify(d))
  check('desktop: dialog unchanged', d.dir === 'row' && d.navDir === 'column' && d.box.startsWith('319,49'), JSON.stringify(d))
  await page.screenshot({ path: `${OUT}/settings-desktop.png` })
  await context.close()
}

await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} settings checks passed${failed.length ? ' — ' + failed.map((f) => f.n).join(' | ') : ''}`)
