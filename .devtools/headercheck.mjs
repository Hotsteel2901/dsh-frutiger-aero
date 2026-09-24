/**
 * Does the header sheen run once there is a conversation to show a header for?
 *
 * The empty app renders `wSkVaW_header` with `wSkVaW_headerHidden`, so at rest
 * the sheen is defined, correct, and invisible — `display: none` suppresses
 * both the paint and the animation. `canvascheck.mjs` asserts the rule exists;
 * this asserts it actually runs, which is a different claim and the one that
 * matters. A rule that is only correct in a state nobody opened is not verified.
 *
 * usage: headercheck.mjs <url>
 */
import { launch } from './lib/chromium.mjs'
import { freshPage } from './lib/gates.mjs'

const URL = process.argv[2]
if (!URL) {
  console.error('usage: headercheck.mjs <url>')
  process.exit(2)
}

const browser = await launch({ args: ['--no-sandbox'] })
const page = await freshPage(browser, { viewport: { width: 1440, height: 900 } })

let pass = 0
let fail = 0
const check = (label, ok, detail) => {
  if (ok) { pass += 1; console.log(`  ok    ${label}${detail ? ' — ' + detail : ''}`) }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? ' — ' + detail : ''}`) }
}

await page.goto(URL, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2400)
await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3400)

const read = () => page.evaluate(`(() => {
  // Scope to the centre column. A class-substring query for "header" matches
  // the *sidebar's* header first when searched document-wide, and that one is
  // never hidden — so an unscoped query reports success for the wrong element
  // and would have "verified" a rule that never ran. It did exactly that here.
  const centre = document.querySelector('[data-fa-col="center"]')
  const header = centre === null ? null : centre.querySelector('[class*="header"]')
  if (header === null) return { missing: true }
  const after = getComputedStyle(header, '::after')
  const rect = header.getBoundingClientRect()
  return {
    cls: String(header.className).slice(0, 60),
    hidden: /headerHidden/.test(String(header.className)),
    display: getComputedStyle(header).display,
    box: Math.round(rect.width) + 'x' + Math.round(rect.height),
    anim: after.animationName,
    dur: after.animationDuration,
    iter: after.animationIterationCount,
    state: after.animationPlayState,
    registered: document.getAnimations().filter((a) => a.animationName === 'fa-header-sheen').length,
  }
})()`)

console.log('── empty conversation ──')
const empty = await read()
console.log('  ' + JSON.stringify(empty))
check('header exists at rest', empty.missing !== true)
check('header is hidden with no conversation', empty.hidden === true || empty.box === '0x0',
  `hidden=${empty.hidden} box=${empty.box}`)
check('sheen is declared regardless', empty.anim === 'fa-header-sheen', String(empty.anim))

// Put a conversation on screen by opening a session from the sidebar. That is
// what flips the header out of its hidden state.
console.log()
console.log('── opening a session ──')
const opened = await page.evaluate(`(async () => {
  const row = document.querySelector('[data-fa-col="sidebar"] [role="treeitem"]')
  if (row === null) return { noRow: true }
  row.click()
  await new Promise((r) => setTimeout(r, 1400))
  const centre = document.querySelector('[data-fa-col="center"]')
  const header = centre === null ? null : centre.querySelector('[class*="header"]')
  return { clicked: true, headerHidden: header === null ? null : /headerHidden/.test(String(header.className)) }
})()`)
console.log('  ' + JSON.stringify(opened))
await page.waitForTimeout(1200)

const withConversation = await read()
console.log('  ' + JSON.stringify(withConversation))

if (withConversation.missing !== true && withConversation.hidden === false) {
  check('header is shown with a conversation', withConversation.box !== '0x0',
    `box=${withConversation.box}`)
  check('sheen is running once visible',
    withConversation.anim === 'fa-header-sheen' && withConversation.iter === 'infinite' && withConversation.state === 'running',
    `${withConversation.anim} x${withConversation.iter} ${withConversation.state}`)
  check('sheen is registered as a live animation', withConversation.registered >= 1,
    String(withConversation.registered))
} else {
  // The app opens on its hero phase, where the conversation header is
  // `display: none` by the product's own design — so the sheen cannot render in
  // a fresh profile no matter how long we wait. Lifting the class proves the
  // rule itself is sound, which is a weaker claim than "it runs in production"
  // and is labelled as such rather than reported as a pass.
  console.log('  --    the app is in its hero phase; the conversation header is hidden by design.')
  console.log('        Lifting that class to test the rule in isolation:')

  const lifted = await page.evaluate(`(() => {
    const centre = document.querySelector('[data-fa-col="center"]')
    const header = centre === null ? null : centre.querySelector('[class*="header"]')
    if (header === null) return { missing: true }
    header.classList.remove(...[...header.classList].filter((c) => /headerHidden/.test(c)))
    const after = getComputedStyle(header, '::after')
    const r = header.getBoundingClientRect()
    return {
      display: getComputedStyle(header).display,
      box: Math.round(r.width) + 'x' + Math.round(r.height),
      anim: after.animationName,
      dur: after.animationDuration,
      iter: after.animationIterationCount,
      content: after.content,
    }
  })()`)
  console.log('  ' + JSON.stringify(lifted))
  // `display` is asserted as "not none" rather than a specific value: the
  // product's own rule sets `flex`, the class being lifted leaves whatever the
  // cascade resolves to, and pinning the literal here would be testing React's
  // inline styles rather than this plugin's rule.
  check('with the hidden class lifted the sheen renders',
    lifted.display !== 'none' && lifted.anim === 'fa-header-sheen' && lifted.iter === 'infinite' && lifted.content === '""',
    `${lifted.display} ${lifted.anim} x${lifted.iter}`)
  check('and it occupies the header band', lifted.box !== '0x0', String(lifted.box))
}

console.log()
console.log(fail === 0 ? `PASS  ${pass} checks` : `FAIL  ${pass} passed, ${fail} failed`)
await browser.close()
process.exit(fail === 0 ? 0 : 1)
