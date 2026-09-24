#!/bin/sh
# dsh-frutiger-aero — GitHub installer for macOS and Linux.
#
#   curl -fsSL https://raw.githubusercontent.com/Hotsteel2901/dsh-frutiger-aero/main/install.sh | sh
#   curl -fsSL .../install.sh | sh -s -- --profile aero
#   curl -fsSL .../install.sh | sh -s -- --ref main      # pin a specific ref
#
# Needs nothing but Node and either curl or wget. No package manager, no
# registry account, no git, no build step. It downloads a snapshot of this
# repository and hands over to the bundled `install.mjs` — the logic lives in
# exactly one place, in Node, where it can be tested, rather than being
# reimplemented in shell for this path.
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
# Environment: DSH_FRUTIGER_REPO (owner/repo), DSH_FRUTIGER_REF,
#              DSH_FRUTIGER_PROFILE, DSH_FRUTIGER_HOME.
#
# The variable names match `install.ps1` on purpose. A user who reads the page on
# one machine and installs on another should not have to learn a second set, and
# the two scripts previously disagreed: this one honoured `DSH_HOME` while the
# PowerShell one used `DSH_FRUTIGER_HOME`, and neither read the other's profile
# variable. `DSH_HOME` is still accepted because `dsh` itself defines it.

set -eu

REPO="${DSH_FRUTIGER_REPO:-Hotsteel2901/dsh-frutiger-aero}"
PROFILE="${DSH_FRUTIGER_PROFILE:-frutiger}"
HOME_ARG="${DSH_FRUTIGER_HOME:-${DSH_HOME:-}}"
REF="${DSH_FRUTIGER_REF:-}"

# Defined before the argument loop, not after it: `--help` returns from inside
# that loop and needs both of these, and a function called before its definition
# is a runtime error rather than a parse error — so the mistake would have shown
# up only on the help path, which is the path a confused user takes.
say() { printf '%s\n' "$*"; }
die() { printf 'dsh-frutiger-aero: %s\n' "$*" >&2; exit 1; }

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
      # Then the values this run would actually use. The header documents the
      # variable *names*; this is the only place that shows they were read —
      # a script can mention `DSH_FRUTIGER_PROFILE` in a comment forever while
      # its body hardcodes `frutiger`, which is exactly what this one did. It is
      # also what makes the naming agreement with `install.ps1` testable without
      # running a whole install.
      say ""
      say "Values this run would use:"
      say "  repo    $REPO"
      say "  profile $PROFILE"
      say "  ref     ${REF:-(the default branch, resolved at install time)}"
      say "  home    ${HOME_ARG:-(the value \`dsh\` itself resolves)}"
      exit 0 ;;
    *) echo "dsh-frutiger-aero: unknown argument $1" >&2; exit 2 ;;
  esac
done

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

# One line naming the source, then stop. `install.mjs` has already printed the
# version, the build fingerprint, where it landed and how to start it — the
# identity that answers "am I on the latest?" — so repeating any of it here
# would only give the reader two summaries to reconcile. What this script alone
# knows is *which ref it fetched*, and that is the one thing worth adding.
say ""
say "dsh-frutiger-aero: installed from $REPO@$REF"
say "the version and build fingerprint above are what is installed now."
