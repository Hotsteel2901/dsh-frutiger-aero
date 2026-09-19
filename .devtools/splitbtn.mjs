import { chromium } from 'playwright-core'

/* The chat header's "open in Files" split button, measured with and without the
 * skin. My coarse-pointer rule puts a 44px floor on every button; if the product
 * positions this control's icon against the left edge of a smaller box, forcing
 * the box wider moves nothing but the centring — which is exactly what "按钮
 * 错位" looks like. */
const probe = `(() => {
  const out = []
  for (const b of document.querySelectorAll('#root button')) {
    const label = (b.getAttribute('aria-label') || '').trim()
    if (!/Files|app to open|工作区|打开方式|在文件|应用/.test(label)) continue
    const box = b.getBoundingClientRect()
    const cs = getComputedStyle(b)
    // where does the button actually paint? union of its children
    const kids = [...b.children].filter((c) => c.getBoundingClientRect().width > 0)
    const painted = kids.length
      ? kids.reduce((a, c) => { const r = c.getBoundingClientRect(); return { l: Math.min(a.l, r.left), r: Math.max(a.r, r.right) } }, { l: Infinity, r: -Infinity })
      : { l: box.left, r: box.right }
    out.push({
      label,
      box: Math.round(box.width) + 'x' + Math.round(box.height),
      minWidth: cs.minWidth,
      justify: cs.justifyContent,
      display: cs.display,
      padding: cs.padding,
      paintedCentreOffset: Math.round(((painted.l + painted.r) / 2 - (box.left + box.right) / 2) * 10) / 10,
      svgBox: (() => { const s = b.querySelector('svg'); if (!s) return null; const r = s.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height) + '@dx' + (Math.round((r.left - box.left) * 10) / 10) })(),
    })
  }
  return out
})()`

const browser = await chromium.launch({ args: ['--no-sandbox'] })
for (const [tag, url, label] of [
  ['stock   ', process.argv[2], 'Open sidebar'],
  ['frutiger', process.argv[3], '打开侧边栏'],
]) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: tag.includes('stock') ? 'en-US' : 'zh-CN' })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3500)
  const clickLabel = (name) => page.evaluate(`(() => { const el = document.querySelector('[aria-label=' + JSON.stringify(${JSON.stringify(label)}) + ']'); if (el) { el.click(); return true } return false })()`)
  await clickLabel()
  await page.waitForTimeout(1600)
  const s = page.locator('body').getByText('便携 DSH', { exact: false }).first()
  if (await s.count()) await s.click({ timeout: 9000, force: true }).catch(() => {})
  await page.waitForTimeout(9000)
  await page.evaluate(`(() => { const el = document.querySelector('[aria-label="Collapse sidebar"], [aria-label="收起侧边栏"]'); if (el) el.click() })()`)
  await page.waitForTimeout(1500)
  console.log(`### ${tag}`)
  const r = await page.evaluate(probe)
  if (r.length === 0) console.log('   (no matching buttons)')
  for (const b of r) console.log('   ', JSON.stringify(b))
  await context.close()
}
await browser.close()
