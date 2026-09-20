import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'
import fs from 'node:fs'
const URL = process.argv[2]
fs.mkdirSync('/tmp/fa-traj', { recursive: true })
const browser = await launch({ args: ['--no-sandbox'] })
for (const [tag, opts] of [['en', { locale: 'en-US' }], ['zh', { locale: 'zh-CN' }]]) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, ...opts })
  const page = await context.newPage()
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3200)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3600)
  // open the drawer via the (broken) dock is unreliable; click the rail control directly
  await page.evaluate(`document.querySelector('#root [aria-label]')`)
  const opened = await page.evaluate(`(() => {
    const root = document.getElementById('root')
    const labels = [...root.querySelectorAll('button[aria-label]')].map(b => b.getAttribute('aria-label'))
    const toggle = root.querySelector('[data-slot="sidebar.brand.mark"]')
    const btn = toggle && toggle.closest('button')
    if (btn) btn.click()
    return { labels, clicked: btn ? btn.getAttribute('aria-label') : null }
  })()`)
  console.log(tag, 'sidebar toggle:', JSON.stringify(opened))
  await page.waitForTimeout(1500)
  await page.locator('body').getByText(tag === 'zh' ? '便携 DSH' : '便携 DSH', { exact: false }).first().click({ timeout: 9000, force: true }).catch(() => {})
  await page.waitForTimeout(9000)
  await page.mouse.click(374, 300)
  await page.waitForTimeout(1500)

  // switch to the Trajectory tab
  const tab = await page.evaluate(`(() => {
    const canvas = document.querySelector('[data-fa-canvas]')
    const tabs = [...canvas.querySelectorAll('button')].filter(b => /Trajectory|轨迹/.test(b.textContent || ''))
    if (tabs[0]) { tabs[0].click(); return tabs[0].textContent.trim() }
    return null
  })()`)
  console.log(tag, 'trajectory tab:', tab)
  await page.waitForTimeout(6000)
  await page.screenshot({ path: `/tmp/fa-traj/${tag}.png` })

  const probe = await page.evaluate(`(() => {
    const scrollers = [...document.querySelectorAll('#root *')].filter(e => e.scrollWidth > e.clientWidth + 4 && e.clientWidth > 100)
    const rows = [...document.querySelectorAll('[data-trajectory-row-key]')].slice(0, 3)
    return {
      horizontalOverflowInside: scrollers.slice(0, 6).map(e => ({
        cls: (typeof e.className === 'string' ? e.className.split(' ')[0].slice(0, 30) : ''),
        data: [...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name).slice(0, 3).join(','),
        scrollW: e.scrollWidth, clientW: e.clientWidth,
        box: (r => Math.round(r.width) + 'x' + Math.round(r.height) + '@' + Math.round(r.left))(e.getBoundingClientRect()),
      })),
      pageOverflowX: document.documentElement.scrollWidth - window.innerWidth,
      trajRows: document.querySelectorAll('[data-trajectory-row-key]').length,
      rowBox: rows.map(r => (b => Math.round(b.width) + 'x' + Math.round(b.height) + '@' + Math.round(b.left) + ',' + Math.round(b.top))(r.getBoundingClientRect())),
      trajScrollBox: (e => e ? (b => Math.round(b.width) + 'x' + Math.round(b.height) + '@' + Math.round(b.left))(e.getBoundingClientRect()) : null)(document.querySelector('[data-trajectory-scroll]')),
      trajScrollWidths: (e => e ? { scrollW: e.scrollWidth, clientW: e.clientWidth } : null)(document.querySelector('[data-trajectory-scroll]')),
    }
  })()`)
  console.log(tag, 'probe:', JSON.stringify(probe, null, 1))
  await context.close()
}
await browser.close()
