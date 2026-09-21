#!/bin/sh
# dsh-frutiger-aero — GitHub installer for macOS and Linux.
#
#   curl -fsSL https://raw.githubusercontent.com/Hotsteel2901/dsh-frutiger-aero/main/install.sh | sh
#   curl -fsSL .../install.sh | sh -s -- --profile aero
#   curl -fsSL .../install.sh | sh -s -- --ref main      # pin a specific ref
#
# Needs nothing but Node and either curl or wget. No npm account, no git, no
# build step. It downloads a snapshot of this repository and hands over to the
# bundled `install.mjs` — the logic lives in exactly one place, in Node, where it
# can be tested, rather than being reimplemented in shell for this path.
#
# ## Which ref gets installed, and why it is not "the latest release"
#
# This used to fetch `releases/latest`, which is the conventional choice and was
# actively harmful here. A release tag is cut from a branch at one moment, while
# `package.json` keeps announcing the *branch's* version. Tag `1.0.3` and `main`
# both said `version: 1.1.0` while holding different code, so a user who ran the
# installer twice had no way to tell whether anything was new — and because the
# tag never moved, reinstalling faithfully reproduced the same snapshot. That is
# the "I reinstalled and it is still broken" report, explained.
#
# So the default is the default branch: the newest code that exists. `--ref`
# pins a tag or a commit when that is what you actually want. The installed copy
# reports the build fingerprint it was built from, and this script prints it, so
# "am I on the latest?" is now answerable.
#
# ## Running it twice is safe, and is not how you fix a problem
#
# The installer underneath is idempotent and never deletes the profile: it
# rewrites the manifest, re-copies the payload, and leaves sessions alone. When
# something does look wrong, the answer is to ask what is installed rather than
# to reinstall — see the `--doctor` hint printed at the end.
#
# Environment: DSH_FRUTIGER_REPO (owner/repo), DSH_FRUTIGER_REF, DSH_HOME.

set -eu

REPO="${DSH_FRUTIGER_REPO:-Hotsteel2901/dsh-frutiger-aero}"
PROFILE="frutiger"
HOME_ARG=""
REF="${DSH_FRUTIGER_REF:-}"

while [ $# -gt 0 ]; do
  case "$1" in
    --profile) PROFILE="${2:?--profile needs a value}"; shift 2 ;;
    --home) HOME_ARG="${2:?--home needs a value}"; shift 2 ;;
    --ref) REF="${2:?--ref needs a value}"; shift 2 ;;
    -h|--help)
      # Print the header comment as the help text, stopping at the first
      # non-comment line so the range cannot drift out of date when the header
      # above grows. `sed` from 2 to the blank line before `set -eu`.
      sed -n '2,/^$/p' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) echo "dsh-frutiger-aero: unknown argument $1" >&2; exit 2 ;;
  esac
done

say() { printf '%s\n' "$*"; }
die() { printf 'dsh-frutiger-aero: %s\n' "$*" >&2; exit 1; }

command -v node >/dev/null 2>&1 || die "Node is required but was not found on PATH"

# Check the major version, not merely that Node exists. `dsh` dispatches through
# `if (import.meta.main)`, which is unimplemented before Node 24: on 20 or 22
# that check is falsy, so the CLI prints nothing at all and exits 0. A user on 22
# therefore sees a skin that does nothing and concludes the install failed, when
# in fact nothing was ever wrong with it. One sentence here replaces that.
NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])' 2>/dev/null || echo 0)"
if [ "$NODE_MAJOR" -lt 24 ] 2>/dev/null; then
  die "Node 24 or newer is required and this is Node $(node -v 2>/dev/null). Below 24 the Harness CLI exits silently, which looks exactly like a broken install. Nothing else needs changing."
fi

if command -v curl >/dev/null 2>&1; then
  fetch() { curl -fsSL "$1"; }
  download() { curl -fsSL -o "$2" "$1"; }
elif command -v wget >/dev/null 2>&1; then
  fetch() { wget -qO- "$1"; }
  download() { wget -qO "$2" "$1"; }
else
  die "neither curl nor wget is available"
fi

# Default to the default branch. Which branch that is gets asked of the API
# rather than assumed, so a repository that renames it does not need this script
# edited. The probe is best-effort: if it fails, `main` is the right guess for
# this repository, and the download below is the real check.
if [ -z "$REF" ]; then
  REF="$(fetch "https://api.github.com/repos/$REPO" 2>/dev/null \
    | sed -n 's/.*"default_branch"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)"
  [ -n "$REF" ] || REF="main"
fi

TMP="$(mktemp -d 2>/dev/null || mktemp -d -t dsh-frutiger)"
trap 'rm -rf "$TMP"' EXIT INT TERM

say "dsh-frutiger-aero: fetching $REPO@$REF"
download "https://codeload.github.com/$REPO/tar.gz/$REF" "$TMP/src.tar.gz" \
  || die "could not download $REPO@$REF — check the repository name and your network"

mkdir -p "$TMP/src"
tar -xzf "$TMP/src.tar.gz" -C "$TMP/src" --strip-components=1 \
  || die "could not extract the downloaded archive"

[ -f "$TMP/src/install.mjs" ] || die "the archive does not look like dsh-frutiger-aero"

if [ -n "$HOME_ARG" ]; then
  node "$TMP/src/install.mjs" --profile "$PROFILE" --home "$HOME_ARG"
else
  node "$TMP/src/install.mjs" --profile "$PROFILE"
fi

say ""
say "If the skin ever looks wrong, ask what is installed instead of reinstalling —"
say "the answer names the problem, and no step it prints asks you to start over:"
say "  node install.mjs --profile $PROFILE --doctor"
say ""
say "Start it with:"
say "  dsh --profile $PROFILE --port 3099 --no-open"
say ""
say "then open the URL that command prints (it carries the one-time token)."
