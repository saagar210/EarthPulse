#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

lean_root="$(mktemp -d "${TMPDIR:-/tmp}/earthpulse-lean.XXXXXX")"
mkdir -p "$lean_root/cargo-target" "$lean_root/vite-cache"

cleanup() {
  rm -rf "$lean_root"
  bash ./scripts/clean-heavy-artifacts.sh >/dev/null 2>&1 || true
}

trap cleanup EXIT INT TERM

export CARGO_TARGET_DIR="$lean_root/cargo-target"
export VITE_CACHE_DIR="$lean_root/vite-cache"

echo "Lean dev mode"
echo "  CARGO_TARGET_DIR=$CARGO_TARGET_DIR"
echo "  VITE_CACHE_DIR=$VITE_CACHE_DIR"
echo "Heavy artifacts will be cleaned when the process exits."

pnpm tauri dev "$@"
