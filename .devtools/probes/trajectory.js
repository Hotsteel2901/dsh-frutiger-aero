/**
 * Geometry of one visible Trajectory row, cell by cell.
 *
 * Kept in its own file rather than inline in a `page.evaluate` template: the
 * nesting is deep enough that shell and template escaping silently corrupt it,
 * and a probe that will not parse tells you nothing about the page.
 */
() => {
  const scroll = document.querySelector('[data-trajectory-scroll]')
  const rows = [...document.querySelectorAll('[data-trajectory-row-key]')]
  const visible = rows.filter((row) => {
    const b = row.getBoundingClientRect()
    return b.height > 0 && b.bottom > 60 && b.top < window.innerHeight - 120
  })

  const describe = (el) => {
    const b = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      cls: typeof el.className === 'string' ? el.className.split(' ')[0].slice(0, 28) : '',
      box: Math.round(b.width) + 'x' + Math.round(b.height) + '@' + Math.round(b.left),
      scrollW: el.scrollWidth,
      clientW: el.clientWidth,
      text: (el.textContent || '').trim().slice(0, 28),
      ellipsis: cs.textOverflow,
      whiteSpace: cs.whiteSpace,
      overflow: cs.overflow,
      flex: cs.flex,
      minWidth: cs.minWidth,
    }
  }

  const row = visible[0]
  return {
    rows: rows.length,
    visibleRows: visible.length,
    scroll: scroll
      ? {
          box: Math.round(scroll.getBoundingClientRect().width) + 'x' + Math.round(scroll.getBoundingClientRect().height),
          scrollW: scroll.scrollWidth,
          clientW: scroll.clientWidth,
        }
      : null,
    pageOverflowX: document.documentElement.scrollWidth - window.innerWidth,
    row: row
      ? {
          self: describe(row),
          display: getComputedStyle(row).display,
          gridTemplate: getComputedStyle(row).gridTemplateColumns,
          cells: [...row.querySelectorAll('*')]
            .filter((el) => el.children.length === 0 && (el.textContent || '').trim())
            .slice(0, 10)
            .map(describe),
        }
      : null,
    widestText: Math.max(0, ...[...document.querySelectorAll('[data-trajectory-row-key] *')].map((el) => el.scrollWidth)),
  }
}
