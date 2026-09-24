// focusprobe.mjs — why does the composer focus state not engage?
//
// No assertions. This is a question-answering probe.
//
// The question: `[data-composer-card]:focus-within` never matched, so none of
// the four focus effects engaged. Two candidate explanations, and they call
// for opposite fixes:
//
//   1. The probe's setup is wrong — it calls `.focus()` on
//      `[data-lexical-editor]`, and if that node is not focusable, focus never
//      moved and the CSS is fine.
//   2. The card is genuinely not a focus ancestor, and no descendant
//      combinator can ever fire.
//
// `cardHasDescendant` (already measured true) rules out (2) for the editor.
// So this probe measures focusability directly, and reports which node the
// browser actually hands focus to.

import { launch } from './lib/chromium.mjs'
import { freshPage } from './lib/gates.mjs'

const url = process.argv[2]
if (!url) {
  console.error('usage: node focusprobe.mjs <url>')
  process.exit(2)
}

const browser = await launch({ args: ['--no-sandbox'] })
const page = await freshPage(browser, { viewport: { width: 1440, height: 900 } })
await page.goto(url, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3500)

const out = await page.evaluate(`(() => {
  const desc = (el) => {
    if (el === null || el === undefined) return 'null'
    let cls = ''
    if (typeof el.className === 'string') cls = '.' + el.className.split(/\\s+/)[0]
    const ce = el.getAttribute && el.getAttribute('contenteditable')
    return el.tagName.toLowerCase() + cls + (ce === null ? '' : '[ce=' + ce + ']')
  }

  const card = document.querySelector('[data-composer-card]')
  const ed = document.querySelector('[data-lexical-editor]')

  // Is the node the probe focuses actually focusable in the DOM sense?
  const focusable = (el) => {
    if (el === null) return { found: false }
    return {
      found: true,
      desc: desc(el),
      tabindex: el.getAttribute('tabindex'),
      elTabIndex: el.tabIndex,
      contentEditable: el.getAttribute('contenteditable'),
      isContentEditable: el.isContentEditable,
      disabled: el.disabled === true,
      display: getComputedStyle(el).display,
      visibility: getComputedStyle(el).visibility,
      box: el.getBoundingClientRect().width + 'x' + el.getBoundingClientRect().height,
    }
  }

  // Every contenteditable in the document, with its ancestry up to the card.
  const editable = [...document.querySelectorAll('[contenteditable]')].map((el) => ({
    desc: desc(el),
    insideCard: card !== null && card.contains(el),
    box: el.getBoundingClientRect().width + 'x' + el.getBoundingClientRect().height,
  }))

  return {
    phase: document.documentElement.dataset.faPhase || '(unset)',
    tier: document.documentElement.dataset.faTier || '(unset)',
    lexical: focusable(ed),
    contenteditables: editable,
    cardFound: card !== null,
  }
})()`)

console.log('── setup ──')
console.log(JSON.stringify(out, null, 1))

// The real test: focus each candidate and see who ends up as activeElement.
const result = await page.evaluate(`(async () => {
  const card = document.querySelector('[data-composer-card]')
  const ed = document.querySelector('[data-lexical-editor]')
  const log = []

  const attempt = async (label, el) => {
    if (el === null) {
      log.push({ label, skipped: 'not found' })
      return
    }
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur()
    await new Promise((r) => setTimeout(r, 60))
    el.focus()
    await new Promise((r) => setTimeout(r, 250))
    const a = document.activeElement
    log.push({
      label,
      active: a === null ? 'null' : a.tagName.toLowerCase() + (card !== null && card.contains(a) ? ' (in card)' : ' (OUTSIDE card)'),
      within: card === null ? null : card.matches(':focus-within'),
    })
  }

  await attempt('lexical', ed)
  await attempt('contenteditable in card', card === null ? null : card.querySelector('[contenteditable]'))

  // And the state of the four effects once we have established focus.
  const cs = card === null ? null : getComputedStyle(card)
  const after = card === null ? null : getComputedStyle(card, '::after')
  const edc = ed === null ? null : getComputedStyle(ed)
  return {
    log,
    cardTransform: cs === null ? null : cs.transform,
    cardTransition: cs === null ? null : cs.transitionProperty,
    ringOpacity: after === null ? null : after.opacity,
    editorAnim: edc === null ? null : edc.animationName,
  }
})()`)

console.log('── focusing ──')
console.log(JSON.stringify(result, null, 1))

await browser.close()
