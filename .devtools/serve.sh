#!/usr/bin/env bash
# Start one test profile on one port, record its pid and its token URL.
# usage: serve.sh <profile> <port> <logfile> [home]
set -u
PROFILE="$1"; PORT="$2"; LOG="$3"; HOME_DIR="${4:-/tmp/fa-home}"
: > "$LOG"
DSH_HOME="$HOME_DIR" nohup dsh --profile "$PROFILE" --port "$PORT" --no-open >"$LOG" 2>&1 &
echo $! > "$LOG.pid"
for _ in $(seq 1 60); do
  if grep -q 'token=' "$LOG" 2>/dev/null; then break; fi
  sleep 1
done
cat "$LOG"
