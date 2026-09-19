# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
