import sharp from 'sharp'
import fs from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAW = '/tmp/fa-shots'
// Resolved from this file rather than hard-coded: the harness lives inside the
// repo, and a fixed absolute path silently wrote the screenshots to a directory
// that no longer existed instead of failing.
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'assets')
fs.mkdirSync(OUT, { recursive: true })

/** Desktop shots: 2x capture, published at 1440 CSS px. */
const desktop = [
  ['desktop-light', 'shot-desktop-light'],
  ['desktop-dark', 'shot-desktop-dark'],
  ['desktop-settings', 'shot-settings'],
]
/** Phone shots: 3x capture, published at 1.5x for a crisp but light image. */
const phone = [
  ['phone-light', 'shot-phone-light'],
  ['phone-dark', 'shot-phone-dark'],
  ['phone-drawer', 'shot-phone-drawer'],
  ['phone-panel', 'shot-phone-panel'],
]

/** Skip a capture that was not taken, rather than reading a missing file. */
const have = (file) => fs.existsSync(file)

for (const [src, name] of desktop) {
  const file = `${RAW}/${src}.png`
  if (!have(file)) {
    console.log(`skip ${name} (no ${src}.png)`)
    continue
  }
  const meta = await sharp(file).metadata()
  await sharp(file)
    .resize({ width: 1440 })
    .webp({ quality: 84, effort: 5 })
    .toFile(`${OUT}/${name}.webp`)
  console.log(name, `${meta.width}x${meta.height} ->`, fs.statSync(`${OUT}/${name}.webp`).size)
}
for (const [src, name] of phone) {
  const file = `${RAW}/${src}.png`
  if (!have(file)) {
    console.log(`skip ${name} (no ${src}.png)`)
    continue
  }
  const meta = await sharp(file).metadata()
  await sharp(file)
    .resize({ width: 585 })
    .webp({ quality: 84, effort: 5 })
    .toFile(`${OUT}/${name}.webp`)
  console.log(name, `${meta.width}x${meta.height} ->`, fs.statSync(`${OUT}/${name}.webp`).size)
}

// A small in-page preview strip: the two phones side by side is done in CSS,
// so each phone shot is also published at 1x for the narrow layout.
if (have(`${RAW}/phone-light.png`)) {
  await sharp(`${RAW}/phone-light.png`).resize({ width: 390 }).webp({ quality: 80, effort: 5 }).toFile(`${OUT}/shot-phone-light-1x.webp`)
}
console.log('total assets', fs.readdirSync(OUT).length)
