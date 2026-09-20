import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'
const URL = process.argv[2]
const browser = await launch({ args: ['--no-sandbox'] })

const openSession = async (page, mobile, viewport) => {
  if (mobile) {
    const dock = page.locator('[data-fa-dock] button[aria-label="Menu"]')
    if (await dock.count() && await dock.isVisible().catch(()=>false)) await dock.click({ force: true })
    else { const rail = page.locator('[aria-label="Open sidebar"]'); if (await rail.count()) await rail.first().click({ force: true }) }
    await page.waitForTimeout(1100)
  }
  await page.locator('body').getByText('便携 DSH', { exact: false }).first().click({ timeout: 8000, force: true }).catch(()=>{})
  await page.waitForTimeout(8000)
  if (mobile) { await page.mouse.click(Math.round(viewport.width * 0.94), 300); await page.waitForTimeout(1800) }
}

for (const [name, viewport, mobile] of [['phone', { width: 390, height: 844 }, true], ['desktop', { width: 1440, height: 900 }, false]]) {
  const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile })
  const page = await context.newPage()
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3200)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3400)
  await openSession(page, mobile, viewport)
  const r = await page.evaluate(`(() => {
    const H = window.innerHeight, W = window.innerWidth
    const pts = []
    for (const [label, x, y] of [['transcript-upper', Math.round(W/2), Math.round(H*0.25)], ['transcript-mid', Math.round(W/2), Math.round(H*0.45)], ['composer', Math.round(W/2), Math.round(H*0.83)], ['header', W-40, 20], ['tabs', 60, 80]]) {
      const el = document.elementFromPoint(x, y)
      const chain = []
      let n = el
      while (n && n !== document.body && chain.length < 6) { chain.push(n.tagName.toLowerCase() + (typeof n.className === 'string' && n.className ? '.' + n.className.split(' ')[0].slice(0, 22) : '') + (n.hasAttribute('data-fa-col') ? '[' + n.getAttribute('data-fa-col') + ']' : '')); n = n.parentElement }
      pts.push({ label, at: x + ',' + y, top: el ? el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.split(' ')[0].slice(0, 26) : '') : null, chain: chain.join(' < ') })
    }
    // what would a tap on a transcript row actually reach?
    const row = [...document.querySelectorAll('[data-chat-flow-kind]')].find(el => { const b = el.getBoundingClientRect(); return b.height > 20 && b.top > 150 && b.bottom < H - 200 })
    const rowHit = row ? (() => { const b = row.getBoundingClientRect(); const el = document.elementFromPoint(b.left + b.width/2, b.top + b.height/2); return { row: row.getAttribute('data-chat-flow-kind'), rowBox: Math.round(b.width)+'x'+Math.round(b.height)+'@'+Math.round(b.left)+','+Math.round(b.top), topAtRowCentre: el ? el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.split(' ')[0].slice(0, 30) : '') : null } })() : null
    return { pts, rowHit }
  })()`)
  console.log('###', name)
  for (const p of r.pts) console.log('  ', p.label.padEnd(18), p.top, '|', p.chain)
  if (r.rowHit) console.log('   rowHit:', JSON.stringify(r.rowHit))
  await context.close()
}
await browser.close()
