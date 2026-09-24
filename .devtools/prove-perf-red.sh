#!/usr/bin/env bash
# Prove effects-perf.mjs can fail.
#
# The probe has two families of assertion and both must be shown red-able, or the
# file is a green light wired to nothing. Run from .devtools with the harness up.
#
#   .devtools/prove-perf-red.sh <url>
set -u
URL="$1"
HERE="$(cd "$(dirname "$0")" && pwd)"
CSS="$HERE/../packages/frutiger-aero/src/css/showcase.css"
BAK=/tmp/showcase.redproof.bak
cp "$CSS" "$BAK"
restore() {
  cp "$BAK" "$CSS"
  cd "$HERE/.." && node packages/frutiger-aero/build.mjs >/dev/null && bash .devtools/deploy.sh >/dev/null
}
trap restore EXIT

echo "=== control (clean tree) ==="
cd "$HERE" && node effects-perf.mjs "$URL" 2>&1 | grep -E "^(PASS|FAIL)"

# ── 1. a paint-animated property on a layer that is NOT the caustics exception ──
echo
echo "=== injecting an un-excused background-position animation ==="
node -e '
const fs = require("fs")
const p = process.argv[1]
let s = fs.readFileSync(p, "utf8")
s = s.replace(
  "@keyframes fa-step-pulse {\n  0%,\n  100% {\n    opacity: 0.35;",
  "@keyframes fa-step-pulse {\n  0%,\n  100% {\n    background-position: 0 0;\n    opacity: 0.35;")
fs.writeFileSync(p, s)
' "$CSS"
grep -c "background-position: 0 0;" "$CSS" | sed 's/^/  injected declarations: /'
cd "$HERE/.." && node packages/frutiger-aero/build.mjs >/dev/null && bash .devtools/deploy.sh >/dev/null
echo "  (rebuild + redeploy done; harness must be restarted to pick up a new rev)"
