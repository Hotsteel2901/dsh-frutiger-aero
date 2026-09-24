#!/usr/bin/env bash
# Copy the freshly built plugin into the running test profile.
#
# Separated from the build because the two fail for different reasons and the
# distinction matters when a probe disagrees with the source: `build.mjs` can
# succeed while the profile still serves the previous bundle, and the harness
# serves under a startup nonce (`?rev=`), so a copy alone is not enough either.
#
# usage: deploy.sh
set -eu

SRC="$(cd "$(dirname "$0")/../packages/frutiger-aero" && pwd)"
DEST="${DSH_HOME:-/tmp/fa-home}/profiles/frutiger/node_modules/dsh-frutiger-aero"

[ -d "$DEST" ] || { echo "no profile at $DEST" >&2; exit 1; }

cp "$SRC/lib/client.js" "$DEST/lib/client.js"
cp "$SRC/lib/index.js" "$DEST/lib/index.js"
cp "$SRC/cordis.patch.yml" "$DEST/cordis.patch.yml"
cp "$SRC/package.json" "$DEST/package.json"

# Prove the copy took, rather than trusting `cp`'s exit status. A partial write
# here looks exactly like a CSS bug three steps later.
cmp -s "$SRC/lib/client.js" "$DEST/lib/client.js" || { echo "deploy did not take" >&2; exit 1; }

# Warn when another profile exists that a running Harness could be serving
# instead. `deploy.sh` honours `DSH_HOME`, but a Harness started without it
# silently reads `~/.dsh` — so the loop reports a successful deploy while the
# browser loads a profile from some earlier session. That failure is invisible
# from every other angle: build succeeds, copy succeeds, the page simply does
# not contain your file.
#
# This is a warning rather than an error because deploying to /tmp/fa-home on
# purpose is the normal case, and a stale ~/.dsh is only a problem if something
# is *running* against it.
DEFAULT_HOME="${HOME:-/root}/.dsh/profiles/${PROFILE:-frutiger}/node_modules/dsh-frutiger-aero"
if [ "$DEST" != "$DEFAULT_HOME" ] && [ -f "$DEFAULT_HOME/lib/client.js" ]; then
  if cmp -s "$SRC/lib/client.js" "$DEFAULT_HOME/lib/client.js"; then
    : # in sync; nothing to say
  else
    printf 'warning: %s differs from this deploy and is the default home.\n' "$DEFAULT_HOME" >&2
    printf '         if the Harness was started without DSH_HOME it is serving that copy,\n' >&2
    printf '         not this one. Use devtools/serve.sh (which sets DSH_HOME) to start it.\n' >&2
  fi
fi

echo "deployed $(wc -c < "$DEST/lib/client.js") bytes to $DEST"
