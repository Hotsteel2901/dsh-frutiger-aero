// transformprobe.mjs — who applies the -1px lift to an unfocused composer card?
//
// composercheck reports `matrix(1, 0, 0, 1, 0, -1)` on `[data-composer-card]`
// while it is NOT focused. My focus rule is the obvious suspect and the obvious
// suspect is wrong to assume: the focus branch measures the same matrix, so the
// value does not distinguish the two states at all.
//
// Either
//   (a) some other rule (mine or the product's) lifts the card at rest, or
//   (b) the measurement is picking up a transition mid-flight.
//
// This distinguishes them: it lists every matching CSS rule that sets a
// transform on the card, and samples the computed value over time from a
// settled, unfocused page.

import { launch } from './lib/chromium.mjs'
import { freshPage } from './lib/gates.mjs'

const url = process.argv[2]
if (!url) {
  console.error('usage: node transformprobe.mjs <url>')
  process.exit(2)
}

const browser = await launch({ args: ['--no-sandbox'] })
const page = await freshPage(browser, { viewport: { width: 1440, height: 900 } })
await page.goto(url, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(4500)

const rules = await page.evaluate(`(() => {
  const card = document.querySelector('[data-composer-card]')
  if (card === null) return { found: false }

  // Every declaration of transform/translate that actually applies to this node.
  const hits = []
  for (const sheet of document.styleSheets) {
    let list
    try { list = sheet.cssRules } catch (e) { continue }
    const walk = (rs, media) => {
      for (const r of rs) {
        if (r.cssRules) { walk(r.cssRules, r.conditionText || media); continue }
        if (r.selectorText === undefined) continue
        if (!/transform|translate/.test(r.style.cssText)) continue
        let matches = false
        try { matches = card.matches(r.selectorText) } catch (e) { continue }
        if (!matches) continue
        hits.push({
          selector: r.selectorText.slice(0, 110),
          media: media || '',
          transform: r.style.transform || r.style.translate || '',
          hover: /:hover/.test(r.selectorText),
          focus: /:focus/.test(r.selectorText),
        })
      }
    }
    walk(list, '')
  }
  return { found: true, hits }
})()`)

console.log('── rules setting transform on the card ──')
if (rules.found === false) {
  console.log('(card not found)')
} else {
  for (const h of rules.hits) console.log(' ', JSON.stringify(h))
}

// Sample the settled, unfocused value over several seconds.
const samples = []
for (let i = 0; i < 6; i += 1) {
  const v = await page.evaluate(`(() => {
    const card = document.querySelector('[data-composer-card]')
    if (card === null) return null
    const s = getComputedStyle(card)
    return { t: s.transform, within: card.matches(':focus-within'), hovered: card.matches(':hover') }
  })()`)
  samples.push(v)
  await page.waitForTimeout(700)
}

console.log('── settled, unfocused, sampled ──')
for (const [i, s] of samples.entries()) console.log(' ', i, JSON.stringify(s))

await browser.close()
