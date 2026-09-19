/**
 * The scene behind the glass.
 *
 * Frutiger Aero is a wallpaper-led aesthetic: the interface is a pane you look
 * *through*, so the reskin needs something worth looking at behind it. This
 * module builds that in one detached subtree, and it is the only place in the
 * plugin that creates more than a handful of nodes.
 *
 * Three constraints shape it:
 *
 * 1. **No per-frame JavaScript.** Every moving part is a CSS animation on
 *    `transform`/`opacity` only, so the compositor owns it and the main thread
 *    never wakes up for the wallpaper. There is no rAF loop anywhere in this
 *    plugin.
 * 2. **Composited, not painted.** The scene is `position: fixed` with
 *    `contain: strict`, so it is never part of the app's layout or paint
 *    invalidation. Nothing it does can cause a reflow of the conversation.
 * 3. **Deterministic.** Bubble placement comes from a seeded generator rather
 *    than `Math.random()`, so the wallpaper is a designed composition that is
 *    identical on every load and in every screenshot, instead of a different
 *    scatter each time.
 */

/** Mulberry32: tiny, fast, and stable across engines for a given seed. */
function seededRandom(seed) {
  let state = seed >>> 0
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Build one bubble.
 *
 * Size, drift, sway and duration are all read by CSS from custom properties,
 * which keeps the keyframes shared by every bubble — one animation definition
 * instead of one per element, and therefore one composited layer set the whole
 * time the wallpaper is alive.
 *
 * @param random - seeded generator.
 * @param index - bubble ordinal, used only to vary the deterministic seed.
 * @returns the bubble element.
 */
function bubble(random, index) {
  const el = document.createElement('i')
  el.className = 'fa-scene__bubble'
  const size = 10 + Math.round(random() * 74)
  const style = el.style
  style.setProperty('--fa-x', `${(random() * 104 - 2).toFixed(2)}%`)
  style.setProperty('--fa-size', `${String(size)}px`)
  style.setProperty('--fa-drift', `${(random() * 16 - 8).toFixed(2)}vw`)
  style.setProperty('--fa-lift', `${(random() * 22 - 6).toFixed(2)}vh`)
  style.setProperty('--fa-duration', `${(16 + random() * 26).toFixed(2)}s`)
  style.setProperty('--fa-delay', `${(-random() * 34).toFixed(2)}s`)
  style.setProperty('--fa-opacity', (0.28 + random() * 0.5).toFixed(3))
  style.setProperty('--fa-wobble', (0.55 + random() * 0.9).toFixed(3))
  el.dataset.faBubble = String(index)
  return el
}

/**
 * Build the whole wallpaper.
 *
 * Layer order is depth order, back to front: sky, sun, haze, light shafts,
 * two hill ridges, water, caustics, bubbles, veil. The veil is last on purpose
 * — it is the layer that guarantees text contrast over whatever is beneath it,
 * and it must not be able to be overdrawn by a bubble.
 *
 * @param count - bubble count for the active performance tier.
 * @returns the scene root, ready to append.
 */
function createScenery(count) {
  const root = document.createElement('div')
  root.className = 'fa-scene'
  root.dataset.faScene = ''
  root.setAttribute('aria-hidden', 'true')

  const layers = [
    'sky',
    'sun',
    'haze',
    'rays',
    'hills far',
    'hills near',
    'water',
    'caustics',
  ]
  for (const layer of layers) {
    const el = document.createElement('div')
    el.className = `fa-scene__layer fa-scene__${layer.split(' ').join(' fa-scene__')}`
    root.append(el)
  }

  const bubbles = document.createElement('div')
  bubbles.className = 'fa-scene__layer fa-scene__bubbles'
  const random = seededRandom(0x5eeda3a0)
  for (let index = 0; index < count; index += 1) bubbles.append(bubble(random, index))
  root.append(bubbles)

  const veil = document.createElement('div')
  veil.className = 'fa-scene__layer fa-scene__veil'
  root.append(veil)

  return root
}
