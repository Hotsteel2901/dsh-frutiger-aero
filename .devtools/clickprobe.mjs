// clickprobe.mjs — does a real user interaction move focus into the composer?
//
// focusprobe.mjs established that calling `.focus()` on the contenteditable
// leaves `document.activeElement` on <body>. That is either:
//
//   (a) a headless/injection artefact — programmatic focus being refused, or
//   (b) what actually happens for a real user.
//
// These have opposite implications. (b) would mean the composer cannot receive
// focus at all, which is a product-level claim far outside this plugin's remit,
// and would also mean `:focus-within` is the wrong hook. (a) means the probe
// must click like a user instead.
//
// So: drive it with real input events, then real keyboard events, and report
// where focus lands each time.

import { launch } from './lib/chromium.mjs'
import { freshPage } from './lib/gates.mjs'

const url = process.argv[2]
if (!url) {
  console.error('usage: node clickprobe.mjs <url>')
  process.exit(2)
}

const browser = await launch({ args: ['--no-sandbox'] })
const page = await freshPage(browser, { viewport: { width: 1440, height: 900 } })
await page.goto(url, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3500)

const report = async (label) => {
  const s = await page.evaluate(`(() => {
    const card = document.querySelector('[data-composer-card]')
    const a = document.activeElement
    const ed = document.querySelector('[data-lexical-editor]')
    const cs = card === null ? null : getComputedStyle(card)
    const after = card === null ? null : getComputedStyle(card, '::after')
    const edc = ed === null ? null : getComputedStyle(ed)
    return {
      active: a === null ? 'null' : a.tagName.toLowerCase() + (a.className && typeof a.className === 'string' ? '.' + a.className.split(/\\s+/)[0] : ''),
      inCard: card !== null && a !== null ? card.contains(a) : null,
      within: card === null ? null : card.matches(':focus-within'),
      cardTransform: cs === null ? null : cs.transform,
      ringOpacity: after === null ? null : after.opacity,
      editorAnim: edc === null ? null : edc.animationName,
      caretColor: edc === null ? null : edc.caretColor,
    }
  })()`)
  console.log(label, JSON.stringify(s))
  return s
}

await report('initial      ')

// 1. Real mouse click on the editor.
try {
  await page.locator('[data-lexical-editor]').click({ timeout: 5000, force: true })
  await page.waitForTimeout(500)
  await report('after click  ')
} catch (e) {
  console.log('after click   FAILED:', String(e).split('\n')[0])
}

// 2. Real keyboard input — the strongest possible evidence of focus.
try {
  await page.keyboard.type('x', { delay: 30 })
  await page.waitForTimeout(400)
  const s = await report('after typing ')
  const text = await page.evaluate(`(() => {
    const ed = document.querySelector('[data-lexical-editor]')
    return ed === null ? null : (ed.textContent || '').slice(0, 40)
  })()`)
  console.log('editor text  ', JSON.stringify(text))
} catch (e) {
  console.log('after typing  FAILED:', String(e).split('\n')[0])
}

await browser.close()
