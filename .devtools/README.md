# .devtools

The verification harness for the Frutiger Aero skin. Not part of the deliverable and not needed
to install or run it — it exists because "it looks fine to me" is not a verification method, and
a reskin that cannot be measured across viewports, tiers and colour schemes is a reskin that is
broken on someone's phone.

## Setup

```sh
cd .devtools
npm install playwright-core sharp
npx playwright install chromium
```

`sharp` is used by `images.mjs` and by the luminance measurements; nothing else needs it.

## Running

```sh
./serve.sh frutiger 3098 /tmp/fa-frutiger.log     # boot a profile, print its token URL
node interact.mjs '<token-url>'                   # the one that matters most
node landing.mjs http://127.0.0.1:8099/index.html # the GitHub Pages page
```

| script | what it answers |
| --- | --- |
| `interact.mjs <url> [locale]` | **real input** — CDP touch swipes, `touchscreen.tap`, typing, wheel, drag, selection: 29 assertions. Run it in `en-US` **and** `zh-CN`; the client ships both, and passing in one is not passing |
| `docktest.mjs <url>` | the phone dock, both locales: 24 assertions |
| `trajcheck.mjs <url>` | the Trajectory view on a phone and on the desktop: 33 assertions. The desktop half is a set of counter-checks — it asserts that none of the phone-only treatment leaked into the wide layout |
| `installcheck.mjs [--offline]` | **the install path, with no browser**: the Node floor, idempotency, `--doctor`, `--repair`, and build reproducibility: 15 checks. The only suite that verifies what happens before a page is ever opened, which is where "it failed to install" reports come from |
| `settingscheck.mjs <url>` | the settings dialog opened from the dock — both locales, phone and desktop: 23 assertions |
| `clipaudit.mjs <url>` | whether any **visible** label is cut off, across the chat, drawer, settings dialog and right panel |
| `run-suite.sh <url>` | everything above that can run unattended, as one command with one verdict |
| `aligndiff.mjs <stock-url> <skin-url>` | off-centre controls **introduced by the skin**. The raw metric flags left-aligned content, which the product is full of; only the difference is actionable |
| `alignstock.mjs <stock-url>` | the same alignment probe against a stock profile, driven by stock's own controls |
| `final.mjs <url> <out> [tier]` | every viewport: layout, drawer, dock, computed styles, console errors, screenshots |
| `tiers.mjs <url>` | the same page at `full` / `lite` / `off`, per viewport |
| `hit.mjs <url>` | what a tap at each point of the viewport actually reaches |
| `geom.mjs <url> <tag> [mobile]` | the laid-out geometry of one transcript row, element by element |
| `colors.mjs <url>` | the *effective* colour and opacity of each visible row |
| `lum.mjs <url>` | rendered-contrast measurement per condition — standard deviation of luminance in a fixed crop, with a fresh page per variant |
| `bisect-styles.mjs <url>` | disables one of the plugin's stylesheets at a time, to attribute a rendering change |
| `dpr.mjs <url>` | the same crop at 1x, 2x and 3x device pixel ratio |
| `landing.mjs <url>` | the landing page: 19 checks across desktop, mobile and reduced motion |
| `effects-manifest.mjs <url>` | what the desktop layer *is*: every effect per region, above a floor that has to be edited to be lowered |
| `effects-tiers.mjs <url>` | whether `lite` and `off` actually stop what `full` starts: 54 checks, including "stopped" vs "hidden" |
| `effects-parity.mjs <url>` | that `en` and `zh` render the *same* effects — declared motion **and** eight windows paused to four pinned phases and compared as rendered values |
| `effects-perf.mjs <url>` | what the layer costs, per tier: layers, animated elements, compositable properties only, and long-task attribution against the `off` control |
| `loopcheck.mjs <url>` | that every infinite loop can be stopped, and that stopping it does not hide the element |
| `composercheck.mjs <url>` | the composer and the overlay layer with their surfaces open, where the effects only exist then |
| `canvascheck.mjs <url>` | the canvas and the scroll-edge masks on a scrolled conversation |
| `sidebarcheck.mjs <url>` | the sidebar's rows, rail and settings surface |
| `headercheck.mjs <url>` | the header sheen, which needs a conversation to be rendered at all |
| `DESKTOP-EFFECTS.md` | the reference for the above: the anchor vocabulary, the ten plausible `data-*` names that do not exist, the measured cost table, and the measurement traps |
| `pass.mjs <url> <out> [tier]` | chat, settings dialog and menus as well as layout |
| `cmp.mjs <baseline-url> <skin-url>` | the skin against a stock `web` profile, side by side |
| `recon.mjs <url> <out>` | a DOM outline with boxes and attributes — the tool that produced the selector vocabulary |
| `serve.sh <profile> <port> <log>` | starts a profile on a spare port, waits for the token URL, records the pid in `<log>.pid` |
| `shots.mjs <url>` | the screenshot set for the README and the landing page (states the colour scheme per shot) |
| `images.mjs` | resize and compress those into `docs/assets/*.webp` |
| `og.mjs <url>` | render the 1200×630 social preview from the landing page's own design system |

Always drive a **second** profile on a spare port (`serve.sh`) rather than the GUI you are
working from: the harness opens sessions, clicks drawers and reloads pages.

## Comparing against stock

`cmp.mjs` needs a stock profile too, pointed at the same Harness home so both sides see the same
sessions:

```sh
DSH_HOME=/tmp/fa-home ./serve.sh web 3099 /tmp/fa-base.log
```

That is how the two product-level mobile defects this package fixes were found: the stock
transcript is **108px** wide on a 390px phone, and the conversation's `clamp(680px, …)` reading
measure is wider than the viewport.

## Traps, and what each one cost

**If a claim is about what a user sees, measure what is rendered.** A whole class of confident
wrong answers here came from querying properties that *sound* like the question and are not.

| query | reports | actually means |
| --- | --- | --- |
| `scrollWidth > clientWidth` | a clip | includes absolutely-positioned descendants and scroll room: fires on a 20px close button (32) and a fine tab strip (392/390) |
| `textContent === 'Files'` on a leaf | not found | a label whose node also has element children never matches, so the search returns nothing and reads as a pass |
| `clientWidth` | `0` | always `0` on `display: inline`; comparing a text width against it flags every inline run |
| `getBoundingClientRect()` is `0x0` | not rendered | true for a hidden frame — and for `display: contents`, which generates no box *by design* and lays its children out in the grandparent |
| the element you found is the one you meant | — | the desktop frame stays mounted at phone widths, so a `0x0` twin of the same label sits there answering every question about its size |

The last two compounded into the most expensive one: treating `display: contents` as invisible
silently discarded *all nine* visible labels in the app, and `clipaudit.mjs` reported a pristine
**"0 clipped, PASS"** on a tree it had never actually looked at. A green result from a probe you
have not falsified is worse than no probe — see the *first* version of this audit, which passed
four surfaces while measuring nothing.

The honest test for clipping is the one the browser uses to decide whether to paint an ellipsis:
lay the text out in a `Range`, and compare that width against the content box of the ancestor that
owns the `overflow`. Then exclude what is *correctly* clipped — the `clip: rect(0 0 0 0)` screen-
reader pattern — by recognising the mechanism rather than a hashed class name, and check the whole
ancestor chain, because one bundle nests a `display: contents` wrapper inside the clipped span.

## The harness profile needs a credential, or half the app is unreachable

A profile with no API key boots into the product's own onboarding dialog, and that dialog's
`OnboardingModal` does this for as long as it is mounted:

```js
const appRoot = document.getElementById('root')
appRoot.inert = true
```

`inert` is inherited: **every** interactive node under `#root` becomes unfocusable and
unclickable — the composer included. Nothing throws, nothing is `display: none`, and
`getBoundingClientRect()` reports a perfectly healthy 774×116 card. The only symptom is that
`element.focus()` leaves `document.activeElement` on `<body>`, and that
`[data-composer-card]:focus-within` never matches, so every focus-keyed effect measures as absent
and looks like a CSS bug.

Seed the profile before running anything that depends on focus:

```yaml
# ${DSH_HOME}/settings.yaml — names the credential reference the route resolves
llm-deepseek:
  apiKeyEnv: DEEPSEEK_API_KEY
```

```yaml
# ${DSH_HOME}/.credentials.yaml
refs:                      # plain name → value; this is what `resolve`/`describe` read
  DEEPSEEK_API_KEY: sk-any-placeholder
records:                   # `<scope>/<id>` → tagged record; a different, structured namespace
  DEEPSEEK_API_KEY: …      # WRONG — every record key must be "<scope>/<id>" or boot fails
```

Two things here are easy to get wrong and both fail loudly at boot rather than quietly:
record keys must be `<scope>/<id>` (so `llm-pi-ai/deepseek-official`, never a bare env name), and
the value the route resolves comes from `refs`, not from `records`. `composercheck.mjs` now
asserts `inert: false` explicitly, so this state fails as itself instead of as four phantom
"the effect does not work" failures.

## The traps

**A `bash` script whose stdout is captured cannot leave a child running.**
`landing-site.sh start` launched its server as
`( cd "$DOCS" && setsid python3 -m http.server … >"$LOG" 2>&1 </dev/null & )`.
That looks detached, and `setsid` does detach the *session* — but the server
stayed a live child of the script, so `bash` sat in `do_wait` for a process that
by design never exits. The suite calls it as `URL=$(bash landing-site.sh start)`,
a **command substitution**, so the script's stdout is a pipe: because the still-
running server held the write end, `URL=$(…)` never saw EOF and blocked forever.
`set -u` does not help, `timeout` inside the probe does not help, and the probe
itself is innocent — it never got a chance to run.

The signature, and it is worth memorising:

```
$ cat /proc/<wrapper>/wchan
anon_pipe_read                      # the caller, blocked on the substitution
$ cat /proc/<start-script>/wchan
do_wait                             # this script, waiting for a child that never exits
$ pgrep -P <start-script>
417382 python3 -m http.server 8099  # the "detached" server, still parented here
```

Walking `/proc/*/fd` to find *who holds the pipe* is what settled it:

```
pid=419366 fd=3 -> pipe:[3488374278]   # bash -c, reading
pid=419380 fd=1 -> pipe:[3488374278]   # landing-site.sh start, holding it open
```

The fix is to close all three descriptors at the subshell level
(`( … & ) >/dev/null 2>&1 </dev/null`), which leaves nothing for the shell to
wait on. `start` went from "hangs forever" to `0.309s`.

This is the second stall of this shape in the project's history, and both cost
hours. The general rule: **any backgrounded process started by a script whose
output is captured must be reaped or fully detached — `&` alone is not
detachment.**

**`DSH_HOME` decides which profile the harness serves, and its absence is
silent.** `deploy.sh` writes to `${DSH_HOME:-/tmp/fa-home}/profiles/frutiger/…`.
If the launcher does not export `DSH_HOME`, `dsh` falls back to its default home
(`/root/.dsh`), which holds a profile from whenever it was last created — and
nothing in the loop updates it. The result is a browser loading an arbitrarily
old build while every build and deploy step reports success.

This cost most of a session and produced a wrong conclusion that looked
well-evidenced: a probe reported `animationName: none` and no `fa-hero-lift` rule
in any stylesheet, which reads as "the CSS is not reaching the page". It was
true, and the cause was not the CSS. The tell was that the *built* bundle
contained the keyframes and the *served* bundle did not:

```
$ grep -c fa-hero-lift packages/frutiger-aero/lib/client.js
1
$ md5sum /root/.dsh/profiles/frutiger/node_modules/dsh-frutiger-aero/lib/client.js
97d262cbc3a3689d401db9fea339b647   # 176,631 bytes, dated Sep 20
$ md5sum /tmp/fa-home/profiles/frutiger/node_modules/dsh-frutiger-aero/lib/client.js
a8bf7f4d8a5dd15646374b47a3adb67b   # 283,273 bytes, the real build
```

The cheap standing check, which belongs beside the `?rev=` restart rule:

```sh
# what the browser is actually being handed
curl -sL "http://127.0.0.1:7795/?$TOKEN" -o /tmp/page.html
python3 -c "
import re,html,urllib.request
h=open('/tmp/page.html').read()
u=html.unescape(re.search(r'(/plugins/\?\?[^\s\"<>]*frutiger[^\s\"<>]*)',h).group(1))
d=urllib.request.urlopen('http://127.0.0.1:7795'+u,timeout=30).read().decode('utf8','replace')
print('showcase rules:', d.count('fa-hero-lift'))"
```

If that prints `0` after a successful build, the harness is serving the wrong
tree and no CSS conclusion you draw from the page is about your file.

**A green light is only evidence if you have seen it go red.** `effects-perf.mjs`
passed for three releases while measuring almost nothing about the file it was
written for, and the tell was that its red-proof was *refused* — injecting a
deliberately illegal animation changed no output. Three separate defects were
stacked, each one a plausible way to write the scan:

| what the probe did | why it saw nothing |
| --- | --- |
| `for (const rule of sheet.cssRules)` | `showcase.css` is one `@media` block: top level is 1 rule, the content is 44 deep |
| `getComputedStyle(el).animationName` | a pseudo-element's animation is only reported by `getComputedStyle(el, '::before')`; five effects live there |
| measured the hero only | the turn entrance, seat entrance, pulse and scroll-edge masks need a transcript, so they did not exist on the page |

Before trusting a new assertion, break the thing it asserts and watch it fail. If
that is hard, suspect the assertion.

**An assertion that samples a running animation is a coin flip, not a check.**
`composercheck.mjs` read the composer's focus ring at a fixed 700 ms and expected
exactly `1`; it got `0.42`, `0.47` and `0.55` on three runs, because it was
reading a 240 ms opacity transition mid-flight — the product auto-focuses at
boot, so the transition had started at an unknown moment. The same file pinned
one exact frame of a 7.4 s loop (`-1px` exactly, of a value that oscillates
between `-1` and `-1.5`). Both are now written as ranges and as facts that do not
depend on phase, and where a rendered value genuinely is the claim, the fix is to
*pin the phase* through `document.getAnimations()` — which is what
`effects-parity.mjs` does.

**An animation at the animation origin beats a normal declaration.** Not "usually"
— always, regardless of specificity and regardless of which stylesheet loaded
last. The hero's `fa-hero-lift` therefore replaced the composer's `:focus-within`
lift rather than adding to it, and because both produce *a* transform, the card
still moved and still looked right. The fix is `animation-composition: add`, and
the general rule is that any new `@keyframes` on a property the cascade also
writes needs that composer to be checked deliberately.

**A `transition-property` is not a transition.** It is the CSS initial value, so
every element in the page reports `all`, and a large number report a real
property at `transition-duration: 0s` — a declaration that exists and does
nothing. Counting either produces phantom effects in every region. The usable
test is declared **and** non-zero.

**A mounted overlay is not a visible one.** The product keeps the right panel mounted while
closed, slid off-screen with `visibility: hidden`, so its `getBoundingClientRect().height` stays
at the full viewport height. Any check built on "is it tall" or "does it exist" reports it as open
forever. Ask for `visibility` *and* an on-screen position.

**A centre point is not a reachable point.** `boundingBox()` returns a box even when the element
is scrolled out of view, so a tap at its centre silently lands nowhere. `scrollIntoViewIfNeeded()`
first, and assert on what `elementFromPoint` says the point hits.

**A cumulative bisect proves nothing.** Disabling one stylesheet, then another, then another
inside a single page session gives results that belong to the *last* variant rather than to each
one. `lum.mjs` reloads the page for every variant for exactly this reason. The first version of
that test was cumulative and produced three identical numbers that looked like agreement and
were not — it sent the investigation the wrong way for a while.

**Passing in one language is passing in one language.** Every interaction script
here ran with the default `en-US` locale, and the dock was driven by English
`aria-label` lookups. The client ships exactly `["zh", "en"]`, so on a Chinese
install every lookup returned nothing — and one of them matched the dock's own
button, which then clicked itself until the stack blew. Nothing in the suite
could see it. Locale is now a parameter, and `lib/session.mjs` asserts that an
action changed the state instead of continuing quietly when it did not.

**A `pointer-events: none` layer is invisible to the DOM.** The worst bug this plugin has had — a
full-viewport `backdrop-filter` living on the right column, blurring and desaturating the entire
application on a phone — never appeared in `elementFromPoint`, because the column it lived on does
not receive pointer events. Computed styles on the content were perfect, at every viewport and
every DPR. It existed only in the pixels, and only a luminance measurement found it: standard
deviation **7.1** in the transcript band where the same content should have read **26.3**. If a
claim is about what a user *sees*, measure what is rendered.

## `scroll-behavior: smooth` and scripted scrolling

`landing.mjs` sets `document.documentElement.style.scrollBehavior = 'auto'` before walking the
page. With smooth scrolling on, a loop of `window.scrollTo` calls keeps re-targeting the previous
animation and the page never cleanly samples each position — which shows up as reveal animations
that "sometimes" do not fire.
