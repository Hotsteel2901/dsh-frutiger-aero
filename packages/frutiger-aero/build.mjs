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

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

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
 */
const SHEET_ORDER = ['base', 'scenery', 'material', 'mobile', 'effects']

const sheets = SHEET_ORDER.map((name) => {
  const file = join(here, 'src/css', `${name}.css`)
  return [name, readFileSync(file, 'utf8').replace(/\s+$/, '') + '\n']
})

const stylesLiteral = sheets
  .map(([name, css]) => `      ${JSON.stringify(name)}: ${JSON.stringify(css)},`)
  .join('\n')

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
