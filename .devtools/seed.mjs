/**
 * Add a second workspace row and a conversation so the transcript, trajectory
 * and right-panel paths can be audited at all.
 *
 * Nothing here is part of the skin: it drives the product's own UI the way a
 * user would, so the state it produces is a state the app really has.
 */
import { launch } from './lib/chromium.mjs'
import fs from 'node:fs'

const URL = process.argv[2]
const browser = await launch()
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
})
const page = await context.newPage()
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForTimeout(2600)
await page.evaluate(`(() => {
  const want = /^(Continue|继续|Configure later|稍后配置|Skip|跳过)$/
  const b = [...document.querySelectorAll('button')].find((x) => want.test((x.textContent || '').trim()))
  if (b) b.click()
})()`)
await page.waitForTimeout(3000)

// Open a workspace picker and pick anything on offer.
const openedWorkspace = await page.evaluate(`(() => {
  const b = document.querySelector('[data-slot="sidebar.workspaces"] button, [rel="workspace"]')
    || [...document.querySelectorAll('button')].find((x) => /workspace|工作区/i.test(x.getAttribute('aria-label') || ''))
  if (!b) return null
  b.click()
  return (b.getAttribute('aria-label') || b.textContent || '').trim().slice(0, 40)
})()`)
console.log('workspace control:', openedWorkspace)
await page.waitForTimeout(1500)
const menu = await page.evaluate(`(() => {
  const items = [...document.querySelectorAll('[role="menuitem"], [role="option"], [role="dialog"] button')]
    .filter((b) => b.offsetParent !== null)
    .map((b) => (b.textContent || '').trim().slice(0, 40))
  return items
})()`)
console.log('menu items:', JSON.stringify(menu))
await page.screenshot({ path: '/root/.codebuddy/artifact/shots/ws-menu.png' })

// Click the first plausible "add workspace" entry, then accept a default dir.
const picked = await page.evaluate(`(() => {
  const b = [...document.querySelectorAll('[role="menuitem"], [role="option"], [role="dialog"] button')]
    .filter((x) => x.offsetParent !== null)
    .find((x) => /add workspace|添加工作区|add folder|添加文件夹|choose/i.test((x.textContent || '').trim()))
  if (!b) return null
  b.click()
  return (b.textContent || '').trim().slice(0, 40)
})()`)
console.log('picked:', picked)
await page.waitForTimeout(2500)
await page.screenshot({ path: '/root/.codebuddy/artifact/shots/ws-picker.png' })
const afterPicker = await page.evaluate(`({
  dialogs: [...document.querySelectorAll('[role="dialog"]')].map((d) => (d.textContent || '').slice(0, 120)),
  buttons: [...document.querySelectorAll('button')].filter((b) => b.offsetParent !== null).map((b) => (b.textContent || '').trim().slice(0, 32) || b.getAttribute('aria-label')),
})`)
console.log('after picker:', JSON.stringify(afterPicker, null, 1).slice(0, 2000))

fs.writeFileSync('/root/.codebuddy/artifact/shots/ws-state.json', JSON.stringify(afterPicker, null, 2))
await browser.close()
