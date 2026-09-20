/**
 * The session row, where the audit could not previously reach.
 *
 * The earlier probes could only ever see an **empty** app, because the product
 * offers no headless way to author a conversation and "Add workspace" opens a
 * native OS directory picker. `seed-session.mjs` fixes that, and this probe
 * spends the new capability on the surface it unlocked: the session row.
 *
 * ## Why it targets `.YDXeBa_sessionRow` and not `[role="treeitem"]`
 *
 * The sidebar tree holds **two different kinds of row**, and they share the role:
 *
 * ```
 * .YDXeBa_projectRow   role=treeitem aria-expanded  ← a workspace, a folder
 * .YDXeBa_sessionRow   role=treeitem aria-selected  ← a conversation
 * ```
 *
 * The first version of this probe asked for `[role="treeitem"]` and therefore
 * measured the **project row** — which has no action menu, is not selectable,
 * and is not what "choosing a session" means. Every conclusion drawn from it was
 * about the wrong element: it reported `no rowActions element`, so a fix that
 * was in fact live looked broken, and its `afterSelect` reading came from a
 * folder rather than a conversation. Both were wrong, and both were reported as
 * findings before a DOM dump showed what was actually being measured.
 *
 * So the selector is the product's own class for the row it means.
 *
 * ## What it asks
 *
 *   1. Is the row's **reach** at least 44px tall? The product renders it 32px
 *      and the skin's `::before` halo is scoped to buttons and ARIA widgets —
 *      a `role="treeitem"` div is neither.
 *   2. Do the row's **action affordances** survive on touch? The product hides
 *      them in a `display:none` span that only a hover reveals, and a phone has
 *      no hover. Reach, not box: the halo deliberately does not resize anything,
 *      so the box stays 16x16 while the tappable area is 44x44.
 *   3. Does choosing a row **close the drawer**? On a phone the drawer covers
 *      the transcript, so leaving it open makes the tap look like a no-op.
 *   4. Did tapping it actually **open that session**? Without this, (3) can be
 *      satisfied by a tap that did nothing at all.
 *
 * usage: node sessionrow.mjs <url> [outDir] [width] [height]
 */
import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'

const TARGET = process.argv[2]
const OUT = process.argv[3] ?? '/tmp/fa-row'
const WIDTH = Number(process.argv[4] ?? 390)
const HEIGHT = Number(process.argv[5] ?? 844)

/** The row the probe means: an unselected conversation, or any conversation. */
const ROW = "document.querySelector('.YDXeBa_sessionRow[aria-selected=\"false\"]') || document.querySelector('.YDXeBa_sessionRow')"

/**
 * Measure **reach**: walk a grid across the control's intended 44x44 area and
 * ask `elementFromPoint` whether the hit still belongs to it. `getBoundingClientRect`
 * answers a different question — the layout box — and the halo technique is
 * specifically designed to leave that unchanged, so the two disagree on purpose.
 */
const REPORT = `(() => {
  const MIN = 44, STEP = 4
  const row = ${ROW}
  if (row === null) return null
  const measure = (el, w, h) => {
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2
    const halfW = Math.max(r.width, w) / 2, halfH = Math.max(r.height, h) / 2
    const inside = (node) => node !== null && (el.contains(node) || node.contains(el))
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (let dy = -halfH; dy <= halfH; dy += STEP) {
      for (let dx = -halfW; dx <= halfW; dx += STEP) {
        const x = cx + dx, y = cy + dy
        if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue
        if (!inside(document.elementFromPoint(x, y))) continue
        minX = Math.min(minX, dx); maxX = Math.max(maxX, dx)
        minY = Math.min(minY, dy); maxY = Math.max(maxY, dy)
      }
    }
    if (minX === Infinity) return '0x0'
    return Math.round(maxX - minX + STEP) + 'x' + Math.round(maxY - minY + STEP)
  }
  const box = row.getBoundingClientRect()
  const title = row.querySelector('[class*="title"]')
  const time = row.querySelector('[class*="time"]')
  const actions = row.querySelector('[class*="rowActions"]')
  const actionButton = actions === null ? null : actions.querySelector('button,[role="button"]')
  const rb = actionButton === null ? null : actionButton.getBoundingClientRect()
  return {
    title: title === null ? null : title.textContent,
    box: Math.round(box.width) + 'x' + Math.round(box.height),
    rowReach: measure(row, MIN, MIN),
    min: MIN,
    titleBox: title === null ? null : Math.round(title.getBoundingClientRect().width) + 'px',
    timeDisplay: time === null ? 'absent' : getComputedStyle(time).display,
    actionsDisplay: actions === null ? 'absent' : getComputedStyle(actions).display,
    actionButtonBox: rb === null ? null : Math.round(rb.width) + 'x' + Math.round(rb.height),
    actionButtonReach: actionButton === null ? null : measure(actionButton, MIN, MIN),
    actionLabel: actionButton === null ? null : actionButton.getAttribute('aria-label'),
    draggable: row.getAttribute('draggable'),
    userDrag: getComputedStyle(row).webkitUserDrag,
  }
})()`

const browser = await launch()
const page = await freshPage(browser, {
  viewport: { width: WIDTH, height: HEIGHT },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 3,
})
const { gates, errors } = await enter(page, TARGET)

// Open the drawer the way a thumb would, then measure the row inside it.
await page.evaluate(`(() => {
  const btn = [...document.querySelectorAll('#root button, #root [role="button"]')]
    .find((b) => /^(Open sidebar|打开侧边栏)$/.test((b.getAttribute('aria-label') || '').trim()))
  if (btn) btn.click()
})()`)
await page.waitForTimeout(1600)

const report = {
  viewport: `${String(WIDTH)}x${String(HEIGHT)}`,
  gates,
  coarse: await page.evaluate(`matchMedia('(pointer: coarse)').matches`),
  drawerOpen: null,
  row: null,
  afterSelect: null,
  errors,
}
report.drawerOpen = await page.evaluate(`document.body.hasAttribute('data-fa-drawer')`)
report.row = await page.evaluate(REPORT)

if (report.row !== null) {
  await page.screenshot({ path: `${OUT}-drawer.png` })
  const expected = report.row.title
  // Select the row and see whether the drawer yields the screen back, and
  // whether the transcript it promises is the one that arrives.
  await page.evaluate(`(() => { const row = ${ROW}; if (row) row.click() })()`)
  await page.waitForTimeout(4500)
  report.afterSelect = await page.evaluate(`(() => ({
    drawerStillOpen: document.body.hasAttribute('data-fa-drawer'),
    transcriptRows: document.querySelectorAll('[data-chat-flow-kind]').length,
    composerPresent: document.querySelector('[data-composer-card]') !== null,
    // The drawer's own rows are *gone* when it collapses, so "the session I
    // picked is now active" cannot be read off the sidebar afterwards. It is
    // read off the transcript instead: the seeded conversation is the only one
    // with content, and its first line is stable.
    transcriptText: (document.querySelector('[data-chat-flow-kind]')?.textContent ?? '').trim().slice(0, 80),
  }))()`)
  report.afterSelect.expectedTitle = expected
  // A tap that did nothing would leave the empty state up; one that worked
  // replaced it with the seeded conversation.
  report.afterSelect.openedTheRow = report.afterSelect.transcriptRows > 0
    && report.afterSelect.composerPresent
  await page.screenshot({ path: `${OUT}-after-select.png` })
}

console.log(JSON.stringify(report, null, 2))
await browser.close()
