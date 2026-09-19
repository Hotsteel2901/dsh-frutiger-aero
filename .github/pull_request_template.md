## What this changes

<!-- One paragraph. Link the issue if there is one. -->

## Which layer

- [ ] Browser half (`packages/frutiger-aero/src/**`)
- [ ] Landing page (`docs/**`)
- [ ] Installer or tooling
- [ ] Documentation only

## The two rules

Everything in the browser half obeys both. Confirm:

- [ ] It only **paints**. No state management, no component wrapping, no
      handler replacement, no `require` of another client package.
- [ ] Every side effect is released through `ctx.effect`, so disabling the row
      returns the page to stock.

## Checks

- [ ] `node packages/frutiger-aero/build.mjs` was run and `lib/` is committed
- [ ] `interact.mjs` passes (required for anything touching the mobile layer)
- [ ] Checked in both light and dark, on a desktop width and a phone width
- [ ] `prefers-reduced-motion` still leaves a complete page

## Screenshots

<!-- Before / after, if this is visible. Phone and desktop if it is layout. -->
