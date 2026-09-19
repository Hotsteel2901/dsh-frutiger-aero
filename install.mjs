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
 *   node install.mjs --print                resolve everything, write nothing
 *
 * Options: --profile <name>, --home <dir>, --json.
 */

import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE_NAME = 'dsh-frutiger-aero'
const HERE = dirname(fileURLToPath(import.meta.url))
const SOURCE_DIR = join(HERE, 'packages', 'frutiger-aero')

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
  const options = { profile: 'frutiger', home: undefined, link: false, uninstall: false, print: false, json: false }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--profile' || arg === '-p') options.profile = argv[++index]
    else if (arg === '--home') options.home = argv[++index]
    else if (arg === '--link') options.link = true
    else if (arg === '--uninstall') options.uninstall = true
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
  if (!existsSync(patch)) writeFileSync(patch, PROFILE_PATCH_TEMPLATE)
  const workspace = join(profileDir, 'pnpm-workspace.yaml')
  if (!existsSync(workspace)) writeFileSync(workspace, PNPM_WORKSPACE)

  plan.payload = installPayload(profileDir, options.link)
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

if (options.json) {
  process.stdout.write(`${JSON.stringify(result, undefined, 2)}\n`)
} else if (options.print) {
  process.stdout.write(`profile directory: ${result.profileDir}\nmanifest:\n${JSON.stringify(result.manifest, undefined, 2)}\n`)
} else if (options.uninstall) {
  process.stdout.write(
    `dsh-frutiger-aero: removed from profile ${JSON.stringify(options.profile)} at ${result.profileDir}\n` +
      `the profile itself was kept, so its sessions are untouched.\n`,
  )
} else {
  process.stdout.write(
    [
      `dsh-frutiger-aero: installed into profile ${JSON.stringify(options.profile)} (${result.payload.mode})`,
      `  profile   ${result.profileDir}`,
      `  package   ${result.payload.target}`,
      '',
      '  start it:',
      `    dsh --profile ${options.profile} --port 3099 --no-open`,
      '',
      '  then open the URL that command prints (it carries the one-time token).',
      '',
    ].join('\n'),
  )
}
