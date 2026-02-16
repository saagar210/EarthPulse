#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

rm -rf \
  dist \
  src-tauri/target \
  src-tauri/gen \
  node_modules/.vite \
  .vite \
  .cache/lean-dev \
  .next \
  .turbo \
  build

echo "Removed heavy build artifacts (dependencies preserved)."
