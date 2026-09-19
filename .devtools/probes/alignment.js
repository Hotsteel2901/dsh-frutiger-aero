/**
 * Find controls that are visually off-centre, overlapping, or clipped.
 *
 * "Misaligned" is a visual claim, so this measures geometry rather than reading
 * intent: for every interactive element it compares the element's own centre
 * with the centre of what it actually paints — its icon, its label, the box its
 * children occupy — and reports the ones that disagree by more than a pixel or
 * two. It also reports anything overlapping a sibling, and anything whose
 * painted content is clipped by its own box, since both read as "错位" to a user.
 */
() => {
  const TOLERANCE = 1.5
  const interactive = 'button, a[href], [role="button"], [role="tab"], summary, input, select'

  const visible = (el) => {
    const b = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'
  }

  /** The union of the boxes a node actually paints (its children, or itself). */
  const paintedBox = (el) => {
    const kids = [...el.children].filter((c) => {
      const b = c.getBoundingClientRect()
      return b.width > 0 && b.height > 0
    })
    if (kids.length === 0) {
      // Leaf: use the text box the browser would draw.
      const rects = [...el.getClientRects()]
      if (rects.length === 0) return null
      return rects.reduce(
        (acc, r) => ({
          left: Math.min(acc.left, r.left),
          right: Math.max(acc.right, r.right),
          top: Math.min(acc.top, r.top),
          bottom: Math.max(acc.bottom, r.bottom),
        }),
        { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity },
      )
    }
    return kids.reduce(
      (acc, c) => {
        const b = c.getBoundingClientRect()
        return {
          left: Math.min(acc.left, b.left),
          right: Math.max(acc.right, b.right),
          top: Math.min(acc.top, b.top),
          bottom: Math.max(acc.bottom, b.bottom),
        }
      },
      { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity },
    )
  }

  const describe = (el) => {
    const b = el.getBoundingClientRect()
    const chain = []
    let n = el
    while (n && n !== document.body && chain.length < 5) {
      const first = typeof n.className === 'string' && n.className ? n.className.split(' ')[0].slice(0, 22) : ''
      const data = [...n.attributes]
        .filter((a) => a.name.startsWith('data-'))
        .map((a) => a.name)
        .slice(0, 2)
        .join(',')
      chain.push(n.tagName.toLowerCase() + (first ? '.' + first : '') + (data ? '[' + data + ']' : ''))
      n = n.parentElement
    }
    return {
      where: chain.join(' < '),
      label: (el.getAttribute('aria-label') || el.textContent || el.value || el.type || '').trim().slice(0, 30),
      box: Math.round(b.left) + ',' + Math.round(b.top) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height),
    }
  }

  const offCentre = []
  const clipped = []

  for (const el of document.querySelectorAll(interactive)) {
    if (!visible(el)) continue
    const b = el.getBoundingClientRect()
    const painted = paintedBox(el)
    if (painted === null) continue

    const dx = Math.round(((painted.left + painted.right) / 2 - (b.left + b.right) / 2) * 10) / 10
    const dy = Math.round(((painted.top + painted.bottom) / 2 - (b.top + b.bottom) / 2) * 10) / 10
    if (Math.abs(dx) > TOLERANCE || Math.abs(dy) > TOLERANCE) {
      offCentre.push({ ...describe(el), dx, dy })
    }

    // Painted content wider/taller than the element that clips it.
    const cs = getComputedStyle(el)
    if (cs.overflow !== 'visible' && (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2)) {
      clipped.push({ ...describe(el), scrollW: el.scrollWidth, clientW: el.clientWidth, scrollH: el.scrollHeight, clientH: el.clientHeight })
    }
  }

  // Sibling overlap inside a flex/grid row usually means a fixed size fighting a
  // container that cannot hold it.
  const overlaps = []
  for (const row of document.querySelectorAll('[data-fa-dock], nav, [role="toolbar"], header')) {
    const kids = [...row.children].filter(visible)
    for (let i = 0; i < kids.length; i += 1) {
      for (let j = i + 1; j < kids.length; j += 1) {
        const a = kids[i].getBoundingClientRect()
        const c = kids[j].getBoundingClientRect()
        const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left)
        const oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top)
        if (ox > 1 && oy > 1) overlaps.push({ row: describe(row).where.split(' < ')[0], a: describe(kids[i]).label, b: describe(kids[j]).label, overlap: Math.round(ox) + 'x' + Math.round(oy) })
      }
    }
  }

  return { offCentre: offCentre.slice(0, 24), clipped: clipped.slice(0, 14), overlaps: overlaps.slice(0, 10) }
}
