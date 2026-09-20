import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'
import fs from 'node:fs'
const URL = process.argv[2]
const OUT = '/tmp/fa-traj2'
fs.mkdirSync(OUT, { recursive: true })
const PROBE = fs.readFileSync('./probes/trajectory.js', 'utf8')
const browser = await launch({ args: ['--no-sandbox'] })

const toggleSidebar = (page) =>
  page.evaluate(`(() => { const m = document.querySelector('#root [data-slot="sidebar.brand.mark"]'); const b = m && m.closest('button'); if (b) { b.click(); return true } return false })()`)

for (const [tag, opts] of [['en', { locale: 'en-US' }], ['zh', { locale: 'zh-CN' }]]) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, ...opts })
  const page = await context.newPage()
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3200)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3600)

  await toggleSidebar(page)
  await page.waitForTimeout(1600)
  await page.locator('body').getByText('便携 DSH', { exact: false }).first().click({ timeout: 9000, force: true }).catch(() => {})
  await page.waitForTimeout(9000)

  // Selecting a session resets the narrow drawer, so decide by state rather
  // than by counting clicks.
  const closeDrawer = async () => {
    if (await page.evaluate(`document.body.hasAttribute('data-fa-drawer')`)) {
      await toggleSidebar(page)
      await page.waitForTimeout(1600)
    }
  }
  await closeDrawer()

  await page.evaluate(`(() => {
    const canvas = document.querySelector('[data-fa-canvas]')
    const tabs = [...canvas.querySelectorAll('button')].filter((b) => /Trajectory|轨迹/.test(b.textContent || ''))
    if (tabs[0]) tabs[0].click()
  })()`)
  await page.waitForTimeout(7000)
  await closeDrawer()
  await page.screenshot({ path: `${OUT}/${tag}-trajectory.png` })
  const state = await page.evaluate(`({ drawer: document.body.hasAttribute('data-fa-drawer'), rows: document.querySelectorAll('[data-trajectory-row-key]').length, tabs: [...document.querySelectorAll('[data-fa-canvas] button')].map(b => (b.textContent || '').trim()).filter(Boolean).slice(0, 6) })`)
  console.log('###', tag, JSON.stringify(state))
  console.log(JSON.stringify(await page.evaluate('(' + PROBE + ')()'), null, 1))
  await context.close()
}
await browser.close()
