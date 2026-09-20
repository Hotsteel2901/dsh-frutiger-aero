---
description: "Frutiger Aero profile bundle for the DeepSeek Harness browser surface: a glass/aqua reskin built on the product's own token graph, plus a mobile layout that replaces the squeezed desktop with a drawer, a thumb-reachable dock and a keyboard-aware composer."
kind: "plugin"
---

# dsh-frutiger-aero

English | [中文](README.zh.md)

[![npm version](https://img.shields.io/npm/v/dsh-frutiger-aero?color=4cc4ef)](https://www.npmjs.com/package/dsh-frutiger-aero)
[![npm downloads](https://img.shields.io/npm/dm/dsh-frutiger-aero?color=4cc4ef)](https://www.npmjs.com/package/dsh-frutiger-aero)
[![license](https://img.shields.io/badge/license-MIT-4cc4ef.svg)](LICENSE)
[![dsh-plugin](https://img.shields.io/badge/topic-dsh--plugin-4cc4ef.svg)](https://github.com/topics/dsh-plugin)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-plugin-0d7cb4.svg)](https://github.com/deepseek-ai/deepseek-harness)
[![landing page](https://img.shields.io/badge/landing%20page-frutiger--aero-129dd0.svg)](https://Hotsteel2901.github.io/dsh-frutiger-aero/)

**Frutiger Aero for the DeepSeek Harness browser UI — glass, water, sky and bubbles, on desktop
and on a phone that finally fits a thumb.**

A portable `dsh` profile bundle. It reskins the whole Web surface through the product's own token
system, and it rebuilds the narrow-viewport layout so a phone stops being a squeezed desktop and
becomes an app.

- 🖥️ **Desktop** — the three-column layout, drag-to-resize handles, dialogs, menus, text
  selection, wheel scrolling and keyboard input all still work. The skin adds material and
  changes no behaviour.
- 📱 **Mobile** — an overlay drawer instead of a crushed conversation, a floating glass dock under
  the thumb, edge-swipe gestures, a keyboard-aware composer, 44px touch targets and safe-area
  insets throughout.
- 🎨 **Frutiger Aero** — frosted panes over a living wallpaper, aqua gloss on everything you can
  press, a bright rim on every edge, and a dark scheme that is deep water rather than grey.
- 🌗 **Light and dark** — one palette per scheme, composing with the built-in appearance switch
  instead of fighting it.
- 📦 **Zero dependencies** — the browser half `require`s nothing at all. Install is a file copy;
  there is no build step and no network access at runtime.

[![The dsh desktop layout with the Frutiger Aero skin](docs/assets/shot-desktop-light.webp)](docs/assets/shot-desktop-light.webp)

<p align="center">
  <img src="docs/assets/shot-phone-light.webp" width="220" alt="The dsh chat on a phone: frosted glass composer, glass to-do bar and a floating glass dock over a sky-and-water wallpaper" />
  <img src="docs/assets/shot-phone-dark.webp" width="220" alt="The same phone view in the dark scheme: deep water, bioluminescent bubbles and a cyan-rimmed composer" />
  <img src="docs/assets/shot-phone-drawer.webp" width="220" alt="The navigation drawer open over the conversation with a dimming scrim behind it" />
</p>

---

## Contents

- [Install](#install)
- [Turning it off, or down](#turning-it-off-or-down)
- [What changes on a phone](#what-changes-on-a-phone)
- [What stays the same on a desktop](#what-stays-the-same-on-a-desktop)
- [How it works](#how-it-works)
- [Performance](#performance)
- [Compatibility](#compatibility)
- [FAQ](#faq)
- [Verification](#verification)
- [Repository layout](#repository-layout)
- [Contributing](#contributing)
- [License](#license)

---

## Install

Three ways in. Pick whichever matches what you already have.

### 1 · npm one-liner (recommended)

```sh
dsh plugin --profile web add dsh-frutiger-aero
```

Installs the latest published version and registers it as a profile bundle layer. Reload the web
UI and it is on. Works on every platform, and
`dsh plugin --profile web remove dsh-frutiger-aero` takes it back off.

### 2 · GitHub installer (no npm account, no git)

**macOS / Linux:**

```sh
curl -fsSL https://raw.githubusercontent.com/Hotsteel2901/dsh-frutiger-aero/main/install.sh | sh
```

**Windows (PowerShell):**

```powershell
irm https://raw.githubusercontent.com/Hotsteel2901/dsh-frutiger-aero/main/install.ps1 | iex
```

Both download the latest release, place it in the target profile's `node_modules`, and add it to
that profile's bundle list. They need nothing but Node — no package manager, no registry, no
build. Pass a profile name to install somewhere other than `frutiger`:

```sh
curl -fsSL .../install.sh | sh -s -- --profile aero
```

### 3 · From a clone (for development)

```sh
git clone https://github.com/Hotsteel2901/dsh-frutiger-aero
cd dsh-frutiger-aero
node install.mjs                 # installs into `--profile frutiger`
node install.mjs --link          # …or link the checkout, so a rebuild is live
```

Then:

```sh
dsh --profile frutiger --port 3099 --no-open
```

…and open the URL that command prints — it carries a one-time token, so the browser gets an
authenticated session cookie.

### Installer options

| flag | effect |
| --- | --- |
| `--profile <name>` | profile to create or update (default `frutiger`) |
| `--home <dir>` | Harness home to operate on (default `$DSH_HOME`, then `~/.dsh`) |
| `--link` | symlink the checkout instead of copying — for hacking on the plugin |
| `--print` | resolve everything, write nothing |
| `--uninstall` | remove the package and its bundle entry, keeping the profile and its sessions |
| `--json` | machine-readable result |

---

## Turning it off, or down

**Per browser, without touching the install.** The plugin publishes a small control surface:

```js
window.__FRUTIGER__.setEffects('lite')   // 'full' | 'lite' | 'off'
window.__FRUTIGER__.setScene(false)      // wallpaper only
window.__FRUTIGER__.tier()               // what is active right now

window.__FRUTIGER__.bubbles()            // { step, steps, count }
window.__FRUTIGER__.bubbles('calm')      // 'calm' | 'normal' | 'lively'
```

**Wallpaper density.** The tier picks a sensible *default* number of bubbles for your device, and
`bubbles()` lets you disagree with it without turning the wallpaper off:

| step | effect | on a `full` tier | on a `lite` tier |
| --- | --- | --- | --- |
| `calm` | about half as many | 10 | 5 |
| `normal` | the tier default | 22 | 10 |
| `lively` | nearly twice as many | 40 | 18 |

The multipliers apply to the tier's baseline rather than replacing it, so a `lite` device stays
`lite` at every step. The count is clamped to 3–48 either way. Changing it rebuilds the scene but
not the *composition* — bubble placement comes from a fixed seed, so the wallpaper you chose is
the one you keep. The preference is stored per browser, survives a reload, and a sticky-hands
click on `normal` clears the stored value rather than pinning today's default.

…or straight from the URL:

```
http://127.0.0.1:3099/?frutiger=off       # no decoration at all
http://127.0.0.1:3099/?frutiger=lite      # palette and layout, no blur, 10 bubbles
http://127.0.0.1:3099/?frutiger=full      # force the top tier and skip the governor
http://127.0.0.1:3099/?bubbles=calm       # a quieter wallpaper, stored setting untouched
```

The URL form is read on every load *after* the token exchange, so bookmark the clean URL rather
than the one `dsh` prints. A query parameter always beats the stored preference, which makes
`?bubbles=` the right tool for a screenshot or a bug report that needs an exact count.

**Disable the row, keep the package.** In `<profile>/cordis.patch.yml`:

```yaml
- id: frutiger-aero
  disabled: true
```

The profile reloads its patch file live, so this takes effect without a restart.

**Remove it.** `node install.mjs --uninstall`, or
`dsh plugin --profile web remove dsh-frutiger-aero`. The profile and its sessions are left alone.

---

## What changes on a phone

The stock narrow layout *squeezes*: below 1024px the sidebar keeps its grid track, so a 390px
phone gives 56px to an icon rail and 334px to the thing being read — and once the drawer opens,
the transcript is **108px** wide. This plugin changes the layout itself, not just the paint.

| | ≥ 1024px | 641–1023px | ≤ 640px |
| --- | --- | --- | --- |
| layout | stock three columns | one column, sidebar overlays | one column, rail off-canvas |
| navigation | sidebar | 56px rail, drawer over content | floating bottom dock |
| reading measure | product default | full column, capped at 680px | full column |

On top of that:

- **A drawer that slides over the content**, with a scrim that dismisses it and takes the tap
  that would otherwise have scrolled the page behind it.
- **Edge-swipe gestures** — swipe from the left edge to open, swipe left to close. Vertical intent
  hands the gesture straight back to the scroller.
- **A bottom dock** whose buttons click the product's own controls by accessible name rather than
  reimplementing anything. A button whose control is absent simply does not render.
- **A keyboard-aware composer** — `visualViewport` publishes the occluded height as a custom
  property, so the composer lifts by exactly that much on iOS, where the layout viewport never
  resizes.
- **Touch ergonomics** — 44px targets on coarse pointers (with a 36px floor for dense toolbars,
  where forcing 44px would reflow the strip), a 16px input floor that stops iOS's sticky focus
  zoom, `touch-action: manipulation`, momentum scrolling, contained overscroll, no tap highlight,
  and light haptics on press.
- **Safe areas** — `viewport-fit=cover` plus `env(safe-area-inset-*)` on the drawer, the dock and
  the composer, and `100dvh` instead of `100vh`.

Two **product-level defects** are fixed rather than worked around, because a reskin that leaves
them is a reskin of a broken screen:

1. the 56px rail that crushes the transcript; and
2. a conversation that declares its reading measure as `clamp(680px, …)` — a **680px floor**,
   wider than a phone, which clips every turn into a column of left-edge slivers.

A full-screen right panel (a file preview, a diff) keeps the dock — session navigation is still
useful while reading — but the panel stops above it, so the last lines of a file are never
stranded behind a floating bar.

---

## What stays the same on a desktop

Everything. The skin is additive:

- three-column layout, column drag handles, sidebar collapse/expand;
- dialogs, menus, popovers, tooltips and toasts (which get the glass treatment, not new
  behaviour);
- text selection, wheel scrolling, keyboard navigation and focus rings;
- the product's own light/dark switch, its font-size setting and every other preference.

`interact.mjs` asserts this on every run — see [Verification](#verification).

[![The dsh desktop layout in the dark scheme](docs/assets/shot-desktop-dark.webp)](docs/assets/shot-desktop-dark.webp)

<details>
<summary>Settings dialog and the mobile file preview</summary>

<p align="center">
  <img src="docs/assets/shot-settings.webp" width="520" alt="The settings dialog as a large frosted pane over a dimmed, blurred app" />
  <img src="docs/assets/shot-phone-preview.webp" width="200" alt="A full-screen file preview on a phone, stopping above the floating dock" />
</p>

</details>

---

## How it works

### It is a plugin, and it behaves like one

The bundle patch inserts a single row whose host half is an empty `apply()`. The row exists for
what its *manifest* declares: `dsh.client`, which makes `@deepseek-ai/dsh-client-modules` compose
`lib/client.js` into `window.__DSH_BOOT__` as a browser plugin. Nothing is added to the host — no
service, no tool, no config, no session state.

The browser half paints, and only paints. Every hook it installs is a stylesheet, a node it owns,
a passive listener, or an attribute on a node the product owns, and each one is released through
`ctx.effect`. Setting `disabled: true` on the row returns the page to stock.

### Colour: the token graph, not the components

The product's colour system is two tiers — `--dsw-static-*` raw ramps and `--dsw-alias-*`
semantic roles — and every surface, border and label resolves through the semantic tier.
Overriding that tier retints the entire application without a single component-level rule, and
because those alias values are what `ui-layout` writes onto `<body>`, it is also the only layer
that composes with the built-in light/dark switch instead of fighting it.

The palette is written twice on purpose:

- as an `!important` stylesheet keyed on `body[data-ds-dark-theme]` — the only thing in the
  cascade that outranks an inline custom property, so the skin can never lose a specificity race
  to a load-order accident;
- through `theme.overrideTokens()`, so the runtime snapshot, the `theme-color` metadata and the
  Appearance preview cubes stay coherent with what is painted.

`src/client/palette.js` is the single source of truth for both. The raw ramp is shared; only the
semantic aliases differ per scheme, because Aero is a *light* material (glass over a bright sky)
and its night counterpart is a *dark* one (bioluminescence over deep water).

### Structure: the product's own vocabulary

CSS-module class names are hashed per build (`.pI_x6G_sidebarCol`), so they are worthless as
selectors across an upgrade. What the product does keep stable is the semantic `data-*`
vocabulary its own styles and tests depend on. The skin is written against that —
`[data-rightbar-col]`, `[data-shell-overlay]`, `[data-conversation-scroll]`,
`[data-composer-card]`, `[data-chat-flow-kind]`, `[data-files-row]` — plus ARIA roles and element
semantics.

A small rAF-coalesced tagger adds the rest: it finds the frame as the parent of
`[data-rightbar-col]`, labels each column `data-fa-col`, and finds the conversation canvas as the
first ancestor of the transcript that actually paints a background. It watches `childList` and
three presentation attributes, never the message list, and never its own writes.

### The wallpaper

Nine layers in one fixed element with `contain: strict`, so it cannot participate in layout,
cannot be scrolled, and never appears in a hit test. Two rules keep it cheap:

1. only `transform` and `opacity` are animated — the two properties a compositor can animate
   without waking the main thread;
2. nothing animates behind a `backdrop-filter`. The scene is built from large feathered gradients
   — already the look a blur would produce — so no filter is ever recomputed as the bubbles move.

There is no rAF loop anywhere in the plugin, and no `will-change` hint: 22 promoted layers cost
more than the wallpaper is worth, and an animated transform is promoted by the engine anyway.

---

## Performance

Adding animation to an application you do not own is only responsible if the cost is bounded, so
the plugin runs a tier governor.

| tier | chosen when | wallpaper | blur | animations |
| --- | --- | --- | --- | --- |
| `full` | fine pointer, ≥ 3 cores, ≥ 4 GB | 22 bubbles, caustics, light shafts, grain | yes | all |
| `lite` | coarse pointer or small screen, ≤ 4 cores, ≤ 3 GB, save-data, reduced motion | 10 bubbles | no | entrances only |
| `off` | explicit `?frutiger=off` | none | no | none |

Classification reads only signals that are free (`pointer`, `hardwareConcurrency`,
`deviceMemory`, `saveData`, `prefers-reduced-motion`), and the plugin then samples frame pacing
for about a second after boot and downgrades **once** if the samples disagree — the governor only
ever moves down, so a device that recovers cannot oscillate between rich and plain. An explicit
request disables the governor entirely: a user who asked for `full` asked for `full`.

The one genuinely expensive property in the design is `backdrop-filter`, and it is gated twice:
off below `full`, and applied only to panes smaller than the viewport. That second gate is
load-bearing — an early build applied it to the right *column*, which is a zero-width track on
desktop but spans the whole screen once the frame collapses to a single column, so on a phone it
blurred and desaturated the entire application.

`prefers-reduced-motion` is honoured as *no movement*, not *no theme*: the wallpaper stays and
freezes. A hidden tab pauses every animation.

---

## Compatibility

- **Surface:** the dsh Web UI (`dsh --profile web`, or any profile built on
  `@deepseek-ai/dsh-base` + `@deepseek-ai/dsh-web-app`). Desktop clients that embed the dsh Web
  UI get the same skin, because the plugin targets the product's tokens and hooks rather than one
  client's DOM.
- **Node:** whatever the dsh installation itself requires. The plugin adds no engine requirement.
- **Browsers:** any current Chromium, Firefox or WebKit. `backdrop-filter`, `:has()` and `dvh`
  all degrade rather than break — the `lite` tier exists precisely so a device that cannot afford
  the glass still gets the palette and the layout.
- **Other plugins:** anything built on the `--dsw-*` tokens is retinted along with the rest of the
  app. A plugin that hardcodes its own colours, or paints a full-viewport `backdrop-filter`, can
  still clash — that is a real limitation, not a hypothetical one.

---

## FAQ

<details>
<summary>Does it break the app, or leak outside the theme?</summary>

The host half is an empty `apply()` — no service, no tool, no session state. The browser half
paints and nothing else. Every side effect is released through `ctx.effect`, so disabling the row
returns the page to stock.

</details>

<details>
<summary>How do I get the stock UI back exactly?</summary>

`node install.mjs --uninstall`, or `- id: frutiger-aero` + `disabled: true` in the profile's
`cordis.patch.yml`. Both leave the profile, its sessions and its settings in place.

</details>

<details>
<summary>Why does it touch the layout on mobile instead of only the colours?</summary>

Because the stock narrow layout is broken in a way that colour cannot fix: 108px of transcript on
a 390px phone. A skin that leaves that alone is a skin of a broken screen.

</details>

<details>
<summary>Will it slow my machine down?</summary>

Read the tier table above. The short version: at `full` you get a blurred composer, a blurred
dialog and a 22-bubble wallpaper, all of it compositor-only; at `lite` you get the palette and
the layout with no filters at all. Nothing animates off screen or in a background tab.

</details>

<details>
<summary>Can I change the palette without forking?</summary>

Not yet through a settings UI. `src/client/palette.js` is the single source of truth and
`node build.mjs` regenerates both the stylesheet and the theme-service override from it. A
settings row is a reasonable next step — see [CHANGELOG.md](CHANGELOG.md).

</details>

---

## Verification

`.devtools/` drives the real page with Playwright. It is not part of the deliverable and not
needed to install anything, but it is how every claim in this README was checked.

| script | what it answers |
| --- | --- |
| `interact.mjs` | **real input** — CDP touch swipes, taps, typing, wheel, drag, selection: 29 assertions per run, in both shipped locales |
| `docktest.mjs` | the phone dock in Chinese and English: 24 assertions per run |
| `trajcheck.mjs` | the Trajectory view on a phone and on the desktop: 11 assertions |
| `settingscheck.mjs` | the settings dialog from the dock, both locales, phone and desktop: 23 assertions |
| `aligndiff.mjs` | off-centre controls **introduced by the skin**, measured against a stock profile |
| `final.mjs` | every viewport: layout, drawer, dock, computed styles, console errors, screenshots |
| `tiers.mjs` | the same page at `full` / `lite` / `off`, per viewport |
| `lum.mjs` | rendered-contrast measurement, for finding things that only exist in pixels |
| `landing.mjs` | the GitHub Pages landing page: 19 checks across desktop, mobile and reduced motion |
| `hit.mjs` | what a tap at each point of the viewport actually reaches |

The suite runs against desktop, laptop, tablet, portrait phone, small phone and landscape phone,
in both colour schemes, at every tier, and in both languages the client ships. Current state:
**29/29 interaction checks** (×2 locales), **24/24 dock checks**, **11/11 Trajectory checks** and
**19/19 landing checks**, with a clean console throughout.

---

## Repository layout

```
install.mjs                  portable profile installer / uninstaller
install.sh, install.ps1      GitHub one-liners (no npm account needed)
packages/frutiger-aero/      the plugin — this is what gets published to npm
  package.json               dsh.bundle + dsh.client declarations
  cordis.patch.yml           the one row this bundle inserts
  build.mjs                  inlines src/css/*.css into lib/client.js
  src/host.js                node half (deliberately empty)
  src/client/palette.js      the whole colour system, one source of truth
  src/client/scenery.js      the wallpaper's DOM, seeded and deterministic
  src/client/runtime.js      tiering, tagging, mobile layer, dock, control surface
  src/css/*.css              base, scenery, material, mobile, effects
  lib/                       built artifacts (committed — installing needs no build)
docs/                        the GitHub Pages landing page
submission/                  ready-to-PR registry entry
.devtools/                   the verification harness
```

Rebuild the browser half after editing anything under `src/`:

```sh
node packages/frutiger-aero/build.mjs
```

---

## Contributing

Issues and pull requests are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). The short version:
read [How it works](#how-it-works) first, keep the two rules (paint only, and release every side
effect through `ctx.effect`), and run `interact.mjs` before opening a PR that touches the mobile
layer.

## License

MIT — see [LICENSE](LICENSE).

An unofficial community plugin. Not affiliated with or endorsed by DeepSeek.
