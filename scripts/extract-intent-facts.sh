#!/usr/bin/env bash
# Extract structural facts for `hiker verify` (see .hiker/tents/domain-purity/).
# Emits .hiker-cache/domain-purity.facts.json:
#   instances.File  = every production module under packages/*/src/domain/**
#   tuples.domain_imports_opentui = the subset importing @opentui/core
set -euo pipefail

out=".hiker-cache/domain-purity.facts.json"
mkdir -p .hiker-cache

files=()
while IFS= read -r f; do
  files+=("$f")
done < <(find packages/*/src/domain -type f -name '*.ts' ! -name '*.test.ts' | sort)

violations=()
for f in "${files[@]}"; do
  if grep -q "@opentui" "$f"; then
    violations+=("$f")
  fi
done

{
  echo '{'
  echo '  "instances": {'
  echo '    "File": ['
  for i in "${!files[@]}"; do
    sep=$([ "$i" -lt $((${#files[@]} - 1)) ] && echo "," || echo "")
    printf '      { "id": "%s" }%s\n' "${files[$i]}" "$sep"
  done
  echo '    ]'
  echo '  },'
  echo '  "tuples": {'
  echo '    "domain_imports_opentui": ['
  for i in "${!violations[@]}"; do
    sep=$([ "$i" -lt $((${#violations[@]} - 1)) ] && echo "," || echo "")
    printf '      ["%s"]%s\n' "${violations[$i]}" "$sep"
  done
  echo '    ]'
  echo '  }'
  echo '}'
} >"$out"

echo "facts: ${#files[@]} domain files, ${#violations[@]} violation(s) -> $out"
