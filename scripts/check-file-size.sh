#!/usr/bin/env bash
set -euo pipefail

# Self-check: create a temp 101-line file under packages/*/src, run this
# command and expect non-zero output with that path; remove it and rerun green.
limit=100
report=$(mktemp)
trap 'rm -f "$report"' EXIT
roots=()

for root in packages/*/src scripts; do
  if [ -d "$root" ]; then
    roots+=("$root")
  fi
done

if [ "${#roots[@]}" -eq 0 ]; then
  exit 0
fi

find "${roots[@]}" \
  \( -path '*/node_modules/*' -o -name '*.md' \) -prune \
  -o -type f -print0 |
  while IFS= read -r -d '' file; do
    lines=$(awk 'END { print NR }' "$file")
    if [ "$lines" -gt "$limit" ]; then
      printf '%s (%s lines)\n' "$file" "$lines" >>"$report"
    fi
  done

if [ -s "$report" ]; then
  echo "Files over ${limit} lines:" >&2
  cat "$report" >&2
  exit 1
fi
