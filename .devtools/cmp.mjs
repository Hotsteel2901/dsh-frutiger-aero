import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'
const [base, after] = process.argv.slice(2)
const browser = await launch({ args: ['--no-sandbox'] })
const PROBE = `(() => {
  const t = document.querySelector('[data-conversation-scroll]')
  const flow = document.querySelector('[data-chat-flow]')
  const row = document.querySelector('[data-chat-flow-kind]')
  const vv = getComputedStyle(document.documentElement)
  return {
    win: window.innerWidth + 'x' + window.innerHeight,
    colWidthVar: vv.getPropertyValue('--dsh-conversation-column-width'),
    transcript: t ? Math.round(t.getBoundingClientRect().width) : null,
    flowBox: flow ? (r=>Math.round(r.width)+'x'+Math.round(r.height)+'@'+Math.round(r.left))(flow.getBoundingClientRect()) : null,
    rowBox: row ? (r=>Math.round(r.width)+'x'+Math.round(r.height)+'@'+Math.round(r.left))(row.getBoundingClientRect()) : null,
    contentWidth: flow ? getComputedStyle(flow).getPropertyValue('--dsh-chat-content-width') : null,
    turns: document.querySelectorAll('[data-chat-flow-kind]').length,
  }
})()`
for (const [tag, url] of [['baseline', base], ['frutiger', after]]) {
  for (const [vp, mobile] of [['phone', true], ['desktop', false]]) {
    const context = await browser.newContext({ viewport: vp === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile, hasTouch: mobile })
    const page = await context.newPage()
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(4000)
    if (mobile) {
      // baseline has a rail, frutiger has a dock — open the drawer whichever way works
      const rail = page.locator('[aria-label="Open sidebar"]')
      if (await rail.count() && await rail.first().isVisible().catch(() => false)) await rail.first().click({ force: true }).catch(() => {})
      else {
        const dock = page.locator('[data-fa-dock] button[aria-label="Menu"]')
        if (await dock.count()) await dock.click({ force: true }).catch(() => {})
      }
      await page.waitForTimeout(900)
    }
    const loc = page.locator('body').getByText('便携 DSH', { exact: false }).first()
    await loc.click({ timeout: 6000, force: true }).catch(() => {})
    await page.waitForTimeout(7000)
    if (mobile) { await page.keyboard.press('Escape'); await page.mouse.click(vp === 'phone' ? 370 : 1200, 400); await page.waitForTimeout(1200) }
    console.log(tag, vp, JSON.stringify(await page.evaluate(PROBE)))
    await page.screenshot({ path: `/tmp/fa-dbg/${tag}-${vp}.png` })
    await context.close()
  }
}
await browser.close()
