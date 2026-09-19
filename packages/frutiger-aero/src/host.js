/**
 * dsh-frutiger-aero — node half.
 *
 * This plugin contributes browser presentation only, so the host half is an
 * empty `apply`. It exists because the client module system discovers a
 * browser plugin from the *Loader entry* whose package manifest declares
 * `dsh.client`: the row in `cordis.patch.yml` names this package, Loader
 * imports this file, and `@deepseek-ai/dsh-client-modules` then reads
 * `dsh.client` + `exports["./client"]` from the same manifest and composes
 * `lib/client.js` into `window.__DSH_BOOT__`.
 *
 * Keeping it empty is the point: the skin must not be able to alter a session,
 * a tool, or a service. Every effect it has is browser-side, reversible, and
 * released with the browser fiber.
 *
 * @module dsh-frutiger-aero
 */

/** Host plugin body — no host-side behaviour for this presentation-only surface. */
export function apply() {}
