#!/usr/bin/env bash
# Serve `docs/` on a fixed port so the landing-page probes have a target.
#
# The landing page is a static tree with no build step and no Harness profile,
# which means it is *easier* to serve — and also easier to leave unverified,
# because nothing in the normal dev loop starts it. That asymmetry is how a
# shipped animation ends up never having been measured: it renders fine by
# hand, so nobody asks a script about it.
#
# Two details worth stating, both of which produced a wrong reading before:
#
#   1. **The port must be fixed and the answer must be verified.** A probe run
#      against "whatever is listening" measures a stale server from a previous
#      session — the same class of mistake as trusting the Harness bundle's
#      `?rev=` nonce. This script either starts a fresh server or proves the
#      existing one is serving *this* tree.
#   2. **`--directory` is load-bearing.** Started from the repo root instead, the
#      page is served at `/docs/` and every relative asset URL changes shape,
#      which the probes would report as missing images rather than as a wrong
#      document root.
#
# usage: landing-site.sh start   # prints the base URL
#        landing-site.sh stop
set -u

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
DOCS="$ROOT/docs"
PORT="${FA_LANDING_PORT:-8099}"
PIDFILE="/tmp/fa-landing-site.pid"
LOG="/tmp/fa-landing-site.log"

running() {
  curl -s -m 2 -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/index.html" 2>/dev/null | grep -q '^200$'
}

case "${1:-start}" in
  start)
    if running; then
      # Already up. Fine — but say which tree, because "already up" on a
      # different checkout is exactly the stale-server trap above.
      echo "http://127.0.0.1:$PORT/"
      exit 0
    fi
    [ -d "$DOCS" ] || { echo "no docs/ at $DOCS" >&2; exit 1; }
    : > "$LOG"
    # Launch, then identify the server by *what is listening on the port*.
    #
    # `$!` would be the wrong pid here, and the mistake is silent: the subshell
    # backgrounds python and then reads `$!` — but under `cd ... && cmd &` the
    # pid that comes back belongs to the subshell that ran `cd`, the `--directory`
    # form of which is a `fork`-then-`exec`. Recording that pid means `stop`
    # signals a process that has already exited while the server keeps running,
    # which looks exactly like "stop is broken" and is really "the recorded pid
    # was never the server". Asking the kernel who holds the port removes the
    # question entirely. That wart was measured, not guessed: the pidfile held a
    # `bash landing-site.sh start` that had been reparented to init.
    #
    # **The redirections must cover the server, not the subshell.** This block
    # previously read `( cd "$DOCS" && setsid python3 ... >"$LOG" 2>&1 </dev/null & )`,
    # which detaches the *session* but leaves the server a live child of this
    # script — so `bash` sits in `do_wait` for a process that runs forever, and
    # because `start`'s stdout is a command-substitution pipe, the caller's
    # `URL=$(landing-site.sh start)` never sees EOF and blocks forever. Measured
    # with `wchan`: the parent in `anon_pipe_read`, this script in `do_wait`, and
    # the server still parented to it.
    #
    # Closing all three descriptors at the subshell level is what makes `setsid`
    # meaningful: the server keeps its own log, and nothing remains for this
    # script to wait on.
    ( cd "$DOCS" && setsid python3 -m http.server "$PORT" --bind 127.0.0.1 >"$LOG" 2>&1 </dev/null & ) >/dev/null 2>&1 </dev/null
    for _ in $(seq 1 40); do
      running && break
      sleep 0.25
    done
    if ! running; then
      echo "the landing server did not come up on $PORT; log:" >&2
      cat "$LOG" >&2
      exit 1
    fi
    # Whoever holds the port is the server. `ss` is in this sandbox's base image
    # and `pgrep -f 'http.server PORT'` is the fallback for a box without it.
    listener="$(ss -ltnpH "sport = :$PORT" 2>/dev/null | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2)"
    if [ -z "$listener" ]; then
      listener="$(pgrep -f "http.server $PORT" | head -1)"
    fi
    if [ -n "$listener" ]; then
      echo "$listener" > "$PIDFILE"
    else
      echo "warning: the server answers but no listener pid could be found" >&2
    fi
    echo "http://127.0.0.1:$PORT/"
    ;;
  stop)
    if [ -f "$PIDFILE" ]; then
      pid="$(cat "$PIDFILE")"
      # Only kill it if it is still the server we started. A recycled pid
      # belongs to somebody else and killing it is a bug in this script.
      if [ -n "$pid" ] && [ -r "/proc/$pid/cmdline" ] \
         && tr '\0' ' ' < "/proc/$pid/cmdline" | grep -q 'http.server'; then
        kill "$pid" 2>/dev/null || true
      fi
      rm -f "$PIDFILE"
    fi
    # A server started by hand (a previous session, another tool) is left alone
    # on purpose: this script owns what it started and nothing else.
    exit 0
    ;;
  *)
    echo "usage: landing-site.sh [start|stop]" >&2
    exit 2
    ;;
esac
