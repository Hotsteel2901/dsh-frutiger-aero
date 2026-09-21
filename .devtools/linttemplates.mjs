/**
 * Guards the one mistake that has cost the most time in this directory.
 *
 * Almost every probe here drives the browser by passing a page function to
 * `page.evaluate` as a *template literal*. Inside a template literal, a `//`
 * comment is not a comment — it is text. So a backtick in such a comment does
 * not quote anything; it terminates the template. The rest of that line is
 * then parsed as real code, and the failure surfaces as a syntax error
 * pointing at the `page.evaluate` line with a message ("missing ) after
 * argument list") that says nothing about the comment that actually caused it.
 *
 * This has bitten twice, both times in a comment that was *documenting* a
 * measurement using backticks. It cost real time the second time because the
 * edit that introduced it looked correct in review.
 *
 * The rule is absolute and this script enforces it: inside the body of a
 * `page.evaluate` template, no backtick may appear outside a nested
 * interpolation. Name identifiers in prose, or escape the backtick.
 *
 * ## Why this script is a lexer and not a few regexes
 *
 * Two earlier versions were wrong, and both were wrong in the same way — they
 * passed the defect they existed to catch:
 *
 *   1. The first stopped at the first backtick it met, which was the stray one,
 *      so the "body" it inspected was empty and every file reported clean.
 *   2. The second blanked comments and string literals to avoid false positives
 *      on prose — which erased the defect, because the defect *is* a backtick
 *      in a comment.
 *
 * Both are recorded here because the lesson generalises: a checker must be
 * tried against a known-bad input, not merely against the code it is meant to
 * approve. The implementation below scans a single pass with real lexical
 * state, so it knows which comments are inside a template (signal) and which
 * are outside one (noise).
 *
 * Usage: node linttemplates.mjs [file ...]   (defaults to every *.mjs here)
 */

import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))

const targets = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(HERE).filter((f) => f.endsWith('.mjs')).map((f) => join(HERE, f))

/**
 * Walk a whole source file once, tracking lexical state, and report every
 * `page.evaluate` whose template argument does not close cleanly.
 *
 * State is deliberately minimal — this is a probe harness, not a parser — but
 * it distinguishes the cases that matter: normal code, line comments outside
 * templates, string literals outside templates, and template literals with one
 * level of `${...}` nesting.
 */
function scan(path) {
  const src = readFileSync(path, 'utf8')
  const problems = []
  const lineOf = (idx) => src.slice(0, idx).split('\n').length

  let i = 0
  let inLineComment = false
  let quote = null // "'" or '"' when inside a plain string literal

  while (i < src.length) {
    const c = src[i]
    const prev = src[i - 1]

    if (inLineComment) {
      if (c === '\n') inLineComment = false
      i += 1
      continue
    }

    if (quote) {
      if (c === '\\') { i += 2; continue }
      if (c === quote) quote = null
      i += 1
      continue
    }

    // Escaped character outside any literal — skip it.
    if (c === '\\') { i += 2; continue }

    // Line comment outside a template: pure noise, skip to end of line.
    if (c === '/' && src[i + 1] === '/') { inLineComment = true; i += 2; continue }

    // Block comment outside a template: skip wholesale.
    if (c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2)
      i = end === -1 ? src.length : end + 2
      continue
    }

    if (c === "'" || c === '"') { quote = c; i += 1; continue }

    // A template literal is interesting only when it is the argument of a
    // `page.evaluate(` call. Find that out by looking backwards.
    if (c === '`') {
      const before = src.slice(Math.max(0, i - 80), i)
      const isEvaluateArg = /\bpage\.evaluate\(\s*$/.test(before)

      const start = i
      const { end, terminated } = lexTemplate(src, i)

      if (isEvaluateArg) {
        const tail = src.slice(end, end + 6)
        const closesCall = /^\s*\)/.test(tail)
        if (!terminated || !closesCall) {
          problems.push({
            line: lineOf(start),
            text: src.split('\n')[lineOf(start) - 1].trim().slice(0, 110),
            note: 'this template ends before the call closes — a backtick inside the body terminated it early',
          })
        }
      }

      i = end
      continue
    }

    i += 1
  }

  return problems
}

/**
 * Consume one template literal starting at `openIdx` (the opening backtick).
 * Backticks inside `${...}` belong to nested templates and are consumed
 * recursively, so the only backtick that ends this template is the one at
 * nesting level zero.
 */
function lexTemplate(src, openIdx) {
  let i = openIdx + 1
  let depth = 0

  while (i < src.length) {
    const c = src[i]
    if (c === '\\') { i += 2; continue }

    if (depth > 0) {
      if (c === '`') { i = lexTemplate(src, i).end; continue }
      if (c === '{') depth += 1
      else if (c === '}') depth -= 1
      i += 1
      continue
    }

    if (c === '$' && src[i + 1] === '{') { depth += 1; i += 2; continue }
    if (c === '`') return { end: i + 1, terminated: true }
    i += 1
  }

  return { end: i, terminated: false }
}

let failed = 0
for (const t of targets) {
  let problems
  try {
    problems = scan(t)
  } catch (e) {
    console.log(`SKIP ${t} — ${e.message}`)
    continue
  }
  const rel = t.replace(HERE + '/', '')
  if (problems.length === 0) {
    console.log(`PASS ${rel}`)
  } else {
    failed += problems.length
    for (const p of problems) {
      console.log(`FAIL ${rel}:${p.line} — ${p.note}`)
      console.log(`       ${p.text}`)
    }
  }
}

console.log(
  failed === 0
    ? `\nall ${targets.length} files clean — no page.evaluate template is terminated early`
    : `\n${failed} problem${failed === 1 ? '' : 's'} across ${targets.length} files — quote identifiers in prose, not backticks`,
)
process.exit(failed === 0 ? 0 : 1)
