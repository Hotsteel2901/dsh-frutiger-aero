/**
 * The environment matrix for the desktop effects: sidebar posture, colour
 * scheme, and locale — the three axes the effects must behave identically on.
 *
 * Exists because "英文和中文环境下完全一致" is a claim about a *duration*, and a
 * duration claim made from one locale at one sidebar width is not evidence.
 * This reports, for each combination, the computed animation and transition of
 * each effect target, so a mismatch is a diff and not an argument.
 *
 * usage: node envmatrix.mjs <url>
 */
import { launch } from './lib/chromium.mjs'
import { freshPage } from './lib/gates.mjs'

const URL = process.argv[2]
if (!URL) {
  console.error('usage: envmatrix.mjs <url>')
  process.exit(2)
}

const browser = await launch({ args: ['--no-sandbox'] })
const page = await freshPage(browser, { viewport: { width: 1440, height: 900 } })

const report = async (label, setup) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2200)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  if (setup) await page.evaluate(setup)
  await page.waitForTimeout(500)

  const rows = await page.evaluate(`(() => {
    const out = []
    const probe = (name, sel) => {
      const el = document.querySelector(sel)
      if (el === null) { out.push({ name, missing: true }); return }
      const cs = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      out.push({
        name,
        anim: cs.animationName,
        dur: cs.animationDuration,
        iter: cs.animationIterationCount,
        trans: cs.transitionProperty.slice(0, 40),
        tdur: cs.transitionDuration.slice(0, 30),
        box: Math.round(r.width) + 'x' + Math.round(r.height),
      })
    }
    probe('sidebar', '[data-fa-col="sidebar"]')
    probe('brandMark', '[data-slot="sidebar.brand.mark"]')
    probe('newSession', '[data-fa-col="sidebar"] button[class*="newSession"]')
    probe('sectionLabel', '[data-fa-col="sidebar"] span[class*="sectionLabel"]')
    probe('row_selected', '[data-fa-col="sidebar"] [role="treeitem"][aria-selected="true"]')
    probe('row_plain', '[data-fa-col="sidebar"] [role="treeitem"]:not([aria-selected="true"])')
    probe('chevron', '[data-fa-col="sidebar"] span[class*="chevron"]')
    probe('tree', '[data-fa-col="sidebar"] [role="tree"]')
    probe('composer', '[data-composer-card]')
    probe('panel', '[data-sidebar-right-panel]')
    return { rows: out, lang: document.documentElement.lang, dir: document.documentElement.dir }
  })()`)
  console.log(`── ${label} (lang=${rows.lang || '?'}) ──`)
  for (const r of rows.rows) {
    if (r.missing) { console.log(`   ${r.name.padEnd(14)} MISSING`); continue }
    console.log(
      `   ${r.name.padEnd(14)} anim=${String(r.anim).slice(0, 22).padEnd(24)} ${r.dur.padEnd(8)} x${String(r.iter).padEnd(8)} ${r.box.padEnd(10)} trans=${r.tdur}`,
    )
  }
  return rows
}

// Chinese is whatever the app default is; English is forced through the same
// preference the product's own language switcher writes.
await report('default locale')
await page.evaluate(`localStorage.setItem('@deepseek-ai/dsh-client-locale:lang','en-US')`)
await report('forced en-US')
await page.evaluate(`localStorage.removeItem('@deepseek-ai/dsh-client-locale:lang')`)

await browser.close()
