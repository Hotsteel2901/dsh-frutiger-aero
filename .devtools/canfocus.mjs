// canfocus.mjs — is focus broken in this browser setup, or just on this page?
//
// clickprobe.mjs showed that a real click on the composer's contenteditable
// moves `document.activeElement` *away* from an input and onto <body>, and that
// typing afterwards inserts no text. Before concluding anything about the
// composer's CSS, we need to know whether programmatic and real focus work at
// all here.
//
// This runs three controls:
//   1. a data: URL with a plain contenteditable  — no app, no plugin
//   2. the same, but against the live harness origin
//   3. the live harness, focusing a plain product <input>
//
// If (1) and (3) pass and only the composer fails, the composer is the subject.
// If (1) fails too, focus itself is unreliable here and any focus-based
// assertion in this suite must be marked as such rather than trusted.

import { launch } from './lib/chromium.mjs'
import { freshPage } from './lib/gates.mjs'

const url = process.argv[2]
if (!url) {
  console.error('usage: node canfocus.mjs <url>')
  process.exit(2)
}

const browser = await launch({ args: ['--no-sandbox'] })

// ── control 1: bare page, no app ──────────────────────────────────────────
{
  const page = await freshPage(browser, { viewport: { width: 800, height: 600 } })
  await page.setContent(
    '<div id="d" contenteditable="true" style="width:200px;height:40px;border:1px solid">hi</div><input id="i">'
  )
  const r = await page.evaluate(`(() => {
    const d = document.getElementById('d')
    d.focus()
    const prog = document.activeElement === d
    return { programmatic: prog }
  })()`)
  const clicked = await page.evaluate(`(() => {
    document.getElementById('d').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    document.getElementById('d').focus()
    return document.activeElement === document.getElementById('d')
  })()`)
  console.log('control1 bare page   ', JSON.stringify({ ...r, afterMouseDownFocus: clicked }))
  await page.close()
}

// ── control 2: the live harness ───────────────────────────────────────────
const page = await freshPage(browser, { viewport: { width: 1440, height: 900 } })
await page.goto(url, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3500)

// Inject a bare contenteditable into the live page, outside any app node.
const control2 = await page.evaluate(`(() => {
  const d = document.createElement('div')
  d.id = 'fa-focus-control'
  d.setAttribute('contenteditable', 'true')
  d.textContent = 'control'
  d.style.cssText = 'position:fixed;left:10px;top:10px;width:200px;height:40px;border:1px solid red;z-index:99999'
  document.body.appendChild(d)
  d.focus()
  const ok = document.activeElement === d
  d.remove()
  return { programmatic: ok }
})()`)
console.log('control2 injected ce ', JSON.stringify(control2))

// ── control 3: a plain product input ──────────────────────────────────────
const control3 = await page.evaluate(`(() => {
  const i = document.querySelector('input.zGbnIq_input, input[type="text"], input:not([type])')
  if (i === null) return { found: false }
  i.focus()
  return { found: true, programmatic: document.activeElement === i }
})()`)
console.log('control3 product input', JSON.stringify(control3))

// ── the subject ───────────────────────────────────────────────────────────
const subject = await page.evaluate(`(() => {
  const ed = document.querySelector('[data-lexical-editor]')
  if (ed === null) return { found: false }
  const before = document.activeElement
  ed.focus()
  return {
    found: true,
    programmatic: document.activeElement === ed,
    activeBefore: before === null ? 'null' : before.tagName.toLowerCase(),
    activeAfter: document.activeElement === null ? 'null' : document.activeElement.tagName.toLowerCase(),
    tabIndexProp: ed.tabIndex,
    tabIndexAttr: ed.getAttribute('tabindex'),
    ce: ed.getAttribute('contenteditable'),
    isCE: ed.isContentEditable,
    inert: ed.closest('[inert]') !== null,
    ariaHidden: ed.closest('[aria-hidden="true"]') !== null,
  }
})()`)
console.log('subject composer     ', JSON.stringify(subject, null, 1))

await browser.close()
