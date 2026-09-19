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
| `trajcheck.mjs <url>` | the Trajectory view on a phone and on the desktop: 11 assertions |
| `final.mjs <url> <out> [tier]` | every viewport: layout, drawer, dock, computed styles, console errors, screenshots |
| `tiers.mjs <url>` | the same page at `full` / `lite` / `off`, per viewport |
| `hit.mjs <url>` | what a tap at each point of the viewport actually reaches |
| `geom.mjs <url> <tag> [mobile]` | the laid-out geometry of one transcript row, element by element |
| `colors.mjs <url>` | the *effective* colour and opacity of each visible row |
| `lum.mjs <url>` | rendered-contrast measurement per condition — standard deviation of luminance in a fixed crop, with a fresh page per variant |
| `bisect-styles.mjs <url>` | disables one of the plugin's stylesheets at a time, to attribute a rendering change |
| `dpr.mjs <url>` | the same crop at 1x, 2x and 3x device pixel ratio |
| `landing.mjs <url>` | the landing page: 19 checks across desktop, mobile and reduced motion |
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

## Four traps, and what each one cost

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
