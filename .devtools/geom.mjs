import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'
const [url, tag, mobileArg] = process.argv.slice(2)
const mobile = mobileArg === 'mobile'
const browser = await launch({ args: ['--no-sandbox'] })
const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile, hasTouch: mobile })
const page = await context.newPage()
await page.goto(url, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3500)
if (mobile) {
  const rail = page.locator('[aria-label="Open sidebar"]')
  if (await rail.count() && await rail.first().isVisible().catch(()=>false)) await rail.first().click({ force: true }).catch(()=>{})
  else { const d = page.locator('[data-fa-dock] button[aria-label="Menu"]'); if (await d.count()) await d.click({ force: true }).catch(()=>{}) }
  await page.waitForTimeout(800)
}
await page.locator('body').getByText('便携 DSH', { exact: false }).first().click({ timeout: 6000, force: true }).catch(()=>{})
await page.waitForTimeout(7000)
if (mobile) { await page.mouse.click(370, 300); await page.waitForTimeout(1200) }
const dump = await page.evaluate(`(() => {
  const rows = [...document.querySelectorAll('[data-chat-flow-kind]')]
  const target = rows.find(r => r.querySelector('svg, [data-role-icon], span'))
  if (!target) return { note: 'no rows', rows: rows.length }
  const walk = (el, depth) => {
    if (depth > 4) return []
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    const out = [{ d: depth, tag: el.tagName.toLowerCase(), cls: (typeof el.className === 'string' ? el.className.split(/\\s+/)[0] : ''), box: Math.round(r.width)+'x'+Math.round(r.height)+'@'+Math.round(r.left), pos: cs.position, ov: cs.overflow, disp: cs.display, w: cs.width, maxw: cs.maxWidth, ml: cs.marginLeft }]
    for (const c of el.children) out.push(...walk(c, depth + 1))
    return out
  }
  const idx = rows.indexOf(target)
  return {
    rows: rows.length, idx,
    kind: target.getAttribute('data-chat-flow-kind'),
    scroll: (s => s ? { box: Math.round(s.getBoundingClientRect().width)+'x'+Math.round(s.getBoundingClientRect().height), scrollTop: Math.round(s.scrollTop), scrollHeight: s.scrollHeight, cw: getComputedStyle(s).getPropertyValue('--dsh-chat-content-width') } : null)(document.querySelector('[data-conversation-scroll]')),
    tree: walk(target, 0),
  }
})()`)
console.log('###', tag)
console.log(JSON.stringify(dump, null, 1).slice(0, 4000))
await page.screenshot({ path: `/tmp/fa-dbg/geom-${tag}.png` })
await browser.close()
