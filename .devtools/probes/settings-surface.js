/**
 * Where the settings surface actually mounts, and whether it is visible.
 *
 * The dock's settings button presses the product's own `settings.trigger`,
 * which lives in the sidebar. If the surface it opens is rendered *inside* the
 * sidebar subtree, then the plugin's off-canvas treatment for phones — a
 * translate plus `visibility: hidden` — takes it off screen with it. A check
 * that only counted `[role="dialog"]` nodes would still pass, which is exactly
 * how that shipped.
 */
() => {
  const surfaces = [
    ...document.querySelectorAll('[role="dialog"], [role="menu"], [role="listbox"], [data-slot], [data-sidebar-right-panel]'),
  ].filter((el) => {
    const b = el.getBoundingClientRect()
    return b.width > 60 && b.height > 60
  })

  const ancestry = (el) => {
    const chain = []
    let n = el
    while (n && n !== document.body && chain.length < 10) {
      const cls = typeof n.className === 'string' && n.className ? n.className.split(' ')[0].slice(0, 24) : ''
      const slot = n.getAttribute('data-slot')
      const col = n.getAttribute('data-fa-col')
      const cs = getComputedStyle(n)
      const b = n.getBoundingClientRect()
      chain.push(
        n.tagName.toLowerCase() +
          (cls ? '.' + cls : '') +
          (slot ? '[slot=' + slot + ']' : '') +
          (col ? '[fa-col=' + col + ']' : '') +
          ' ' +
          Math.round(b.width) + 'x' + Math.round(b.height) + '@' + Math.round(b.left) + ',' + Math.round(b.top) +
          ' vis=' + cs.visibility +
          ' ovf=' + cs.overflow +
          ' tf=' + (cs.transform === 'none' ? 'none' : 'yes'),
      )
      n = n.parentElement
    }
    return chain
  }

  const dialogs = [...document.querySelectorAll('[role="dialog"]')]
  const insideSidebar = dialogs.filter((d) => d.closest('[data-fa-col="sidebar"]') !== null)

  return {
    dialogs: dialogs.length,
    dialogsInsideSidebar: insideSidebar.length,
    sidebar: (() => {
      const col = document.querySelector('[data-fa-col="sidebar"]')
      if (!col) return null
      const cs = getComputedStyle(col)
      const b = col.getBoundingClientRect()
      return {
        box: Math.round(b.width) + 'x' + Math.round(b.height) + '@' + Math.round(b.left) + ',' + Math.round(b.top),
        visibility: cs.visibility,
        transform: cs.transform,
      }
    })(),
    onScreen: surfaces
      .filter((el) => el.getAttribute('data-slot') === null)
      .slice(0, 3)
      .map((el) => {
        const b = el.getBoundingClientRect()
        return {
          where: ancestry(el)[0],
          box: Math.round(b.width) + 'x' + Math.round(b.height) + '@' + Math.round(b.left) + ',' + Math.round(b.top),
          onScreen: b.right > 0 && b.left < window.innerWidth && b.bottom > 0 && b.top < window.innerHeight,
        }
      }),
    firstDialogChain: dialogs[0] ? ancestry(dialogs[0]) : null,
  }
}
