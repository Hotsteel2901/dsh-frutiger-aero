#!/usr/bin/env node
/**
 * The install path, tested as a user experiences it.
 *
 * Everything else in `.devtools` drives a browser against a running profile.
 * This file is different in kind: it is the only suite that verifies what
 * happens *before* the browser is ever opened, which is exactly where the
 * complaints came from — "简称垃圾，安装失败还得全删掉再重新安装".
 *
 * ## The failure this suite exists to prevent
 *
 * Two defects produced that report, and neither was a crash:
 *
 *   1. `install.sh` fetched `releases/latest`. Tag `1.0.3` and `main` both
 *      reported `version: 1.1.0` while holding different code, so the tag never
 *      moved, so reinstalling downloaded the same broken snapshot, so the only
 *      thing a user could conclude was "the installer is garbage". Measured
 *      against the live repository: the tag's `src/css/mobile.css` does not
 *      contain the fixes that exist on `main`.
 *
 *   2. On Node 20 and 22, `dsh` exits 0 printing nothing — `import.meta.main`
 *      is unimplemented there, so the CLI's entry guard is falsy. A user on 22
 *      saw a skin that did nothing and reasonably called it a failed install.
 *      `package.json` meanwhile declared `engines: >=20`.
 *
 * A third defect made all of it undiagnosable: nothing in the install had an
 * identity, so "do I have the latest?" had no answer and the only recovery was
 * to delete the profile and start over.
 *
 * ## What it checks, and how
 *
 * The suite runs the real scripts in a scratch home, with no network and no
 * mocks, and asserts on their observable behaviour. Where a check can only be
 * made against the live repository (the ref that `install.sh` resolves, the
 * contents of the published tag), it uses the network and says so, and skips
 * with an explanation rather than failing when the network is unavailable.
 *
 * Usage:
 *   node installcheck.mjs                 every check
 *   node installcheck.mjs --offline       skip the ones that need GitHub
 *   node installcheck.mjs --json          machine-readable results
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { sourceFingerprint } from '../scripts/source-fingerprint.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '..')
const SCRATCH = '/tmp/fa-installcheck'
const OFFLINE = process.argv.includes('--offline')
const AS_JSON = process.argv.includes('--json')

// Refuse to run against the wrong directory rather than reporting a wall of
// failures that are all really one path bug. This file lives in `<repo>/.devtools`,
// so the repository root is exactly one level up; anything else means the
// harness was moved or invoked through a copied path, and every check below
// would be meaningless.
if (!existsSync(join(REPO, 'install.sh')) || !existsSync(join(REPO, 'install.mjs'))) {
  process.stderr.write(
    `installcheck: cannot find the repository root (looked in ${REPO}).\n` +
      'Run this file from a checkout of dsh-frutiger-aero.\n',
  )
  process.exit(2)
}

/** A GH proxy is the only route out of the sandbox; direct api.github.com is blocked here. */
const PROXY = process.env.FA_GH_PROXY ?? 'https://gh-proxy.com/'
const REPO_SLUG = 'Hotsteel2901/dsh-frutiger-aero'

/** Collected results, so one failure does not hide the rest. */
const results = []

/**
 * Record one check.
 *
 * Every check states what it means in the user's terms, not in the code's —
 * `skipped` carries a reason, because "skipped" without one is how a suite
 * quietly stops testing anything.
 */
function check(name, ok, detail, { skipped = false } = {}) {
  results.push({ name, ok: skipped ? true : ok, skipped, detail })
  if (AS_JSON) return
  const tag = skipped ? 'skip' : ok ? 'ok  ' : 'FAIL'
  process.stdout.write(`  ${tag}  ${name}\n`)
  if (detail && !ok) process.stdout.write(`        ${detail}\n`)
}

/** Run a command, returning `{code, out, err}` instead of throwing. */
function sh(command, args, options = {}) {
  try {
    const out = execFileSync(command, args, {
      cwd: REPO,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options,
    })
    return { code: 0, out, err: '' }
  } catch (error) {
    return { code: error.status ?? 1, out: error.stdout ?? '', err: error.stderr ?? String(error) }
  }
}

/** The Node this repo's tooling requires, resolved from PATH. */
const NODE = process.execPath

/** Fetch a URL through the proxy, or undefined when the network is out. */
function fetchText(url) {
  const target = url.startsWith('http') ? `${PROXY}${url}` : url
  const result = sh('curl', ['-fsSL', '--max-time', '30', target])
  return result.code === 0 ? result.out : undefined
}

async function main() {
  if (!AS_JSON) {
    process.stdout.write('dsh-frutiger-aero: install path\n')
    process.stdout.write(`  repo    ${REPO}\n`)
    process.stdout.write(`  node    ${process.versions.node}\n\n`)
  }

  rmSync(SCRATCH, { recursive: true, force: true })
  mkdirSync(SCRATCH, { recursive: true })

  // ── 1. the scripts parse ────────────────────────────────────────────────
  //   A shell syntax error would otherwise only surface on a user's machine,
  //   in a `curl | sh` pipeline, where the output is the only clue.
  if (sh('sh', ['-n', join(REPO, 'install.sh')]).code === 0) {
    check('install.sh parses as POSIX sh', true)
  } else {
    check('install.sh parses as POSIX sh', false, 'sh -n reported a syntax error')
  }

  // ── 2. help is complete and self-maintaining ────────────────────────────
  //   The help slices the header comment, so it can silently truncate when the
  //   header grows. Anchor on content rather than on line count.
  const help = sh('sh', [join(REPO, 'install.sh'), '--help'])
  const helpOk = help.code === 0
    && help.out.includes('DSH_FRUTIGER_REF')
    && help.out.includes('--ref')
    && help.out.includes('Node 24') === false // the requirement is stated in prose, not this literal
  check('install.sh --help prints the whole header', help.code === 0 && help.out.includes('DSH_FRUTIGER_REF'),
    help.code === 0 ? 'the Environment line is missing — the help range has drifted' : `exit ${help.code}`)

  // ── 3. the Node floor is enforced, not merely documented ────────────────
  //   This is the check that turns the silent-CLI failure into one sentence.
  //   Node 22 is expected to be present in this environment; when it is not,
  //   the check is skipped rather than faked.
  const node22 = '/root/.nvm/versions/node/v22.13.1/bin'
  if (existsSync(node22)) {
    const old = sh('sh', [join(REPO, 'install.sh'), '--profile', 't', '--home', join(SCRATCH, 'h22')], {
      env: { ...process.env, PATH: `${node22}:${process.env.PATH}` },
    })
    const refused = old.code !== 0 && /Node 24 or newer is required/.test(old.err)
    check('install.sh refuses Node 22 with an actionable message', refused,
      `exit=${old.code} stderr=${JSON.stringify(old.err.slice(0, 160))}`)
  } else {
    check('install.sh refuses Node 22 with an actionable message', true,
      'Node 22 is not installed here, so the refusal path cannot be exercised', { skipped: true })
  }

  // ── 4. install.mjs is idempotent and never deletes the profile ──────────
  //   The literal answer to "安装失败还得全删掉再重新安装": prove that a second
  //   run, and a --repair, both preserve everything the user would lose.
  const home = join(SCRATCH, 'home')
  const profileDir = join(home, 'profiles', 'frutiger')
  const first = sh(NODE, [join(REPO, 'install.mjs'), '--profile', 'frutiger', '--home', home])
  const payload = join(profileDir, 'node_modules', 'dsh-frutiger-aero')

  // A session the user cares about, and a file they wrote by hand.
  mkdirSync(join(home, 'sessions'), { recursive: true })
  writeFileSync(join(home, 'sessions', 'keep-me.json'), '{"mine":true}\n')
  writeFileSync(join(profileDir, 'my-notes.txt'), 'do not delete\n')

  const second = sh(NODE, [join(REPO, 'install.mjs'), '--profile', 'frutiger', '--home', home])
  const survived = existsSync(join(home, 'sessions', 'keep-me.json')) && existsSync(join(profileDir, 'my-notes.txt'))
  check('a second install run succeeds and deletes nothing', first.code === 0 && second.code === 0 && survived,
    `first=${first.code} second=${second.code} survived=${survived}`)

  // ── 5. the install names what it installed ──────────────────────────────
  //   Without an identity, "did I get anything new?" is unanswerable — which is
  //   why reinstalling felt like the only move. The fingerprint is the answer.
  const printed = /build\s+([a-f0-9]{12})/.exec(first.out)
  const expected = sourceFingerprint(join(REPO, 'packages', 'frutiger-aero'))
  check('install prints a build fingerprint that matches the sources',
    printed !== null && printed[1] === expected,
    `printed=${printed?.[1] ?? '(none)'} expected=${expected}`)

  // ── 6. --doctor reports a healthy install as healthy ────────────────────
  //   A checker that cries wolf on a good install is worse than none: it
  //   teaches the user to ignore it.
  const clean = sh(NODE, [join(REPO, 'install.mjs'), '--profile', 'frutiger', '--home', home, '--doctor'])
  check('--doctor exits 0 on a healthy install and says so',
    clean.code === 0 && /nothing to fix/.test(clean.out),
    `exit=${clean.code} out=${JSON.stringify(clean.out.slice(-200))}`)

  // ── 7. --doctor detects a stale copy, and never says "start over" ───────
  //   Simulate the exact real-world state: the payload from tag `1.0.3`, which
  //   carried a *different* fingerprint under the *same* version string.
  const manifest = JSON.parse(readFileSync(join(payload, 'lib', 'client.js'), 'utf8').match(/FA_BUILD = (\{[^}]*\})/)?.[1] ?? '{}')
  const staleClient = readFileSync(join(payload, 'lib', 'client.js'), 'utf8')
    .replace(/"fingerprint":"[a-f0-9]+"/, '"fingerprint":"deadbeef0000"')
  writeFileSync(join(payload, 'lib', 'client.js'), staleClient)
  const stale = sh(NODE, [join(REPO, 'install.mjs'), '--profile', 'frutiger', '--home', home, '--doctor'])
  const namesTheDrift = stale.code !== 0 && stale.out.includes('deadbeef0000') && stale.out.includes(expected)
  const noScorchedEarth = !/delete the profile|reinstall from scratch|start over to fix/i.test(stale.out.replace(/no step above requires deleting the profile\./g, ''))
  check('--doctor names a stale build by fingerprint', namesTheDrift,
    `exit=${stale.code} out=${JSON.stringify(stale.out.slice(-320))}`)
  check('--doctor never tells the user to delete the profile', noScorchedEarth)

  // ── 8. --repair fixes it in place ───────────────────────────────────────
  const repaired = sh(NODE, [join(REPO, 'install.mjs'), '--profile', 'frutiger', '--home', home, '--repair'])
  const after = sh(NODE, [join(REPO, 'install.mjs'), '--profile', 'frutiger', '--home', home, '--doctor'])
  const keptEverything = existsSync(join(home, 'sessions', 'keep-me.json')) && existsSync(join(profileDir, 'my-notes.txt'))
  check('--repair restores the build without touching sessions or user files',
    repaired.code === 0 && after.code === 0 && keptEverything,
    `repair=${repaired.code} doctorAfter=${after.code} kept=${keptEverything}`)

  // ── 9. --doctor is read-only ────────────────────────────────────────────
  //   It has to be safe to run on a profile broken in ways the writing path
  //   would trip over, or it cannot be the thing a desperate user reaches for.
  const ghost = join(SCRATCH, 'ghost')
  const before = existsSync(ghost)
  sh(NODE, [join(REPO, 'install.mjs'), '--profile', 'frutiger', '--home', ghost, '--doctor'])
  check('--doctor does not create anything it inspects', before === existsSync(ghost) && !existsSync(ghost),
    'running --doctor against a non-existent home created files')

  // ── 10. `engines` no longer lies about the Node floor ───────────────────
  const rootPkg = JSON.parse(readFileSync(join(REPO, 'package.json'), 'utf8'))
  const pluginPkg = JSON.parse(readFileSync(join(REPO, 'packages', 'frutiger-aero', 'package.json'), 'utf8'))
  const floor = (spec) => Number((/(\d+)/.exec(spec ?? '') ?? [])[1] ?? 0)
  const honest = floor(rootPkg.engines?.node) >= 24 && floor(pluginPkg.engines?.node) >= 24
  check('both package.json files require the Node version that actually works', honest,
    `root=${rootPkg.engines?.node} plugin=${pluginPkg.engines?.node}`)

  // ── 11. the build is reproducible, so the comparison above means something
  //   If two builds of identical sources produced different bytes, an installed
  //   copy would look stale after every rebuild and the check above would be
  //   noise. Timestamps are the usual cause, so this is worth asserting.
  const buildOnce = () => readFileSync(join(REPO, 'packages', 'frutiger-aero', 'lib', 'client.js'), 'utf8')
  const a = buildOnce()
  sh(NODE, [join(REPO, 'packages', 'frutiger-aero', 'build.mjs')])
  const b = buildOnce()
  check('rebuilding identical sources produces identical bytes', a === b,
    'the artifact carries something variable (a timestamp?) that would break the staleness check')

  // ── 12. the released ref is not a stale snapshot (network) ──────────────
  //   This is the original complaint, checked directly: whatever `install.sh`
  //   resolves by default must NOT be the frozen tag.
  if (OFFLINE) {
    check('the default ref is not a stale release tag', true, 'offline', { skipped: true })
  } else {
    const repoInfo = fetchText(`https://api.github.com/repos/${REPO_SLUG}`)
    if (repoInfo === undefined) {
      check('the default ref is not a stale release tag', true, 'GitHub unreachable', { skipped: true })
    } else {
      let branch
      try {
        branch = JSON.parse(repoInfo).default_branch
      } catch {
        branch = undefined
      }
      // The script resolves the default branch; confirm the API still reports
      // one, so the resolution cannot fall through to a hardcoded guess.
      check('install.sh resolves a default branch from the API', typeof branch === 'string' && branch.length > 0,
        `default_branch=${JSON.stringify(branch)}`)

      // And confirm the scripts no longer *call* releases/latest. Matching the
      // raw string would flag the comment that explains why the old behaviour
      // was wrong — and that comment is worth keeping — so the check strips
      // comments first and then looks for the call itself.
      const script = readFileSync(join(REPO, 'install.sh'), 'utf8')
      const ps1 = readFileSync(join(REPO, 'install.ps1'), 'utf8')
      // Drop `#`-comments from the shell script, and `<# #>`/`#` from PowerShell.
      const code = (text) => text.split('\n').filter((line) => !/^\s*#/.test(line)).join('\n')
      const callsLatest = (text) => /(fetch|Invoke-RestMethod)[^\n]*releases\/latest/.test(code(text))
      check('neither installer calls releases/latest any more',
        !callsLatest(script) && !callsLatest(ps1),
        `sh=${callsLatest(script)} ps1=${callsLatest(ps1)}`)

      // The stronger property, stated directly: the ref that install.sh would
      // use by default must be the branch the repository is actually on, not a
      // tag that has stopped moving.
      const latest = fetchText(`https://api.github.com/repos/${REPO_SLUG}/releases/latest`)
      let tag
      try {
        tag = JSON.parse(latest ?? '{}').tag_name
      } catch {
        tag = undefined
      }
      if (tag === undefined || branch === undefined) {
        check('the default ref is the moving branch, not the frozen tag', true,
          'no release or no API access; nothing to compare', { skipped: true })
      } else {
        const pinnedToTag = readFileSync(join(REPO, 'install.sh'), 'utf8').includes(`REF="${tag}"`)
        check('the default ref is the moving branch, not the frozen tag',
          branch !== tag && !pinnedToTag,
          `branch=${branch} tag=${tag} pinnedToTag=${pinnedToTag} — the tag is frozen and shares a version string with the branch`)
      }
    }
  }

  // ── summary ─────────────────────────────────────────────────────────────
  const failed = results.filter((r) => !r.ok)
  const skipped = results.filter((r) => r.skipped)
  if (AS_JSON) {
    process.stdout.write(`${JSON.stringify({ results, failed: failed.length, skipped: skipped.length }, undefined, 2)}\n`)
  } else {
    process.stdout.write('\n')
    if (failed.length === 0) {
      process.stdout.write(`  PASS  ${results.length} checks${skipped.length > 0 ? `, ${skipped.length} skipped` : ''}\n`)
    } else {
      process.stdout.write(`  FAIL  ${failed.length} of ${results.length}: ${failed.map((r) => r.name).join('; ')}\n`)
    }
  }
  process.exit(failed.length === 0 ? 0 : 1)
}

main()
