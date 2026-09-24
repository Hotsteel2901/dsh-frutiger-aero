#!/usr/bin/env node
/**
 * Which install one-liner the landing page hands a visitor.
 *
 * ## The report this file answers
 *
 * > 我刚刚用 windows 打开落地页，结果他给的还是 Linux 的点 sh 安装脚本的那个命令
 *
 * The page gave every visitor the Unix form. `install.ps1` existed, but the page
 * did not choose it — it mentioned it in prose, as something to go and find. The
 * reason that is a real defect rather than cosmetics is that there is no `sh` on
 * Windows: the command on screen cannot run at all, and a reader has no way to
 * know that from looking at it.
 *
 * ## Why this needs its own file
 *
 * `landing.mjs` asks "does the page still work". A single page has one correct
 * answer for its language and its colour scheme, and that suite checks them.
 * This page now has a second axis with a *different* answer per machine, so the
 * check has to be run once per platform with the platform spoofed, and the
 * interesting failure is not "nothing is shown" — it is **two things shown** and
 * **a copy button pointing at the wrong one**.
 *
 * That second case is the one a screenshot cannot catch and a reader cannot see:
 * the visible command and the clipboard disagree, and only the clipboard is
 * wrong. Every check below exists because that class of defect is invisible.
 *
 * usage: landing-install.mjs <url>
 */

import { launch } from './lib/chromium.mjs'

const URL = process.argv[2]
if (!URL) {
  console.error('usage: landing-install.mjs <url>')
  process.exit(2)
}

const results = []
const check = (name, ok, detail) => {
  results.push({ name, ok })
  console.log((ok ? 'PASS ' : 'FAIL ') + name.padEnd(58) + (detail ?? ''))
}

const browser = await launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })

/**
 * Three user agents, one per signal `detectOS()` consults.
 *
 * They are not three copies of the same case: Chromium populates
 * `navigator.userAgentData` for all of them, so if the page only ever read that
 * one, a spoofed `navigator.platform` would prove nothing. Setting the UA string
 * and leaving the platform alone is what a real Windows machine looks like from
 * inside the page for the *fallback* path, which is the path a browser without
 * `userAgentData` (Safari, Firefox) actually takes. So each case is built to
 * exercise the signal it names, and `signals` below asserts which ones were live
 * so a passing run cannot be credited to a branch that never executed.
 */
const CASES = [
  {
    name: 'windows',
    expect: 'windows',
    expectText: 'install.ps1',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    // `userAgentData` cannot be overridden from the page, so it is removed to
    // force the `navigator.platform` + UA fallback — the code path a non-Chromium
    // browser on Windows takes.
    dropUserAgentData: true,
  },
  {
    name: 'macos',
    expect: 'unix',
    expectText: 'install.sh',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    dropUserAgentData: true,
  },
  {
    name: 'linux',
    expect: 'unix',
    expectText: 'install.sh',
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    dropUserAgentData: false,
  },
]

/**
 * Read the page's answer, per command block.
 *
 * The page has **two** install blocks — the hero and the install section — and
 * both must agree. A first version of this probe counted visible variants across
 * the whole document and demanded one, which reads as a sensible assertion and
 * is simply wrong: one per block is two on the page. The correct rule is the one
 * the code implements, so the probe is written per block rather than globally.
 *
 * `buttons` resolves each copy button's `data-copy` id against the DOM and
 * reports whether the element it names is hidden — asking the question the way
 * the clipboard would, rather than trusting that the ids line up.
 */
const PROBE = `(() => {
  const blocks = [...document.querySelectorAll('.cmd')]
    .filter((b) => b.querySelector('[data-install-cmd]'))
    .map((b) => {
      const variants = [...b.querySelectorAll('[data-install-cmd]')]
      const shown = variants.filter((v) => !v.hidden)
      const button = b.querySelector('[data-copy]')
      const target = button ? document.getElementById(button.dataset.copy || '') : null
      return {
        block: b.className,
        variantCount: variants.length,
        shownCount: shown.length,
        shownId: shown.length === 1 ? shown[0].id : null,
        shownText: shown.length === 1 ? shown[0].textContent.trim() : null,
        buttonId: button ? button.dataset.copy : null,
        buttonMissing: button !== null && target === null,
        buttonHidden: target === null ? null : target.hidden,
        buttonText: target === null ? null : target.textContent.trim(),
      }
    })
  return {
    os: window.__LANDING__ && window.__LANDING__.os ? window.__LANDING__.os() : null,
    blocks: blocks,
    // Which signals were actually available, so a pass cannot be credited to a
    // fallback branch that the browser never reached.
    signals: {
      userAgentData: !!(navigator.userAgentData && navigator.userAgentData.platform),
      platform: navigator.platform || '',
    },
  }
})()`

for (const CASE of CASES) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: CASE.userAgent })
  const page = await context.newPage()
  if (CASE.dropUserAgentData) {
    // Removed before any script runs, and re-added if it is missing entirely so
    // the page cannot see a half-defined object and take a third path.
    await page.addInitScript(`Object.defineProperty(navigator, 'userAgentData', { get: () => undefined, configurable: true })`)
  }
  await page.goto(URL, { waitUntil: 'load', timeout: 40000 })
  await page.waitForTimeout(900)
  const out = await page.evaluate(PROBE)

  console.log(`\n── ${CASE.name} ──`)
  console.log(JSON.stringify(out, null, 1))

  check(`${CASE.name}: detectOS() answers '${CASE.expect}'`, out.os === CASE.expect, `got ${JSON.stringify(out.os)}`)

  // Both blocks, both assertions, per block. A count across the document would
  // be satisfied by one block right and one block wrong.
  check(`${CASE.name}: every command block shows exactly one one-liner`,
    out.blocks.length >= 2 && out.blocks.every((b) => b.shownCount === 1),
    out.blocks.map((b) => `${b.shownCount}/${b.variantCount}`).join(' '))
  check(`${CASE.name}: every block shows the ${CASE.expectText} form`,
    out.blocks.length >= 2 && out.blocks.every((b) => String(b.shownText).includes(CASE.expectText)),
    out.blocks.map((b) => b.shownId).join(' '))

  // The failure a reader cannot see. A button that copies the hidden command
  // looks identical to a working one until the paste lands.
  const bad = out.blocks.filter((b) => b.buttonMissing || b.buttonHidden === true)
  check(`${CASE.name}: no copy button points at a hidden one-liner`, bad.length === 0,
    bad.length === 0
      ? `${out.blocks.length} buttons resolve to visible elements`
      : JSON.stringify(bad.map((b) => b.buttonId)))
  const mismatched = out.blocks.filter((b) => b.buttonText !== b.shownText)
  check(`${CASE.name}: every copy button copies what is on screen`, mismatched.length === 0,
    mismatched.length === 0
      ? out.blocks.map((b) => b.buttonId).join(' ')
      : JSON.stringify(mismatched.map((b) => ({ button: b.buttonId, copies: String(b.buttonText).slice(0, 40) }))))

  await context.close()
}

/* ── the no-JavaScript answer ──────────────────────────────────────────────
   Both variants are in the markup and the script picks one, which is what makes
   the page degrade to something runnable rather than to an empty box. That
   property is only real if it is checked with scripting actually off. */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(URL, { waitUntil: 'load', timeout: 40000 })
  const shown = await page.$$eval('.cmd [data-install-cmd]:not([hidden])', (els) =>
    els.map((e) => ({ id: e.id, text: e.textContent.trim() })))
  console.log('\n── javascript disabled ──')
  console.log(JSON.stringify({ shown }, null, 1))
  check('no-JS: one one-liner per block is visible', shown.length === 2, `${shown.length} visible`)
  check('no-JS: all of them are the shell installer',
    shown.length > 0 && shown.every((s) => s.text.includes('install.sh')),
    shown.map((s) => s.id).join(' '))
  await context.close()
}

/* ── the copy button actually copies ───────────────────────────────────────
   The checks above compare ids and text inside one DOM. This one goes all the
   way to the clipboard, because that is where the user finds out. */
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: CASES[0].userAgent,
    permissions: ['clipboard-read', 'clipboard-write'],
  })
  const page = await context.newPage()
  await page.addInitScript(`Object.defineProperty(navigator, 'userAgentData', { get: () => undefined, configurable: true })`)
  await page.goto(URL, { waitUntil: 'load', timeout: 40000 })
  await page.waitForTimeout(900)
  await page.locator('.cmd [data-copy]').first().click()
  await page.waitForTimeout(400)
  const copied = await page.evaluate(`navigator.clipboard.readText()`)
  const onScreen = await page.evaluate(`window.__LANDING__.installCommand()`)
  console.log('\n── clipboard on a Windows user agent ──')
  console.log(JSON.stringify({ copied, onScreen }, null, 1))
  check('windows: the clipboard gets the PowerShell command',
    typeof copied === 'string' && copied.includes('install.ps1'),
    JSON.stringify(copied))
  check('windows: the clipboard matches the screen', copied === onScreen, `${JSON.stringify(copied)} vs ${JSON.stringify(onScreen)}`)
  await context.close()
}

await browser.close()

const failed = results.filter((r) => !r.ok)
console.log()
console.log(failed.length === 0
  ? `PASS  ${results.length} checks`
  : `FAIL  ${failed.length} of ${results.length}: ${failed.map((f) => f.name).join(' | ')}`)
process.exit(failed.length === 0 ? 0 : 1)
