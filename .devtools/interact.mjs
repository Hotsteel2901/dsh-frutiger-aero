import { chromium } from 'playwright-core'
const URL = process.argv[2]
const browser = await chromium.launch({ args: ['--no-sandbox'] })
const results = []
const check = (name, ok, detail) => { results.push({ name, ok, detail }); console.log((ok ? 'PASS ' : 'FAIL ') + name.padEnd(48) + (detail ?? '')) }

/** A real touch swipe through CDP, so the browser's own scroll machinery runs. */
async function swipe(cdp, from, to, steps = 14) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x, y: from.y }] })
  for (let i = 1; i <= steps; i++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: Math.round(from.x + ((to.x - from.x) * i) / steps), y: Math.round(from.y + ((to.y - from.y) * i) / steps) }],
    })
    await new Promise((r) => setTimeout(r, 16))
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

const boxOf = async (page, selector, index = 0) => {
  const el = page.locator(selector).nth(index)
  if ((await el.count()) === 0) return null
  const b = await el.boundingBox()
  return b ? { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) } : null
}

const boot = async (page, mobile) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3200)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3400)
  if (mobile) {
    const dock = page.locator('[data-fa-dock] button[aria-label="Menu"]')
    if (await dock.count()) await dock.click({ force: true })
    await page.waitForTimeout(1100)
  }
  await page.locator('body').getByText('便携 DSH', { exact: false }).first().click({ timeout: 8000, force: true }).catch(() => {})
  await page.waitForTimeout(8000)
  if (mobile) { await page.touchscreen.tap(374, 300); await page.waitForTimeout(1500) }
}

// ══ MOBILE ══════════════════════════════════════════════════════════════════
{
  const viewport = { width: 390, height: 844 }
  const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  const cdp = await context.newCDPSession(page)
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)))
  await boot(page, true)
  console.log('\n── MOBILE (real touch input) ──')

  /**
   * A panel stays mounted while closed — slid off-screen with
   * `visibility: hidden` — so "open" has to mean on-screen and visible, not
   * merely present or merely tall.
   */
  const VISIBLE_PANELS = `[...document.querySelectorAll('[data-sidebar-right-panel]')].filter(e => { const b = e.getBoundingClientRect(); return getComputedStyle(e).visibility !== 'hidden' && b.right > 1 && b.left < window.innerWidth - 1 }).length`

  // 1. touch scrolling, both directions, from a known anchor
  const scrollTo = (v) => page.evaluate(`(() => { document.querySelector('[data-conversation-scroll]').scrollTop = ${v} })()`)
  await scrollTo(2000)
  await page.waitForTimeout(500)
  const s0 = await page.evaluate(`document.querySelector('[data-conversation-scroll]').scrollTop`)
  await swipe(cdp, { x: 195, y: 200 }, { x: 195, y: 620 })   // finger down => content moves down => toward the start
  await page.waitForTimeout(900)
  const s1 = await page.evaluate(`document.querySelector('[data-conversation-scroll]').scrollTop`)
  check('transcript scrolls toward start by touch', s1 < s0 - 60, `${Math.round(s0)} -> ${Math.round(s1)}`)
  await swipe(cdp, { x: 195, y: 620 }, { x: 195, y: 200 })
  await page.waitForTimeout(900)
  const s2 = await page.evaluate(`document.querySelector('[data-conversation-scroll]').scrollTop`)
  check('transcript scrolls toward end by touch', s2 > s1 + 60, `${Math.round(s1)} -> ${Math.round(s2)}`)

  // 2. momentum / overscroll containment: page itself must not move
  const pageY = await page.evaluate(`window.scrollY`)
  check('page body does not scroll behind the app', pageY === 0, `scrollY=${pageY}`)

  // 3. tapping a control in the transcript works (a file link)
  const linkLocator = page.locator('[data-fa-canvas] button:has-text("install.mjs")').first()
  if (await linkLocator.count()) await linkLocator.scrollIntoViewIfNeeded().catch(() => {})
  await page.waitForTimeout(600)
  const link = await boxOf(page, '[data-fa-canvas] button:has-text("install.mjs")')
  if (link) {
    const probe = `(() => ({
      rightbar: Math.round(document.querySelector('[data-fa-col="rightbar"]').getBoundingClientRect().width),
      panel: ${VISIBLE_PANELS},
      dialogs: document.querySelectorAll('[role="dialog"]').length,
      preview: document.querySelectorAll('[data-document-preview], [data-textpreview-body], [data-pdf-preview], [data-image-preview]').length,
    }))()`
    const before = await page.evaluate(probe)
    const hit = await page.evaluate(`(() => { const e = document.elementFromPoint(${link.x}, ${link.y}); return e ? e.tagName.toLowerCase() + ':' + (e.textContent || '').trim().slice(0, 20) : null })()`)
    await page.touchscreen.tap(link.x, link.y)
    await page.waitForTimeout(2800)
    const after = await page.evaluate(probe)
    const changed = JSON.stringify(before) !== JSON.stringify(after)
    check('tap on a transcript control responds', changed, `${JSON.stringify(before)} -> ${JSON.stringify(after)} | hit ${hit}`)
    await page.screenshot({ path: '/tmp/fa-interact/mobile-tap-link.png' })

    // A full-screen panel on a phone is only usable if a *touch* can dismiss it.
    const closer = page.locator('[data-fa-col="rightbar"] button').filter({ hasText: /^$/ }).first()
    const closeBox = (await closer.count()) ? await closer.boundingBox() : null
    const labels = await page.evaluate(`[...document.querySelectorAll('[data-fa-col="rightbar"] button')].map(b => (b.getAttribute('aria-label') || b.title || b.textContent || '').trim()).filter(Boolean).slice(0, 10)`)
    const dismiss = page.locator('[data-fa-col="rightbar"] button[aria-label*="lose" i], [data-fa-col="rightbar"] button[aria-label*="ollapse" i], [data-fa-col="rightbar"] button[aria-label*="ack" i]').first()
    if (await dismiss.count()) await dismiss.click({ force: true }).catch(() => {})
    else if (closeBox) await page.touchscreen.tap(Math.round(closeBox.x + closeBox.width / 2), Math.round(closeBox.y + closeBox.height / 2))
    await page.waitForTimeout(2000)
    let panelGone = (await page.evaluate(VISIBLE_PANELS)) === 0
    if (!panelGone) { await page.keyboard.press('Escape'); await page.waitForTimeout(1500); panelGone = (await page.evaluate(VISIBLE_PANELS)) === 0 }
    check('panel can be dismissed on a phone', panelGone === true, 'controls: ' + JSON.stringify(labels))
    await page.waitForTimeout(800)
  } else {
    check('tap on a transcript control responds', false, 'no file link in view')
  }

  // 4. composer: tapping the editor focuses it, and the keyboard reaches it
  const editor = (await boxOf(page, '[data-composer-card] [contenteditable="true"]')) ?? (await boxOf(page, '[data-composer-card] [data-composer-input]'))
  if (editor) {
    await page.touchscreen.tap(editor.x, editor.y)
    await page.waitForTimeout(900)
    const focus = await page.evaluate(`(() => { const c = document.querySelector('[data-composer-card]'); const a = document.activeElement; return { inComposer: c.contains(a), editable: a.getAttribute('contenteditable') } })()`)
    check('tapping the composer editor focuses it', focus.inComposer && focus.editable === 'true', JSON.stringify(focus))
    await page.keyboard.type('touch-check')
    await page.waitForTimeout(700)
    const typed = await page.evaluate(`(document.querySelector('[data-composer-card]')?.innerText || '').includes('touch-check')`)
    check('virtual-keyboard typing reaches the editor', typed === true)
    await page.keyboard.press('Control+A')
    await page.keyboard.press('Delete')
    await page.waitForTimeout(500)
  } else {
    check('tapping the composer editor focuses it', false, 'no editor found')
  }

  // 5. header control opens a surface by tap
  const headerBtn = (await boxOf(page, '[data-conversation-header-corner] button', 0)) ?? (await boxOf(page, '[data-fa-canvas] header button', 1))
  if (headerBtn) {
    await page.touchscreen.tap(headerBtn.x, headerBtn.y)
    await page.waitForTimeout(1600)
    const opened = await page.evaluate(`document.querySelectorAll('[role="menu"], [role="dialog"], [role="listbox"], [data-sidebar-right-panel]').length`)
    check('header control opens a surface on tap', opened > 0, 'surfaces=' + opened)
    await page.screenshot({ path: '/tmp/fa-interact/mobile-header-menu.png' })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1200)
  } else {
    check('header control opens a surface on tap', false, 'no header button')
  }

  // 6. drawer lifecycle, entirely by touch
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(8000)
  await page.locator('[data-fa-dock] button[aria-label="Menu"]').click({ force: true })
  await page.waitForTimeout(1200)
  check('dock opens the drawer', await page.evaluate(`document.body.hasAttribute('data-fa-drawer')`))
  const row = await boxOf(page, '[data-fa-col="sidebar"] >> text=便携 DSH')
  if (row) {
    await page.touchscreen.tap(row.x, row.y)
    await page.waitForTimeout(7000)
  }
  check('session opens from the drawer by tap', (await page.evaluate(`document.querySelectorAll('[data-chat-flow-kind]').length`)) > 10)
  await page.locator('[data-fa-dock] button[aria-label="Menu"]').click({ force: true }).catch(() => {})
  await page.waitForTimeout(1400)
  if (await page.evaluate(`document.body.hasAttribute('data-fa-drawer')`)) {
    await page.touchscreen.tap(374, 300)
    await page.waitForTimeout(1400)
  }
  check('scrim tap dismisses the drawer', (await page.evaluate(`!document.body.hasAttribute('data-fa-drawer')`)) === true)

  // 7. every dock item
  /** The dock hides itself while a drawer is open, so put the page back first. */
  const resetDrawer = async () => {
    if (await page.evaluate(`document.body.hasAttribute('data-fa-drawer')`)) {
      await page.touchscreen.tap(374, 300)
      await page.waitForTimeout(1200)
    }
  }
  for (const [label, probe] of [
    ['Search sessions', `document.querySelectorAll('[role="dialog"], input').length > 0`],
    ['Settings', `document.querySelector('[role="dialog"]') !== null`],
  ]) {
    await resetDrawer()
    await page.locator(`[data-fa-dock] button[aria-label="${label}"]`).click({ force: true })
    await page.waitForTimeout(2200)
    check(`dock "${label}" opens its surface`, await page.evaluate(probe))
    await page.screenshot({ path: `/tmp/fa-interact/mobile-dock-${label.split(' ')[0].toLowerCase()}.png` })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1200)
  }
  await resetDrawer()
  await resetDrawer()
  await page.locator('[data-fa-dock] button[aria-label="New session"]').click({ force: true })
  await page.waitForTimeout(4000)
  const newSession = await page.evaluate(`(() => { const c = document.querySelector('[data-composer-card]'); return { composer: c !== null, dialogs: document.querySelectorAll('[role="dialog"]').length } })()`)
  check('dock "New session" responds', newSession.composer === true, JSON.stringify(newSession))

  // 8. invariants
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(6000)
  await page.locator('[data-fa-dock] button[aria-label="Menu"]').click({ force: true })
  await page.waitForTimeout(1400)
  await page.touchscreen.tap(374, 300)
  await page.waitForTimeout(1400)
  const closedPanel = await page.evaluate(`(() => {
    const col = document.querySelector('[data-fa-col="rightbar"]')
    const kids = [...col.children].map(c => { const r = c.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height) })
    const mid = document.elementFromPoint(Math.round(window.innerWidth / 2), Math.round(window.innerHeight * 0.35))
    return { colPe: getComputedStyle(col).pointerEvents, kids, midTop: mid ? mid.tagName.toLowerCase() + '.' + (typeof mid.className === 'string' ? mid.className.split(' ')[0].slice(0, 24) : '') : null, inRightbar: mid ? col.contains(mid) : null }
  })()`)
  check('closed right panel blocks nothing', closedPanel.colPe === 'none' && closedPanel.inRightbar === false, JSON.stringify(closedPanel))

  const inv = await page.evaluate(`(() => ({
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    dockBottom: Math.round(document.querySelector('[data-fa-dock]').getBoundingClientRect().bottom),
    vh: window.innerHeight,
    dockVisible: getComputedStyle(document.querySelector('[data-fa-dock]')).display,
    minTarget: Math.min(...[...document.querySelectorAll('[data-fa-dock] button')].map(b => { const r = b.getBoundingClientRect(); return Math.min(Math.round(r.width), Math.round(r.height)) })),
  }))()`)
  check('no horizontal overflow', inv.overflowX === 0, JSON.stringify(inv))
  check('dock fully inside the viewport', inv.dockBottom <= inv.vh && inv.dockVisible !== 'none', `bottom ${inv.dockBottom} / vh ${inv.vh}`)
  check('dock targets >= 42px', inv.minTarget >= 42, `${inv.minTarget}px`)
  check('mobile console clean', errors.length === 0, errors.slice(0, 2).join(' | '))
  await context.close()
}

// ══ DESKTOP ═════════════════════════════════════════════════════════════════
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)))
  await boot(page, false)
  console.log('\n── DESKTOP (mouse + keyboard) ──')

  // The transcript opens pinned to the end, where a downward wheel has nowhere
  // to go; wheel *up* to leave the end and prove the wheel is wired through.
  const b1 = await page.evaluate(`document.querySelector('[data-conversation-scroll]').scrollTop`)
  await page.mouse.move(800, 500)
  await page.mouse.wheel(0, -600)
  await page.waitForTimeout(900)
  const a1 = await page.evaluate(`document.querySelector('[data-conversation-scroll]').scrollTop`)
  check('transcript scrolls by wheel', a1 < b1, `${Math.round(b1)} -> ${Math.round(a1)}`)

  await page.mouse.move(500, 300)
  await page.mouse.down()
  await page.mouse.move(900, 340, { steps: 12 })
  await page.mouse.up()
  await page.waitForTimeout(400)
  check('text selection works in the transcript', (await page.evaluate(`window.getSelection().toString().trim().length`)) > 3)
  await page.mouse.click(1100, 700)

  await page.locator('[aria-label="Collapse sidebar"]').first().click({ force: true })
  await page.waitForTimeout(1000)
  check('sidebar collapses on click', await page.evaluate(`document.querySelector('[data-fa-frame]').hasAttribute('data-sidebar-collapsed')`))
  await page.locator('[aria-label="Open sidebar"]').first().click({ force: true })
  await page.waitForTimeout(1000)
  check('sidebar expands on click', await page.evaluate(`!document.querySelector('[data-fa-frame]').hasAttribute('data-sidebar-collapsed')`))

  const wBefore = await page.evaluate(`Math.round(document.querySelector('[data-fa-col="sidebar"]').getBoundingClientRect().width)`)
  const hb = await page.locator('[data-side="sidebar"]').first().boundingBox()
  if (hb) {
    await page.mouse.move(hb.x + hb.width / 2, hb.y + 400)
    await page.mouse.down()
    await page.mouse.move(hb.x + hb.width / 2 + 60, hb.y + 400, { steps: 14 })
    await page.mouse.up()
    await page.waitForTimeout(800)
  }
  const wAfter = await page.evaluate(`Math.round(document.querySelector('[data-fa-col="sidebar"]').getBoundingClientRect().width)`)
  check('sidebar resize handle still drags', wAfter !== wBefore, `${wBefore} -> ${wAfter}`)

  await page.locator('[aria-label="Settings"]').first().click({ force: true })
  await page.waitForTimeout(2000)
  check('settings dialog opens', await page.evaluate(`document.querySelector('[role="dialog"]') !== null`))
  await page.screenshot({ path: '/tmp/fa-interact/desktop-settings.png' })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(1200)

  const editor = (await boxOf(page, '[data-composer-card] [contenteditable="true"]')) ?? (await boxOf(page, '[data-composer-card] [data-composer-input]'))
  if (editor) {
    await page.mouse.click(editor.x, editor.y)
    await page.waitForTimeout(700)
    await page.keyboard.type('desktop-check')
    await page.waitForTimeout(600)
    check('desktop typing reaches the editor', await page.evaluate(`(document.querySelector('[data-composer-card]')?.innerText || '').includes('desktop-check')`))
    await page.keyboard.press('Control+A')
    await page.keyboard.press('Delete')
    await page.waitForTimeout(400)
  } else {
    check('desktop typing reaches the editor', false, 'no editor found')
  }

  const link = await boxOf(page, '[data-fa-canvas] button:has-text("install.mjs")')
  if (link) {
    await page.mouse.click(link.x, link.y)
    await page.waitForTimeout(2500)
    const panel = await page.evaluate(`(() => ({ rightbar: Math.round(document.querySelector('[data-fa-col="rightbar"]').getBoundingClientRect().width), panel: !!document.querySelector('[data-sidebar-right-panel]'), dialogs: document.querySelectorAll('[role="dialog"]').length }))()`)
    check('file link opens the right panel', panel.rightbar > 0 || panel.panel || panel.dialogs > 0, JSON.stringify(panel))
    await page.screenshot({ path: '/tmp/fa-interact/desktop-panel.png' })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1200)
  } else {
    check('file link opens the right panel', false, 'no link in view')
  }

  const inv = await page.evaluate(`(() => ({
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    sidebar: Math.round(document.querySelector('[data-fa-col="sidebar"]').getBoundingClientRect().width),
    transcript: Math.round(document.querySelector('[data-conversation-scroll]').getBoundingClientRect().width),
  }))()`)
  check('desktop layout intact', inv.overflowX === 0 && inv.transcript > 600, JSON.stringify(inv))
  check('desktop console clean', errors.length === 0, errors.slice(0, 2).join(' | '))
  await context.close()
}

await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed${failed.length ? ' — FAILURES: ' + failed.map((f) => f.name).join(' | ') : ''}`)
