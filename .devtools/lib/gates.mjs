/**
 * First-run gates, dismissed by any script that needs a usable app.
 *
 * A freshly installed Harness home shows two modal dialogs before the product
 * is reachable — the internal-testing notice, then "Add an API key to get
 * started" with a **Configure later** escape hatch. Neither belongs to the
 * skin, and both are modal, so every assertion written against the app
 * silently measures a dialog until they are gone. That is exactly how a run
 * can report "turns=0" and look like a layout bug.
 *
 * Two details matter:
 *
 * - Match on the *visible* button text. `getByRole` finds the dialog's
 *   buttons but not which one unblocks the app, and the button set differs
 *   per gate.
 * - The API-key dialog has a text input. Dismissing it must not write a key.
 */

/** Labels that dismiss a gate, in the order they should be tried. */
const DISMISS = [
  /^(Continue|继续)$/,
  /^(Configure later|稍后配置)$/,
  /^(Skip|跳过|Not now|以后再说)$/,
  /^(Got it|知道了|I understand|我明白了)$/,
]

/**
 * Click through every first-run gate currently on screen.
 *
 * @param page - Playwright page.
 * @param options - `settle` ms to wait after the last click; `rounds` max gate count.
 * @returns the labels actually clicked, useful for asserting the state was reached.
 */
export async function passGates(page, { settle = 2200, rounds = 6 } = {}) {
  const clicked = []
  const seen = new Set()
  for (let round = 0; round < rounds; round += 1) {
    const hit = await page.evaluate(`(() => {
      const patterns = ${JSON.stringify(DISMISS.map((r) => r.source))}.map((s) => new RegExp(s))
      const visible = (el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'
      }
      // The dialog's own buttons live in the dialog, and a gate is only a gate
      // if it is on screen; scope to both so a hidden copy of the same label
      // elsewhere in the app cannot absorb the click.
      const scopes = [...document.querySelectorAll('[role="dialog"], dialog')].filter(visible)
      for (const scope of scopes) {
        for (const pattern of patterns) {
          const found = [...scope.querySelectorAll('button, [role="button"]')].find(
            (b) => visible(b) && pattern.test((b.textContent || '').trim()),
          )
          if (!found) continue
          const label = (found.textContent || '').trim()
          found.click()
          return label
        }
      }
      return null
    })()`)
    // A gate that refuses to close must not be clicked forever: the same label
    // twice means the click did not take, and the caller needs to know.
    if (!hit || seen.has(hit)) {
      if (hit) clicked.push(`${hit} (no effect)`)
      break
    }
    seen.add(hit)
    clicked.push(hit)
    await page.waitForTimeout(settle)
  }
  return clicked
}

/** True while any modal gate is still covering the app. */
export async function gateOpen(page) {
  return page.evaluate(`(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'
    }
    const text = ${JSON.stringify(DISMISS.map((r) => r.source))}
    return [...document.querySelectorAll('[role="dialog"], dialog')].some(
      (d) => visible(d) && [...d.querySelectorAll('button, [role="button"]')].some((b) =>
        visible(b) && text.some((s) => new RegExp(s).test((b.textContent || '').trim()))),
    )
  })()`)
}

/**
 * Navigate to a Harness URL and return with the app usable.
 *
 * @param page - Playwright page.
 * @param url - the token URL printed by `serve.sh`.
 * @param options - `settle` ms after load; `gates` false to inspect the raw boot.
 * @returns `{ gates, errors }` where `errors` are console/page errors seen so far.
 */
export async function enter(page, url, { settle = 3500, gates = true } = {}) {
  const errors = []
  page.on('pageerror', (e) => errors.push(`PAGEERROR: ${String(e.message).slice(0, 200)}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`CONSOLE: ${m.text().slice(0, 200)}`)
  })
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(2600)
  const clicked = gates ? await passGates(page) : []
  await page.waitForTimeout(settle)
  return { gates: clicked, errors }
}
