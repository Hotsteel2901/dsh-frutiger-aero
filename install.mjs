#!/usr/bin/env node
/**
 * dsh-frutiger-aero — portable profile installer.
 *
 * Creates (or updates) a dsh profile whose bundle list includes this plugin, so
 * the skin is reachable as `dsh --profile <name>`. The whole install is a
 * directory copy: no package manager, no network, no build step. That is
 * deliberate — `dsh plugin --profile <name> add` needs pnpm and a registry, and
 * a theme should not be blocked on either.
 *
 * What it writes, and why each file is needed:
 *
 *   <home>/profiles/<name>/package.json         the profile manifest; its
 *                                               `dsh.profile.bundles` is the
 *                                               bundle layer stack, and this
 *                                               plugin has to be in it
 *   <home>/profiles/<name>/cordis.yml           the empty profile root (the
 *                                               tree is composed as patches)
 *   <home>/profiles/<name>/cordis.patch.yml     the profile's own patch layer,
 *                                               applied last; left empty so the
 *                                               user has somewhere to disable
 *                                               the row without editing this
 *                                               package
 *   <home>/profiles/<name>/pnpm-workspace.yaml  lets a later `dsh plugin`
 *                                               invocation manage the profile
 *                                               normally
 *   <home>/profiles/<name>/node_modules/
 *     dsh-frutiger-aero/                        this package, copied (or
 *                                               symlinked with --link)
 *
 * The copy lands inside the profile's own `node_modules` rather than the shared
 * `profiles/node_modules`, which is the one location dsh's fallback healing
 * never rewrites: it deletes bundle packages from that closure by name, and
 * this package *is* a bundle, so the copy is left alone.
 *
 * Usage:
 *   node install.mjs                        install as `--profile frutiger`
 *   node install.mjs --profile aero         a different profile name
 *   node install.mjs --link                 symlink to this checkout instead of
 *                                           copying (rebuild-aware; for hacking
 *                                           on the plugin)
 *   node install.mjs --uninstall            remove it, leaving the profile and
 *                                           its sessions in place
 *   node install.mjs --doctor               inspect an existing install and
 *                                           report what is wrong and how to fix
 *                                           it — never "delete everything"
 *   node install.mjs --repair               re-copy the payload over an existing
 *                                           install, keeping the profile
 *   node install.mjs --print                resolve everything, write nothing
 *
 * Options: --profile <name>, --home <dir>, --json.
 *
 * ## Why --doctor exists, and why it is not a nicety
 *
 * Installs of this plugin used to fail in ways that gave the user nothing to
 * act on, and the only recovery anyone could invent was to delete the profile
 * and start over. Two of those failures were real and are worth naming, because
 * the doctor is built around detecting exactly them:
 *
 *   1. **A Node that cannot run dsh at all.** `dsh/lib/bin.js` ends with
 *      `if (import.meta.main) await runCli()`. `import.meta.main` is only
 *      implemented from Node 24; on Node 20 and 22 it is `undefined`, so the
 *      guard is falsy, the CLI prints *nothing*, and it exits 0. Measured:
 *      Node v22.13.1 -> silent no-op; Node v24.13.0 -> prints the version. A
 *      user on 22 therefore sees "the skin did nothing" and concludes the
 *      install failed. Nothing is wrong with the install.
 *
 *   2. **A release tag that shares a version string with a newer branch.**
 *      Tag `1.0.3` and `main` both report `version: 1.1.0` while holding
 *      different bytes, so an installed copy cannot be identified from its
 *      version. `--doctor` compares the build fingerprint baked into
 *      `lib/client.js` at build time, which does distinguish them.
 */

import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readlinkSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { sourceFingerprint } from './scripts/source-fingerprint.mjs'

const PACKAGE_NAME = 'dsh-frutiger-aero'
const HERE = dirname(fileURLToPath(import.meta.url))
const SOURCE_DIR = join(HERE, 'packages', 'frutiger-aero')

/** This package's own version, read from the package it is about to install. */
const SOURCE_PKG = JSON.parse(readFileSync(join(SOURCE_DIR, 'package.json'), 'utf8'))

/**
 * The lowest Node this plugin's tooling runs on, and the lowest that can run
 * the Harness CLI at all.
 *
 * These are not the same number and both matter. `install.mjs` is plain ESM
 * and would run on 18, but installing a skin the user then cannot start is not
 * a successful install — `dsh` silently does nothing below Node 24, because
 * `import.meta.main` is unimplemented there. So the floor is 24, and the
 * package's `engines` field says so.
 */
const MIN_NODE_MAJOR = 24

/** The major version of the Node running this script. */
function nodeMajor() {
  return Number(process.versions.node.split('.')[0])
}

/** Everything a diagnostic needs to know about one installed copy. */
function inspect(target) {
  const info = {
    path: target,
    present: false,
    mode: 'missing',
    version: undefined,
    fingerprint: undefined,
    files: {},
    problems: [],
  }
  if (!existsSync(target) && !isSymlink(target)) {
    info.problems.push('not installed in this profile')
    return info
  }
  info.present = true
  try {
    info.mode = lstatSync(target).isSymbolicLink() ? 'link' : 'copy'
  } catch {
    info.mode = 'unreadable'
  }

  for (const relative of ['package.json', 'lib/index.js', 'lib/client.js']) {
    info.files[relative] = existsSync(join(target, relative))
  }

  const manifest = readJsonSafe(join(target, 'package.json'))
  if (manifest === undefined) info.problems.push('package.json is missing or unreadable')
  else info.version = manifest.version

  const client = readFileSafe(join(target, 'lib', 'client.js'))
  if (client === undefined) info.problems.push('lib/client.js is missing — the browser half cannot load')
  else {
    // The artifact carries its own identity; read it rather than infer it.
    const match = /"fingerprint":"([a-f0-9]+)"/.exec(client)
    info.fingerprint = match ? match[1] : undefined
    if (info.fingerprint === undefined) {
      info.problems.push('lib/client.js has no build fingerprint — it predates fingerprinting, or is truncated')
    }
    for (const [sheet, marker] of Object.entries(SHEET_MARKERS)) {
      if (!client.includes(marker)) info.problems.push(`lib/client.js is missing the ${sheet} stylesheet (corrupt or stale)`)
    }
  }
  if (!info.files['lib/index.js']) info.problems.push('lib/index.js is missing — the host half cannot load')

  // A symlink whose target has gone is the one failure mode that looks
  // perfectly healthy from `ls` and from the manifest.
  if (info.mode === 'link') {
    try {
      realpathSync(target)
    } catch {
      info.problems.push(`it is a symlink to ${readLinkSafe(target)}, which no longer exists — re-run without --link`)
    }
  }
  return info
}

/**
 * Distinctive substrings that must appear in a built `lib/client.js`, one per
 * stylesheet, used to tell a complete artifact from a truncated or
 * stale one. Each is a real selector from that sheet rather than a comment, so
 * minification or comment stripping cannot make a healthy build look broken.
 */
const SHEET_MARKERS = {
  base: '--fa-panel-solid',
  material: '[data-fa-canvas]',
  mobile: 'data-trajectory-scroll',
}

/** Read a JSON file, returning undefined instead of throwing on any problem. */
function readJsonSafe(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return undefined
  }
}

/** Read a text file, returning undefined instead of throwing. */
function readFileSafe(path) {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return undefined
  }
}

/** The target of a symlink, for a message, or '?' when it cannot be read. */
function readLinkSafe(path) {
  try {
    return readlinkSync(path)
  } catch {
    return '?'
  }
}

/** In-box bundles every web profile is built from; resolved from the dsh installation. */
const WEB_PROFILE_BUNDLES = ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app']

const PROFILE_PATCH_TEMPLATE = `# Your patch layer for this dsh profile, applied after every bundle layer:
# a top-level YAML array of loader patch entries (id-targeted config
# overrides, disables, and insert lists; \`!!js\` expressions allowed).
#
# dsh-frutiger-aero added one row, \`frutiger-aero\`. To turn the skin off
# without uninstalling it:
#
#   - id: frutiger-aero
#     disabled: true
#
# To run the skin without its wallpaper, keep the row and drop the scene in the
# browser instead: the plugin exposes window.__FRUTIGER__.setScene(false), and
# honours ?frutiger=off / ?frutiger=lite / ?frutiger=full on the URL.
[]
`

const PNPM_WORKSPACE = `packages:
  - .

nodeLinker: hoisted
autoInstallPeers: false
`

/** Parse argv into the options this script understands. */
function parseArgs(argv) {
  const options = { profile: 'frutiger', home: undefined, link: false, uninstall: false, print: false, json: false, doctor: false, repair: false }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--profile' || arg === '-p') options.profile = argv[++index]
    else if (arg === '--home') options.home = argv[++index]
    else if (arg === '--link') options.link = true
    else if (arg === '--uninstall') options.uninstall = true
    else if (arg === '--doctor') options.doctor = true
    else if (arg === '--repair') options.repair = true
    else if (arg === '--print') options.print = true
    else if (arg === '--json') options.json = true
    else if (arg === '--help' || arg === '-h') {
      process.stdout.write(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0].replace(/^\/\*\*?/, '').replace(/^ ?\* ?/gm, '') + '\n')
      process.exit(0)
    } else {
      process.stderr.write(`dsh-frutiger-aero: unknown argument ${JSON.stringify(arg)}\n`)
      process.exit(2)
    }
  }
  return options
}

/** Resolve the Harness home the same way dsh does. */
function resolveHome(explicit) {
  if (explicit !== undefined) return resolve(explicit)
  if (process.env.DSH_HOME !== undefined && process.env.DSH_HOME !== '') return resolve(process.env.DSH_HOME)
  return join(homedir(), '.dsh')
}

/** Read a JSON file, or return undefined when it is absent. */
function readJson(path) {
  if (!existsSync(path)) return undefined
  return JSON.parse(readFileSync(path, 'utf8'))
}

/** Write JSON in the same shape the harness itself writes. */
function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, undefined, 2)}\n`)
}

/** True when the path is a symlink (so a stale --link install can be replaced, not followed). */
function isSymlink(path) {
  try {
    return lstatSync(path).isSymbolicLink()
  } catch {
    return false
  }
}

/**
 * Insert this package into a bundle list at the end.
 *
 * Order is load order for the patch layers, and this plugin's row has to be
 * applied after the web bundle's own insert — appending is the only correct
 * position. It is also the position that makes the profile's own
 * `cordis.patch.yml` (applied after every layer) able to override the row.
 *
 * @param bundles - the manifest's current list.
 * @returns the list with this package present, once, last.
 */
function withBundle(bundles) {
  const next = (Array.isArray(bundles) ? bundles : []).filter((name) => name !== PACKAGE_NAME)
  next.push(PACKAGE_NAME)
  return next
}

/** Install the package payload into one profile. */
function installPayload(profileDir, link) {
  const target = join(profileDir, 'node_modules', PACKAGE_NAME)
  if (existsSync(target) || isSymlink(target)) rmSync(target, { recursive: true, force: true })
  mkdirSync(dirname(target), { recursive: true })
  if (link) {
    symlinkSync(SOURCE_DIR, target, 'junction')
    return { target, mode: 'link' }
  }
  cpSync(SOURCE_DIR, target, {
    recursive: true,
    // `src` and the build script are useful next to an installed copy, but an
    // installed profile only ever loads `lib`; keeping it lean keeps the copy
    // fast and the profile readable.
    filter: (source) => !source.includes(`${join(SOURCE_DIR, 'src')}`) && !source.endsWith('build.mjs'),
  })
  return { target, mode: 'copy' }
}

/**
 * Diagnose one profile's install and say what to do about it.
 *
 * The report is deliberately written as *findings with a next action* rather
 * than a pass/fail. The failure this replaces gave the user a single move —
 * wipe the profile and reinstall — which is both destructive and, when the
 * cause was an unstartable Node, guaranteed not to help.
 *
 * @param home - resolved Harness home.
 * @param profile - profile name.
 * @returns a structured report; `problems` is empty when everything checks out.
 */
function diagnose(home, profile) {
  const profileDir = join(home, 'profiles', profile)
  const target = join(profileDir, 'node_modules', PACKAGE_NAME)
  const problems = []
  const notes = []

  // 1. Can the CLI the user is about to run even start?
  const major = nodeMajor()
  if (major < MIN_NODE_MAJOR) {
    problems.push({
      what: `Node ${process.versions.node} cannot run the Harness CLI`,
      why:
        `\`dsh\` dispatches through \`if (import.meta.main)\`, which is unimplemented before Node ${MIN_NODE_MAJOR}. ` +
        'On this version the check is falsy, so dsh prints nothing and exits 0 — which looks exactly like a broken install.',
      fix: `Run with Node ${MIN_NODE_MAJOR} or newer. Nothing about your install is wrong.`,
    })
  } else {
    notes.push(`Node ${process.versions.node} can run the Harness CLI`)
  }

  // 2. Is there a profile manifest, and does it name this bundle?
  const manifestPath = join(profileDir, 'package.json')
  const manifest = readJsonSafe(manifestPath)
  if (manifest === undefined) {
    problems.push({
      what: `no readable profile manifest at ${manifestPath}`,
      why: 'the profile has never been created, or its package.json is corrupt',
      fix: 'run the installer without --doctor to create it (your sessions are kept)',
    })
  } else {
    const bundles = manifest?.dsh?.profile?.bundles
    if (!Array.isArray(bundles)) {
      problems.push({
        what: 'the manifest has no dsh.profile.bundles list',
        why: 'the profile was not written by this installer, or was edited by hand',
        fix: 'run the installer without --doctor to rewrite the manifest',
      })
    } else if (!bundles.includes(PACKAGE_NAME)) {
      problems.push({
        what: `${PACKAGE_NAME} is not in dsh.profile.bundles`,
        why: 'the bundle layer stack is what loads the skin; without the row it is never composed in',
        fix: 'run the installer without --doctor to add it back',
      })
    } else {
      const index = bundles.indexOf(PACKAGE_NAME)
      if (index !== bundles.length - 1) {
        notes.push(`${PACKAGE_NAME} is at position ${index + 1} of ${bundles.length}; last is preferred so its patch layer applies after the web bundle`)
      } else {
        notes.push(`${PACKAGE_NAME} is the last bundle, which is the intended position`)
      }
    }
  }

  // 3. Is the payload present and intact?
  const installed = inspect(target)
  for (const problem of installed.problems) {
    problems.push({
      what: `the installed package is incomplete: ${problem}`,
      why: 'the copy was interrupted, or something removed files from it',
      fix: 'run with --repair to re-copy the payload in place — this keeps the profile and its sessions',
    })
  }

  // 4. Does the installed copy match the one we are holding?
  //
  //    The comparison is on *source* identity, computed the same way here as in
  //    `build.mjs`. Reading the installed copy's own fingerprint would only
  //    work for copies new enough to carry it, which is precisely the case that
  //    does not need checking — the copies most likely to be stale are the ones
  //    that predate the field.
  const sourceFingerprintHere = sourceFingerprint(SOURCE_DIR)
  if (installed.present && installed.fingerprint && sourceFingerprintHere) {
    if (installed.fingerprint === sourceFingerprintHere) {
      notes.push(`installed build matches this checkout (${installed.fingerprint})`)
    } else {
      problems.push({
        what: `installed build ${installed.fingerprint} differs from this checkout ${sourceFingerprintHere}`,
        why: 'the profile has an older or newer copy than the one you are running the installer from',
        fix: 'run with --repair to bring it up to date — this keeps the profile and its sessions',
      })
    }
  } else if (installed.present && !installed.fingerprint) {
    problems.push({
      what: 'the installed copy predates build fingerprints, so its age cannot be determined',
      why:
        'it was installed from a release older than this one; those builds carry no way to ' +
        'identify themselves, which is why reinstalling used to produce the same code with no way to tell',
      fix: 'run with --repair to replace it with this build — this keeps the profile and its sessions',
    })
  }

  // 5. Is the profile's patch layer present, so the user has an off switch?
  const patchPath = join(profileDir, 'cordis.patch.yml')
  if (!existsSync(patchPath)) {
    problems.push({
      what: 'cordis.patch.yml is missing from the profile',
      why: 'this is the layer the user edits to disable the skin without uninstalling it',
      fix: 'run the installer without --doctor to restore the template',
    })
  }

  return {
    node: { version: process.versions.node, major, required: MIN_NODE_MAJOR },
    home,
    profile,
    profileDir,
    manifestPath,
    source: { dir: SOURCE_DIR, version: SOURCE_PKG.version, fingerprint: sourceFingerprintHere },
    installed,
    problems,
    notes,
    healthy: problems.length === 0,
  }
}

/** Render a doctor report for a terminal. */
function formatReport(report) {
  const lines = []
  lines.push(`dsh-frutiger-aero: doctor — profile ${JSON.stringify(report.profile)}`)
  lines.push(`  home      ${report.home}`)
  lines.push(`  node      ${report.node.version} (needs >= ${report.node.required})`)
  lines.push(`  source    ${report.source.version} ${report.source.fingerprint ?? '(no build fingerprint)'}`)
  if (report.installed.present) {
    lines.push(`  installed ${report.installed.version ?? '?'} ${report.installed.fingerprint ?? '(no build fingerprint)'} (${report.installed.mode})`)
    lines.push(`  package   ${report.installed.path}`)
  } else {
    lines.push('  installed (nothing in this profile)')
  }
  lines.push('')
  for (const note of report.notes) lines.push(`  ok    ${note}`)
  for (const problem of report.problems) {
    lines.push(`  FAIL  ${problem.what}`)
    lines.push(`        why: ${problem.why}`)
    lines.push(`        fix: ${problem.fix}`)
  }
  lines.push('')
  lines.push(report.healthy ? '  nothing to fix.' : `  ${report.problems.length} problem(s) found — see the fix lines above.`)
  if (!report.healthy) lines.push('  no step above requires deleting the profile.')
  return lines.join('\n') + '\n'
}

/** The whole install, as one function so --print can run it without writing. */
function run(options) {
  const home = resolveHome(options.home)
  const profileDir = join(home, 'profiles', options.profile)
  const manifestPath = join(profileDir, 'package.json')

  if (!/^[a-z0-9][a-z0-9-]*$/.test(options.profile)) {
    throw new Error(`invalid profile name ${JSON.stringify(options.profile)}: use lowercase letters, digits and hyphens`)
  }
  if (options.profile === 'desktop') {
    throw new Error('profile "desktop" is managed exclusively by the Electron application')
  }

  // --doctor is read-only and short-circuits everything below: it must be safe
  // to run on a profile that is broken in ways the writing path would trip on.
  if (options.doctor) return diagnose(home, options.profile)

  const existing = readJson(manifestPath)
  const bundles = withBundle(
    existing?.dsh?.profile?.bundles ?? (existing === undefined ? WEB_PROFILE_BUNDLES : ['@deepseek-ai/dsh-base']),
  )

  const manifest = {
    ...(existing ?? {}),
    name: existing?.name ?? `dsh-profile-${options.profile}`,
    private: true,
    dependencies: existing?.dependencies ?? {},
    dsh: {
      ...existing?.dsh,
      profile: {
        ...existing?.dsh?.profile,
        // A skin is a live surface: the patch file reloads without a restart,
        // which is what makes `disabled: true` a one-line experiment.
        patchReload: existing?.dsh?.profile?.patchReload ?? 'live',
        bundles,
      },
    },
  }

  const plan = {
    home,
    profileDir,
    manifestPath,
    manifest,
    uninstall: options.uninstall,
    payload: options.uninstall ? { target: join(profileDir, 'node_modules', PACKAGE_NAME), mode: 'removed' } : undefined,
  }
  if (options.print) return plan

  if (options.uninstall) {
    rmSync(join(profileDir, 'node_modules', PACKAGE_NAME), { recursive: true, force: true })
    if (existsSync(manifestPath)) {
      const next = {
        ...manifest,
        dsh: {
          ...manifest.dsh,
          profile: {
            ...manifest.dsh.profile,
            bundles: bundles.filter((name) => name !== PACKAGE_NAME),
          },
        },
      }
      writeJson(manifestPath, next)
    }
    return plan
  }

  if (!existsSync(SOURCE_DIR)) throw new Error(`the plugin package is missing at ${SOURCE_DIR}`)

  mkdirSync(profileDir, { recursive: true })
  writeJson(manifestPath, manifest)

  const root = join(profileDir, 'cordis.yml')
  if (!existsSync(root)) {
    writeFileSync(
      root,
      '# dsh profile root — an empty entry list. The tree is composed as patches:\n' +
        "# each bundle in package.json's dsh.profile.bundles, then cordis.patch.yml, then any\n" +
        '# --patch overlays. Edit cordis.patch.yml, not this file.\n[]\n',
    )
  }
  const patch = join(profileDir, 'cordis.patch.yml')
  // A missing patch file is restored even on --repair: it is the user's off
  // switch, and its absence is one of the things --doctor reports.
  if (!existsSync(patch)) writeFileSync(patch, PROFILE_PATCH_TEMPLATE)
  const workspace = join(profileDir, 'pnpm-workspace.yaml')
  if (!existsSync(workspace)) writeFileSync(workspace, PNPM_WORKSPACE)

  plan.payload = installPayload(profileDir, options.link)
  plan.repaired = options.repair
  return plan
}

const options = parseArgs(process.argv.slice(2))
let result
try {
  result = run(options)
} catch (error) {
  process.stderr.write(`dsh-frutiger-aero: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
}

/** The build identity of an installed payload, or undefined if it cannot be read. */
function installedIdentity(target) {
  const client = readFileSafe(join(target, 'lib', 'client.js'))
  if (client === undefined) return undefined
  const match = /"fingerprint":"([a-f0-9]+)"/.exec(client)
  return match ? match[1] : undefined
}

if (options.json) {
  process.stdout.write(`${JSON.stringify(result, undefined, 2)}\n`)
} else if (options.doctor) {
  process.stdout.write(formatReport(result))
  // A report is information, not a failure: exit non-zero only when something
  // is actually wrong, so `--doctor` can be used in a script or a CI step.
  process.exit(result.healthy ? 0 : 1)
} else if (options.print) {
  process.stdout.write(`profile directory: ${result.profileDir}\nmanifest:\n${JSON.stringify(result.manifest, undefined, 2)}\n`)
} else if (options.uninstall) {
  process.stdout.write(
    `dsh-frutiger-aero: removed from profile ${JSON.stringify(options.profile)} at ${result.profileDir}\n` +
      `the profile itself was kept, so its sessions are untouched.\n`,
  )
} else {
  // Print what was installed, not only where. A version string alone cannot
  // tell two builds apart — a release tag and a branch can both say `1.1.0` —
  // so the fingerprint is the part that lets a user answer "did I get the
  // build I meant to?" without guessing.
  const output = [
    `dsh-frutiger-aero: ${result.repaired ? 'repaired' : 'installed'} profile ${JSON.stringify(options.profile)} (${result.payload.mode})`,
    `  version   ${SOURCE_PKG.version}`,
    `  build     ${installedIdentity(result.payload.target) ?? '(no fingerprint)'}`,
    `  profile   ${result.profileDir}`,
    `  package   ${result.payload.target}`,
  ]
  // The check below is not decoration: without it a user on an older Node gets
  // a cheerful success message and a CLI that silently does nothing.
  const major = nodeMajor()
  if (major < MIN_NODE_MAJOR) {
    output.push(
      '',
      `  WARNING: this Node (${process.versions.node}) cannot run the Harness CLI.`,
      `  \`dsh\` needs Node ${MIN_NODE_MAJOR} or newer — below that it exits silently`,
      '  without printing anything, which looks like a failed install.',
      `  Re-run with Node ${MIN_NODE_MAJOR}+ and the same command.`,
    )
  }
  output.push(
    '',
    '  start it:',
    `    dsh --profile ${options.profile} --port 3099 --no-open`,
    '',
    '  then open the URL that command prints (it carries the one-time token).',
    '',
    '  something wrong?',
    `    node install.mjs --profile ${options.profile} --doctor`,
    '',
  )
  process.stdout.write(output.join('\n'))
}
