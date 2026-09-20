import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'
const T = process.argv[2]
const CASES = [
  ['phone portrait',   390,  844, true],
  ['phone landscape',  844,  390, true],
  ['small phone',      320,  568, true],
  ['phablet',          430,  932, true],
  ['tablet portrait',  820, 1180, true],
  ['tablet landscape',1180,  820, true],
  ['breakpoint-640',   640,  900, true],
  ['breakpoint-641',   641,  900, true],
  ['breakpoint-1023', 1023,  900, true],
  ['breakpoint-1024', 1024,  900, false],
  ['desktop',         1440,  900, false],
]
const b = await launch()
const out=[]
for (const [name,w,h,touch] of CASES) {
  const p = await freshPage(b, { viewport:{width:w,height:h}, deviceScaleFactor:2, isMobile:touch, hasTouch:touch })
  const errs=[]
  p.on('pageerror', e=>errs.push(String(e.message).slice(0,120)))
  await enter(p, T, { settle: 2200 })
  const r = await p.evaluate(`(() => {
    const dock=document.querySelector('[data-fa-dock]')
    const dockR=dock?dock.getBoundingClientRect():null
    const frame=document.querySelector('[data-fa-frame]')
    const cols=frame?getComputedStyle(frame).gridTemplateColumns:null
    const sidebar=document.querySelector('[data-fa-col="sidebar"]')
    const sr=sidebar?sidebar.getBoundingClientRect():null
    const center=document.querySelector('[data-fa-col="center"]')
    const cr=center?center.getBoundingClientRect():null
    const comp=document.querySelector('[data-composer-card]')
    const compR=comp?comp.getBoundingClientRect():null
    return {
      inner: innerWidth+'x'+innerHeight,
      overflowX: document.documentElement.scrollWidth - innerWidth,
      overflowY: document.documentElement.scrollHeight - innerHeight,
      cols, dockVisible: dock ? getComputedStyle(dock).display !== 'none' && !dock.hasAttribute('hidden') : false,
      dockBox: dockR? Math.round(dockR.width)+'x'+Math.round(dockR.height) : null,
      dockBottomGap: dockR? Math.round(innerHeight - dockR.bottom) : null,
      sidebarBox: sr? Math.round(sr.width)+'x'+Math.round(sr.height)+'@'+Math.round(sr.left) : null,
      centerBox: cr? Math.round(cr.width)+'x'+Math.round(cr.height)+'@'+Math.round(cr.left) : null,
      composerBox: compR? Math.round(compR.width)+'x'+Math.round(compR.height) : null,
      drawer: document.body.hasAttribute('data-fa-drawer'),
      tier: document.documentElement.dataset.faTier,
    }
  })()`)
  out.push({ name, ask:`${w}x${h}`, ...r, errors: errs.length?errs:undefined })
  await p.evaluate(`window.__faContext?.().close?.()`).catch(()=>{})
}
console.log(JSON.stringify(out,null,2))
await b.close()
