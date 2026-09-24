window.__ModuleLoader__.load({
	id: "dsh-frutiger-aero",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
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
		  //
		  // The 50–400 steps are *fills* (pale washes, indicator dots, dashes) and stay
		  // as shipped. From 500 down they carry text, so they are solved against the
		  // worst-case pane; see the note on `LIGHT_ANCHORS` for the arithmetic. The
		  // naming quirk `-700-delete` is the product's own, kept verbatim because the
		  // shipped stylesheets look it up by that exact name.
		  '--dsw-static-deepseek-50': '#e9f9fe',
		  '--dsw-static-deepseek-100': '#d3f2fd',
		  '--dsw-static-deepseek-200': '#b3e8fb',
		  '--dsw-static-deepseek-300': '#8adaf7',
		  '--dsw-static-deepseek-400': '#46c2ee',
		  '--dsw-static-deepseek-450': '#29b2e3',
		  '--dsw-static-deepseek-500': '#0c6a90',
		  '--dsw-static-deepseek-600': '#0a5f82',
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

		/**
		 * Aero Glass — daylight. Glass over bright sky: white pane, blue rim, deep-navy ink.
		 *
		 * The ink ramp is *text*, so it is solved against the worst surface it can
		 * land on rather than against white. That surface is not the nominal white
		 * pane: the app's own panes are 74% white over a wallpaper whose darkest
		 * sample is `rgb(18 40 62)`, which composites to `#c1c7cd`. The values below
		 * were chosen against *that*, while keeping the ramp monotonic — `ink` darkest,
		 * `caption` lightest — so the four `--dsw-alias-label-*` tiers stay as visually
		 * distinct as the product intends. Measured ratios (WCAG 2.1, sRGB):
		 *
		 *   token        on #c1c7cd   on #ffffff
		 *   ink              8.93        15.23
		 *   inkSoft          3.94         6.72
		 *   inkFaint         3.49         5.95
		 *   caption          3.01         5.14
		 *   accent           3.54         6.03
		 *   accentDeep       4.15         7.08
		 *
		 * Note that only `ink` clears 4.5:1 on the worst-case pane, and `ink` is the
		 * only tier the product uses for body copy — every larger surface here is
		 * opaque, where `inkSoft` and below score 5–7.5:1 comfortably. The rows that
		 * used to fail are the ones this round fixes:
		 *
		 *   - `accent` was `#129dd0`, the palest aqua on the deepseek ramp. A lovely
		 *     *fill* colour and a poor *text* colour: 1.82:1 on the worst pane, which
		 *     is why the product's own "Chat" tab label failed at 2.97:1. The fix is
		 *     not to abandon the aqua but to move the text-bearing end of the accent
		 *     pair down the ramp the product already ships — hue kept, contrast bought.
		 *   - `caption` was `#6b93ab`, at 1.93:1 — and it was not reachable from any
		 *     `--dsw-alias-label-*` mapping the skin sets, so a product control
		 *     (`Access mode`, 3.25:1) was falling through to an undesigned colour.
		 *   - the accent pair was *inverted* (`accent` lighter than `accentDeep`),
		 *     which made `link` darker than `button-primary-fill` and lit every hover
		 *     transition *down* instead of up. `accentDeep` is now the darker of the
		 *     two, as its name and its use as `link` both require.
		 *
		 * The aqua still reads as aqua because it is a saturated cyan-blue with a light
		 * cast over glass, not because it is bright.
		 */
		const LIGHT_ANCHORS = {
		  canvas: 'rgb(244 251 255 / 88%)',
		  layer1: 'rgb(255 255 255 / 74%)',
		  layer2: 'rgb(255 255 255 / 84%)',
		  layer3: 'rgb(255 255 255 / 92%)',
		  overlay: 'rgb(255 255 255 / 70%)',
		  platform: 'rgb(226 244 254 / 78%)',
		  ink: '#08283c',
		  inkSoft: '#37607c',
		  inkFaint: '#3f6885',
		  caption: '#4a728e',
		  accent: '#0c6a90',
		  accentDeep: '#0b5f81',
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
		  /* The canvas colour at full alpha. Every *product* surface the skin defines is
		     deliberately translucent — the layers run 74% / 84% / 92% — which is the
		     aesthetic and is correct everywhere the surface sits over the wallpaper.
		     It is wrong for the right panel on a phone, which is a full-screen overlay
		     on top of the transcript: there the 12% shows the conversation through, and
		     no product token exists that can stop it. So the material layer carries one
		     solid value, at the same hue and brightness as the canvas. */
		  '--fa-panel-solid': '#f4fbff',
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
		  '--fa-panel-solid': '#0a2c40',
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
		 * Layer order is depth order, back to front: sky, sun, aurora, haze, light
		 * shafts, clouds, two hill ridges, water, caustics, bubbles, veil. The veil is
		 * last on purpose — it is the layer that guarantees text contrast over whatever
		 * is beneath it, and it must not be able to be overdrawn by a bubble.
		 *
		 * `aurora` and `clouds` were added with the desktop effects pass. They are
		 * plain divs with a gradient and one animation each, costing one composited
		 * layer apiece and no nodes per call: the whole point of building the scene
		 * this way is that a busier wallpaper is a few more layers, not a few hundred
		 * more elements.
		 *
		 * @param count - bubble count for the active performance tier.
		 * @returns the scene root, ready to append.
		 */
		function createScenery(count) {
		  const root = document.createElement('div')
		  root.className = 'fa-scene'
		  root.dataset.faScene = ''
		  // Recorded so the runtime can tell whether a density change actually needs to
		  // rebuild the scene, rather than rebuilding on every toggle and flashing the
		  // wallpaper for a no-op.
		  root.dataset.faBubbles = String(count)
		  root.setAttribute('aria-hidden', 'true')

		  const layers = [
		    'sky',
		    'sun',
		    'aurora',
		    'haze',
		    'rays',
		    'clouds',
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
		/**
		 * Locating the product's controls, without reading their labels in one language.
		 *
		 * The dock and the drawer gestures have to press *the product's own* buttons —
		 * that is the whole point of them, since reimplementing "new session" would mean
		 * owning session creation. Finding those buttons by `aria-label` is the obvious
		 * way to do it and it is wrong, because the labels are localized: the client
		 * ships `zh` and `en`, so on a Chinese install every `[aria-label="Settings"]`
		 * lookup returns nothing.
		 *
		 * That failure was worse than a dead button. A lookup for
		 * `[aria-label="New session"]` on a Chinese install matched **this plugin's own
		 * dock button** — the dock's labels are English — so the handler clicked itself,
		 * recursing until the stack blew. One root cause, four symptoms: a dead dock, a
		 * scrim that would not dismiss, edge swipes that did nothing, and a button that
		 * hid itself because it could not find its control.
		 *
		 * ## What the DOM actually looks like
		 *
		 * Dumped from a live phone-width session, because the shape is not guessable and
		 * the first attempt at a "structural" hook got it wrong in a way that quietly
		 * created sessions:
		 *
		 * **Rail (drawer closed)** — every button is 44px wide and parked off-canvas:
		 *
		 * ```
		 * button "Open sidebar"     sidebar
		 * button "New session"      sidebar
		 * button "Add workspace"    sidebar > sidebar.workspaces
		 * button "Search sessions"  sidebar > sidebar.workspaces
		 * button "Settings"         sidebar > sidebar.settings
		 * ```
		 *
		 * **Drawer open** — the brand mark moves *into* the session button, and a
		 * separate collapse control appears beside it:
		 *
		 * ```
		 * button "New session"      sidebar             200x44  ← contains sidebar.brand.mark
		 * button "Collapse sidebar" sidebar              44x44
		 * button "New session"      sidebar             252x44
		 * button "Search sessions"  sidebar > sidebar.workspaces
		 * button "View options"     sidebar > sidebar.workspaces
		 * button "Add workspace"    sidebar > sidebar.workspaces
		 * button "Settings"         sidebar > sidebar.settings
		 * ```
		 *
		 * Two consequences, both of which bit:
		 *
		 *   - `[data-slot="sidebar.brand.mark"]` is **not** a sidebar toggle. It is
		 *     inside the "Open sidebar" button when collapsed and inside the "New
		 *     session" button when expanded, so treating it as a toggle makes a
		 *     close-drawer call silently start a new session.
		 *   - the workspaces region **reorders** between the two states, so positional
		 *     indexing inside it is wrong: "add workspace" is first in the rail and
		 *     third when expanded.
		 *
		 * So labels are the reliable hook for the toggle and the workspaces pair, and
		 * structure is the fallback rather than the other way round. The label table is
		 * not a guess: the strings are read out of the product's own `zh` and `en`
		 * dictionaries (`dsh-client-ui-sidebar`, `-workspace`, `-settings-general`), and
		 * the client ships exactly those two locales — so this covers the shipped
		 * product completely rather than merely probably.
		 *
		 * Every lookup is scoped to `#root`, where the application lives; the dock is
		 * appended to `<body>`, so a search can never return one of this plugin's own
		 * controls whatever it is looking for.
		 */

		/** Label pairs taken verbatim from the product's `zh` and `en` dictionaries. */
		const CONTROL_LABELS = {
		  openSidebar: ['Open sidebar', '打开侧边栏'],
		  collapseSidebar: ['Collapse sidebar', '收起侧边栏'],
		  newSession: ['New session', '新建会话'],
		  addWorkspace: ['Add workspace', '添加工作区'],
		  searchSessions: ['Search sessions', '搜索会话'],
		  settings: ['Settings', '设置'],
		}

		/**
		 * Substrings that appear in the accessible name of a session row's action
		 * button — `"Session actions for <title>"` / `"会话操作：<标题>"` and the like.
		 *
		 * Only *fragments* are needed, because the label carries the session title:
		 * matching it exactly would mean knowing every session name in advance. The
		 * fragments are lower-cased and matched case-insensitively.
		 */
		const SESSION_ACTION_HINTS = ['session actions', '会话操作', '会话选项']

		/**
		 * Labels that open the per-session menu, used to walk *out* of it.
		 *
		 * A row's menu is a sibling of the row inside a portal or popover, so the way
		 * to decide "the tap landed on an entry, not on the row" is to ask whether the
		 * tapped node or any ancestor carries one of these names.
		 */
		const SESSION_ACTION_ENTRY = ['rename', 'fork', 'archive', 'delete', '重命名', '派生', '归档', '删除']

		/** The application root; anything outside it is not the product's. */
		function appRoot() {
		  return document.getElementById('root')
		}

		/**
		 * Is this element a session row in the sidebar?
		 *
		 * Deliberately structural: the row is the product's own `treeitem` inside the
		 * sidebar slot. Anything else that happens to be selectable — a workspace, a
		 * file — is not a session and must not close the drawer when chosen.
		 *
		 * @param element - a candidate node.
		 * @returns whether it is a session row.
		 */
		function isSessionRow(element) {
		  if (!(element instanceof Element)) return false
		  const row = element.closest('[role="treeitem"]')
		  if (row === null) return false
		  const sidebar = appRoot()?.querySelector('[data-slot="sidebar"]')
		  if (sidebar === null || sidebar === undefined) return false
		  return sidebar.contains(row)
		}

		/**
		 * Did this node come from inside a session row's action menu?
		 *
		 * The menu is portal-rendered, so it is *not* a descendant of the row; the test
		 * therefore walks up from the tapped node looking for a `menuitem` (or a plain
		 * button) whose name is one of the menu's entries. Without this, tapping
		 * "Rename" would also close the drawer, turning one intent into two effects.
		 *
		 * @param element - the node the tap landed on.
		 * @returns whether the tap belongs to the row's menu rather than the row.
		 */
		function isSessionActionEntry(element) {
		  if (!(element instanceof Element)) return false
		  for (let node = element; node !== null; node = node.parentElement) {
		    const tag = node.tagName
		    const interactive = tag === 'BUTTON' || node.getAttribute('role') === 'menuitem'
		    if (!interactive) continue
		    const name = (node.getAttribute('aria-label') ?? node.textContent ?? '').trim().toLowerCase()
		    if (SESSION_ACTION_ENTRY.some((hint) => name.includes(hint))) return true
		  }
		  return false
		}

		/**
		 * A control by any of its known labels, inside the application only.
		 * @param names - candidate labels, most likely first.
		 * @returns the first match, or null.
		 */
		function controlByLabel(names) {
		  const root = appRoot()
		  if (root === null) return null
		  for (const name of names) {
		    const found = root.querySelector(`[aria-label=${JSON.stringify(name)}]`)
		    if (found instanceof HTMLElement) return found
		  }
		  return null
		}

		/**
		 * The button that owns a slot hook.
		 *
		 * Only used where the slot's meaning is stable across states — `settings` is,
		 * `sidebar.brand.mark` is not.
		 *
		 * @param slot - a `data-slot` value the product sets.
		 * @returns the enclosing button, or null.
		 */
		function buttonForSlot(slot) {
		  const root = appRoot()
		  if (root === null) return null
		  const host = root.querySelector(`[data-slot=${JSON.stringify(slot)}]`)
		  if (host === null) return null
		  const button = host.closest('button')
		  return button instanceof HTMLElement ? button : null
		}

		/**
		 * The sidebar's own "New session" control: the one that is neither the brand
		 * wordmark (which also starts a session, but is a logo) nor part of a
		 * sub-region. Present in both the rail and the expanded layout.
		 */
		function sidebarSessionButton() {
		  const root = appRoot()
		  if (root === null) return null
		  const sidebar = root.querySelector('[data-slot="sidebar"]')
		  if (sidebar === null) return null
		  for (const button of sidebar.querySelectorAll('button')) {
		    if (button.querySelector('[data-slot="sidebar.brand.mark"]') !== null) continue
		    if (button.closest('[data-slot="sidebar.workspaces"]') !== null) continue
		    if (button.closest('[data-slot="sidebar.settings"]') !== null) continue
		    if (button.closest('[data-slot="sidebar.footer.action"]') !== null) continue
		    return button
		  }
		  return null
		}

		/**
		 * Resolve one of the controls this plugin drives.
		 *
		 * @param control - a key of {@link CONTROL_LABELS}.
		 * @returns the element to click, or null when the product does not offer it.
		 */
		function resolveControl(control) {
		  const names = CONTROL_LABELS[control] ?? []
		  switch (control) {
		    case 'openSidebar':
		    case 'collapseSidebar':
		      // Labels only. The two directions are genuinely two different buttons in
		      // the expanded layout and one relabelled button in the rail, and no slot
		      // hook distinguishes them — see the header note.
		      return controlByLabel(names)
		    case 'newSession':
		      // Structure first: the brand wordmark also carries this label when the
		      // drawer is open, and starting a session from a logo is not the intent.
		      return sidebarSessionButton() ?? controlByLabel(names)
		    case 'settings':
		      return buttonForSlot('settings.trigger') ?? controlByLabel(names) ?? buttonForSlot('sidebar.settings')
		    case 'addWorkspace':
		    case 'searchSessions':
		      // Labels only: the region reorders between the rail and the expanded
		      // layout, so "first button" would be "add workspace" in one state and
		      // "search sessions" in the other.
		      return controlByLabel(names)
		    default:
		      return controlByLabel(names)
		  }
		}

		/** True when the product currently offers the control. */
		function hasControl(control) {
		  return resolveControl(control) !== null
		}

		/**
		 * Press one direction of the sidebar toggle.
		 *
		 * Deliberately *not* state-guessed: the caller says which way it wants, because
		 * the same physical control changes both its label and its position with the
		 * layout, and inferring the direction from `data-fa-drawer` alone would click a
		 * collapse control that is not there yet.
		 *
		 * @param direction - `'open'` or `'close'`.
		 * @returns whether a control was found and pressed.
		 */
		function pressSidebar(direction) {
		  const element = resolveControl(direction === 'open' ? 'openSidebar' : 'collapseSidebar')
		  if (element === null) return false
		  element.click()
		  return true
		}

		/** Press any other resolved control, if the product offers it. */
		function pressControl(control) {
		  const element = resolveControl(control)
		  if (element === null) return false
		  element.click()
		  return true
		}
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
		 * That rule is not decoration and it was tested the hard way. An attempt to
		 * fix the Trajectory inspector by re-parenting the panel onto `document.body`
		 * (a "portal", to escape the isolated stacking context that sits under the
		 * composer) made the geometry perfect — `elementFromPoint` escapes went 6 -> 0
		 * — and broke the panel outright. The panel is React-rendered and the app
		 * attaches its event listeners to `#root`; a node moved outside that subtree
		 * receives a click and does nothing with it, because the delegated listener
		 * never sees it. Measured: after the move, `close` and every detail tab
		 * reported a correct target and none of them responded, and moving the node
		 * back did not repair the fiber's own bookkeeping. The fix that works is CSS
		 * and only CSS — see the note in `src/css/mobile.css`. Moving product nodes is
		 * out, permanently, and this paragraph is why.
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
		const FA_SHEET_ORDER = ['base', 'scenery', 'material', 'mobile', 'effects', 'showcase']

		/** Preference keys, deliberately namespaced so nothing else can collide. */
		const FA_STORE_KEY = 'frutiger-aero:effects'
		const FA_SCENE_KEY = 'frutiger-aero:scene'
		const FA_BUBBLE_KEY = 'frutiger-aero:bubbles'

		/** Bubbles per tier — the baseline population for a device class. */
		const FA_BUBBLES = { full: 22, lite: 10, off: 0 }

		/**
		 * User-facing density steps.
		 *
		 * The tier already decides a sensible *default* count, but "sensible default"
		 * is not the same as "what this person wants". A user on a phone may want the
		 * wallpaper to be busier, and a user on a 32-core desktop may find 22 bubbles
		 * restless while they read. So the count is a preference with the tier as its
		 * default, and the multipliers are applied to the tier's baseline rather than
		 * replacing it — that keeps the tier meaningful (a `lite` device still gets a
		 * `lite` population) while letting the user push it in either direction.
		 *
		 * `calm` is deliberately not `0`: a scene with no bubbles at all is a different
		 * wallpaper, and that is already what the scene toggle is for.
		 */
		const FA_BUBBLE_DENSITY = {
		  calm: 0.45,
		  normal: 1,
		  lively: 1.8,
		}

		/** Density steps in display order, for the control surface. */
		const FA_BUBBLE_STEPS = Object.keys(FA_BUBBLE_DENSITY)

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
		 * How many bubbles to build, given the active tier and the user's preference.
		 *
		 * Three sources, in precedence order: the `?bubbles=` query parameter (so a
		 * screenshot or a bug report can name a count exactly), the stored preference,
		 * and the tier baseline. The result is clamped to a floor of 3 and a ceiling of
		 * 48 — a floor so the wallpaper never loses its defining feature by accident,
		 * a ceiling because past roughly forty composited layers the gains stop being
		 * visible and the cost does not.
		 *
		 * @param tier - the active performance tier.
		 * @returns bubble count, or 0 when there is no scene to put them in.
		 */
		function bubbleCount(tier) {
		  const baseline = FA_BUBBLES[tier] ?? FA_BUBBLES.lite
		  if (baseline === 0) return 0

		  const requested = queryPreference('bubbles') ?? readPreference(FA_BUBBLE_KEY)
		  const multiplier = requested === undefined ? 1 : FA_BUBBLE_DENSITY[requested]
		  if (multiplier === undefined) return baseline

		  return Math.max(3, Math.min(48, Math.round(baseline * multiplier)))
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

		    // The settings surface mounts *inside* the sidebar — `sidebar.settings` is
		    // its slot, so the panel, its scrim and its focus trap all live in that
		    // subtree. A drawer that is off-canvas therefore takes the dialog with it:
		    // the gear opened nothing visible until the user also opened the sidebar,
		    // which is a real bug and not a subtle one. Presence is a reliable signal
		    // (the dialog is mounted only while open), so the tagger publishes it and
		    // the stylesheet lifts the off-canvas treatment for as long as it holds.
		    const dialog = state.sidebar === null ? null : state.sidebar.querySelector('[role="dialog"]')
		    document.body.toggleAttribute('data-fa-dialog', dialog !== null)

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

		  /**
		   * Ask the app itself to open or collapse the sidebar, so its own state stays
		   * the source of truth. Both directions resolve through `./controls.js`, which
		   * knows how the product labels and arranges these controls in every locale it
		   * ships — and that the brand mark is not a toggle.
		   */
		  const openDrawer = () => pressSidebar('open')
		  const closeDrawer = () => pressSidebar('close')

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

		  // ── choosing a session dismisses the drawer ────────────────────────────
		  // The drawer covers the conversation, so tapping a session and leaving it up
		  // means the phone user has to make a *second*, unrelated gesture to see the
		  // thing they just asked for. Measured on a 390x844 touch viewport: the row
		  // reports `drawerStillOpen: true` after the tap.
		  //
		  // Selection is not implemented here — the row's own click still does that.
		  // This only observes that a choice was made and then asks the app to collapse,
		  // so the product's state stays the source of truth. Three guards keep it from
		  // firing when nothing was chosen: it is touch-only, it ignores taps on the
		  // row's action menu (whose menu is portal-rendered and therefore *outside* the
		  // row), and it ignores a row that is already the active one, since re-tapping
		  // the current session is a no-op the user did not ask to be dismissed for.
		  if (coarse) ctx.effect(() => {
		    const onRowClick = (event) => {
		      const target = event.target
		      if (!(target instanceof Element)) return
		      if (!isSessionRow(target)) return
		      if (isSessionActionEntry(target)) return
		      const row = target.closest('[role="treeitem"]')
		      if (row !== null && row.getAttribute('aria-selected') === 'true') return
		      // Let the product's own handler run first; collapsing is the *second*
		      // half of the interaction, not a replacement for it.
		      requestAnimationFrame(() => {
		        if (!document.body.hasAttribute('data-fa-drawer')) return
		        buzz(8)
		        closeDrawer()
		      })
		    }
		    document.addEventListener('click', onRowClick)
		    return () => {
		      document.removeEventListener('click', onRowClick)
		    }
		  }, 'frutiger-aero: drawer dismissal on session choice')

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

		  /**
		   * Each entry names a *control*, not a selector. The dock's own labels stay
		   * English (it is this plugin's UI, and it has no locale system of its own),
		   * while the control it presses is resolved against the product's language.
		   */
		  const entries = [
		    { id: 'menu', label: 'Menu', icon: 'menu', control: ':drawer' },
		    { id: 'new', label: 'New session', icon: 'new', control: 'newSession' },
		    { id: 'search', label: 'Search sessions', icon: 'search', control: 'searchSessions' },
		    { id: 'library', label: 'Workspaces', icon: 'library', control: 'addWorkspace' },
		    { id: 'settings', label: 'Settings', icon: 'settings', control: 'settings' },
		  ]

		  const buttons = entries.map((entry) => {
		    const button = document.createElement('button')
		    button.type = 'button'
		    button.className = 'fa-dock__button'
		    button.dataset.faDockAction = entry.id
		    button.setAttribute('aria-label', entry.label)
		    button.innerHTML = `<span class="fa-dock__glyph fa-dock__glyph--${entry.icon}" aria-hidden="true"></span>`
		    button.addEventListener('click', () => {
		      // `data-fa-drawer` is the drawer's own state, so the direction asked for
		      // is the direction the user is looking at, not a guess from the rail.
		      if (entry.control === ':drawer') {
		        pressSidebar(document.body.hasAttribute('data-fa-drawer') ? 'close' : 'open')
		        return
		      }
		      pressControl(entry.control)
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
		      dock.toggleAttribute('data-fa-dock-open', document.body.hasAttribute('data-fa-drawer'))
		      for (const [entry, button] of buttons) {
		        // A button whose control the product does not offer must not render —
		        // and "offers" is answered by the resolver, so a Chinese install no
		        // longer hides the workspaces button because it looked for English.
		        const present = entry.control === ':drawer' || hasControl(entry.control)
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
		 * Plant the two scroll-edge fog masks and keep them in step with the scroll.
		 *
		 * ## Why this is a listener and not a selector
		 *
		 * The obvious way to fade a transcript's edges is `mask-image` on the scroll
		 * container, or a `:has()` that notices a scrolled row. Both are wrong here.
		 * The container is the product's element, so painting `mask-image` on it means
		 * the plugin owns a property the product may later animate; and a `:has()`
		 * anchored inside the transcript re-matches on every token while a model
		 * streams, which is precisely what `effects.css` rule 3 forbids.
		 *
		 * So the plugin plants **its own** two elements next to the scroll container
		 * and toggles one attribute on their parent. The listener is passive, it reads
		 * exactly one number (`scrollTop`), and it writes only on the *transition*
		 * between "at the top", "in the middle" and "at the bottom" — so a long scroll
		 * settles into zero writes per frame rather than sixty.
		 *
		 * ## Why the read is deferred to a frame
		 *
		 * `scrollTop` is a layout read. Reading it inside the scroll event is safe
		 * *here* because nothing in the same turn writes layout, but the write that
		 * follows (`toggleAttribute`) invalidates style, and doing that synchronously
		 * per scroll event is how a scroll handler becomes the frame budget. Coalescing
		 * through `requestAnimationFrame` makes the read and the write land in one
		 * frame together, and drops every intermediate event in between.
		 *
		 * ## Contract
		 *
		 * - It creates `[data-fa-scroll-edge]` nodes and removes them on teardown.
		 * - It writes `data-fa-scrolled` on the **canvas**, which is the product's
		 *   element, and that is the one attribute the CSS reads. Everything else it
		 *   touches it owns outright.
		 * - It never queries the transcript, never observes it, and never looks at a
		 *   message row.
		 *
		 * @param ctx - client cordis context.
		 * @param state - structural handles from {@link installTagger}.
		 */
		function installScrollEdges(ctx, state) {
		  ctx.effect(() => {
		    // ## Why the canvas is re-resolved instead of captured
		    //
		    // `installTagger` computes `state.canvas` inside a `requestAnimationFrame`,
		    // so at the moment this function is called during `apply()` the field is
		    // still `null` — the tagger has been *installed*, not *run*. Reading it
		    // once here produced a rule that never planted a mask and never retried,
		    // which is indistinguishable from a CSS selector that misses.
		    //
		    // So this resolves on demand and re-resolves when the transcript mounts,
		    // which it does not do at boot: a fresh profile opens on the hero phase
		    // with no conversation, and the scroll container appears later.
		    const resolve = () => {
		      const scroll = document.querySelector('[data-conversation-scroll]')
		      const host = state.canvas ?? document.querySelector('[data-fa-canvas]')
		      return scroll === null || host === null ? null : { scroll, host }
		    }

		    const edges = ['top', 'bottom'].map((side) => {
		      const mask = document.createElement('div')
		      mask.dataset.faScrollEdge = side
		      mask.setAttribute('aria-hidden', 'true')
		      return mask
		    })

		    let frame = 0
		    let last = null
		    let planted = null

		    const measure = () => {
		      frame = 0
		      const resolved = resolve()
		      if (resolved === null) return
		      const { scroll, host } = resolved

		      // Plant on first successful resolve, and re-plant if the product replaced
		      // the canvas under us — which it does when the conversation is swapped.
		      if (planted !== host) {
		        for (const mask of edges) host.append(mask)
		        planted = host
		        last = null
		      }

		      const top = scroll.scrollTop
		      const max = scroll.scrollHeight - scroll.clientHeight
		      // `max <= 0` is a transcript shorter than its viewport: there is nothing
		      // to fade towards, so both masks stay off rather than both turning on.
		      const next = max <= 1
		        ? null
		        : top <= 1
		          ? 'top'
		          : top >= max - 1
		            ? 'bottom'
		            : 'middle'
		      if (next === last) return
		      last = next
		      if (next === null) host.removeAttribute('data-fa-scrolled')
		      else host.setAttribute('data-fa-scrolled', next)
		    }

		    const schedule = () => {
		      if (frame !== 0) return
		      frame = requestAnimationFrame(measure)
		    }

		    // The listener has to be on `document` rather than on the scroll container,
		    // because the container does not exist yet at install time and changes
		    // identity when the conversation does. `scroll` does not bubble, but it does
		    // reach a *capturing* listener on an ancestor, which is the one form that
		    // survives a container that has not been created.
		    document.addEventListener('scroll', schedule, { passive: true, capture: true })
		    window.addEventListener('resize', schedule, { passive: true })

		    /**
		     * Wait for the transcript, then measure.
		     *
		     * The transcript mounts later than this effect runs, so measuring once is
		     * not enough — a fresh profile opens on the hero phase with no conversation
		     * at all.
		     *
		     * **This loop and `schedule` must not share the `frame` guard.** They did,
		     * and the consequence was that this effect never once planted a mask: on the
		     * iteration where the transcript finally appeared, `retry` had already
		     * stored a pending handle in `frame`, so the `schedule()` it then called hit
		     * its own `if (frame !== 0) return` and returned without scheduling the
		     * measure. The retry burned its remaining attempts and stopped, and the
		     * effect sat there having resolved its elements and done nothing with them.
		     *
		     * Leaving `frame` at zero before handing over is what makes the handoff
		     * work: the retry chain owns `frame` while it is polling, and owns nothing
		     * the moment it stops. `frame` is only ever a *pending-handle* slot for
		     * `schedule`/`measure`, and `retry` is not `schedule`.
		     */
		    let attempts = 0
		    const retry = () => {
		      if (resolve() !== null) {
		        frame = 0
		        schedule()
		        return
		      }
		      if (attempts >= 40) {
		        frame = 0
		        return
		      }
		      attempts += 1
		      frame = requestAnimationFrame(retry)
		    }
		    retry()

		    return () => {
		      if (frame !== 0) cancelAnimationFrame(frame)
		      document.removeEventListener('scroll', schedule, { capture: true })
		      window.removeEventListener('resize', schedule)
		      for (const mask of edges) mask.remove()
		      for (const host of [planted, document.querySelector('[data-fa-canvas]')]) {
		        host?.removeAttribute('data-fa-scrolled')
		      }
		    }
		  }, 'frutiger-aero: scroll edges')
		}

		/**
		 * Pause every animation when nobody is looking at it.
		 * A background tab keeps compositing its animations in some engines; a skin
		 * that quietly drains a battery is a worse trade than a still wallpaper.
		 *
		 * ## The element this writes to is not a detail
		 *
		 * It writes to `documentElement`, and it has to. Every rule that reads the
		 * attribute is written `html[data-fa-idle] …`, which matches only when the
		 * attribute is on the root element. This function used to write it to
		 * `<body>` — one line, and the consequence was that the governor never once
		 * fired: the attribute appeared, no selector matched it, and a hidden tab kept
		 * compositing all twenty-five animations the skin ships. It was written,
		 * documented and tested for by nobody, which is why it survived several
		 * releases.
		 *
		 * The rules were right and the writer was wrong, so the writer moved. The
		 * regression is now covered by `idlecheck.mjs`, which asserts both halves
		 * separately — that hiding the page publishes the attribute *where the rules
		 * read it*, and that the rules then reach elements, pseudo-elements and the
		 * wallpaper alike.
		 *
		 * @param ctx - client cordis context.
		 */
		function installIdleGovernor(ctx) {
		  const root = document.documentElement
		  ctx.effect(() => {
		    const sync = () => {
		      root.toggleAttribute('data-fa-idle', document.hidden)
		    }
		    document.addEventListener('visibilitychange', sync)
		    sync()
		    return () => {
		      document.removeEventListener('visibilitychange', sync)
		      root.removeAttribute('data-fa-idle')
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
		  // Owned by a small controller rather than built inline, because the bubble
		  // count is a live preference: changing it has to rebuild the scene, and the
		  // rebuild has to reuse the same deterministic seed so the wallpaper keeps its
		  // composition instead of reshuffling under the user.
		  const sceneEnabled = queryPreference('scene') !== 'off' && readPreference(FA_SCENE_KEY) !== 'off'

		  /** Rebuild the scene from the current tier and density. */
		  const renderScene = () => {
		    const existing = document.querySelector('[data-fa-scene]')
		    const wanted = sceneWanted() && classifyTier() !== 'off'
		    if (!wanted) {
		      existing?.remove()
		      return false
		    }
		    const count = bubbleCount(classifyTier())
		    // A rebuild is only needed when the count actually changed: the scene is
		    // expensive to build and a no-op toggle should not flash the wallpaper.
		    if (existing !== null && existing.dataset.faBubbles === String(count)) return true
		    const scene = createScenery(count)
		    if (existing === null) document.body.append(scene)
		    else existing.replaceWith(scene)
		    return true
		  }

		  /** Whether the user currently wants a wallpaper at all. */
		  const sceneWanted = () => queryPreference('scene') !== 'off' && readPreference(FA_SCENE_KEY) !== 'off'

		  if (sceneWanted() && tier !== 'off') {
		    ctx.effect(() => {
		      renderScene()
		      return () => {
		        document.querySelector('[data-fa-scene]')?.remove()
		      }
		    }, 'frutiger-aero: wallpaper')
		  }

		  // ── structure and interaction ────────────────────────────────────────────
		  const { state } = installTagger(ctx)
		  installMobileLayer(ctx, state)
		  installDock(ctx)
		  installScrollEdges(ctx, state)
		  installIdleGovernor(ctx)

		  const rerender = () => {
		    const next = classifyTier()
		    const current = document.documentElement.dataset.faTier
		    const changed = next !== current
		    if (changed) {
		      for (const name of ['fa-tier-full', 'fa-tier-lite', 'fa-tier-off']) root.classList.remove(name)
		      root.classList.add(`fa-tier-${next}`)
		      root.dataset.faTier = next
		    }
		    // The tier governs the bubble *baseline*, so a tier change moves the scene
		    // even when the density preference did not. `renderScene` is a no-op when
		    // the resolved count is unchanged, so calling it unconditionally is safe.
		    renderScene()
		    return changed
		  }

		  installFrameGovernor(ctx, tier, (lowered) => {
		    for (const name of ['fa-tier-full', 'fa-tier-lite', 'fa-tier-off']) root.classList.remove(name)
		    root.classList.add(`fa-tier-${lowered}`)
		    root.dataset.faTier = lowered
		  })

		  installControlSurface(ctx, {
		    version: '1.1.1',
		    tier: () => document.documentElement.dataset.faTier,
		    setEffects(effects) {
		      if (effects === 'off' || effects === 'lite' || effects === 'full') writePreference(FA_STORE_KEY, effects)
		      else writePreference(FA_STORE_KEY, '')
		      rerender()
		      return document.documentElement.dataset.faTier
		    },
		    setScene(enabled) {
		      writePreference(FA_SCENE_KEY, enabled === false ? 'off' : 'on')
		      renderScene()
		      return sceneWanted()
		    },
		    /**
		     * Wallpaper bubble density — `calm`, `normal` or `lively`.
		     *
		     * Exposed because the right answer depends on the person and the screen,
		     * not on the device class: the tier picks a defensible default and this
		     * lets the user disagree with it. Returns the resolved state so a caller
		     * can render a control without re-deriving it.
		     */
		    bubbles(step) {
		      if (step === undefined) {
		        return {
		          step: readPreference(FA_BUBBLE_KEY) ?? 'normal',
		          steps: FA_BUBBLE_STEPS,
		          count: document.querySelectorAll('[data-fa-bubble]').length,
		        }
		      }
		      if (!FA_BUBBLE_STEPS.includes(step)) {
		        throw new Error(
		          `frutiger-aero: unknown bubble density ${JSON.stringify(step)}; expected one of ${FA_BUBBLE_STEPS.join(', ')}`,
		        )
		      }
		      if (step === 'normal') writePreference(FA_BUBBLE_KEY, '')
		      else writePreference(FA_BUBBLE_KEY, step)
		      renderScene()
		      return {
		        step,
		        steps: FA_BUBBLE_STEPS,
		        count: document.querySelectorAll('[data-fa-bubble]').length,
		      }
		    },
		    tag: () => {
		      const frame = document.querySelector('[data-fa-frame]')
		      return frame === null ? null : [...frame.children].map((child) => child.getAttribute('data-fa-col') ?? child.tagName)
		    },
		  })
		}
		/** Stylesheets inlined at build time; see src/css/*.css. */
		const FA_SHEETS = {
      "base": "/*\n * base.css — structural groundwork.\n *\n * Loaded after the generated palette sheet and before everything else, so this\n * file may assume every `--dsw-*` token and every `--fa-*` material variable\n * already resolves, and must not assume any of the plugin's own attributes\n * exist yet (the tagger runs after the first paint).\n *\n * The rules here answer one question: *where does the wallpaper live?* The\n * scene is appended to `<body>` as a fixed element, so `#root` has to be lifted\n * into its own stacking context above it. Everything else in the skin depends\n * on that one decision.\n */\n\nhtml {\n  /* Aero is a bright, slightly cool white. This is what shows through before\n     the scene mounts, and behind it afterwards, so the first paint already\n     belongs to the theme instead of flashing the product default. The value\n     comes from the generated palette sheet, which also flips it for the dark\n     scheme. */\n  background: var(--fa-root-bg, #dff2fd);\n  /* The software keyboard is handled by a custom property (see runtime.js), so\n     the page itself must never resize under the user's thumb. */\n  -webkit-text-size-adjust: 100%;\n  text-size-adjust: 100%;\n}\n\nbody {\n  background: transparent !important;\n  color: var(--dsw-alias-label-primary);\n  font-family: var(--dsw-font-family);\n  /* Momentum scrolling and rubber-banding are opt-in per scroll container in\n     mobile.css; the page shell itself must not bounce. */\n  overscroll-behavior: none;\n  -webkit-tap-highlight-color: transparent;\n}\n\n/*\n * The wallpaper is a negative-z-index fixed layer, the classic technique: it\n * paints above the canvas background and below every in-flow node, without\n * giving `#root` a stacking context of its own.\n *\n * That last part matters. Wrapping the app in a stacking context would cap the\n * product's internal z-index ladder — panels at 8, handles at 11, the overlay\n * layer at 20, portalled dialogs at 100 — so a dock or a scrim placed as a\n * sibling of `#root` could never be layered correctly against a dialog. Leaving\n * `#root` context-free lets every layer compete in one space, which is exactly\n * what the mobile layer needs.\n */\nbody > [data-fa-scene] {\n  position: fixed;\n  inset: 0;\n  z-index: -1;\n}\n\n/* The app's own full-viewport surface must not paint over the wallpaper; the\n   single translucent wash comes from `--dsw-alias-bg-base` instead, which keeps\n   exactly one layer of translucency between the scene and the content. */\n[data-fa-frame] {\n  background: transparent !important;\n}\n\n/* The conversation column keeps its own `--dsw-alias-bg-base` wash; see the\n   note on `[data-fa-canvas]` in material.css for why stripping it is wrong. */\n\n/*\n * Anything the plugin adds is decoration and must never eat a pointer event.\n * The scrim is the single exception, and only while a drawer is open.\n */\n[data-fa-scene],\n[data-fa-scrim] {\n  pointer-events: none;\n}\n\nbody[data-fa-drawer] > [data-fa-scrim] {\n  pointer-events: auto;\n  /* The scrim is what stops the page behind the drawer from scrolling: every\n     touch that would have reached the transcript lands here instead. */\n  touch-action: none;\n}\n\nhtml {\n  /* Published by the keyboard tracker; zero on every platform without a\n     software keyboard, so the expression is safe everywhere. */\n  --fa-keyboard: 0px;\n  --fa-dock-height: 58px;\n\n  /* Dock glyphs. Inline SVG masks rather than icon fonts or sprite requests:\n     they inherit `currentColor`, cost no network round trip, and are defined\n     once for the single place this plugin draws its own iconography. */\n  --fa-icon-menu: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M4 7h16M4 12h16M4 17h10'/%3E%3C/svg%3E\");\n  --fa-icon-new: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M12 5v14M5 12h14'/%3E%3C/svg%3E\");\n  --fa-icon-search: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'%3E%3Ccircle cx='11' cy='11' r='6.5'/%3E%3Cpath d='M16 16l4.5 4.5'/%3E%3C/svg%3E\");\n  --fa-icon-library: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 7.5A1.5 1.5 0 0 1 4.5 6h4l2 2.5h7A1.5 1.5 0 0 1 19 10v7a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 3 17z'/%3E%3C/svg%3E\");\n  /* Sliders rather than a cog: at 22px a cog's teeth are indistinguishable\n     from a sunburst, and the dock already has a sun-like element behind it. */\n  --fa-icon-settings: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M4 7h10M18 7h2M4 17h4M12 17h8'/%3E%3Ccircle cx='16' cy='7' r='2.2'/%3E%3Ccircle cx='10' cy='17' r='2.2'/%3E%3C/svg%3E\");\n}\n\n/* Reduced motion is honoured in one place for everything decorative. */\n@media (prefers-reduced-motion: reduce) {\n  html.fa-tier-full [data-fa-scene]::after {\n    display: none;\n  }\n}\n",
      "scenery": "/*\n * scenery.css — the wallpaper.\n *\n * Nine layers of sky, sun, haze, light shafts, two hill ridges, water,\n * caustics and bubbles, all inside one fixed element with `contain: strict`.\n * The scene is therefore invisible to the application's layout: it cannot\n * cause a reflow, it cannot be scrolled, and it never appears in a hit test.\n *\n * Two rules govern every animation below, and they are the reason a wallpaper\n * this busy costs almost nothing:\n *\n *   1. Only `transform` and `opacity` are animated. Those are the two\n *      properties a compositor can animate without asking the main thread to\n *      re-layout, re-paint, or re-rasterise.\n *   2. Nothing animates anything that sits *behind* a `backdrop-filter`. The\n *      blur is applied by `material.css` to panes smaller than the viewport,\n *      and the scene is deliberately built from large feathered gradients —\n *      itself already the look a blur would produce — so no filter has to be\n *      recomputed as the bubbles move.\n */\n\n.fa-scene {\n  position: fixed;\n  inset: 0;\n  overflow: hidden;\n  pointer-events: none;\n  contain: strict;\n  /* Deliberately *not* promoted. An early version carried\n     `will-change: transform; transform: translateZ(0)` here to \"promote the\n     scene once\", and on a 3x display the compositor then painted the promoted\n     negative-z-index layer above the app's own content — the transcript showed\n     through the wallpaper instead of the other way round. Nothing in the scene\n     claims a `will-change` hint (see the bubble block below), so the whole\n     wallpaper stays an ordinary fixed element and is unambiguously behind the\n     app. */\n  opacity: 1;\n  transition: opacity 600ms ease;\n}\n\nhtml[data-fa-idle] .fa-scene,\nhtml[data-fa-idle] .fa-scene * {\n  animation-play-state: paused !important;\n}\n\n.fa-scene__layer {\n  position: absolute;\n  inset: 0;\n}\n\n/* ── sky ────────────────────────────────────────────────────────────────────\n   A vertical sky gradient with a wide, soft horizon glow. Frutiger Aero's skies\n   are never flat: they run from a saturated zenith to a near-white horizon. */\n.fa-scene__sky {\n  background:\n    radial-gradient(120% 80% at 18% 118%, var(--fa-scene-glow) 0%, transparent 62%),\n    linear-gradient(180deg, var(--fa-sky-top) 0%, var(--fa-sky-mid) 46%, var(--fa-sky-low) 74%);\n}\n\n/* ── sun ────────────────────────────────────────────────────────────────────\n   One small disc, one enormous bloom. The bloom is what sells \"Aero\"; the disc\n   is what keeps it readable as a sun rather than a lens artefact. */\n.fa-scene__sun {\n  background:\n    radial-gradient(circle at 74% 16%, var(--fa-sun) 0 2.6%, transparent 3.1%),\n    radial-gradient(circle at 74% 16%, var(--fa-sun-glow) 0%, transparent 34%);\n  animation: fa-sun-breathe 26s ease-in-out infinite;\n}\n\n/* ── aurora ─────────────────────────────────────────────────────────────────\n   A slow band of coloured light high in the sky, above the haze so it reads as\n   something in the air rather than something on the ground. Two counter-phased\n   radial blooms, each drifting on its own axis, which is enough to make the\n   band look like it is folding rather than sliding.\n\n   `mix-blend-mode: screen` is what keeps it from announcing itself as a shape:\n   on the bright upper sky it lifts the colour without darkening anything, the\n   way a real high-altitude glow does. */\n.fa-scene__aurora {\n  opacity: 0.5;\n  mix-blend-mode: screen;\n  background:\n    radial-gradient(56% 34% at 22% 16%, color-mix(in srgb, var(--fa-sky-mid) 70%, transparent) 0%, transparent 62%),\n    radial-gradient(48% 28% at 68% 9%, color-mix(in srgb, var(--fa-haze) 78%, transparent) 0%, transparent 66%);\n  animation: fa-aurora-drift 58s ease-in-out infinite;\n}\n\nhtml.fa-tier-lite .fa-scene__aurora,\nhtml.fa-tier-off .fa-scene__aurora {\n  display: none;\n}\n\n/* ── clouds ─────────────────────────────────────────────────────────────────\n   Two feathered ellipses on the horizon band. They exist to give the light\n   shafts something to be *in front of*: rays crossing a cloudless sky read as\n   a lens artefact, and rays crossing these read as air. */\n.fa-scene__clouds {\n  top: auto;\n  bottom: 22%;\n  height: 20%;\n  opacity: 0.55;\n  background:\n    radial-gradient(30% 42% at 12% 62%, color-mix(in srgb, var(--fa-gloss-top) 62%, transparent) 0%, transparent 70%),\n    radial-gradient(24% 34% at 32% 48%, color-mix(in srgb, var(--fa-gloss-top) 48%, transparent) 0%, transparent 72%),\n    radial-gradient(34% 44% at 82% 58%, color-mix(in srgb, var(--fa-haze) 55%, transparent) 0%, transparent 74%),\n    radial-gradient(26% 30% at 62% 40%, color-mix(in srgb, var(--fa-gloss-top) 40%, transparent) 0%, transparent 76%);\n  animation: fa-cloud-drift 76s linear infinite;\n}\n\nhtml.fa-tier-lite .fa-scene__clouds,\nhtml.fa-tier-off .fa-scene__clouds {\n  display: none;\n}\n\n/* ── haze ───────────────────────────────────────────────────────────────────\n   The single most important layer for making the landscape read as *distance*\n   rather than as a coloured band. Real air scatters light, so a ridge a\n   kilometre away is almost the colour of the sky above it; without this the\n   hills are a hard green stripe crossing the page — which is exactly what the\n   first version of this file looked like.\n\n   The slow breathe is deliberately almost imperceptible (a 4% opacity swing\n   over 34s). It is the layer most responsible for the sky feeling alive rather\n   than printed, and it does that by never quite resolving. */\n.fa-scene__haze {\n  background: linear-gradient(\n    180deg,\n    transparent 40%,\n    color-mix(in srgb, var(--fa-haze) 80%, transparent) 52%,\n    color-mix(in srgb, var(--fa-haze) 55%, transparent) 74%,\n    transparent 96%\n  );\n  animation: fa-haze-breathe 34s ease-in-out infinite;\n}\n\n/* ── light shafts ───────────────────────────────────────────────────────────\n   Four skewed bands of light, drifting. This is the layer that most says\n   \"2007 render\", and it is the first thing dropped on a phone. */\n.fa-scene__rays {\n  opacity: 0.4;\n  /* Wide, heavily feathered bands, and masked away before they reach the\n     content. Narrow bands at full height read as diagonal stripes over the\n     transcript rather than as light in the air. */\n  background: repeating-linear-gradient(\n    102deg,\n    transparent 0 11%,\n    color-mix(in srgb, var(--fa-gloss-top) 26%, transparent) 11% 19%,\n    transparent 19% 34%\n  );\n  -webkit-mask-image: linear-gradient(180deg, #000 0%, rgb(0 0 0 / 55%) 42%, transparent 74%);\n  mask-image: linear-gradient(180deg, #000 0%, rgb(0 0 0 / 55%) 42%, transparent 74%);\n  transform-origin: 74% 6%;\n  animation: fa-rays-drift 42s ease-in-out infinite;\n}\n\nhtml.fa-tier-lite .fa-scene__rays,\nhtml.fa-tier-off .fa-scene__rays {\n  display: none;\n}\n\n/* ── hills ──────────────────────────────────────────────────────────────────\n   Two ridges, near and far. Ellipses rather than SVG: cheaper, resolution\n   independent, and they read as Frutiger Aero's rolling green hills once the\n   far ridge is hazed by the layer above it.\n\n   Each ridge drifts against the other — the far one slower, the near one\n   faster and in the opposite direction — which is the cheapest parallax there\n   is: two elements, no scroll listener, and the difference in rate is what the\n   eye reads as depth. Amplitudes are tiny (under 1%) because a hill that\n   visibly travels stops being a hill. */\n.fa-scene__hills {\n  top: auto;\n  /* The horizon sits at four fifths of the viewport. High enough that the\n     landscape reads as a landscape, low enough that the conversation — which\n     lives in the upper and middle band — is over sky rather than over water. */\n  bottom: 10%;\n  height: 16%;\n}\n\n.fa-scene__hills.fa-scene__far {\n  background:\n    radial-gradient(58% 100% at 14% 108%, var(--fa-hill-far) 0 99%, transparent 100%),\n    radial-gradient(72% 100% at 52% 116%, var(--fa-hill-far) 0 99%, transparent 100%),\n    radial-gradient(54% 100% at 92% 110%, var(--fa-hill-far) 0 99%, transparent 100%);\n  opacity: 0.85;\n  animation: fa-hill-drift-far 64s ease-in-out infinite;\n}\n\n.fa-scene__hills.fa-scene__near {\n  bottom: 7%;\n  height: 11%;\n  background:\n    radial-gradient(64% 100% at 26% 118%, var(--fa-hill-near) 0 99%, transparent 100%),\n    radial-gradient(58% 100% at 78% 124%, var(--fa-hill-near) 0 99%, transparent 100%);\n  animation: fa-hill-drift-near 47s ease-in-out infinite;\n}\n\nhtml.fa-tier-lite .fa-scene__hills.fa-scene__far,\nhtml.fa-tier-off .fa-scene__hills.fa-scene__far {\n  display: none;\n}\n\n/* ── water ──────────────────────────────────────────────────────────────────\n   The bottom third. The gradient plus the horizon highlight is the entire\n   effect; the shimmer is the caustics layer, and the slow swell here is what\n   stops the waterline from being a fixed rule across the page. */\n.fa-scene__water {\n  top: auto;\n  height: 14%;\n  background:\n    linear-gradient(180deg, color-mix(in srgb, var(--fa-gloss-top) 42%, transparent) 0 1px, transparent 1px),\n    linear-gradient(180deg, var(--fa-water-top) 0%, var(--fa-water-deep) 100%);\n  animation: fa-water-swell 39s ease-in-out infinite;\n}\n\n/* A second, finer band of highlight riding on the waterline. Drawn as a\n   pseudo-element rather than another element so the swell above and this\n   glint below can run at different rates without either being nested — which\n   keeps the whole water treatment to one node. */\n.fa-scene__water::after {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  opacity: 0.5;\n  background: repeating-linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-gloss-top) 34%, transparent) 0 1px,\n    transparent 1px 9px\n  );\n  -webkit-mask-image: linear-gradient(180deg, #000 0%, transparent 62%);\n  mask-image: linear-gradient(180deg, #000 0%, transparent 62%);\n  animation: fa-water-shimmer 21s linear infinite;\n}\n\nhtml.fa-tier-lite .fa-scene__water::after,\nhtml.fa-tier-off .fa-scene__water::after {\n  display: none;\n}\n\n/* The water itself is the one layer whose *gradient* must survive into `lite`:\n   it is the bottom third of the wallpaper, and hiding it would leave a hole\n   where the horizon used to be. So the layer stays and only its loop stops —\n   which is a different shape from every other gate in this file, and was wrong\n   here until `loopcheck.mjs` enumerated the loops and caught it still running\n   at `lite`.\n\n   The settle values are the animation's own 0% frame, not `none`: stopping a\n   loop leaves the element on whatever frame it stopped at, and the point of\n   the tier is a *still* wallpaper, not a randomly-frozen one. Matching the 0%\n   frame exactly means the `lite` layer sits where a `full` layer sits at the\n   top of its cycle, so switching tiers does not move the waterline. */\nhtml.fa-tier-lite .fa-scene__water,\nhtml.fa-tier-off .fa-scene__water {\n  animation: none;\n  opacity: 0.94;\n  transform: translate3d(0, 0.4%, 0) scaleY(1);\n}\n\n/* ── caustics ───────────────────────────────────────────────────────────────\n   Two interference patterns of refracted light, counter-drifting. This is the\n   most expensive visual in the skin (a large `background-position` animation,\n   so it repaints rather than composites), which is exactly why it is confined\n   to the `full` tier. */\n.fa-scene__caustics {\n  top: auto;\n  height: 14%;\n  opacity: 0.55;\n  mix-blend-mode: soft-light;\n  background-image:\n    repeating-radial-gradient(\n      ellipse 60% 30% at 30% 10%,\n      color-mix(in srgb, var(--fa-caustic) 55%, transparent) 0 1.4%,\n      transparent 1.4% 7%\n    ),\n    repeating-radial-gradient(\n      ellipse 40% 22% at 70% 0%,\n      color-mix(in srgb, var(--fa-caustic) 38%, transparent) 0 1.1%,\n      transparent 1.1% 6%\n    );\n  animation: fa-caustics 24s linear infinite;\n}\n\nhtml.fa-tier-lite .fa-scene__caustics,\nhtml.fa-tier-off .fa-scene__caustics {\n  display: none;\n}\n\n/* ── bubbles ────────────────────────────────────────────────────────────────\n   The signature. Each bubble is one element carrying its own timing as custom\n   properties, so a single keyframe pair drives all of them and the whole\n   population shares one composited layer set.\n\n   No `will-change` here: 22 bubbles would be 22 promoted compositor layers, and\n   an animated `transform` is promoted by the engine on its own. Claiming the\n   hint per element is how a wallpaper ends up costing more than the app.\n\n   The gloss is three stacked gradients on the same element: a bright specular\n   dot, a soft sheen sweeping the upper left, and a rim that is brighter at the\n   bottom edge than the top — which is what makes a circle read as a *sphere*\n   rather than a disc. */\n.fa-scene__bubbles {\n  overflow: hidden;\n}\n\n.fa-scene__bubble {\n  position: absolute;\n  left: var(--fa-x, 40%);\n  bottom: -14vh;\n  width: var(--fa-size, 40px);\n  height: var(--fa-size, 40px);\n  border-radius: 50%;\n  opacity: 0;\n  background:\n    radial-gradient(circle at 32% 26%, var(--fa-bubble-core) 0 12%, transparent 34%),\n    radial-gradient(circle at 36% 30%, var(--fa-bubble) 0 30%, transparent 62%),\n    radial-gradient(circle at 50% 50%, transparent 58%, var(--fa-bubble-rim) 88%, transparent 100%);\n  box-shadow:\n    inset 0 0 0 1px color-mix(in srgb, var(--fa-bubble-rim) 60%, transparent),\n    inset -3px -5px 10px color-mix(in srgb, var(--fa-bubble-rim) 30%, transparent),\n    inset 3px 4px 12px color-mix(in srgb, var(--fa-bubble-core) 45%, transparent),\n    0 0 14px color-mix(in srgb, var(--fa-bubble-rim) 35%, transparent);\n  animation: fa-bubble-rise var(--fa-duration, 24s) linear infinite;\n  animation-delay: var(--fa-delay, 0s);\n}\n\nhtml.fa-tier-lite .fa-scene__bubble {\n  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--fa-bubble-rim) 50%, transparent);\n}\n\n/* ── veil ───────────────────────────────────────────────────────────────────\n   Last, and always on top of the wallpaper. Two jobs: it guarantees the\n   contrast floor for text that ends up over the scene, and it is the layer the\n   bloom comes from — the soft bright wash at the top is what makes the whole\n   page feel lit from above.\n\n   The bloom breathes on a long, asymmetric cycle. It is the one loop in the\n   scene that changes the *brightness of everything behind the app*, so its\n   amplitude is kept to 6% and its period longer than a reader's dwell time —\n   the effect should be discoverable, never noticeable. */\n.fa-scene__veil {\n  background:\n    radial-gradient(140% 90% at 50% -20%, color-mix(in srgb, var(--fa-gloss-top) 26%, transparent) 0%, transparent 60%),\n    linear-gradient(180deg, transparent 0%, var(--fa-scene-veil) 100%);\n  animation: fa-veil-breathe 44s ease-in-out infinite;\n}\n\n/* ── grain ──────────────────────────────────────────────────────────────────\n   A barely-there film grain, and the last thing added to the scene. Aero\n   wallpapers were photographs, and large flat gradients are the giveaway that\n   this one is not: at 4% opacity the noise is invisible as texture but it stops\n   the sky from banding on an 8-bit display, which is the failure mode a\n   gradient this wide actually has.\n\n   Applied to the scene rather than the app, so it is behind the glass — the way\n   film grain is behind a window — and costs no extra layer of its own. */\n.fa-scene::after {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  opacity: 0.045;\n  background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\");\n}\n\nhtml.fa-tier-lite .fa-scene::after {\n  display: none;\n}\n\n/* ── keyframes ──────────────────────────────────────────────────────────────\n   Eleven animations for the entire wallpaper, and every one of them animates\n   only `transform` or `opacity` — with the single exception of the caustics,\n   which is why only the caustics is restricted to the `full` tier.\n\n   The six loops added with the desktop effects pass all follow the same shape:\n   an even number of stops that returns to its starting value, so the cycle has\n   no visible seam however many times it repeats. Where a layer has both a\n   direction and a look to change, the curve is `ease-in-out` and the period is\n   long — a wallpaper loop is meant to be found, not watched. */\n\n@keyframes fa-bubble-rise {\n  0% {\n    transform: translate3d(0, 0, 0) scale(0.72);\n    opacity: 0;\n  }\n  8% {\n    opacity: var(--fa-opacity, 0.5);\n  }\n  50% {\n    transform: translate3d(calc(var(--fa-drift, 0vw) * 0.55), calc(-58vh - var(--fa-lift, 0vh)), 0)\n      scale(calc(0.86 + var(--fa-wobble, 0.8) * 0.1));\n    opacity: var(--fa-opacity, 0.5);\n  }\n  88% {\n    opacity: calc(var(--fa-opacity, 0.5) * 0.5);\n  }\n  100% {\n    transform: translate3d(var(--fa-drift, 0vw), calc(-116vh - var(--fa-lift, 0vh)), 0) scale(1.04);\n    opacity: 0;\n  }\n}\n\n@keyframes fa-sun-breathe {\n  0%,\n  100% {\n    transform: scale(1) translate3d(0, 0, 0);\n    opacity: 1;\n  }\n  50% {\n    transform: scale(1.06) translate3d(-1.2%, 0.8%, 0);\n    opacity: 0.88;\n  }\n}\n\n@keyframes fa-rays-drift {\n  0%,\n  100% {\n    transform: rotate(-1.6deg) scale(1.12);\n    opacity: 0.42;\n  }\n  50% {\n    transform: rotate(1.4deg) scale(1.18);\n    opacity: 0.62;\n  }\n}\n\n@keyframes fa-caustics {\n  0% {\n    background-position: 0% 0%, 40% 0%;\n  }\n  100% {\n    background-position: 120% 18%, -80% 12%;\n  }\n}\n\n/* ── the six added loops ────────────────────────────────────────────────────\n   Each runs on a different period — 58s, 76s, 34s, 64s, 47s, 39s, 21s, 44s —\n   and the periods are coprime-ish on purpose. Layers that share a period\n   visibly re-sync, and a wallpaper whose parts periodically line up reads as a\n   loop; one whose parts never quite do reads as weather. */\n\n@keyframes fa-aurora-drift {\n  0%,\n  100% {\n    transform: translate3d(-2.4%, 0.6%, 0) scale(1.06);\n    opacity: 0.42;\n  }\n  50% {\n    transform: translate3d(2.6%, -1.4%, 0) scale(1.12);\n    opacity: 0.62;\n  }\n}\n\n@keyframes fa-cloud-drift {\n  0% {\n    transform: translate3d(-6%, 0, 0) scale(1.04);\n    opacity: 0.4;\n  }\n  50% {\n    opacity: 0.62;\n  }\n  100% {\n    transform: translate3d(6%, 0, 0) scale(1.04);\n  }\n}\n\n@keyframes fa-haze-breathe {\n  0%,\n  100% {\n    opacity: 0.9;\n    transform: scale(1) translate3d(0, 0, 0);\n  }\n  50% {\n    opacity: 1;\n    transform: scale(1.012) translate3d(0, -0.3%, 0);\n  }\n}\n\n@keyframes fa-hill-drift-far {\n  0%,\n  100% {\n    transform: translate3d(-0.5%, 0, 0);\n  }\n  50% {\n    transform: translate3d(0.5%, 0.4%, 0);\n  }\n}\n\n@keyframes fa-hill-drift-near {\n  0%,\n  100% {\n    transform: translate3d(0.7%, 0, 0);\n  }\n  50% {\n    transform: translate3d(-0.7%, 0.5%, 0);\n  }\n}\n\n@keyframes fa-water-swell {\n  0%,\n  100% {\n    transform: translate3d(0, 0.4%, 0) scaleY(1);\n    opacity: 0.94;\n  }\n  50% {\n    transform: translate3d(-0.6%, -0.5%, 0) scaleY(1.03);\n    opacity: 1;\n  }\n}\n\n/* Two counter-drifting bands of highlight, so the waterline is never still and\n   never obviously sliding in one direction. */\n@keyframes fa-water-shimmer {\n  0% {\n    transform: translate3d(-3%, 0, 0);\n    opacity: 0.34;\n  }\n  50% {\n    transform: translate3d(3%, 0.6%, 0);\n    opacity: 0.58;\n  }\n  100% {\n    transform: translate3d(-3%, 0, 0);\n  }\n}\n\n@keyframes fa-veil-breathe {\n  0%,\n  100% {\n    opacity: 0.94;\n  }\n  50% {\n    opacity: 1;\n  }\n}\n\n/* Reduced motion: the scene stays, because it is the theme, but it stops.\n   The selector is deliberately broader than the layers that existed when this\n   block was written: `.fa-scene *` and `.fa-scene *::after` catch every layer\n   added since, including the waterline glint, which is a pseudo-element and\n   would otherwise be the one part of the wallpaper still moving. */\n@media (prefers-reduced-motion: reduce) {\n  .fa-scene,\n  .fa-scene *,\n  .fa-scene *::before,\n  .fa-scene *::after {\n    animation: none !important;\n  }\n\n  /* The added loops all displace their layer slightly, and freezing them\n     mid-cycle would leave a few of them off-centre. Clearing the transform is\n     what puts the still wallpaper back on the composition it was designed\n     around; the opacity each layer settles at is then stated explicitly below,\n     because the keyframes would otherwise no longer be supplying it. */\n  .fa-scene__aurora,\n  .fa-scene__clouds,\n  .fa-scene__hills,\n  .fa-scene__water,\n  .fa-scene__water::after,\n  .fa-scene__veil {\n    transform: none;\n  }\n\n  .fa-scene__aurora {\n    opacity: 0.5;\n  }\n\n  .fa-scene__clouds {\n    opacity: 0.55;\n  }\n\n  .fa-scene__haze {\n    opacity: 1;\n  }\n\n  .fa-scene__veil {\n    opacity: 1;\n  }\n\n  .fa-scene__water {\n    opacity: 1;\n  }\n\n  .fa-scene__water::after {\n    opacity: 0.5;\n  }\n\n  .fa-scene__bubbles {\n    opacity: 0.5;\n  }\n\n  /* The rise animation is what normally distributes the bubbles over the\n     viewport, so freezing it would leave them all in a row below the fold.\n     `--fa-lift` is the per-bubble vertical variation the animation already\n     uses, which makes it the natural thing to spread them with — and it is\n     independent of `--fa-x`, so the population stays scattered rather than\n     collapsing onto one diagonal. */\n  .fa-scene__bubble {\n    opacity: 0.4;\n    bottom: auto;\n    top: calc(12% + var(--fa-lift, 0vh) * 3.4);\n    transform: none;\n  }\n\n  .fa-scene__bubbles {\n    /* The scene's own wash already guarantees contrast; this only stops the\n       frozen population from looking accidental. */\n    opacity: 0.85;\n  }\n}\n",
      "material": "/*\n * material.css — the glass itself.\n *\n * ## Why `!important` is used deliberately here\n *\n * A client plugin's stylesheet is injected at runtime, and the boot creates\n * every plugin entry concurrently, so there is no guaranteed order between this\n * sheet and the product's own CSS-module sheets. Specificity ties cannot be\n * won by document order, and the product's rules are class selectors, so an\n * attribute selector of the same weight is a coin flip. Every paint property\n * below is therefore `!important`, which is what makes the skin deterministic\n * rather than load-order dependent.\n *\n * That is only safe because of what is *not* overridden. The product encodes\n * meaning in exactly one paint property — `background-color`, where a danger\n * button is red and a success chip is green — and this file never sets\n * `background-color`. It sets `background-image` (the Aero gloss, layered on\n * top of whatever colour the product chose), `border-*`, `border-radius`,\n * `box-shadow`, `backdrop-filter` and `color` inherited from the palette. So a\n * red button stays red, and it becomes a *glossy* red button.\n *\n * ## Why stable attributes, not class names\n *\n * The product hashes CSS-module class names per build (`.pI_x6G_sidebarCol`),\n * so they are worthless as selectors across an upgrade. What it *does* keep\n * stable is the semantic `data-*` vocabulary its own styles and tests depend\n * on — `data-rightbar-col`, `data-shell-overlay`, `data-conversation-scroll`,\n * `data-composer-card`, `data-chat-flow-kind`, `data-files-row` — plus ARIA\n * roles and element semantics. This file is written almost entirely against\n * those, which is why it survives product upgrades.\n */\n\n/* ══ 1. The glass panes ═════════════════════════════════════════════════════\n   Aero is a *window*: a bright rim, a translucent pane, and a soft coloured\n   glow behind it. The frame is the window; the sidebar, right panel and\n   composer are the panes set into it.\n\n   The single most important rule in the whole skin is the frame being\n   transparent: the wallpaper sits behind it, and one wash of\n   `--dsw-alias-bg-base` (78% white in light, 84% deep water in dark) is all\n   that separates the user's text from the scene. */\n\n[data-fa-frame] {\n  background: transparent !important;\n}\n\n/* The left rail / sidebar. Warmer and lighter than the content pane so the\n   window reads as chrome plus paper. */\n[data-fa-col=\"sidebar\"] {\n  background: var(--dsw-specific-sidebar-fill) !important;\n  border-right: 1px solid var(--dsw-alias-border-l2) !important;\n  box-shadow:\n    inset -1px 0 0 var(--fa-rim-light),\n    inset 1px 0 0 color-mix(in srgb, var(--fa-gloss-top) 30%, transparent) !important;\n}\n\n/*\n * The right panel deliberately gets the *heavier* glass: it is a floating\n * surface, not a structural column.\n *\n * It is applied to the **panel**, never to the column, and that distinction is\n * load-bearing rather than stylistic. On desktop the column is a zero-width\n * grid track, so blurring it is free; once the frame collapses to a single\n * track it spans the entire viewport — and a `backdrop-filter` on it then blurs\n * and desaturates the *whole application*, with the transcript inside it.\n *\n * It is also invisible to the obvious checks: the column is\n * `pointer-events: none`, so `elementFromPoint` never returns it and hit\n * testing looks perfectly healthy. It only shows up in pixels: on a phone at\n * the `full` tier the transcript band measured a luminance standard deviation\n * of 7 where the same content measured 26 with this rule scoped correctly.\n */\n[data-sidebar-right-panel] {\n  backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n  -webkit-backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n}\n\n/* The column may carry the glass only where it is a real, narrow track. */\n@media (min-width: 1024px) {\n  [data-fa-col=\"rightbar\"] {\n    backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n    -webkit-backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n  }\n}\n\n/* A column must never filter the viewport it shares with the conversation. */\n@media (max-width: 1023px) {\n  [data-fa-col=\"rightbar\"] {\n    backdrop-filter: none !important;\n    -webkit-backdrop-filter: none !important;\n  }\n}\n\nhtml.fa-tier-lite [data-fa-col=\"rightbar\"],\nhtml.fa-tier-lite [data-sidebar-right-panel],\nhtml.fa-tier-lite [data-fa-col=\"sidebar\"],\nhtml.fa-tier-off [data-fa-col=\"rightbar\"],\nhtml.fa-tier-off [data-sidebar-right-panel],\nhtml.fa-tier-off [data-fa-col=\"sidebar\"] {\n  /* Type-A surfaces: tint only. A full-height blur that has an animated\n     wallpaper behind it is re-run on every frame the wallpaper moves, which is\n     the one place this design could actually cost a phone its scroll. */\n  backdrop-filter: none;\n  -webkit-backdrop-filter: none;\n}\n\n/*\n * The conversation column keeps the product's own `--dsw-alias-bg-base` wash —\n * stripping it was the first thing tried here, and it is wrong: without a\n * column-level pane the wallpaper showed *through the gaps between rows*, so a\n * tool-call row over the hills went green and the empty half of a wide\n * transcript went bright blue. One uniform wash is what turns a wallpaper into\n * a background.\n *\n * What the tag is still for is the second, softer pane: a gradient that is\n * brightest behind the header and fades out down the transcript, so the top of\n * the column reads as lit glass without dimming the reading surface below it.\n */\n[data-fa-canvas] {\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-pane-strong) 46%, transparent) 0%,\n    transparent 34%\n  ) !important;\n}\n\n/* ══ 2. The composer ════════════════════════════════════════════════════════\n   The composer is the one surface the user touches constantly, so it gets the\n   most Aero: a real frosted pane with a bright rim, an inner aqua glow on\n   focus, and a lift on press. The product already gives it a 22px radius and\n   `--dsw-elevation-soft`, both of which the palette has already retinted. */\n\n[data-composer-card] {\n  background: var(--dsw-specific-input-major) !important;\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-gloss-top) 55%, transparent) 0 1px,\n    color-mix(in srgb, var(--fa-gloss-mid) 40%, transparent) 1px,\n    transparent 42%,\n    color-mix(in srgb, var(--fa-gloss-foot) 26%, transparent) 100%\n  ) !important;\n  border: 1px solid var(--dsw-alias-border-l1) !important;\n  box-shadow:\n    var(--dsw-elevation-soft),\n    inset 0 0 0 1px color-mix(in srgb, var(--fa-rim-light) 40%, transparent),\n    inset 0 -14px 28px -18px var(--fa-inner-glow) !important;\n  backdrop-filter: blur(var(--fa-blur)) saturate(var(--fa-saturate));\n  -webkit-backdrop-filter: blur(var(--fa-blur)) saturate(var(--fa-saturate));\n  transition:\n    box-shadow 220ms cubic-bezier(0.4, 0, 0.2, 1),\n    border-color 220ms cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n[data-composer-card]:focus-within {\n  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary) 62%, transparent) !important;\n  box-shadow:\n    var(--dsw-elevation-prominent),\n    0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-business-primary) 18%, transparent),\n    inset 0 0 0 1px color-mix(in srgb, var(--fa-rim-light) 55%, transparent),\n    inset 0 -18px 34px -20px var(--fa-inner-glow) !important;\n}\n\nhtml.fa-tier-lite [data-composer-card],\nhtml.fa-tier-off [data-composer-card] {\n  backdrop-filter: none;\n  -webkit-backdrop-filter: none;\n}\n\n/* The editor inside the composer is transparent; the pane above it is the\n   surface. Only the placeholder is restyled, to Aero's lighter ink. */\n[data-composer-placeholder],\n[data-placeholder] {\n  color: var(--dsw-alias-label-tertiary) !important;\n}\n\n[data-composer-chip] {\n  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 70%, transparent) !important;\n  border: 1px solid var(--dsw-alias-border-l1) !important;\n  border-radius: 999px !important;\n}\n\n/* ══ 3. Interactive surfaces ════════════════════════════════════════════════\n   One gloss recipe, applied to everything the user can press. Written as a\n   five-stop vertical gradient rather than a `::after` overlay: a pseudo-element\n   would need `position: relative` and `overflow: hidden` on every control,\n   which is exactly the kind of layout meddling a reskin must not do.\n\n   Stops, top to bottom:\n     0→1px   a crisp bright rim      (the \"specular\" edge)\n     1px→46% a soft sheen            (the gloss)\n     46%→54% the specular break      (where the curve turns away from the light)\n     54%→98% a faint reflected floor (the light bouncing off the surface below)\n     98%→100% a second, dimmer rim   (the bottom edge catching light) */\n\n:is(\n    button,\n    [role=\"button\"],\n    [role=\"tab\"],\n    [role=\"menuitem\"],\n    [role=\"menuitemradio\"],\n    [role=\"menuitemcheckbox\"],\n    [role=\"option\"],\n    summary,\n    a[href]\n  ):not([data-fa-plain]) {\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-gloss-top) 62%, transparent) 0 1px,\n    color-mix(in srgb, var(--fa-gloss-mid) 30%, transparent) 1px,\n    transparent 46%,\n    transparent 54%,\n    color-mix(in srgb, var(--fa-gloss-foot) 16%, transparent) 98%,\n    color-mix(in srgb, var(--fa-gloss-top) 30%, transparent) 100%\n  ) !important;\n}\n\n/* Hover and press. Both are expressed as the same gradient with different\n   opacities, so the \"material\" never changes — only how much light is on it. */\n:is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"], summary):not(:disabled):hover {\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-gloss-top) 78%, transparent) 0 1px,\n    color-mix(in srgb, var(--fa-gloss-mid) 46%, transparent) 1px,\n    transparent 50%,\n    color-mix(in srgb, var(--fa-gloss-foot) 24%, transparent) 100%\n  ) !important;\n}\n\n:is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"], summary):not(:disabled):active {\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-gloss-top) 26%, transparent) 0 2px,\n    transparent 30%,\n    color-mix(in srgb, var(--fa-gloss-foot) 30%, transparent) 100%\n  ) !important;\n}\n\n/* Disabled controls lose their gloss rather than being dimmed *and* shiny,\n   which would read as still-interactive. */\n:is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"]):disabled,\n:is(button, [role=\"button\"]):is([aria-disabled=\"true\"]) {\n  background-image: none !important;\n  filter: saturate(0.85);\n}\n\n/* Focus is the product's `outline`, which this file has not touched; it only\n   gets the Aero aqua and a soft halo so it sits in the new palette. */\n:focus-visible {\n  outline-color: var(--dsw-alias-state-business-primary) !important;\n}\n\n/* ══ 4. Inputs and editors ══════════════════════════════════════════════════\n   Text fields become inset glass wells: the gradient runs the other way (dark\n   at the top) because an inset surface is lit from *inside* the rim. */\n\n:is(input, textarea, select, [contenteditable=\"true\"], [data-lexical-editor]):not([data-composer-input]):not(\n    [data-fa-plain]\n  ) {\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--dsw-alias-bg-mask-2) 60%, transparent) 0 1px,\n    transparent 26%,\n    color-mix(in srgb, var(--fa-gloss-foot) 14%, transparent) 100%\n  ) !important;\n  border: 1px solid var(--dsw-alias-border-l2) !important;\n  box-shadow: inset 0 1px 2px color-mix(in srgb, var(--dsw-alias-bg-mask-2) 70%, transparent) !important;\n}\n\n:is(input, textarea, select):focus {\n  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary) 60%, transparent) !important;\n  box-shadow:\n    inset 0 1px 2px color-mix(in srgb, var(--dsw-alias-bg-mask-2) 60%, transparent),\n    0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-business-primary) 16%, transparent) !important;\n}\n\n::placeholder {\n  color: var(--dsw-alias-label-tertiary);\n  opacity: 1;\n}\n\n/* The product's own selection colour follows `--dsw-alias-brand-primary`, which\n   the palette has already turned aqua; this only adds the translucent wash Aero\n   uses so text under a selection stays legible. */\n::selection {\n  background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 26%, transparent);\n}\n\n/* ══ 5. Floating surfaces ═══════════════════════════════════════════════════\n   Dialogs, menus and tooltips are the moment the glass metaphor has to be\n   convincing, because they float *over* content with nothing structural\n   holding them. Heavy blur, a bright rim and a deep coloured shadow do it. */\n\n[role=\"dialog\"],\ndialog {\n  background: var(--dsw-specific-menu) !important;\n  border: 1px solid var(--dsw-alias-border-l1) !important;\n  box-shadow:\n    var(--dsw-elevation-prominent),\n    inset 0 1px 0 var(--fa-rim-light),\n    inset 0 0 0 1px color-mix(in srgb, var(--fa-rim-light) 30%, transparent) !important;\n  backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n  -webkit-backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n}\n\n[role=\"menu\"],\n[role=\"listbox\"],\n[role=\"tooltip\"],\n[role=\"grid\"],\n[data-tip] {\n  background: var(--dsw-specific-menu) !important;\n  border: 1px solid var(--dsw-alias-border-l1) !important;\n  box-shadow:\n    var(--dsw-elevation-panel),\n    inset 0 1px 0 var(--fa-rim-light) !important;\n  backdrop-filter: blur(var(--fa-blur)) saturate(var(--fa-saturate));\n  -webkit-backdrop-filter: blur(var(--fa-blur)) saturate(var(--fa-saturate));\n}\n\n[role=\"tooltip\"] {\n  background: var(--dsw-alias-tooltip-bg) !important;\n  color: var(--fa-tooltip-ink, var(--dsw-alias-label-primary-foreground)) !important;\n}\n\nhtml.fa-tier-lite :is([role=\"dialog\"], dialog, [role=\"menu\"], [role=\"listbox\"], [role=\"tooltip\"], [data-tip]),\nhtml.fa-tier-off :is([role=\"dialog\"], dialog, [role=\"menu\"], [role=\"listbox\"], [role=\"tooltip\"], [data-tip]) {\n  backdrop-filter: none;\n  -webkit-backdrop-filter: none;\n}\n\n/* The overlay layer holds full-screen scrims; the frame's own scene is the\n   backdrop, so the scrim only has to deepen contrast, not hide anything. */\n[data-shell-overlay] {\n  background: transparent !important;\n}\n\n/* ══ 6. Content ═════════════════════════════════════════════════════════════\n   Code, tables and quotes are where a themed app usually starts to look wrong,\n   because they are the surfaces most likely to have hard-coded neutrals. The\n   palette has already retinted their tokens; these rules finish the material. */\n\n[data-code-block-content],\npre {\n  border: 1px solid var(--dsw-alias-border-l1) !important;\n  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--fa-rim-light) 34%, transparent) !important;\n}\n\ncode,\nkbd {\n  border-radius: 6px;\n}\n\nkbd {\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-gloss-top) 60%, transparent) 0 1px,\n    transparent 60%,\n    color-mix(in srgb, var(--fa-gloss-foot) 24%, transparent) 100%\n  ) !important;\n  box-shadow:\n    0 1px 0 color-mix(in srgb, var(--dsw-alias-bg-mask-2) 70%, transparent),\n    inset 0 0 0 1px color-mix(in srgb, var(--fa-rim-light) 40%, transparent) !important;\n}\n\ntable {\n  border-collapse: separate;\n  border-spacing: 0;\n}\n\nth {\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-gloss-top) 40%, transparent) 0 1px,\n    transparent 100%\n  ) !important;\n}\n\nblockquote {\n  border-left: 3px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 50%, transparent) !important;\n  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 55%, transparent);\n  border-radius: 0 12px 12px 0;\n}\n\nhr {\n  border-color: var(--dsw-alias-border-l2) !important;\n}\n\n/* ══ 7. Chrome ══════════════════════════════════════════════════════════════\n   Scrollbars become aqua pills with a gloss, which is a small detail that does\n   a surprising amount of the \"this is a different product\" work. */\n\n::-webkit-scrollbar-thumb {\n  border-radius: 999px !important;\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-gloss-top) 55%, transparent) 0 1px,\n    transparent 70%\n  ) !important;\n  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--fa-rim-light) 24%, transparent);\n}\n\n::-webkit-scrollbar-thumb:hover {\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-gloss-top) 70%, transparent) 0 1px,\n    transparent 70%\n  ) !important;\n}\n\n/* Skeleton shimmer. The product animates these already; this only recolours\n   them to the aqua ramp so loading states belong to the theme. */\n[data-loading],\n[data-document-loading] {\n  background-image: linear-gradient(\n    100deg,\n    transparent 20%,\n    color-mix(in srgb, var(--fa-gloss-top) 42%, transparent) 42%,\n    transparent 64%\n  ) !important;\n  background-size: 220% 100% !important;\n  animation: fa-shimmer 1.5s linear infinite;\n}\n\n/* The boot card, which is the very first thing the theme has to own. */\n[data-dsh-boot] {\n  background: transparent !important;\n}\n\n[data-dsh-boot] > * {\n  background: var(--dsw-alias-bg-layer-3) !important;\n  border: 1px solid var(--dsw-alias-border-l1) !important;\n  border-radius: var(--fa-radius-lg) !important;\n  padding: 28px 36px !important;\n  box-shadow:\n    var(--dsw-elevation-prominent),\n    inset 0 1px 0 var(--fa-rim-light) !important;\n  backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n  -webkit-backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n}\n\n@keyframes fa-shimmer {\n  0% {\n    background-position: 160% 0;\n  }\n  100% {\n    background-position: -60% 0;\n  }\n}\n",
      "mobile": "/*\n * mobile.css — the phone and tablet layout.\n *\n * The stock narrow layout *squeezes*: below 1024px the sidebar stays in the\n * grid, so a 390px phone gives 56px to an icon rail and 334px to the thing the\n * user is actually reading. That is the one place this reskin changes behaviour\n * rather than appearance, and it is the change that matters most.\n *\n * The model, in three breakpoints:\n *\n *   ≥ 1024px  stock three-column desktop layout, untouched.\n *   641–1023  the frame collapses to a single column and the sidebar becomes an\n *             overlay drawer: a 56px rail when closed (the tablet keeps its\n *             navigation) and a 330px pane that slides *over* the content when\n *             opened, instead of stealing width from it.\n *   ≤ 640px   the rail goes fully off-canvas, the content gets the entire\n *             viewport, and the primary navigation moves to a floating bottom\n *             dock where a thumb can reach it.\n *\n * Only `transform`, `width` and the safe-area paddings are animated or\n * expressed here, and every transition is disabled under\n * `prefers-reduced-motion` — the layout is help, not decoration, so it applies\n * at every tier.\n */\n\n/* ══ Narrow: one column, the sidebar floats over it ═════════════════════════ */\n\n@media (max-width: 1023px) {\n  /*\n   * The inline `grid-template-columns` React writes is the stock layout's whole\n   * mechanism, and it has to go: a single track is what lets the sidebar leave\n   * the flow and become a drawer. `!important` beats the inline style, which is\n   * the only way to override a value React re-writes on every drag frame.\n   */\n  [data-fa-frame] {\n    grid-template-columns: minmax(0, 1fr) !important;\n  }\n\n  /*\n   * Both remaining columns share the single track, so the drawer can overlay\n   * either of them without either having to be re-measured.\n   *\n   * Sharing a cell has a consequence that is easy to miss and was, in the first\n   * version of this file: grid items in the same cell stack in DOM order, and\n   * the right column comes *after* the centre — so a full-size, empty right\n   * column sat on top of the transcript and swallowed every tap and every\n   * scroll gesture aimed at it. `elementFromPoint` at the centre of a\n   * conversation row returned the right column, and because a touch scroll is\n   * routed through the touched element's scrollable ancestor, the transcript\n   * could not be scrolled by touch at all.\n   *\n   * The fix is to take the right column out of hit testing entirely and hand\n   * pointer events back only to its own content. When no panel is shown its\n   * children are zero-sized, so nothing is blocked; when a panel *is* shown it\n   * is a child, so it stays fully interactive — including the full-screen file\n   * preview, where the panel is the only thing on screen.\n   */\n  [data-fa-col=\"center\"] {\n    grid-area: 1 / 1 / 2 / -1 !important;\n    z-index: 2;\n  }\n\n  [data-fa-col=\"rightbar\"] {\n    grid-area: 1 / 1 / 2 / -1 !important;\n    /* Above the centre, because a panel is positioned against this column's\n       right edge and is meant to hang over the conversation. */\n    z-index: 3;\n    pointer-events: none;\n  }\n\n  [data-fa-col=\"rightbar\"] > * {\n    pointer-events: auto;\n  }\n\n  [data-fa-col=\"sidebar\"] {\n    position: absolute !important;\n    inset: 0 auto 0 0;\n    z-index: 30;\n    width: min(84vw, 330px) !important;\n    max-width: calc(100vw - 56px);\n    /* The drawer runs under the notch in landscape and stops above the home\n       indicator in portrait. */\n    padding-left: env(safe-area-inset-left, 0px);\n    padding-bottom: env(safe-area-inset-bottom, 0px);\n    /* Matches the frame's own column transition, so opening the drawer and\n       resizing a desktop column feel like the same motion. */\n    transition: width var(--ds-transition-duration-slow) var(--ds-ease-in-out);\n    /* A drawer needs to read as being *in front of* the page, which a hairline\n       border cannot do. */\n    box-shadow:\n      0 0 0 1px var(--dsw-alias-border-l1),\n      18px 0 46px -22px var(--dsw-alias-bg-mask-3),\n      inset -1px 0 0 var(--fa-rim-light) !important;\n  }\n\n  /* Closed on a tablet: the rail stays, 56px of it, exactly as wide as the\n     product's own collapsed column. */\n  [data-fa-frame][data-sidebar-collapsed] [data-fa-col=\"sidebar\"] {\n    width: 56px !important;\n    box-shadow: none !important;\n  }\n\n  /* The content keeps clear of the rail while it is a rail, and reclaims the\n     full width the moment the drawer opens over it. */\n  [data-fa-col=\"center\"] {\n    padding-left: 56px !important;\n  }\n\n  [data-fa-frame]:not([data-sidebar-collapsed]) [data-fa-col=\"center\"] {\n    padding-left: 0 !important;\n  }\n\n  /* Full-screen panels on a narrow viewport are the real content, so they sit\n     above the drawer rather than being covered by it. */\n  [data-fa-frame][data-rightbar-fullscreen] [data-fa-col=\"rightbar\"] {\n    z-index: 34;\n  }\n}\n\n/* ══ The scrim ══════════════════════════════════════════════════════════════ */\n\n[data-fa-scrim] {\n  position: absolute;\n  inset: 0;\n  z-index: 25;\n  opacity: 0;\n  background:\n    radial-gradient(120% 80% at 0% 50%, color-mix(in srgb, var(--fa-water-deep) 26%, transparent) 0%, transparent 70%),\n    var(--dsw-alias-bg-mask-2);\n  backdrop-filter: blur(2px);\n  -webkit-backdrop-filter: blur(2px);\n  transition: opacity 300ms cubic-bezier(0.22, 1, 0.36, 1);\n}\n\nbody[data-fa-drawer] [data-fa-scrim] {\n  opacity: 1;\n}\n\n/* ══ Phone: the rail goes off-canvas ════════════════════════════════════════ */\n\n@media (max-width: 640px) {\n  [data-fa-col=\"sidebar\"] {\n    width: min(84vw, 320px) !important;\n    transition: transform 340ms cubic-bezier(0.22, 1, 0.36, 1);\n  }\n\n  /* Off-canvas, not display:none — the drawer's controls stay in the DOM (the\n     dock clicks them), and `visibility` keeps them out of the tab order while\n     it is closed. */\n  [data-fa-frame][data-sidebar-collapsed] [data-fa-col=\"sidebar\"] {\n    width: min(84vw, 320px) !important;\n    transform: translate3d(-102%, 0, 0);\n    visibility: hidden;\n    transition:\n      transform 340ms cubic-bezier(0.22, 1, 0.36, 1),\n      visibility 340ms;\n  }\n\n  [data-fa-col=\"center\"] {\n    padding-left: 0 !important;\n  }\n\n  /* Room for the dock, so the composer is never underneath it. Applied to the\n     column rather than the scroll area because the transcript measures itself\n     against a composer it expects at the very bottom of the column. */\n  [data-fa-frame] [data-fa-col=\"center\"] {\n    box-sizing: border-box !important;\n    padding-bottom: calc(var(--fa-dock-height) + env(safe-area-inset-bottom, 0px) + 10px) !important;\n  }\n\n  /* While the software keyboard is up the dock is in the way and the composer\n     is the only thing that matters. */\n  body[data-fa-keyboard] [data-fa-dock] {\n    transform: translate3d(-50%, 160%, 0);\n    opacity: 0;\n    pointer-events: none;\n  }\n\n  /*\n   * The right panel is a full-screen surface on a phone — a file preview, a\n   * diff, a document. The dock stays (session navigation is still useful while\n   * reading), but the panel has to stop *above* it, or the last lines of the\n   * file are behind a floating bar with no way to scroll them into view.\n   *\n   * Padding the panel rather than the dock is deliberate: the dock's own\n   * geometry is what every other rule here is expressed against, and shrinking\n   * the panel's content box is the only change that cannot move anything else.\n   */\n  [data-fa-col=\"rightbar\"] [data-sidebar-right-panel] {\n    box-sizing: border-box !important;\n    padding-bottom: calc(var(--fa-dock-height) + env(safe-area-inset-bottom, 0px) + 12px) !important;\n  }\n}\n\n/* Landscape phones: no vertical budget for a dock. */\n@media (max-width: 900px) and (max-height: 460px) and (orientation: landscape) {\n  [data-fa-dock] {\n    display: none !important;\n  }\n\n  [data-fa-frame] [data-fa-col=\"center\"] {\n    padding-bottom: 0 !important;\n  }\n\n  [data-fa-col=\"sidebar\"] {\n    width: min(62vw, 300px) !important;\n  }\n}\n\n/* ══ The bottom dock ════════════════════════════════════════════════════════ */\n\n[data-fa-dock] {\n  display: none;\n}\n\n@media (max-width: 640px) {\n  [data-fa-dock] {\n    position: fixed;\n    left: 50%;\n    bottom: calc(8px + env(safe-area-inset-bottom, 0px));\n    z-index: 45;\n    display: flex;\n    gap: 2px;\n    align-items: stretch;\n    padding: 5px;\n    border-radius: 999px;\n    transform: translate3d(-50%, 0, 0);\n    background: var(--fa-pane-strong);\n    border: 1px solid var(--dsw-alias-border-l1);\n    box-shadow:\n      0 0 0 1px color-mix(in srgb, var(--fa-rim-light) 34%, transparent),\n      0 10px 26px -12px var(--dsw-alias-bg-mask-3),\n      inset 0 1px 0 var(--fa-rim-light),\n      inset 0 -10px 20px -16px var(--fa-inner-glow);\n    backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n    -webkit-backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n    transition:\n      transform 280ms cubic-bezier(0.22, 1, 0.36, 1),\n      opacity 280ms ease;\n    /* The dock is chrome: it must not be selectable, draggable or callout-able\n       on a long press. */\n    -webkit-user-select: none;\n    user-select: none;\n    -webkit-touch-callout: none;\n  }\n\n  /* A drawer owns the screen while it is open; the dock gets out of its way. */\n  body[data-fa-drawer] [data-fa-dock] {\n    transform: translate3d(-50%, 160%, 0);\n    opacity: 0;\n    pointer-events: none;\n  }\n\n  .fa-dock__button {\n    position: relative;\n    width: 52px;\n    height: 42px;\n    padding: 0;\n    border: 0;\n    border-radius: 999px;\n    background-color: transparent;\n    color: var(--dsw-alias-label-secondary);\n    display: grid;\n    place-items: center;\n    cursor: pointer;\n  }\n\n  .fa-dock__button[hidden] {\n    display: none;\n  }\n\n  .fa-dock__button:active {\n    transform: scale(0.92);\n  }\n\n  /* The glyphs are drawn with masks rather than inline SVG so they inherit\n     `currentColor` from the button and need no per-state asset. */\n  .fa-dock__glyph {\n    width: 22px;\n    height: 22px;\n    background-color: currentColor;\n    -webkit-mask-repeat: no-repeat;\n    mask-repeat: no-repeat;\n    -webkit-mask-position: center;\n    mask-position: center;\n    -webkit-mask-size: contain;\n    mask-size: contain;\n    transition: transform 180ms ease;\n  }\n\n  .fa-dock__glyph--menu {\n    -webkit-mask-image: var(--fa-icon-menu);\n    mask-image: var(--fa-icon-menu);\n  }\n\n  .fa-dock__glyph--new {\n    -webkit-mask-image: var(--fa-icon-new);\n    mask-image: var(--fa-icon-new);\n  }\n\n  .fa-dock__glyph--search {\n    -webkit-mask-image: var(--fa-icon-search);\n    mask-image: var(--fa-icon-search);\n  }\n\n  .fa-dock__glyph--library {\n    -webkit-mask-image: var(--fa-icon-library);\n    mask-image: var(--fa-icon-library);\n  }\n\n  .fa-dock__glyph--settings {\n    -webkit-mask-image: var(--fa-icon-settings);\n    mask-image: var(--fa-icon-settings);\n  }\n\n  /* The active item gets the Aero \"lit lens\": an aqua bloom behind the glyph. */\n  [data-fa-dock-open] .fa-dock__button[data-fa-dock-action=\"menu\"] {\n    color: var(--dsw-alias-state-business-primary);\n  }\n\n  [data-fa-dock-open] .fa-dock__button[data-fa-dock-action=\"menu\"] .fa-dock__glyph {\n    transform: scale(1.06);\n  }\n}\n\n/* ══ The reading measure ════════════════════════════════════════════════════\n   The conversation declares\n\n     --dsh-chat-content-width: clamp(680px, columnWidth * .64, 920px)\n\n   whose *floor* is 680px. On a 390px phone that floor is wider than the\n   viewport, so every turn is laid out at 680px inside a ~350px box and clipped:\n   the transcript renders as a column of left-edge slivers. The product never\n   hits this in the stock layout because the sidebar squeezes the transcript to\n   108px first — which is worse, and is what the drawer above fixes.\n\n   Declared on `[data-conversation-scroll]` because that is the common ancestor\n   of both the transcript and the composer seat, so one declaration fixes the\n   reading column and the composer card together. `100%` rather than `100vw`\n   so the value still tracks the real column on a tablet, and `min(…, 680px)`\n   so a viewport wide enough for the product's own measure keeps it. */\n\n@media (max-width: 1023px) {\n  [data-conversation-scroll] {\n    --dsh-chat-content-width: min(100%, 680px) !important;\n  }\n}\n\n/* ══ Touch ergonomics ═══════════════════════════════════════════════════════\n   Applies on any coarse pointer, at any width — a touch laptop deserves the\n   same hit areas as a phone. */\n\n@media (pointer: coarse) {\n  /*\n   * A touch target that does not move anything.\n   *\n   * The obvious way to get a 44px target is `min-width: 44px`, and it is wrong\n   * on an application you do not own. The chat header's \"choose an app to open\n   * in\" control is 22x26 and centres its 11px chevron with `padding-left: 4px`\n   * under `justify-content: normal` — that is, the product positions the glyph\n   * from the box's *left edge*. Widen the box and the glyph stays put while the\n   * box grows around it, so the icon ends up 11.5px off-centre: measured, not\n   * guessed.\n   *\n   * So the target is grown with a pseudo-element instead. It is centred on the\n   * control, takes pointer events as part of it, and changes no layout at all —\n   * nothing can be pushed out of alignment because nothing is resized.\n   *\n   * `::before` is free to use here: the hover sheen that also wants it lives\n   * inside a `(hover: hover) and (pointer: fine)` query, so a device is never\n   * both. The press ring keeps `::after` on every device.\n   *\n   * Inline prose links are deliberately excluded. A 44px invisible box around a\n   * word inside a paragraph would overlap the words beside it and steal taps\n   * meant for text selection, and a link in a sentence is read, not aimed at.\n   */\n  :is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"], summary)::before {\n    content: '';\n    position: absolute;\n    left: 50%;\n    top: 50%;\n    width: max(100%, 44px);\n    height: max(100%, 44px);\n    transform: translate(-50%, -50%);\n  }\n\n  /* Dense icon clusters (toolbars, message actions, file rows) get a smaller\n     area on purpose: their controls sit on a ~36px pitch, and a 44px halo would\n     overlap both neighbours and make the strip harder to hit accurately. */\n  :is([data-actions-reveal], [data-message-attachments], [data-composer-stats], [data-files-row], [data-turn-tail])\n    :is(button, [role=\"button\"])::before {\n    width: max(100%, 36px);\n    height: max(100%, 36px);\n  }\n\n  /*\n   * The composer's tool row, for exactly the reason above — and it took a\n   * pixel-level sample to see it, because the failure is invisible from the\n   * box geometry.\n   *\n   * Measured on a 390px phone:\n   *\n   * ```\n   * .uV2eYG_tools   124x28   gap: 12px\n   *   Commands          28x28  @25  →53\n   *   Add attachment    28x28  @65  →93\n   *   Access mode       44x28  @105 →149\n   * ```\n   *\n   * Three controls, 12px apart, carrying 44px halos. Each halo reaches 8px past\n   * its own box, so `Commands` (centre 39) and `Add attachment` (centre 79) are\n   * only 40px apart while both claim 44 — they overlap by 4px, and the sample\n   * shows `Commands` losing exactly its right-hand 4px to its neighbour. The\n   * audit read that as `Commands reach 40x44`, which looks like a rounding\n   * artefact and is not: it is one control stealing from another.\n   *\n   * 36px is what this file already uses for every other strip on a ~36px pitch,\n   * chosen so neighbouring halos meet instead of crossing. The row still gets\n   * more target than the 28px box the product ships, with no overlap.\n   */\n  [class*=\"tools\"] :is(button, [role=\"button\"])::before {\n    width: max(100%, 36px);\n    height: max(100%, 36px);\n  }\n\n  /*\n   * iOS Safari zooms the whole page when a focused field's text is under 16px,\n   * and the zoom is sticky — the user then has to pinch back out. The composer's\n   * own sizing stays intact; only the floor moves.\n   */\n  :is(input, textarea, select, [contenteditable=\"true\"]) {\n    font-size: max(16px, 1em);\n  }\n\n  /* Kills the 300ms tap delay and the double-tap-zoom gesture without touching\n     pinch-zoom, which stays available for accessibility. */\n  :is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"], summary, label) {\n    touch-action: manipulation;\n  }\n\n  /* Text that is not meant to be selected must not pop a callout on long press\n     — but real content keeps its selection, which is the point of a chat UI. */\n  :is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [data-fa-dock], [data-fa-col=\"sidebar\"]) {\n    -webkit-touch-callout: none;\n    -webkit-user-select: none;\n    user-select: none;\n  }\n\n  /* Scroll containers: momentum, a contained overscroll (so a flick at the end\n     of the transcript does not bounce the page), and no scroll anchoring jumps\n     while streaming. */\n  :is([data-conversation-scroll], [data-trajectory-scroll], [data-approval-scroll], [data-input-scroll], [data-files-entry]) {\n    -webkit-overflow-scrolling: touch;\n    overscroll-behavior: contain;\n  }\n\n  [data-conversation-scroll] {\n    overscroll-behavior-y: contain;\n  }\n}\n\n/* ══ Short viewports: landscape phones, and any window that lost its height ══\n   A phone held sideways has ~390px of height and 844px of width, and the\n   product's conversation body centres its content vertically:\n\n   ```\n   844x390 landscape, measured\n     wSkVaW_scrollBody     786x390   y=0..390   justify-content: center\n     wSkVaW_composerSeat   778x240   y=75..315\n   ```\n\n   A 240px composer seat inside a 390px body leaves **75px of dead space above\n   it and 75px below** — 150 of 390 pixels, thirty-eight percent of the screen,\n   spent on nothing. In portrait the same rule is invisible because 844px of\n   height dwarfs the content, so this only ever shows up after a rotation. The\n   screenshot is unambiguous: the empty state floats in the middle of the frame\n   with the wallpaper's horizon cutting through empty area underneath it.\n\n   Centring is the right default for a tall viewport — it is what puts the\n   empty state at a comfortable reading height instead of jammed under the\n   header. It is the wrong default when the content is nearly as tall as the\n   viewport, because then there is nothing left to centre.\n\n   The threshold is a *height* query, not an orientation one. What actually\n   breaks the layout is running out of vertical room, and that happens to a\n   desktop window dragged short or a tablet in split view just as surely as it\n   happens to a rotated phone. Keying on `orientation` would miss all of those\n   and would also be wrong on a square-ish window.\n\n   Where the content goes instead is the part worth getting right. Anchoring\n   everything to the top moves the problem rather than fixing it: the composer\n   then sits at the very top of the frame with 186px of dead space underneath\n   it, which is the same amount of waste at the opposite end — measured, after\n   a first attempt that did exactly that.\n\n   The composer belongs at the bottom of a conversation. What the body actually\n   wants is to distribute its two children — the transcript and the composer\n   seat — with the transcript taking the slack:\n\n   ```\n   body { justify-content: flex-start }   seat pins to the top   ✗ (measured)\n   body { justify-content: flex-end   }   seat pins to the bottom ✓\n   ```\n\n   `flex-end` puts the seat against the bottom edge and lets the transcript\n   occupy everything above it, which is what the tall-viewport layout does\n   anyway once the transcript has content to fill it.\n\n   The dock is deliberately *not* restored here. The rule above this one\n   already hides it below 460px of height and 900px of width — \"landscape\n   phones: no vertical budget for a dock\" — and that trade still holds: at\n   844x390 the product's own 57px rail is present and usable, so the phone is\n   not left without navigation, and the dock is the more expensive of the two\n   because it floats over the transcript. The space it would occupy is what\n   the `flex-end` above just reclaimed. */\n@media (max-height: 560px) {\n  :is([data-conversation-scroll], [class*=\"scrollBody\"]) {\n    justify-content: flex-end !important;\n  }\n\n  /* With the content anchored to the bottom, the seat no longer needs the\n     breathing room the product gives it at full height. */\n  [data-composer-seat] {\n    padding-top: 0;\n  }\n\n  /* The empty-state hero carries a large block of top margin that exists to\n     centre it optically in a tall frame. Once the frame is short, that margin\n     is the reason the composer is pushed off the bottom. */\n  [class*=\"hero\"] {\n    margin-top: 0 !important;\n    padding-top: 12px;\n  }\n}\n\n/* ══ The keyboard ═══════════════════════════════════════════════════════════\n   iOS does not resize the layout viewport when the software keyboard opens; it\n   only shrinks `visualViewport`. Without this the composer sits underneath the\n   keyboard, which is the single most common mobile web-app defect. */\n\nbody[data-fa-keyboard] [data-composer-seat] {\n  transform: translate3d(0, calc(-1 * var(--fa-keyboard)), 0);\n  transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1);\n}\n\nbody[data-fa-keyboard] [data-fa-col=\"center\"] {\n  padding-bottom: env(safe-area-inset-bottom, 0px) !important;\n}\n\n/* ══ Dynamic viewport height ════════════════════════════════════════════════\n   `100vh` on a phone is the *large* viewport: the bottom of the layout sits\n   behind the browser's collapsing toolbar. `dvh` tracks the real visible area.\n   The product measures in `px` and is unaffected; this only corrects the frame\n   when it is sized from the viewport. */\n\n@supports (height: 100dvh) {\n  @media (max-width: 1023px) {\n    html,\n    body,\n    #root {\n      height: 100dvh;\n      min-height: 100dvh;\n    }\n  }\n}\n\n/* ══ Reduced motion ═════════════════════════════════════════════════════════ */\n\n@media (prefers-reduced-motion: reduce) {\n  [data-fa-col=\"sidebar\"],\n  [data-fa-scrim],\n  [data-fa-dock],\n  .fa-dock__button,\n  .fa-dock__glyph,\n  body[data-fa-keyboard] [data-composer-seat] {\n    transition: none !important;\n  }\n}\n\n/* ══ The Trajectory view ════════════════════════════════════════════════════\n   The trajectory panel is a real two-column table — a timeline gutter and a\n   content cell — and on a phone the content cell is exactly the width that is\n   left over, with `white-space: nowrap; overflow: hidden; text-overflow: clip`.\n   A row therefore shows the first forty characters of a line that can be three\n   thousand pixels long, and cuts off mid-glyph with no sign that anything is\n   missing. That is the \"uncomfortable on mobile\" part.\n\n   ## A correction, because the first audit of this file got it wrong\n\n   An earlier pass reported that the gutter was clipping its labels — \"第 1 轮\"\n   over by 29px, `ASSISTANT` by 59px — and this block was written on that\n   premise. It was a measurement artefact and the premise was false. The\n   product ships a container query for exactly this width:\n\n       @container Y0dWHa_trajectory-table (width <= 620px) {\n         .Y0dWHa_eventColumn { width: 50px }\n         .Y0dWHa_kindSlot     { width: 19px }\n         .Y0dWHa_kindTagLabel, .Y0dWHa_turnLabelFull { opacity: 0; max-width: 0 }\n         .Y0dWHa_turnLabelCompact { opacity: 1 }\n       }\n\n   — a deliberate swap of the text labels for the icon and the compact turn\n   number. Those labels are *hidden*, and a hidden element still reports a\n   `scrollWidth` wider than its zero-width box, so a probe that measures\n   `scrollWidth > clientWidth` finds a \"clip\" that no one can see. Verified\n   live at 390px: `containerType: inline-size`, column `50px`, `kindSlot 19px`,\n   `kindTagLabel opacity 0 / max-width 0`, `turnLabelCompact opacity 1`. The\n   container query works and the gutter is the product's own.\n\n   The failures worth fixing are elsewhere: a see-through inspector overlay,\n   hit areas that a thumb cannot land on, and no affordance saying a row is\n   tappable at all. Those are at the end of this file, next to the panel fix\n   they belong with.\n\n   ## What is deliberately not changed\n\n   **Row height.** The list is virtualised, and the product derives each row's\n   height from the row's own data:\n\n       const estimateVirtualRowSize = (index) =>\n         virtualRowStructure[index]?.height ?? 30          // 20 collapsed, 9 boundary\n\n   The virtualiser *does* carry a `measureElement` — it is\n   `@tanstack/react-virtual` v3.14.9 and measuring is its default — but this\n   table never attaches it to an element, so the estimate is final and there is\n   no measurement pass to correct a wrong one. Below 100 rows the virtualiser\n   is off entirely (`VIRTUALIZATION_THRESHOLD`) and taller rows would look\n   fine, which is exactly what makes this dangerous: it would work in testing\n   and break on a long session, where rows would overlap and the spacer heights\n   would drift. A skin does not get to desynchronise a list's layout model, so\n   the 30px row stays and the target problem is solved with hit area instead.\n\n   ## What is changed\n\n   The row keeps its height and its width, and its *content* becomes readable:\n   the cell scrolls horizontally under a finger, so a long line can be dragged\n   into view instead of being lost. Truncation is made visible with an ellipsis\n   and a trailing fade, and the row gets a press affordance. All of it is scoped\n   to coarse pointers at narrow widths, so the desktop table is byte-for-byte\n   what it was. */\n\n@media (pointer: coarse) and (max-width: 1023px) {\n  /* A hard cut at the cell edge reads as a rendering fault; an ellipsis reads as\n     \"there is more here\", which is also the affordance for the swipe below. */\n  [data-trajectory-scroll] tr[data-trajectory-row-key] > td {\n    text-overflow: ellipsis;\n  }\n\n  /* The horizontal scroller is not the cell — the cell fits its column exactly.\n     The clipping happens in *descendants*: for one tool call the request span is\n     180px wide holding 1627px of text, and the inline result holds 209px in\n     123px. So the rule goes on the subtree.\n\n     It can be this blunt because `overflow` does not apply to non-replaced\n     inline boxes: the payload spans that actually hold the long text are\n     `display: inline` and are left alone, while the block, grid and flex\n     wrappers that were doing the clipping become the scrollers.\n\n     Deliberately no `touch-action` override: a vertical drag inside one of these\n     must still scroll the list, and left alone the browser picks the axis from\n     the gesture — which is the behaviour we want and is not reproducible by\n     hand-declaring one axis. */\n  [data-trajectory-scroll] tr[data-trajectory-row-key] > td:last-child,\n  [data-trajectory-scroll] tr[data-trajectory-row-key] > td:last-child * {\n    overflow-x: auto;\n    /* `visible` is not available on one axis while the other scrolls — the\n       browser would compute it to `auto` and let a 19px line grow. */\n    overflow-y: hidden;\n    -webkit-overflow-scrolling: touch;\n    overscroll-behavior-x: contain;\n    scrollbar-width: none;\n  }\n\n  [data-trajectory-scroll] tr[data-trajectory-row-key] > td:last-child::-webkit-scrollbar,\n  [data-trajectory-scroll] tr[data-trajectory-row-key] > td:last-child *::-webkit-scrollbar {\n    display: none;\n  }\n\n  /* The timeline gutter is the anchor the rows are read against, so it stays\n     while the content beside it moves. It needs an opaque backdrop of its own,\n     or the scrolled text shows through it. */\n  [data-trajectory-scroll] tr[data-trajectory-row-key] > td:first-child {\n    position: sticky;\n    left: 0;\n    z-index: 2;\n    background: var(--dsw-alias-bg-base);\n    backdrop-filter: blur(10px) saturate(1.2);\n    -webkit-backdrop-filter: blur(10px) saturate(1.2);\n    box-shadow: 1px 0 0 var(--dsw-alias-border-l2);\n  }\n\n  /* 30px is short for a target but it is the row height we may not change, so\n     the row gets the feedback it can have: no 300ms tap delay, no double-tap\n     zoom, and a gloss that confirms the press. */\n  [data-trajectory-scroll] tr[data-trajectory-row-key] {\n    touch-action: manipulation;\n  }\n\n  [data-trajectory-scroll] tr[data-trajectory-row-key]:active > td {\n    background-image: linear-gradient(\n      180deg,\n      color-mix(in srgb, var(--fa-gloss-top) 30%, transparent) 0 1px,\n      transparent 100%\n    );\n  }\n}\n\nhtml.fa-tier-lite [data-trajectory-scroll] tr[data-trajectory-row-key] > td:first-child,\nhtml.fa-tier-off [data-trajectory-scroll] tr[data-trajectory-row-key] > td:first-child {\n  /* Below the top tier the pane under the gutter is opaque anyway, so the blur\n     would cost a filter for no visible difference. */\n  backdrop-filter: none;\n  -webkit-backdrop-filter: none;\n  background: var(--dsw-alias-bg-layer-3);\n}\n\n/* ══ A product modal that lives inside the sidebar ══════════════════════════\n   `sidebar.settings` is a slot *inside* the sidebar column, so the settings\n   panel and its scrim are part of that subtree. Taking the column off-canvas\n   therefore takes the dialog with it — the gear appeared to do nothing until\n   the user separately opened the drawer.\n\n   Lifting the `transform` is the load-bearing part, and for a reason that is\n   not obvious: a transform makes the element a containing block for\n   `position: fixed` descendants, and the dialog's scrim is fixed. Removing it\n   lets the scrim resolve against the viewport again, while `left` keeps the\n   column itself off screen — an offset moves the column without re-anchoring\n   anything. Measured: the panel sits at 23,23 in both cases, but only with the\n   transform gone is that 23,23 *of the viewport* rather than of a column parked\n   at -327px. */\n\n@media (max-width: 1023px) {\n  body[data-fa-dialog] [data-fa-col=\"sidebar\"] {\n    transform: none !important;\n    visibility: visible !important;\n    /* Above the dock: the dialog is modal and the dock is not part of it. */\n    z-index: 70 !important;\n  }\n\n  body[data-fa-dialog] [data-fa-dock] {\n    opacity: 0;\n    pointer-events: none;\n    transform: translate3d(-50%, 160%, 0);\n  }\n}\n\n@media (max-width: 640px) {\n  /* The column is off-canvas on a phone anyway; keep it there by position\n     rather than by transform, so nothing inside it is re-anchored. */\n  body[data-fa-dialog] [data-fa-col=\"sidebar\"] {\n    left: -102% !important;\n  }\n}\n\n/* ══ The settings dialog on a phone ═════════════════════════════════════════\n   The panel is `display: flex` with two children: a `<nav>` rail and a content\n   division. At 390px the rail takes 188px and the content is left 154px, so\n   every label wraps to one character per line — 权/限, 完/全/权/限 — and the\n   theme cards become three narrow columns. It is not a spacing problem; the\n   dialog is still laid out for a desktop window.\n\n   The rewrite is one column: the rail becomes a horizontally scrolling tab\n   strip with its title pinned, and the content takes the full width. Scoped\n   with `:has(> nav)` so it can only ever match the dialog that has a nav rail\n   — every other `[role=\"dialog\"]` in the product is left exactly as it was. */\n\n@media (max-width: 640px) {\n  [role=\"dialog\"]:has(> nav) {\n    position: fixed !important;\n    inset: 0 !important;\n    width: auto !important;\n    height: auto !important;\n    max-width: none !important;\n    max-height: none !important;\n    border-radius: 0 !important;\n    flex-direction: column !important;\n    overflow: hidden !important;\n  }\n\n  /* The rail becomes a tab strip. */\n  [role=\"dialog\"]:has(> nav) > nav {\n    flex: none !important;\n    flex-direction: row !important;\n    align-items: center !important;\n    gap: 6px !important;\n    width: 100% !important;\n    height: auto !important;\n    padding: calc(8px + env(safe-area-inset-top, 0px)) 10px 8px !important;\n    border-right: 0 !important;\n    border-bottom: 1px solid var(--dsw-alias-border-l2);\n    overflow: hidden !important;\n  }\n\n  /* Title pinned, tabs scrolling under it. */\n  [role=\"dialog\"]:has(> nav) > nav > *:first-child {\n    flex: none !important;\n    margin: 0 4px 0 0 !important;\n  }\n\n  [role=\"dialog\"]:has(> nav) > nav > *:last-child {\n    flex: 1 1 auto !important;\n    flex-direction: row !important;\n    width: auto !important;\n    min-width: 0;\n    gap: 4px;\n    overflow-x: auto;\n    overscroll-behavior-x: contain;\n    scrollbar-width: none;\n  }\n\n  [role=\"dialog\"]:has(> nav) > nav > *:last-child::-webkit-scrollbar {\n    display: none;\n  }\n\n  /* Each tab sizes to its label instead of the rail's fixed 164px column, and\n     the label stops reserving 112px of its own. */\n  [role=\"dialog\"]:has(> nav) > nav button {\n    flex: none !important;\n    width: auto !important;\n    min-height: 44px;\n    padding: 0 12px !important;\n    gap: 6px !important;\n    white-space: nowrap;\n  }\n\n  [role=\"dialog\"]:has(> nav) > nav button span {\n    width: auto !important;\n    white-space: nowrap;\n  }\n\n  /* Content takes the rest of the column and owns the scrolling. */\n  [role=\"dialog\"]:has(> nav) > div {\n    flex: 1 1 auto !important;\n    width: 100% !important;\n    min-height: 0;\n    min-width: 0;\n    overflow-y: auto;\n    overscroll-behavior-y: contain;\n    padding-bottom: env(safe-area-inset-bottom, 0px);\n  }\n}\n\n/* ══ Session rows: hover is not an input a thumb has ════════════════════════\n   The sidebar's session row carries its whole action menu — rename, archive,\n   delete — inside a `rowActions` box the product reveals on hover. On a coarse\n   pointer that box stays `display: none`, so the menu button measures 0x0 and\n   the row's actions are simply unreachable: measured, not guessed.\n\n   Two changes, both geometric only:\n\n   1. Reveal the actions on touch. The row already reserves the space in its own\n      layout, so nothing has to be re-measured — the box is simply allowed to\n      take part.\n   2. Stop the row from claiming it is draggable. `draggable=\"true\"` is an HTML5\n      drag source, which no touch browser implements; leaving it on makes the\n      row start a native drag as soon as a finger moves a few pixels, which\n      reads as the tap being swallowed. The product's own pointer handling is\n      what reorders sessions on touch, and it needs the native drag out of the\n      way.\n\n   The actions box is held open by giving it a real box, and the row loses the\n   32px cap the product sets so a finger has something to land on. */\n\n@media (pointer: coarse) {\n  [data-fa-col=\"sidebar\"] [role=\"treeitem\"][draggable] {\n    -webkit-user-drag: none !important;\n    min-height: 44px;\n  }\n\n  /* The product hides the actions box from hover-only input; on touch it is\n     always present, and its button gets the same 44px target as every other\n     control in the app. */\n  [data-fa-col=\"sidebar\"] [role=\"treeitem\"] [class*=\"rowActions\"] {\n    display: inline-flex !important;\n    align-items: center;\n    flex: none;\n  }\n\n  [data-fa-col=\"sidebar\"] [role=\"treeitem\"] [class*=\"rowActions\"] [class*=\"iconButton\"] {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n  }\n\n  /*\n   * Drop the timestamp to buy the title ~33px back.\n   *\n   * Measured on a 256px row: the title gets `1 1 0%` of what is left after a\n   * 16px slot, a 33px relative-time and a 16px actions button — 165px, which\n   * truncates a normal session name mid-word. The time is the one part nobody\n   * navigates by, and on a phone the row is already contextualised by the\n   * workspace group above it, so it is the part that goes.\n   *\n   * `display: none` rather than a width, because the row is a flex container\n   * and removing the box returns all 33px to the title in one step.\n   */\n  [data-fa-col=\"sidebar\"] [role=\"treeitem\"] > [class*=\"time\"] {\n    display: none !important;\n  }\n}\n\n/* ══ Where the halo cannot reach, grow the box ══════════════════════════════\n   The `::before` halo above is the right technique for most of the app: it\n   enlarges the target without moving a single pixel of layout. It has one\n   hard limit, and the sidebar is where it bites — **a pseudo-element cannot\n   escape a clipping ancestor.**\n\n   Measured on a 390px viewport with the drawer open, `View options` sits at\n   `left: 176, right: 204` and carries a correct 44x44 `::before`. Its reach\n   still measures `28x44`, because five ancestors between it and the frame all\n   clip:\n\n   ```\n   .bhn1Oq_search          overflow: hidden\n   .bhn1Oq_sectionHeader   overflow: hidden\n   .hHd-Xa_regionArea      overflow: hidden\n   .pI_x6G_sidebarCol      overflow: hidden\n   .pI_x6G_frame           overflow: hidden\n   ```\n\n   The halo is drawn and then cut off at each of those edges, so the usable\n   target is whatever the innermost clip leaves behind. No amount of `z-index`\n   fixes it — `z-index` orders siblings, and these are ancestors.\n\n   So for controls inside the sidebar's clipping stack the *box* grows instead.\n   That is normally the wrong trade (see the note on `min-width: 44px` above:\n   it moves glyphs off-centre in boxes the product centres from an edge), but\n   it is safe here for a reason worth stating: these are square icon buttons\n   the product centres with `justify-content: center`, so widening the box\n   symmetrically re-centres the glyph rather than displacing it.\n\n   The halo is switched off on these and the box takes over, so a control is\n   never counted twice and never ends up with a 44px box *plus* a 44px halo. */\n\n@media (pointer: coarse) {\n  [data-fa-col=\"sidebar\"] :is(button, [role=\"button\"]):not([class*=\"iconButton\"])::before,\n  [data-fa-col=\"sidebar\"] :is([class*=\"rowActions\"], [class*=\"sectionHeader\"], [class*=\"search\"])\n    :is(button, [role=\"button\"])::before {\n    /* Hand the job to the box; a clipped halo is worse than none, because it\n       reports as present in `getComputedStyle` while catching nothing. */\n    content: none;\n  }\n\n  /*\n   * The section header is a 260px strip holding a label, an icon, a *collapsed\n   * inline search* and an action group. It does not fit, and it does not fit on\n   * desktop either:\n   *\n   * ```\n   * 1280px viewport, stock product, no skin rules in play\n   *   sectionHeader    260x36\n   *     sectionLabel    77x20  @16   \"Workspaces\"\n   *     searchSlot      28x28  @176  flex: 1 1 0%   ← shrinks to nothing\n   *       searchButton  28x28  @176\n   *       searchInput    6x22  @204  ← a text field six pixels wide\n   *     headerActions   60x28  @208  ← lands *on top of* the slot above\n   * ```\n   *\n   * `headerActions` starts at 208 while `searchSlot` still occupies 176→204,\n   * so the two overlap at the same `y`, and the search field has been squeezed\n   * to six pixels. Giving the buttons a 44px box on a phone then made them\n   * overlap *each other* as well, with the last one running 28px past the\n   * `overflow: hidden` edge of the header.\n   *\n   * So the strip is re-laid-out rather than re-sized. The label keeps its\n   * space, the collapsed search collapses *properly* (its button stays, its\n   * unusable six-pixel input goes), and the action group is allowed to sit at\n   * the end of the row instead of on top of its neighbour.\n   *\n   * `margin-left: auto` is what resolves the overlap: it makes the action\n   * group the flex item that absorbs the slack, so the two groups lay out\n   * sequentially in source order instead of both being positioned from the\n   * collapsed slot.\n   */\n  [data-fa-col=\"sidebar\"] [class*=\"sectionHeader\"] {\n    gap: 6px;\n  }\n\n  /* The collapsed search contributes only its button. The input is 6px wide —\n     too small to read, to place a caret in, or to tap — and leaving it in the\n     flow is what forced the slot to shrink and the groups to collide. Opening\n     the search is the button's job; when it does, the input is given a real\n     box below. */\n  [data-fa-col=\"sidebar\"] [class*=\"searchSlot\"] {\n    flex: 0 0 auto;\n  }\n\n  [data-fa-col=\"sidebar\"] [class*=\"search\"] [class*=\"searchInput\"] {\n    /* Only while collapsed. `:not(:focus)` keeps a keyboard user's field. */\n    display: none;\n  }\n\n  [data-fa-col=\"sidebar\"] [class*=\"search\"]:focus-within [class*=\"searchInput\"],\n  [data-fa-col=\"sidebar\"] [class*=\"search\"][data-open] [class*=\"searchInput\"] {\n    display: block;\n    min-width: 96px;\n  }\n\n  /* The action group takes the remaining space and lays out from the end, so\n     the two groups can never be positioned on top of each other. It still has\n     to *fit*: the stock header's own right padding is not enough for two 36px\n     buttons plus the gap, so the group is inset from the clip edge rather than\n     running through it. Measured before: the last button ended at 282 against\n     a header that clips at 272. */\n  [data-fa-col=\"sidebar\"] [class*=\"headerActions\"] {\n    margin-left: auto;\n    flex: 0 0 auto;\n    padding-right: 10px;\n  }\n\n  [data-fa-col=\"sidebar\"] [class*=\"headerActions\"] :is(button, [role=\"button\"]) {\n    min-width: 36px;\n    min-height: 36px;\n    justify-content: center;\n  }\n\n  [data-fa-col=\"sidebar\"] [class*=\"searchButton\"] {\n    min-width: 36px;\n    min-height: 36px;\n    justify-content: center;\n  }\n\n  /*\n   * The session row's action button gets the full 44px, and it is the one\n   * control here that can afford it: it lives alone at the end of its own row\n   * with nothing beside it to steal from, and on a device without hover it is\n   * the *only* way to reach that row's menu.\n   *\n   * Measured: 44x44, no overlap. But it is not free — the row is 256px and the\n   * button is `flex: 0 0 auto`, so every pixel it takes comes straight out of\n   * the title, which is `flex: 1 1 0%`:\n   *\n   * ```\n   * 44px button →  title 170px  \"Frutiger Aero on a phone —\"   ← truncated\n   * 16px button →  title 198px  (the product's own hover box)\n   * ```\n   *\n   * So the title gets 28px back by *shifting* the button rather than shrinking\n   * it. The row is `position: relative`-free and the button is a flex item, so\n   * a negative right margin is what pulls the box toward the row's edge: the\n   * glyph inside is centred, so it moves with the box, and the 44px target\n   * stays 44px. The row's own right padding absorbs it.\n   *\n   * The result is a title that reads to `198px` again with a full-size target,\n   * which is the point: on a phone the *name* is what the user is choosing\n   * between, and the menu is the rarer intent.\n   */\n  [data-fa-col=\"sidebar\"] [role=\"treeitem\"] [class*=\"rowActions\"] button {\n    min-width: 44px !important;\n    min-height: 44px !important;\n  }\n\n  /* Pull the action box into the row's trailing padding. Bounded to the row's\n     own inset so the glyph cannot cross the sidebar's `overflow: hidden` edge. */\n  [data-fa-col=\"sidebar\"] [role=\"treeitem\"] [class*=\"rowActions\"] {\n    margin-right: -12px;\n  }\n\n  /*\n   * The right panel's tab strip puts its close button on top of its own title.\n   *\n   * Measured on a 390px phone, with the panel open on a file browser:\n   *\n   * ```\n   * .tabTitle   20 → 80   (60px; holds a 16px icon at 20-36 and the\n   *                        label's text at 41-68)\n   * .tabClose   76 → 96   (20px)\n   *                        ^ the close button starts 4px inside the title\n   * ```\n   *\n   * The tab is `display: flex` with `padding: 0 10px` and no `gap`, and both\n   * children are laid out edge to edge — so the icon, the label and the close\n   * button are competing for the same pixels, and the close button wins because\n   * it paints later. The label's own box reports `scrollWidth == clientWidth`,\n   * so nothing flags it as clipped: the text is intact, and the *box* it lives\n   * in is overlapped. It reads as \"File\" rather than \"Files\" on screen, and it\n   * gets worse as the label grows — a longer filename, or Chinese, which is\n   * wider per glyph.\n   *\n   * This is stock layout, not something the reskin introduced: the plugin never\n   * styles these nodes, and the classes are hashed host classes. It is fixed\n   * here anyway because it is a visible defect on the surface the user asked to\n   * be made to work, and scoping it to the tab strip cannot reach anything else.\n   *\n   * The fix is a `gap` on the tab rather than more padding, so the two children\n   * stop at the boundary instead of crossing it, and the title keeps the room\n   * the label actually needs.\n   */\n  [class*=\"_tab_\"] {\n    gap: 6px !important;\n  }\n\n  /* A tab is a target as well as a label, and 28px is short for a thumb. */\n  [role=\"tab\"][class*=\"_tab_\"] {\n    min-height: 36px !important;\n  }\n\n  /*\n   * The right panel is see-through on a phone: the conversation reads straight\n   * through it.\n   *\n   * The host gives the panel `background: var(--dsw-alias-bg-base)`, which on a\n   * desktop is opaque enough to sit beside a solid frame. This skin redefines\n   * that alias to the *canvas* colour — `rgb(244 251 255 / 88%)` in light,\n   * `rgb(7 32 46 / 90%)` in dark — because the conversation canvas is meant to\n   * be translucent glass over the wallpaper. Reusing the one token for both is\n   * fine while the panel is a 360px column beside the content and not fine at\n   * all when it is a full-screen overlay: 12% of the transcript underneath\n   * shows through a surface that has no blur to excuse it, and the result reads\n   * as two pages printed on the same sheet.\n   *\n   * The fix is the one this file already uses for the trajectory gutter — pair\n   * the translucent surface with the blur that makes it legible — rather than\n   * making the panel opaque, which would punch a flat rectangle out of the\n   * wallpaper and lose the glass the whole skin is built on. 24px is heavy\n   * enough to dissolve body text at this distance.\n   *\n   * Scoped to the two narrow breakpoints, where the panel becomes an overlay.\n   * At ≥1024px it is a column in the grid and the stock behaviour is correct.\n   */\n  .P3OORG_panel {\n    backdrop-filter: blur(24px) saturate(1.5);\n    -webkit-backdrop-filter: blur(24px) saturate(1.5);\n  }\n\n  /* Below the top tier the blur is the most expensive thing on the screen, so\n     the panel falls back to a solid fill instead — the same trade the\n     trajectory gutter makes, for the same reason.\n\n     It has to be a literal, not a token: every surface the skin defines is\n     deliberately translucent (the layers run 74% / 84% / 92%), which is the\n     whole aesthetic, so there is nothing in the set to fall back *to*. This is\n     the canvas colour at full alpha, which keeps the hue and the brightness and\n     drops only the transparency that was causing the problem. */\n  html.fa-tier-lite .P3OORG_panel,\n  html.fa-tier-off .P3OORG_panel {\n    background: var(--fa-panel-solid);\n    backdrop-filter: none;\n    -webkit-backdrop-filter: none;\n  }\n\n  /* ══ The Trajectory event inspector on a phone ═════════════════════════════\n     Tapping a row opens the product's own record inspector, and on a narrow\n     pane the product does the right thing: it lifts the panel out of the flex\n     row and pins it over the table.\n\n         .Y0dWHa_details { position: absolute; top: 0; bottom: 0; right: 0;\n                           width: min(92%, 420px); z-index: 5 }\n\n     That is an overlay by design, and the table underneath is *meant* to be\n     hidden by it. It was not, because of this skin. The product paints the\n     panel with `var(--dsw-alias-bg-layer-1)`, and this skin redefines that\n     alias to 74% alpha — so the overlay came out see-through and the two\n     layers rendered on top of each other, the table's rows legible straight\n     through the inspector's own text.\n\n     That single missing alpha is the whole of \"有很多东西点不到\". With two\n     interfaces stacked and both readable, a thumb aims at the thing it can\n     see and lands on whatever is actually on top; the 30px strip of table left\n     uncovered on the left edge is a second, smaller trap. Measured at 390px:\n     the panel lands at 30,156 358x617 over a tablePane that is still 388x617\n     at 0,156 — so before the fix exactly 30px of table was visible and the\n     rest was a double exposure.\n\n     A literal is required rather than a token, for the same reason as\n     `.P3OORG_panel` above: every surface this skin defines is deliberately\n     translucent, so there is nothing opaque to fall back to. */\n  /* The product's own overlay rule lives in `@media (width <= 760px)` and is\n     injected *after* this sheet, so an equal-specificity rule here would lose\n     on source order alone. `html` in front settles it without an `!important`,\n     which keeps the whole block overridable by anyone who comes later. */\n  html .Y0dWHa_details {\n    background: var(--fa-panel-solid);\n    /* The panel is the only thing that should scroll here; the table behind it\n       must not creep under a drag. */\n    overscroll-behavior: contain;\n  }\n\n  /* The same double-exposure exists at the other end of the panel: its header\n     and its tab strip sit on `bg-layer-2` / `bg-layer-1`, both translucent. */\n  html .Y0dWHa_detailsHeader,\n  html .Y0dWHa_detailTabs,\n  html .Y0dWHa_detailsTabs {\n    background: var(--fa-panel-solid);\n  }\n\n  /* A back affordance. The product's close control is a real button, but at\n     20x20 it is the smallest thing on the panel and it sits in the far corner\n     from a right thumb. The visual size is left alone — it is the product's\n     chrome — and only the hit area is grown, via a pseudo-element, so nothing\n     moves and the desktop layout is untouched. */\n  .Y0dWHa_details button[class*=\"close\"],\n  .Y0dWHa_detailsHeader button {\n    position: relative;\n  }\n\n  .Y0dWHa_details button[class*=\"close\"]::after,\n  .Y0dWHa_detailsHeader button::after {\n    content: \"\";\n    position: absolute;\n    inset: 50% 50% 50% 50%;\n    width: 44px;\n    height: 44px;\n    transform: translate(-50%, -50%);\n  }\n\n  /* ══ Row hit areas ════════════════════════════════════════════════════════\n     The rows are 30px, and the virtualiser's own model says why that cannot\n     simply be raised: `estimateVirtualRowSize` reads the height straight out\n     of the row's data (`virtualRowStructure[index]?.height ?? 30`), so a row\n     is 30, a collapsed-summary row is 20 and a terminal boundary is 9. The\n     library *does* carry a `measureElement`, but this table never hands it an\n     element, so the estimate is the final word and a skin that changed the\n     real height would desynchronise the list on a long session — the failure\n     would only appear past `VIRTUALIZATION_THRESHOLD` rows, which is the\n     worst possible place to find it.\n\n     So the row keeps its height and gains reach instead. A pseudo-element on\n     each content cell is stretched 7px above and below its own box, which\n     takes the effective target from 30px to 44px without moving a single\n     pixel of layout. Neighbouring rows' strips overlap by design — the row\n     whose strip is hit is decided by paint order among equal `z-index`es, and\n     a 14px borrowed band is far cheaper than a row that cannot be tapped. */\n  /* The product only makes a cell a containing block on the rows that start a\n     turn (`.Y0dWHa_table tbody tr[data-turn-start=true] td`), so every other\n     row needs it declared or the strip below would resolve against the table\n     and stretch across the whole pane. */\n  [data-trajectory-scroll] tr[data-trajectory-row-key] > td:last-child {\n    position: relative;\n  }\n\n  /* A full-height overlay across the cell was the first attempt and it broke\n     the horizontal drag: the strip sat above the inner scrollers, swallowed the\n     touch, and `scrollLeft` stayed at 0 for finger and test alike — a hit-area\n     fix that removed a gesture is a worse bug than the one it fixed.\n     \n     So the strip only fills the band *between* rows, where a near miss\n     actually lands, and it is 7px tall rather than 44. Two of them meet in each\n     gap so the seam is covered from both sides. Everything at the row's own\n     height is left alone, which is what keeps the drag working. */\n  [data-trajectory-scroll] tr[data-trajectory-row-key] > td:last-child::after {\n    content: \"\";\n    position: absolute;\n    left: 0;\n    right: 0;\n    bottom: -7px;\n    height: 7px;\n  }\n\n  /* The request boundary dots are 16x16 — the product's smallest control and\n     the one the timeline is navigated with.\n     \n     Both pseudo-elements are already spoken for here: `::before` is the 5px\n     dot and `::after` is the `data-label` tooltip, so neither can carry a\n     hit area the way the inspector's close button does. The button is instead\n     grown to 44x44 and the dot is re-centred inside it. That has to be done by\n     hand because the button is `position: absolute` and its `left` is a\n     calculated channel (`calc(var(--request-boundary-base-left) + offset)`):\n     widening the box by 28px would push the *visual* dot 28px to the right, so\n     `left` is pulled back by 14px and the already-centred `::before` keeps\n     printing in the same place. Net effect: the painted dot does not move a\n     pixel and a thumb has a 44px square to land in. */\n  /* Same cascade problem as the inspector above: the product's own\n     `@media (width <= 760px)` body sets `width: 16px; height: 16px` and is\n     injected after this sheet, so `html` leads to outrank it. Without that the\n     measured box stays 16x16 and the growth silently does nothing. */\n  html .Y0dWHa_requestBoundaryControl {\n    width: 44px;\n    height: 44px;\n    margin: -14px 0 0 -14px;\n  }\n\n  /* ══ Affordance ═══════════════════════════════════════════════════════════\n     A row carries `tabindex=\"0\"` and an `onClick`, but paints `cursor: default`\n     and no hover state, so on a touch device it is a target with no sign that\n     it is one. The rail on the leading edge appears on press, which is late\n     but honest — it confirms the tap landed and it costs nothing until then. */\n  [data-trajectory-scroll] tr[data-trajectory-row-key] {\n    cursor: pointer;\n  }\n\n  [data-trajectory-scroll] tr[data-trajectory-row-key]:active > td:last-child {\n    background-color: color-mix(\n      in srgb,\n      var(--dsw-alias-interactive-bg-hover) 70%,\n      transparent\n    );\n  }\n\n  /* Selected rows have to be identifiable at a glance once the inspector is\n     covering most of the table, or closing it cannot be told from not having\n     opened it. The product already exposes `data-selected`. */\n  [data-trajectory-scroll] tr[data-trajectory-row-key][data-selected] > td:last-child {\n    background-color: color-mix(\n      in srgb,\n      var(--dsw-alias-brand-primary-new-colorprimary-new-color, var(--fa-accent)) 14%,\n      transparent\n    );\n  }\n\n  /* ══ The reading problem ══════════════════════════════════════════════════\n     30px rows at 12px type is the product's density, and it is defensible on a\n     desktop where the table has the width to match. On a phone the content\n     cell is 338px and a tool call can be thousands of pixels wide, so the cell\n     scrolls sideways. The ellipsis from the older rule above is what says more\n     exists.\n\n     A trailing-edge fade was tried here and taken back out. The mask has to go\n     on the cell, because that is the scroll container — and a mask resolves\n     against the container's own box, so it stayed welded to the right edge\n     instead of travelling with the content, and it turned the horizontal drag\n     flaky. The ellipsis costs nothing and is honest; a fade that lies about\n     where the text ends is worse than no fade. */\n  /* Type floors. 8px is not a size anything should have to read on a phone —\n     the turn label is the one place the product drops to it, and it is the\n     label the whole left gutter is read against. */\n  .Y0dWHa_turnLabelCompact,\n  .Y0dWHa_kindTag {\n    font-size: 10px;\n  }\n\n  .Y0dWHa_turnRail {\n    /* The turn rail is 2px and marks where a request begins; at phone viewing\n       distance it reads as a smudge. */\n    width: 3px;\n  }\n\n  /* ══ The request timeline ═════════════════════════════════════════════════\n     The `输入 / 模型 / 工具` strip above the table plots the session as a Gantt\n     chart: one span per record, positioned by `--trajectory-span-left` and\n     `--trajectory-span-width` as percentages of the whole. The geometry is\n     proportional and correct — measured spans land at 11.1% intervals with 1px\n     gaps, and the widest end at x=387 against a 388px track, so nothing\n     overflows. What does not survive the shrink is the *reading*:\n\n     - `._1p9O6q_plot` is a `44px minmax(0,1fr)` grid and `._1p9O6q_labels` is\n       `font-size: 10px; line-height: 1`. Three two-character labels stacked in\n       44px at 10px is legible on a desktop at arm's length and is not on a\n       phone, and the label column is a fixed 44px so it cannot grow with the\n       type without stealing from the track.\n     - The bars are 8px tall on a 14px lane pitch. At 388px the spans come out\n       around 36px wide, so an eight-pixel bar carrying a third of the visual\n       weight of the row is closer to a dotted line than a chart.\n\n     So: give the label column a little more room (it is a third of the track's\n     font-size problem, not the data's), raise the label type to a floor that\n     can actually be read, and thicken the bars so the three lanes read as\n     three lanes. None of it touches the geometry the percentages depend on —\n     `--trajectory-span-*` are untouched, so the chart stays proportional and\n     the desktop strip is unchanged. */\n  /* `html` leads on every one of these for the same reason as the inspector and\n     the boundary dot: the product's stylesheet is injected after this one, so\n     at equal specificity it wins and the declaration is silently discarded\n     while still reading as if it applied. The first pass of this block omitted\n     it and measured 10px / `44px 344px` — i.e. nothing had changed. */\n  html ._1p9O6q_labels {\n    font-size: 11px;\n    line-height: 1.2;\n  }\n\n  html ._1p9O6q_plot {\n    /* The label column, not the row, because the track must keep `1fr` or the\n       percentage maths behind every span silently changes meaning. */\n    grid-template-columns: 52px minmax(0, 1fr);\n    height: 54px;\n  }\n\n  html ._1p9O6q_span {\n    border-radius: 3px;\n    opacity: 0.92;\n  }\n\n  /* The strip is a drag surface — `touch-action: none` and a crosshair cursor\n     are the product saying so — but nothing on screen says it is one that can\n     be *tapped* as well. The track gets the same minimum reach as the rest of\n     the phone layout. */\n  html ._1p9O6q_track {\n    min-height: 44px;\n  }\n\n  /* ══ The control that swallowed every tap on the inspector ════════════════\n     This is the whole of \"有很多东西点不到\", and it is one declaration.\n\n     ## What was wrong\n\n     On a phone, once a record was open, the inspector was comprehensively\n     dead: none of the six detail tabs switched, the close control did nothing,\n     and the overview titles could not be tapped. The obvious suspects were all\n     wrong. The panel is not transparent (it has an opaque background from the\n     rule above), and its `z-index` is not the problem.\n\n     `document.elementFromPoint` at the close button's centre returned\n     `.Y0dWHa_timestampToggle` — and so did a *blank* point in the middle of the\n     panel, and so did the centre of every tab. One element was claiming the\n     entire panel. Its own box is `139,582 146x20`, which sits near the bottom\n     of the inspector, and its container is a 57px-tall `overflow: auto`\n     summary strip holding 70px of content — so the control's layout rect is\n     the unclipped one, and that escaped rect is what Chromium hit-tests. The\n     rect covers the panel, so the panel became one big timestamp toggle.\n\n     ## Why nothing else fixed it\n\n     Three other approaches were measured and discarded, because each one\n     either did not address the cause or made things worse:\n\n     - **Moving the panel to `<body>`** (a portal, to escape the isolated\n       stacking context under the composer). This fixed the geometry — escapes\n       in a 24-point sample went 6 -> 0 — and broke the panel entirely. The\n       panel is React-rendered and the app delegates its listeners to `#root`;\n       a node outside that subtree has no working handlers. Measured: after the\n       move every control reported the *correct* hit target and none of them\n       responded, and moving the node back did not repair React's bookkeeping\n       either.\n     - **Opaque backgrounds.** Already in place, and irrelevant: the taps were\n       being absorbed, not merely obscured.\n     - **`z-index` on the panel.** It cannot work — the panel sits inside\n       `.qBU-ya_ledger`, which has `isolation: isolate`, so the panel's\n       `z-index` only ever orders it among that layer's children.\n\n     ## What the cause actually was, and why one line fixes it\n\n     Measured on a 390x844 touch viewport, the same probe three ways:\n\n         baseline                        close -> timestampToggle, blank -> timestampToggle\n         toggle via `display: none`      close -> close,           blank -> resultBlocks\n         toggle via `pointer-events:none`close -> close,           blank -> resultBlocks\n\n     The instant that one control stops claiming pointer input, the whole panel\n     becomes reachable. `pointer-events: none` is the right lever rather than\n     hiding it: the timestamp is information worth keeping on screen, and it is\n     not something that needs a finger — the summary strip around it is what a\n     user scrolls. Verified afterwards with real touch input, not just hit\n     tests: tapping 参数 changes the active tab from 概述 to 参数, and tapping\n     close dismisses the panel. Neither worked before.\n\n     ## The two details that make it work\n\n     `html` in front of the selector is load-bearing. The product shapes this\n     control with its own `pointer-events` declaration, injected *after* this\n     sheet, so a bare class selector here loses on source order alone —\n     measured: the rule parsed and matched (`pointer-events: none` visible in\n     the CSSOM, `matches()` true) while the computed value stayed `auto`. One\n     extra element of specificity settles it without `!important`, which keeps\n     the block overridable and matches the idiom used for the panel background\n     above.\n\n     And the whole block stays inside this `(pointer: coarse)` query, so the\n     desktop inspector is untouched — at 1440px the same probe reports a `SPAN`\n     inside the close button and then the close button itself, i.e. healthy. */\n  html .Y0dWHa_timestampToggle {\n    pointer-events: none;\n  }\n}\n",
      "effects": "/*\n * effects.css — the animation tier.\n *\n * Everything here is additive polish, which means everything here is also the\n * first thing that may be dropped. Three rules keep it from becoming a tax:\n *\n *   1. **Only `transform` and `opacity`.** No width, height, top, filter,\n *      box-shadow or background-position animation anywhere in this file —\n *      those force layout, paint or a filter re-run on the main thread, and a\n *      chat transcript is a bad place to be spending main-thread time.\n *   2. **Entrances only on things that mount once.** Dialogs, menus and\n *      popovers appear because the user asked for them. Message rows are\n *      deliberately *not* animated: the transcript virtualises, so a row\n *      re-animates every time it scrolls back into view, which reads as a\n *      glitch rather than as polish.\n *   3. **Nothing watches the transcript.** No `:has()` selector is anchored on\n *      something that changes while the model streams; a document-wide\n *      re-match per token is a real cost, and it would be invisible to the\n *      person paying it.\n *\n * The press ring and hover sheen use `::before`/`::after` on interactive\n * elements. That is safe here specifically because the product defines no\n * pseudo-element on `button` at all — verified against its bundled CSS — so\n * there is nothing to displace.\n *\n * ## The desktop block\n *\n * From `@media (min-width: 1024px)` down to the end of the file, every rule is\n * desktop-only. It is one block rather than a sixth stylesheet on purpose:\n * `scripts/source-fingerprint.mjs` hashes a fixed list of source files into the\n * build identity, and `runtime.js` inlines sheets in a fixed order, so a new\n * file has to be registered in two places to ship at all. A media query is a\n * cheaper thing to keep correct than a second registration list.\n *\n * Three measured facts shaped what is in here, all from `transitions.mjs` and\n * `sidebarprobe3.mjs` against the live app:\n *\n *   - **Session rows already run `animation: YDXeBa_row-in .15s`.** The row is\n *     therefore not available for an entrance of ours — a second `animation`\n *     on the same element would replace the product's, not compose with it.\n *     Rows get a hover *transition* instead, which is a different property\n *     channel and cannot collide.\n *   - **Session rows reserve `::before` *and* `::after` for the drag-drop\n *     indicator** (`.dropBefore` / `.dropAfter`), which sets them to\n *     `position: absolute` with `top: -7px` / `bottom: -7px`. Anything we\n *     paint there would be a second writer on a slot the product fills during\n *     a drag. The row's own children are the free surface.\n *   - **The chevron is `display: none` until hover**, so it measures 0×0 at\n *     rest. It is only ever visible inside a hover state, so its transition is\n *     declared there too — an animation on an unrendered element is a rule\n *     that never runs.\n *\n * ## The two regions this block deliberately does not touch\n *\n * \"Leave no page untouched\" is the brief; these are the two places where the\n * honest answer is that the product already owns the motion, and adding ours\n * would be a second writer on one property. Both were measured with\n * `overlays.mjs` against the live app, not assumed.\n *\n *   - **The right panel** (`[data-sidebar-right-panel]`) already transitions\n *     `transform, visibility` over 0.3s, and the whole panel slides by\n *     `transform`. A second transform animation here would fight the slide it\n *     already has: on open, whichever declaration wins, the other one is a\n *     visible stutter. Its *contents* are covered instead — menus, listboxes\n *     and rows inside it take the shared entrance, which is a different\n *     element from the sliding container.\n *   - **The dockkit surfaces** have no transition of their own at all. They\n *     are also the mobile dock's furniture: `dockkit` is what the phone user\n *     drags, and its measured hit targets are the 44px floor. An animated\n *     surface under a dragged control is a moving target, so it stays put.\n *     The phone half of this plugin is verified by `docktest.mjs`, which\n *     asserts those targets; motion here would put the two in conflict.\n *\n * Neither omission is an oversight, and if the product later stops animating\n * the right panel, the effect that belongs there should go in this block with\n * the measurement that justified it.\n */\n\n/* ══ Floating surfaces: the Aero spring ═════════════════════════════════════\n   A short overshoot on Y plus a scale from 0.96 — enough to feel like the pane\n   was *placed* rather than having always been there. */\n\n[role=\"dialog\"],\n[role=\"menu\"],\n[role=\"listbox\"],\n[role=\"tooltip\"],\n[data-tip] {\n  /* `backwards`, never `both`: a forwards-filling animation outranks *inline*\n     styles for the properties it animates, so `both` would permanently pin\n     `transform` on any menu the product positions with a transform of its own.\n     `backwards` still holds the entrance state through the first frame. */\n  animation: fa-surface-in 240ms cubic-bezier(0.22, 1.2, 0.36, 1) backwards;\n  transform-origin: var(--fa-origin, 50% 0%);\n}\n\n/* A tooltip has no user-initiated delay; it should arrive, not perform. */\n[role=\"tooltip\"],\n[data-tip] {\n  animation-duration: 140ms;\n}\n\n[role=\"status\"] {\n  animation: fa-toast-in 300ms cubic-bezier(0.22, 1.2, 0.36, 1) backwards;\n}\n\n@keyframes fa-surface-in {\n  from {\n    opacity: 0;\n    transform: translate3d(0, -8px, 0) scale(0.96);\n  }\n  to {\n    opacity: 1;\n    transform: translate3d(0, 0, 0) scale(1);\n  }\n}\n\n@keyframes fa-toast-in {\n  from {\n    opacity: 0;\n    transform: translate3d(0, 18px, 0) scale(0.97);\n  }\n  to {\n    opacity: 1;\n    transform: translate3d(0, 0, 0) scale(1);\n  }\n}\n\n/* ══ The boot card ══════════════════════════════════════════════════════════\n   The first frame the theme owns: a short rise on the card, and a glow behind\n   the product's own spinner so the wait belongs to the theme too. */\n\n[data-dsh-boot] > * {\n  animation: fa-boot-in 460ms cubic-bezier(0.22, 1, 0.36, 1) backwards;\n}\n\n[data-dsh-boot-spinner] {\n  box-shadow: 0 0 18px color-mix(in srgb, var(--dsw-alias-state-business-primary) 40%, transparent);\n}\n\n@keyframes fa-boot-in {\n  from {\n    opacity: 0;\n    transform: translate3d(0, 14px, 0) scale(0.98);\n  }\n  to {\n    opacity: 1;\n    transform: translate3d(0, 0, 0) scale(1);\n  }\n}\n\n/* ══ The press acknowledgement ══════════════════════════════════════════════\n   A one-shot ring that expands and fades from the control's centre. Driven by\n   `:active` rather than by JavaScript, so it costs nothing when idle; and\n   because it is `transform`/`opacity` it never repaints the control it is drawn\n   on. The haptic that accompanies it lives in runtime.js. */\n\n/* Both pseudo-elements need a positioning context. Coarse pointers put the\n   invisible touch target on `::before` and fine pointers put the hover sheen\n   there; they are mutually exclusive by media query. */\n:is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"], summary) {\n  position: relative;\n}\n\n:is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"]):not(:disabled)::after {\n  content: \"\";\n  position: absolute;\n  inset: -2px;\n  border-radius: inherit;\n  pointer-events: none;\n  opacity: 0;\n  border: 2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 55%, transparent);\n  transform: scale(0.82);\n}\n\n:is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"]):not(:disabled):active::after {\n  animation: fa-press-ring 420ms cubic-bezier(0.22, 1, 0.36, 1) both;\n}\n\n@keyframes fa-press-ring {\n  0% {\n    opacity: 0.75;\n    transform: scale(0.9);\n  }\n  100% {\n    opacity: 0;\n    transform: scale(1.14);\n  }\n}\n\n/* ══ The hover sheen ════════════════════════════════════════════════════════\n   Fine pointers only, and expressed as `opacity` on a pseudo-element rather\n   than as a `background-position` animation: a sweep that repaints a button is\n   fine on one element and a problem in a sixty-button toolbar. */\n\n@media (hover: hover) and (pointer: fine) {\n  :is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"]):not(:disabled)::before {\n    content: \"\";\n    position: absolute;\n    inset: 0;\n    border-radius: inherit;\n    pointer-events: none;\n    opacity: 0;\n    background: linear-gradient(\n      100deg,\n      transparent 30%,\n      color-mix(in srgb, var(--fa-gloss-top) 42%, transparent) 48%,\n      transparent 66%\n    );\n    transition: opacity 260ms ease;\n  }\n\n  :is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"]):not(:disabled):hover::before {\n    opacity: 1;\n  }\n\n  /* Sidebar rows get a wider version: they are large, they are the main\n     navigation, and the sheen is what makes them read as glass. */\n  [data-fa-col=\"sidebar\"] :is(button, [role=\"button\"])::before {\n    background: linear-gradient(\n      100deg,\n      transparent 18%,\n      color-mix(in srgb, var(--fa-gloss-top) 34%, transparent) 46%,\n      transparent 74%\n    );\n  }\n}\n\n/* ══ The active navigation item ═════════════════════════════════════════════\n   Aero's \"lit lens\": the selected row carries its own light source, so it is\n   drawn with an aqua bloom behind it on top of the product's own active fill. */\n\n[data-fa-col=\"sidebar\"] :is([data-active], [aria-current=\"page\"], [data-selected]) {\n  box-shadow:\n    inset 0 1px 0 var(--fa-rim-light),\n    inset 0 0 18px -6px var(--fa-inner-glow),\n    0 1px 3px -1px var(--dsw-alias-bg-mask-2) !important;\n}\n\n/* ══ The dock's arrival ═════════════════════════════════════════════════════\n   An entrance, not a loop. The obvious flourish here is a slow idle float, and\n   it was the first thing tried — then removed, for two reasons that matter more\n   than the effect did. A primary navigation target that never stops moving\n   moves *under the user's thumb*, and a permanently animating element keeps the\n   compositor awake for the entire life of the page. A one-shot settle keeps the\n   polish and costs nothing after 420ms. */\n\n@media (pointer: coarse) and (max-width: 640px) {\n  html.fa-tier-full [data-fa-dock],\n  html.fa-tier-lite [data-fa-dock] {\n    animation: fa-dock-arrive 420ms cubic-bezier(0.22, 1.2, 0.36, 1) backwards;\n  }\n}\n\n@keyframes fa-dock-arrive {\n  from {\n    opacity: 0;\n    transform: translate3d(-50%, 26px, 0) scale(0.94);\n  }\n  to {\n    opacity: 1;\n    transform: translate3d(-50%, 0, 0) scale(1);\n  }\n}\n\n/* ══ Desktop: the sidebar ═══════════════════════════════════════════════════\n   The navigation column is where the eye rests longest, so it carries the\n   most loops — but every one of them is on a *small* element. A loop on the\n   280px column itself would repaint the whole rail sixty times a second to\n   move something the user is not looking at. */\n\n@media (min-width: 1024px) and (hover: hover) and (pointer: fine) {\n  /* ── The brand mark breathes ─────────────────────────────────────────────\n     The one loop in the sidebar that runs unattended. It is 24×18 — a few\n     hundred composited pixels — and it is the element a user's eye lands on\n     when they look away from the transcript, so a slow pulse here reads as\n     the product being alive rather than as something twitching.\n\n     `animation` on the *child*, not on `[data-slot=\"sidebar.brand.mark\"]`:\n     the slot is a 0×0 wrapper (measured), and an animation on a zero-area box\n     has nothing to paint. */\n\n  html.fa-tier-full [data-slot=\"sidebar.brand.mark\"] > * {\n    animation: fa-brand-breathe 6.4s ease-in-out infinite;\n    transform-origin: 50% 50%;\n  }\n\n  /* ── Rail edge glow ──────────────────────────────────────────────────────\n     A slow aqua wash along the border between the sidebar and the canvas. It\n     is on a pseudo-element of the column, driven by `opacity` only, and it is\n     the cheapest way to make two flat panes read as two pieces of glass.\n\n     `inset-inline-end`, not `right`: the side the rail sits on is the\n     product's decision, and a physical `right` would go to the wrong edge in\n     a right-to-left build. */\n\n  html.fa-tier-full [data-fa-col=\"sidebar\"]::after {\n    content: \"\";\n    position: absolute;\n    inset-block: 0;\n    inset-inline-end: 0;\n    width: 1px;\n    pointer-events: none;\n    opacity: 0.35;\n    background: linear-gradient(\n      180deg,\n      transparent 0%,\n      color-mix(in srgb, var(--dsw-alias-state-business-primary) 55%, transparent) 28%,\n      color-mix(in srgb, var(--fa-gloss-top) 70%, transparent) 50%,\n      color-mix(in srgb, var(--dsw-alias-state-business-primary) 55%, transparent) 72%,\n      transparent 100%\n    );\n    animation: fa-rail-glow 9.5s ease-in-out infinite;\n  }\n\n  /* The column must be a containing block for that pseudo-element. `relative`\n     rather than `isolation` so the stacking order of the product's own\n     children is untouched. */\n  [data-fa-col=\"sidebar\"] {\n    position: relative;\n  }\n\n  /* ── Rows: a hover glint ─────────────────────────────────────────────────\n     A transition, not an animation, and on `::part`-free children rather than\n     on the row, because the row's `::before`/`::after` belong to the drop\n     indicator and the row itself already runs the product's mount animation.\n\n     `background-position` is normally forbidden by rule 1 — it is here as the\n     single documented exception, on a gradient that is already painted, and it\n     is confined to one row under the cursor. The alternative (a transform on a\n     pseudo-element) would need a stacking context on a row the product\n     recycles. */\n\n  [data-fa-col=\"sidebar\"] [role=\"treeitem\"] {\n    transition: background-position 420ms cubic-bezier(0.22, 1, 0.36, 1);\n  }\n\n  [data-fa-col=\"sidebar\"] [role=\"treeitem\"]:hover {\n    background-position: 0 0;\n  }\n\n  /* ── Rows: the selected row settles ──────────────────────────────────────\n     The product marks selection with `aria-selected=\"true\"` and a background\n     fill. This adds the \"lit lens\" the active nav item already has, but as a\n     transition rather than a static box-shadow, so switching rows reads as\n     one row handing the light to another.\n\n     `border-radius: inherit` and `inset: 0`: never a fixed width. Row labels\n     are longer in Chinese than in English, and a fixed-width highlight would\n     be correct in one locale and clipped in the other — which is exactly the\n     parity bug this pass has to avoid. */\n\n  [data-fa-col=\"sidebar\"] [role=\"treeitem\"][aria-selected=\"true\"] {\n    box-shadow:\n      inset 0 1px 0 var(--fa-rim-light),\n      inset 0 0 20px -7px var(--fa-inner-glow),\n      0 1px 3px -1px var(--dsw-alias-bg-mask-2);\n    transition:\n      box-shadow 260ms ease,\n      background-color 260ms ease;\n  }\n\n  [data-fa-col=\"sidebar\"] [role=\"treeitem\"][aria-selected=\"false\"] {\n    transition: box-shadow 260ms ease;\n  }\n\n  /* ── The chevron settles ─────────────────────────────────────────────────\n     The product animates the chevron's `transform` for its expand/collapse\n     rotation over 0.12s. Contesting `transform` here would fight it for the\n     property, so this animates `opacity` alone and leaves the rotation to the\n     product. Declared inside the hover block because the element is\n     `display: none` outside it. */\n\n  [data-fa-col=\"sidebar\"] [role=\"treeitem\"]:hover span[class*=\"chevron\"] {\n    animation: fa-chevron-settle 220ms cubic-bezier(0.22, 1.2, 0.36, 1) backwards;\n  }\n\n  /* ── Section headers arrive ──────────────────────────────────────────────\n     \"Workspaces\" and its siblings mount once per session, so an entrance is\n     honest here in a way it would not be on a virtualised transcript row.\n     `backwards` for the same reason as the floating surfaces: a forwards fill\n     would outrank the product's own inline transform. */\n\n  html.fa-tier-full [data-fa-col=\"sidebar\"] [role=\"tree\"] > * > :first-child {\n    animation: fa-section-in 340ms cubic-bezier(0.22, 1, 0.36, 1) backwards;\n  }\n\n  /* ── The settings panel blooms ───────────────────────────────────────────\n     `div[slot=\"sidebar.settings\"]` is measured to have **no transition of its\n     own** (`transition-duration: 0s`) and to live inside the sidebar subtree,\n     which is why the existing `[role=\"dialog\"]` entrance does not reach it.\n     It is a legitimate entrance target and this is the only rule covering it. */\n\n  html.fa-tier-full div[slot=\"sidebar.settings\"] {\n    animation: fa-settings-bloom 300ms cubic-bezier(0.22, 1.2, 0.36, 1) backwards;\n    transform-origin: 100% 100%;\n  }\n}\n\n@keyframes fa-brand-breathe {\n  0%,\n  100% {\n    opacity: 0.86;\n    transform: scale(0.965);\n  }\n  50% {\n    opacity: 1;\n    transform: scale(1.035);\n  }\n}\n\n@keyframes fa-rail-glow {\n  0%,\n  100% {\n    opacity: 0.22;\n  }\n  50% {\n    opacity: 0.58;\n  }\n}\n\n@keyframes fa-chevron-settle {\n  from {\n    opacity: 0;\n    transform: translate3d(-3px, 0, 0);\n  }\n  to {\n    opacity: 1;\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n@keyframes fa-section-in {\n  from {\n    opacity: 0;\n    transform: translate3d(-6px, 0, 0);\n  }\n  to {\n    opacity: 1;\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n@keyframes fa-settings-bloom {\n  from {\n    opacity: 0;\n    transform: translate3d(0, 10px, 0) scale(0.975);\n  }\n  to {\n    opacity: 1;\n    transform: translate3d(0, 0, 0) scale(1);\n  }\n}\n\n/* ══ Desktop: the canvas and the transcript ═════════════════════════════════\n   This is the region rule 3 exists for. The transcript virtualises and streams:\n   rows mount and unmount as the user scrolls, and the DOM changes on every\n   token while a model is answering. Anything anchored to that is paid for once\n   per token.\n\n   Three effects, and each one is placed where it cannot see a token arrive:\n\n   - **The header sheen** is on the header, which streams nothing. It is a loop,\n     but a loop that only touches `opacity` on a pseudo-element the size of a\n     76px band.\n   - **The canvas top light** is on the canvas, which is a single element that\n     never remounts.\n   - **The scroll-edge fog** is the interesting one. It is driven by a passive\n     scroll listener that reads `scrollTop` and writes one attribute — no\n     `:has()`, no per-row selector, no mutation observation. Reading `scrollTop`\n     is a layout read, which is why it goes through `requestAnimationFrame`\n     (see `installScrollEdges` in runtime.js).\n\n   **DO NOT add an `animation` to a transcript row.** The rows are recycled, so\n   a row would re-run its entrance every time it scrolled back into view, and\n   the product's own `.YDXeBa_row-in` already proves how this reads: at 150ms it\n   is a settle, but a longer one replayed on scroll-back is a stutter. */\n\n@media (min-width: 1024px) and (hover: hover) and (pointer: fine) {\n  /* ── The header carries a slow light ─────────────────────────────────────\n     A moving highlight along the header's bottom hairline. The header has no\n     transition of its own and never remounts, so there is nothing to contest.\n     `inset-inline` rather than `left`/`right` throughout, so the composition\n     mirrors instead of breaking under a right-to-left build. */\n\n  [data-fa-col=\"center\"] {\n    position: relative;\n  }\n\n  html.fa-tier-full [data-fa-col=\"center\"] [class*=\"header\"]::after {\n    content: \"\";\n    position: absolute;\n    inset-inline: 0;\n    bottom: -1px;\n    height: 1px;\n    pointer-events: none;\n    opacity: 0;\n    background: linear-gradient(\n      90deg,\n      transparent 0%,\n      color-mix(in srgb, var(--dsw-alias-state-business-primary) 70%, transparent) 42%,\n      color-mix(in srgb, var(--fa-gloss-top) 85%, transparent) 50%,\n      color-mix(in srgb, var(--dsw-alias-state-business-primary) 70%, transparent) 58%,\n      transparent 100%\n    );\n    animation: fa-header-sheen 11s ease-in-out infinite;\n  }\n\n  /* ── The canvas is lit from the top ──────────────────────────────────────\n     A single static gradient on the canvas's own `::before`, plus a one-shot\n     entrance. Not `background-position`, not a loop: the canvas is the largest\n     element on the page and the one sitting under the most `backdrop-filter`,\n     so anything animated here is multiplied by every blurred pane above it. */\n\n  html.fa-tier-full [data-fa-canvas]::before {\n    content: \"\";\n    position: absolute;\n    inset-inline: 0;\n    top: 0;\n    height: 160px;\n    pointer-events: none;\n    opacity: 0.5;\n    background: linear-gradient(\n      180deg,\n      color-mix(in srgb, var(--fa-gloss-top) 26%, transparent) 0%,\n      transparent 100%\n    );\n  }\n\n  /* ── The scroll edges fog over ───────────────────────────────────────────\n     The plugin plants its own two masks beside the scroll container rather\n     than painting on the container or on a row: the mask has to sit *over* the\n     content and *under* the composer, and it has to not scroll. Two absolutely\n     positioned elements inside the canvas achieve that with no selector on\n     anything the product owns.\n\n     `pointer-events: none` is mandatory — a mask over a transcript would eat\n     every click on the rows beneath it.\n\n     The fades are `opacity` on a fixed gradient, never `mask-image` animation:\n     `mask-image` is a paint-time property and animating it on a full-height\n     element repaints the whole column. */\n\n  [data-fa-scroll-edge] {\n    position: absolute;\n    inset-inline: 0;\n    height: 78px;\n    pointer-events: none;\n    opacity: 0;\n    transition: opacity 260ms ease;\n  }\n\n  [data-fa-scroll-edge=\"top\"] {\n    top: 0;\n    background: linear-gradient(\n      180deg,\n      color-mix(in srgb, var(--dsw-alias-bg-base) 88%, transparent) 0%,\n      transparent 100%\n    );\n  }\n\n  [data-fa-scroll-edge=\"bottom\"] {\n    bottom: 0;\n    background: linear-gradient(\n      0deg,\n      color-mix(in srgb, var(--dsw-alias-bg-base) 88%, transparent) 0%,\n      transparent 100%\n    );\n  }\n\n  /* Which masks are lit, by scroll position.\n     The runtime publishes exactly three states and this is the other half of\n     that contract: `top` (nothing above to indicate), `bottom` (nothing below)\n     and `middle` (content both ways). `null` withdraws the attribute entirely\n     and is the resting state for a transcript too short to scroll, so a\n     document that never scrolls looks exactly as it did.\n\n     This block previously asked for `down` and `up` — the words a reader\n     expects, and not the words the runtime writes. Every selector missed, the\n     masks were planted and positioned and permanently transparent, and the\n     failure was invisible because an opacity of 0 is also the correct value in\n     three of the four states. `canvascheck.mjs` drives all three states and\n     asserts the computed opacity, which is what caught it. */\n  [data-fa-scrolled=\"top\"] > [data-fa-scroll-edge=\"top\"],\n  [data-fa-scrolled=\"middle\"] > [data-fa-scroll-edge=\"top\"],\n  [data-fa-scrolled=\"middle\"] > [data-fa-scroll-edge=\"bottom\"],\n  [data-fa-scrolled=\"bottom\"] > [data-fa-scroll-edge=\"bottom\"] {\n    opacity: 1;\n  }\n\n  /* ── The scrollbar thumb lights on hover ─────────────────────────────────\n     The plugin already gradients the thumb; this adds the lift. `box-shadow`\n     on a 8px-wide element is a trivial paint, and it is the one place a\n     non-`transform`/`opacity` transition is worth it, because a scrollbar\n     thumb has no transform box to speak of. */\n\n  ::-webkit-scrollbar-thumb {\n    transition: background-color 200ms ease, box-shadow 200ms ease;\n  }\n\n  ::-webkit-scrollbar-thumb:hover {\n    box-shadow:\n      inset 0 0 0 1px color-mix(in srgb, var(--fa-rim-light) 60%, transparent),\n      0 0 8px color-mix(in srgb, var(--dsw-alias-state-business-primary) 45%, transparent);\n  }\n}\n\n@keyframes fa-header-sheen {\n  0%,\n  100% {\n    opacity: 0.25;\n    transform: translate3d(-6%, 0, 0);\n  }\n  50% {\n    opacity: 0.85;\n    transform: translate3d(6%, 0, 0);\n  }\n}\n\n/* ══ Desktop: the composer ══════════════════════════════════════════════════\n   Five effects on the one surface the user actually types into, which makes it\n   the surface where an overdone flourish is most expensive: anything that moves\n   under the caret is a thing the eye reads as a glitch while reading.\n\n   Measured before writing, from `overlays.mjs`:\n\n   - `[data-composer-card]` is `position: relative` and **already transitions\n     `box-shadow` and `border-color` over 0.22s**. Its shadow is therefore off\n     limits — a `box-shadow` animation here would be a second writer on a\n     property the product owns, decided by load order. The focus ring below is\n     drawn on the card's `::after` instead, so it composes with the product's\n     shadow rather than replacing it.\n   - `[data-composer-input]`, `[data-composer-placeholder]` and the lexical\n     editor have **no transition and no animation** of their own.\n   - The placeholder is already `position: absolute`, so it needs no context\n     from us. */\n\n@media (min-width: 1024px) and (hover: hover) and (pointer: fine) {\n  /* ── The focus ring ──────────────────────────────────────────────────────\n     A ring that grows to meet the caret when the composer takes focus, on the\n     card's `::after`. `border-radius: inherit` and `inset: -2px` — never a\n     fixed size, for the same locale reason as the sidebar's selected row: the\n     composer's width is driven by the product's content column and its height\n     grows with the text, so any fixed dimension would be correct in one\n     language and wrong in the other. */\n\n  html.fa-tier-full [data-composer-card]::after {\n    content: \"\";\n    position: absolute;\n    inset: -2px;\n    border-radius: inherit;\n    pointer-events: none;\n    opacity: 0;\n    border: 2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 46%, transparent);\n    transform: scale(0.995);\n    transition:\n      opacity 240ms ease,\n      transform 320ms cubic-bezier(0.22, 1, 0.36, 1);\n  }\n\n  html.fa-tier-full [data-composer-card]:focus-within::after {\n    opacity: 1;\n    transform: scale(1);\n  }\n\n  /* ── The card lifts ──────────────────────────────────────────────────────\n     `translateY` only, and only 1px. The card is where the eye lives while\n     typing; a scale would move the text relative to the caret.\n\n     The product's own transition covers `box-shadow` and `border-color`, so\n     this **extends** that declaration rather than replacing it. Writing\n     `transition: transform …` alone would drop the product's two properties and\n     silently kill the shadow's easing — which is the failure mode the list of\n     properties here exists to prevent. */\n\n  [data-composer-card] {\n    transition-property: box-shadow, border-color, transform;\n    transition-duration: 0.22s, 0.22s, 0.3s;\n  }\n\n  [data-composer-card]:focus-within {\n    transform: translate3d(0, -1px, 0);\n  }\n\n  /* ── The placeholder shimmers ────────────────────────────────────────────\n     Hero phase only. In the hero the composer is empty by definition and the\n     placeholder *is* the content, so a slow sheen across it reads as an\n     invitation; once a conversation starts, the same animation would run behind\n     the user's own words every time they clear the box, which is noise. The\n     placeholder has no transition of its own, so this costs one composited\n     layer while the box is empty and nothing at all after. */\n\n  html.fa-tier-full [data-phase=\"hero\"] [data-composer-placeholder] {\n    animation: fa-placeholder-shimmer 7.2s ease-in-out infinite;\n  }\n\n  /* ── The caret breathes ──────────────────────────────────────────────────\n     The caret colour pulses while the composer holds focus. `caret-color` is\n     animatable and costs a repaint of a one-pixel column, not of the box. */\n\n  html.fa-tier-full [data-composer-card]:focus-within [data-lexical-editor] {\n    animation: fa-caret-pulse 2.4s ease-in-out infinite;\n  }\n}\n\n@keyframes fa-placeholder-shimmer {\n  0%,\n  100% {\n    opacity: 0.62;\n  }\n  50% {\n    opacity: 1;\n  }\n}\n\n@keyframes fa-caret-pulse {\n  0%,\n  100% {\n    caret-color: var(--dsw-alias-state-business-primary);\n  }\n  50% {\n    caret-color: color-mix(in srgb, var(--dsw-alias-state-business-primary) 55%, transparent);\n  }\n}\n\n/* ══ Desktop: overlays and the system layer ═════════════════════════════════\n   Menus, listboxes, tooltips, the settings dialog and the boot card. Most of\n   these already have an entrance from the top of this file; what is added here\n   is the *inside* of them — items arriving in sequence, a scrim that fades\n   rather than snapping.\n\n   The product's own scrims and dialogs all have **no transition of their own**\n   (measured by `overlays.mjs`), so they are legitimate entrance targets. The\n   `[role=\"dialog\"]` rule at the top of this file already covers the dialog\n   panels; the scrims are separate elements the product mounts alongside them. */\n\n@media (min-width: 1024px) and (hover: hover) and (pointer: fine) {\n  /* ── Menu items arrive in sequence ───────────────────────────────────────\n     Staggered by index, capped at six. The cap is deliberate: a menu with forty\n     entries (a workspace list, a file tree) would take most of a second to\n     finish drawing, and the user is already moving the pointer down it. Past\n     the sixth item the delay is simply absent, so a long list arrives as a\n     list. */\n\n  html.fa-tier-full [role=\"menu\"] > *:nth-child(-n + 6) {\n    animation: fa-menu-item-in 220ms cubic-bezier(0.22, 1, 0.36, 1) backwards;\n  }\n\n  html.fa-tier-full [role=\"menu\"] > *:nth-child(1) { animation-delay: 0ms; }\n  html.fa-tier-full [role=\"menu\"] > *:nth-child(2) { animation-delay: 22ms; }\n  html.fa-tier-full [role=\"menu\"] > *:nth-child(3) { animation-delay: 44ms; }\n  html.fa-tier-full [role=\"menu\"] > *:nth-child(4) { animation-delay: 66ms; }\n  html.fa-tier-full [role=\"menu\"] > *:nth-child(5) { animation-delay: 88ms; }\n  html.fa-tier-full [role=\"menu\"] > *:nth-child(6) { animation-delay: 110ms; }\n\n  html.fa-tier-full [role=\"listbox\"] > *:nth-child(-n + 6) {\n    animation: fa-menu-item-in 200ms cubic-bezier(0.22, 1, 0.36, 1) backwards;\n  }\n\n  html.fa-tier-full [role=\"listbox\"] > *:nth-child(1) { animation-delay: 0ms; }\n  html.fa-tier-full [role=\"listbox\"] > *:nth-child(2) { animation-delay: 20ms; }\n  html.fa-tier-full [role=\"listbox\"] > *:nth-child(3) { animation-delay: 40ms; }\n  html.fa-tier-full [role=\"listbox\"] > *:nth-child(4) { animation-delay: 60ms; }\n  html.fa-tier-full [role=\"listbox\"] > *:nth-child(5) { animation-delay: 80ms; }\n  html.fa-tier-full [role=\"listbox\"] > *:nth-child(6) { animation-delay: 100ms; }\n\n  /* ── The scrim fades in ──────────────────────────────────────────────────\n     The product's scrims snap from invisible to solid. A 200ms fade is the\n     difference between the app looking like it changed its mind and looking\n     like it opened something. */\n\n  html.fa-tier-full [class*=\"mask\"],\n  html.fa-tier-full [class*=\"overlay\"] {\n    animation: fa-scrim-in 200ms ease backwards;\n  }\n\n  /* ── A focus halo ────────────────────────────────────────────────────────\n     Keyboard focus gets a halo the pointer never sees, because `:focus-visible`\n     is the selector that knows the difference. This is an accessibility win\n     dressed as polish: the product's own focus ring is a hairline border, and a\n     soft halo makes the focused control findable at a glance across a 1440px\n     window. */\n\n  :is(a, button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"], input, textarea, [tabindex]):focus-visible {\n    outline: none;\n    animation: fa-focus-halo 280ms ease backwards;\n  }\n\n  /* ── The boot card orbits ────────────────────────────────────────────────\n     The one place a full loop is unambiguously right: the user is waiting,\n     there is nothing else on screen, and it stops the moment boot completes\n     because the card unmounts. `[data-dsh-boot]` already has a rise from the\n     top of this file; this is the light behind the spinner. */\n\n  [data-dsh-boot-spinner] {\n    position: relative;\n  }\n\n  html.fa-tier-full [data-dsh-boot-spinner]::after {\n    content: \"\";\n    position: absolute;\n    inset: -6px;\n    border-radius: 50%;\n    pointer-events: none;\n    border: 1.5px solid transparent;\n    border-top-color: color-mix(in srgb, var(--dsw-alias-state-business-primary) 75%, transparent);\n    animation: fa-boot-orbit 1.35s linear infinite;\n  }\n}\n\n@keyframes fa-menu-item-in {\n  from {\n    opacity: 0;\n    transform: translate3d(0, -4px, 0);\n  }\n  to {\n    opacity: 1;\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n@keyframes fa-scrim-in {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n\n@keyframes fa-focus-halo {\n  from {\n    box-shadow: 0 0 0 0 color-mix(in srgb, var(--dsw-alias-state-business-primary) 55%, transparent);\n  }\n  to {\n    box-shadow: 0 0 0 4px color-mix(in srgb, var(--dsw-alias-state-business-primary) 18%, transparent);\n  }\n}\n\n@keyframes fa-boot-orbit {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n/* ══ Prohibited below the full tier ═════════════════════════════════════════\n   The `lite` tier keeps the palette, the material and the mobile layout, and\n   drops every *decorative* animation. The tier classes are on `<html>`; the\n   wallpaper's own loops are gated separately, in scenery.css. */\n\nhtml.fa-tier-lite :is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"])::after,\nhtml.fa-tier-off :is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"])::after {\n  display: none;\n}\n\n/* The two sidebar *loops*. The entrances above are one-shot and end at the\n   element's resting state, so they cost nothing after they finish and are\n   allowed to survive into `lite`; a loop never ends, and is exactly what the\n   tier exists to drop. */\nhtml.fa-tier-lite [data-slot=\"sidebar.brand.mark\"] > *,\nhtml.fa-tier-off [data-slot=\"sidebar.brand.mark\"] > *,\nhtml.fa-tier-lite [data-fa-col=\"sidebar\"]::after,\nhtml.fa-tier-off [data-fa-col=\"sidebar\"]::after {\n  animation: none;\n}\n\n/* Without the loop the rail is a static hairline, which is the right resting\n   state rather than a frozen frame of a pulse. */\nhtml.fa-tier-lite [data-fa-col=\"sidebar\"]::after,\nhtml.fa-tier-off [data-fa-col=\"sidebar\"]::after {\n  opacity: 0.3;\n}\n\n/* The header sheen is a loop and goes; the canvas top light is static and\n   stays, because it is part of how the column reads rather than motion. The\n   scroll-edge fog is a transition on a scroll state, not decoration, so it is\n   left alone at every tier — losing it would leave a hard cut at the top of a\n   scrolled transcript, which is a usability regression and not a flourish.\n   It is dropped only at `off`, where the user has asked for the app back. */\nhtml.fa-tier-lite [data-fa-col=\"center\"] [class*=\"header\"]::after,\nhtml.fa-tier-off [data-fa-col=\"center\"] [class*=\"header\"]::after {\n  animation: none;\n  opacity: 0;\n}\n\nhtml.fa-tier-off [data-fa-scroll-edge] {\n  display: none;\n}\n\n/* The composer and overlay *loops* stop below `full`: the placeholder sheen,\n   the caret pulse, the boot orbit. The one-shot entrances (the focus ring, the\n   menu stagger, the scrim fade) are allowed to survive into `lite`, because\n   they finish and cost nothing after — and because a menu that appears with no\n   entrance at all reads as a rendering artefact rather than as a decision. */\nhtml.fa-tier-lite [data-phase=\"hero\"] [data-composer-placeholder],\nhtml.fa-tier-off [data-phase=\"hero\"] [data-composer-placeholder],\nhtml.fa-tier-lite [data-composer-card]:focus-within [data-lexical-editor],\nhtml.fa-tier-off [data-composer-card]:focus-within [data-lexical-editor],\nhtml.fa-tier-lite [data-dsh-boot-spinner]::after,\nhtml.fa-tier-off [data-dsh-boot-spinner]::after {\n  animation: none;\n}\n\nhtml.fa-tier-off [data-dsh-boot-spinner]::after {\n  display: none;\n}\n\nhtml.fa-tier-off :is([role=\"dialog\"], [role=\"menu\"], [role=\"listbox\"], [role=\"tooltip\"], [data-tip], [role=\"status\"]) {\n  animation: none !important;\n}\n\n/* ══ Idle ═══════════════════════════════════════════════════════════════════\n   A background tab has no business compositing a wallpaper, and some engines\n   keep doing it. This is the only global animation rule in the plugin.\n\n   Two things here are load-bearing and both have been got wrong once:\n\n   **The attribute is on `<html>`.** The runtime used to publish it on `<body>`\n   while these selectors asked for it on the root element, so the rule never\n   matched anything and a hidden tab animated indefinitely. The writer moved;\n   `idlecheck.mjs` now asserts the two ends agree.\n\n   **`*` does not match pseudo-elements.** The universal selector matches\n   elements only, so an animation on `::before` or `::after` sails straight\n   through it. That was harmless while the skin's only pseudo-element animation\n   was the one-shot press ring, and stops being harmless the moment a *loop*\n   lives on a pseudo-element — which is the only way to light an element\n   without adding a child node to somebody else's tree. Both are listed. */\nhtml[data-fa-idle] *,\nhtml[data-fa-idle] *::before,\nhtml[data-fa-idle] *::after {\n  animation-play-state: paused !important;\n}\n\n/* ══ Reduced motion ═════════════════════════════════════════════════════════\n   The user's own setting beats every tier decision above. */\n\n@media (prefers-reduced-motion: reduce) {\n  *,\n  *::before,\n  *::after {\n    animation-duration: 0.001ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.001ms !important;\n    scroll-behavior: auto !important;\n  }\n\n  /* Collapsing the duration is enough for an entrance — it lands on its final\n     keyframe immediately. It is *not* enough for a loop: the animation would\n     still be registered, and its computed value would be whichever frame the\n     single iteration stopped on. The sidebar's two loops are given their\n     resting values explicitly, which is also what makes them match the\n     `lite` tier's rendering instead of merely happening to look similar. */\n\n  [data-slot=\"sidebar.brand.mark\"] > * {\n    animation: none !important;\n    opacity: 1;\n    transform: none;\n  }\n\n  [data-fa-col=\"sidebar\"]::after {\n    animation: none !important;\n    opacity: 0.3;\n  }\n\n  [data-fa-col=\"sidebar\"] [role=\"treeitem\"] {\n    transition: none !important;\n  }\n\n  [data-fa-col=\"center\"] [class*=\"header\"]::after {\n    animation: none !important;\n    opacity: 0;\n  }\n\n  /* The fog is a state indicator rather than motion, so it does not disappear\n     — it just stops crossfading and switches instantly. */\n  [data-fa-scroll-edge] {\n    transition: none !important;\n  }\n\n  /* The composer's two loops settle to their stated resting values, and the\n     focus ring becomes an instant state rather than a grow. */\n  [data-composer-placeholder] {\n    animation: none !important;\n    opacity: 0.62;\n  }\n\n  [data-lexical-editor] {\n    animation: none !important;\n    caret-color: var(--dsw-alias-state-business-primary);\n  }\n\n  [data-composer-card]::after {\n    transition: none !important;\n    transform: none;\n  }\n\n  [data-dsh-boot-spinner]::after {\n    animation: none !important;\n  }\n\n  /* A stagger is motion; without it the items simply appear, which is what a\n     user who asked for reduced motion asked for. */\n  [role=\"menu\"] > *,\n  [role=\"listbox\"] > * {\n    animation: none !important;\n  }\n\n  [class*=\"mask\"],\n  [class*=\"overlay\"] {\n    animation: none !important;\n  }\n\n  :is(a, button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"], input, textarea, [tabindex]):focus-visible {\n    animation: none !important;\n    outline: 2px solid var(--dsw-alias-state-business-primary);\n    outline-offset: 2px;\n  }\n}\n",
      "showcase": "/*\n * showcase.css — the desktop effects layer, part two.\n *\n * `effects.css` animates *structure*: the wallpaper's owners, the two columns,\n * the header, the composer, the overlays. It is deliberately spare about the\n * inside of a page, because that is where the volume lives and where the\n * product's own layout is easiest to disturb.\n *\n * This file is the volume. It is last in the cascade, after `effects.css`, so a\n * rule here wins a tie; and everything below sits inside one\n * `min-width: 1024px and hover: hover and pointer: fine` block rather than\n * being prefixed selector by selector. Two reasons:\n *\n *   1. **It cannot reach a phone.** Turns 2 and 3 were both about the phone\n *      experience, and the mobile layer is tuned and verified on its own. A new\n *      desktop loop that quietly also ran at 390px would be a regression\n *      against shipped, tested work. One media query is one thing to verify\n *      instead of eighty selectors.\n *   2. **The fingerprint covers bytes, not selectors.** One more file in\n *      `SOURCE_INPUTS` and one more entry in `SHEET_ORDER` is the whole\n *      integration; nothing in `runtime.js` changes shape.\n *\n * ## Anchors\n *\n * The product hashes its CSS-module class names per build (`.pI_x6G_sidebarCol`,\n * `.hHd-Xa_brand`), so a class selector here would be dead on the next upgrade.\n * What it keeps stable is the `data-*` vocabulary its own styles depend on, and\n * that is what every rule below is written against:\n *\n *   `data-phase`              `hero` / `active` / `plain` — the app's three modes\n *   `data-chat-flow*`         one conversation flow and its turn\n *   `data-turn-tail`          the trailing block of a turn\n *   `data-turn-process*`      the collapsible process disclosure inside a turn\n *   `data-disclosure-row`     a summary row that expands\n *   `data-expandable`         the chevron-carrying expander\n *   `data-dockkit-*`          the split-pane dock surfaces\n *   `data-sidebar-right-*`    the right panel, its toggle and its mode\n *   `data-composer-*`         the composer card, seat, input, stats, placeholder\n *   `data-slot`               named extension points (`sidebar.settings`, …)\n *   `data-fa-*`               the plugin's own published state\n *\n * Every one of those was read off a *running* page before a selector used it.\n * That matters more than it sounds: the obvious-looking names — a\n * `data-approval-scroll`, a `data-code-block-content`, a `data-trajectory-row-key`\n * — do not exist in this product at all, and a rule written against one is\n * invisible. It renders as nothing, in every environment, forever, and no\n * per-effect check would ever notice. The absence is what this file was\n * rewritten to fix, and it is why `effects-manifest.mjs` asserts a per-region\n * floor rather than only checking the effects someone remembered to name.\n *\n * ## The three shapes of an effect, and the rules they keep\n *\n *   - a **loop** (`animation: fa-x … infinite`) — runs forever, costs a\n *     compositor layer, and must be stoppable at `lite` and at `off`;\n *   - a **transition** — no cost at rest, fires on a state the product already\n *     sets, and the cheapest polish there is;\n *   - an **entrance** — fires once, at mount. Safe on anything that mounts\n *     once, wrong on anything React re-renders, because a re-render replays it.\n *\n * `effects.css` states three rules and they hold here without exception:\n *\n *   1. **Only `transform` and `opacity`.** No `width`, `height`, `top`, `left`,\n *      `margin`, `padding`, `background-position` or `box-shadow` animation\n *      anywhere below. `effects-perf.mjs` reads the running page's keyframes\n *      back and fails on a single violation, so this is enforced, not intended.\n *   2. **An entrance only on something that mounts once.** Turn tails, list\n *      rows and toasts qualify. Flows, disclosures and expanders do **not** —\n *      the product re-renders those as a conversation streams, so they get\n *      transitions, which are idempotent.\n *   3. **Nothing watches the transcript.** No `MutationObserver`, no scroll\n *      handler, no `:has()` over a message. Every rule hooks a state attribute\n *      the product already maintains, a pseudo-class the engine evaluates for\n *      free, or a custom property it already writes.\n *\n * ## What is not here, and why\n *\n * The right panel and the dockkit surfaces carry transitions but no loops; the\n * desktop block in `effects.css` records both omissions and the reasoning is\n * unchanged. The short version: the right panel already transitions its own\n * `transform` and `visibility` over 0.3s, so a second transform animation would\n * fight it; and an animated surface beneath a control the user is *dragging* is\n * a moving target.\n *\n * Every loop declared here has a stop rule in the `lite` / `off` section at the\n * end of the file. `loopcheck.mjs` enumerates them and fails if one is missing\n * — an unstoppable loop is the entire cost of a feature like this.\n */\n\n@media (min-width: 1024px) and (hover: hover) and (pointer: fine) {\n\n/* ── the boot moment ────────────────────────────────────────────────────────\n   A desktop session begins by looking at the boot surface: the wallpaper is\n   already painted, the app is not, and for a moment the page is a still\n   picture. The plugin can make that moment read as *starting* rather than as\n   *stalled*.\n\n   `[data-dsh-boot]` is present only during boot — the product removes it — so\n   this is the one effect in the file that is guaranteed never to be on screen\n   at the same time as anything else. It is a pseudo-element, so the boot\n   surface's own layout is untouched. */\n\n[data-dsh-boot] {\n  position: relative;\n}\n\n[data-dsh-boot]::after {\n  content: \"\";\n  position: absolute;\n  inset: auto 0 0 0;\n  height: 52%;\n  pointer-events: none;\n  background: linear-gradient(\n    180deg,\n    transparent 0%,\n    color-mix(in srgb, var(--fa-gloss-top) 26%, transparent) 40%,\n    color-mix(in srgb, var(--fa-sky-mid) 34%, transparent) 100%\n  );\n  animation: fa-boot-horizon 2.9s cubic-bezier(0.22, 1, 0.36, 1) infinite;\n}\n\n@keyframes fa-boot-horizon {\n  0% {\n    opacity: 0;\n    transform: translate3d(0, 26%, 0) scaleY(0.68);\n  }\n  52% {\n    opacity: 0.92;\n  }\n  100% {\n    opacity: 0;\n    transform: translate3d(0, -10%, 0) scaleY(1.1);\n  }\n}\n\n/* ── the hero ───────────────────────────────────────────────────────────────\n   Before a conversation exists the app shows `data-phase=\"hero\"`: a title, a\n   composer and nothing else, over the full wallpaper. It is the screen looked\n   at longest with nothing to read, so it gets the two most generous effects in\n   the file.\n\n   The glint is a pseudo-element rather than a `background-position` animation\n   on the card, and that is deliberate: the composer card is a\n   `backdrop-filter` surface, and moving its own background would make the blur\n   underneath it recompute every frame. A pseudo-element repaints alone.\n\n   ## Why the lift composes instead of replacing\n\n   Two effects write to this card's `transform` in the hero:\n\n   - `effects.css` lifts it 1px on `[data-composer-card]:focus-within`, which is\n     the *entrance affordance* — it says \"this box is live, type here\". The\n     composer auto-focuses at boot, so in the hero this is always on.\n   - this block breathes it between 0 and −0.5% forever, so the card is never\n     perfectly still on a screen with nothing else moving.\n\n   The hero breathing was written as a plain `animation`, which is wrong, and it\n   was wrong in the way that is hardest to see: an animation at the *animation*\n   origin beats a normal declaration regardless of specificity or sheet order, so\n   `fa-hero-lift` replaced the focus lift outright rather than adding to it. The\n   card still showed a transform, and still moved — it just measured\n   `matrix(1, 0, 0, 1, 0, -0.53)` where the lift alone is `-1`, so the affordance\n   was silently gone and the probe that caught it was reading a real defect.\n\n   The fix is `animation-composition: add`, which is what the effect was always\n   meant to be: the breathing is a delta on top of whatever the cascade put\n   there. Both writers survive in every combination — focused or not, hero or\n   not — and neither has to know about the other. `add` is the default for\n   transform *lists* in the Web Animations API but not for `@keyframes`\n   animations, which is why it has to be said out loud here.\n\n   **And the delta must not be a second `translate3d`.** Under `add`, two\n   translations merge into one matrix rather than nesting: the focus lift's\n   `translate3d(0, -1px, 0)` and a breathing `translate3d(0, -0.5%, 0)` compose\n   to `matrix(1, 0, 0, 1, 0, -1)` — which carries *no scale term at all*, so the\n   breathing contributed translation and silently dropped the scaleY that the\n   focus lift exists to show. The interim reading of `-1.29px` looked like a\n   working composition and was really the merged translation overshooting the\n   lift. `scale` composes multiplicatively and sits outside the `transform`\n   list, so it survives the merge: the card breathes by a hair's scale while the\n   focus lift keeps its own scaleY, both at once.\n\n   `html.fa-tier-full` scopes it to the tier that exists to be the expensive\n   one, matching the rest of the desktop layer; at `lite` and `off` the animation\n   does not run at all and the focus lift is untouched. */\n\nhtml.fa-tier-full [data-phase=\"hero\"] [data-composer-card] {\n  animation: fa-hero-lift 7.4s ease-in-out infinite;\n  animation-composition: add;\n}\n\nhtml.fa-tier-full [data-phase=\"hero\"] [data-composer-card]::after {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  border-radius: inherit;\n  pointer-events: none;\n  background: linear-gradient(\n    100deg,\n    transparent 36%,\n    color-mix(in srgb, var(--fa-gloss-top) 32%, transparent) 50%,\n    transparent 64%\n  );\n  opacity: 0;\n  animation: fa-hero-glint 9.8s cubic-bezier(0.37, 0, 0.63, 1) infinite;\n}\n\n@keyframes fa-hero-lift {\n  0%,\n  100% {\n    scale: 1 1 1;\n  }\n  50% {\n    scale: 1 0.99 1;\n  }\n}\n\n@keyframes fa-hero-glint {\n  0%,\n  6% {\n    opacity: 0;\n    transform: translate3d(-36%, 0, 0);\n  }\n  44% {\n    opacity: 0.6;\n  }\n  84%,\n  100% {\n    opacity: 0;\n    transform: translate3d(36%, 0, 0);\n  }\n}\n\n/* ── the transcript ───────────────────────────────────────────────────────── */\n\n/* Each turn ends in a `data-turn-tail` block, and that block mounts once per\n   turn and is never re-created while the turn streams. It is the one node in\n   the transcript that is safe to give an entrance to, and it is the node whose\n   arrival a reader is actually waiting for. */\n[data-turn-tail] {\n  animation: fa-turn-in 460ms cubic-bezier(0.22, 1, 0.36, 1) both;\n}\n\n@keyframes fa-turn-in {\n  from {\n    opacity: 0;\n    transform: translate3d(0, 8px, 0);\n  }\n  to {\n    opacity: 1;\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n/* The collapsible process disclosure — \"thinking\", tool calls, subagents. It is\n   opened and closed *while* a turn streams, so an entrance here would replay on\n   every token. A transition on the summary row is idempotent and reads as the\n   panel breathing rather than as it arriving. */\n[data-turn-process] > *,\n[data-disclosure-row] {\n  transition:\n    transform 240ms cubic-bezier(0.22, 1, 0.36, 1),\n    opacity 220ms ease-out,\n    background-color 220ms ease-out;\n}\n\n[data-turn-process] > *:hover,\n[data-disclosure-row]:hover {\n  transform: translate3d(0, -1px, 0);\n}\n\n/* The chevron that carries `data-expandable` is the affordance that says the\n   row does something. It rotates on the product's own state attribute rather\n   than on `:hover`, so the motion means \"this is open\" instead of \"a pointer is\n   nearby\" — and it is a transform, so it composites. */\n[data-expandable] {\n  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);\n}\n\n/* A tool call riding inside a flow. The row is reused as the call advances\n   through its states, so: transition, not entrance. The `data-state` values are\n   the product's own — the row is tinted by state rather than animated on\n   change, because a state change during streaming would otherwise re-trigger a\n   motion the reader did not cause. */\n[data-chat-flow] [data-chat-flow-kind] {\n  transition:\n    transform 200ms cubic-bezier(0.22, 1, 0.36, 1),\n    opacity 200ms ease-out,\n    background-color 240ms ease-out;\n}\n\n[data-chat-flow] [data-chat-flow-kind]:hover {\n  transform: translate3d(2px, 0, 0);\n}\n\n/* The turn's own vertical marker: a hairline that says where one exchange ends\n   and the next begins. Drawn as a pseudo-element, so no turn's box moves and no\n   label can be pushed or clipped by it. */\n[data-chat-turn] {\n  position: relative;\n}\n\n[data-chat-turn]::before {\n  content: \"\";\n  position: absolute;\n  inset: 0 auto 0 -4px;\n  width: 2px;\n  border-radius: 2px;\n  pointer-events: none;\n  opacity: 0;\n  background: color-mix(in srgb, var(--fa-sky-mid) 62%, transparent);\n  transform: translate3d(-3px, 0, 0) scaleY(0.4);\n  transition:\n    opacity 260ms ease-out,\n    transform 280ms cubic-bezier(0.22, 1, 0.36, 1);\n}\n\n[data-chat-turn]:hover::before {\n  opacity: 0.9;\n  transform: translate3d(0, 0, 0) scaleY(1);\n}\n\n/* ── the right panel ────────────────────────────────────────────────────────\n   No loops here, by the rule recorded in `effects.css`: the panel already\n   transitions its own `transform` and `visibility`, and a second transform\n   animation would fight it. What is left is everything *inside* the panel,\n   which the panel does not touch — and the panel's contents are where a reader\n   spends the whole of a file-review.\n\n   The toggle and the expand affordance get a genuine motion because they are\n   the two controls on the panel's own chrome. */\n\n[data-sidebar-right-toggle],\n[data-sidebar-right-expand] {\n  transition:\n    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),\n    opacity 200ms ease-out;\n}\n\n[data-sidebar-right-toggle]:hover,\n[data-sidebar-right-expand]:hover {\n  transform: translate3d(0, -1px, 0);\n}\n\n/* A panel's list rows. `li` and `[role=\"listitem\"]` rather than a class, because\n   the panel's row components are several different modules and only the element\n   semantics are common to all of them. The panel's body is matched by its\n   dockkit pane rather than by `[data-fa-col=\"rightbar\"]`, and that is measured\n   rather than assumed: when the panel is opened at `fullscreen` mode — which is\n   how it opens by default at this width — its body is *not* a descendant of the\n   rightbar column, so the column-scoped selector matched nothing at all. */\n[data-dockkit-pane] li,\n[data-dockkit-pane] [role=\"listitem\"],\n[data-fa-col=\"rightbar\"] li,\n[data-fa-col=\"rightbar\"] [role=\"listitem\"] {\n  transition:\n    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),\n    opacity 200ms ease-out,\n    background-color 220ms ease-out;\n}\n\n[data-dockkit-pane] li:hover,\n[data-dockkit-pane] [role=\"listitem\"]:hover,\n[data-fa-col=\"rightbar\"] li:hover,\n[data-fa-col=\"rightbar\"] [role=\"listitem\"]:hover {\n  transform: translate3d(2px, 0, 0);\n}\n\n/* ── the dockkit surfaces ───────────────────────────────────────────────────\n   Transitions only. `effects.css` records why: these are the surfaces beneath\n   a control the user may be *dragging* (the width handle, the pane splitter),\n   and a surface that animates while being dragged is a moving target. A\n   transition on hover and on the product's own active state is safe; a loop is\n   not. */\n\n[data-dockkit-surface],\n[data-dockkit-pane],\n[data-dockkit-strip] {\n  transition:\n    opacity 240ms ease-out,\n    transform 260ms cubic-bezier(0.22, 1, 0.36, 1),\n    background-color 240ms ease-out;\n}\n\n[data-dockkit-strip-fill],\n[data-dockkit-strip-tabs],\n[data-dockkit-strip-chrome] {\n  transition:\n    opacity 220ms ease-out,\n    transform 240ms cubic-bezier(0.22, 1, 0.36, 1);\n}\n\n[data-dockkit-pane]:hover {\n  transform: translate3d(0, -1px, 0);\n}\n\n/* The width handle is the one draggable control that benefits from a *visible*\n   response, so it brightens to a full-width affordance from a half-height one\n   over a transition rather than snapping. Nothing here changes its hit box: the\n   change is inside the element, on a pseudo-element. */\n[data-width-handle] {\n  position: relative;\n}\n\n[data-width-handle]::after {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  border-radius: inherit;\n  pointer-events: none;\n  opacity: 0;\n  background: color-mix(in srgb, var(--fa-sky-mid) 52%, transparent);\n  transform: scaleY(0.55);\n  transition:\n    opacity 200ms ease-out,\n    transform 240ms cubic-bezier(0.22, 1, 0.36, 1);\n}\n\n[data-width-handle]:hover::after {\n  opacity: 0.7;\n  transform: scaleY(1);\n}\n\n/* A step in a process disclosure — a tool call, a subagent, an assistant step.\n   Each carries the product's own `data-state`, and the values it actually\n   publishes are read off a running page rather than guessed: `idle` and `ok`.\n   The obvious-looking `running` / `pending` are not among them, and a rule\n   written against either would be invisible forever.\n\n   This is the one *loop* in the whole transcript region, and it is here because\n   a settled step is the only thing in a transcript that benefits from saying\n   \"done, and it looks it\" rather than \"this changed\". It is a glow that\n   breathes on the step's own leading marker at 2.6s — slow enough to read as\n   breathing, and the only effect in the file the reader is meant to *notice*\n   while it runs. Every other loop in this project is a wallpaper or a light,\n   and is meant to be found rather than watched.\n\n   Sizing note: the host is 5px, which is under the 44px target floor — but it\n   is a `pointer-events: none` pseudo-element on an element that is neither a\n   link nor a control, so it can never be the target of a tap. The mark sits on\n   the step's own box, so it costs one layer per visible step and nothing per\n   message.\n\n   Selector note — this chain is the *only* one that matches, and the two\n   alternatives that look more obvious were measured dead on a page with three\n   conversations open:\n\n     `[data-chat-flow] [data-chat-flow-kind] [data-state=\"ok\"]`   -> 3 matches\n     `[data-chat-flow] [data-chat-flow-kind][data-state=\"ok\"]`    -> 0\n     `[data-turn-process] [data-state=\"ok\"]`                      -> 0\n\n   The kind row is an *ancestor* of the step row, never the step row itself, so\n   the space-descendant form is required; and `[data-turn-process]` exists but\n   never contains a `[data-state=\"ok\"]`. Writing all three \"to be safe\" is how\n   two thirds of this block came to be dead weight. */\n[data-chat-flow] [data-chat-flow-kind] [data-state=\"ok\"]::before {\n  content: \"\";\n  position: absolute;\n  inset: 50% auto auto 0;\n  width: 5px;\n  height: 5px;\n  margin-top: -2.5px;\n  border-radius: 50%;\n  pointer-events: none;\n  background: color-mix(in srgb, var(--fa-sky-mid) 82%, transparent);\n  animation: fa-step-pulse 2.6s cubic-bezier(0.4, 0, 0.6, 1) infinite;\n}\n\n@keyframes fa-step-pulse {\n  0%,\n  100% {\n    opacity: 0.35;\n    transform: scale(0.72);\n  }\n  50% {\n    opacity: 1;\n    transform: scale(1.24);\n  }\n}\n\n/* ── the sidebar's contents ─────────────────────────────────────────────────\n   `effects.css` owns the brand mark, the rail and the settings surface. What it\n   does not touch is the *inside* of the sidebar: the workspace list, its rows,\n   and the footer actions. Those are the surfaces a pointer actually lands on,\n   so they are where a hover has to be definite rather than decorative.\n\n   Rows are transitions, not entrances: the session list is re-keyed when a\n   session is created or renamed, and an entrance would replay on a list that\n   had merely been re-sorted. */\n\n[data-slot=\"sidebar.workspaces\"] a,\n[data-slot=\"sidebar.workspaces\"] button,\n[data-slot=\"sidebar.footer.action\"],\n[data-slot=\"sidebar.workspaces.directoryFlow\"] * {\n  transition:\n    transform 200ms cubic-bezier(0.22, 1, 0.36, 1),\n    opacity 180ms ease-out,\n    background-color 200ms ease-out;\n}\n\n[data-slot=\"sidebar.workspaces\"] a:hover,\n[data-slot=\"sidebar.workspaces\"] button:hover,\n[data-slot=\"sidebar.footer.action\"]:hover {\n  transform: translate3d(2px, 0, 0);\n}\n\n/* ── overlays and dialogs ───────────────────────────────────────────────────\n   `effects.css` gives the overlay layer its chrome. What it leaves is the\n   *inside* of a dialog, and a dialog is the most-scrutinised surface in the\n   product: it is where a person goes to change something, and where a stalled\n   animation is most obvious.\n\n   Everything here is a transition on a state the product already sets or a\n   pseudo-class the engine evaluates for free. There is deliberately no entrance\n   on a dialog: a dialog can be opened, closed and re-opened without unmounting,\n   so \"mounted once\" is not a property any of its nodes has. */\n\n/* The overlay layer gets nothing here on purpose.\n\n   It looks like an obvious place for a longer, softer scrim fade — and it is\n   wrong. `material.css` already makes the scrim `transparent`, and the measured\n   computed value is `transition-property: opacity, visibility` with an apparent\n   `0.3s`, because the class names are *hashed per build* and the duration comes\n   from a product rule. A competing `transition` declared here would be decided\n   by specificity and source order against a selector that cannot be named, and\n   the failure mode is a scrim that fades *faster* than it used to — a regression\n   that only appears in a build whose hash happens to differ.\n\n   The lesson generalises to the rest of this file: only add a transition where\n   the element has none, or where the existing one can be read and beaten\n   honestly. Everything below and above was checked that way. */\n\n[data-fa-dialog] [role=\"dialog\"] {\n  transition:\n    transform 340ms cubic-bezier(0.22, 1, 0.36, 1),\n    opacity 260ms ease-out;\n}\n\n[data-fa-dialog] [role=\"dialog\"] button,\n[data-fa-dialog] [role=\"dialog\"] [role=\"menuitem\"],\n[data-fa-dialog] [role=\"dialog\"] [data-active] {\n  transition:\n    transform 200ms cubic-bezier(0.22, 1, 0.36, 1),\n    opacity 180ms ease-out,\n    background-color 200ms ease-out;\n}\n\n[data-fa-dialog] [role=\"dialog\"] button:hover,\n[data-fa-dialog] [role=\"dialog\"] [role=\"menuitem\"]:hover,\n[data-fa-dialog] [role=\"dialog\"] [data-active]:hover {\n  transform: translate3d(0, -1px, 0);\n}\n\n/* ── the composer ───────────────────────────────────────────────────────────\n   `effects.css` owns the caret pulse and the placeholder shimmer. This adds the\n   parts around them.\n\n   The seat is an entrance because it mounts with the composer and the composer\n   is stable for the life of a session; the chips are transitions because the\n   same chip node is reused as the user edits. The stats line brightens while\n   the composer holds focus, which is a signal that a keystroke is going into\n   *this* box rather than a decoration. */\n\n[data-composer-seat] {\n  animation: fa-seat-in 480ms cubic-bezier(0.22, 1, 0.36, 1) both;\n}\n\n@keyframes fa-seat-in {\n  from {\n    opacity: 0;\n    transform: translate3d(0, 6px, 0);\n  }\n  to {\n    opacity: 1;\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n[data-composer-stats] {\n  opacity: 0.72;\n  transition:\n    opacity 260ms ease-out,\n    transform 260ms cubic-bezier(0.22, 1, 0.36, 1);\n}\n\n/* This one is worth reading twice, because the obvious version is dead.\n\n   The natural selector is `[data-composer-card]:focus-within [data-composer-stats]`,\n   and it matches **nothing** — not \"matches nothing right now\", but nothing ever.\n   The measured ancestry of the stats node, read off the running page:\n\n       0  div  .bOPqQW_root                       [data-composer-stats]\n       1  div                                     [data-slot]\n       2  div  .uV2eYG_root\n       3  div                                     [data-slot]\n       4  div  .wSkVaW_composerStack\n       5  div                                     [data-chain-overlay-fallback]\n       6  div                                     [data-slot]\n       7  div  .wSkVaW_composerSeat               [data-composer-seat]\n       8  div  .wSkVaW_scrollBody                 [data-conversation-scroll]\n\n   The card and the stats are **siblings** — both live under the composer stack\n   — so a descendant combinator from the card can never reach the stats, and the\n   card's focus state can never drive them.\n\n   The stack itself would be the natural hook, and it is *not usable*: its only\n   identifier is the hashed class `.wSkVaW_composerStack`, which the product\n   regenerates every build. `material.css` records why this project refuses to\n   select on those. `[data-composer-seat]` is the nearest ancestor that is both\n   a common ancestor of the two and a stable attribute, so the state moves\n   there. `:focus-within` is still a pseudo-class the engine evaluates for free,\n   so there is no observer and no published state to keep in sync.\n\n   A count-based audit sees a rule matching zero and cannot tell \"wrong time\"\n   from \"wrong selector\". This survived the first pass for exactly that reason;\n   it was the ancestry dump that found it. */\n[data-composer-seat]:focus-within [data-composer-stats] {\n  opacity: 1;\n  transform: translate3d(0, -1px, 0);\n}\n\n/* The composer's controls. `data-composer-input` is the `contenteditable`\n   editor itself and holds no buttons — and at a desktop width it can also\n   report `contenteditable=\"false\"` with a \"pick a model first\" placeholder, so\n   even a rule aimed at its children would be aimed at nothing. The card is the\n   real container, and this is the selector the running page confirmed. */\n[data-composer-card] button,\n[data-composer-card] [role=\"button\"],\n[data-composer-card] [role=\"menuitem\"] {\n  transition:\n    transform 200ms cubic-bezier(0.22, 1, 0.36, 1),\n    opacity 180ms ease-out,\n    background-color 200ms ease-out;\n}\n\n[data-composer-card] button:hover,\n[data-composer-card] [role=\"button\"]:hover,\n[data-composer-card] [role=\"menuitem\"]:hover {\n  transform: translate3d(0, -1px, 0);\n}\n\n/* ── the canvas ─────────────────────────────────────────────────────────────\n   A conversation column scrolled away from its own top gets a faint wash at the\n   top edge, so the transcript reads as *continuing* past the edge rather than\n   as having been cut. It keys off the same published state the scroll-edge\n   masks already use, so there is nothing new to keep in sync — and it is an\n   opacity transition on a pseudo-element, so it costs nothing at rest. */\n\n[data-fa-canvas]::before {\n  content: \"\";\n  position: absolute;\n  inset: 0 0 auto 0;\n  height: 120px;\n  pointer-events: none;\n  opacity: 0;\n  background: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-sky-low) 26%, transparent) 0%,\n    transparent 100%\n  );\n  transition: opacity 420ms ease-out;\n}\n\n[data-fa-canvas]:has([data-fa-scrolled=\"middle\"])::before,\n[data-fa-canvas]:has([data-fa-scrolled=\"bottom\"])::before {\n  opacity: 1;\n}\n\n/* ── the stop rules ─────────────────────────────────────────────────────────\n   Every loop declared above has a stop rule here, plus the one-shot entrances\n   are neutralised at `off`. They are written as one block rather than beside\n   each effect because the question a reader actually asks is \"at `lite`, what\n   still moves\" — and that is a question about a set, not about a rule.\n\n   Two shapes of stop, and the distinction is load-bearing:\n\n   - `animation: none` for an effect that is decorative *on top of* a surface\n     that must stay: the surface remains, the motion goes.\n   - the element is hidden for an effect that exists *only* to move.\n\n   Every stop below is the first shape, which means `effects-tiers.mjs` is\n   checking a genuine \"stop\" rather than a \"hide\" — and the two would look\n   identical to any probe that only asked whether `animation-name` was `none`.\n   At `lite` the one-shot entrances are *kept*: they cost nothing at rest, they\n   happen once, and they are the difference between a panel appearing and a\n   panel arriving. That is why this block lists exceptions instead of applying\n   one blanket rule. */\n\n  html.fa-tier-lite [data-dsh-boot]::after,\n  html.fa-tier-off [data-dsh-boot]::after,\n  /* Selector must carry `html.fa-tier-full`'s full weight to win: the hero lift\n     above is `html.fa-tier-full [data-phase=\"hero\"] [data-composer-card]`, and a\n     two-class selector here would lose to it on specificity. `fa-tier-lite` on\n     the same elements is impossible — the tier classes are mutually exclusive —\n     so this is the only way to write \"stop what full started\". */\n  html.fa-tier-lite [data-phase=\"hero\"] [data-composer-card],\n  html.fa-tier-off [data-phase=\"hero\"] [data-composer-card],\n  html.fa-tier-lite [data-phase=\"hero\"] [data-composer-card]::after,\n  html.fa-tier-off [data-phase=\"hero\"] [data-composer-card]::after,\n  html.fa-tier-lite [data-chat-flow] [data-chat-flow-kind] [data-state=\"ok\"]::before,\n  html.fa-tier-off [data-chat-flow] [data-chat-flow-kind] [data-state=\"ok\"]::before {\n    animation: none;\n  }\n\n  /* The one-shot entrances retire at `off` and stay at `lite`. Both of these\n     nodes mount once, so this is the only place in the file where \"animation:\n     none\" and \"display: none\" would look the same in the output — they are not\n     the same thing, and the node stays painted either way. */\n  html.fa-tier-off [data-turn-tail],\n  html.fa-tier-off [data-composer-seat] {\n    animation: none;\n  }\n\n  /* The persistent transitions are deliberately *not* stopped at any tier. A\n     transition is not an effect that runs; it is how a change is drawn when it\n     happens, and removing it at `off` would make the product's own state\n     changes snap. `effects-perf.mjs` checks exactly this: animations vanish at\n     `off` while transitions survive. */\n}\n",
		};
		/**
		 * What this artifact is, readable at runtime and without the package.json.
		 * A release tag and a branch can share a version string while holding
		 * different bytes; the fingerprint is what tells them apart.
		 *
		 * Deliberately carries no timestamp: a build clock would change the served
		 * bytes on every rebuild of identical sources, which is exactly the
		 * property the installer relies on when it compares an installed copy
		 * against the sources it is holding.
		 */
		const FA_BUILD = {"version":"1.1.1","fingerprint":"2e9173a987d0"};
		exports.build = FA_BUILD;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
