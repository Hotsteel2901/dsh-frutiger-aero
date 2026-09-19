import { chromium } from 'playwright-core'
const URL = process.argv[2]
const browser = await chromium.launch({ args: ['--no-sandbox'] })
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'zh-CN' })
const page = await context.newPage()
await page.goto(URL, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3200)
await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3600)
// open the drawer so the full sidebar renders
await page.evaluate(`document.querySelector('[data-fa-dock] button[aria-label="Menu"]').click()`)
await page.waitForTimeout(1500)

const r = await page.evaluate(`(() => {
  const root = document.getElementById('root')
  const sidebar = document.querySelector('[data-fa-col="sidebar"]')
  const slots = [...sidebar.querySelectorAll('[data-slot]')].map(e => e.getAttribute('data-slot'))
  // every button in the sidebar, with its enclosing data-slot chain and its labels
  const buttons = [...sidebar.querySelectorAll('button')].map(b => {
    const chain = []
    let n = b
    while (n && n !== sidebar) { if (n.hasAttribute('data-slot')) chain.push(n.getAttribute('data-slot')); n = n.parentElement }
    const r = b.getBoundingClientRect()
    return {
      slot: chain.reverse().join(' > ') || '(none)',
      aria: b.getAttribute('aria-label'),
      dataAttrs: [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name).join(','),
      box: Math.round(r.width) + 'x' + Math.round(r.height) + '@' + Math.round(r.left) + ',' + Math.round(r.top),
      visible: b.offsetParent !== null,
      title: b.getAttribute('title'),
    }
  })
  return {
    slots: [...new Set(slots)],
    buttons,
    brandMarkSlotButton: (() => { const m = sidebar.querySelector('[data-slot="sidebar.brand.mark"]'); const b = m && m.closest('button'); return b ? (b.getAttribute('aria-label') || '(no label)') : null })(),
    dockInsideRoot: !!(document.querySelector('[data-fa-dock]') && root.contains(document.querySelector('[data-fa-dock]'))),
    dockParent: document.querySelector('[data-fa-dock]').parentElement.tagName,
    dialogsInRoot: document.querySelectorAll('#root [role="dialog"]').length,
  }
})()`)
console.log(JSON.stringify(r, null, 1))
await browser.close()
