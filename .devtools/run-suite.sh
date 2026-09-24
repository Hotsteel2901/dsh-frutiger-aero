#!/usr/bin/env bash
# Run the whole mobile verification suite and report one verdict.
#
# This repo has ~40 individual probes. Running them one at a time is how a
# regression sneaks through: the run that matters is "did anything I just
# changed break a check somewhere else", and that question is only answerable
# cheaply if there is one command that answers it.
#
# Every probe exits non-zero on failure and prints 'ok' / 'FAIL' lines, so this
# script is a driver, not a reimplementation. It starts from a running harness
# (`devtools/serve.sh`) and takes its token URL.
#
# usage: run-suite.sh [url]
#        devtools/run-suite.sh "$(grep -oE 'http://[^ ]*token=[A-Za-z0-9_-]+' /tmp/fa-x.log | tail -1)"
set -u

HERE="$(cd "$(dirname "$0")" && pwd)"
URL="${1:-}"

# Pick a Node that satisfies this project's own floor.
#
# The install suite exercises `install.mjs`, which refuses to run below Node 24
# — by design, because the Harness CLI silently exits 0 on 20 and 22. So running
# the suite under whatever `node` happens to be first on PATH produced a red
# "install, doctor and repair" on a machine whose default is 22, while the very
# same check passed when invoked with an explicit Node 24. That is the worst
# kind of failure: the suite blaming the code for the interpreter it chose.
#
# Prefer an already-correct PATH node; otherwise look in the usual places and
# fall back to PATH with a warning, so the failure is attributed honestly.
NODE_BIN=""
if command -v node >/dev/null 2>&1; then
  major="$(node -v 2>/dev/null | sed 's/^v//; s/\..*//')"
  [ -n "$major" ] && [ "$major" -ge 24 ] 2>/dev/null && NODE_BIN="$(command -v node)"
fi
if [ -z "$NODE_BIN" ]; then
  for candidate in /opt/node-v24.*/bin/node /usr/local/bin/node /opt/node*/bin/node; do
    [ -x "$candidate" ] || continue
    major="$("$candidate" -v 2>/dev/null | sed 's/^v//; s/\..*//')"
    if [ -n "$major" ] && [ "$major" -ge 24 ] 2>/dev/null; then NODE_BIN="$candidate"; break; fi
  done
fi
if [ -z "$NODE_BIN" ]; then
  NODE_BIN="$(command -v node || echo node)"
  echo "warning: no Node >= 24 found; using $NODE_BIN ($("$NODE_BIN" -v 2>/dev/null))" >&2
  echo "         the install suite will report a genuine Node-floor failure." >&2
  echo >&2
fi
# Put it first so every `node ...` in this script and its children agree.
PATH="$(dirname "$NODE_BIN"):$PATH"
export PATH

if [ -z "$URL" ]; then
  # Fall back to the most recent token URL this sandbox printed.
  #
  # `[A-Za-z0-9]` is the *wrong* character class and was here before: the token
  # is base64url, so it contains `-` and `_`, and the old pattern stopped at the
  # first one. A truncated token does not look wrong — it produces a 401 from
  # every probe, so the whole suite goes red on a healthy build and the failure
  # points at the code instead of at this line. Measured: `token=Otj` captured
  # where the server issued `token=Otj_4k3S9uPzKHLbNG-U-rABjELGFj1uSJH-Ck5SUnc`.
  URL="$(grep -oE 'http://[^ ]*token=[A-Za-z0-9_-]+' /tmp/fa-x.log 2>/dev/null | tail -1)"
fi
if [ -z "$URL" ]; then
  echo "no url: pass one, or start the harness with devtools/serve.sh" >&2
  exit 2
fi
echo "target: ${URL%%\?*}"
echo "node:   $("$NODE_BIN" -v) ($NODE_BIN)"
echo

PASS=0
FAIL=0
FAILED_NAMES=""

# How long one probe may take before it is killed.
#
# This bound exists because its absence cost several hours. A `bash -c` wrapper
# whose `node` child died without writing anything leaves the wrapper reading
# the stdout pipe forever, and a suite with no timeout waits with it — the run
# is not slow, it is *finished* and nobody can tell. `timeout` turns that into a
# 124 and a red line, which is the only honest answer.
#
# 300s is roughly 20x the slowest real probe (the tier and perf sweeps, which
# each drive three cold browser sessions), so a timeout is a hung process and
# never a busy machine.
FA_PROBE_TIMEOUT="${FA_PROBE_TIMEOUT:-300}"

# run <name> <command...>
run() {
  local name="$1"; shift
  local out
  out="$(timeout -k 10 "$FA_PROBE_TIMEOUT" "$@" 2>&1)"
  local code=$?
  if [ $code -eq 0 ]; then
    PASS=$((PASS + 1))
    printf '  ok    %s\n' "$name"
  else
    FAIL=$((FAIL + 1))
    FAILED_NAMES="$FAILED_NAMES $name"
    if [ $code -eq 124 ]; then
      printf '  FAIL  %s (no answer in %ss — killed)\n' "$name" "$FA_PROBE_TIMEOUT"
    else
      printf '  FAIL  %s\n' "$name"
    fi
    printf '%s\n' "$out" | grep -E '^(FAIL| *[0-9.]+:1|usage:)' | head -12 | sed 's/^/        /'
  fi
}

echo "── colour and contrast ───────────────────────────────────────────"
for scheme in light dark; do
  run "contrast $scheme" bash -c \
    "node '$HERE/deepcontrast.mjs' '$URL' $scheme | node '$HERE/contrast-report.mjs'"
done
run "accent tokens live" bash -c \
  "node '$HERE/tokens.mjs' '$URL' | grep -q '#0c6a90'"

echo "── layout across viewports ───────────────────────────────────────"
run "viewport sweep" bash -c \
  "node '$HERE/vpsweep.mjs' '$URL' | node -e \"
    let s=''; process.stdin.on('data',d=>s+=d).on('end',()=>{
      const j=JSON.parse(s); const rows=j.rows||j;
      const bad=rows.filter(r=>r.overflowX||r.overflowY);
      for(const r of bad) console.log('FAIL '+r.name+' overflowX='+r.overflowX+' overflowY='+r.overflowY);
      console.log(rows.length-bad.length+'/'+rows.length+' viewports clean');
      process.exit(bad.length?1:0);
    });\""

echo "── touch targets and interaction ─────────────────────────────────"
run "touch targets 390x844" bash -c \
  "node '$HERE/hitaudit.mjs' '$URL' /tmp/fa-suite-hit 390 844 > /tmp/fa-suite-hit.json && node '$HERE/hit-report.mjs' /tmp/fa-suite-hit.json"
run "session row and drawer" bash -c \
  "node '$HERE/sessionrow.mjs' '$URL' | node -e \"
    let s=''; process.stdin.on('data',d=>s+=d).on('end',()=>{
      const j=JSON.parse(s);
      const okRow=parseInt(j.row&&j.row.actionButtonBox,10)>=44;
      const okClose=j.afterSelect&&j.afterSelect.drawerStillOpen===false;
      const okOpen=j.afterSelect&&j.afterSelect.openedTheRow===true;
      if(!okRow) console.log('FAIL session row action target '+(j.row&&j.row.actionButtonBox));
      if(!okClose) console.log('FAIL drawer stayed open after choosing a session');
      if(!okOpen) console.log('FAIL choosing a session did not open it');
      console.log('row='+(j.row&&j.row.actionButtonBox)+' drawerCloses='+okClose+' opens='+okOpen);
      process.exit(okRow&&okClose&&okOpen?0:1);
    });\""
run "keyboard inset" node "$HERE/keyboard.mjs" "$URL"

run "settings dialog (zh + en + desktop)" node "$HERE/settingscheck.mjs" "$URL"

run "no clipped label text" node "$HERE/clipaudit.mjs" "$URL"

echo "── plugin behaviour ──────────────────────────────────────────────"
run "wallpaper density control" node "$HERE/bubbles.mjs" "$URL"

echo "── desktop effects and animation ─────────────────────────────────"
# Six probes in a deliberate order: inventory, then each region, then the axes.
#
# The inventory goes first on purpose. Every probe below asserts that a
# *specific* effect lands, so all of them can pass while a seventh effect sits
# dead — a selector that matches nothing is indistinguishable from one that is
# switched off, and a per-effect check can only ever confirm the effects someone
# remembered to name. `effects-manifest.mjs` enumerates the live inventory and
# asserts a per-region floor, which is the only check here that notices an
# effect going *missing* rather than an effect going wrong.
run "effects manifest (floor per region)" node "$HERE/effects-manifest.mjs" "$URL"
run "sidebar desktop effects" node "$HERE/sidebarcheck.mjs" "$URL"
run "canvas and scroll-edge masks" node "$HERE/canvascheck.mjs" "$URL"
run "header sheen once a conversation exists" node "$HERE/headercheck.mjs" "$URL"
run "composer and overlays" node "$HERE/composercheck.mjs" "$URL"
# The inventory again, from the other side: `manifest` counts what is *there*,
# this asks whether every loop *stops* — on the lite tier and when the tab is
# hidden. A loop that never stops passes every count and is the whole cost.
run "every loop can be stopped" node "$HERE/loopcheck.mjs" "$URL"

# The three axes Turn 4 named: the same effects at every tier, in both locales,
# within a frame budget. They are three separate files rather than one because
# each has a different failure mode and a different fix.
run "effects at full / lite / off" node "$HERE/effects-tiers.mjs" "$URL"
run "en and zh are identical" node "$HERE/effects-parity.mjs" "$URL"
run "effects stay inside a frame budget" node "$HERE/effects-perf.mjs" "$URL"

echo "── the landing page ──────────────────────────────────────────────"
# Unlike every run above, this one needs no harness and no token: the landing
# page is a static tree and `landing-site.sh` serves it on its own port. It is
# invoked through a wrapper so the suite stays one command, and the wrapper
# starts and stops the server itself rather than requiring the reader to know
# that a second listener exists.
run "landing page still works" bash -c \
  "URL=\$(bash '$HERE/landing-site.sh' start) && node '$HERE/landing.mjs' \"\$URL\"; code=\$?; bash '$HERE/landing-site.sh' stop; exit \$code"
run "landing page motion layer" bash -c \
  "URL=\$(bash '$HERE/landing-site.sh' start) && node '$HERE/landingfx.mjs' \"\$URL\"; code=\$?; bash '$HERE/landing-site.sh' stop; exit \$code"
# Which one-liner the page hands you, run once per spoofed platform. This is the
# only check here whose correct answer *differs per machine*, so it cannot be
# folded into `landing.mjs`, which has one answer to assert. The failure it
# guards is invisible: a copy button that copies the hidden command, or a page
# that shows the Unix one-liner to a Windows reader.
run "landing page picks the right installer" bash -c \
  "URL=\$(bash '$HERE/landing-site.sh' start) && node '$HERE/landing-install.mjs' \"\$URL\"; code=\$?; bash '$HERE/landing-site.sh' stop; exit \$code"

echo "── resources ─────────────────────────────────────────────────────"
run "no unexpected 4xx/5xx" node "$HERE/netcheck.mjs" "$URL"

# Last, and deliberately so: this is the only suite that needs no browser and no
# running profile, so it still reports when everything above could not start.
# It covers the install path — the Node floor, idempotency, --doctor, --repair
# and build reproducibility — which is where "it failed to install" comes from.
echo "── the install path ──────────────────────────────────────────────"
run "install, doctor and repair" node "$HERE/installcheck.mjs"

# Static, so it runs whatever the state of the harness, and it belongs beside
# the install check for the same reason: a green suite that could not have gone
# red is not evidence. This one guards a mistake that has broken this directory
# twice — a backtick in a comment inside a `page.evaluate` template terminates
# the template, and the resulting syntax error points at the wrong line.
echo "── the probes themselves ─────────────────────────────────────────"
run "no page.evaluate template is cut short" node "$HERE/linttemplates.mjs"

echo
echo "══════════════════════════════════════════════════════════════════"
if [ $FAIL -eq 0 ]; then
  echo "PASS  ${PASS} suites, 0 failures"
else
  echo "FAIL  ${PASS} passed, ${FAIL} failed:${FAILED_NAMES}"
fi
exit $FAIL
