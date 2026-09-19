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

/** Open a session by its visible title, and prove the transcript rendered. */
export async function openSession(page, title, { mobile = false } = {}) {
  if (mobile) await openDrawer(page)
  const row = page.locator('body').getByText(title, { exact: false }).first()
  await row.click({ timeout: 10000, force: true }).catch(() => {})
  await page.waitForTimeout(9000)
  const turns = await page.evaluate(`document.querySelectorAll('[data-chat-flow-kind]').length`)
  if (turns === 0) {
    const state = await page.evaluate(`({ drawer: document.body.hasAttribute('data-fa-drawer'), path: location.pathname, title: document.title })`)
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
