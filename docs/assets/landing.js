/*
 * dsh-frutiger-aero — landing page behaviour.
 *
 * No framework, no build, no dependency. The whole file is about 6 KB and does
 * five things: it decides how much effect the device can afford, it builds the
 * bubble population, it switches language and colour scheme, it reveals
 * sections as they arrive, and it stops every off-screen loop.
 *
 * The rule it shares with the plugin: **a hint you claim is a cost you pay for
 * ever after**. There is no `will-change` here and no rAF loop running when
 * nothing is happening — the only continuous work is what the compositor does
 * on its own, and it is switched off the moment it cannot be seen.
 */
;(function () {
  'use strict'

  var root = document.documentElement
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  /* ── 1. How much can this device afford? ──────────────────────────────── */

  function pickTier() {
    // An explicit `?effects=lite|full` wins, so the page can be shown on a wall
    // display or a low-end phone without editing anything.
    var forced = new URLSearchParams(location.search).get('effects')
    if (forced === 'lite' || forced === 'full') return forced
    if (reduceMotion.matches) return 'lite'
    var connection = navigator.connection
    if (connection && connection.saveData) return 'lite'
    var cores = navigator.hardwareConcurrency || 4
    var memory = navigator.deviceMemory || 4
    var coarse = window.matchMedia('(pointer: coarse)').matches
    if (cores <= 4 || memory <= 3) return 'lite'
    if (coarse && Math.min(innerWidth, innerHeight) <= 820) return 'lite'
    return 'full'
  }

  var tier = pickTier()
  root.classList.toggle('is-lite', tier === 'lite')

  /* ── 2. The bubble population ─────────────────────────────────────────────
     Seeded, so the wallpaper is the same composition on every load instead of a
     different scatter each time — and so a screenshot of it is reproducible. */

  function seeded(seed) {
    var state = seed >>> 0
    return function () {
      state = (state + 0x6d2b79f5) >>> 0
      var t = state
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  function buildBubbles() {
    var host = document.querySelector('.scene__bubbles')
    if (!host) return
    var count = tier === 'lite' ? 9 : 20
    var random = seeded(0x5eeda3a0)
    var fragment = document.createDocumentFragment()
    for (var i = 0; i < count; i++) {
      var size = 12 + Math.round(random() * 78)
      var bubble = document.createElement('i')
      bubble.className = 'scene__bubble'
      bubble.setAttribute('aria-hidden', 'true')
      bubble.style.cssText =
        '--x:' + (random() * 104 - 2).toFixed(2) + '%;' +
        '--size:' + size + 'px;' +
        '--drift:' + (random() * 16 - 8).toFixed(2) + 'vw;' +
        '--lift:' + (random() * 22 - 6).toFixed(2) + 'vh;' +
        '--duration:' + (16 + random() * 26).toFixed(2) + 's;' +
        '--delay:' + (-random() * 34).toFixed(2) + 's;' +
        '--opacity:' + (0.28 + random() * 0.5).toFixed(3)
      fragment.appendChild(bubble)
    }
    host.appendChild(fragment)
  }

  /* ── 3. Language ──────────────────────────────────────────────────────────
     Both languages are in the markup; this only decides which one is shown.
     The choice persists, and a first visit follows the browser. */

  var TITLES = {
    en: 'Frutiger Aero for DeepSeek Harness — a glass UI skin that fits a phone',
    zh: 'Frutiger Aero for DeepSeek Harness — 玻璃质感皮肤，手机端也顺手',
  }

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key) || undefined
      localStorage.setItem(key, value)
    } catch (error) {
      /* a partitioned or read-only storage is not a reason to break the page */
    }
    return undefined
  }

  function setLang(lang, persist) {
    root.setAttribute('data-lang', lang)
    root.setAttribute('lang', lang === 'zh' ? 'zh-Hans' : 'en')
    document.title = TITLES[lang]
    var buttons = document.querySelectorAll('[data-set-lang]')
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', String(buttons[i].dataset.setLang === lang))
    }
    if (persist) store('fa-lang', lang)
  }

  function initLang() {
    var saved = store('fa-lang')
    var browser = (navigator.language || 'en').toLowerCase()
    setLang(saved || (browser.indexOf('zh') === 0 ? 'zh' : 'en'), false)
    document.addEventListener('click', function (event) {
      var button = event.target.closest('[data-set-lang]')
      if (button) setLang(button.dataset.setLang, true)
    })
  }

  /* ── 4. Colour scheme ─────────────────────────────────────────────────────
     Follows the OS until the visitor chooses, then remembers. */

  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

  function setScheme(scheme, persist) {
    root.setAttribute('data-scheme', scheme)
    var button = document.querySelector('[data-toggle-scheme]')
    if (button) button.setAttribute('aria-pressed', String(scheme === 'dark'))
    if (persist) store('fa-scheme', scheme)
  }

  function initScheme() {
    var saved = store('fa-scheme')
    setScheme(saved || (darkQuery.matches ? 'dark' : 'light'), false)
    document.addEventListener('click', function (event) {
      if (!event.target.closest('[data-toggle-scheme]')) return
      setScheme(root.getAttribute('data-scheme') === 'dark' ? 'light' : 'dark', true)
    })
    darkQuery.addEventListener('change', function (event) {
      if (store('fa-scheme')) return
      setScheme(event.matches ? 'dark' : 'light', false)
    })
  }

  /* ── 5. Reveal, and stop what cannot be seen ──────────────────────────────
     One observer per concern, both disconnected as soon as they have nothing
     left to do. The second is the performance half of the animation budget:
     a section that is off screen has every loop inside it paused, so a long
     page never animates more than the viewport can show. */

  function initObservers() {
    var reveals = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < reveals.length; i++) reveals[i].classList.add('is-in')
      return
    }

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-in')
          revealObserver.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    for (var j = 0; j < reveals.length; j++) revealObserver.observe(reveals[j])

    var sections = document.querySelectorAll('[data-loop-scope]')
    var loopObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle('is-offscreen', !entry.isIntersecting)
        })
      },
      { rootMargin: '200px 0px' },
    )
    for (var k = 0; k < sections.length; k++) loopObserver.observe(sections[k])
  }

  /* ── 6. Header shadow ─────────────────────────────────────────────────── */

  function initHeader() {
    var header = document.querySelector('.header')
    if (!header || !('IntersectionObserver' in window)) return
    var sentinel = document.createElement('div')
    sentinel.setAttribute('aria-hidden', 'true')
    header.parentNode.insertBefore(sentinel, header)
    new IntersectionObserver(
      function (entries) {
        header.classList.toggle('is-stuck', !entries[0].isIntersecting)
      },
      { threshold: 0 },
    ).observe(sentinel)
  }

  /* ── 7. Copy buttons ──────────────────────────────────────────────────────
     `navigator.clipboard` needs a secure context; the fallback selects the text
     so a `file://` preview still works. */

  function initCopy() {
    document.addEventListener('click', function (event) {
      var button = event.target.closest('[data-copy]')
      if (!button) return
      var source = document.getElementById(button.dataset.copy)
      if (!source) return
      var text = source.textContent.trim()
      var done = function () {
        // The button carries both languages as separate labels, so the feedback
        // is a state flip the stylesheet renders — never a text swap, which
        // would have to write over the language switch.
        button.dataset.copied = 'true'
        setTimeout(function () {
          button.dataset.copied = 'false'
        }, 1600)
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, done)
        return
      }
      var range = document.createRange()
      range.selectNodeContents(source)
      var selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      done()
    })
  }

  /* ── 8. Hero parallax ─────────────────────────────────────────────────────
     One pointer listener, one rAF-throttled write, and only on a fine pointer
     at the top tier. It writes a transform on two elements and nothing else, so
     it can never trigger layout. */

  function initParallax() {
    if (tier !== 'full' || !window.matchMedia('(pointer: fine)').matches) return
    var laptop = document.querySelector('.device--laptop')
    var phone = document.querySelector('.device--phone')
    if (!laptop || !phone) return

    var pending = false
    var targetX = 0
    var targetY = 0
    var currentX = 0
    var currentY = 0
    var running = false

    function frame() {
      currentX += (targetX - currentX) * 0.12
      currentY += (targetY - currentY) * 0.12
      laptop.style.transform = 'translate3d(' + (currentX * 10).toFixed(2) + 'px,' + (currentY * 8).toFixed(2) + 'px,0)'
      phone.style.transform = 'translate3d(' + (currentX * 20).toFixed(2) + 'px,' + (currentY * 16).toFixed(2) + 'px,0)'
      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        requestAnimationFrame(frame)
      } else {
        running = false
      }
    }

    window.addEventListener(
      'pointermove',
      function (event) {
        targetX = event.clientX / innerWidth - 0.5
        targetY = event.clientY / innerHeight - 0.5
        if (pending) return
        pending = true
        requestAnimationFrame(function () {
          pending = false
          if (running) return
          running = true
          requestAnimationFrame(frame)
        })
      },
      { passive: true },
    )
  }

  /* ── 9. Stop everything in a background tab ───────────────────────────── */

  function initIdle() {
    function sync() {
      root.classList.toggle('is-idle', document.hidden)
    }
    document.addEventListener('visibilitychange', sync)
    sync()
  }

  /* ── Boot ─────────────────────────────────────────────────────────────── */

  function boot() {
    initLang()
    initScheme()
    buildBubbles()
    initObservers()
    initHeader()
    initCopy()
    initParallax()
    initIdle()

    // Expose the tier so the page can be checked from a console or a test.
    window.__LANDING__ = { tier: tier, lang: function () { return root.getAttribute('data-lang') } }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
  else boot()
})()
