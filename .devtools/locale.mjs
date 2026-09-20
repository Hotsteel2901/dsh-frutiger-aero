import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'
const URL = process.argv[2]
const browser = await launch({ args: ['--no-sandbox'] })

for (const [tag, opts] of [
  ['en-US', { locale: 'en-US' }],
  ['zh-CN', { locale: 'zh-CN' }],
]) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, ...opts,
  })
  const page = await context.newPage()
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3200)
  await page.evaluate(`localStorage.setItem('frutiger-aero:effects','full')`)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3600)

  const r = await page.evaluate(`(() => {
    const dock = document.querySelector('[data-fa-dock]')
    const buttons = dock ? [...dock.querySelectorAll('button')] : []
    return {
      navLang: navigator.language,
      dockButtons: buttons.map(b => b.getAttribute('aria-label') + (b.hasAttribute('hidden') ? ' [HIDDEN]' : '')),
      dockBox: dock ? (x => Math.round(x.width)+'x'+Math.round(x.height)+'@'+Math.round(x.left)+','+Math.round(x.top))(dock.getBoundingClientRect()) : null,
      // which of the targets the dock resolves actually exist in the DOM?
      targets: {
        openSidebar: document.querySelectorAll('[aria-label="Open sidebar"]').length,
        collapseSidebar: document.querySelectorAll('[aria-label="Collapse sidebar"]').length,
        newSession: document.querySelectorAll('[aria-label="New session"]').length,
        search: document.querySelectorAll('[aria-label="Search sessions"]').length,
        workspace: document.querySelectorAll('[aria-label="Add workspace"]').length,
        settings: document.querySelectorAll('[aria-label="Settings"]').length,
      },
      // what labels ARE present in the sidebar?
      sidebarLabels: [...document.querySelectorAll('[data-fa-col="sidebar"] [aria-label]')].map(e => e.getAttribute('aria-label')).slice(0, 14),
      htmlLang: document.documentElement.lang,
    }
  })()`)
  console.log('###', tag, JSON.stringify(r, null, 1))

  // Does tapping the dock actually do anything?
  const before = await page.evaluate(`document.body.hasAttribute('data-fa-drawer')`)
  const settingsBtn = page.locator('[data-fa-dock] button[aria-label="Settings"]')
  if (await settingsBtn.count()) {
    const b = await settingsBtn.boundingBox()
    if (b) await page.touchscreen.tap(Math.round(b.x + b.width / 2), Math.round(b.y + b.height / 2))
    await page.waitForTimeout(1800)
  }
  const after = await page.evaluate(`({ drawer: document.body.hasAttribute('data-fa-drawer'), dialogs: document.querySelectorAll('[role="dialog"]').length })`)
  console.log('   settings tap:', JSON.stringify({ beforeDrawer: before, ...after }))
  await page.screenshot({ path: `/tmp/fa-locale-${tag}.png` })
  await context.close()
}
await browser.close()
