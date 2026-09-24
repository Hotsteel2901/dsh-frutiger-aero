# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] — 2026-09-24

The install path on Windows: three defects in one construct, of which only the
first announced itself, plus a landing page that no longer assumes everyone is
on Linux.

### Fixed

- **`install.ps1` died on its first statement.** The reported error was

  ```text
  Invoke-Expression: 无法覆盖变量 HOME，因为它是只读变量或常量。
  ```

  reproduced here on PowerShell 7.4.6, and the cause is that PowerShell variable
  names are **case-insensitive**: declaring `param([string]$Home)` is not a new
  parameter, it is an attempt to overwrite the automatic read-only `$HOME`.

  Renaming that one parameter would have been the whole fix if the error had been
  the whole problem. It was not — the `param()` block carried two more defects
  that never printed anything:

- **The environment variables were silently ignored under `irm … | iex`.**
  `param()` defaults are not applied when the script text is piped into
  `Invoke-Expression`, so `$env:DSH_FRUTIGER_PROFILE = 'aero'` produced a
  `frutiger` install and reported success. Measured both ways: with the block the
  script reported `profile=frutiger`, without it `profile=aero`. A wrong answer
  that looks like a working install is worse than a crash, and this is the reason
  the fix removes the `param()` block instead of renaming inside it.

- **The header documented `iex -Args '-Ref','main'`, which does not exist.**
  `Invoke-Expression` has no `-Args` parameter, so the one documented way to pass
  a ref was unusable — and under `iex` there is no command line to put a flag on
  at all. The environment is now the documented route:

  ```powershell
  $env:DSH_FRUTIGER_REF = 'v1.1.1'; irm …/install.ps1 | iex
  ```

- **`install.sh` ignored `DSH_FRUTIGER_PROFILE` entirely** (hardcoded to
  `frutiger`) and used `DSH_HOME` where the PowerShell script used
  `DSH_FRUTIGER_HOME`. The two scripts now read one shared vocabulary —
  `DSH_FRUTIGER_REPO`, `DSH_FRUTIGER_REF`, `DSH_FRUTIGER_PROFILE`,
  `DSH_FRUTIGER_HOME` — with `DSH_HOME` kept as a fallback because `dsh` itself
  defines it.

- **`install.sh --help` died with `say: not found`.** The helper it calls was
  defined *after* the argument loop, and `--help` returns from inside that loop;
  a shell function used before its definition is a runtime error, not a parse
  error, so `sh -n` never caught it. Both helpers now precede the loop.

### Added

- **`install.sh --help` prints the values a run would actually use.** The header
  documents variable *names*; only this shows they were read. It is also what
  makes the naming agreement with `install.ps1` testable without running a whole
  install.

- **The landing page detects the platform and hands over the matching command.**
  It used to show every visitor the Unix one-liner and mention `install.ps1` in
  prose, as something to go and find — a dead end, and not merely cosmetic:
  there is no `sh` on Windows, so the command on screen could not run. Both
  variants now live in the markup and one is chosen, following the same rule the
  language switch already used; with JavaScript disabled the Unix form remains,
  so the block is never empty.

  The copy button names its target by id, so switching the visible element
  rewrites `data-copy` too. That edge is the one failure of this feature a reader
  cannot see — screen and clipboard disagreeing, and only the clipboard being
  wrong.

- **`.devtools/landing-install.mjs`**, which runs the page under three spoofed
  user agents and asserts, per command block: exactly one variant visible, the
  correct one for that platform, no copy button pointing at a hidden element, and
  that the clipboard matches the screen. Plus a `javaScriptEnabled: false` pass.
  Sabotaging `detectOS()` to answer `'unix'` for Windows turns it red on three
  checks — the reported bug reproduced as a test.

- **`installcheck.mjs` now parses `install.ps1`** (with the real PowerShell
  parser, not a regex) and **fails if any `param()` name shadows an automatic
  variable**, which is the whole family the `$Home` crash belongs to. It also
  asserts that both installers read the same four environment variables and that
  `DSH_FRUTIGER_PROFILE` really changes what gets installed.

### Changed

- **`install.sh` and `install.ps1` print one closing line instead of reprinting
  the summary.** `install.mjs` already prints the version, the build fingerprint,
  where it landed and how to start it; the wrappers were duplicating all of it,
  which gave the reader two summaries to reconcile. They now add only what they
  alone know — which ref they fetched.

- **The landing page no longer says "On Windows, use `install.ps1` from the
  repository instead."** It says the command above was chosen for your system.
  The development one-liner (`git clone … && node install.mjs`) is deliberately
  *not* split by platform, because `&&` has worked in PowerShell since 7.0 and
  that line genuinely is the same on both.

## [1.1.0] — 2026-09-24

The desktop pass: a large amount of animation, held inside a measured budget,
leaving the phone build untouched and rendering identically in both languages.

### Added

- **A sixth stylesheet, `showcase.css`, carrying the desktop effect layer.** It
  is wrapped in a single `@media (min-width: 1024px) and (hover: hover) and
  (pointer: fine)` block, so it cannot reach a phone by construction — the mobile
  layout is unaffected, and the guard is one condition rather than a prefix
  repeated across eighty rules.

  What it adds, by region:

  | region | loops | entrances | transitions |
  | --- | --- | --- | --- |
  | boot horizon | 1 | — | — |
  | hero lift + glint | 2 | — | — |
  | transcript | 1 | 1 | 5 |
  | sidebar rows | — | — | 7 |
  | canvas top wash | — | — | 1 |
  | composer | 3 | 1 | 9 |
  | right panel, dockkit | — | — | 6 |

  Loop periods are deliberately coprime-ish (26s, 34s, 39s, 42s, 44s, 47s, 58s,
  64s, 76s), because layers sharing a period visibly re-sync and a wallpaper
  whose parts line up periodically reads as a loop rather than as weather.

- **`animation-composition: add` on the hero lift**, so the desktop breathing
  composes with the focus lift instead of replacing it. The breathing rides on
  `scale` rather than a second `translate3d`, because under `add` two
  translations merge into one matrix and the scale term is lost (see Fixed).

- **`.devtools/DESKTOP-EFFECTS.md`**, which records the anchor vocabulary this
  product actually has, the ten `data-*` attributes that *look* plausible and do
  not exist, the measured cost per tier, and the four measurement traps that cost
  real time here.

### Fixed

- **The hero breathing replaced the composer's focus lift instead of adding to
  it.** `effects.css` lifts the card 1px on `:focus-within`; `showcase.css`
  breathes it on the same property. An animation at the animation origin beats a
  normal declaration regardless of specificity or sheet order, so the breathing
  won outright and the focus affordance was silently gone — the card still moved,
  which is why it looked fine: it measured `-0.53px` where the lift alone is
  `-1px`.

  `animation-composition: add` made both writers visible, but the first version
  of that fix was still wrong: `add` merges two *translations* into a single
  matrix rather than nesting them, so `translate3d(0, -1px, 0)` plus a breathing
  `translate3d(0, -0.5%, 0)` collapsed to `matrix(1, 0, 0, 1, 0, -1)` with **no
  scale term at all** — the breathing contributed translation and dropped the
  `scaleY(0.99)` the focus lift exists to show. The apparent `-1.29px` was that
  merged translation overshooting, not a working composition. The breathing now
  animates `scale`, which sits outside the `transform` list and composes
  multiplicatively: the lift holds a clean `-1px` at every phase while `scale`
  travels `1 → 0.995 → 0.99 → 0.995`. `composercheck.mjs` asserts all three facts
  (lift present, breathing live on `scale`, both at once) because the previous
  assertions could not distinguish this state from the broken one.

- **`effects-perf.mjs` was passing without measuring**, in three independent
  ways, and its red-proof had been refused. All three are fixed, and the same
  injected defect that was invisible before now fails as it should:

  - the keyframe scan read `sheet.cssRules` at the top level only, and
    `showcase.css` is one `@media` block, so it saw nothing in the file it was
    meant to police (`top: 1`, `inner: 44`);
  - the animation scan used `getComputedStyle(el)`, which never reports a
    *pseudo-element's* animation — measured 0 hosts for `fa-step-pulse` against
    3 through `getComputedStyle(el, '::before')`;
  - it measured the hero only, where the transcript, seat and pulse effects do
    not exist yet.

  The probe now counts 58 animations and 49 plugin animations at `full`, up from
  47 and 40.

- **De-probed three false positives that were testing the wrong thing.** The
  per-tier probe asserted a ceiling on `longtask` entries, which are the product's
  own startup — `off` reports the same 2–3 tasks as `full`, on this machine, in
  the same window — and so it now asserts *attribution* (`full` must not add
  stalls over the `off` control) rather than a total. The same probe failed on a
  404 for `/open-in-app/icon/filemanager`, a host route that 404s on every tier;
  known product 404s are now reported in a `note` line while every other console
  error still fails the run. And two `composercheck` assertions were reading
  values mid-transition (`0.42`/`0.47`/`0.55` for an opacity settling to `1`) and
  pinning one exact frame of a 7.4s loop, both of which are coin flips rather
  than checks.

- **`effects-manifest` counted declared-but-inert transitions.** It treated any
  `transition-property` other than `all`/`none` as a live transition without
  checking the duration, so an element declaring a property at `transition-
  duration: 0s` counted as an effect. With the test corrected, the composer
  region's real transition count at rest is `0` — its card ring is declared on a
  `::after` whose duration is zero until `:focus-within` matches — and the floor
  was corrected to say so, with the hover behaviour asserted where it can
  actually be reached.

- **`run-suite.sh` could hang for hours.** A probe whose `node` child died
  without writing output left its `bash -c` wrapper reading the stdout pipe
  forever, and the suite waited with it — the run was not slow, it was finished
  and unintelligible. Every probe now runs under `timeout -k 10 300`, and a
  killed probe reports `(no answer in 300s — killed)`.

- **`landing-site.sh start` never returned when its output was captured.** The
  server was launched as `( cd "$DOCS" && setsid python3 -m http.server … & )`,
  which detaches the *session* but leaves the server a live child of the script —
  so `bash` waited in `do_wait` for a process that by design never exits. Because
  the suite calls it through a command substitution (`URL=$(landing-site.sh start)`),
  the still-running server held the pipe's write end open and the substitution
  never saw EOF. The landing probes therefore never started; they were the only
  red line in the suite, and the probe itself was innocent. All three descriptors
  are now closed at the subshell level, and `start` returns in `0.31s` where it
  previously hung indefinitely.

- **The Harness was serving a profile from an earlier session.**
  `landing-site.sh` and `deploy.sh` honour `DSH_HOME`, but a Harness started
  without it reads `~/.dsh`, which held a plugin copy dated 12 days earlier with
  none of the desktop effects in it. Every build and deploy reported success
  while the browser loaded a bundle with no `showcase.css` at all — which read as
  "the stylesheet is not being served" and was *nearly* diagnosed as a CSS bug.
  `deploy.sh` now warns when the default home differs from the deploy target, and
  the standing check is documented in the devtools README.

- **Two dead selectors in `showcase.css`.** The step-pulse block listed three
  selector chains "to be safe"; measured on a page with three conversations open,
  only `[data-chat-flow] [data-chat-flow-kind] [data-state="ok"]` matches (3
  hosts). The other two — the space-less `[data-chat-flow-kind][data-state]` form
  and the `[data-turn-process] [data-state="ok"]` form — match nothing, because
  the kind row is an *ancestor* of the step row rather than the row itself, and
  `[data-turn-process]` never contains a `[data-state="ok"]`.

- **`shots.mjs` could not open the desktop settings dialog.** It clicked
  `[aria-label="Settings"]`, which resolves to a **zero-sized, `display: none`**
  node — the only English-labelled "Settings" on the page belongs to the *mobile*
  dock. The real desktop control renders the stored locale's own string (`设置`),
  so the step would fail under any non-English locale. It now finds the trigger
  structurally, independent of locale and of the product's hashed class names.

### Changed

- `effects-parity.mjs` now compares **rendered motion** in both locales, not only
  declared motion. Declarations agreeing is necessary and not sufficient: the
  same keyframe read at two different phases returns two different values. Eight
  moving windows are now paused to four pinned phases of their own curve through
  `document.getAnimations()` and compared as rendered `transform` and `opacity`.
  Both languages match at every phase.

## [1.0.5] — 2026-09-21

### Fixed

- **The Trajectory inspector no longer passes taps through to the table behind
  it.** The previous release made the panel *opaque* and reported the taps fixed;
  they were not. Opacity was necessary and nowhere near sufficient, and the
  remaining defect had a different cause entirely — which is why a second round
  of work was needed.

  `document.elementFromPoint` at the close button returned the same element as a
  call at a *blank* spot in the middle of the panel, and at the centre of every
  detail tab: one control was claiming the whole panel. It was
  `.Y0dWHa_timestampToggle`, which lives inside a 57px-tall `overflow: auto`
  summary strip holding 70px of content. Chromium hit-tests a scroll container's
  descendants using their **unclipped** rects, so that control's escaped rect
  covered the panel and absorbed every tap aimed anywhere inside it. The fix is
  one rule, scoped to touch layouts:

  ```css
  html .Y0dWHa_timestampToggle { pointer-events: none; }
  ```

  `html` is load-bearing rather than decorative: the product injects its own
  `pointer-events` declaration for this class *after* the skin sheet, so a bare
  class selector loses on source order — measured, the rule parsed and matched
  while the computed value stayed `auto`. `pointer-events: none` rather than
  `display: none`, because the timestamp is worth keeping on screen and is not
  something a finger needs; the strip around it is what a user scrolls.

- **Two approaches were measured and abandoned, and that is recorded so they are
  not retried.** Re-parenting the panel onto `document.body` (a portal, to escape
  the isolated stacking context under the composer) fixed the geometry — escape
  count went 6 → 0 in a 24-point sample — and broke the panel completely: the
  panel is React-rendered and the app delegates listeners to `#root`, so a node
  outside that subtree receives clicks and does nothing, and moving it back did
  not repair React's bookkeeping. Adjusting `z-index` or neutralising the
  `isolation: isolate` ledger changed nothing, because the overlap was not
  between siblings. The plugin's "it may only paint" contract now cites the
  portal failure as its empirical justification rather than as a preference.

- **The Trajectory suite gained the assertions that would have caught this.**
  `trajcheck.mjs` is now 52 checks (from 33). The new ones do not assert on the
  CSS rule; they plant a control with the offending class back into the panel,
  at the same geometry, and require that it cannot shadow the close button —
  then remove the skin's rule and confirm the check goes red. A synthetic
  `click()` was explicitly not used: it bypasses hit-testing and would have
  passed while the panel was still unusable, which is how the defect survived a
  round of "verification" already. The decisive assertions drive real touch
  input, and close with the panel reopening cleanly afterwards.

- **`devtools/linttemplates.mjs`** — a new static check guarding the mistake that
  broke this directory twice. A `page.evaluate` page function is passed as a
  template literal, and inside a template literal a `//` comment is just text,
  so a backtick in a comment terminates the template and the syntax error points
  at the wrong line. Both previous occurrences were in comments *documenting* a
  measurement. The checker is wired into `run-suite.sh`, and is itself verified
  against a known-bad canary — its first two implementations passed that canary,
  which is recorded in the file.

### Changed

- **npm is gone from every user-facing document.** The maintainer has no npm
  account, so no installation instruction anywhere mentions it: both READMEs, the
  landing page, `install.sh`, `install.ps1` and `packages/frutiger-aero/README.md`
  now have zero references (verified by search, not by memory). The landing
  page's npm method card was removed and the GitHub installer promoted to
  `1 · GitHub installer` with a `recommended` tag; the two npm shields in the
  README were replaced with the CI badge; and the installer's own header now
  says "no package manager, no registry account, no git, no build step".

- `.github/workflows/publish.yml` and `RELEASE.md` §6 are **kept but marked
  inactive** rather than deleted, so the work is not lost if an npm account ever
  appears. The workflow skips itself cleanly while `NPM_TOKEN` is unset, so the
  repository never shows a red X for something that is deliberately not done.

## [1.0.4] — 2026-09-21

### Fixed

- **The install path no longer strands you, and no longer lies to you.** Two
  separate defects made "安装失败还得全删掉再重新安装" the only advice anyone
  could give, and neither was a crash:

  The installers fetched `releases/latest`. A release tag is cut from a branch
  at a moment in time while `package.json` keeps reporting the *branch's*
  version, so tag `1.0.3` and `main` both announced `version: 1.1.0` while
  holding different code — verified against the live repository, the tag's
  `src/css/mobile.css` contains none of the mobile fixes that exist on `main`.
  The tag therefore never moved, so reinstalling downloaded the same snapshot
  every time, so the version string could not distinguish anything. `install.sh`
  and `install.ps1` now default to the **default branch** (asked of the API, not
  hardcoded) and take `--ref` / `-Ref` to pin a tag deliberately.

  And on Node 20 and 22 the Harness CLI does not fail — it exits **0 having
  printed nothing at all**, because `import.meta.main` is unimplemented there
  and the entry guard is therefore falsy. A user on 22 saw a skin that did
  nothing and reasonably called the install broken. `engines` had claimed
  `>=20`, which was actively misleading. Both installers now check the major
  version up front and refuse with one sentence that names the cause, and both
  `package.json` files require `>=24`.

- **`--doctor` and `--repair`: diagnose instead of starting over.** `node
  install.mjs --doctor` is read-only and reports what is wrong, why, and the one
  command that fixes each finding, ending with an explicit *no step above
  requires deleting the profile*. `--repair` re-copies the payload in place. The
  upgrade path was verified end to end against a genuine release-`1.0.3` install:
  the doctor caught that the copy predates build fingerprints and that it differs
  from the sources, `--repair` upgraded it, and the subsequent doctor run
  reported healthy — with sessions and hand-written files in the profile
  untouched. Five checks, including a broken symlink and a missing
  `lib/index.js`.

- **Builds now have an identity, so "am I on the latest?" is answerable.**
  `build.mjs` bakes a fingerprint — a content hash of the sources the artifact
  was built from — into `lib/client.js`, and every install prints it:

  ```text
  version   1.1.0
  build     20bfbdb4cf57
  ```

  The input list lives in `scripts/source-fingerprint.mjs`, imported by both the
  build and the installer, because two lists would drift and turn every healthy
  install into a false "stale" report — and a check that cries wolf is worse
  than no check. `install.mjs` hashes *sources* rather than the installed
  artifact's own self-report, so a copy old enough to predate the field still
  gets a definitive answer instead of a shrug.

- **The build is now byte-reproducible.** It previously embedded a `builtAt`
  timestamp in the artifact, so rebuilding identical sources produced different
  bytes and an installed copy would have looked stale after every rebuild. The
  timestamp is gone; `installcheck.mjs` asserts the property directly, because
  the staleness check above is only meaningful if it holds.

- **`devtools/installcheck.mjs`** — 15 checks over the install path with no
  browser: the POSIX parse, help output not silently truncating, the Node floor
  actually refusing Node 22, a second run deleting nothing, the printed
  fingerprint matching the sources, `--doctor` clean/exit-0 on a healthy install
  and fingerprint-identified when stale, `--repair` preserving sessions, and the
  build's reproducibility.

### Fixed — mobile

- **The Trajectory inspector was see-through, which made things genuinely
  untappable.** The product renders the detail panel as a 74%-alpha overlay at
  narrow widths, so the event table showed straight through it: two interfaces
  legible at once, and a tap landed on whatever happened to be on top. Measured
  `rgba(255, 255, 255, 0.74)` before; the panel and its header/tabs are now
  opaque (`rgb(244, 251, 255)`). This, not a layout problem, is what "有很多
  things 点不到" actually described.

- Touch reach on the Trajectory view: the inspector's close button gets a 44×44
  hit area, the request-boundary control grows from 16px to 44px while a
  `-14px` margin keeps its painted 5px dot exactly where it was, and each row
  gains a 7px hit strip in the gap *below* it — a full-cell overlay was tried
  first and swallowed the horizontal drag, so the band is deliberately clear of
  the inner scrollers (measured: 0 of 9 rows overlap).

- Rows gained `cursor: pointer` and `:active` / `[data-selected]` feedback so a
  tap is visibly acknowledged, and the timeline got a readable 11px label,
  a 52px label column, thicker bars and a 44px track floor.

### Changed

- A stale claim was removed from `src/css/mobile.css`. An earlier audit recorded
  that the product's 50px gutter *clips* the turn and kind labels; it does not.
  The product ships a container query that fires at this width and deliberately
  hides those labels (`opacity: 0; max-width: 0`) in favour of an icon and a
  compact label. A hidden element still reports `scrollWidth > clientWidth`,
  which is what the probe had measured. The file now documents the measurement
  and the actual mechanism, so the codebase stops carrying a false story.

  The desktop counter-checks in `trajcheck.mjs` grew from 11 assertions to 33 for
  the same reason: every phone-side improvement is paired with an assertion that
  the wide layout did not move — row height, gutter sticky-ness, cursor, type
  scale, label column, plot height, and the absence of the phone-only hit strip
  and fade mask.


## [1.1.0] — 2026-09-20

### Added

- **Wallpaper density control.** `window.__FRUTIGER__.bubbles()` reads the
  current step and the live bubble count; `bubbles('calm' | 'normal' | 'lively')`
  changes it. The multipliers apply to the tier's baseline rather than replacing
  it, so a `lite` device stays `lite` at every step, and the result is clamped
  to 3–48. `?bubbles=calm` on the URL overrides a stored preference without
  disturbing it, which is what a bug report needs.

  Two details worth keeping: a change rebuilds the scene but must not reseed it,
  or the wallpaper reshuffles under the user's cursor — so the generator stays
  deterministic and the runtime compares the resolved count before rebuilding,
  making a no-op toggle actually free. And selecting `normal` *clears* the
  stored key rather than storing the string `'normal'`, so a later change to the
  default is not pinned by stale state.

- **`devtools/run-suite.sh`** — the whole verification suite as one command with
  one verdict. Eleven suites, ~12 minutes, non-zero on any failure: contrast in
  both schemes, the accent tokens actually being live, an eleven-viewport layout
  sweep, touch targets, the session row and drawer, the keyboard inset, the
  settings dialog across zh-CN / en-US / desktop, label clipping, the density
  control, and unexpected network failures.

- **`devtools/clipaudit.mjs`** — measures whether any visible label is actually
  cut off, by laying each text run out in a `Range` and comparing its width with
  the content box of the ancestor that clips it. 119 runs across the chat, the
  drawer, the settings dialog and the right panel; all clean.

  It exists because four separate "the label is clipped" findings went the wrong
  way, every one of them a defect in the *measurement*:

  - `scrollWidth > clientWidth` reports a clip on a 20px close button (32) and on
    a tab strip (392/390), because both include absolutely-positioned descendants
    and scroll room that have nothing to do with the text.
  - `textContent` equality on a leaf node never matches a label whose node also
    has element children, so the search returns nothing and reads as a pass.
  - `clientWidth` is `0` on a `display: inline` element, so comparing a measured
    text width against it flags every inline run in the product.
  - the *invisible* fourth one is the instructive one: a `0x0` bounding box means
    "not rendered" — except under `display: contents`, which generates no box at
    all by design and lets its children lay out in the grandparent. Treating that
    as invisible silently discarded all nine visible labels in the app and
    reported a pristine **"0 clipped, PASS"** on a tree it had never looked at.

  Two genuine matches did surface, in the app's own breadcrumb and close buttons.
  Both turned out to be the standard screen-reader pattern —
  `clip: rect(0 0 0 0); width: 1px; height: 1px` — which is correct, so the audit
  now recognises that *mechanism* rather than a class name, and tests the whole
  ancestor chain rather than only the immediate parent, because one bundle nests
  a `display: contents` wrapper inside the clipped span.

- **`devtools/keyboard.mjs`** — the software-keyboard path had never been
  verified, because Playwright has no keyboard. It simulates one by shadowing
  the *live* `visualViewport` instance's accessors and dispatching `resize`, so
  the plugin's own subscription is what runs. 14/14: the composer lifts clear of
  the occluded band, the dock leaves with `opacity: 0` and no pointer events, a
  60px inset correctly does *not* raise the flag, and everything unwinds.

- **`devtools/netcheck.mjs`** — lists every request that does not succeed, and
  re-requests from inside the page, because the Harness gates every route behind
  a signed cookie that a Node-side request does not carry.

- **`devtools/tokens.mjs`** — reads the live custom properties off `<body>`.
  A contrast run reporting zero failures is otherwise ambiguous between a fixed
  palette and a bundle that never reloaded.

- **`devtools/contrast-report.mjs`**, **`devtools/hit-report.mjs`** — turn the
  two largest probes into something a person can read, leading with failures
  instead of burying them in a few hundred passing rows.

### Fixed

- **The light scheme failed WCAG AA on two labels.** `Chat` measured 2.97:1 and
  `Access mode` 3.25:1, against a 4.5:1 requirement. Both traced to a single
  definition each rather than to any component style:

  - `accent` was `#129dd0`, the palest aqua on the deepseek ramp — an excellent
    *fill* and a poor *text* colour at 1.82:1 on the worst pane. The fix moved
    the text-bearing end of the pair down the ramp the product already ships,
    keeping the hue and buying the contrast.
  - `caption` was `#6b93ab` at 1.93:1, and was not reachable from any of the
    four `--dsw-alias-label-*` mappings the skin sets, so a product control was
    falling through to an undesigned colour.

  The ink ramp is now solved against the surface it actually lands on. That is
  not white: the app's own panes are 74% white over a wallpaper whose darkest
  sample is `rgb(18 40 62)`, which composites to `#c1c7cd`. The measured ratios
  are recorded beside the definition, because that reasoning is the thing that
  stops a future reader from "correcting" the aqua back to a brighter one.

- **The accent ramp was inverted.** `accent` was lighter than `accentDeep`,
  which made `link` darker than `button-primary-fill` and lit every hover
  transition *down* instead of up.

- **Six controls on the landing page were under the 44px touch minimum.** The
  existing rule set a `min-height` but no `min-width`, so the header pair passed
  it while staying far too narrow to aim at: the droplet mark measured `26x44`
  and the scheme glyph `36x44`. The four footer links measured `16px` tall — a
  third of the minimum — and had been excluded on the reasoning that prose links
  are read rather than aimed at. That holds for a link mid-sentence; it does not
  hold for the footer's navigation row, whose only purpose is to be tapped.
  Both now carry a real 44px box, and the landing page's own probe confirms it
  independently: its minimum measured tap target went **16px → 44px**, with the
  desktop layout unchanged and all 19 landing checks still passing.

- **The right panel was see-through on a phone.** The host paints it with
  `background: var(--dsw-alias-bg-base)`, which is fine on a desktop where the
  panel is a column beside solid content — but this skin redefines that alias to
  the *canvas* colour, `rgb(244 251 255 / 88%)` in light and
  `rgb(7 32 46 / 90%)` in dark, because the conversation canvas is meant to be
  translucent glass over the wallpaper. Reusing one token for both is harmless
  at 88% beside a frame; it is not harmless when the panel is a **full-screen
  overlay**. The transcript underneath showed through a surface that had no blur
  to excuse it, so the panel read as two pages printed on the same sheet.

  Measured before the fix, with the panel settled at `opacity: 1` and
  `visibility: visible`: `background: rgba(244, 251, 255, 0.88)`,
  `backdrop-filter: none`. After: `rgb(244, 251, 255)`, fully opaque.

  The fix follows the precedent already in `mobile.css` for the trajectory
  gutter — pair the translucent surface with the blur that makes it legible, so
  the glass survives — and falls back to a solid fill below the top tier, where
  a 24px backdrop filter is the most expensive thing on the screen. That
  fallback needs a literal rather than a token: every surface this skin defines
  is deliberately translucent (74% / 84% / 92%), so `--fa-panel-solid` was added
  to the material layer at the canvas hue and full alpha.

- **The right panel's close button sat on top of its own tab title.** The tab is
  `display: flex` with `padding: 0 10px` and no `gap`, so the icon, the label and
  the close button were laid out edge to edge and the close button won, painting
  4px inside the title's box:

  ```
  .tabTitle   20 → 80      (16px icon at 20-36, label text at 41-68)
  .tabClose   76 → 96      ← starts 4px inside the title
  ```

  Nothing flagged it: the label's own box reports `scrollWidth == clientWidth`,
  so its text is intact — it is the *box* that is overlapped. On screen it reads
  as `File` rather than `Files`, and it degrades as the label grows, which is
  worst for Chinese, where every glyph is wider. A `gap: 6px` on the tab stops
  the two children at the boundary instead of crossing it; measured overlap went
  from **+4px** to **−2px**, and the tab's height from 28px to 36px so it is a
  target as well as a label.

  Both of these are stock layout, not regressions the reskin introduced — the
  plugin never styled either node, and the classes are hashed host classes. They
  are fixed here because they are visible defects on the surface that was asked
  to be made to work, and both fixes are scoped to the two narrow breakpoints,
  so the desktop grid is untouched.

### Changed

- **Three verification defects fixed, each of which had already produced a
  confident wrong answer.**

  - `shots.mjs` and `settingscheck.mjs` still built their own
    `browser.newContext`, so the first-run API-key dialog was never dismissed
    and every screenshot they took was a picture of a modal. Both now go through
    the gate-passer, and `shots.mjs` gained a `zh-CN` pass, because a label that
    fits in one language can clip in another.
  - `openSession` clicked a session row by text and could land on the row that
    was *already selected*, where a click is a deliberate no-op. It reported
    "no transcript rendered" on a home whose transcript was fine. It now picks
    an unselected row and taps it for real, via `touchscreen`, so the path a
    thumb takes is the path under test.
  - `deepcontrast.mjs` grew to cover the drawer, the trajectory panel and a
    1024px width, and now composites the ancestor background stack per element
    instead of assuming a single colour.

### Known limitations

- `/open-in-app/icon/filemanager` answers **404** on a headless Linux host, and
  `netcheck.mjs` accepts it by name with the reason. `filemanager` is backed by
  `xdg-open`, which has no `.desktop` file and therefore no icon; the host
  returns null, the route correctly answers 404, and the product hides the
  button. It is stock behaviour, not the skin's — this plugin is a token reskin
  and neither routes nor serves it.

[1.1.0]: https://github.com/Hotsteel2901/dsh-frutiger-aero/releases/tag/v1.1.0

## [1.0.2] — 2026-09-19

Three phone-layout defects, all reported from real use.

### Fixed

- **The settings dialog was unreachable from the dock.** `sidebar.settings` is a
  slot *inside* the sidebar column, so the panel, its scrim and its focus trap
  all live in that subtree — and taking the column off-canvas took the dialog
  with it. Tapping the gear appeared to do nothing until the drawer was opened
  separately. The tagger now publishes when the sidebar holds a dialog, and the
  stylesheet lifts the off-canvas treatment for as long as it does.

  The load-bearing part is removing `transform`, not moving the column back: a
  transform makes an element a containing block for `position: fixed`
  descendants, and the dialog's scrim is fixed. Without the transform the scrim
  resolves against the viewport again, while a `left` offset keeps the column
  itself off screen — an offset moves a box without re-anchoring anything.

- **The settings dialog kept its desktop layout on a phone.** The panel is a
  flex row of a 188px `<nav>` rail and a content column; at 390px the content
  was left 154px, so every label wrapped to one character per line (`权/限`,
  `完/全/权/限`) and the theme cards became three slivers. At phone width it is
  now a single column with the rail as a horizontally scrolling tab strip.

- **Buttons were pushed off-centre on touch devices.** The coarse-pointer rule
  gave every control `min-width: 44px`; the chat header's "choose an app to open
  in" control is 22x26 and centres its chevron with `padding-left` under
  `justify-content: normal` — the product positions that glyph from the box's
  left edge. Widening the box left the glyph where it was, **11.5px off-centre**
  (measured against a stock profile).

  The target is now grown with a pseudo-element instead: centred on the control,
  taking pointer events as part of it, and changing no layout at all. `::before`
  was free because the hover sheen that also wants it lives inside a
  `(hover: hover) and (pointer: fine)` query, so no device is ever both. Inline
  prose links are excluded — a 44px invisible box around a word would overlap
  the words beside it and steal taps meant for selection.

### Changed

- `aligndiff.mjs` measures off-centre controls against a **stock** profile and
  reports only what the skin introduces. The raw metric flags left-aligned
  content, which the product is full of; as a difference it is actionable.
  Current result: **0 introduced**.

[1.0.2]: https://github.com/Hotsteel2901/dsh-frutiger-aero/releases/tag/v1.0.2

## [1.0.1] — 2026-09-19

Everything here was found by using the plugin on a real phone, in Chinese.

### Fixed

- **The phone dock was dead on any non-English install.** Buttons were resolved
  by English `aria-label` (`[aria-label="Settings"]`), and the client ships
  `zh` and `en` — on a Chinese install those lookups matched nothing. Worse, a
  lookup for `[aria-label="New session"]` matched **the dock's own button**
  (the dock's labels are English), so the handler clicked itself and recursed
  until the stack blew. One root cause, four symptoms: a dead dock, a scrim that
  would not dismiss the drawer, edge swipes that did nothing, and a workspaces
  button that hid itself because it could not find its control.
- Controls are now resolved through `src/client/controls.js`, in three layers:
  a locale-independent `data-slot` hook where the slot's meaning is stable, the
  product's **own dictionary strings** for both shipped locales (read out of
  `dsh-client-ui-sidebar`, `-workspace` and `-settings-general`, not guessed),
  and a structural fallback. Every lookup is scoped to `#root`, so a search can
  never return one of this plugin's own controls again.
- Also corrected a wrong assumption the old code encoded:
  `[data-slot="sidebar.brand.mark"]` is **not** a sidebar toggle. It is inside
  the "Open sidebar" button when the rail is collapsed and inside the "New
  session" button when the drawer is open — so treating it as a toggle made a
  close-drawer call quietly start a new session.

### Changed

- **The Trajectory view is readable on a phone.** It is a two-column table whose
  content cell is one `nowrap` line, so a row showed the first forty characters
  of a line up to three thousand pixels long and cut off mid-glyph with no sign
  that anything was missing. On coarse pointers at narrow widths the content
  now truncates with an ellipsis, scrolls horizontally under a finger so the
  rest can be dragged into view, and the timeline gutter is pinned while it
  moves.
- **Row height is deliberately unchanged.** The list is virtualised and the
  product positions it from `const CONTENT_ROW_HEIGHT = 30`, passed as
  `estimateSize` with no `measureElement` — there is no measurement pass to
  correct a wrong estimate. Taller rows would look right on a short session
  (virtualisation only engages above 100 rows) and break on a long one. A skin
  does not get to desynchronise a list's layout model.

### Added

- `interact.mjs` and `docktest.mjs` now run in **both shipped locales**; the
  entire interaction suite passing in English was what let this through.
- `.devtools/lib/session.mjs` — helpers that assert the state actually changed,
  instead of continuing silently when an action did nothing.
- `docktest.mjs` (24 checks, both locales) and `trajcheck.mjs` (11 checks, phone
  and desktop).

[1.0.1]: https://github.com/Hotsteel2901/dsh-frutiger-aero/releases/tag/v1.0.1

## [1.0.0] — 2026-09-19

First release.

### Added

- **Frutiger Aero palette** for both colour schemes, built on the product's own
  `--dsw-static-*` / `--dsw-alias-*` token graph and written twice: as an
  `!important` stylesheet keyed on `body[data-ds-dark-theme]`, and through
  `theme.overrideTokens()` so the runtime snapshot, `theme-color` metadata and
  Appearance previews stay coherent with what is painted.
- **A living wallpaper** — sky, sun, haze, light shafts, two hill ridges, water,
  caustics, bubbles and grain in one fixed `contain: strict` layer, animated on
  `transform`/`opacity` only, with a deterministic bubble population.
- **Material system** — glass panes, a five-stop gloss recipe for everything
  pressable, frosted dialogs and menus, aqua scrollbars, and a rim light on
  every edge.
- **Mobile layout** — below 1024px the frame collapses to one column, the
  sidebar becomes an overlay drawer with a dismissing scrim, the rail moves
  off-canvas below 640px, and a floating glass dock takes over navigation.
- **Mobile interaction** — edge-swipe gestures, a keyboard-aware composer driven
  by `visualViewport`, 44px touch targets on coarse pointers, a 16px input floor,
  momentum scrolling, contained overscroll, light haptics, and safe-area insets.
- **Tier governor** — `full` / `lite` / `off`, classified from free signals and
  then corrected once by a one-second frame-pacing sample.
- **Control surface** — `window.__FRUTIGER__` and the `?frutiger=` URL parameter.
- **Portable installer** — `install.mjs` (needs only Node), plus `install.sh` and
  `install.ps1` for the GitHub path.
- **Landing page** under `docs/`, bilingual and motion-budgeted.
- **Verification harness** under `.devtools/` — 29 real-input interaction
  assertions and 19 landing-page checks.

### Fixed

Three defects found by measuring rendered pixels rather than reading the DOM.
All three were in this plugin, not in the product.

- **A full-viewport `backdrop-filter` on the right column.** The column is a
  zero-width track on desktop but spans the entire screen once the frame
  collapses to one column, so on a phone it blurred and desaturated the whole
  application — transcript included. It was invisible to every DOM assertion
  because the column is `pointer-events: none`: `elementFromPoint` never
  returned it, and hit testing looked healthy. Only a luminance measurement
  showed it (transcript band standard deviation 7 where it should have been 26).
  The blur now targets the panel, never the column.
- **The right column swallowed every tap and scroll aimed at the transcript.**
  Both columns share one grid cell on narrow viewports, and the right column
  comes later in DOM order, so a full-size empty column sat on top of the
  conversation. Because a touch scroll is routed through the touched element's
  scrollable ancestor, the transcript could not be scrolled by touch at all.
  The column is out of hit testing now, with events handed back to its own
  content.
- **The conversation's reading measure was stripped.** An early rule made the
  canvas transparent on the theory that its wash stacked with the frame's;
  without a column-level pane the wallpaper showed through the gaps between
  rows, so a tool-call row over the hills went green and the empty half of a
  wide transcript went bright blue.

### Known limitations

- The palette is not user-editable without rebuilding; `src/client/palette.js`
  is the single source of truth. A settings row is the planned next step.
- A third-party plugin that hardcodes its own colours, or paints a
  full-viewport `backdrop-filter`, can still clash with the skin.

[1.0.0]: https://github.com/Hotsteel2901/dsh-frutiger-aero/releases/tag/v1.0.0
