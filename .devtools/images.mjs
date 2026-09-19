import sharp from 'sharp'
import fs from 'node:fs'

const RAW = '/tmp/fa-shots'
const OUT = '/root/dsh-Frutiger/docs/assets'
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
  ['phone-preview', 'shot-phone-preview'],
]

for (const [src, name] of desktop) {
  const file = `${RAW}/${src}.png`
  const meta = await sharp(file).metadata()
  await sharp(file)
    .resize({ width: 1440 })
    .webp({ quality: 84, effort: 5 })
    .toFile(`${OUT}/${name}.webp`)
  console.log(name, `${meta.width}x${meta.height} ->`, fs.statSync(`${OUT}/${name}.webp`).size)
}
for (const [src, name] of phone) {
  const file = `${RAW}/${src}.png`
  const meta = await sharp(file).metadata()
  await sharp(file)
    .resize({ width: 585 })
    .webp({ quality: 84, effort: 5 })
    .toFile(`${OUT}/${name}.webp`)
  console.log(name, `${meta.width}x${meta.height} ->`, fs.statSync(`${OUT}/${name}.webp`).size)
}

// A small in-page preview strip: the two phones side by side is done in CSS,
// so each phone shot is also published at 1x for the narrow layout.
await sharp(`${RAW}/phone-light.png`).resize({ width: 390 }).webp({ quality: 80, effort: 5 }).toFile(`${OUT}/shot-phone-light-1x.webp`)
console.log('total assets', fs.readdirSync(OUT).length)
