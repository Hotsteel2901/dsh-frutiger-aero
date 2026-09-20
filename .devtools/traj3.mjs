import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'
import fs from 'node:fs'
import { openSession, openTab } from './lib/session.mjs'

const URL = process.argv[2]
const OUT = '/tmp/fa-traj3'
fs.mkdirSync(OUT, { recursive: true })
const PROBE = fs.readFileSync('./probes/trajectory.js', 'utf8')
const browser = await launch({ args: ['--no-sandbox'] })

for (const [tag, opts] of [['en', { locale: 'en-US' }], ['zh', { locale: 'zh-CN' }]]) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, ...opts })
  const page = await context.newPage()
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3200)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3600)

  const turns = await openSession(page, '便携 DSH', { mobile: true })
  console.log(tag, 'transcript items:', turns)

  await openTab(page, '/Trajectory|轨迹/')
  await page.screenshot({ path: `${OUT}/${tag}-trajectory.png` })
  const state = await page.evaluate(`({ drawer: document.body.hasAttribute('data-fa-drawer'), rows: document.querySelectorAll('[data-trajectory-row-key]').length })`)
  console.log(tag, 'trajectory state:', JSON.stringify(state))
  console.log(JSON.stringify(await page.evaluate('(' + PROBE + ')()'), null, 1))
  await context.close()
}
await browser.close()
