#!/usr/bin/env node
/**
 * Replace every `USERNAME` placeholder with the real repository owner.
 *
 * The placeholder appears wherever a URL has to be absolute — shields.io
 * badges, the Open Graph tags, the install one-liners, npm metadata, the
 * registry submission entry. Doing it by hand across eleven files is how one
 * gets missed, and a missed one is a 404 in a badge or a broken social card.
 *
 * Usage:
 *   node scripts/set-repo.mjs <owner> [repo]
 *   node scripts/set-repo.mjs --check      # report what is still a placeholder
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(dirname(fileURLToPath(import.meta.url)))
const PLACEHOLDER = 'USERNAME'

/** Every file that carries an absolute URL. */
const FILES = [
  'README.md',
  'README.zh.md',
  'CHANGELOG.md',
  'RELEASE.md',
  'package.json',
  'install.sh',
  'install.ps1',
  'packages/frutiger-aero/package.json',
  'submission/awesome-dsh-plugin.yml',
  'docs/index.html',
  'docs/assets/landing.js',
  '.github/workflows/pages.yml',
]

const [owner, repo = 'dsh-frutiger-aero'] = process.argv.slice(2).filter((a) => !a.startsWith('-'))
const checkOnly = process.argv.includes('--check')

if (checkOnly) {
  let remaining = 0
  for (const file of FILES) {
    const path = join(here, file)
    if (!existsSync(path)) continue
    const count = readFileSync(path, 'utf8').split(PLACEHOLDER).length - 1
    if (count > 0) {
      console.log(`${String(count).padStart(3)}  ${file}`)
      remaining += count
    }
  }
  console.log(remaining === 0 ? 'no placeholders left' : `${remaining} placeholder(s) across the files above`)
  process.exit(remaining === 0 ? 0 : 1)
}

if (!owner || owner === PLACEHOLDER) {
  console.error('usage: node scripts/set-repo.mjs <owner> [repo]')
  process.exit(2)
}
if (!/^[A-Za-z0-9-]+$/.test(owner) || !/^[A-Za-z0-9._-]+$/.test(repo)) {
  console.error('owner and repo must be plain GitHub names')
  process.exit(2)
}

let changed = 0
for (const file of FILES) {
  const path = join(here, file)
  if (!existsSync(path)) continue
  const before = readFileSync(path, 'utf8')
  // The token only, never a longer word that merely contains it. Hyphens are
  // deliberately *not* guarded: the placeholder follows a `:-` default in a
  // shell parameter expansion and a `-` in several paths, and both are real
  // occurrences rather than part of a bigger identifier.
  // A trailing underscore is allowed through: the registry names its entry
  // files `<owner>__<repo>.yml`, so the placeholder is genuinely followed by a
  // double underscore in two places.
  const after = before.replace(/(?<![A-Za-z0-9_])USERNAME(?![A-Za-z0-9])/g, owner)
  if (after === before) continue
  writeFileSync(path, after)
  changed += 1
  console.log(`updated ${file}`)
}

// The repository name itself is only assumed where a URL is built from it.
if (repo !== 'dsh-frutiger-aero') {
  for (const file of FILES) {
    const path = join(here, file)
    if (!existsSync(path)) continue
    const before = readFileSync(path, 'utf8')
    const after = before.split(`/${'dsh-frutiger-aero'}`).join(`/${repo}`)
    if (after !== before) {
      writeFileSync(path, after)
      console.log(`renamed repo in ${file}`)
    }
  }
}

console.log(`\n${changed} file(s) updated for ${owner}/${repo}`)
console.log('Next: node scripts/set-repo.mjs --check')
