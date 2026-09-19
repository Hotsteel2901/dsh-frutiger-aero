/**
 * dsh-frutiger-aero — browser half.
 *
 * ## What this plugin is allowed to do
 *
 * It paints. It never state-manages the application, never wraps a component,
 * never replaces a handler and never requires another client package. Every
 * hook it installs is either a stylesheet, a node it owns, a passive listener,
 * or an attribute it sets on a node the app owns — and every one of those is
 * released through `ctx.effect`, so disabling the row in `cordis.patch.yml`
 * returns the page to stock. That restraint is what makes a reskin this total
 * safe to ship: if any part of it fails, the app underneath is untouched.
 *
 * ## The four layers
 *
 * 1. **Tokens** — the palette from `./palette.js`, written twice: as an
 *    `!important` stylesheet keyed on `body[data-ds-dark-theme]` so it wins
 *    against the inline custom properties the layout writes, and through
 *    `theme.overrideTokens` when the theme service exists so the runtime
 *    snapshot and the browser chrome stay coherent.
 * 2. **Scene** — the wallpaper, built once, fixed, `contain: strict`, animated
 *    purely by the compositor.
 * 3. **Material** — the glass itself, keyed on the app's own stable `data-*`
 *    vocabulary (`data-rightbar-col`, `data-shell-overlay`, `data-composer-*`,
 *    `data-conversation-scroll`, …) rather than on hashed CSS-module class
 *    names, which are an implementation detail that changes between builds.
 * 4. **Interaction** — the mobile layer: a phone layout that stops the sidebar
 *    from crushing the conversation, edge-swipe gestures, a keyboard-aware
 *    composer, haptics and press feedback.
 *
 * ## Performance
 *
 * Adding animation to an application you do not own is only responsible if the
 * cost is bounded, so the plugin runs a tier governor. It classifies the device
 * once from cheap static signals, samples real frame pacing for ~1s after boot,
 * and *downgrades once* if the samples disagree with the classification. The
 * tier selects a stylesheet variant (`fa-tier-lite` / `fa-tier-off`), gates
 * `backdrop-filter` (the one genuinely expensive property in the whole
 * design — and the one that would otherwise be re-run every frame while the
 * wallpaper moves behind it) and sizes the bubble population.
 */

/**
 * Stylesheet ids, in cascade order.
 *
 * `tokens` is generated from the palette at runtime; the rest are inlined at
 * build time by `build.mjs`. Keeping the wallpaper *below* the material in the
 * cascade is what lets the material assume a scene exists, and putting mobile
 * after material is what lets a phone reflow a desktop rule without needing a
 * more specific selector.
 */
const FA_SHEET_ORDER = ['base', 'scenery', 'material', 'mobile', 'effects']

/** Preference keys, deliberately namespaced so nothing else can collide. */
const FA_STORE_KEY = 'frutiger-aero:effects'
const FA_SCENE_KEY = 'frutiger-aero:scene'

/** Bubbles per tier — the only population that scales with device class. */
const FA_BUBBLES = { full: 22, lite: 10, off: 0 }

/** `exports.inject` — the plugin needs no service, so it activates immediately. */
const inject = []

/**
 * Read a stored preference, tolerating a storage that throws.
 *
 * `localStorage` access throws in a partitioned iframe and in some private
 * modes; a skin must never be the reason a page fails to boot, so every read
 * and write is guarded and simply yields the default.
 *
 * @param key - storage key.
 * @returns the stored string, or undefined.
 */
function readPreference(key) {
  try {
    return window.localStorage.getItem(key) ?? undefined
  } catch {
    return undefined
  }
}

/**
 * Persist a preference under the same guard.
 * @param key - storage key.
 * @param value - value to store.
 */
function writePreference(key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* a read-only storage is not a reason to lose the skin */
  }
}

/** Read a `?frutiger=` style query parameter without touching history. */
function queryPreference(name) {
  try {
    return new URLSearchParams(window.location.search).get(name) ?? undefined
  } catch {
    return undefined
  }
}

/**
 * An explicit tier request, or undefined.
 *
 * Honoured from `?frutiger=off|lite|full` first and `localStorage` second, so a
 * URL always wins over a stored preference and a stored preference always wins
 * over detection. An explicit request also disables the frame governor: a user
 * who asked for `full` asked for `full`.
 *
 * @returns the requested tier, or undefined when the device decides.
 */
function tierOverride() {
  const requested = queryPreference('frutiger') ?? readPreference(FA_STORE_KEY)
  return requested === 'off' || requested === 'lite' || requested === 'full' ? requested : undefined
}

/**
 * Classify the device from signals that cost nothing to read.
 *
 * The bias is deliberate: a wrong "lite" costs a little polish, a wrong "full"
 * costs the user their scroll smoothness. Anything with a coarse pointer is
 * treated as lite unless it also reports enough cores and memory to be
 * plausibly a tablet or a desktop-class touch screen.
 *
 * @returns `'full'`, `'lite'` or `'off'`.
 */
function classifyTier() {
  const override = tierOverride()
  if (override !== undefined) return override

  if (typeof window.matchMedia === 'function') {
    // `reduce` is a statement about *movement*, not about colour. The wallpaper
    // therefore stays — scenery.css freezes it under the same query — while the
    // expensive tier drops. Mapping it to `off` would take the theme away from
    // exactly the users who asked for the least, and only the explicit
    // `?frutiger=off` is allowed to mean "no decoration at all".
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'lite'
    const connection = navigator.connection
    if (connection !== undefined && connection.saveData === true) return 'lite'
  }

  const cores = typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : 4
  const memory = typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : 4
  const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
  const small = Math.min(window.innerWidth, window.innerHeight) <= 820

  if (coarse && (small || cores <= 4 || memory <= 3)) return 'lite'
  if (cores <= 2 || memory <= 2) return 'lite'
  return 'full'
}

/** Install one stylesheet owned by this plugin, released with the fiber. */
function installSheet(ctx, id, css) {
  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.dataset.plugin = 'dsh-frutiger-aero'
    tag.dataset.pluginCss = `dsh-frutiger-aero/${id}`
    tag.textContent = css
    document.head.append(tag)
    return () => {
      tag.remove()
    }
  }, `frutiger-aero: ${id} stylesheet`)
}

/**
 * The generated palette sheet.
 *
 * Three blocks, and the first is the one that is easy to forget: custom
 * properties set on `<body>` do not reach `<html>`, so the page's own backdrop
 * colour needs its own `:root` declaration — and `:root` cannot see the
 * presenter's `data-ds-dark-theme` attribute without `:has()`. Without it the
 * dark scheme would flash a bright sky behind the scene on every load.
 *
 * The two `body` blocks are written with `!important` because the presenter
 * writes the active theme's tokens as *inline* custom properties on `<body>`;
 * an author `!important` declaration is the only thing in the cascade that
 * outranks an inline one.
 *
 * @returns the stylesheet text.
 */
function tokenSheet() {
  return [
    '/* Frutiger Aero — generated from src/client/palette.js. */',
    `:root {\n  --fa-root-bg: ${SCHEMES.light.scene['--fa-sky-low']};\n}`,
    `:root:has(body[data-ds-dark-theme]) {\n  --fa-root-bg: ${SCHEMES.dark.scene['--fa-sky-top']};\n}`,
    `body {\n${declarations('light')}\n}`,
    `body[data-ds-dark-theme] {\n${declarations('dark')}\n}`,
  ].join('\n')
}

/**
 * Offer the same palette to the theme service.
 *
 * The stylesheet above already guarantees the pixels. This second write is not
 * redundant: the theme snapshot drives the `theme-color` metadata, the
 * Appearance row's preview cubes and `Theme.exportInspectTokens`, and leaving
 * those on the stock palette would make the UI describe a theme it is not
 * painting. It is optional by design — `ctx.inject` waits for the service, and
 * if the theme plugin is not composed at all the callback simply never runs.
 *
 * @param ctx - client cordis context.
 */
function installPaletteService(ctx) {
  const applyOverrides = (scope) => {
    const theme = scope.get('theme')
    if (theme === undefined || typeof theme.overrideTokens !== 'function') return
    const tokens = {
      ...pairGroup('ramp'),
      ...pairGroup('alias'),
      ...pairGroup('scene'),
      ...pairGroup('material'),
    }
    scope.effect(() => theme.overrideTokens('dsh-frutiger-aero', tokens), 'frutiger-aero: palette override layer')
  }
  if (ctx.get('theme') !== undefined) applyOverrides(ctx)
  else ctx.inject(['theme'], applyOverrides)
}

/**
 * Tag the app's structural nodes with the plugin's own attributes.
 *
 * The browser surface has no stable class names — CSS modules hash them per
 * build — but it does have a deliberate, semantic `data-*` vocabulary, and the
 * frame is exactly the parent of `[data-rightbar-col]`. Anchoring on that
 * gives the material layer real selectors instead of heuristics, and keeps the
 * plugin working across product upgrades as long as the product keeps the
 * attributes its own CSS already depends on.
 *
 * The tagger is rAF-coalesced and driven by a `MutationObserver` on `childList`
 * only: it never watches attributes (so its own attribute writes cannot feed
 * back into it) and it only inspects the handful of structural nodes, never the
 * message list.
 *
 * @param ctx - client cordis context.
 * @returns the current structural handles, re-resolved on every tag pass.
 */
function installTagger(ctx) {
  const state = { frame: null, sidebar: null, center: null, rightbar: null, overlay: null, canvas: null }

  const tag = () => {
    const rightbar = document.querySelector('[data-rightbar-col]')
    const frame = rightbar === null ? null : rightbar.parentElement
    if (frame === null) return

    const children = [...frame.children]
    const overlay = frame.querySelector(':scope > [data-shell-overlay]')
    const beforeOverlay = overlay === null ? children : children.slice(0, children.indexOf(overlay))

    state.frame = frame
    state.rightbar = rightbar
    state.overlay = overlay
    state.sidebar = beforeOverlay[0] ?? null
    state.center = beforeOverlay[1] ?? null

    frame.setAttribute('data-fa-frame', '')
    if (state.sidebar !== null) state.sidebar.setAttribute('data-fa-col', 'sidebar')
    if (state.center !== null) state.center.setAttribute('data-fa-col', 'center')
    rightbar.setAttribute('data-fa-col', 'rightbar')

    // The conversation canvas is whichever ancestor of the transcript actually
    // paints a background. Finding it by computed style rather than by class
    // means the plugin keeps neutralising the right node even if the component
    // tree between the frame and the transcript is reorganised.
    const scroll = document.querySelector('[data-conversation-scroll]')
    let canvas = scroll
    while (canvas !== null && canvas !== frame) {
      const background = window.getComputedStyle(canvas).backgroundColor
      if (background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent') break
      canvas = canvas.parentElement
    }
    if (canvas !== null && canvas !== frame && canvas !== state.canvas) {
      if (state.canvas !== null) state.canvas.removeAttribute('data-fa-canvas')
      state.canvas = canvas
      canvas.setAttribute('data-fa-canvas', '')
    }

    syncDrawer(state)
  }

  let queued = false
  const schedule = () => {
    if (queued) return
    queued = true
    requestAnimationFrame(() => {
      queued = false
      try {
        tag()
      } catch (error) {
        ctx.logger?.warn?.(error)
      }
    })
  }

  ctx.effect(() => {
    // Structure (columns appearing/disappearing) and the three presentation
    // attributes the frame flips while it animates. The filter matters: this
    // observer watches *attributes*, and the tagger writes attributes, so it
    // must never be able to observe its own writes.
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-sidebar-collapsed', 'data-rightbar-collapsed', 'data-rightbar-fullscreen'],
    })
    schedule()
    return () => {
      observer.disconnect()
    }
  }, 'frutiger-aero: structural tagger')

  // Wide-to-narrow resizes change which columns exist; re-tag on the settled
  // size rather than on every resize event.
  ctx.effect(() => {
    let timer
    const onResize = () => {
      clearTimeout(timer)
      timer = setTimeout(schedule, 180)
    }
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, 'frutiger-aero: resize retag')

  return { state, schedule }
}

/**
 * Publish the drawer state the mobile layout needs.
 *
 * A narrow viewport turns the sidebar into an overlay drawer; the rest of the
 * page (scrim, scroll lock, dock state) needs to know whether it is open, and
 * the app expresses that only as the *absence* of `data-sidebar-collapsed` —
 * which is also absent on a wide viewport, where no drawer exists. This
 * resolves that into one explicit attribute.
 *
 * @param state - structural handles from {@link installTagger}.
 */
function syncDrawer(state) {
  const frame = state.frame
  if (frame === null) return
  const narrow = window.innerWidth < 1024
  const expanded = !frame.hasAttribute('data-sidebar-collapsed')
  const open = narrow && expanded
  document.body.toggleAttribute('data-fa-drawer', open)
  if (open) document.body.setAttribute('data-fa-drawer', 'open')
}

/**
 * The mobile interaction layer.
 *
 * Every behaviour here is something a phone user already expects and that the
 * desktop-first layout does not provide: a drawer that slides rather than
 * squeezes, an edge swipe to open and close it, a scrim that dismisses it, a
 * composer that stays above the software keyboard, and press feedback that
 * confirms a tap landed. All of it is progressive — with touch absent, the
 * listeners are never installed.
 *
 * The layout half of this (the off-canvas rail, the bottom dock, safe-area
 * padding) is *not* tier-gated: it is usability, not decoration, and a user who
 * asked for reduced motion still deserves a phone layout that fits a thumb.
 * Only the transitions are removed, and CSS does that under the same media
 * query.
 *
 * @param ctx - client cordis context.
 * @param state - structural handles from {@link installTagger}.
 */
function installMobileLayer(ctx, state) {
  const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches

  /** Fire-and-forget haptics. iOS Safari has no `vibrate`, and that is fine. */
  const buzz = (pattern) => {
    try {
      navigator.vibrate?.(pattern)
    } catch {
      /* a browser that refuses to vibrate is not an error */
    }
  }

  // ── the scrim ──────────────────────────────────────────────────────────
  // Owned by the plugin, appended to the frame so it stacks with the columns.
  const scrim = document.createElement('div')
  scrim.className = 'fa-scrim'
  scrim.dataset.faScrim = ''
  scrim.setAttribute('aria-hidden', 'true')
  ctx.effect(() => {
    const host = state.frame ?? document.body
    host.append(scrim)
    return () => {
      scrim.remove()
    }
  }, 'frutiger-aero: drawer scrim')

  /** Ask the app itself to collapse the sidebar, so its own state stays the source of truth. */
  const closeDrawer = () => {
    const control = document.querySelector('button[aria-label="Collapse sidebar"], [aria-label="Collapse sidebar"]')
    if (control instanceof HTMLElement) control.click()
  }
  /** The rail's open control is off-canvas on a phone, but still a live button. */
  const openDrawer = () => {
    const control = document.querySelector('[aria-label="Open sidebar"]')
    if (control instanceof HTMLElement) control.click()
  }

  ctx.effect(() => {
    const onScrimPointer = (event) => {
      event.preventDefault()
      buzz(8)
      closeDrawer()
    }
    scrim.addEventListener('pointerdown', onScrimPointer)
    return () => {
      scrim.removeEventListener('pointerdown', onScrimPointer)
    }
  }, 'frutiger-aero: scrim dismissal')

  // ── edge-swipe gestures ────────────────────────────────────────────────
  // A swipe that starts at the left edge opens the drawer; a swipe left on an
  // open drawer closes it. Deliberately narrow (26px) and vertical-tolerant so
  // it cannot steal a horizontal scroll or a long-press inside content.
  // Touch-only: a mouse drag near the edge is a text selection, not a gesture.
  if (coarse) ctx.effect(() => {
    const EDGE = 26
    const MIN_DISTANCE = 46
    let tracking = false
    let startX = 0
    let startY = 0
    let pointerId = -1

    const onDown = (event) => {
      if (event.pointerType === 'mouse' || !event.isPrimary) return
      const open = document.body.hasAttribute('data-fa-drawer')
      const fromEdge = event.clientX <= EDGE
      if (!open && !fromEdge) return
      if (open && event.clientX > Math.min(window.innerWidth * 0.86, 340)) return
      tracking = true
      pointerId = event.pointerId
      startX = event.clientX
      startY = event.clientY
    }

    const onMove = (event) => {
      if (!tracking || event.pointerId !== pointerId) return
      const dx = event.clientX - startX
      const dy = event.clientY - startY
      // Vertical intent wins: hand the gesture back to the scroller.
      if (Math.abs(dy) > Math.abs(dx) + 16) tracking = false
    }

    const onUp = (event) => {
      if (!tracking || event.pointerId !== pointerId) return
      tracking = false
      const dx = event.clientX - startX
      const open = document.body.hasAttribute('data-fa-drawer')
      if (open && dx < -MIN_DISTANCE) {
        buzz(8)
        closeDrawer()
      } else if (!open && dx > MIN_DISTANCE) {
        buzz(8)
        openDrawer()
      }
    }

    const options = { passive: true }
    document.addEventListener('pointerdown', onDown, options)
    document.addEventListener('pointermove', onMove, options)
    document.addEventListener('pointerup', onUp, options)
    document.addEventListener('pointercancel', onUp, options)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointercancel', onUp)
    }
  }, 'frutiger-aero: drawer gestures')

  // ── the keyboard-aware composer ────────────────────────────────────────
  // iOS and Android report the software keyboard only through `visualViewport`.
  // Publishing its height as a custom property lets CSS lift the composer by
  // exactly the occluded amount instead of guessing with `dvh` alone.
  ctx.effect(() => {
    const viewport = window.visualViewport
    if (viewport === undefined || viewport === null) return undefined
    let frame = 0
    const sync = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const occluded = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
        document.documentElement.style.setProperty('--fa-keyboard', `${Math.round(occluded)}px`)
        document.body.toggleAttribute('data-fa-keyboard', occluded > 90)
      })
    }
    viewport.addEventListener('resize', sync)
    viewport.addEventListener('scroll', sync)
    sync()
    return () => {
      cancelAnimationFrame(frame)
      viewport.removeEventListener('resize', sync)
      viewport.removeEventListener('scroll', sync)
      document.documentElement.style.removeProperty('--fa-keyboard')
      document.body.removeAttribute('data-fa-keyboard')
    }
  }, 'frutiger-aero: keyboard inset')

  // ── press feedback ─────────────────────────────────────────────────────
  // One delegated listener over the whole document rather than a listener per
  // control: `:active` cannot be relied on for touch in every engine, and a
  // light haptic is the cheapest way to make a tap feel acknowledged.
  ctx.effect(() => {
    const HAPTIC = 'button, [role="button"], [role="tab"], [role="menuitem"], summary'
    const onDown = (event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest(HAPTIC) === null) return
      buzz(6)
    }
    document.addEventListener('pointerdown', onDown, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', onDown)
    }
  }, 'frutiger-aero: tap haptics')
}

/**
 * The phone dock.
 *
 * Below 640px the stock layout spends 56px of a 390px viewport on an icon rail
 * and leaves the conversation 334px. That is the one place where a reskin can
 * make a real usability difference rather than a cosmetic one, so the rail
 * moves off-canvas (see `mobile.css`) and the primary navigation moves to a
 * floating bottom dock — the pattern a phone user's thumb already knows.
 *
 * The dock does not reimplement anything: each button locates the app's own
 * control by its accessible name and clicks it, so session creation, search and
 * settings stay owned by the product. A button whose control is absent simply
 * does not render, which keeps the dock honest across product changes.
 *
 * @param ctx - client cordis context.
 */
function installDock(ctx) {
  const dock = document.createElement('nav')
  dock.className = 'fa-dock'
  dock.dataset.faDock = ''
  dock.setAttribute('aria-label', 'Primary navigation')

  const entries = [
    { id: 'menu', label: 'Menu', icon: 'menu', target: ':drawer', action: 'toggle' },
    { id: 'new', label: 'New session', icon: 'new', target: '[aria-label="New session"]', action: 'click' },
    { id: 'search', label: 'Search sessions', icon: 'search', target: '[aria-label="Search sessions"]', action: 'click' },
    { id: 'library', label: 'Workspaces', icon: 'library', target: '[aria-label="Add workspace"]', action: 'click' },
    { id: 'settings', label: 'Settings', icon: 'settings', target: '[aria-label="Settings"]', action: 'click' },
  ]

  const buttons = entries.map((entry) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'fa-dock__button'
    button.dataset.faDockAction = entry.id
    button.setAttribute('aria-label', entry.label)
    button.innerHTML = `<span class="fa-dock__glyph fa-dock__glyph--${entry.icon}" aria-hidden="true"></span>`
    button.addEventListener('click', () => {
      if (entry.action === 'toggle') {
        const frame = document.querySelector('[data-fa-frame]')
        const open = frame !== null && !frame.hasAttribute('data-sidebar-collapsed')
        const control = document.querySelector(open ? '[aria-label="Collapse sidebar"]' : '[aria-label="Open sidebar"]')
        if (control instanceof HTMLElement) control.click()
        return
      }
      const control = document.querySelector(entry.target)
      if (control instanceof HTMLElement) control.click()
    })
    return [entry, button]
  })

  ctx.effect(() => {
    for (const [, button] of buttons) dock.append(button)
    document.body.append(dock)
    return () => {
      dock.remove()
    }
  }, 'frutiger-aero: phone dock')

  // The dock reflects the drawer being open, and hides any button whose control
  // the product did not render.
  ctx.effect(() => {
    const sync = () => {
      const frame = document.querySelector('[data-fa-frame]')
      const open = frame !== null && !frame.hasAttribute('data-sidebar-collapsed')
      dock.toggleAttribute('data-fa-dock-open', open)
      for (const [entry, button] of buttons) {
        const present = entry.action === 'toggle' || document.querySelector(entry.target) !== null
        button.toggleAttribute('hidden', !present)
      }
    }
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-sidebar-collapsed'] })
    sync()
    return () => {
      observer.disconnect()
    }
  }, 'frutiger-aero: dock state')
}

/**
 * Pause the wallpaper when nobody is looking at it.
 *
 * A background tab keeps compositing its animations in some engines; a skin
 * that quietly drains a battery is a worse trade than a still wallpaper.
 *
 * @param ctx - client cordis context.
 */
function installIdleGovernor(ctx) {
  ctx.effect(() => {
    const sync = () => {
      document.body.toggleAttribute('data-fa-idle', document.hidden)
    }
    document.addEventListener('visibilitychange', sync)
    sync()
    return () => {
      document.removeEventListener('visibilitychange', sync)
      document.body.removeAttribute('data-fa-idle')
    }
  }, 'frutiger-aero: idle governor')
}

/**
 * Sample real frame pacing once and downgrade if the classification was wrong.
 *
 * Sixty frames is enough to separate a smooth 60Hz device from one that is
 * struggling, costs about a second of an empty callback, and runs exactly once
 * per page — after which the plugin's runtime cost is zero regardless of tier.
 * The governor only ever moves *down*: a device that recovers should not
 * oscillate between looking rich and looking plain.
 *
 * @param ctx - client cordis context.
 * @param tier - the tier chosen at boot.
 * @param apply - called with a lower tier when the sample disagrees.
 */
function installFrameGovernor(ctx, tier, apply) {
  // Never argue with an explicit request.
  if (tier !== 'full' || tierOverride() !== undefined) return
  ctx.effect(() => {
    let frames = 0
    let start = 0
    let handle = 0
    let done = false
    const step = (now) => {
      if (done) return
      if (frames === 0) start = now
      frames += 1
      if (frames >= 75) {
        done = true
        const average = (now - start) / frames
        // 20ms/frame ≈ 50fps. Anything slower than that while merely booting is
        // a device that will not enjoy a full-screen animated wallpaper.
        if (average > 20) apply('lite')
        return
      }
      handle = requestAnimationFrame(step)
    }
    handle = requestAnimationFrame(step)
    return () => {
      done = true
      cancelAnimationFrame(handle)
    }
  }, 'frutiger-aero: frame governor')
}

/**
 * Publish a small control surface on `window.__FRUTIGER__`.
 *
 * Documented escape hatch for tuning without a rebuild, and the hook the
 * browser-side verification harness drives. It is removed with the fiber, so it
 * cannot outlive a disabled plugin.
 *
 * @param ctx - client cordis context.
 * @param api - the functions to expose.
 */
function installControlSurface(ctx, api) {
  ctx.effect(() => {
    const previous = window.__FRUTIGER__
    window.__FRUTIGER__ = api
    return () => {
      if (window.__FRUTIGER__ === api) {
        if (previous === undefined) delete window.__FRUTIGER__
        else window.__FRUTIGER__ = previous
      }
    }
  }, 'frutiger-aero: control surface')
}

/**
 * Client plugin body.
 *
 * @param ctx - client cordis context.
 */
function apply(ctx) {
  const tier = classifyTier()

  // Tier classes go on the root element, not `<body>`: `<body>` carries the
  // app's own theme attribute and is rewritten by the presenter on every theme
  // change, so attributes there can be clobbered by React reconciliation.
  const root = document.documentElement
  for (const name of ['fa-tier-full', 'fa-tier-lite', 'fa-tier-off']) root.classList.remove(name)
  root.classList.add(`fa-tier-${tier}`)
  root.dataset.faTier = tier
  root.dataset.faPointer = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches ? 'coarse' : 'fine'
  ctx.effect(() => () => {
    for (const name of ['fa-tier-full', 'fa-tier-lite', 'fa-tier-off']) root.classList.remove(name)
    delete root.dataset.faTier
    delete root.dataset.faPointer
  }, 'frutiger-aero: tier attributes')

  // ── viewport and platform metadata ───────────────────────────────────────
  // `viewport-fit=cover` is what makes `env(safe-area-inset-*)` resolve to
  // anything other than zero, and the safe-area insets are what keep the dock
  // and the drawer off the home indicator. Maximum scale is deliberately left
  // alone: a reskin may not take pinch-zoom away from the user.
  ctx.effect(() => {
    const meta = document.querySelector('meta[name="viewport"]')
    if (meta === null) return undefined
    const previous = meta.getAttribute('content')
    meta.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover')
    return () => {
      if (previous === null) meta.removeAttribute('content')
      else meta.setAttribute('content', previous)
    }
  }, 'frutiger-aero: viewport fit')

  ctx.effect(() => {
    const added = []
    for (const [name, content] of [
      ['mobile-web-app-capable', 'yes'],
      ['apple-mobile-web-app-capable', 'yes'],
      ['apple-mobile-web-app-status-bar-style', 'black-translucent'],
      ['color-scheme', 'light dark'],
    ]) {
      const tag = document.createElement('meta')
      tag.name = name
      tag.content = content
      tag.dataset.faMeta = name
      document.head.append(tag)
      added.push(tag)
    }
    return () => {
      for (const tag of added) tag.remove()
    }
  }, 'frutiger-aero: platform metadata')

  // ── the skin ─────────────────────────────────────────────────────────────
  // `tokens` is generated; the rest arrive inlined from `src/css` in the order
  // build.mjs read them.
  installSheet(ctx, 'tokens', tokenSheet())
  for (const id of FA_SHEET_ORDER) {
    const css = FA_SHEETS[id]
    if (typeof css === 'string') installSheet(ctx, id, css)
  }
  installPaletteService(ctx)

  // ── the scene ────────────────────────────────────────────────────────────
  const sceneEnabled = queryPreference('scene') !== 'off' && readPreference(FA_SCENE_KEY) !== 'off'
  if (sceneEnabled && tier !== 'off') {
    ctx.effect(() => {
      const scene = createScenery(FA_BUBBLES[tier] ?? FA_BUBBLES.lite)
      document.body.append(scene)
      return () => {
        scene.remove()
      }
    }, 'frutiger-aero: wallpaper')
  }

  // ── structure and interaction ────────────────────────────────────────────
  const { state } = installTagger(ctx)
  installMobileLayer(ctx, state)
  installDock(ctx)
  installIdleGovernor(ctx)

  const rerender = () => {
    const next = classifyTier()
    const current = document.documentElement.dataset.faTier
    if (next === current) return
    for (const name of ['fa-tier-full', 'fa-tier-lite', 'fa-tier-off']) root.classList.remove(name)
    root.classList.add(`fa-tier-${next}`)
    root.dataset.faTier = next
  }

  installFrameGovernor(ctx, tier, (lowered) => {
    for (const name of ['fa-tier-full', 'fa-tier-lite', 'fa-tier-off']) root.classList.remove(name)
    root.classList.add(`fa-tier-${lowered}`)
    root.dataset.faTier = lowered
  })

  installControlSurface(ctx, {
    version: '1.0.0',
    tier: () => document.documentElement.dataset.faTier,
    setEffects(effects) {
      if (effects === 'off' || effects === 'lite' || effects === 'full') writePreference(FA_STORE_KEY, effects)
      else writePreference(FA_STORE_KEY, '')
      rerender()
      return document.documentElement.dataset.faTier
    },
    setScene(enabled) {
      writePreference(FA_SCENE_KEY, enabled === false ? 'off' : 'on')
      const existing = document.querySelector('[data-fa-scene]')
      if (enabled === false) existing?.remove()
      else if (existing === null && classifyTier() !== 'off') document.body.append(createScenery(FA_BUBBLES[classifyTier()] ?? FA_BUBBLES.lite))
      return enabled !== false
    },
    tag: () => {
      const frame = document.querySelector('[data-fa-frame]')
      return frame === null ? null : [...frame.children].map((child) => child.getAttribute('data-fa-col') ?? child.tagName)
    },
  })
}
