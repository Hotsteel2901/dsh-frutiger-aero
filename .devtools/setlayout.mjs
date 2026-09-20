import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'
import fs from 'node:fs'
import { openSession } from './lib/session.mjs'
const URL = process.argv[2]
const PROBE = fs.readFileSync('./probes/settings-layout.js', 'utf8')
const browser = await launch({ args: ['--no-sandbox'] })
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'zh-CN' })
const page = await context.newPage()
await page.goto(URL, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3200)
await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3600)
await openSession(page, '便携 DSH', { mobile: true })
// open the drawer (so the dialog mounts visibly) then the settings surface
await page.evaluate(`(() => { const r = document.getElementById('root'); const el = ['Open sidebar','打开侧边栏'].map(n => r.querySelector('[aria-label=' + JSON.stringify(n) + ']')).find(Boolean); if (el) el.click() })()`)
await page.waitForTimeout(1600)
await page.evaluate(`(() => { const r = document.getElementById('root'); const el = ['Settings','设置'].map(n => r.querySelector('[aria-label=' + JSON.stringify(n) + ']')).find(Boolean); if (el) el.click() })()`)
await page.waitForTimeout(2600)
const r = await page.evaluate('(' + PROBE + ')()')
fs.writeFileSync('/tmp/fa-settings-layout.json', JSON.stringify(r, null, 1))
console.log('viewport:', r.viewport)
console.log('dialog:', JSON.stringify(r.dialog))
console.log('\n--- first level ---')
for (const f of r.firstLevel || []) {
  console.log(' ', f.self.tag + '.' + f.self.cls, f.self.display, f.self.box, 'flex=' + f.self.flexDirection, 'grid=' + f.self.gridTemplate)
  for (const k of f.children) console.log('     ', k.tag + '.' + k.cls, k.display, k.box, 'buttons=' + k.buttons)
}
console.log('\n--- outline ---')
for (const n of r.outline) console.log(`  ${'  '.repeat(n.depth)}${n.tag}.${n.cls}${n.role ? '[' + n.role + ']' : ''} ${n.display}${n.flexDirection !== 'row' ? ' flex=' + n.flexDirection : ''}${n.gridTemplate ? ' grid=' + n.gridTemplate : ''} ${n.box} ${n.data ? n.data : ''} ${n.text ? JSON.stringify(n.text) : ''}`)
await browser.close()
