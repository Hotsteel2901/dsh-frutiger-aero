import { launch } from './lib/chromium.mjs'
import { enter, freshPage } from './lib/gates.mjs'
const T=process.argv[2], W=+process.argv[3], H=+process.argv[4]
const b = await launch()
const p = await freshPage(b, { viewport:{width:W,height:H}, deviceScaleFactor:3, isMobile:true, hasTouch:true })
await enter(p, T, { settle: 2500 })
const r = await p.evaluate(`(() => {
  const comp=document.querySelector('[data-composer-card]'); const cr=comp.getBoundingClientRect()
  const body=document.querySelector('[class*="scrollBody"]'); const bc=getComputedStyle(body)
  const dock=document.querySelector('[data-fa-dock]')
  const seat=document.querySelector('[data-composer-seat]')
  const sr=seat?seat.getBoundingClientRect():null
  return { viewport:innerWidth+'x'+innerHeight,
    scrollBodyJustify: bc.justifyContent,
    composerTop: Math.round(cr.top), composerGapBelow: Math.round(innerHeight-cr.bottom),
    seatY: sr? Math.round(sr.top)+'..'+Math.round(sr.bottom):null,
    dockVisible: dock? (getComputedStyle(dock).display!=='none' && dock.getBoundingClientRect().width>0):false,
    dockBox: (()=>{const d=document.querySelector('[data-fa-dock]'); if(!d) return null; const r=d.getBoundingClientRect(); return r.width>0?Math.round(r.width)+'x'+Math.round(r.height)+'@y'+Math.round(r.top):'hidden'})() }
})()`)
console.log(JSON.stringify(r,null,2))
await p.screenshot({path:'/tmp/fa-land-fixed.png'})
await b.close()
