import { chromium } from 'playwright-core'
const URL = process.argv[2]
const browser = await chromium.launch({ args: ['--no-sandbox'] })
for (const [tag, opts] of [['en', { locale: 'en-US' }], ['zh', { locale: 'zh-CN' }]]) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, ...opts })
  const page = await context.newPage()
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3200)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3600)
  const dump = async (label) => {
    const r = await page.evaluate(`(() => {
      const root = document.getElementById('root')
      const sidebar = root.querySelector('[data-fa-col="sidebar"]')
      const brand = root.querySelector('[data-slot="sidebar.brand.mark"]')
      const brandBtn = brand && brand.closest('button')
      return {
        drawer: document.body.hasAttribute('data-fa-drawer'),
        collapsed: root.querySelector('[data-fa-frame]').hasAttribute('data-sidebar-collapsed'),
        brandBtnLabel: brandBtn ? brandBtn.getAttribute('aria-label') : null,
        brandBtnBox: brandBtn ? (b => Math.round(b.width) + 'x' + Math.round(b.height) + '@' + Math.round(b.left) + ',' + Math.round(b.top))(brandBtn.getBoundingClientRect()) : null,
        buttons: [...sidebar.querySelectorAll('button')].map(b => {
          const chain = []
          let n = b
          while (n && n !== sidebar) { if (n.hasAttribute('data-slot')) chain.push(n.getAttribute('data-slot')); n = n.parentElement }
          const box = b.getBoundingClientRect()
          return { aria: b.getAttribute('aria-label'), slots: chain.reverse().join('>') || '-', box: Math.round(box.width) + 'x' + Math.round(box.height) + '@' + Math.round(box.left) + ',' + Math.round(box.top) }
        }),
      }
    })()`)
    console.log(`  [${tag}] ${label}:`, JSON.stringify(r, null, 1))
    return r
  }
  await dump('closed / rail')
  // open via the slot hook
  await page.evaluate(`(() => { const m = document.querySelector('#root [data-slot="sidebar.brand.mark"]'); const b = m && m.closest('button'); if (b) b.click() })()`)
  await page.waitForTimeout(1800)
  const opened = await dump('after brand click')
  if (opened.drawer) {
    // try clicking the same button again — does it close?
    await page.evaluate(`(() => { const m = document.querySelector('#root [data-slot="sidebar.brand.mark"]'); const b = m && m.closest('button'); if (b) b.click() })()`)
    await page.waitForTimeout(1800)
    await dump('after second brand click')
  }
  await context.close()
}
await browser.close()
