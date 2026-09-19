import { chromium } from 'playwright-core'
import fs from 'node:fs'

/* The social preview is rendered from the same design system as the page, in a
   1200x630 frame, rather than composited from a screenshot: text needs a font
   stack, a browser has one, and an image library has whatever happens to be
   installed. The wallpaper is kept — it is the whole point of the card — and
   only the page chrome is hidden. */
const URL = process.argv[2]
const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 })
await page.goto(URL, { waitUntil: 'load' })
await page.waitForTimeout(2200)

await page.evaluate(`(() => {
  document.documentElement.setAttribute('data-lang', 'en')
  document.documentElement.setAttribute('data-scheme', 'light')
  // Hide the page, keep the wallpaper and its bubbles.
  for (const el of document.querySelectorAll('header, main, footer, .skip')) el.style.display = 'none'
  const shot = './assets/shot-desktop-light.webp'
  const phone = './assets/shot-phone-light.webp'
  const card = document.createElement('div')
  card.innerHTML = \`
    <div style="position:fixed;inset:0;display:grid;grid-template-columns:1.02fr .98fr;align-items:center;gap:40px;padding:52px 56px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC',sans-serif">
      <div>
        <div style="display:inline-flex;align-items:center;gap:9px;padding:7px 16px;border-radius:999px;font-size:15px;font-weight:600;color:var(--ink-soft);background:var(--pane-strong);border:1px solid var(--rim);box-shadow:inset 0 1px 0 var(--rim);margin-bottom:22px">
          <span style="width:9px;height:9px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px color-mix(in srgb, var(--accent) 22%, transparent)"></span>
          dsh profile bundle · MIT · zero dependencies
        </div>
        <div style="font-size:64px;line-height:1.02;font-weight:750;letter-spacing:-.035em;color:var(--ink);margin-bottom:20px;text-shadow:0 1px 0 color-mix(in srgb, #fff 60%, transparent)">Frutiger&nbsp;Aero<br><span style="font-size:44px;opacity:.92">for DeepSeek&nbsp;Harness</span></div>
        <div style="font-size:22px;line-height:1.45;color:var(--ink-soft);max-width:29ch">Glass, water, sky and bubbles — on desktop and on a phone that finally fits a thumb.</div>
      </div>
      <div style="position:relative;padding-bottom:34px">
        <img src="\${shot}" style="display:block;width:100%;border-radius:15px;border:1px solid var(--rim);box-shadow:0 34px 64px -28px var(--shadow-deep), inset 0 1px 0 var(--rim)">
        <img src="\${phone}" style="position:absolute;right:-10px;bottom:-6px;width:158px;border-radius:22px;border:1px solid var(--rim);box-shadow:0 34px 64px -22px var(--shadow-deep)">
      </div>
    </div>\`
  document.body.appendChild(card)
})()`)
await page.waitForTimeout(1800)
await page.screenshot({ path: '/root/dsh-Frutiger/docs/assets/og.png' })
console.log('og.png', fs.statSync('/root/dsh-Frutiger/docs/assets/og.png').size, 'bytes')
await browser.close()
