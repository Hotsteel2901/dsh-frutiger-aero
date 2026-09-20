#!/usr/bin/env node
/**
 * Human-readable summary of `deepcontrast.mjs` output.
 *
 * The probe emits full JSON because the raw rows are the evidence; this turns
 * one scheme's run into a short report that leads with the failures, because a
 * list of 95 passing rows buries the two that matter.
 *
 * usage: node deepcontrast.mjs <url> light | node contrast-report.mjs
 */
let raw = ''
process.stdin.setEncoding('utf8')
for await (const chunk of process.stdin) raw += chunk

const report = JSON.parse(raw)
const SURFACES = ['hero', 'transcript', 'trajectory', 'drawer', 'settings', 'wide']

let failing = 0
let scanned = 0
const offenders = []

for (const name of SURFACES) {
  const s = report[name]
  if (s === undefined) continue
  scanned += s.total
  failing += s.failing
  const mark = s.failing === 0 ? 'ok  ' : 'FAIL'
  console.log(`${mark} ${name.padEnd(11)} flow=${String(s.flowNodes).padEnd(3)} texts=${String(s.total).padEnd(4)} failing=${s.failing}`)
  for (const row of s.rows) {
    if (row.pass) continue
    offenders.push({ surface: name, ...row })
  }
}

console.log('')
for (const o of offenders.sort((a, b) => a.worst - b.worst)) {
  const need = o.need.toFixed(1)
  console.log(`  ${String(o.worst).padStart(6)}:1  need ${need}  ${String(o.size).padStart(4)}px/${o.weight}  on-${o.on}  ${o.t}`)
  console.log(`          in ${o.surface}`)
}

console.log('')
console.log(`scanned ${scanned} text runs across ${SURFACES.filter((n) => report[n] !== undefined).length} surfaces, ${failing} failing`)

if (report.errors !== undefined && report.errors.length > 0) {
  console.log(`page errors: ${report.errors.length}`)
  for (const e of report.errors.slice(0, 6)) console.log(`  ${e}`)
}

process.exit(failing > 0 ? 1 : 0)
