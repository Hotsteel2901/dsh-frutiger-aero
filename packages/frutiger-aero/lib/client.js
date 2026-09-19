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

		/** The application root; anything outside it is not the product's. */
		function appRoot() {
		  return document.getElementById('root')
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
		/** Stylesheets inlined at build time; see src/css/*.css. */
		const FA_SHEETS = {
      "base": "/*\n * base.css — structural groundwork.\n *\n * Loaded after the generated palette sheet and before everything else, so this\n * file may assume every `--dsw-*` token and every `--fa-*` material variable\n * already resolves, and must not assume any of the plugin's own attributes\n * exist yet (the tagger runs after the first paint).\n *\n * The rules here answer one question: *where does the wallpaper live?* The\n * scene is appended to `<body>` as a fixed element, so `#root` has to be lifted\n * into its own stacking context above it. Everything else in the skin depends\n * on that one decision.\n */\n\nhtml {\n  /* Aero is a bright, slightly cool white. This is what shows through before\n     the scene mounts, and behind it afterwards, so the first paint already\n     belongs to the theme instead of flashing the product default. The value\n     comes from the generated palette sheet, which also flips it for the dark\n     scheme. */\n  background: var(--fa-root-bg, #dff2fd);\n  /* The software keyboard is handled by a custom property (see runtime.js), so\n     the page itself must never resize under the user's thumb. */\n  -webkit-text-size-adjust: 100%;\n  text-size-adjust: 100%;\n}\n\nbody {\n  background: transparent !important;\n  color: var(--dsw-alias-label-primary);\n  font-family: var(--dsw-font-family);\n  /* Momentum scrolling and rubber-banding are opt-in per scroll container in\n     mobile.css; the page shell itself must not bounce. */\n  overscroll-behavior: none;\n  -webkit-tap-highlight-color: transparent;\n}\n\n/*\n * The wallpaper is a negative-z-index fixed layer, the classic technique: it\n * paints above the canvas background and below every in-flow node, without\n * giving `#root` a stacking context of its own.\n *\n * That last part matters. Wrapping the app in a stacking context would cap the\n * product's internal z-index ladder — panels at 8, handles at 11, the overlay\n * layer at 20, portalled dialogs at 100 — so a dock or a scrim placed as a\n * sibling of `#root` could never be layered correctly against a dialog. Leaving\n * `#root` context-free lets every layer compete in one space, which is exactly\n * what the mobile layer needs.\n */\nbody > [data-fa-scene] {\n  position: fixed;\n  inset: 0;\n  z-index: -1;\n}\n\n/* The app's own full-viewport surface must not paint over the wallpaper; the\n   single translucent wash comes from `--dsw-alias-bg-base` instead, which keeps\n   exactly one layer of translucency between the scene and the content. */\n[data-fa-frame] {\n  background: transparent !important;\n}\n\n/* The conversation column keeps its own `--dsw-alias-bg-base` wash; see the\n   note on `[data-fa-canvas]` in material.css for why stripping it is wrong. */\n\n/*\n * Anything the plugin adds is decoration and must never eat a pointer event.\n * The scrim is the single exception, and only while a drawer is open.\n */\n[data-fa-scene],\n[data-fa-scrim] {\n  pointer-events: none;\n}\n\nbody[data-fa-drawer] > [data-fa-scrim] {\n  pointer-events: auto;\n  /* The scrim is what stops the page behind the drawer from scrolling: every\n     touch that would have reached the transcript lands here instead. */\n  touch-action: none;\n}\n\nhtml {\n  /* Published by the keyboard tracker; zero on every platform without a\n     software keyboard, so the expression is safe everywhere. */\n  --fa-keyboard: 0px;\n  --fa-dock-height: 58px;\n\n  /* Dock glyphs. Inline SVG masks rather than icon fonts or sprite requests:\n     they inherit `currentColor`, cost no network round trip, and are defined\n     once for the single place this plugin draws its own iconography. */\n  --fa-icon-menu: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M4 7h16M4 12h16M4 17h10'/%3E%3C/svg%3E\");\n  --fa-icon-new: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M12 5v14M5 12h14'/%3E%3C/svg%3E\");\n  --fa-icon-search: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'%3E%3Ccircle cx='11' cy='11' r='6.5'/%3E%3Cpath d='M16 16l4.5 4.5'/%3E%3C/svg%3E\");\n  --fa-icon-library: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 7.5A1.5 1.5 0 0 1 4.5 6h4l2 2.5h7A1.5 1.5 0 0 1 19 10v7a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 3 17z'/%3E%3C/svg%3E\");\n  /* Sliders rather than a cog: at 22px a cog's teeth are indistinguishable\n     from a sunburst, and the dock already has a sun-like element behind it. */\n  --fa-icon-settings: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M4 7h10M18 7h2M4 17h4M12 17h8'/%3E%3Ccircle cx='16' cy='7' r='2.2'/%3E%3Ccircle cx='10' cy='17' r='2.2'/%3E%3C/svg%3E\");\n}\n\n/* Reduced motion is honoured in one place for everything decorative. */\n@media (prefers-reduced-motion: reduce) {\n  html.fa-tier-full [data-fa-scene]::after {\n    display: none;\n  }\n}\n",
      "scenery": "/*\n * scenery.css — the wallpaper.\n *\n * Nine layers of sky, sun, haze, light shafts, two hill ridges, water,\n * caustics and bubbles, all inside one fixed element with `contain: strict`.\n * The scene is therefore invisible to the application's layout: it cannot\n * cause a reflow, it cannot be scrolled, and it never appears in a hit test.\n *\n * Two rules govern every animation below, and they are the reason a wallpaper\n * this busy costs almost nothing:\n *\n *   1. Only `transform` and `opacity` are animated. Those are the two\n *      properties a compositor can animate without asking the main thread to\n *      re-layout, re-paint, or re-rasterise.\n *   2. Nothing animates anything that sits *behind* a `backdrop-filter`. The\n *      blur is applied by `material.css` to panes smaller than the viewport,\n *      and the scene is deliberately built from large feathered gradients —\n *      itself already the look a blur would produce — so no filter has to be\n *      recomputed as the bubbles move.\n */\n\n.fa-scene {\n  position: fixed;\n  inset: 0;\n  overflow: hidden;\n  pointer-events: none;\n  contain: strict;\n  /* Deliberately *not* promoted. An early version carried\n     `will-change: transform; transform: translateZ(0)` here to \"promote the\n     scene once\", and on a 3x display the compositor then painted the promoted\n     negative-z-index layer above the app's own content — the transcript showed\n     through the wallpaper instead of the other way round. Nothing in the scene\n     claims a `will-change` hint (see the bubble block below), so the whole\n     wallpaper stays an ordinary fixed element and is unambiguously behind the\n     app. */\n  opacity: 1;\n  transition: opacity 600ms ease;\n}\n\nhtml[data-fa-idle] .fa-scene,\nhtml[data-fa-idle] .fa-scene * {\n  animation-play-state: paused !important;\n}\n\n.fa-scene__layer {\n  position: absolute;\n  inset: 0;\n}\n\n/* ── sky ────────────────────────────────────────────────────────────────────\n   A vertical sky gradient with a wide, soft horizon glow. Frutiger Aero's skies\n   are never flat: they run from a saturated zenith to a near-white horizon. */\n.fa-scene__sky {\n  background:\n    radial-gradient(120% 80% at 18% 118%, var(--fa-scene-glow) 0%, transparent 62%),\n    linear-gradient(180deg, var(--fa-sky-top) 0%, var(--fa-sky-mid) 46%, var(--fa-sky-low) 74%);\n}\n\n/* ── sun ────────────────────────────────────────────────────────────────────\n   One small disc, one enormous bloom. The bloom is what sells \"Aero\"; the disc\n   is what keeps it readable as a sun rather than a lens artefact. */\n.fa-scene__sun {\n  background:\n    radial-gradient(circle at 74% 16%, var(--fa-sun) 0 2.6%, transparent 3.1%),\n    radial-gradient(circle at 74% 16%, var(--fa-sun-glow) 0%, transparent 34%);\n  animation: fa-sun-breathe 26s ease-in-out infinite;\n}\n\n/* ── haze ───────────────────────────────────────────────────────────────────\n   The single most important layer for making the landscape read as *distance*\n   rather than as a coloured band. Real air scatters light, so a ridge a\n   kilometre away is almost the colour of the sky above it; without this the\n   hills are a hard green stripe crossing the page — which is exactly what the\n   first version of this file looked like. */\n.fa-scene__haze {\n  background: linear-gradient(\n    180deg,\n    transparent 40%,\n    color-mix(in srgb, var(--fa-haze) 80%, transparent) 52%,\n    color-mix(in srgb, var(--fa-haze) 55%, transparent) 74%,\n    transparent 96%\n  );\n}\n\n/* ── light shafts ───────────────────────────────────────────────────────────\n   Four skewed bands of light, drifting. This is the layer that most says\n   \"2007 render\", and it is the first thing dropped on a phone. */\n.fa-scene__rays {\n  opacity: 0.4;\n  /* Wide, heavily feathered bands, and masked away before they reach the\n     content. Narrow bands at full height read as diagonal stripes over the\n     transcript rather than as light in the air. */\n  background: repeating-linear-gradient(\n    102deg,\n    transparent 0 11%,\n    color-mix(in srgb, var(--fa-gloss-top) 26%, transparent) 11% 19%,\n    transparent 19% 34%\n  );\n  -webkit-mask-image: linear-gradient(180deg, #000 0%, rgb(0 0 0 / 55%) 42%, transparent 74%);\n  mask-image: linear-gradient(180deg, #000 0%, rgb(0 0 0 / 55%) 42%, transparent 74%);\n  transform-origin: 74% 6%;\n  animation: fa-rays-drift 42s ease-in-out infinite;\n}\n\nhtml.fa-tier-lite .fa-scene__rays,\nhtml.fa-tier-off .fa-scene__rays {\n  display: none;\n}\n\n/* ── hills ──────────────────────────────────────────────────────────────────\n   Two ridges, near and far. Ellipses rather than SVG: cheaper, resolution\n   independent, and they read as Frutiger Aero's rolling green hills once the\n   far ridge is hazed by the layer above it. */\n.fa-scene__hills {\n  top: auto;\n  /* The horizon sits at four fifths of the viewport. High enough that the\n     landscape reads as a landscape, low enough that the conversation — which\n     lives in the upper and middle band — is over sky rather than over water. */\n  bottom: 10%;\n  height: 16%;\n}\n\n.fa-scene__hills.fa-scene__far {\n  background:\n    radial-gradient(58% 100% at 14% 108%, var(--fa-hill-far) 0 99%, transparent 100%),\n    radial-gradient(72% 100% at 52% 116%, var(--fa-hill-far) 0 99%, transparent 100%),\n    radial-gradient(54% 100% at 92% 110%, var(--fa-hill-far) 0 99%, transparent 100%);\n  opacity: 0.85;\n}\n\n.fa-scene__hills.fa-scene__near {\n  bottom: 7%;\n  height: 11%;\n  background:\n    radial-gradient(64% 100% at 26% 118%, var(--fa-hill-near) 0 99%, transparent 100%),\n    radial-gradient(58% 100% at 78% 124%, var(--fa-hill-near) 0 99%, transparent 100%);\n}\n\nhtml.fa-tier-lite .fa-scene__hills.fa-scene__far,\nhtml.fa-tier-off .fa-scene__hills.fa-scene__far {\n  display: none;\n}\n\n/* ── water ──────────────────────────────────────────────────────────────────\n   The bottom third. The gradient plus the horizon highlight is the entire\n   effect; the shimmer is the caustics layer. */\n.fa-scene__water {\n  top: auto;\n  height: 14%;\n  background:\n    linear-gradient(180deg, color-mix(in srgb, var(--fa-gloss-top) 42%, transparent) 0 1px, transparent 1px),\n    linear-gradient(180deg, var(--fa-water-top) 0%, var(--fa-water-deep) 100%);\n}\n\n/* ── caustics ───────────────────────────────────────────────────────────────\n   Two interference patterns of refracted light, counter-drifting. This is the\n   most expensive visual in the skin (a large `background-position` animation,\n   so it repaints rather than composites), which is exactly why it is confined\n   to the `full` tier. */\n.fa-scene__caustics {\n  top: auto;\n  height: 14%;\n  opacity: 0.55;\n  mix-blend-mode: soft-light;\n  background-image:\n    repeating-radial-gradient(\n      ellipse 60% 30% at 30% 10%,\n      color-mix(in srgb, var(--fa-caustic) 55%, transparent) 0 1.4%,\n      transparent 1.4% 7%\n    ),\n    repeating-radial-gradient(\n      ellipse 40% 22% at 70% 0%,\n      color-mix(in srgb, var(--fa-caustic) 38%, transparent) 0 1.1%,\n      transparent 1.1% 6%\n    );\n  animation: fa-caustics 24s linear infinite;\n}\n\nhtml.fa-tier-lite .fa-scene__caustics,\nhtml.fa-tier-off .fa-scene__caustics {\n  display: none;\n}\n\n/* ── bubbles ────────────────────────────────────────────────────────────────\n   The signature. Each bubble is one element carrying its own timing as custom\n   properties, so a single keyframe pair drives all of them and the whole\n   population shares one composited layer set.\n\n   No `will-change` here: 22 bubbles would be 22 promoted compositor layers, and\n   an animated `transform` is promoted by the engine on its own. Claiming the\n   hint per element is how a wallpaper ends up costing more than the app.\n\n   The gloss is three stacked gradients on the same element: a bright specular\n   dot, a soft sheen sweeping the upper left, and a rim that is brighter at the\n   bottom edge than the top — which is what makes a circle read as a *sphere*\n   rather than a disc. */\n.fa-scene__bubbles {\n  overflow: hidden;\n}\n\n.fa-scene__bubble {\n  position: absolute;\n  left: var(--fa-x, 40%);\n  bottom: -14vh;\n  width: var(--fa-size, 40px);\n  height: var(--fa-size, 40px);\n  border-radius: 50%;\n  opacity: 0;\n  background:\n    radial-gradient(circle at 32% 26%, var(--fa-bubble-core) 0 12%, transparent 34%),\n    radial-gradient(circle at 36% 30%, var(--fa-bubble) 0 30%, transparent 62%),\n    radial-gradient(circle at 50% 50%, transparent 58%, var(--fa-bubble-rim) 88%, transparent 100%);\n  box-shadow:\n    inset 0 0 0 1px color-mix(in srgb, var(--fa-bubble-rim) 60%, transparent),\n    inset -3px -5px 10px color-mix(in srgb, var(--fa-bubble-rim) 30%, transparent),\n    inset 3px 4px 12px color-mix(in srgb, var(--fa-bubble-core) 45%, transparent),\n    0 0 14px color-mix(in srgb, var(--fa-bubble-rim) 35%, transparent);\n  animation: fa-bubble-rise var(--fa-duration, 24s) linear infinite;\n  animation-delay: var(--fa-delay, 0s);\n}\n\nhtml.fa-tier-lite .fa-scene__bubble {\n  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--fa-bubble-rim) 50%, transparent);\n}\n\n/* ── veil ───────────────────────────────────────────────────────────────────\n   Last, and always on top of the wallpaper. Two jobs: it guarantees the\n   contrast floor for text that ends up over the scene, and it is the layer the\n   bloom comes from — the soft bright wash at the top is what makes the whole\n   page feel lit from above. */\n.fa-scene__veil {\n  background:\n    radial-gradient(140% 90% at 50% -20%, color-mix(in srgb, var(--fa-gloss-top) 26%, transparent) 0%, transparent 60%),\n    linear-gradient(180deg, transparent 0%, var(--fa-scene-veil) 100%);\n}\n\n/* ── grain ──────────────────────────────────────────────────────────────────\n   A barely-there film grain, and the last thing added to the scene. Aero\n   wallpapers were photographs, and large flat gradients are the giveaway that\n   this one is not: at 4% opacity the noise is invisible as texture but it stops\n   the sky from banding on an 8-bit display, which is the failure mode a\n   gradient this wide actually has.\n\n   Applied to the scene rather than the app, so it is behind the glass — the way\n   film grain is behind a window — and costs no extra layer of its own. */\n.fa-scene::after {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  opacity: 0.045;\n  background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\");\n}\n\nhtml.fa-tier-lite .fa-scene::after {\n  display: none;\n}\n\n/* ── keyframes ──────────────────────────────────────────────────────────────\n   Five animations for the entire wallpaper. All transform/opacity except the\n   caustics, which is why only the caustics is tier-restricted. */\n\n@keyframes fa-bubble-rise {\n  0% {\n    transform: translate3d(0, 0, 0) scale(0.72);\n    opacity: 0;\n  }\n  8% {\n    opacity: var(--fa-opacity, 0.5);\n  }\n  50% {\n    transform: translate3d(calc(var(--fa-drift, 0vw) * 0.55), calc(-58vh - var(--fa-lift, 0vh)), 0)\n      scale(calc(0.86 + var(--fa-wobble, 0.8) * 0.1));\n    opacity: var(--fa-opacity, 0.5);\n  }\n  88% {\n    opacity: calc(var(--fa-opacity, 0.5) * 0.5);\n  }\n  100% {\n    transform: translate3d(var(--fa-drift, 0vw), calc(-116vh - var(--fa-lift, 0vh)), 0) scale(1.04);\n    opacity: 0;\n  }\n}\n\n@keyframes fa-sun-breathe {\n  0%,\n  100% {\n    transform: scale(1) translate3d(0, 0, 0);\n    opacity: 1;\n  }\n  50% {\n    transform: scale(1.06) translate3d(-1.2%, 0.8%, 0);\n    opacity: 0.88;\n  }\n}\n\n@keyframes fa-rays-drift {\n  0%,\n  100% {\n    transform: rotate(-1.6deg) scale(1.12);\n    opacity: 0.42;\n  }\n  50% {\n    transform: rotate(1.4deg) scale(1.18);\n    opacity: 0.62;\n  }\n}\n\n@keyframes fa-caustics {\n  0% {\n    background-position: 0% 0%, 40% 0%;\n  }\n  100% {\n    background-position: 120% 18%, -80% 12%;\n  }\n}\n\n/* Reduced motion: the scene stays, because it is the theme, but it stops. */\n@media (prefers-reduced-motion: reduce) {\n  .fa-scene,\n  .fa-scene * {\n    animation: none !important;\n  }\n\n  .fa-scene__bubbles {\n    opacity: 0.5;\n  }\n\n  /* The rise animation is what normally distributes the bubbles over the\n     viewport, so freezing it would leave them all in a row below the fold.\n     `--fa-lift` is the per-bubble vertical variation the animation already\n     uses, which makes it the natural thing to spread them with — and it is\n     independent of `--fa-x`, so the population stays scattered rather than\n     collapsing onto one diagonal. */\n  .fa-scene__bubble {\n    opacity: 0.4;\n    bottom: auto;\n    top: calc(12% + var(--fa-lift, 0vh) * 3.4);\n    transform: none;\n  }\n\n  .fa-scene__bubbles {\n    /* The scene's own wash already guarantees contrast; this only stops the\n       frozen population from looking accidental. */\n    opacity: 0.85;\n  }\n}\n",
      "material": "/*\n * material.css — the glass itself.\n *\n * ## Why `!important` is used deliberately here\n *\n * A client plugin's stylesheet is injected at runtime, and the boot creates\n * every plugin entry concurrently, so there is no guaranteed order between this\n * sheet and the product's own CSS-module sheets. Specificity ties cannot be\n * won by document order, and the product's rules are class selectors, so an\n * attribute selector of the same weight is a coin flip. Every paint property\n * below is therefore `!important`, which is what makes the skin deterministic\n * rather than load-order dependent.\n *\n * That is only safe because of what is *not* overridden. The product encodes\n * meaning in exactly one paint property — `background-color`, where a danger\n * button is red and a success chip is green — and this file never sets\n * `background-color`. It sets `background-image` (the Aero gloss, layered on\n * top of whatever colour the product chose), `border-*`, `border-radius`,\n * `box-shadow`, `backdrop-filter` and `color` inherited from the palette. So a\n * red button stays red, and it becomes a *glossy* red button.\n *\n * ## Why stable attributes, not class names\n *\n * The product hashes CSS-module class names per build (`.pI_x6G_sidebarCol`),\n * so they are worthless as selectors across an upgrade. What it *does* keep\n * stable is the semantic `data-*` vocabulary its own styles and tests depend\n * on — `data-rightbar-col`, `data-shell-overlay`, `data-conversation-scroll`,\n * `data-composer-card`, `data-chat-flow-kind`, `data-files-row` — plus ARIA\n * roles and element semantics. This file is written almost entirely against\n * those, which is why it survives product upgrades.\n */\n\n/* ══ 1. The glass panes ═════════════════════════════════════════════════════\n   Aero is a *window*: a bright rim, a translucent pane, and a soft coloured\n   glow behind it. The frame is the window; the sidebar, right panel and\n   composer are the panes set into it.\n\n   The single most important rule in the whole skin is the frame being\n   transparent: the wallpaper sits behind it, and one wash of\n   `--dsw-alias-bg-base` (78% white in light, 84% deep water in dark) is all\n   that separates the user's text from the scene. */\n\n[data-fa-frame] {\n  background: transparent !important;\n}\n\n/* The left rail / sidebar. Warmer and lighter than the content pane so the\n   window reads as chrome plus paper. */\n[data-fa-col=\"sidebar\"] {\n  background: var(--dsw-specific-sidebar-fill) !important;\n  border-right: 1px solid var(--dsw-alias-border-l2) !important;\n  box-shadow:\n    inset -1px 0 0 var(--fa-rim-light),\n    inset 1px 0 0 color-mix(in srgb, var(--fa-gloss-top) 30%, transparent) !important;\n}\n\n/*\n * The right panel deliberately gets the *heavier* glass: it is a floating\n * surface, not a structural column.\n *\n * It is applied to the **panel**, never to the column, and that distinction is\n * load-bearing rather than stylistic. On desktop the column is a zero-width\n * grid track, so blurring it is free; once the frame collapses to a single\n * track it spans the entire viewport — and a `backdrop-filter` on it then blurs\n * and desaturates the *whole application*, with the transcript inside it.\n *\n * It is also invisible to the obvious checks: the column is\n * `pointer-events: none`, so `elementFromPoint` never returns it and hit\n * testing looks perfectly healthy. It only shows up in pixels: on a phone at\n * the `full` tier the transcript band measured a luminance standard deviation\n * of 7 where the same content measured 26 with this rule scoped correctly.\n */\n[data-sidebar-right-panel] {\n  backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n  -webkit-backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n}\n\n/* The column may carry the glass only where it is a real, narrow track. */\n@media (min-width: 1024px) {\n  [data-fa-col=\"rightbar\"] {\n    backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n    -webkit-backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n  }\n}\n\n/* A column must never filter the viewport it shares with the conversation. */\n@media (max-width: 1023px) {\n  [data-fa-col=\"rightbar\"] {\n    backdrop-filter: none !important;\n    -webkit-backdrop-filter: none !important;\n  }\n}\n\nhtml.fa-tier-lite [data-fa-col=\"rightbar\"],\nhtml.fa-tier-lite [data-sidebar-right-panel],\nhtml.fa-tier-lite [data-fa-col=\"sidebar\"],\nhtml.fa-tier-off [data-fa-col=\"rightbar\"],\nhtml.fa-tier-off [data-sidebar-right-panel],\nhtml.fa-tier-off [data-fa-col=\"sidebar\"] {\n  /* Type-A surfaces: tint only. A full-height blur that has an animated\n     wallpaper behind it is re-run on every frame the wallpaper moves, which is\n     the one place this design could actually cost a phone its scroll. */\n  backdrop-filter: none;\n  -webkit-backdrop-filter: none;\n}\n\n/*\n * The conversation column keeps the product's own `--dsw-alias-bg-base` wash —\n * stripping it was the first thing tried here, and it is wrong: without a\n * column-level pane the wallpaper showed *through the gaps between rows*, so a\n * tool-call row over the hills went green and the empty half of a wide\n * transcript went bright blue. One uniform wash is what turns a wallpaper into\n * a background.\n *\n * What the tag is still for is the second, softer pane: a gradient that is\n * brightest behind the header and fades out down the transcript, so the top of\n * the column reads as lit glass without dimming the reading surface below it.\n */\n[data-fa-canvas] {\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-pane-strong) 46%, transparent) 0%,\n    transparent 34%\n  ) !important;\n}\n\n/* ══ 2. The composer ════════════════════════════════════════════════════════\n   The composer is the one surface the user touches constantly, so it gets the\n   most Aero: a real frosted pane with a bright rim, an inner aqua glow on\n   focus, and a lift on press. The product already gives it a 22px radius and\n   `--dsw-elevation-soft`, both of which the palette has already retinted. */\n\n[data-composer-card] {\n  background: var(--dsw-specific-input-major) !important;\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-gloss-top) 55%, transparent) 0 1px,\n    color-mix(in srgb, var(--fa-gloss-mid) 40%, transparent) 1px,\n    transparent 42%,\n    color-mix(in srgb, var(--fa-gloss-foot) 26%, transparent) 100%\n  ) !important;\n  border: 1px solid var(--dsw-alias-border-l1) !important;\n  box-shadow:\n    var(--dsw-elevation-soft),\n    inset 0 0 0 1px color-mix(in srgb, var(--fa-rim-light) 40%, transparent),\n    inset 0 -14px 28px -18px var(--fa-inner-glow) !important;\n  backdrop-filter: blur(var(--fa-blur)) saturate(var(--fa-saturate));\n  -webkit-backdrop-filter: blur(var(--fa-blur)) saturate(var(--fa-saturate));\n  transition:\n    box-shadow 220ms cubic-bezier(0.4, 0, 0.2, 1),\n    border-color 220ms cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n[data-composer-card]:focus-within {\n  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary) 62%, transparent) !important;\n  box-shadow:\n    var(--dsw-elevation-prominent),\n    0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-business-primary) 18%, transparent),\n    inset 0 0 0 1px color-mix(in srgb, var(--fa-rim-light) 55%, transparent),\n    inset 0 -18px 34px -20px var(--fa-inner-glow) !important;\n}\n\nhtml.fa-tier-lite [data-composer-card],\nhtml.fa-tier-off [data-composer-card] {\n  backdrop-filter: none;\n  -webkit-backdrop-filter: none;\n}\n\n/* The editor inside the composer is transparent; the pane above it is the\n   surface. Only the placeholder is restyled, to Aero's lighter ink. */\n[data-composer-placeholder],\n[data-placeholder] {\n  color: var(--dsw-alias-label-tertiary) !important;\n}\n\n[data-composer-chip] {\n  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 70%, transparent) !important;\n  border: 1px solid var(--dsw-alias-border-l1) !important;\n  border-radius: 999px !important;\n}\n\n/* ══ 3. Interactive surfaces ════════════════════════════════════════════════\n   One gloss recipe, applied to everything the user can press. Written as a\n   five-stop vertical gradient rather than a `::after` overlay: a pseudo-element\n   would need `position: relative` and `overflow: hidden` on every control,\n   which is exactly the kind of layout meddling a reskin must not do.\n\n   Stops, top to bottom:\n     0→1px   a crisp bright rim      (the \"specular\" edge)\n     1px→46% a soft sheen            (the gloss)\n     46%→54% the specular break      (where the curve turns away from the light)\n     54%→98% a faint reflected floor (the light bouncing off the surface below)\n     98%→100% a second, dimmer rim   (the bottom edge catching light) */\n\n:is(\n    button,\n    [role=\"button\"],\n    [role=\"tab\"],\n    [role=\"menuitem\"],\n    [role=\"menuitemradio\"],\n    [role=\"menuitemcheckbox\"],\n    [role=\"option\"],\n    summary,\n    a[href]\n  ):not([data-fa-plain]) {\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-gloss-top) 62%, transparent) 0 1px,\n    color-mix(in srgb, var(--fa-gloss-mid) 30%, transparent) 1px,\n    transparent 46%,\n    transparent 54%,\n    color-mix(in srgb, var(--fa-gloss-foot) 16%, transparent) 98%,\n    color-mix(in srgb, var(--fa-gloss-top) 30%, transparent) 100%\n  ) !important;\n}\n\n/* Hover and press. Both are expressed as the same gradient with different\n   opacities, so the \"material\" never changes — only how much light is on it. */\n:is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"], summary):not(:disabled):hover {\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-gloss-top) 78%, transparent) 0 1px,\n    color-mix(in srgb, var(--fa-gloss-mid) 46%, transparent) 1px,\n    transparent 50%,\n    color-mix(in srgb, var(--fa-gloss-foot) 24%, transparent) 100%\n  ) !important;\n}\n\n:is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"], summary):not(:disabled):active {\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-gloss-top) 26%, transparent) 0 2px,\n    transparent 30%,\n    color-mix(in srgb, var(--fa-gloss-foot) 30%, transparent) 100%\n  ) !important;\n}\n\n/* Disabled controls lose their gloss rather than being dimmed *and* shiny,\n   which would read as still-interactive. */\n:is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"]):disabled,\n:is(button, [role=\"button\"]):is([aria-disabled=\"true\"]) {\n  background-image: none !important;\n  filter: saturate(0.85);\n}\n\n/* Focus is the product's `outline`, which this file has not touched; it only\n   gets the Aero aqua and a soft halo so it sits in the new palette. */\n:focus-visible {\n  outline-color: var(--dsw-alias-state-business-primary) !important;\n}\n\n/* ══ 4. Inputs and editors ══════════════════════════════════════════════════\n   Text fields become inset glass wells: the gradient runs the other way (dark\n   at the top) because an inset surface is lit from *inside* the rim. */\n\n:is(input, textarea, select, [contenteditable=\"true\"], [data-lexical-editor]):not([data-composer-input]):not(\n    [data-fa-plain]\n  ) {\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--dsw-alias-bg-mask-2) 60%, transparent) 0 1px,\n    transparent 26%,\n    color-mix(in srgb, var(--fa-gloss-foot) 14%, transparent) 100%\n  ) !important;\n  border: 1px solid var(--dsw-alias-border-l2) !important;\n  box-shadow: inset 0 1px 2px color-mix(in srgb, var(--dsw-alias-bg-mask-2) 70%, transparent) !important;\n}\n\n:is(input, textarea, select):focus {\n  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary) 60%, transparent) !important;\n  box-shadow:\n    inset 0 1px 2px color-mix(in srgb, var(--dsw-alias-bg-mask-2) 60%, transparent),\n    0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-business-primary) 16%, transparent) !important;\n}\n\n::placeholder {\n  color: var(--dsw-alias-label-tertiary);\n  opacity: 1;\n}\n\n/* The product's own selection colour follows `--dsw-alias-brand-primary`, which\n   the palette has already turned aqua; this only adds the translucent wash Aero\n   uses so text under a selection stays legible. */\n::selection {\n  background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 26%, transparent);\n}\n\n/* ══ 5. Floating surfaces ═══════════════════════════════════════════════════\n   Dialogs, menus and tooltips are the moment the glass metaphor has to be\n   convincing, because they float *over* content with nothing structural\n   holding them. Heavy blur, a bright rim and a deep coloured shadow do it. */\n\n[role=\"dialog\"],\ndialog {\n  background: var(--dsw-specific-menu) !important;\n  border: 1px solid var(--dsw-alias-border-l1) !important;\n  box-shadow:\n    var(--dsw-elevation-prominent),\n    inset 0 1px 0 var(--fa-rim-light),\n    inset 0 0 0 1px color-mix(in srgb, var(--fa-rim-light) 30%, transparent) !important;\n  backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n  -webkit-backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n}\n\n[role=\"menu\"],\n[role=\"listbox\"],\n[role=\"tooltip\"],\n[role=\"grid\"],\n[data-tip] {\n  background: var(--dsw-specific-menu) !important;\n  border: 1px solid var(--dsw-alias-border-l1) !important;\n  box-shadow:\n    var(--dsw-elevation-panel),\n    inset 0 1px 0 var(--fa-rim-light) !important;\n  backdrop-filter: blur(var(--fa-blur)) saturate(var(--fa-saturate));\n  -webkit-backdrop-filter: blur(var(--fa-blur)) saturate(var(--fa-saturate));\n}\n\n[role=\"tooltip\"] {\n  background: var(--dsw-alias-tooltip-bg) !important;\n  color: var(--fa-tooltip-ink, var(--dsw-alias-label-primary-foreground)) !important;\n}\n\nhtml.fa-tier-lite :is([role=\"dialog\"], dialog, [role=\"menu\"], [role=\"listbox\"], [role=\"tooltip\"], [data-tip]),\nhtml.fa-tier-off :is([role=\"dialog\"], dialog, [role=\"menu\"], [role=\"listbox\"], [role=\"tooltip\"], [data-tip]) {\n  backdrop-filter: none;\n  -webkit-backdrop-filter: none;\n}\n\n/* The overlay layer holds full-screen scrims; the frame's own scene is the\n   backdrop, so the scrim only has to deepen contrast, not hide anything. */\n[data-shell-overlay] {\n  background: transparent !important;\n}\n\n/* ══ 6. Content ═════════════════════════════════════════════════════════════\n   Code, tables and quotes are where a themed app usually starts to look wrong,\n   because they are the surfaces most likely to have hard-coded neutrals. The\n   palette has already retinted their tokens; these rules finish the material. */\n\n[data-code-block-content],\npre {\n  border: 1px solid var(--dsw-alias-border-l1) !important;\n  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--fa-rim-light) 34%, transparent) !important;\n}\n\ncode,\nkbd {\n  border-radius: 6px;\n}\n\nkbd {\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-gloss-top) 60%, transparent) 0 1px,\n    transparent 60%,\n    color-mix(in srgb, var(--fa-gloss-foot) 24%, transparent) 100%\n  ) !important;\n  box-shadow:\n    0 1px 0 color-mix(in srgb, var(--dsw-alias-bg-mask-2) 70%, transparent),\n    inset 0 0 0 1px color-mix(in srgb, var(--fa-rim-light) 40%, transparent) !important;\n}\n\ntable {\n  border-collapse: separate;\n  border-spacing: 0;\n}\n\nth {\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-gloss-top) 40%, transparent) 0 1px,\n    transparent 100%\n  ) !important;\n}\n\nblockquote {\n  border-left: 3px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 50%, transparent) !important;\n  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 55%, transparent);\n  border-radius: 0 12px 12px 0;\n}\n\nhr {\n  border-color: var(--dsw-alias-border-l2) !important;\n}\n\n/* ══ 7. Chrome ══════════════════════════════════════════════════════════════\n   Scrollbars become aqua pills with a gloss, which is a small detail that does\n   a surprising amount of the \"this is a different product\" work. */\n\n::-webkit-scrollbar-thumb {\n  border-radius: 999px !important;\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-gloss-top) 55%, transparent) 0 1px,\n    transparent 70%\n  ) !important;\n  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--fa-rim-light) 24%, transparent);\n}\n\n::-webkit-scrollbar-thumb:hover {\n  background-image: linear-gradient(\n    180deg,\n    color-mix(in srgb, var(--fa-gloss-top) 70%, transparent) 0 1px,\n    transparent 70%\n  ) !important;\n}\n\n/* Skeleton shimmer. The product animates these already; this only recolours\n   them to the aqua ramp so loading states belong to the theme. */\n[data-loading],\n[data-document-loading] {\n  background-image: linear-gradient(\n    100deg,\n    transparent 20%,\n    color-mix(in srgb, var(--fa-gloss-top) 42%, transparent) 42%,\n    transparent 64%\n  ) !important;\n  background-size: 220% 100% !important;\n  animation: fa-shimmer 1.5s linear infinite;\n}\n\n/* The boot card, which is the very first thing the theme has to own. */\n[data-dsh-boot] {\n  background: transparent !important;\n}\n\n[data-dsh-boot] > * {\n  background: var(--dsw-alias-bg-layer-3) !important;\n  border: 1px solid var(--dsw-alias-border-l1) !important;\n  border-radius: var(--fa-radius-lg) !important;\n  padding: 28px 36px !important;\n  box-shadow:\n    var(--dsw-elevation-prominent),\n    inset 0 1px 0 var(--fa-rim-light) !important;\n  backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n  -webkit-backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n}\n\n@keyframes fa-shimmer {\n  0% {\n    background-position: 160% 0;\n  }\n  100% {\n    background-position: -60% 0;\n  }\n}\n",
      "mobile": "/*\n * mobile.css — the phone and tablet layout.\n *\n * The stock narrow layout *squeezes*: below 1024px the sidebar stays in the\n * grid, so a 390px phone gives 56px to an icon rail and 334px to the thing the\n * user is actually reading. That is the one place this reskin changes behaviour\n * rather than appearance, and it is the change that matters most.\n *\n * The model, in three breakpoints:\n *\n *   ≥ 1024px  stock three-column desktop layout, untouched.\n *   641–1023  the frame collapses to a single column and the sidebar becomes an\n *             overlay drawer: a 56px rail when closed (the tablet keeps its\n *             navigation) and a 330px pane that slides *over* the content when\n *             opened, instead of stealing width from it.\n *   ≤ 640px   the rail goes fully off-canvas, the content gets the entire\n *             viewport, and the primary navigation moves to a floating bottom\n *             dock where a thumb can reach it.\n *\n * Only `transform`, `width` and the safe-area paddings are animated or\n * expressed here, and every transition is disabled under\n * `prefers-reduced-motion` — the layout is help, not decoration, so it applies\n * at every tier.\n */\n\n/* ══ Narrow: one column, the sidebar floats over it ═════════════════════════ */\n\n@media (max-width: 1023px) {\n  /*\n   * The inline `grid-template-columns` React writes is the stock layout's whole\n   * mechanism, and it has to go: a single track is what lets the sidebar leave\n   * the flow and become a drawer. `!important` beats the inline style, which is\n   * the only way to override a value React re-writes on every drag frame.\n   */\n  [data-fa-frame] {\n    grid-template-columns: minmax(0, 1fr) !important;\n  }\n\n  /*\n   * Both remaining columns share the single track, so the drawer can overlay\n   * either of them without either having to be re-measured.\n   *\n   * Sharing a cell has a consequence that is easy to miss and was, in the first\n   * version of this file: grid items in the same cell stack in DOM order, and\n   * the right column comes *after* the centre — so a full-size, empty right\n   * column sat on top of the transcript and swallowed every tap and every\n   * scroll gesture aimed at it. `elementFromPoint` at the centre of a\n   * conversation row returned the right column, and because a touch scroll is\n   * routed through the touched element's scrollable ancestor, the transcript\n   * could not be scrolled by touch at all.\n   *\n   * The fix is to take the right column out of hit testing entirely and hand\n   * pointer events back only to its own content. When no panel is shown its\n   * children are zero-sized, so nothing is blocked; when a panel *is* shown it\n   * is a child, so it stays fully interactive — including the full-screen file\n   * preview, where the panel is the only thing on screen.\n   */\n  [data-fa-col=\"center\"] {\n    grid-area: 1 / 1 / 2 / -1 !important;\n    z-index: 2;\n  }\n\n  [data-fa-col=\"rightbar\"] {\n    grid-area: 1 / 1 / 2 / -1 !important;\n    /* Above the centre, because a panel is positioned against this column's\n       right edge and is meant to hang over the conversation. */\n    z-index: 3;\n    pointer-events: none;\n  }\n\n  [data-fa-col=\"rightbar\"] > * {\n    pointer-events: auto;\n  }\n\n  [data-fa-col=\"sidebar\"] {\n    position: absolute !important;\n    inset: 0 auto 0 0;\n    z-index: 30;\n    width: min(84vw, 330px) !important;\n    max-width: calc(100vw - 56px);\n    /* The drawer runs under the notch in landscape and stops above the home\n       indicator in portrait. */\n    padding-left: env(safe-area-inset-left, 0px);\n    padding-bottom: env(safe-area-inset-bottom, 0px);\n    /* Matches the frame's own column transition, so opening the drawer and\n       resizing a desktop column feel like the same motion. */\n    transition: width var(--ds-transition-duration-slow) var(--ds-ease-in-out);\n    /* A drawer needs to read as being *in front of* the page, which a hairline\n       border cannot do. */\n    box-shadow:\n      0 0 0 1px var(--dsw-alias-border-l1),\n      18px 0 46px -22px var(--dsw-alias-bg-mask-3),\n      inset -1px 0 0 var(--fa-rim-light) !important;\n  }\n\n  /* Closed on a tablet: the rail stays, 56px of it, exactly as wide as the\n     product's own collapsed column. */\n  [data-fa-frame][data-sidebar-collapsed] [data-fa-col=\"sidebar\"] {\n    width: 56px !important;\n    box-shadow: none !important;\n  }\n\n  /* The content keeps clear of the rail while it is a rail, and reclaims the\n     full width the moment the drawer opens over it. */\n  [data-fa-col=\"center\"] {\n    padding-left: 56px !important;\n  }\n\n  [data-fa-frame]:not([data-sidebar-collapsed]) [data-fa-col=\"center\"] {\n    padding-left: 0 !important;\n  }\n\n  /* Full-screen panels on a narrow viewport are the real content, so they sit\n     above the drawer rather than being covered by it. */\n  [data-fa-frame][data-rightbar-fullscreen] [data-fa-col=\"rightbar\"] {\n    z-index: 34;\n  }\n}\n\n/* ══ The scrim ══════════════════════════════════════════════════════════════ */\n\n[data-fa-scrim] {\n  position: absolute;\n  inset: 0;\n  z-index: 25;\n  opacity: 0;\n  background:\n    radial-gradient(120% 80% at 0% 50%, color-mix(in srgb, var(--fa-water-deep) 26%, transparent) 0%, transparent 70%),\n    var(--dsw-alias-bg-mask-2);\n  backdrop-filter: blur(2px);\n  -webkit-backdrop-filter: blur(2px);\n  transition: opacity 300ms cubic-bezier(0.22, 1, 0.36, 1);\n}\n\nbody[data-fa-drawer] [data-fa-scrim] {\n  opacity: 1;\n}\n\n/* ══ Phone: the rail goes off-canvas ════════════════════════════════════════ */\n\n@media (max-width: 640px) {\n  [data-fa-col=\"sidebar\"] {\n    width: min(84vw, 320px) !important;\n    transition: transform 340ms cubic-bezier(0.22, 1, 0.36, 1);\n  }\n\n  /* Off-canvas, not display:none — the drawer's controls stay in the DOM (the\n     dock clicks them), and `visibility` keeps them out of the tab order while\n     it is closed. */\n  [data-fa-frame][data-sidebar-collapsed] [data-fa-col=\"sidebar\"] {\n    width: min(84vw, 320px) !important;\n    transform: translate3d(-102%, 0, 0);\n    visibility: hidden;\n    transition:\n      transform 340ms cubic-bezier(0.22, 1, 0.36, 1),\n      visibility 340ms;\n  }\n\n  [data-fa-col=\"center\"] {\n    padding-left: 0 !important;\n  }\n\n  /* Room for the dock, so the composer is never underneath it. Applied to the\n     column rather than the scroll area because the transcript measures itself\n     against a composer it expects at the very bottom of the column. */\n  [data-fa-frame] [data-fa-col=\"center\"] {\n    box-sizing: border-box !important;\n    padding-bottom: calc(var(--fa-dock-height) + env(safe-area-inset-bottom, 0px) + 10px) !important;\n  }\n\n  /* While the software keyboard is up the dock is in the way and the composer\n     is the only thing that matters. */\n  body[data-fa-keyboard] [data-fa-dock] {\n    transform: translate3d(-50%, 160%, 0);\n    opacity: 0;\n    pointer-events: none;\n  }\n\n  /*\n   * The right panel is a full-screen surface on a phone — a file preview, a\n   * diff, a document. The dock stays (session navigation is still useful while\n   * reading), but the panel has to stop *above* it, or the last lines of the\n   * file are behind a floating bar with no way to scroll them into view.\n   *\n   * Padding the panel rather than the dock is deliberate: the dock's own\n   * geometry is what every other rule here is expressed against, and shrinking\n   * the panel's content box is the only change that cannot move anything else.\n   */\n  [data-fa-col=\"rightbar\"] [data-sidebar-right-panel] {\n    box-sizing: border-box !important;\n    padding-bottom: calc(var(--fa-dock-height) + env(safe-area-inset-bottom, 0px) + 12px) !important;\n  }\n}\n\n/* Landscape phones: no vertical budget for a dock. */\n@media (max-width: 900px) and (max-height: 460px) and (orientation: landscape) {\n  [data-fa-dock] {\n    display: none !important;\n  }\n\n  [data-fa-frame] [data-fa-col=\"center\"] {\n    padding-bottom: 0 !important;\n  }\n\n  [data-fa-col=\"sidebar\"] {\n    width: min(62vw, 300px) !important;\n  }\n}\n\n/* ══ The bottom dock ════════════════════════════════════════════════════════ */\n\n[data-fa-dock] {\n  display: none;\n}\n\n@media (max-width: 640px) {\n  [data-fa-dock] {\n    position: fixed;\n    left: 50%;\n    bottom: calc(8px + env(safe-area-inset-bottom, 0px));\n    z-index: 45;\n    display: flex;\n    gap: 2px;\n    align-items: stretch;\n    padding: 5px;\n    border-radius: 999px;\n    transform: translate3d(-50%, 0, 0);\n    background: var(--fa-pane-strong);\n    border: 1px solid var(--dsw-alias-border-l1);\n    box-shadow:\n      0 0 0 1px color-mix(in srgb, var(--fa-rim-light) 34%, transparent),\n      0 10px 26px -12px var(--dsw-alias-bg-mask-3),\n      inset 0 1px 0 var(--fa-rim-light),\n      inset 0 -10px 20px -16px var(--fa-inner-glow);\n    backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n    -webkit-backdrop-filter: blur(var(--fa-blur-strong)) saturate(var(--fa-saturate));\n    transition:\n      transform 280ms cubic-bezier(0.22, 1, 0.36, 1),\n      opacity 280ms ease;\n    /* The dock is chrome: it must not be selectable, draggable or callout-able\n       on a long press. */\n    -webkit-user-select: none;\n    user-select: none;\n    -webkit-touch-callout: none;\n  }\n\n  /* A drawer owns the screen while it is open; the dock gets out of its way. */\n  body[data-fa-drawer] [data-fa-dock] {\n    transform: translate3d(-50%, 160%, 0);\n    opacity: 0;\n    pointer-events: none;\n  }\n\n  .fa-dock__button {\n    position: relative;\n    width: 52px;\n    height: 42px;\n    padding: 0;\n    border: 0;\n    border-radius: 999px;\n    background-color: transparent;\n    color: var(--dsw-alias-label-secondary);\n    display: grid;\n    place-items: center;\n    cursor: pointer;\n  }\n\n  .fa-dock__button[hidden] {\n    display: none;\n  }\n\n  .fa-dock__button:active {\n    transform: scale(0.92);\n  }\n\n  /* The glyphs are drawn with masks rather than inline SVG so they inherit\n     `currentColor` from the button and need no per-state asset. */\n  .fa-dock__glyph {\n    width: 22px;\n    height: 22px;\n    background-color: currentColor;\n    -webkit-mask-repeat: no-repeat;\n    mask-repeat: no-repeat;\n    -webkit-mask-position: center;\n    mask-position: center;\n    -webkit-mask-size: contain;\n    mask-size: contain;\n    transition: transform 180ms ease;\n  }\n\n  .fa-dock__glyph--menu {\n    -webkit-mask-image: var(--fa-icon-menu);\n    mask-image: var(--fa-icon-menu);\n  }\n\n  .fa-dock__glyph--new {\n    -webkit-mask-image: var(--fa-icon-new);\n    mask-image: var(--fa-icon-new);\n  }\n\n  .fa-dock__glyph--search {\n    -webkit-mask-image: var(--fa-icon-search);\n    mask-image: var(--fa-icon-search);\n  }\n\n  .fa-dock__glyph--library {\n    -webkit-mask-image: var(--fa-icon-library);\n    mask-image: var(--fa-icon-library);\n  }\n\n  .fa-dock__glyph--settings {\n    -webkit-mask-image: var(--fa-icon-settings);\n    mask-image: var(--fa-icon-settings);\n  }\n\n  /* The active item gets the Aero \"lit lens\": an aqua bloom behind the glyph. */\n  [data-fa-dock-open] .fa-dock__button[data-fa-dock-action=\"menu\"] {\n    color: var(--dsw-alias-state-business-primary);\n  }\n\n  [data-fa-dock-open] .fa-dock__button[data-fa-dock-action=\"menu\"] .fa-dock__glyph {\n    transform: scale(1.06);\n  }\n}\n\n/* ══ The reading measure ════════════════════════════════════════════════════\n   The conversation declares\n\n     --dsh-chat-content-width: clamp(680px, columnWidth * .64, 920px)\n\n   whose *floor* is 680px. On a 390px phone that floor is wider than the\n   viewport, so every turn is laid out at 680px inside a ~350px box and clipped:\n   the transcript renders as a column of left-edge slivers. The product never\n   hits this in the stock layout because the sidebar squeezes the transcript to\n   108px first — which is worse, and is what the drawer above fixes.\n\n   Declared on `[data-conversation-scroll]` because that is the common ancestor\n   of both the transcript and the composer seat, so one declaration fixes the\n   reading column and the composer card together. `100%` rather than `100vw`\n   so the value still tracks the real column on a tablet, and `min(…, 680px)`\n   so a viewport wide enough for the product's own measure keeps it. */\n\n@media (max-width: 1023px) {\n  [data-conversation-scroll] {\n    --dsh-chat-content-width: min(100%, 680px) !important;\n  }\n}\n\n/* ══ Touch ergonomics ═══════════════════════════════════════════════════════\n   Applies on any coarse pointer, at any width — a touch laptop deserves the\n   same hit areas as a phone. */\n\n@media (pointer: coarse) {\n  /*\n   * A touch target that does not move anything.\n   *\n   * The obvious way to get a 44px target is `min-width: 44px`, and it is wrong\n   * on an application you do not own. The chat header's \"choose an app to open\n   * in\" control is 22x26 and centres its 11px chevron with `padding-left: 4px`\n   * under `justify-content: normal` — that is, the product positions the glyph\n   * from the box's *left edge*. Widen the box and the glyph stays put while the\n   * box grows around it, so the icon ends up 11.5px off-centre: measured, not\n   * guessed.\n   *\n   * So the target is grown with a pseudo-element instead. It is centred on the\n   * control, takes pointer events as part of it, and changes no layout at all —\n   * nothing can be pushed out of alignment because nothing is resized.\n   *\n   * `::before` is free to use here: the hover sheen that also wants it lives\n   * inside a `(hover: hover) and (pointer: fine)` query, so a device is never\n   * both. The press ring keeps `::after` on every device.\n   *\n   * Inline prose links are deliberately excluded. A 44px invisible box around a\n   * word inside a paragraph would overlap the words beside it and steal taps\n   * meant for text selection, and a link in a sentence is read, not aimed at.\n   */\n  :is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"], summary)::before {\n    content: '';\n    position: absolute;\n    left: 50%;\n    top: 50%;\n    width: max(100%, 44px);\n    height: max(100%, 44px);\n    transform: translate(-50%, -50%);\n  }\n\n  /* Dense icon clusters (toolbars, message actions, file rows) get a smaller\n     area on purpose: their controls sit on a ~36px pitch, and a 44px halo would\n     overlap both neighbours and make the strip harder to hit accurately. */\n  :is([data-actions-reveal], [data-message-attachments], [data-composer-stats], [data-files-row], [data-turn-tail])\n    :is(button, [role=\"button\"])::before {\n    width: max(100%, 36px);\n    height: max(100%, 36px);\n  }\n\n  /*\n   * iOS Safari zooms the whole page when a focused field's text is under 16px,\n   * and the zoom is sticky — the user then has to pinch back out. The composer's\n   * own sizing stays intact; only the floor moves.\n   */\n  :is(input, textarea, select, [contenteditable=\"true\"]) {\n    font-size: max(16px, 1em);\n  }\n\n  /* Kills the 300ms tap delay and the double-tap-zoom gesture without touching\n     pinch-zoom, which stays available for accessibility. */\n  :is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"], summary, label) {\n    touch-action: manipulation;\n  }\n\n  /* Text that is not meant to be selected must not pop a callout on long press\n     — but real content keeps its selection, which is the point of a chat UI. */\n  :is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [data-fa-dock], [data-fa-col=\"sidebar\"]) {\n    -webkit-touch-callout: none;\n    -webkit-user-select: none;\n    user-select: none;\n  }\n\n  /* Scroll containers: momentum, a contained overscroll (so a flick at the end\n     of the transcript does not bounce the page), and no scroll anchoring jumps\n     while streaming. */\n  :is([data-conversation-scroll], [data-trajectory-scroll], [data-approval-scroll], [data-input-scroll], [data-files-entry]) {\n    -webkit-overflow-scrolling: touch;\n    overscroll-behavior: contain;\n  }\n\n  [data-conversation-scroll] {\n    overscroll-behavior-y: contain;\n  }\n}\n\n/* ══ The keyboard ═══════════════════════════════════════════════════════════\n   iOS does not resize the layout viewport when the software keyboard opens; it\n   only shrinks `visualViewport`. Without this the composer sits underneath the\n   keyboard, which is the single most common mobile web-app defect. */\n\nbody[data-fa-keyboard] [data-composer-seat] {\n  transform: translate3d(0, calc(-1 * var(--fa-keyboard)), 0);\n  transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1);\n}\n\nbody[data-fa-keyboard] [data-fa-col=\"center\"] {\n  padding-bottom: env(safe-area-inset-bottom, 0px) !important;\n}\n\n/* ══ Dynamic viewport height ════════════════════════════════════════════════\n   `100vh` on a phone is the *large* viewport: the bottom of the layout sits\n   behind the browser's collapsing toolbar. `dvh` tracks the real visible area.\n   The product measures in `px` and is unaffected; this only corrects the frame\n   when it is sized from the viewport. */\n\n@supports (height: 100dvh) {\n  @media (max-width: 1023px) {\n    html,\n    body,\n    #root {\n      height: 100dvh;\n      min-height: 100dvh;\n    }\n  }\n}\n\n/* ══ Reduced motion ═════════════════════════════════════════════════════════ */\n\n@media (prefers-reduced-motion: reduce) {\n  [data-fa-col=\"sidebar\"],\n  [data-fa-scrim],\n  [data-fa-dock],\n  .fa-dock__button,\n  .fa-dock__glyph,\n  body[data-fa-keyboard] [data-composer-seat] {\n    transition: none !important;\n  }\n}\n\n/* ══ The Trajectory view ════════════════════════════════════════════════════\n   The trajectory panel is a real two-column table — a 50px timeline gutter and\n   a content cell — and on a phone the content cell is exactly the width that is\n   left over, with `white-space: nowrap; overflow: hidden; text-overflow: clip`.\n   A row therefore shows the first forty characters of a line that can be three\n   thousand pixels long, and cuts off mid-glyph with no sign that anything is\n   missing. That is the \"uncomfortable on mobile\" part.\n\n   ## What is deliberately not changed\n\n   **Row height.** The list is virtualised, and the product positions it from a\n   fixed constant:\n\n       const CONTENT_ROW_HEIGHT = 30;\n\n   passed as `estimateSize` to the virtualiser, with **no `measureElement`** —\n   there is no measurement pass to correct a wrong estimate. Below 100 rows the\n   virtualiser is off entirely (`VIRTUALIZATION_THRESHOLD`) and taller rows would\n   look fine, which is exactly what makes this dangerous: it would work in\n   testing and break on a long session, where rows would overlap and the spacer\n   heights would drift. A skin does not get to desynchronise a list's layout\n   model, so the 30px row stays and the reading problem is solved sideways.\n\n   ## What is changed\n\n   The row keeps its height and its width, and its *content* becomes readable:\n   the cell scrolls horizontally under a finger, so a long line can be dragged\n   into view instead of being lost. Truncation is made visible with an ellipsis,\n   and the row gets a press affordance. All of it is scoped to coarse pointers\n   at narrow widths, so the desktop table is byte-for-byte what it was. */\n\n@media (pointer: coarse) and (max-width: 1023px) {\n  /* A hard cut at the cell edge reads as a rendering fault; an ellipsis reads as\n     \"there is more here\", which is also the affordance for the swipe below. */\n  [data-trajectory-scroll] tr[data-trajectory-row-key] > td {\n    text-overflow: ellipsis;\n  }\n\n  /* The horizontal scroller is not the cell — the cell fits its column exactly.\n     The clipping happens in *descendants*: for one tool call the request span is\n     180px wide holding 1627px of text, and the inline result holds 209px in\n     123px. So the rule goes on the subtree.\n\n     It can be this blunt because `overflow` does not apply to non-replaced\n     inline boxes: the payload spans that actually hold the long text are\n     `display: inline` and are left alone, while the block, grid and flex\n     wrappers that were doing the clipping become the scrollers.\n\n     Deliberately no `touch-action` override: a vertical drag inside one of these\n     must still scroll the list, and left alone the browser picks the axis from\n     the gesture — which is the behaviour we want and is not reproducible by\n     hand-declaring one axis. */\n  [data-trajectory-scroll] tr[data-trajectory-row-key] > td:last-child,\n  [data-trajectory-scroll] tr[data-trajectory-row-key] > td:last-child * {\n    overflow-x: auto;\n    /* `visible` is not available on one axis while the other scrolls — the\n       browser would compute it to `auto` and let a 19px line grow. */\n    overflow-y: hidden;\n    -webkit-overflow-scrolling: touch;\n    overscroll-behavior-x: contain;\n    scrollbar-width: none;\n  }\n\n  [data-trajectory-scroll] tr[data-trajectory-row-key] > td:last-child::-webkit-scrollbar,\n  [data-trajectory-scroll] tr[data-trajectory-row-key] > td:last-child *::-webkit-scrollbar {\n    display: none;\n  }\n\n  /* The timeline gutter is the anchor the rows are read against, so it stays\n     while the content beside it moves. It needs an opaque backdrop of its own,\n     or the scrolled text shows through it. */\n  [data-trajectory-scroll] tr[data-trajectory-row-key] > td:first-child {\n    position: sticky;\n    left: 0;\n    z-index: 2;\n    background: var(--dsw-alias-bg-base);\n    backdrop-filter: blur(10px) saturate(1.2);\n    -webkit-backdrop-filter: blur(10px) saturate(1.2);\n    box-shadow: 1px 0 0 var(--dsw-alias-border-l2);\n  }\n\n  /* 30px is short for a target but it is the row height we may not change, so\n     the row gets the feedback it can have: no 300ms tap delay, no double-tap\n     zoom, and a gloss that confirms the press. */\n  [data-trajectory-scroll] tr[data-trajectory-row-key] {\n    touch-action: manipulation;\n  }\n\n  [data-trajectory-scroll] tr[data-trajectory-row-key]:active > td {\n    background-image: linear-gradient(\n      180deg,\n      color-mix(in srgb, var(--fa-gloss-top) 30%, transparent) 0 1px,\n      transparent 100%\n    );\n  }\n}\n\nhtml.fa-tier-lite [data-trajectory-scroll] tr[data-trajectory-row-key] > td:first-child,\nhtml.fa-tier-off [data-trajectory-scroll] tr[data-trajectory-row-key] > td:first-child {\n  /* Below the top tier the pane under the gutter is opaque anyway, so the blur\n     would cost a filter for no visible difference. */\n  backdrop-filter: none;\n  -webkit-backdrop-filter: none;\n  background: var(--dsw-alias-bg-layer-3);\n}\n\n/* ══ A product modal that lives inside the sidebar ══════════════════════════\n   `sidebar.settings` is a slot *inside* the sidebar column, so the settings\n   panel and its scrim are part of that subtree. Taking the column off-canvas\n   therefore takes the dialog with it — the gear appeared to do nothing until\n   the user separately opened the drawer.\n\n   Lifting the `transform` is the load-bearing part, and for a reason that is\n   not obvious: a transform makes the element a containing block for\n   `position: fixed` descendants, and the dialog's scrim is fixed. Removing it\n   lets the scrim resolve against the viewport again, while `left` keeps the\n   column itself off screen — an offset moves the column without re-anchoring\n   anything. Measured: the panel sits at 23,23 in both cases, but only with the\n   transform gone is that 23,23 *of the viewport* rather than of a column parked\n   at -327px. */\n\n@media (max-width: 1023px) {\n  body[data-fa-dialog] [data-fa-col=\"sidebar\"] {\n    transform: none !important;\n    visibility: visible !important;\n    /* Above the dock: the dialog is modal and the dock is not part of it. */\n    z-index: 70 !important;\n  }\n\n  body[data-fa-dialog] [data-fa-dock] {\n    opacity: 0;\n    pointer-events: none;\n    transform: translate3d(-50%, 160%, 0);\n  }\n}\n\n@media (max-width: 640px) {\n  /* The column is off-canvas on a phone anyway; keep it there by position\n     rather than by transform, so nothing inside it is re-anchored. */\n  body[data-fa-dialog] [data-fa-col=\"sidebar\"] {\n    left: -102% !important;\n  }\n}\n\n/* ══ The settings dialog on a phone ═════════════════════════════════════════\n   The panel is `display: flex` with two children: a `<nav>` rail and a content\n   division. At 390px the rail takes 188px and the content is left 154px, so\n   every label wraps to one character per line — 权/限, 完/全/权/限 — and the\n   theme cards become three narrow columns. It is not a spacing problem; the\n   dialog is still laid out for a desktop window.\n\n   The rewrite is one column: the rail becomes a horizontally scrolling tab\n   strip with its title pinned, and the content takes the full width. Scoped\n   with `:has(> nav)` so it can only ever match the dialog that has a nav rail\n   — every other `[role=\"dialog\"]` in the product is left exactly as it was. */\n\n@media (max-width: 640px) {\n  [role=\"dialog\"]:has(> nav) {\n    position: fixed !important;\n    inset: 0 !important;\n    width: auto !important;\n    height: auto !important;\n    max-width: none !important;\n    max-height: none !important;\n    border-radius: 0 !important;\n    flex-direction: column !important;\n    overflow: hidden !important;\n  }\n\n  /* The rail becomes a tab strip. */\n  [role=\"dialog\"]:has(> nav) > nav {\n    flex: none !important;\n    flex-direction: row !important;\n    align-items: center !important;\n    gap: 6px !important;\n    width: 100% !important;\n    height: auto !important;\n    padding: calc(8px + env(safe-area-inset-top, 0px)) 10px 8px !important;\n    border-right: 0 !important;\n    border-bottom: 1px solid var(--dsw-alias-border-l2);\n    overflow: hidden !important;\n  }\n\n  /* Title pinned, tabs scrolling under it. */\n  [role=\"dialog\"]:has(> nav) > nav > *:first-child {\n    flex: none !important;\n    margin: 0 4px 0 0 !important;\n  }\n\n  [role=\"dialog\"]:has(> nav) > nav > *:last-child {\n    flex: 1 1 auto !important;\n    flex-direction: row !important;\n    width: auto !important;\n    min-width: 0;\n    gap: 4px;\n    overflow-x: auto;\n    overscroll-behavior-x: contain;\n    scrollbar-width: none;\n  }\n\n  [role=\"dialog\"]:has(> nav) > nav > *:last-child::-webkit-scrollbar {\n    display: none;\n  }\n\n  /* Each tab sizes to its label instead of the rail's fixed 164px column, and\n     the label stops reserving 112px of its own. */\n  [role=\"dialog\"]:has(> nav) > nav button {\n    flex: none !important;\n    width: auto !important;\n    min-height: 44px;\n    padding: 0 12px !important;\n    gap: 6px !important;\n    white-space: nowrap;\n  }\n\n  [role=\"dialog\"]:has(> nav) > nav button span {\n    width: auto !important;\n    white-space: nowrap;\n  }\n\n  /* Content takes the rest of the column and owns the scrolling. */\n  [role=\"dialog\"]:has(> nav) > div {\n    flex: 1 1 auto !important;\n    width: 100% !important;\n    min-height: 0;\n    min-width: 0;\n    overflow-y: auto;\n    overscroll-behavior-y: contain;\n    padding-bottom: env(safe-area-inset-bottom, 0px);\n  }\n}\n",
      "effects": "/*\n * effects.css — the animation tier.\n *\n * Everything here is additive polish, which means everything here is also the\n * first thing that may be dropped. Three rules keep it from becoming a tax:\n *\n *   1. **Only `transform` and `opacity`.** No width, height, top, filter,\n *      box-shadow or background-position animation anywhere in this file —\n *      those force layout, paint or a filter re-run on the main thread, and a\n *      chat transcript is a bad place to be spending main-thread time.\n *   2. **Entrances only on things that mount once.** Dialogs, menus and\n *      popovers appear because the user asked for them. Message rows are\n *      deliberately *not* animated: the transcript virtualises, so a row\n *      re-animates every time it scrolls back into view, which reads as a\n *      glitch rather than as polish.\n *   3. **Nothing watches the transcript.** No `:has()` selector is anchored on\n *      something that changes while the model streams; a document-wide\n *      re-match per token is a real cost, and it would be invisible to the\n *      person paying it.\n *\n * The press ring and hover sheen use `::before`/`::after` on interactive\n * elements. That is safe here specifically because the product defines no\n * pseudo-element on `button` at all — verified against its bundled CSS — so\n * there is nothing to displace.\n */\n\n/* ══ Floating surfaces: the Aero spring ═════════════════════════════════════\n   A short overshoot on Y plus a scale from 0.96 — enough to feel like the pane\n   was *placed* rather than having always been there. */\n\n[role=\"dialog\"],\n[role=\"menu\"],\n[role=\"listbox\"],\n[role=\"tooltip\"],\n[data-tip] {\n  /* `backwards`, never `both`: a forwards-filling animation outranks *inline*\n     styles for the properties it animates, so `both` would permanently pin\n     `transform` on any menu the product positions with a transform of its own.\n     `backwards` still holds the entrance state through the first frame. */\n  animation: fa-surface-in 240ms cubic-bezier(0.22, 1.2, 0.36, 1) backwards;\n  transform-origin: var(--fa-origin, 50% 0%);\n}\n\n/* A tooltip has no user-initiated delay; it should arrive, not perform. */\n[role=\"tooltip\"],\n[data-tip] {\n  animation-duration: 140ms;\n}\n\n[role=\"status\"] {\n  animation: fa-toast-in 300ms cubic-bezier(0.22, 1.2, 0.36, 1) backwards;\n}\n\n@keyframes fa-surface-in {\n  from {\n    opacity: 0;\n    transform: translate3d(0, -8px, 0) scale(0.96);\n  }\n  to {\n    opacity: 1;\n    transform: translate3d(0, 0, 0) scale(1);\n  }\n}\n\n@keyframes fa-toast-in {\n  from {\n    opacity: 0;\n    transform: translate3d(0, 18px, 0) scale(0.97);\n  }\n  to {\n    opacity: 1;\n    transform: translate3d(0, 0, 0) scale(1);\n  }\n}\n\n/* ══ The boot card ══════════════════════════════════════════════════════════\n   The first frame the theme owns: a short rise on the card, and a glow behind\n   the product's own spinner so the wait belongs to the theme too. */\n\n[data-dsh-boot] > * {\n  animation: fa-boot-in 460ms cubic-bezier(0.22, 1, 0.36, 1) backwards;\n}\n\n[data-dsh-boot-spinner] {\n  box-shadow: 0 0 18px color-mix(in srgb, var(--dsw-alias-state-business-primary) 40%, transparent);\n}\n\n@keyframes fa-boot-in {\n  from {\n    opacity: 0;\n    transform: translate3d(0, 14px, 0) scale(0.98);\n  }\n  to {\n    opacity: 1;\n    transform: translate3d(0, 0, 0) scale(1);\n  }\n}\n\n/* ══ The press acknowledgement ══════════════════════════════════════════════\n   A one-shot ring that expands and fades from the control's centre. Driven by\n   `:active` rather than by JavaScript, so it costs nothing when idle; and\n   because it is `transform`/`opacity` it never repaints the control it is drawn\n   on. The haptic that accompanies it lives in runtime.js. */\n\n/* Both pseudo-elements need a positioning context. Coarse pointers put the\n   invisible touch target on `::before` and fine pointers put the hover sheen\n   there; they are mutually exclusive by media query. */\n:is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"], summary) {\n  position: relative;\n}\n\n:is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"]):not(:disabled)::after {\n  content: \"\";\n  position: absolute;\n  inset: -2px;\n  border-radius: inherit;\n  pointer-events: none;\n  opacity: 0;\n  border: 2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 55%, transparent);\n  transform: scale(0.82);\n}\n\n:is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"]):not(:disabled):active::after {\n  animation: fa-press-ring 420ms cubic-bezier(0.22, 1, 0.36, 1) both;\n}\n\n@keyframes fa-press-ring {\n  0% {\n    opacity: 0.75;\n    transform: scale(0.9);\n  }\n  100% {\n    opacity: 0;\n    transform: scale(1.14);\n  }\n}\n\n/* ══ The hover sheen ════════════════════════════════════════════════════════\n   Fine pointers only, and expressed as `opacity` on a pseudo-element rather\n   than as a `background-position` animation: a sweep that repaints a button is\n   fine on one element and a problem in a sixty-button toolbar. */\n\n@media (hover: hover) and (pointer: fine) {\n  :is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"]):not(:disabled)::before {\n    content: \"\";\n    position: absolute;\n    inset: 0;\n    border-radius: inherit;\n    pointer-events: none;\n    opacity: 0;\n    background: linear-gradient(\n      100deg,\n      transparent 30%,\n      color-mix(in srgb, var(--fa-gloss-top) 42%, transparent) 48%,\n      transparent 66%\n    );\n    transition: opacity 260ms ease;\n  }\n\n  :is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"]):not(:disabled):hover::before {\n    opacity: 1;\n  }\n\n  /* Sidebar rows get a wider version: they are large, they are the main\n     navigation, and the sheen is what makes them read as glass. */\n  [data-fa-col=\"sidebar\"] :is(button, [role=\"button\"])::before {\n    background: linear-gradient(\n      100deg,\n      transparent 18%,\n      color-mix(in srgb, var(--fa-gloss-top) 34%, transparent) 46%,\n      transparent 74%\n    );\n  }\n}\n\n/* ══ The active navigation item ═════════════════════════════════════════════\n   Aero's \"lit lens\": the selected row carries its own light source, so it is\n   drawn with an aqua bloom behind it on top of the product's own active fill. */\n\n[data-fa-col=\"sidebar\"] :is([data-active], [aria-current=\"page\"], [data-selected]) {\n  box-shadow:\n    inset 0 1px 0 var(--fa-rim-light),\n    inset 0 0 18px -6px var(--fa-inner-glow),\n    0 1px 3px -1px var(--dsw-alias-bg-mask-2) !important;\n}\n\n/* ══ The dock's arrival ═════════════════════════════════════════════════════\n   An entrance, not a loop. The obvious flourish here is a slow idle float, and\n   it was the first thing tried — then removed, for two reasons that matter more\n   than the effect did. A primary navigation target that never stops moving\n   moves *under the user's thumb*, and a permanently animating element keeps the\n   compositor awake for the entire life of the page. A one-shot settle keeps the\n   polish and costs nothing after 420ms. */\n\n@media (pointer: coarse) and (max-width: 640px) {\n  html.fa-tier-full [data-fa-dock],\n  html.fa-tier-lite [data-fa-dock] {\n    animation: fa-dock-arrive 420ms cubic-bezier(0.22, 1.2, 0.36, 1) backwards;\n  }\n}\n\n@keyframes fa-dock-arrive {\n  from {\n    opacity: 0;\n    transform: translate3d(-50%, 26px, 0) scale(0.94);\n  }\n  to {\n    opacity: 1;\n    transform: translate3d(-50%, 0, 0) scale(1);\n  }\n}\n\n/* ══ Prohibited below the full tier ═════════════════════════════════════════\n   The `lite` tier keeps the palette, the material and the mobile layout, and\n   drops every *decorative* animation. The tier classes are on `<html>`; the\n   wallpaper's own loops are gated separately, in scenery.css. */\n\nhtml.fa-tier-lite :is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"])::after,\nhtml.fa-tier-off :is(button, [role=\"button\"], [role=\"tab\"], [role=\"menuitem\"], [role=\"option\"])::after {\n  display: none;\n}\n\nhtml.fa-tier-off :is([role=\"dialog\"], [role=\"menu\"], [role=\"listbox\"], [role=\"tooltip\"], [data-tip], [role=\"status\"]) {\n  animation: none !important;\n}\n\n/* A background tab has no business compositing a wallpaper, and some engines\n   keep doing it. This is the only global animation rule in the plugin. */\nhtml[data-fa-idle] * {\n  animation-play-state: paused !important;\n}\n\n/* ══ Reduced motion ═════════════════════════════════════════════════════════\n   The user's own setting beats every tier decision above. */\n\n@media (prefers-reduced-motion: reduce) {\n  *,\n  *::before,\n  *::after {\n    animation-duration: 0.001ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.001ms !important;\n    scroll-behavior: auto !important;\n  }\n}\n",
		};
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
