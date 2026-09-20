/**
 * Read the *live* value of the tokens the skin overrides.
 *
 * This exists because a contrast probe returning "0 failures" is ambiguous:
 * a correctly-fixed palette and a bundle that never reloaded both produce it.
 * Reading the computed custom properties off `<body>` distinguishes the two,
 * and it is the check that caught two earlier false conclusions in this repo
 * (a "stale bundle" theory that was wrong, and a "grid artefact" theory that
 * was also wrong).
 *
 * usage: node tokens.mjs <url> [token ...]
 */
import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'

const TARGET = process.argv[2]
const WANTED = process.argv.slice(3)

/** Every alias the skin overrides that carries text, plus the accent ramp. */
const DEFAULT_TOKENS = [
  '--dsw-alias-label-primary',
  '--dsw-alias-label-secondary',
  '--dsw-alias-label-tertiary',
  '--dsw-alias-label-caption',
  '--dsw-alias-label-dimmed',
  '--dsw-alias-label-primary-bluish',
  '--dsw-alias-link',
  '--dsw-alias-brand-primary',
  '--dsw-alias-brand-text',
  '--dsw-alias-state-business-primary',
  '--dsw-alias-button-primary-fill',
  '--dsw-alias-button-primary-hover',
  '--dsw-alias-button-info-fill',
  '--dsw-static-deepseek-500',
  '--dsw-static-deepseek-600',
]

const tokens = WANTED.length > 0 ? WANTED : DEFAULT_TOKENS

const browser = await launch()
const page = await freshPage(browser, {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})
await enter(page, TARGET, { settle: 3000 })

// Read off both `<body>` (where the theme service writes inline) and the root
// element, because a value present on only one of them means the fallback
// stylesheet and the runtime snapshot have drifted apart.
const expr = `(() => {
  const names = ${JSON.stringify(tokens)}
  const body = getComputedStyle(document.body)
  const root = getComputedStyle(document.documentElement)
  const out = []
  for (const n of names) {
    out.push({ name: n, body: body.getPropertyValue(n).trim(), root: root.getPropertyValue(n).trim() })
  }
  return { dark: document.body.hasAttribute('data-ds-dark-theme'), values: out }
})()`

const report = await page.evaluate(expr)

console.log(`scheme: ${report.dark ? 'dark' : 'light'}`)
const width = Math.max(...report.values.map((v) => v.name.length))
for (const v of report.values) {
  const drift = v.body !== v.root ? `  !! root=${v.root}` : ''
  console.log(`  ${v.name.padEnd(width)}  ${v.body || '(unset)'}${drift}`)
}

const unset = report.values.filter((v) => v.body === '')
if (unset.length > 0) {
  console.log(`\n${unset.length} token(s) unset: ${unset.map((v) => v.name).join(', ')}`)
}
const drifted = report.values.filter((v) => v.body !== v.root)
if (drifted.length > 0) console.log(`\n${drifted.length} token(s) differ between body and root`)

await browser.close()
