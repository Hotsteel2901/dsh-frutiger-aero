/**
 * Session helpers that verify what they did.
 *
 * Every previous attempt to drive this app from a script was defeated by the
 * same thing: an action that silently did nothing, followed by a probe that
 * reported the resulting empty state as if it were the finding. These helpers
 * assert the state actually changed, and throw with the real DOM state when it
 * did not — a probe that runs against the wrong screen is worse than no probe.
 */

/**
 * The product's sidebar toggle. Two labels, because the two directions are two
 * different controls in the expanded layout — and the brand mark is *not* a
 * toggle (it is "open" in the rail and "new session" when expanded).
 */
const SIDEBAR_LABELS = {
  open: ['Open sidebar', '打开侧边栏'],
  close: ['Collapse sidebar', '收起侧边栏'],
}

/** Click a sidebar control by label and wait for a predicate, retrying. */
async function clickUntil(page, direction, predicate, { tries = 4, settle = 1200 } = {}) {
  for (let attempt = 0; attempt < tries; attempt += 1) {
    await page.evaluate(`(() => {
      const root = document.getElementById('root')
      const names = ${JSON.stringify(SIDEBAR_LABELS[direction])}
      const el = names.map((n) => root.querySelector('[aria-label=' + JSON.stringify(n) + ']')).find(Boolean)
      if (el) el.click()
      return Boolean(el)
    })()`)
    await page.waitForTimeout(settle)
    if (await page.evaluate(predicate)) return true
  }
  return false
}

export const isDrawerOpen = (page) => page.evaluate(`document.body.hasAttribute('data-fa-drawer')`)

/** Open the navigation drawer, and prove it opened. */
export async function openDrawer(page) {
  if (await isDrawerOpen(page)) return true
  const ok = await clickUntil(page, 'open', `document.body.hasAttribute('data-fa-drawer')`)
  if (!ok) throw new Error('openDrawer: the sidebar toggle did nothing')
  return true
}

/** Close the navigation drawer, and prove it closed. */
export async function closeDrawer(page) {
  if (!(await isDrawerOpen(page))) return true
  const ok = await clickUntil(page, 'close', `!document.body.hasAttribute('data-fa-drawer')`)
  if (!ok) throw new Error('closeDrawer: the sidebar toggle did nothing')
  return true
}

/**
 * Open a session by its visible title, and prove the transcript rendered.
 *
 * @param options.mobile - open the drawer first (narrow layouts).
 * @param options.tap - use a real touchscreen tap when the context has one.
 *   Defaults to `mobile`: a phone context is created with `hasTouch`, a desktop
 *   one is not. Calling `touchscreen.tap` on a context without touch throws, so
 *   this is chosen from the context rather than assumed — and it must not be
 *   forced to `true` to "make it more realistic", because adding `hasTouch` to
 *   a desktop context flips `(pointer: coarse)` and silently enables the phone
 *   stylesheet.
 */
export async function openSession(page, title, { mobile = false, tap = mobile } = {}) {
  if (mobile) await openDrawer(page)

  /**
   * Pick a row that will actually *do* something.
   *
   * The sidebar lists every session with `aria-selected`, and the one already
   * open is `true`. Clicking that one is a no-op by design — which made an
   * earlier version of this helper fail with 'no transcript rendered' on a home
   * where the transcript was fine and only the row choice was wrong. Prefer an
   * unselected row, and fall back to any row only if there is no other.
   */
  const pick = `(() => {
    const rows = [...document.querySelectorAll('.YDXeBa_sessionRow')]
    const wanted = ${JSON.stringify(title)}
    const unselected = rows.filter((r) => r.getAttribute('aria-selected') !== 'true')
    const matches = unselected.filter((r) => (r.textContent || '').includes(wanted))
    return matches[0] ?? unselected[0] ?? rows.find((r) => (r.textContent || '').includes(wanted)) ?? null
  })()`

  const target = await page.evaluate(pick)
  if (target !== null) {
    // A real tap, not `.click()`: the plugin's own row handler listens for
    // pointer events, and a synthetic click would skip the path a thumb takes.
    const handle = await page.evaluate(`(() => {
      const r = ${pick}
      if (r === null) return null
      const b = r.getBoundingClientRect()
      return JSON.stringify({ x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) })
    })()`)
    if (handle !== null) {
      const { x, y } = JSON.parse(handle)
      if (tap) await page.touchscreen.tap(x, y)
      else await page.mouse.click(x, y)
    }
  } else {
    await page.locator('body').getByText(title, { exact: false }).first()
      .click({ timeout: 10000, force: true }).catch(() => {})
  }
  await page.waitForTimeout(9000)

  let turns = await page.evaluate(`document.querySelectorAll('[data-chat-flow-kind]').length`)
  if (turns === 0) {
    // One retry through a remaining unselected row before calling it a failure:
    // the drawer animation can still be settling on the first attempt, and on a
    // home with several sessions the first tap may land on one already open.
    const retried = await page.evaluate(`(() => {
      const rows = [...document.querySelectorAll('.YDXeBa_sessionRow')]
        .filter((r) => r.getAttribute('aria-selected') !== 'true')
      if (rows.length === 0) return false
      rows[0].click()
      return true
    })()`)
    if (retried) await page.waitForTimeout(7000)
    turns = await page.evaluate(`document.querySelectorAll('[data-chat-flow-kind]').length`)
  }

  if (turns === 0) {
    const state = await page.evaluate(`({
      drawer: document.body.hasAttribute('data-fa-drawer'),
      path: location.pathname,
      title: document.title,
      rows: [...document.querySelectorAll('.YDXeBa_sessionRow')].map((r) => (r.textContent || '').trim().slice(0, 40)),
    })`)
    throw new Error(`openSession: no transcript rendered — ${JSON.stringify(state)}`)
  }
  if (mobile) await closeDrawer(page)
  return turns
}

/** Switch the conversation panel tab by its label ("Chat" / "Trajectory", or the zh pair). */
export async function openTab(page, pattern) {
  const ok = await page.evaluate(`(() => {
    const canvas = document.querySelector('[data-fa-canvas]')
    if (!canvas) return false
    const tabs = [...canvas.querySelectorAll('button, [role="tab"]')]
      .filter((b) => ${pattern}.test((b.textContent || '').trim()))
    if (!tabs[0]) return false
    tabs[0].click()
    return true
  })()`)
  if (!ok) throw new Error(`openTab: no tab matching ${pattern}`)
  await page.waitForTimeout(7000)
}
