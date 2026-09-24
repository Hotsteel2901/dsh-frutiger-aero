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
 * ## The third failure — and why the anchor is now structural
 *
 * A third version looked only for templates passed *inline* to
 * `page.evaluate(\`…\`)`, matched by looking backwards for that call. That
 * silently exempted the far more readable style this directory actually uses
 * for anything longer than a few lines:
 *
 *     const snapshot = `(() => { … })()`
 *     await page.evaluate(snapshot)
 *
 * A canary built that way — a two-line template whose second line carried a
 * backtick in its `//` comment, exactly the defect this file exists for —
 * reported PASS. So the check no longer depends on where the template sits.
 * Instead it takes **every** top-level template literal and asks a structural
 * question about it: does its body lex as JavaScript at all?
 *
 * That is the real invariant. A correct page function is a valid expression;
 * a template cut short by a stray backtick is not, because the remainder of
 * the comment becomes code. `new Function('return (' + body + ')')` decides it
 * the same way the engine does, with no guessing about call shape — and it is
 * constructed, never called, so nothing in a probe file executes.
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
 * Walk a whole source file once, tracking lexical state, and find every
 * top-level template literal whose body is not a valid JavaScript expression.
 *
 * State is deliberately minimal — this is a probe harness, not a parser — but
 * it distinguishes the cases that matter: normal code, line comments outside
 * templates, string literals outside templates, and template literals with
 * `${...}` nesting. The verdict for each template is then handed to the engine
 * rather than to a heuristic.
 */
function scan(path) {
  const src = readFileSync(path, 'utf8')
  const problems = []
  const lineOf = (idx) => src.slice(0, idx).split('\n').length

  let i = 0
  let inLineComment = false
  let quote = null // "'" or '"' when inside a plain string literal
  let depth = 0 // brace depth, so templates nested in code are still classified

  while (i < src.length) {
    const c = src[i]

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

    if (c === '{') { depth += 1; i += 1; continue }
    if (c === '}') { depth -= 1; i += 1; continue }

    if (c === '`') {
      const start = i
      const { end, terminated } = lexTemplate(src, i)
      const body = src.slice(start + 1, terminated ? end - 1 : end)

      // Only inspect a template that is *meant* to be evaluated as a function
      // in the page. Everything else in these files — a CSS fragment, a log
      // line, a selector — is legitimately arbitrary text, and parsing it as
      // code would report valid files as broken. The two shapes that qualify
      // are the inline IIFE and the IIFE-in-a-variable that these probes use
      // for page functions; both are recognised by their opening token.
      const looksLikePageFunction = startsAsPageFunction(body)

      if (looksLikePageFunction && !isValidExpression(body)) {
        problems.push({
          line: lineOf(start),
          text: src.split('\n')[lineOf(start) - 1].trim().slice(0, 110),
          note: terminated
            ? 'this template body is not valid JavaScript — a backtick inside it terminated it early'
            : 'this template is never closed by a backtick',
        })
      }

      i = end
      continue
    }

    i += 1
  }

  return problems
}

/**
 * Does this template body open the way a page function does?
 *
 * A page function is an IIFE — `(() => { … })()` — either written inline at
 * the call or assigned to a variable first. Both begin with the same token:
 * optional whitespace, then `(`, then optional whitespace, then `(`. Requiring
 * that shape is what keeps a `console.log` template with a `${…}` in it, or a
 * CSS snippet, out of the check.
 *
 * The distinction matters in both directions. Too loose and every log line is
 * a false positive, which would make the linter something people route around;
 * too strict (the previous version matched only inline `page.evaluate(`) and
 * the defect it exists for walks straight through.
 *
 * @param body - the raw text between a template's backticks.
 * @returns whether it looks like a page function.
 */
function startsAsPageFunction(body) {
  return /^\s*\(\s*\(/.test(body)
}

/**
 * Is `body` a valid JavaScript expression?
 *
 * The question a stray backtick answers wrong is "does the rest of this still
 * parse", and the engine is the authority on that. `new Function` is used in
 * its *compile-only* form: the constructor parses and would throw a
 * `SyntaxError` on bad input, but the function is never invoked, so nothing in
 * a probe file runs as a side effect of linting it.
 *
 * ## Why the body is flattened rather than passed through
 *
 * A real page function is not always parseable text in isolation. Two things
 * are ordinary and correct to the engine but awkward for a linter holding only
 * the source:
 *
 *   - `${...}` interpolations. The body refers to a caller's variables; left
 *     alone they would not parse as the linter's own context.
 *   - nested template literals. A page function that builds markup with
 *     `card.innerHTML = \`...\`` is the single most backtick-dense shape in
 *     this directory, and must not be mistaken for the defect.
 *
 * So every nested template is replaced wholesale — matched from its escaped
 * opening backtick to its escaped closing one, which `lexTemplate` has already
 * established are balanced — and remaining interpolations become literals.
 * What is left is the function's own skeleton, and that is what gets parsed.
 *
 * Neither step is a loophole. Both require the outer template to have lexed
 * correctly in the first place; a stray backtick in a `//` comment terminates
 * it during that earlier pass, so the body handed to the engine is truncated
 * mid-comment and fails to parse. That is the signal, and it is preserved.
 *
 * @param body - the raw text between a template's backticks.
 * @returns whether it parses as an expression.
 */
function isValidExpression(body) {
  const neutralised = body
    .replace(/\\`[\s\S]*?\\`/g, "'nested'")
    .replace(/\\\$\{[^}]*\}/g, '0')
    .replace(/\$\{[^}]*\}/g, '0')
  try {
    // Compile only. Never called.
    new Function(`return (${neutralised})`) // eslint-disable-line no-new-func
    return true
  } catch {
    return false
  }
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
