import { launch } from './lib/chromium.mjs'
import fs from 'node:fs'
import { openSession } from './lib/session.mjs'

const URL = process.argv[2]
const PROBE = fs.readFileSync('./probes/alignment.js', 'utf8')
const browser = await launch({ args: ['--no-sandbox'] })

for (const [tag, opts] of [['zh-CN', { locale: 'zh-CN' }], ['en-US', { locale: 'en-US' }]]) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, ...opts })
  const page = await context.newPage()
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3200)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3600)
  await openSession(page, '便携 DSH', { mobile: true })
  await page.waitForTimeout(1500)

  for (const [where, prep] of [
    ['chat', async () => {}],
    ['drawer', async () => { await page.evaluate(`(() => { const r = document.getElementById('root'); const el = ['Open sidebar','打开侧边栏'].map(n => r.querySelector('[aria-label=' + JSON.stringify(n) + ']')).find(Boolean); if (el) el.click() })()`); await page.waitForTimeout(1600) }],
  ]) {
    await prep()
    const r = await page.evaluate('(' + PROBE + ')()')
    console.log(`\n### ${tag} / ${where}`)
    console.log('  off-centre:', r.offCentre.length)
    for (const o of r.offCentre) console.log(`    dx=${String(o.dx).padStart(6)} dy=${String(o.dy).padStart(6)}  ${o.box.padEnd(22)} ${JSON.stringify(o.label)}  ${o.where}`)
    console.log('  clipped:', r.clipped.length)
    for (const c of r.clipped) console.log(`    ${c.scrollW}x${c.scrollH} in ${c.clientW}x${c.clientH}  ${JSON.stringify(c.label)}  ${c.where}`)
    if (r.overlaps.length) { console.log('  overlaps:'); for (const o of r.overlaps) console.log('   ', JSON.stringify(o)) }
    await page.screenshot({ path: `/tmp/fa-align-${tag}-${where}.png` })
  }
  await context.close()
}
await browser.close()
