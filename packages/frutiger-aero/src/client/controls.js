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
