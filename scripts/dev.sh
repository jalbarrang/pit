#!/usr/bin/env bash
# Launch pit with the FFI flag OpenTUI's native renderer needs.
# No args -> run the app. With args -> passthrough (e.g. scripts/dev.sh packages/app/src/perf-stress.ts).
cd "$(dirname "$0")/.." || exit 1
if [ "$#" -eq 0 ]; then
  exec node --experimental-ffi packages/app/src/main.ts
fi
exec node --experimental-ffi "$@"
