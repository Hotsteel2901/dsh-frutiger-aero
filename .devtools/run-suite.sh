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
#        devtools/run-suite.sh "$(grep -o 'http.*' /tmp/fa-x.log | tail -1)"
set -u

HERE="$(cd "$(dirname "$0")" && pwd)"
URL="${1:-}"

if [ -z "$URL" ]; then
  # Fall back to the most recent token URL this sandbox printed.
  URL="$(grep -o 'http://[^ ]*token=[A-Za-z0-9]*' /tmp/fa-x.log 2>/dev/null | tail -1)"
fi
if [ -z "$URL" ]; then
  echo "no url: pass one, or start the harness with devtools/serve.sh" >&2
  exit 2
fi
echo "target: ${URL%%\?*}"
echo

PASS=0
FAIL=0
FAILED_NAMES=""

# run <name> <command...>
run() {
  local name="$1"; shift
  local out
  out="$("$@" 2>&1)"
  local code=$?
  if [ $code -eq 0 ]; then
    PASS=$((PASS + 1))
    printf '  ok    %s\n' "$name"
  else
    FAIL=$((FAIL + 1))
    FAILED_NAMES="$FAILED_NAMES $name"
    printf '  FAIL  %s\n' "$name"
    printf '%s\n' "$out" | grep -E '^(FAIL| *[0-9.]+:1)' | head -12 | sed 's/^/        /'
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

echo "── plugin behaviour ──────────────────────────────────────────────"
run "wallpaper density control" node "$HERE/bubbles.mjs" "$URL"

echo "── resources ─────────────────────────────────────────────────────"
run "no unexpected 4xx/5xx" node "$HERE/netcheck.mjs" "$URL"

echo
echo "══════════════════════════════════════════════════════════════════"
if [ $FAIL -eq 0 ]; then
  echo "PASS  ${PASS} suites, 0 failures"
else
  echo "FAIL  ${PASS} passed, ${FAIL} failed:${FAILED_NAMES}"
fi
exit $FAIL
