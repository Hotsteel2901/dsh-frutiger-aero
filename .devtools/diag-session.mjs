/**
 * Why is the seeded session invisible?
 *
 * `session/list` returns the sessions the workspace registry can see, and a
 * session only becomes a member when its **stored header's `cwd`** resolves to
 * the workspace's canonical path. This script answers the question empirically:
 * it spawns a session through the product's own UI, reads the session the
 * product wrote to disk, and compares that header — byte for byte — with the
 * header the seek writes. Any difference in the header is the bug.
 *
 * usage: node diag-session.mjs <url> [seedId]
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import zlib from 'node:zlib'
import { launch } from './lib/chromium.mjs'
import { enter } from './lib/gates.mjs'

const URL = process.argv[2]
const SEED_ID = process.argv[3] ?? 'ses_frutiger_mobile_audit'
const HOME = process.env.DSH_HOME ?? path.join(os.homedir(), '.dsh')
const ROOT = path.join(HOME, 'sessions')

/** Frame boundaries in a concatenated Zstandard container. */
const MAGIC = 4247762216
function frameEnds(buffer) {
  const ends = []
  let offset = 0
  while (offset < buffer.length) {
    const start = offset
    if (buffer.readUInt32LE(offset) !== MAGIC) throw new Error(`bad magic at ${String(offset)}`)
    offset += 4
    const descriptor = buffer.readUInt8(offset)
    offset += 1
    const contentSizeFlag = descriptor >>> 6
    const singleSegment = (descriptor & 32) !== 0
    const checksum = (descriptor & 4) !== 0
    const dictionaryFlag = descriptor & 3
    const dictionaryBytes = dictionaryFlag === 3 ? 4 : dictionaryFlag
    const contentSizeBytes = contentSizeFlag === 0 ? (singleSegment ? 1 : 0) : 1 << contentSizeFlag
    offset += (singleSegment ? 0 : 1) + dictionaryBytes + contentSizeBytes
    for (;;) {
      const blockHeader = buffer.readUIntLE(offset, 3)
      offset += 3
      const last = (blockHeader & 1) !== 0
      const type = (blockHeader >>> 1) & 3
      offset += type === 1 ? 1 : blockHeader >>> 3
      if (last) break
    }
    if (checksum) offset += 4
    ends.push([start, offset])
  }
  return ends
}

/** First record of the first frame — the physical session header. */
function readHeader(file) {
  const bytes = fs.readFileSync(file)
  const [start, end] = frameEnds(bytes)[0]
  const line = zlib.zstdDecompressSync(bytes.subarray(start, end)).toString('utf8').split('\n')[0]
  return { header: JSON.parse(line), frames: frameEnds(bytes).length, bytes: bytes.length }
}

/** Every session directory currently on disk, with its header. */
function inventory() {
  const found = []
  for (const project of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!project.isDirectory()) continue
    for (const dir of fs.readdirSync(path.join(ROOT, project.name), { withFileTypes: true })) {
      if (!dir.isDirectory()) continue
      const full = path.join(ROOT, project.name, dir.name)
      const log = fs.readdirSync(full).find((f) => /^session.*\.jsonl\.zstd$/.test(f))
      if (!log) continue
      try {
        const info = readHeader(path.join(full, log))
        found.push({ id: dir.name, project: project.name, log, ...info })
      } catch (error) {
        found.push({ id: dir.name, project: project.name, log, error: String(error.message) })
      }
    }
  }
  return found
}

console.log('=== sessions on disk, before ===')
for (const s of inventory()) {
  console.log(
    `${s.id}\n  project=${s.project} frames=${String(s.frames)} bytes=${String(s.bytes)}` +
      (s.error ? `\n  ERROR ${s.error}` : `\n  header=${JSON.stringify(s.header)}`),
  )
}

// Drive the product's own "New session" so it writes a session through its
// real code path, then read what it produced.
const browser = await launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await enter(page, URL)
const clicked = await page.evaluate(`(() => {
  const buttons = [...document.querySelectorAll('#root button, #root [role="button"]')]
  const target = buttons.find((b) => /^(New session|新建会话)$/.test((b.textContent || '').trim()))
  if (!target) return null
  target.click()
  return (target.textContent || '').trim()
})()`)
await page.waitForTimeout(4000)
console.log(`\nclicked "${String(clicked)}" in the product`)
await browser.close()

console.log('\n=== sessions on disk, after ===')
for (const s of inventory()) {
  console.log(
    `${s.id}\n  project=${s.project} frames=${String(s.frames)} bytes=${String(s.bytes)}` +
      (s.error ? `\n  ERROR ${s.error}` : `\n  header=${JSON.stringify(s.header)}`),
  )
}

// The comparison that matters: does the seed's header look like a product one?
const all = inventory()
const seed = all.find((s) => s.id === SEED_ID)
const product = all.find((s) => s.id.startsWith('session-'))
console.log('\n=== header diff ===')
if (!seed || seed.error) console.log('seed not readable:', seed?.error ?? 'absent')
else if (!product || product.error) console.log('no product session to compare against')
else {
  const keys = new Set([...Object.keys(seed.header), ...Object.keys(product.header)])
  for (const key of [...keys].sort()) {
    const a = JSON.stringify(seed.header[key])
    const b = JSON.stringify(product.header[key])
    console.log(`${a === b ? '  ' : '≠ '}${key.padEnd(18)} seed=${a ?? '<absent>'}  product=${b ?? '<absent>'}`)
  }
}
