# dsh-frutiger-aero

A dsh profile bundle that reskins the browser surface in Frutiger Aero and
rebuilds the narrow-viewport layout around touch. Install it with the installer
in the repository root:

```sh
node ../../install.mjs              # into `--profile frutiger`
node ../../install.mjs --link       # …or link the checkout, so a rebuild is live
```

## Shape

```
package.json          dsh.bundle.patch → cordis.patch.yml
                      dsh.client       → exports["./client"] is a browser plugin
cordis.patch.yml      one inserted row, `frutiger-aero`
src/host.js           node half — an empty apply(), on purpose
src/client/*.js       palette, wallpaper, runtime (inlined by build.mjs)
src/css/*.css         base, scenery, material, mobile, effects
lib/index.js          built node half
lib/client.js         built browser half — committed, so installing needs no build
build.mjs             `node build.mjs` inlines src/css into lib/client.js
```

The row exists for its *manifest*, not its code: `dsh.client` is what makes
`@deepseek-ai/dsh-client-modules` compose `lib/client.js` into
`window.__DSH_BOOT__` as a browser plugin. The host half is empty because the
skin must not be able to touch a session, a tool or a service.

## Browser half contract

`lib/client.js` ships as one file in the exact shape the client module system
loads — a script that registers a factory, where `id` **is** the package name:

```js
window.__ModuleLoader__.load({
  id: "dsh-frutiger-aero",
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    /* … */
    exports.apply = apply
    return module.exports
  },
})
```

It `require`s nothing. The only optional integration is the `theme` service,
reached through `ctx.get('theme')` with a `ctx.inject(['theme'], …)` fallback, so
the plugin activates and paints correctly whether or not
`@deepseek-ai/dsh-client-ui-theme` is composed.

## Editing

```sh
node build.mjs          # src/ → lib/
```

`lib/` is committed: the installed plugin must work with nothing but a file copy,
so a build step is a convenience for development, never a requirement.

## Licence

MIT.
