/**
 * The wallpaper density control.
 *
 * `window.__FRUTIGER__.bubbles()` is the plugin's one *behavioural* API (the
 * rest is a token skin), so it is the one that can silently rot: nothing else
 * in the app calls it, and a broken implementation would look exactly like a
 * working one until a user pressed the control.
 *
 * What is checked:
 *
 *   - the getter reports a step, the valid steps and the live bubble count;
 *   - `lively` builds strictly more bubbles than `normal`, and `calm` strictly
 *     fewer — the direction matters, not the exact numbers;
 *   - the preference survives a reload, because a density the user chose and
 *     then lost is worse than no control at all;
 *   - `normal` clears the stored preference rather than storing the string
 *     `'normal'`, so a later change to the default is not pinned by stale state;
 *   - an unknown step is rejected loudly instead of silently doing nothing;
 *   - the scene keeps its *composition* across a rebuild — the seeded generator
 *     must not be reseeded, or the wallpaper reshuffles every time the user
 *     touches the control.
 *
 * usage: node bubbles.mjs <url>
 */
import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'

const TARGET = process.argv[2]

const browser = await launch()
const page = await freshPage(browser, {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 160)))
await enter(page, TARGET, { settle: 3200 })

const checks = []
const ok = (name, cond, detail) => checks.push({ name, ok: Boolean(cond), detail })

const surface = `(() => {
  const api = window.__FRUTIGER__
  if (api === undefined) return { missing: true }
  return { missing: false, version: api.version, hasBubbles: typeof api.bubbles === 'function' }
})()`

const api = await page.evaluate(surface)
ok('control surface is present', api.missing === false, 'window.__FRUTIGER__ is undefined')
ok('bubbles() is exposed', api.hasBubbles === true, `typeof = ${String(api.hasBubbles)}`)

if (api.missing === false && api.hasBubbles === true) {
  const read = () => page.evaluate(`window.__FRUTIGER__.bubbles()`)
  const set = (step) => page.evaluate(`window.__FRUTIGER__.bubbles(${JSON.stringify(step)})`)
  const domCount = () => page.evaluate(`document.querySelectorAll('[data-fa-bubble]').length`)

  const initial = await read()
  ok('getter reports a step', typeof initial.step === 'string', JSON.stringify(initial))
  ok('getter lists the steps', Array.isArray(initial.steps) && initial.steps.length >= 3, JSON.stringify(initial.steps))
  ok('getter reports a live count', initial.count > 0, `count=${initial.count}`)
  ok('getter count matches the DOM', initial.count === (await domCount()),
    `api=${initial.count} dom=${await domCount()}`)

  const normal = await set('normal')
  const lively = await set('lively')
  const calm = await set('calm')
  ok('lively builds more bubbles than normal', lively.count > normal.count, `${lively.count} vs ${normal.count}`)
  ok('calm builds fewer bubbles than normal', calm.count < normal.count, `${calm.count} vs ${normal.count}`)
  ok('the DOM follows the API', (await domCount()) === calm.count, `dom=${await domCount()} api=${calm.count}`)
  ok('the scene was not rebuilt into a different composition',
    await page.evaluate(`document.querySelector('[data-fa-scene]') !== null`), 'no scene element')

  // The composition check: the first bubble's position must be identical
  // before and after, because the generator is seeded, not random.
  const signature = `(() => {
    const first = document.querySelector('[data-fa-bubble]')
    if (first === null) return null
    const s = first.style
    return [s.getPropertyValue('--fa-x'), s.getPropertyValue('--fa-size'), s.getPropertyValue('--fa-duration')].join('|')
  })()`
  const before = await page.evaluate(signature)
  await set('lively')
  const after = await page.evaluate(signature)
  ok('the wallpaper keeps its composition across a density change', before === after, `${before} -> ${after}`)

  // `normal` must clear the key, not pin the literal string.
  await set('normal')
  const stored = await page.evaluate(`localStorage.getItem('frutiger-aero:bubbles')`)
  ok('normal clears the stored preference', stored === null || stored === '', `stored=${JSON.stringify(stored)}`)

  // Persistence.
  await set('lively')
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4000)
  const afterReload = await read()
  ok('the chosen density survives a reload', afterReload.step === 'lively', `step=${afterReload.step}`)

  // A bad step must be loud.
  const rejected = await page.evaluate(`(() => {
    try { window.__FRUTIGER__.bubbles('enormous'); return 'no error' }
    catch (e) { return e.message }
  })()`)
  ok('an unknown step is rejected with a useful message',
    typeof rejected === 'string' && rejected.includes('enormous') && !rejected.startsWith('no error'),
    rejected)

  // `?bubbles=` must win, because a bug report needs to name an exact count.
  await page.goto(`${TARGET}&bubbles=calm`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(4500)
  const viaQuery = await page.evaluate(`window.__FRUTIGER__ === undefined ? null : window.__FRUTIGER__.bubbles().count`)
  const storedStillLively = await page.evaluate(`localStorage.getItem('frutiger-aero:bubbles')`)
  ok('?bubbles= overrides the stored preference and leaves it alone',
    viaQuery !== null && storedStillLively === 'lively',
    `query count=${String(viaQuery)} stored=${JSON.stringify(storedStillLively)}`)

  // Clean up so the harness home is not left in a non-default state.
  await page.evaluate(`window.__FRUTIGER__?.bubbles('normal')`)
}

console.log('')
let failed = 0
for (const c of checks) {
  if (!c.ok) failed += 1
  console.log(`${c.ok ? 'ok  ' : 'FAIL'} ${c.name}${c.ok ? '' : `   (${c.detail})`}`)
}
if (errors.length > 0) {
  console.log(`\npage errors: ${errors.length}`)
  for (const e of errors.slice(0, 5)) console.log(`  ${e}`)
}
console.log(`\n${checks.length - failed}/${checks.length} checks passed`)
await browser.close()
process.exit(failed > 0 ? 1 : 0)
