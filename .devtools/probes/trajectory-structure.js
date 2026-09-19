/**
 * Structure of the Trajectory view, as the browser lays it out.
 *
 * Reports the display type of every node in the scroller rather than class
 * names, because the classes are hashed per build and the *layout* is what has
 * to be changed: a CSS table on a 390px screen gives every column a sliver, and
 * knowing which node is `table`, which is `table-row` and which is `table-cell`
 * is the whole problem.
 */
() => {
  const scroller = document.querySelector('[data-trajectory-scroll]')
  if (!scroller) return { note: 'no [data-trajectory-scroll]' }

  const describe = (el, depth) => {
    const cs = getComputedStyle(el)
    const b = el.getBoundingClientRect()
    return {
      depth,
      tag: el.tagName.toLowerCase(),
      cls: typeof el.className === 'string' ? el.className.split(' ')[0].slice(0, 30) : '',
      data: [...el.attributes]
        .filter((a) => a.name.startsWith('data-'))
        .map((a) => a.name)
        .join(','),
      display: cs.display,
      box: Math.round(b.width) + 'x' + Math.round(b.height) + '@' + Math.round(b.left),
      whiteSpace: cs.whiteSpace,
      overflow: cs.overflow,
      textOverflow: cs.textOverflow,
      position: cs.position,
      width: cs.width,
      minWidth: cs.minWidth,
      flex: cs.flex,
    }
  }

  // Walk down the first few levels, and separately inventory every table-ish node.
  const outline = []
  const walk = (el, depth) => {
    if (depth > 7 || outline.length > 90) return
    outline.push(describe(el, depth))
    for (const child of el.children) walk(child, depth + 1)
  }
  walk(scroller, 0)

  const tableish = [...scroller.querySelectorAll('*')]
    .filter((el) => /table/.test(getComputedStyle(el).display))
    .slice(0, 40)
    .map((el) => describe(el, 0))

  const header = scroller.querySelector('thead, [role="rowgroup"]')
  const firstRow = scroller.querySelector('[data-trajectory-row-key]')

  return {
    scroller: describe(scroller, 0),
    hasRealTable: scroller.querySelector('table') !== null,
    tableishCount: tableish.length,
    tableish: tableish.slice(0, 18),
    headerCells: header
      ? [...header.querySelectorAll('*')]
          .filter((el) => el.children.length === 0)
          .map((el) => ({ text: (el.textContent || '').trim().slice(0, 12), ...describe(el, 0) }))
          .slice(0, 10)
      : [],
    firstRowCells: firstRow
      ? [...firstRow.children].map((el) => {
          const b = el.getBoundingClientRect()
          return { w: Math.round(b.width), ...describe(el, 0), kids: el.children.length }
        })
      : [],
    stickyOrFixed: [...scroller.querySelectorAll('*')]
      .filter((el) => {
        const p = getComputedStyle(el).position
        return p === 'sticky' || p === 'fixed'
      })
      .slice(0, 8)
      .map((el) => describe(el, 0)),
  }
}
