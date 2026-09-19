import { chromium } from 'playwright-core'
const URL = process.argv[2]
const browser = await chromium.launch({ args: ['--no-sandbox'] })
const results = []
const check = (n, ok, d) => { results.push({ n, ok }); console.log((ok ? 'PASS ' : 'FAIL ') + n.padEnd(42) + (d ?? '')) }

for (const [tag, opts] of [['en-US', { locale: 'en-US' }], ['zh-CN', { locale: 'zh-CN' }]]) {
  console.log(`\n── ${tag} ──`)
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, ...opts })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 140)))
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3200)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3600)

  const state = () => page.evaluate(`({
    drawer: document.body.hasAttribute('data-fa-drawer'),
    dialogs: document.querySelectorAll('[role="dialog"]').length,
    turns: document.querySelectorAll('[data-chat-flow-kind]').length,
    composer: !!document.querySelector('[data-composer-card]'),
    dockButtons: [...document.querySelectorAll('[data-fa-dock] button')].filter(b => !b.hasAttribute('hidden')).length,
    inputs: document.querySelectorAll('input').length,
  })`)
  const tap = async (label) => {
    const b = page.locator(`[data-fa-dock] button[aria-label="${label}"]`)
    if ((await b.count()) === 0) return false
    const box = await b.boundingBox()
    if (!box) return false
    await page.touchscreen.tap(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2))
    return true
  }

  const s0 = await state()
  check('dock renders every button', s0.dockButtons === 5, `visible buttons: ${s0.dockButtons}`)

  // 1. Menu opens the drawer
  await tap('Menu'); await page.waitForTimeout(1400)
  check('tap Menu opens the drawer', (await state()).drawer === true)
  await page.screenshot({ path: `/tmp/fa-dock-${tag}-open.png` })

  // 2. While the drawer is open the dock steps aside: a 320px drawer covers the
  //    whole 280px dock, so leaving it visible would only put a live control
  //    underneath one that is already handling the touch.
  const dockWhileOpen = await page.evaluate(`(() => {
    const dock = document.querySelector('[data-fa-dock]')
    const cs = getComputedStyle(dock)
    return { opacity: cs.opacity, pointerEvents: cs.pointerEvents }
  })()`)
  check('dock disables itself while the drawer is open', dockWhileOpen.pointerEvents === 'none' && dockWhileOpen.opacity === '0', JSON.stringify(dockWhileOpen))

  // 3. …and the drawer's own collapse control is the way back, in every locale
  const collapsed = await page.evaluate(`(() => {
    const root = document.getElementById('root')
    const label = ['Collapse sidebar', '收起侧边栏'].map(n => root.querySelector('[aria-label=' + JSON.stringify(n) + ']')).find(Boolean)
    if (!label) return false
    label.click()
    return true
  })()`)
  await page.waitForTimeout(1600)
  check('drawer collapse control closes it', collapsed && (await state()).drawer === false)

  // 4. Settings
  await tap('Settings'); await page.waitForTimeout(2200)
  check('tap Settings opens the dialog', (await state()).dialogs > 0)
  await page.keyboard.press('Escape'); await page.waitForTimeout(1600)

  // 4. Search
  await tap('Search sessions'); await page.waitForTimeout(2000)
  const search = await page.evaluate(`document.querySelectorAll('[role="dialog"], input').length > 0`)
  check('tap Search opens its surface', search)
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200)
  if (await page.evaluate(`document.body.hasAttribute('data-fa-drawer')`)) { await tap('Menu'); await page.waitForTimeout(1200) }

  // 5. Workspaces
  await tap('Workspaces'); await page.waitForTimeout(2000)
  const ws = await page.evaluate(`document.querySelectorAll('[role="dialog"], [role="menu"], input').length > 0`)
  check('tap Workspaces opens its surface', ws)
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200)
  if (await page.evaluate(`document.body.hasAttribute('data-fa-drawer')`)) { await tap('Menu'); await page.waitForTimeout(1200) }

  // 6. New session — the one that used to recurse into itself
  const before = await state()
  await tap('New session'); await page.waitForTimeout(3500)
  const after = await state()
  check('tap New session does not recurse', errors.length === 0, errors.slice(0, 1).join(''))
  check('tap New session leaves a usable composer', after.composer === true, JSON.stringify({ turnsBefore: before.turns, turnsAfter: after.turns }))

  // 8. scrim dismissal over a real transcript — the path a user actually takes.
  //    Put the drawer state where we want it first; the previous steps leave it
  //    wherever their surfaces left it, and a test that assumes is a test that
  //    reports the wrong failure.
  const setDrawer = async (want) => {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const open = await page.evaluate(`document.body.hasAttribute('data-fa-drawer')`)
      if (open === want) return true
      await page.evaluate(`(() => {
        const root = document.getElementById('root')
        const names = ${JSON.stringify(want ? ['Open sidebar', '打开侧边栏'] : ['Collapse sidebar', '收起侧边栏'])}
        const el = names.map((n) => root.querySelector('[aria-label=' + JSON.stringify(n) + ']')).find(Boolean)
        if (el) el.click()
      })()`)
      await page.waitForTimeout(1400)
    }
    return (await page.evaluate(`document.body.hasAttribute('data-fa-drawer')`)) === want
  }

  await page.keyboard.press('Escape'); await page.waitForTimeout(800)
  await setDrawer(false)
  await setDrawer(true)
  const opened = await page.evaluate(`document.body.hasAttribute('data-fa-drawer')`)
  if (opened) {
    // a session row is the realistic backdrop for a scrim tap
    await page.locator('body').getByText('便携 DSH', { exact: false }).first().click({ timeout: 9000, force: true }).catch(() => {})
    await page.waitForTimeout(9000)
    await setDrawer(true)
    await page.touchscreen.tap(374, 300)
    await page.waitForTimeout(1600)
    const closed = (await state()).drawer === false
    check('scrim tap closes the drawer over the transcript', closed)
    check('session rendered under the drawer', (await state()).turns > 10, `transcript items: ${(await state()).turns}`)
  } else {
    check('scrim tap closes the drawer over the transcript', false, 'drawer never opened')
  }
  check('no page errors', errors.length === 0, errors.slice(0, 2).join(' | '))
  await context.close()
}
await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} dock checks passed${failed.length ? ' — ' + failed.map((f) => f.n).join(' | ') : ''}`)
