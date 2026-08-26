#!/usr/bin/env bash
# Phase-0 one-off: compile the data-only Java classes + the extractor, then dump JSON.
# Run from repo root:  ./tools/extractor/run.sh  [outDir] [patch] [generated]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SRC="$ROOT/src/main/java"
OUT_DIR="${1:-$ROOT/data/patches/0.5}"
PATCH="${2:-0.5}"
GENERATED="${3:-2026-07-04}"
BUILD="$(mktemp -d)"
trap 'rm -rf "$BUILD"' EXIT

# Only the data-only subtrees are needed (no external deps); this keeps compilation fast and
# independent of the HTTP API / crafting engine.
find "$SRC/core/Modifier_class" "$SRC/core/Item_modifiers" "$SRC/core/Items" -name '*.java' \
    > "$BUILD/srcs.txt"
echo "$ROOT/tools/extractor/DataExtractor.java" >> "$BUILD/srcs.txt"

javac -d "$BUILD/classes" @"$BUILD/srcs.txt"
java -cp "$BUILD/classes" tools.extractor.DataExtractor "$SRC" "$OUT_DIR" "$PATCH" "$GENERATED"
