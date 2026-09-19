#!/bin/sh
# dsh-frutiger-aero — GitHub installer for macOS and Linux.
#
#   curl -fsSL https://raw.githubusercontent.com/Hotsteel2901/dsh-frutiger-aero/main/install.sh | sh
#   curl -fsSL .../install.sh | sh -s -- --profile aero
#
# Needs nothing but Node and either curl or wget. No npm account, no git, no
# build step. It downloads the latest release, then hands over to the bundled
# `install.mjs` — the logic lives in exactly one place, in Node, where it can be
# tested, rather than being reimplemented in shell for this path.
#
# Environment: DSH_FRUTIGER_REPO (owner/repo), DSH_HOME.

set -eu

REPO="${DSH_FRUTIGER_REPO:-Hotsteel2901/dsh-frutiger-aero}"
PROFILE="frutiger"
HOME_ARG=""
REF=""

while [ $# -gt 0 ]; do
  case "$1" in
    --profile) PROFILE="${2:?--profile needs a value}"; shift 2 ;;
    --home) HOME_ARG="${2:?--home needs a value}"; shift 2 ;;
    --ref) REF="${2:?--ref needs a value}"; shift 2 ;;
    -h|--help)
      sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) echo "dsh-frutiger-aero: unknown argument $1" >&2; exit 2 ;;
  esac
done

say() { printf '%s\n' "$*"; }
die() { printf 'dsh-frutiger-aero: %s\n' "$*" >&2; exit 1; }

command -v node >/dev/null 2>&1 || die "Node is required but was not found on PATH"

if command -v curl >/dev/null 2>&1; then
  fetch() { curl -fsSL "$1"; }
  download() { curl -fsSL -o "$2" "$1"; }
elif command -v wget >/dev/null 2>&1; then
  fetch() { wget -qO- "$1"; }
  download() { wget -qO "$2" "$1"; }
else
  die "neither curl nor wget is available"
fi

# Latest published tag, or the default branch when there is no release yet.
if [ -z "$REF" ]; then
  REF="$(fetch "https://api.github.com/repos/$REPO/releases/latest" 2>/dev/null \
    | sed -n 's/.*"tag_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)"
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
say "Start it with:"
say "  dsh --profile $PROFILE --port 3099 --no-open"
say ""
say "then open the URL that command prints (it carries the one-time token)."
