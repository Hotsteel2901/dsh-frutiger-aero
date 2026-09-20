import { launch } from './lib/chromium.mjs'
import fs from 'node:fs'

const URL = process.argv[2] ?? 'http://127.0.0.1:3080'
const OUT = process.argv[3] ?? '/tmp/fa-recon'
fs.mkdirSync(OUT, { recursive: true })

const browser = await launch({
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
})

const outline = `(() => {
  const skip = new Set(['SCRIPT','STYLE','LINK','META','HEAD'])
  const lines = []
  const walk = (el, depth) => {
    if (depth > 14 || skip.has(el.tagName)) return
    const attrs = []
    for (const a of el.attributes) {
      if (a.name === 'class') continue
      if (a.name === 'style') { if (a.value.length < 90) attrs.push('style=' + JSON.stringify(a.value)); continue }
      if (a.name.startsWith('data-') || a.name === 'role' || a.name === 'aria-label' || a.name === 'contenteditable' || a.name === 'type') attrs.push(a.name + '=' + JSON.stringify(a.value.slice(0, 60)))
    }
    const cls = (el.className && typeof el.className === 'string') ? el.className.split(/\\s+/).filter(Boolean).map(c => c.split('_')[0] + '_' + (c.split('_')[2] ?? '')).slice(0,3).join(',') : ''
    const r = el.getBoundingClientRect()
    const box = r.width > 0 ? Math.round(r.width) + 'x' + Math.round(r.height) + '@' + Math.round(r.left) + ',' + Math.round(r.top) : 'hidden'
    const text = (el.children.length === 0 && el.textContent) ? ' "' + el.textContent.trim().slice(0, 40) + '"' : ''
    lines.push('  '.repeat(depth) + el.tagName.toLowerCase() + (cls ? '.' + cls : '') + (attrs.length ? ' [' + attrs.join(' ') + ']' : '') + '  {' + box + '}' + text)
    for (const child of el.children) walk(child, depth + 1)
  }
  walk(document.getElementById('root') ?? document.body, 0)
  return lines.join('\\n')
})()`

for (const [name, viewport, mobile] of [
  ['desktop', { width: 1440, height: 900 }, false],
  ['phone', { width: 390, height: 844 }, true],
  ['tablet', { width: 820, height: 1180 }, true],
]) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    isMobile: mobile,
    hasTouch: mobile,
    userAgent: mobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      : undefined,
  })
  const page = await context.newPage()
  page.on('console', (m) => { if (m.type() === 'error') console.log(`[${name}] console.error: ${m.text().slice(0, 200)}`) })
  page.on('pageerror', (e) => console.log(`[${name}] pageerror: ${String(e).slice(0, 200)}`))
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(9000)
  fs.writeFileSync(`${OUT}/dom-${name}.txt`, await page.evaluate(outline))
  fs.writeFileSync(`${OUT}/computed-${name}.json`, JSON.stringify(await page.evaluate(`(() => {
    const el = document.querySelector('[data-rightbar-col]')
    const frame = el?.parentElement
    const out = { title: document.title, html: {}, frame: {}, body: {} }
    const pick = (node, keys) => { if (!node) return null; const cs = getComputedStyle(node); const o = {}; for (const k of keys) o[k] = cs.getPropertyValue(k); return o }
    out.html = pick(document.documentElement, ['color-scheme','background-color'])
    out.body = pick(document.body, ['background-color','color','font-family','--dsw-alias-bg-base','--dsw-alias-label-primary','--dsw-specific-sidebar-fill','--dsw-alias-brand-primary','--dsw-corner-shape'])
    out.frame = pick(frame, ['background-color','display','grid-template-columns','overflow'])
    out.frameAttrs = frame ? [...frame.attributes].map(a => a.name + '=' + a.value).join(' | ') : null
    out.children = frame ? [...frame.children].map(c => c.tagName + '.' + (typeof c.className === 'string' ? c.className : '') + ' [' + [...c.attributes].map(a=>a.name).join(',') + '] ' + Math.round(c.getBoundingClientRect().width) + 'x' + Math.round(c.getBoundingClientRect().height)) : null
    out.scrollHost = (() => { const s = document.querySelector('[data-conversation-scroll]'); return s ? { w: Math.round(s.getBoundingClientRect().width), h: Math.round(s.getBoundingClientRect().height), bg: getComputedStyle(s).backgroundColor } : null })()
    out.ancestorsOfScroll = (() => { const s = document.querySelector('[data-conversation-scroll]'); const a = []; let n = s; while (n && n !== document.body && a.length < 12) { const cs = getComputedStyle(n); a.push({ tag: n.tagName, cls: typeof n.className === 'string' ? n.className : '', bg: cs.backgroundColor, bgImage: cs.backgroundImage.slice(0, 60), pad: cs.padding, hasData: [...n.attributes].filter(x=>x.name.startsWith('data-')).map(x=>x.name).join(',') }); n = n.parentElement } return a })()
    return out
  })()`), null, 2))
  await page.screenshot({ path: `${OUT}/before-${name}.png`, fullPage: false })
  console.log(`[${name}] ok`)
  await context.close()
}
await browser.close()
