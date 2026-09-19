import { chromium } from 'playwright-core'
const URL = process.argv[2]
const browser = await chromium.launch({ args: ['--no-sandbox'] })
for (const [name, viewport, mobile] of [['phone', { width: 390, height: 844 }, true], ['desktop', { width: 1440, height: 900 }, false]]) {
  const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile })
  const page = await context.newPage()
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3200)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3400)
  if (mobile) { await page.locator('[data-fa-dock] button[aria-label="Menu"]').click({ timeout: 5000, force: true }); await page.waitForTimeout(1200) }
  await page.locator('body').getByText('便携 DSH', { exact: false }).first().click({ timeout: 8000, force: true }).catch(()=>{})
  await page.waitForTimeout(8000)
  if (mobile) { await page.mouse.click(367, 300); await page.waitForTimeout(2200) }
  const r = await page.evaluate(`(() => {
    const rows = [...document.querySelectorAll('[data-chat-flow-kind]')].filter(el => { const b = el.getBoundingClientRect(); return b.height > 0 && b.top > 100 && b.bottom < window.innerHeight - 150 })
    return rows.slice(0, 8).map(row => {
      const b = row.getBoundingClientRect()
      const spans = [...row.querySelectorAll('*')].filter(e => e.children.length === 0 && (e.textContent||'').trim().length > 1)
      const colors = spans.map(s => { const c = getComputedStyle(s); return c.color + ' / op ' + c.opacity }).slice(0, 3)
      let p = row, effective = 1
      while (p && p !== document.body) { effective *= parseFloat(getComputedStyle(p).opacity); p = p.parentElement }
      return { kind: row.getAttribute('data-chat-flow-kind'), y: Math.round(b.top), h: Math.round(b.height), colors, effectiveOpacity: effective.toFixed(3), text: (row.textContent||'').trim().slice(0, 26) }
    })
  })()`)
  console.log('###', name)
  for (const x of r) console.log('  ', JSON.stringify(x))
  await context.close()
}
await browser.close()
