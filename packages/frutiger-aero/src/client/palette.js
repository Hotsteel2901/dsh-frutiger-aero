/**
 * The Frutiger Aero palette.
 *
 * Two things are being replaced, not one. The product's colour system is a
 * two-tier token graph: `--dsw-static-*` is the raw ramp, and `--dsw-alias-*`
 * is the semantic layer that points at it. Every surface, border and label in
 * the app resolves through the alias tier, so overriding the aliases retints
 * the entire product without a single component-level rule — and because the
 * alias values are what `ui-layout` writes onto `<body>` as inline custom
 * properties, this is also the only layer that composes cleanly with the
 * built-in light/dark switch instead of fighting it.
 *
 * The ramps below are shared by both schemes on purpose. The ramp is a single
 * monotonic ladder, and the two schemes read it from opposite ends: light
 * resolves `bg-base` from `-00` and `label-primary` from `-1000`, dark
 * resolves `bg-base` from `-950` and `label-primary` from `-50`. One careful
 * ladder therefore serves both without a second set of values to keep in sync.
 *
 * The scheme-specific half is {@link ALIASES}: translucency, glow and tint are
 * exactly where the two schemes must diverge, because Aero is a *light*
 * material (glass over bright sky) and its night counterpart is a *dark* one
 * (bioluminescence over deep water).
 */

/** Shared raw ramp: sky-tinted neutrals, Aero blues, aqua accent, nature semantics. */
const RAMP = {
  // Neutral ladder with a permanent sky cast. Light mode sits at the top of
  // it, dark mode at the bottom; nothing in between is ever pure grey.
  '--dsw-static-neutral-bluish-00': '#ffffff',
  '--dsw-static-neutral-bluish-50': '#f6fcff',
  '--dsw-static-neutral-bluish-60': '#eef9ff',
  '--dsw-static-neutral-bluish-75': '#e6f5fd',
  '--dsw-static-neutral-bluish-100': '#daedfa',
  '--dsw-static-neutral-bluish-150': '#cfe6f6',
  '--dsw-static-neutral-bluish-200': '#c2dcef',
  '--dsw-static-neutral-bluish-300': '#a6c8e0',
  '--dsw-static-neutral-bluish-400': '#7ba3c0',
  '--dsw-static-neutral-bluish-500': '#688ea9',
  '--dsw-static-neutral-bluish-600': '#4c7691',
  '--dsw-static-neutral-bluish-700': '#375f7c',
  '--dsw-static-neutral-bluish-750': '#2c526d',
  '--dsw-static-neutral-bluish-800': '#20425a',
  '--dsw-static-neutral-bluish-850': '#18364b',
  '--dsw-static-neutral-bluish-875': '#132c3e',
  '--dsw-static-neutral-bluish-900': '#0e2332',
  '--dsw-static-neutral-bluish-950': '#081722',
  '--dsw-static-neutral-bluish-1000': '#04121c',

  '--dsw-static-neutral-00': '#ffffff',
  '--dsw-static-neutral-50': '#f6fbfe',
  '--dsw-static-neutral-100': '#eef7fc',
  '--dsw-static-neutral-150': '#e5f2f9',
  '--dsw-static-neutral-200': '#d9eaf4',
  '--dsw-static-neutral-250': '#cfe3ef',
  '--dsw-static-neutral-300': '#c2d9e7',
  '--dsw-static-neutral-400': '#9db6c6',
  '--dsw-static-neutral-500': '#7e97a8',
  '--dsw-static-neutral-550': '#68808f',
  '--dsw-static-neutral-600': '#556d7c',
  '--dsw-static-neutral-700': '#3d5462',
  '--dsw-static-neutral-800': '#2a3f4c',
  '--dsw-static-neutral-850': '#213440',
  '--dsw-static-neutral-900': '#16262f',
  '--dsw-static-neutral-1000': '#000000',

  // Aero blue: the Vista/7 window-chrome blue, deepened for text contrast.
  '--dsw-static-blue-50': '#eaf8ff',
  '--dsw-static-blue-50p': '#e2f5ff',
  '--dsw-static-blue-75': '#d6efff',
  '--dsw-static-blue-100': '#c3e7fd',
  '--dsw-static-blue-300': '#7cc8ee',
  '--dsw-static-blue-400': '#4aace0',
  '--dsw-static-blue-450': '#2f9ed6',
  '--dsw-static-blue-500': '#1f8ec6',
  '--dsw-static-blue-600': '#1478ad',
  '--dsw-static-blue-800': '#0d5a86',
  '--dsw-static-blue-900': '#0a4666',
  '--dsw-static-blue-950': '#07364f',

  // Aqua accent: the accent ramp the product uses for `state-business` and
  // every "active/selected/link" affordance.
  '--dsw-static-deepseek-50': '#e9f9fe',
  '--dsw-static-deepseek-100': '#d3f2fd',
  '--dsw-static-deepseek-200': '#b3e8fb',
  '--dsw-static-deepseek-300': '#8adaf7',
  '--dsw-static-deepseek-400': '#46c2ee',
  '--dsw-static-deepseek-450': '#29b2e3',
  '--dsw-static-deepseek-500': '#129dd0',
  '--dsw-static-deepseek-600': '#0d84b2',
  '--dsw-static-deepseek-700-delete': '#0a6a91',
  '--dsw-static-deepseek-800': '#0a5573',
  '--dsw-static-deepseek-900': '#093f56',

  // Frutiger Aero's other half is nature: grass, sun, coral.
  '--dsw-static-green-100': '#e7f8e2',
  '--dsw-static-green-400': '#86cf63',
  '--dsw-static-green-500': '#57b23a',
  '--dsw-static-green-900': '#1e3a17',
  '--dsw-static-amber-100': '#fff5e0',
  '--dsw-static-amber-400': '#ffc75a',
  '--dsw-static-amber-500': '#f5a623',
  '--dsw-static-amber-600': '#b3720f',
  '--dsw-static-amber-900': '#2b2418',
  '--dsw-static-red-50': '#fff3f1',
  '--dsw-static-red-100': '#ffe2dd',
  '--dsw-static-red-400': '#ff8570',
  '--dsw-static-red-500': '#f4604a',
  '--dsw-static-red-600': '#d93f28',
  '--dsw-static-red-900': '#4a1710',
}

/** Aero Glass — daylight. Glass over bright sky: white pane, blue rim, deep-navy ink. */
const LIGHT_ANCHORS = {
  canvas: 'rgb(244 251 255 / 88%)',
  layer1: 'rgb(255 255 255 / 74%)',
  layer2: 'rgb(255 255 255 / 84%)',
  layer3: 'rgb(255 255 255 / 92%)',
  overlay: 'rgb(255 255 255 / 70%)',
  platform: 'rgb(226 244 254 / 78%)',
  ink: '#08283c',
  inkSoft: '#38617d',
  inkFaint: '#456f8c',
  caption: '#6b93ab',
  accent: '#129dd0',
  accentDeep: '#0d7cb4',
  accentPale: 'rgb(211 242 253 / 88%)',
  rail: 'rgb(255 255 255 / 44%)',
  slate: 'rgb(226 244 254 / 84%)',
  glass: 'rgb(255 255 255 / 78%)',
  rim: 'rgb(20 108 158 / 20%)',
  rimBright: 'rgb(255 255 255 / 68%)',
  shadow: 'rgb(10 70 105 / 12%)',
  shadowDeep: 'rgb(8 60 92 / 20%)',
  glow: 'rgb(120 200 240 / 18%)',
  tooltip: 'rgb(11 72 108 / 92%)',
  tooltipInk: '#eaf9ff',
  scrollThumb: 'rgb(19 145 207 / 30%)',
  scrollThumbHover: 'rgb(19 145 207 / 50%)',
  inverse: '#ffffff',
  masked: 'rgb(255 255 255 / 70%)',
}

/** Aero Night — the same material after dark: deep water, cyan bioluminescence. */
const DARK_ANCHORS = {
  canvas: 'rgb(7 32 46 / 90%)',
  layer1: 'rgb(13 44 62 / 76%)',
  layer2: 'rgb(17 53 73 / 84%)',
  layer3: 'rgb(21 62 84 / 92%)',
  overlay: 'rgb(9 36 52 / 74%)',
  platform: 'rgb(15 48 66 / 80%)',
  ink: '#e8f8ff',
  inkSoft: '#a8cee2',
  inkFaint: '#8fb8d0',
  caption: '#6e97b0',
  accent: '#4cc8ef',
  accentDeep: '#2aa6d4',
  accentPale: 'rgb(16 66 90 / 80%)',
  rail: 'rgb(10 36 52 / 62%)',
  slate: 'rgb(15 48 66 / 78%)',
  glass: 'rgb(14 46 64 / 80%)',
  rim: 'rgb(122 214 250 / 24%)',
  rimBright: 'rgb(180 236 255 / 26%)',
  shadow: 'rgb(0 8 14 / 34%)',
  shadowDeep: 'rgb(0 6 12 / 48%)',
  glow: 'rgb(70 200 245 / 16%)',
  tooltip: 'rgb(12 44 62 / 94%)',
  tooltipInk: '#eaf9ff',
  scrollThumb: 'rgb(122 214 250 / 28%)',
  scrollThumbHover: 'rgb(122 214 250 / 50%)',
  inverse: '#04121c',
  masked: 'rgb(9 36 52 / 74%)',
}

/**
 * Build the semantic alias layer from one scheme's anchors.
 *
 * Every alias the shipped `design-platform.css` declares is restated here, so
 * no alias can silently keep a neutral value and punch a grey hole through the
 * skin. Translucent values are expressed with `rgb(… / …)` rather than
 * `rgba()` because the alias values are also consumed by `color-mix()` and
 * modern relative-colour syntax elsewhere in the product.
 *
 * @param {typeof LIGHT_ANCHORS} a - one scheme's material anchors.
 * @returns alias-name → CSS value.
 */
function aliases(a) {
  return {
    // ── surfaces ──────────────────────────────────────────────────────────
    '--dsw-alias-bg-base': a.canvas,
    '--dsw-alias-bg-layer-1': a.layer1,
    '--dsw-alias-bg-layer-2': a.layer2,
    '--dsw-alias-bg-layer-3': a.layer3,
    '--dsw-alias-bg-overlay': a.overlay,
    '--dsw-alias-bg-module-platform': a.platform,
    '--dsw-alias-bg-multi-select': a.platform,
    '--dsw-alias-bg-skeleton': a.masked,
    '--dsw-alias-bg-mask-1': a.ink === '#08283c' ? 'rgb(8 40 60 / 22%)' : 'rgb(0 10 18 / 52%)',
    '--dsw-alias-bg-mask-2': a.ink === '#08283c' ? 'rgb(8 40 60 / 12%)' : 'rgb(0 10 18 / 34%)',
    '--dsw-alias-bg-mask-3': a.ink === '#08283c' ? 'rgb(4 24 38 / 48%)' : 'rgb(0 6 12 / 66%)',
    '--dsw-alias-bg-mask-photo': 'rgb(0 6 12 / 88%)',
    '--dsw-alias-bg-mask-drop': a.masked,

    // ── rims and hairlines ────────────────────────────────────────────────
    // Aero draws light *on* edges: the top rim is brighter than the surface,
    // which is why these are near-white in both schemes.
    '--dsw-alias-border-l1': a.rimBright,
    '--dsw-alias-border-l2': a.rim,
    '--dsw-alias-border-l2-darkmode-thin': a.rim,
    '--dsw-alias-border-l3': a.rim,
    '--dsw-alias-border-l4': a.rim,
    '--dsw-alias-border-inverted': 'rgb(255 255 255 / 0%)',
    '--dsw-alias-border-inverted2': 'rgb(255 255 255 / 0%)',

    // ── ink ───────────────────────────────────────────────────────────────
    '--dsw-alias-label-primary': a.ink,
    '--dsw-alias-label-primary-dimmed': a.ink,
    '--dsw-alias-label-primary-bluish': a.ink,
    '--dsw-alias-label-primary-foreground': a.inverse,
    '--dsw-alias-label-primary-inverted': a.inverse,
    '--dsw-alias-label-secondary': a.inkSoft,
    '--dsw-alias-label-tertiary': a.inkFaint,
    '--dsw-alias-label-caption': a.caption,
    '--dsw-alias-label-dimmed': a.caption,
    '--dsw-alias-link': a.accentDeep,
    '--dsw-alias-brand-text': a.ink,

    // ── brand and buttons ─────────────────────────────────────────────────
    '--dsw-alias-brand-primary': a.accentDeep,
    '--dsw-alias-brand-primary-invert': a.inverse,
    '--dsw-alias-brand-primary-new-colorprimary-new-color': a.accent,
    '--dsw-alias-button-primary-fill': a.accentDeep,
    '--dsw-alias-button-primary-hover': a.accent,
    '--dsw-alias-button-primary-dimmed': a.accentPale,
    '--dsw-alias-button-contrast-fill': a.ink,
    '--dsw-alias-button-elevated-fill': a.glass,
    '--dsw-alias-button-floating-fill': a.glass,
    '--dsw-alias-button-floating-hover': a.layer3,
    '--dsw-alias-button-ghost-active-border': a.accent,
    '--dsw-alias-button-ghost-active-fill': a.accentPale,
    '--dsw-alias-button-ghost-active-hover': a.accentPale,
    '--dsw-alias-button-info-fill': a.accent,
    '--dsw-alias-button-info-hover': a.accentDeep,
    '--dsw-alias-button-tool-bar-fill': a.glass,
    '--dsw-alias-button-tool-bar-fill-invisible': a.rail,
    '--dsw-alias-button-tool-bar-hover': a.layer3,

    // ── interaction washes ────────────────────────────────────────────────
    '--dsw-alias-interactive-bg-hover': a.ink === '#08283c' ? 'rgb(18 157 208 / 10%)' : 'rgb(76 200 239 / 14%)',
    '--dsw-alias-interactive-bg-hover-solid': a.platform,
    '--dsw-alias-interactive-bg-hover-accent': a.ink === '#08283c' ? 'rgb(18 157 208 / 18%)' : 'rgb(76 200 239 / 24%)',
    '--dsw-alias-interactive-bg-hover-danger': 'rgb(244 96 74 / 14%)',
    '--dsw-alias-interactive-bg-active': a.ink === '#08283c' ? 'rgb(18 157 208 / 22%)' : 'rgb(76 200 239 / 30%)',

    // ── markdown and code ─────────────────────────────────────────────────
    '--dsw-alias-markdown-citation': a.slate,
    '--dsw-alias-markdown-code-block': a.layer1,
    '--dsw-alias-markdown-code-block-banner': a.platform,
    '--dsw-alias-markdown-code-segment-selected': a.layer3,
    '--dsw-alias-markdown-code-segment-unselected': a.layer1,
    '--dsw-alias-markdown-inline-code': a.platform,
    '--dsw-alias-markdown-placeholder': a.slate,
    '--dsw-alias-markdown-tag': a.slate,

    // ── scrollbars ────────────────────────────────────────────────────────
    '--dsw-alias-scrollbar-bg-l1': a.scrollThumb,
    '--dsw-alias-scrollbar-bg-l2': a.scrollThumb,
    '--dsw-alias-scrollbar-hover-l1': a.scrollThumbHover,
    '--dsw-alias-scrollbar-hover-l2': a.scrollThumbHover,

    // ── state ─────────────────────────────────────────────────────────────
    '--dsw-alias-state-business-primary': a.accent,
    '--dsw-alias-state-business-tertiary': a.accentPale,
    '--dsw-alias-state-success-primary': '#57b23a',
    '--dsw-alias-state-success-secondary': '#86cf63',
    '--dsw-alias-state-success-tertiary': a.ink === '#08283c' ? 'rgb(231 248 226 / 90%)' : 'rgb(24 62 30 / 70%)',
    '--dsw-alias-state-warn-primary': '#f5a623',
    '--dsw-alias-state-warn-secondary': '#ffc75a',
    '--dsw-alias-state-warn-tertiary': a.ink === '#08283c' ? 'rgb(255 245 224 / 92%)' : 'rgb(62 46 16 / 70%)',
    '--dsw-alias-state-warn-label': '#b3720f',
    '--dsw-alias-state-error-primary': '#e04a32',
    '--dsw-alias-state-error-secondary': '#ff8570',

    // ── floating surfaces ─────────────────────────────────────────────────
    '--dsw-alias-toast-bg': a.tooltip,
    '--dsw-alias-tooltip-bg': a.tooltip,

    // ── feature-owned surfaces ────────────────────────────────────────────
    '--dsw-specific-bubble': a.layer1,
    '--dsw-specific-bubble-highlight': a.platform,
    '--dsw-specific-input-major': a.glass,
    '--dsw-specific-login-input': a.layer1,
    '--dsw-specific-menu': a.layer3,
    '--dsw-specific-selector': a.slate,
    '--dsw-specific-sidebar-fill': a.rail,
    '--dsw-specific-sidebar-nav-item-active': a.layer2,
    '--dsw-specific-sidebar-nav-item-active-accent': a.accentPale,
    '--dsw-specific-sidebar-nav-item-hover': a.layer1,
    '--dsw-specific-tip': a.glass,

    // ── gradients and elevation ───────────────────────────────────────────
    '--dsw-linear-gradient-think': `linear-gradient(180deg, ${a.layer1} 20%, rgb(255 255 255 / 0%) 100%)`,
    '--dsw-linear-think-select': `linear-gradient(180deg, ${a.platform} 20%, rgb(255 255 255 / 0%) 100%)`,
    '--dsw-shadow-lv1': `0 2px 6px ${a.shadow}`,
    '--dsw-shadow-lv1-blur': `0 6px 18px ${a.shadow}`,
    '--dsw-shadow-lv2': `0 6px 18px ${a.shadow}, 0 2px 8px ${a.shadow}`,
    '--dsw-shadow-lv3': `0 0 0 1px ${a.rimBright}, 0 4px 14px ${a.shadow}, 0 18px 46px ${a.shadowDeep}`,
    '--dsw-elevation-stroke-color': a.rim,
    '--dsw-elevation-panel': `0 0 0 .5px ${a.rimBright}, 0 3px 10px ${a.shadow}, 0 0 22px ${a.glow}`,
    '--dsw-elevation-prominent': `0 0 0 .5px ${a.rimBright}, 0 6px 18px ${a.shadow}, 0 0 30px ${a.glow}`,
    '--dsw-elevation-soft': `0 0 0 .5px ${a.rimBright}, 0 4px 16px ${a.shadow}, 0 0 26px ${a.glow}`,
    '--dsw-mask-blur': 'blur(10px)',
  }
}

/**
 * Scene anchors drive `src/css/scenery.css`. They are plain custom properties
 * rather than hard-coded gradient stops so one stylesheet paints both schemes:
 * the wallpaper is the same eight layers of sky, sun, hills, water and light,
 * re-tinted.
 */
const LIGHT_SCENE = {
  '--fa-sky-top': '#7fd0f0',
  '--fa-sky-mid': '#bfeaff',
  '--fa-sky-low': '#eefaff',
  '--fa-haze': 'rgb(255 255 255 / 92%)',
  '--fa-sun': 'rgb(255 251 214 / 92%)',
  '--fa-sun-glow': 'rgb(255 246 205 / 40%)',
  '--fa-hill-far': '#d3f0de',
  '--fa-hill-near': '#a8e2bd',
  '--fa-water-top': '#a6e4f4',
  '--fa-water-deep': '#6cc4e0',
  '--fa-caustic': 'rgb(255 255 255 / 46%)',
  '--fa-bubble': 'rgb(255 255 255 / 78%)',
  '--fa-bubble-core': 'rgb(255 255 255 / 96%)',
  '--fa-bubble-rim': 'rgb(126 210 246 / 62%)',
  '--fa-scene-veil': 'rgb(255 255 255 / 34%)',
  '--fa-scene-glow': 'rgb(180 232 255 / 40%)',
}

const DARK_SCENE = {
  '--fa-sky-top': '#03202f',
  '--fa-sky-mid': '#062c41',
  '--fa-sky-low': '#0a3d58',
  '--fa-haze': 'rgb(24 78 104 / 40%)',
  '--fa-sun': 'rgb(150 235 255 / 34%)',
  '--fa-sun-glow': 'rgb(64 190 235 / 24%)',
  '--fa-hill-far': '#0d3f36',
  '--fa-hill-near': '#082a26',
  '--fa-water-top': '#0d6f9e',
  '--fa-water-deep': '#021c2c',
  '--fa-caustic': 'rgb(130 226 255 / 22%)',
  '--fa-bubble': 'rgb(168 236 255 / 44%)',
  '--fa-bubble-core': 'rgb(214 246 255 / 62%)',
  '--fa-bubble-rim': 'rgb(112 214 250 / 52%)',
  '--fa-scene-veil': 'rgb(4 20 30 / 34%)',
  '--fa-scene-glow': 'rgb(48 170 220 / 26%)',
}

/**
 * Material anchors for the stylesheets: the handful of values the Aero
 * material system needs that are neither a product token nor a scene colour
 * (gloss stops, rim light, pane radius, blur radii).
 */
const LIGHT_MATERIAL = {
  '--fa-gloss-top': 'rgb(255 255 255 / 92%)',
  '--fa-gloss-mid': 'rgb(255 255 255 / 34%)',
  '--fa-gloss-low': 'rgb(255 255 255 / 0%)',
  '--fa-gloss-foot': 'rgb(255 255 255 / 42%)',
  '--fa-rim-light': 'rgb(255 255 255 / 82%)',
  '--fa-inner-glow': 'rgb(186 234 255 / 55%)',
  '--fa-aqua-top': '#4cc4ef',
  '--fa-aqua-bottom': '#0f7cb4',
  '--fa-aqua-top-hover': '#6ad2f6',
  '--fa-aqua-bottom-hover': '#1389c4',
  '--fa-pane': 'rgb(255 255 255 / 66%)',
  '--fa-pane-strong': 'rgb(255 255 255 / 84%)',
  '--fa-blur': '18px',
  '--fa-blur-strong': '28px',
  '--fa-saturate': '1.5',
  '--fa-radius': '16px',
  '--fa-radius-lg': '22px',
  '--fa-veil': 'rgb(240 250 255 / 30%)',
  /* Tooltips are dark glass in *both* schemes — the one surface Aero keeps
     inverted in daylight, because a tooltip has to read over anything. */
  '--fa-tooltip-ink': '#eaf9ff',
}

const DARK_MATERIAL = {
  '--fa-gloss-top': 'rgb(190 240 255 / 26%)',
  '--fa-gloss-mid': 'rgb(150 220 255 / 10%)',
  '--fa-gloss-low': 'rgb(255 255 255 / 0%)',
  '--fa-gloss-foot': 'rgb(150 220 255 / 12%)',
  '--fa-rim-light': 'rgb(178 234 255 / 34%)',
  '--fa-inner-glow': 'rgb(64 190 235 / 30%)',
  '--fa-aqua-top': '#2ea8d8',
  '--fa-aqua-bottom': '#0b5f8c',
  '--fa-aqua-top-hover': '#46c2ee',
  '--fa-aqua-bottom-hover': '#0d7099',
  '--fa-pane': 'rgb(13 44 62 / 68%)',
  '--fa-pane-strong': 'rgb(17 53 73 / 86%)',
  '--fa-blur': '16px',
  '--fa-blur-strong': '26px',
  '--fa-saturate': '1.4',
  '--fa-radius': '16px',
  '--fa-radius-lg': '22px',
  '--fa-veil': 'rgb(4 20 32 / 34%)',
  '--fa-tooltip-ink': '#eaf9ff',
}

/** Everything one scheme contributes to the page. */
const SCHEMES = {
  light: { ramp: RAMP, alias: aliases(LIGHT_ANCHORS), scene: LIGHT_SCENE, material: LIGHT_MATERIAL },
  dark: { ramp: RAMP, alias: aliases(DARK_ANCHORS), scene: DARK_SCENE, material: DARK_MATERIAL },
}

/**
 * Flatten one custom-property group per scheme into the `{ light, dark }` pair
 * shape the theme service requires.
 *
 * `ThemeRuntime.overrideTokens` rejects a bare string with a teaching error,
 * because a single value goes illegible when the user flips the colour scheme.
 * Building the pairs from {@link SCHEMES} is how this plugin satisfies that
 * contract without writing every value twice.
 *
 * @param {'ramp' | 'alias' | 'scene' | 'material'} group - which group to pair.
 * @returns token-name → `{ light, dark }`.
 */
function pairGroup(group) {
  const names = new Set([
    ...Object.keys(SCHEMES.light[group]),
    ...Object.keys(SCHEMES.dark[group]),
  ])
  const out = {}
  for (const name of names) {
    const light = SCHEMES.light[group][name]
    const dark = SCHEMES.dark[group][name]
    if (typeof light !== 'string') continue
    out[name] = { light, dark: typeof dark === 'string' ? dark : light }
  }
  return out
}

/**
 * Serialise one scheme into a declaration list for the fallback stylesheet.
 *
 * The fallback exists so the skin is correct even when the theme service is
 * absent or answers late: the sheet is written with `!important`, which is the
 * only thing that outranks the inline custom properties `ui-layout` writes on
 * `<body>`. When the service *is* present the same values also go through
 * `overrideTokens`, which keeps the runtime snapshot, the `theme-color`
 * metadata and the Appearance cube previews coherent with what is painted.
 *
 * @param {'light' | 'dark'} scheme - scheme to serialise.
 * @returns CSS declarations, one per line.
 */
function declarations(scheme) {
  const groups = ['ramp', 'alias', 'scene', 'material']
  const lines = []
  for (const group of groups) {
    for (const [name, value] of Object.entries(SCHEMES[scheme][group])) {
      lines.push(`  ${name}: ${value} !important;`)
    }
  }
  return lines.join('\n')
}
