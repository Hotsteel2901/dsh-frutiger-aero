# Desktop effects pass — measured constraints

Reconnaissance for the "desktop effects" work. Everything here was measured
against a live 1440×900 desktop session, build `1.0.5 8bd8cf27f9c3`.

## 1. What the product already animates (do not fight these)

| Target | Property | Duration | Timing |
|---|---|---|---|
| `[data-sidebar-right-panel]` | `transform, visibility` | 0.3s / 0s | `cubic-bezier(.4,0,.2,1)` |
| `[data-fa-frame]` (`div.pI_x6G_frame`) | **`grid-template-columns`** | 0.3s | `cubic-bezier(.4,0,.2,1)` |
| sidebar search / header slots | `max-width, padding, opacity, transform, visibility` | 0.12–0.18s | standard |
| chevrons (`span*_chevron`) | `transform` | 0.12s | ease |
| composer card | `box-shadow, border-color` | 0.22s | standard |
| right panel handle | `left` | 0.3s | standard |

**Consequence.** The right panel is *already* a slide (`matrix(1,0,0,1,649,0)`
→ `none`). An `animation` on `transform` there would be a second writer on the
same property, decided by load order. The panel is therefore an **exit /
posture** target, not an entrance target.

The frame transitioning `grid-template-columns` means the centre column's width
is already animating in layout while the sidebar moves. Anything the effects
layer adds to the frame must not touch geometry.

## 2. The stable hook vocabulary available

Read off a live page with a conversation open. Only these are documented as
usable: the product hashes CSS-module class names per build
(`.wSkVaW_composerStack`, `.hHd-Xa_brand`, `.P3OORG_iconButton`), so a class
selector is dead on the next upgrade.

```
data-slot                 root, sidebar, sidebar.brand.mark, sidebar.brand.name,
                          sidebar.workspaces, sidebar.workspaces.directoryFlow,
                          sidebar.footer.action, sidebar.settings,
                          conversation.input.overlay, conversation.input.attachments, …
data-phase                hero | active | plain
data-chat-flow            one conversation flow;  data-chat-flow-kind on each row
data-chat-flow-key        the flow's identity
data-chat-turn            one exchange
data-turn-tail            the trailing block of a turn  (mounts once)
data-turn-process         the collapsible process disclosure
data-turn-process-*       answer, hidden, inline, member, messages, subagents, tool-calls
data-disclosure-row       a summary row that expands
data-expandable           the chevron-carrying expander
data-state                idle | ok        ← NOT "running"/"pending"
data-side                which side a chevron points
data-conversation-scroll
data-composer-card / -seat / -input / -placeholder / -stats
data-dockkit-*            surface, pane, pane-active, strip, strip-tabs, strip-fill,
                          strip-chrome, tab, split-button, add-tab, drop-zones
data-sidebar-right-panel / -toggle / -expand / -mode
data-rightbar-col
data-width-handle
data-shell-overlay        role="dialog" when a dialog is open
data-dsh-boot             the boot surface, present ~600ms
data-dsh-boot-spinner
```

**Anchors that do not exist, and were assumed at first.** Each of these was
written into a selector during the desktop pass and matched nothing, in every
state, on every run:

```
data-approval-scroll   data-code-block-content   data-files-row   data-files-entry
data-message-attachments   data-trajectory-row-key   data-trajectory-scroll
data-tip   data-composer-chip   data-sidebar-right-open
```

`data-files-row` and `data-message-attachments` *do* appear in `material.css`
prose and in earlier versions of this document, so they were the most tempting.
They are not in the DOM of this build. A rule against one renders as nothing,
forever, and no per-effect probe can tell that from "switched off" — which is
the whole argument for `effects-manifest.mjs` asserting a per-region *floor*
rather than only checking effects by name.

**Right panel geometry.** At 1440×900 with a conversation open and the panel
*closed*, the dockkit pane measures `x=1441, w=648` — entirely off-screen, so
nothing inside it is hoverable. After clicking `[data-sidebar-right-toggle]` it
moves to `x=792` and becomes a normal target. Any probe that hovers the panel
must open it first; a `:hover` that "does not work" there is a probe bug.

**Composer subtree.** `[data-composer-stats]` is **not** a descendant of
`[data-composer-card]`. Measured ancestry:

```
[data-composer-stats] < [data-slot] < .uV2eYG_root < [data-slot]
  < .wSkVaW_composerStack < [data-chain-overlay-fallback] < [data-slot]
  < [data-composer-seat] < [data-conversation-scroll]
```

The card and the seat are siblings under the stack. `[data-composer-card]
:focus-within [data-composer-stats]` therefore matches nothing; the state has to
hang off `[data-composer-seat]`, which is the nearest stable common ancestor.
`data-composer-input` is the `contenteditable` editor, holds no buttons, and can
report `contenteditable="false"` with a "pick a model first" placeholder.

## 3. Where the settings dialog lives

Chain: `div > div > div[slot=sidebar.settings] > … > div[slot=sidebar] > div[col=sidebar]`

It is **inside the sidebar subtree**, `inSidebar: true`, `onBody: false`, and it
does *not* sit under `[data-shell-overlay]`. It has no transition of its own
(`transition-duration: 0s`) — so it is a legitimate **entrance** target.

## 4. Plugin-owned hooks already published

`data-fa-frame`, `data-fa-col` (sidebar/center/rightbar), `data-fa-canvas`,
`data-fa-scene`, `data-fa-bubbles`, `data-fa-scrim`, `data-fa-dock`,
`data-fa-dock-action`, `data-fa-bubble`, `data-fa-meta`, `data-fa-tier`,
`data-fa-pointer`.

Tier classes on `<html>`: `fa-tier-full` / `fa-tier-lite` / `fa-tier-off`.
Pointer: `root.dataset.faPointer` = `coarse` | `fine`.

## 5. What the desktop pass added, and what it costs

Measured with `effects-perf.mjs` at 1440×900, `full` tier, one conversation open.

| | full | lite | off |
|---|---|---|---|
| elements carrying an animation | 45 | 26 | 7 |
| of which plugin-authored | 38 | 19 | 0 |
| infinite loops | 35 | 19 | 0 |
| composited layers | 56 | 37 | 17 |
| long tasks >50ms during boot | 3 | 2 | 2 |
| wallpaper scene nodes | 34 | 22 | 0 |
| bubbles | 22 | 10 | 0 |
| animations actually painted | 45/45 | 21/26 | 7/7 |

Two things to read out of that table:

- **Each tier costs strictly less than the one above it.** That is the only
  assertion that shows the tier is doing anything; a count of effects cannot.
- **The long tasks do not come from this plugin.** Three at `full`, two at
  `lite`, two at `off` — the boot stalls are the product's own startup, and the
  effects layer is measurably not what makes the page stall. This is why the
  perf probe budgets long tasks generously and instead spends its strictness on
  layers and animated properties, which *do* move with the effects.

### The effects added, by region

`showcase.css` (last in the cascade) plus the desktop additions already in
`effects.css`. Loops are marked ▸; everything else is a transition or a
one-shot entrance.

| region | effect | shape |
|---|---|---|
| boot | lit horizon rising behind the boot surface | ▸ `fa-boot-horizon` |
| hero | composer card breathing | ▸ `fa-hero-lift` |
| hero | highlight travelling across the card | ▸ `fa-hero-glint` |
| transcript | turn tail arriving | `fa-turn-in` (once) |
| transcript | turn hairline on hover | transition |
| transcript | process row lift + colour | transition |
| transcript | completed step marker glowing | ▸ `fa-step-pulse` |
| sidebar | brand mark breathing | ▸ `fa-brand-breathe` |
| sidebar | rail glow | ▸ `fa-rail-glow` |
| sidebar | workspace rows / footer actions | transition |
| sidebar | list rows slide in | `fa-list-in` (once) |
| header | sheen across the header | ▸ `fa-header-sheen` |
| canvas | top wash when scrolled away | transition |
| scroll edges | top and bottom masks | transition |
| composer | caret pulse | ▸ `fa-caret-pulse` |
| composer | placeholder shimmer | ▸ `fa-placeholder-shimmer` |
| composer | seat arriving | `fa-seat-in` (once) |
| composer | stats brightening on focus | transition |
| composer | buttons lifting on hover | transition |
| right panel | toggle / rows / dockkit surfaces | transition |
| right panel | width handle brightening | transition |
| overlays | dialog rising, menu rows lifting | transition |
| overlays | scrim | *(left to the product — see below)* |
| wallpaper | 12 loops across 11 layers | ▸ 12 animations |

### Two deliberate omissions on the overlay scrim

`[data-shell-overlay]` looks like an obvious place for a longer, softer scrim
fade, and it is wrong:

- `material.css` already makes the scrim **`transparent`**.
- Its computed transition is `opacity, visibility` over `0.3s`, and the duration
  comes from a rule whose only identifier is a **hashed class name**. A
  competing `transition` declared in `showcase.css` would be decided by
  specificity and source order against a selector that cannot be named, and the
  failure mode is a scrim that fades *faster* than it used to — visible only in
  a build whose hash happens to differ.

So no transition is declared there. The general rule this file follows: only add
a transition where the element has none, or where the existing one can be read
and beaten honestly.

The **right panel** and the **dockkit surfaces** carry no loops either, and
`effects.css` records why: the panel already transitions its own `transform` and
`visibility`, so a second transform animation would be a second writer on the
same property; and an animated surface beneath a control the user may be
*dragging* (the pane splitter, the width handle) is a moving target.

## 6. The three rules any new effect must respect

From `effects.css`:

1. **Only `transform` and `opacity`.** No width/height/top/filter/box-shadow/
   background-position animation — with one documented exception, below.
2. **Entrances only on things that mount once.** The transcript virtualises, so
   a per-row entrance re-fires on scroll-back and reads as a glitch.
3. **Nothing watches the transcript.** No `:has()` anchored on streaming state.

`effects-perf.mjs` reads the live page's keyframes back and fails on a single
violation, so these are enforced rather than intended.

### The one earned exception

`scenery.css` animates `background-position` on the caustics layer, and it is
allowed to for a specific reason: two interference patterns of refracted light
drifting against each other cannot be produced by a `transform`, because a
transform moves the *element* and what has to move is the gradient **inside**
it. It is the most expensive visual in the skin, which is why the same file
hides the layer at `lite` and `off`.

`effects-perf.mjs` honours this only when both halves hold — the property is
`background-position`, *and* `.fa-scene__caustics` is hidden at every tier below
`full`. A second `background-position` animation anywhere, or one on a layer
that survives into `lite`, fails. That is what makes it an exception rather than
an exemption.

**Frame properties come back as longhands.** A keyframe declaring
`background-position` reads back as `background-position-x` and
`background-position-y`, never as the shorthand. A comparison against the
shorthand misses the very property the exception is about — so both sides are
normalised before the test.

### `transition-property: all` is the initial value, not a violation

Measured on a live page: **413** elements report `transition-property: all`, and
every one of them reports `transition-duration: 0s`. That is the CSS initial
value, present on anything no rule has given a transition. A probe that treats
`all` as a finding reports 413 failures and no regressions.

The usable test is a transition that is *declared*: `property !== all && property
!== none`, **and** `duration !== 0s`. Zero elements in this project animate via
`all`. CDP's `CSS.getMatchedStylesForNode` on `<html>` agrees: no matched rule
declares any `transition-*` property at all.

## 7. Where the cost actually is

`backdrop-filter` is the one genuinely expensive property in the design, and it
is **re-run every frame while the wallpaper moves behind it**. `material.css`
already gates it to `full` on the type-A surfaces. Any new effect that puts more
motion behind a blurred pane is a direct multiplier on that cost — which is why
the desktop pass must be measured, not asserted.

## 8. Harness note

`dsh` must run under **Node ≥ 24**. Node 22.13.1 fails at boot with:

```
dsh: plugin tree failed to load: … @deepseek-ai/dsh-session-persistence-jsonl:
The requested module 'node:zlib' does not provide an export named 'createZstdCompress'
```

The failure mode is silent when piped — `dsh` exits 0 with no output when its
stdout is not a TTY. Start it as:

```
setsid env PATH="/opt/node-v24.13.0-linux-x64/bin:$PATH" DSH_HOME=/tmp/fa-home \
  dsh --profile frutiger --port 7795 --no-open > /tmp/fa-final.log 2>&1 < /dev/null &
```

## 9. Three ways a probe can be green without measuring

The desktop pass ended with the per-tier probe passing and its red-proof
*refused*: injecting `background-position: 0 0` into `@keyframes fa-step-pulse`
produced no failure. The probe was not measuring that keyframe, and three
separate defects had to be found before it was.

Each is recorded here because each one looked like a correct probe, and because
the same three shapes will recur in any measurement written against this product.

### 9.1 The rule walk stopped at the stylesheet root

`showcase.css` is a single `@media (min-width: 1024px) and (hover: hover) and
(pointer: fine)` block. Every rule and every keyframe in it is therefore **one
level down** from `sheet.cssRules`. A scan written as `for (const rule of
sheet.cssRules)` sees exactly one rule for that whole file.

Confirmed by walking the tree: `sheet.cssRules.length === 1`, and
`sheet.cssRules[0].cssRules.length === 44`, with all six of the file's keyframes
nested under it.

```
top: 1
mediaCondition: "(min-width: 1024px) and (hover: hover) and (pointer: fine)"
inner: 44
keyframes: fa-boot-horizon, fa-hero-lift, fa-hero-glint, fa-turn-in, fa-step-pulse, fa-seat-in
```

The scan must descend into any rule that has `cssRules`, and treat
`CSSKeyframesRule` as the leaf that holds frames. Both branches are needed:
`frame.style` only exists on frames.

### 9.2 A pseudo-element's animation is invisible to `getComputedStyle(el)`

An animation declared on `::before` or `::after` is reported by
`getComputedStyle(el, '::before')` and **not** by `getComputedStyle(el)`. The
probe scanned only the bare element.

Measured on a page with a conversation open:

```
viaElement: []          // scanning getComputedStyle(el).animationName
viaPseudo: 3            // scanning getComputedStyle(el, '::before' | '::after')
```

Five of this layer's effects live entirely on pseudo-elements — the step pulse,
the hero glint, the sidebar rail glow, the water shimmer, the scroll-edge masks
— so an element-only scan skips all of them and the property check passes over
an empty set. Counting rose from 47 animations to 58 once the scan covered
pseudo-elements.

### 9.3 The page was in a state where the effects did not exist

`effects-perf.mjs` measured the **hero** only. The turn entrance, the composer
seat entrance, the step pulse and the scroll-edge masks all require a
transcript. A probe that asserts something about animations has to first put the
page in a state where those animations exist; otherwise the assertion is
vacuously true and says nothing.

The fix is an `openSession()` before measuring. It is not a convenience — it is a
precondition.

### The consequence, stated plainly

With all three fixed, the same injected defect now fails as it should:

```
FAIL  every animation touches a compositable property — fa-step-pulse:background-position
```

The lesson generalises past this probe: **a green light is only evidence if you
have seen it go red.** Where a red-proof is hard to produce, suspect the probe
before concluding the code is sound.

## 10. Long tasks belong to the product, not to the effects layer

The per-tier probe originally asserted a ceiling on `longtask` entries during the
boot window. That check was measuring somebody else's code:

| session | long tasks (>50ms) in a 7s window |
| --- | --- |
| plugin disabled (tier `off`) | 3, 2, 3 |
| tier left to the governor | 3, 2, 3 |
| injected tier `full` | 3, 2, 3 |

`off` renders no scene at all and still reports the same tasks, so the count is
the host's own startup. It is now used for **attribution** — `full` must not add
stalls over the `off` control, with slack — which is a claim the effects layer
can actually be held to.

The same principle applies to console errors: the harness answers
`/open-in-app/icon/filemanager` with 404 on a fresh profile, on every tier. The
console message does not name the URL, so the response event is what decides
whether a failure is this plugin's. Known product 404s are reported in a `note`
line; every other console error still fails the run.

## 11. Composed, not replaced: `animation-composition`

`effects.css` lifts the composer card 1px on `[data-composer-card]:focus-within`.
`showcase.css` breathes the same card in the hero phase. Both write `transform`.

An animation at the **animation origin** beats a normal declaration regardless of
specificity or sheet order, so the breathing *replaced* the focus lift rather
than adding to it. The card still had a transform and still moved, which is why
it was easy to miss — it measured `matrix(1, 0, 0, 1, 0, -0.53)` where the lift
alone is `-1`.

The first fix was `animation-composition: add`, which is what the effect always
meant: the breathing is a delta on the existing cascade value. The rendered
transform went from `-0.53px` to `-1.29px`.

**That reading was wrong, and wrong in a way that looked like success.** `add`
merges two *translations* into a single matrix rather than nesting them: the
lift's `translate3d(0, -1px, 0)` plus a breathing `translate3d(0, -0.5%, 0)`
produces `matrix(1, 0, 0, 1, 0, -1)` and no scale term at all. So the breathing
contributed translation and silently dropped the `scaleY(0.99)` — the very thing
the focus lift exists to show. `-1.29px` was not a working composition; it was
the merged translation overshooting past the lift.

The rule this exposes:

> `add` composes **the property**, not the two values. Two `translate3d`s are one
> property with two contributions and they add; a `translate3d` and a `scale` are
> two different properties and they multiply into the final matrix independently.

So the breathing moved to `scale`, which sits outside the `transform` list and
therefore survives the merge:

```css
@keyframes fa-hero-lift {
  0%, 100% { scale: 1 1 1; }
  50%      { scale: 1 0.99 1; }
}
```

Measured at the full tier with the card focused, pinning the 7.4s loop:

| phase | `transform` | `scale` |
| --- | --- | --- |
| 0 | `matrix(1, 0, 0, 1, 0, -1)` | `1` |
| 0.25 | `matrix(1, 0, 0, 1, 0, -1)` | `1 0.995` |
| 0.5 | `matrix(1, 0, 0, 1, 0, -1)` | `1 0.99` |
| 0.75 | `matrix(1, 0, 0, 1, 0, -1)` | `1 0.995` |

The lift holds a clean `-1px` at every phase and the breathing is entirely in
`scale` — two independent writers, neither eating the other. `composercheck.mjs`
asserts all three facts (lift present, breathing live on `scale`, both at once)
precisely because the old assertions could not tell this state from the broken
one.

Note that `add` is the default for transform *lists* in the Web Animations API
but not for `@keyframes`, which is why it has to be stated.

`animation-composition` is **only** used here and on the hero lift. Introducing
it elsewhere means a second writer shares the property, and that should be
verified rather than assumed — and when it is used, the second writer should
touch a *different* property from the first.
