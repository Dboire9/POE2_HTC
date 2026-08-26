#!/usr/bin/env bash
# Full 0.5.0 data refresh pipeline:
#   1. download RePoE-fork PoE2 dump (structure) if not cached
#   2. refresh.mjs      -> regenerate our-schema mods/base_items from RePoE (normal pools)
#   3. apply_weights.mjs-> overlay poe2db community spawn weights (DropChance) onto them
#   4. apply_pools.mjs  -> build the essence + desecrated pools from poe2db (+ essences.json)
#   5. diff.mjs         -> structural diff vs the 0.5 Java baseline
#
# poe2db class/base pages must already be cached under tools/refresh/cache/poe2db/ (fetched once;
# re-fetch by deleting them). Run from repo root: ./tools/refresh/run.sh
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CACHE="$ROOT/tools/refresh/cache"
mkdir -p "$CACHE"

for f in mods base_items mods_by_base tags; do
  if [ ! -s "$CACHE/repoe_$f.json" ]; then
    echo "downloading RePoE $f.json ..."
    curl -sSL --max-time 180 -o "$CACHE/repoe_$f.json" "https://repoe-fork.github.io/poe2/$f.json"
  fi
done

node "$ROOT/tools/refresh/refresh.mjs"
node "$ROOT/tools/refresh/apply_weights.mjs"
node "$ROOT/tools/refresh/apply_pools.mjs"
node "$ROOT/tools/refresh/diff.mjs" > "$ROOT/docs/refresh-0.5.0-diff.md"
echo "wrote docs/refresh-0.5.0-diff.md"
