/**
 * The identity of a source tree, reachable from `install.mjs` while it runs
 * from a downloaded archive.
 *
 * `install.mjs` is normally executed from an unpacked release tarball, where
 * `node_modules` does not exist and no dependency can be imported. Everything
 * here is therefore pure Node builtins, and the only thing it does is hash
 * two files.
 *
 * ## Why this is its own module rather than a function in `build.mjs`
 *
 * The build derives the artifact's fingerprint from a specific list of inputs
 * (the five stylesheets, the four client modules, the host module). If the
 * doctor hashed a *different* list, every install would be reported as stale
 * the moment the build's list changed — a false alarm on a healthy install is
 * worse than no check at all, because it teaches the user to ignore the check.
 *
 * So the list lives here, once. `build.mjs` imports it and hashes exactly
 * those files; `install.mjs` imports `sourceFingerprint` for the same answer.
 * One definition, two consumers, no drift.
 *
 * ## Why hashing the sources rather than the built artifact
 *
 * The build is deterministic — same sources in, same `lib/client.js` out — so
 * both halves of the comparison are derivable from the sources, and nothing is
 * written to disk to make the check work. That also means `install.mjs` never
 * needs `lib/client.js` to *export* its fingerprint; a copy predating that
 * field still gets a definitive "this is not what you are holding" answer
 * rather than a shrug.
 *
 * The hash is taken over `name \0 contents \0` pairs in order, so two files
 * cannot be swapped or concatenated into the same digest.
 */

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Every file whose contents end up in the built artifact, in a fixed order.
 *
 * A file added to the build must be added here, or the fingerprint stops
 * covering it — `build.mjs` is included precisely so that a change to the
 * assembly itself moves the number, and `package.json` because it carries the
 * version and the file list the artifact ships under.
 */
export const SOURCE_INPUTS = [
  'package.json',
  'build.mjs',
  'src/host.js',
  'src/client/palette.js',
  'src/client/scenery.js',
  'src/client/controls.js',
  'src/client/runtime.js',
  'src/css/base.css',
  'src/css/scenery.css',
  'src/css/material.css',
  'src/css/mobile.css',
  'src/css/effects.css',
  'src/css/showcase.css',
]

/**
 * The order the stylesheets are inlined in, which is also their cascade order
 * and therefore part of what the artifact is. Exported so `build.mjs` and this
 * module cannot disagree about it.
 */
export const SHEET_ORDER = ['base', 'scenery', 'material', 'mobile', 'effects', 'showcase']

/**
 * The absolute path of `packages/frutiger-aero`.
 *
 * This file lives at `<repo>/scripts/source-fingerprint.mjs`, so the package
 * is three directories up from its own directory: `scripts` -> repo root ->
 * `packages` -> the plugin. It is derived from `import.meta.url` and not from
 * `process.cwd()`, because the installer runs from an unpacked archive and the
 * caller's working directory has nothing to do with where the sources are.
 */
export function packageDir() {
  const here = dirname(fileURLToPath(import.meta.url))
  return join(here, '..', 'packages', 'frutiger-aero')
}

/**
 * Hash a package directory's inputs into a short, stable identity.
 *
 * Normalising trailing whitespace matters: `build.mjs` trims every stylesheet
 * before inlining it, and the installer copies `lib/`, which does not include
 * `src/` at all. Hashing the raw files would make an editor that adds a final
 * newline look like a new build.
 *
 * @param root - the plugin package directory to read from.
 * @returns 12 hex characters, or `undefined` when a source is unreadable.
 */
export function sourceFingerprint(root = packageDir()) {
  const hash = createHash('sha256')
  for (const relative of SOURCE_INPUTS) {
    let body
    try {
      body = readFileSync(join(root, relative), 'utf8')
    } catch {
      // A missing input means this is not a tree the build could have
      // produced; "unknown" is the honest answer, and callers skip the
      // comparison rather than inventing a mismatch.
      return undefined
    }
    hash.update(relative)
    hash.update('\0')
    hash.update(body.replace(/\s+$/, ''))
    hash.update('\0')
  }
  return hash.digest('hex').slice(0, 12)
}
