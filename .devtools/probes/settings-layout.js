/**
 * The settings dialog's internal layout, at phone width.
 *
 * The panel keeps its desktop two-column arrangement — a nav rail beside a
 * content column — and at 390px that leaves the content about 110px wide, so
 * every label wraps to one character per line. Fixing it needs the two regions
 * identified by something stable: this reports the display type, the box and
 * every attribute of each level, plus which children are nav-like (buttons or
 * a listbox) and which are content.
 */
() => {
  const dialog = document.querySelector('[role="dialog"]')
  if (!dialog) return { note: 'no dialog open' }

  const describe = (el, depth) => {
    const cs = getComputedStyle(el)
    const b = el.getBoundingClientRect()
    return {
      depth,
      tag: el.tagName.toLowerCase(),
      cls: typeof el.className === 'string' ? el.className.split(' ')[0].slice(0, 30) : '',
      data: [...el.attributes]
        .filter((a) => a.name.startsWith('data-'))
        .map((a) => a.name + '=' + a.value.slice(0, 14))
        .join(' '),
      role: el.getAttribute('role') ?? '',
      display: cs.display,
      flexDirection: cs.flexDirection,
      gridTemplate: cs.gridTemplateColumns === 'none' ? '' : cs.gridTemplateColumns,
      overflow: cs.overflow,
      position: cs.position,
      box: Math.round(b.left) + ',' + Math.round(b.top) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height),
      buttons: el.querySelectorAll('button').length,
      text: (el.textContent || '').trim().slice(0, 20),
    }
  }

  const outline = []
  const walk = (el, depth) => {
    if (depth > 6 || outline.length > 60) return
    outline.push(describe(el, depth))
    for (const child of el.children) walk(child, depth + 1)
  }
  walk(dialog, 0)

  // The two regions, as the layout sees them: whatever is beside whatever.
  const firstLevel = [...dialog.children].map((el) => {
    const kids = [...el.children].map((c) => ({
      tag: c.tagName.toLowerCase(),
      cls: typeof c.className === 'string' ? c.className.split(' ')[0].slice(0, 24) : '',
      box: (b => Math.round(b.width) + 'x' + Math.round(b.height) + '@' + Math.round(b.left))(c.getBoundingClientRect()),
      buttons: c.querySelectorAll('button').length,
      display: getComputedStyle(c).display,
    }))
    return { self: describe(el, 0), children: kids.slice(0, 8) }
  })

  return {
    dialog: describe(dialog, 0),
    firstLevel,
    outline: outline.slice(0, 40),
    viewport: window.innerWidth + 'x' + window.innerHeight,
  }
}
