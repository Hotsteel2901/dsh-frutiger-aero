#!/usr/bin/env node
/**
 * Build `lib/index.js` and `lib/client.js` from `src/`.
 *
 * The browser half has to ship as ONE file in the exact shape the client
 * module system expects — a script that calls
 * `window.__ModuleLoader__.load({ id, factory })` where `id` is the package
 * name and `factory(require)` returns the plugin exports. There is no bundler
 * and no TypeScript in this package on purpose: the built artifact is
 * committed, so installing the profile needs nothing but a file copy, and
 * this script only exists so the CSS stays authorable as real `.css` files
 * instead of living inside template literals.
 *
 * Run: `node build.mjs`
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { SHEET_ORDER, sourceFingerprint } from '../../scripts/source-fingerprint.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(here, 'package.json'), 'utf8'))
const ID = pkg.name

/** Read one source file, failing loudly rather than emitting a half bundle. */
function read(relative) {
  return readFileSync(join(here, relative), 'utf8')
}

/** Indent an inlined source block so the generated file stays readable. */
function indent(source, unit) {
  return source
    .replace(/\s+$/, '')
    .split('\n')
    .map((line) => (line === '' ? '' : unit + line))
    .join('\n')
}

/**
 * Stylesheet order is cascade order and therefore meaningful. The palette sheet
 * is generated at runtime (`tokens`, injected first), then: `base` for the
 * structural groundwork, `scenery` paints behind the app, `material` skins the
 * app itself, `mobile` reflows it, `effects` animates it last.
 *
 * The order comes from `scripts/source-fingerprint.mjs` rather than being
 * restated, because it is also part of what the fingerprint covers.
 */
const sheets = SHEET_ORDER.map((name) => {
  const file = join(here, 'src/css', `${name}.css`)
  return [name, readFileSync(file, 'utf8').replace(/\s+$/, '') + '\n']
})

const stylesLiteral = sheets
  .map(([name, css]) => `      ${JSON.stringify(name)}: ${JSON.stringify(css)},`)
  .join('\n')

// Identity is computed over the shipped bytes themselves, plus the CSS and the
// source modules that were inlined. The host half is covered too, so a change
// to either half moves the fingerprint.
//
// The input list lives in `scripts/source-fingerprint.mjs` because `install.mjs`
// has to arrive at the same number from a bare downloaded archive. Two lists
// would drift and turn every healthy install into a false "stale" report.
//
// Note what is NOT here: a build timestamp. The artifact has to be a pure
// function of its sources or the installer's comparison is meaningless — an
// installed copy would "differ from this checkout" after every rebuild of
// identical code. When the build ran is a property of the build, not of what
// was built, so it is printed here and read at runtime from the host if needed.
const BUILD = {
  version: pkg.version,
  fingerprint: sourceFingerprint(here),
}
if (BUILD.fingerprint === undefined) {
  throw new Error('a build input is missing — the fingerprint cannot be computed')
}

const client = `window.__ModuleLoader__.load({
\tid: ${JSON.stringify(ID)},
\tfactory: (require) => {
\t\tvar module = { exports: {} };
\t\tvar exports = module.exports;
\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
${indent(read('src/client/palette.js'), '\t\t')}
${indent(read('src/client/scenery.js'), '\t\t')}
${indent(read('src/client/controls.js'), '\t\t')}
${indent(read('src/client/runtime.js'), '\t\t')}
\t\t/** Stylesheets inlined at build time; see src/css/*.css. */
\t\tconst FA_SHEETS = {
${stylesLiteral}
\t\t};
\t\t/**
\t\t * What this artifact is, readable at runtime and without the package.json.
\t\t * A release tag and a branch can share a version string while holding
\t\t * different bytes; the fingerprint is what tells them apart.
\t\t *
\t\t * Deliberately carries no timestamp: a build clock would change the served
\t\t * bytes on every rebuild of identical sources, which is exactly the
\t\t * property the installer relies on when it compares an installed copy
\t\t * against the sources it is holding.
\t\t */
\t\tconst FA_BUILD = ${JSON.stringify(BUILD)};
\t\texports.build = FA_BUILD;
\t\texports.apply = apply;
\t\texports.inject = inject;
\t\treturn module.exports;
\t}
});
`

mkdirSync(join(here, 'lib'), { recursive: true })
writeFileSync(join(here, 'lib/index.js'), read('src/host.js'))
writeFileSync(join(here, 'lib/client.js'), client)

const sizes = [
  ['lib/index.js', read('src/host.js').length],
  ['lib/client.js', client.length],
]
for (const [file, length] of sizes) {
  process.stdout.write(`built ${file} (${String(length)} bytes)\n`)
}
process.stdout.write(`build ${BUILD.version} ${BUILD.fingerprint}\n`)
