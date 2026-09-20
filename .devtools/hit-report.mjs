/**
 * Summarise a `hitaudit.mjs` run.
 *
 * The raw dump is every control in every zone, which is thousands of lines and
 * buries the answer. The question is narrow: how many controls have a *real*
 * shortfall — that is, a box smaller than 44px that is also actually reachable
 * by a thumb. A small box that is occluded is not a defect the user can
 * encounter, and most of them are deliberate (a control behind an open drawer).
 *
 * usage: node hit-report.mjs /tmp/fa-hit.json
 */
import fs from 'node:fs'

const report = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))

let totalControls = 0
let totalShortfalls = 0
let totalOccluded = 0

for (const [zone, data] of Object.entries(report)) {
  if (zone === 'errors') continue
  if (data === null || typeof data !== 'object' || !Array.isArray(data.controls)) continue

  const controls = data.controls
  const small = controls.filter((c) => c.small)
  const reachable = small.filter((c) => !c.occluded)

  totalControls += controls.length
  totalShortfalls += reachable.length
  totalOccluded += small.length - reachable.length

  const mark = reachable.length > 0 ? 'FAIL' : 'ok  '
  console.log(
    `${mark} ${zone.padEnd(10)} controls=${String(controls.length).padEnd(3)}`
    + ` small-box=${String(small.length).padEnd(3)}`
    + ` reachable-shortfalls=${String(reachable.length).padEnd(3)}`
    + ` occluded-by-design=${small.length - reachable.length}`,
  )
  for (const c of reachable) {
    console.log(`       ${c.reach.padEnd(9)} reach  ${c.box.padEnd(9)} box   "${c.name}"`)
  }
  const tiny = data.tinyText ?? []
  if (tiny.length > 0) {
    console.log(`       tiny text: ${tiny.length}`)
    for (const t of tiny.slice(0, 6)) console.log(`         ${String(t.size).padStart(5)}px  "${String(t.text).slice(0, 44)}"`)
  }
}

const errors = report.errors ?? []
console.log('')
console.log(`${totalControls} controls across the audited zones`)
console.log(`${totalShortfalls} real shortfalls, ${totalOccluded} small boxes occluded by design`)
console.log(`page errors: ${errors.length}`)
for (const e of errors.slice(0, 5)) console.log(`  ${e}`)

process.exit(totalShortfalls > 0 || errors.length > 0 ? 1 : 0)
