/**
 * The session row, where the audit could not previously reach.
 *
 * The earlier probes could only ever see an **empty** app, because the product
 * offers no headless way to author a conversation and "Add workspace" opens a
 * native OS directory picker. `seed-session.mjs` fixes that, and this probe
 * spends the new capability on the surface it unlocked: the session row.
 *
 * Three questions, each of which the empty app could not answer:
 *
 *   1. Is the row's **reach** at least 44px tall? The product renders it 32px
 *      and the skin's `::before` halo is scoped to buttons and ARIA widgets —
 *      a `role="treeitem"` div is neither.
 *   2. Do the row's **action affordances** survive on touch? The product hides
 *      them in a `display:none` span that only a hover reveals, and a phone has
 *      no hover.
 *   3. Does choosing a row **close the drawer**? On a phone the drawer covers
 *      the transcript, so leaving it open makes the tap look like a no-op.
 *
 * usage: node sessionrow.mjs <url> [outDir]
 */
import { launch } from './lib/chromium.mjs'
import { enter } from './lib/gates.mjs'

const URL = process.argv[2]
const OUT = process.argv[3] ?? '/tmp/fa-row'
const WIDTH = Number(process.argv[4] ?? 390)
const HEIGHT = Number(process.argv[5] ?? 844)

/** The reach of a role=treeitem row, measured like `hitaudit` measures buttons. */
const REACH = `(() => {
  const MIN = 44
  const STEP = 4
  const row = document.querySelector('.YDXeBa_sessionRow') || document.querySelector('[role="treeitem"]')
  if (row === null) return null
  const measure = (el, w, h) => {
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const halfW = Math.max(r.width, w) / 2
    const halfH = Math.max(r.height, h) / 2
    const inside = (node) => node !== null && (el.contains(node) || node.contains(el))
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (let dy = -halfH; dy <= halfH; dy += STEP) {
      for (let dx = -halfW; dx <= halfW; dx += STEP) {
        const x = cx + dx, y = cy + dy
        if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue
        const hit = document.elementFromPoint(x, y)
        if (!inside(hit)) continue
        minX = Math.min(minX, dx); maxX = Math.max(maxX, dx)
        minY = Math.min(minY, dy); maxY = Math.max(maxY, dy)
      }
    }
    if (minX === Infinity) return { reach: '0x0' }
    return { reach: Math.round(maxX - minX + STEP) + 'x' + Math.round(maxY - minY + STEP) }
  }
  const box = row.getBoundingClientRect()
  const title = row.querySelector('.YDXeBa_title')
  const actions = row.parentElement ? row.parentElement.querySelector('.YDXeBa_rowActions') : null
  return {
    tag: row.tagName,
    role: row.getAttribute('role'),
    box: Math.round(box.width) + 'x' + Math.round(box.height),
    ...measure(row, MIN, MIN),
    min: MIN,
    titleBox: title ? Math.round(title.getBoundingClientRect().width) + 'x' + Math.round(title.getBoundingClientRect().height) : null,
    actionsDisplay: actions ? getComputedStyle(actions).display : 'no rowActions element',
    actionsChildren: actions ? actions.querySelectorAll('button,[role="button"]').length : 0,
    actionsReachable: actions
      ? [...actions.querySelectorAll('button,[role="button"]')].filter((b) => b.getBoundingClientRect().width > 0).length
      : 0,
    draggable: row.getAttribute('draggable'),
    rowHasTabIndex: row.hasAttribute('tabindex'),
  }
})()`

const browser = await launch()
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 3,
})
const { gates, errors } = await enter(page, URL)

// Open the drawer the way a thumb would, then measure the row inside it.
await page.evaluate(`(() => {
  const btn = [...document.querySelectorAll('#root button, #root [role="button"]')]
    .find((b) => /^(Open sidebar|打开侧边栏)$/.test((b.getAttribute('aria-label') || '').trim()))
  if (btn) btn.click()
})()`)
await page.waitForTimeout(1600)

const report = { viewport: `${String(WIDTH)}x${String(HEIGHT)}`, gates, drawerOpen: null, row: null, afterSelect: null, errors }
report.drawerOpen = await page.evaluate(`document.body.hasAttribute('data-fa-drawer')`)
report.row = await page.evaluate(REACH)

if (report.row !== null) {
  await page.screenshot({ path: `${OUT}-drawer.png` })
  // Select the row and see whether the drawer yields the screen back.
  await page.evaluate(`(() => {
    const row = document.querySelector('.YDXeBa_sessionRow') || document.querySelector('[role="treeitem"]')
    if (row) row.click()
  })()`)
  await page.waitForTimeout(4500)
  report.afterSelect = await page.evaluate(`(() => ({
    drawerStillOpen: document.body.hasAttribute('data-fa-drawer'),
    title: document.querySelector('.YDXeBa_title') ? document.querySelector('.YDXeBa_title').textContent : null,
    transcriptRows: document.querySelectorAll('[data-chat-flow-kind]').length,
    emptyState: document.body.innerText.includes('Into the Unknown'),
  }))()`)
  await page.screenshot({ path: `${OUT}-after-select.png` })
}

console.log(JSON.stringify(report, null, 2))
await browser.close()
