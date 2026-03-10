#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$repo_root"

mode="${1:-local}"
if [[ "$mode" != "local" && "$mode" != "--ci" ]]; then
  echo "usage: $0 [--ci]"
  exit 2
fi

required_commands=(node pnpm rustc cargo git)
missing=()
for cmd in "${required_commands[@]}"; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    missing+=("$cmd")
  fi
done

if (( ${#missing[@]} > 0 )); then
  echo "Preflight failed: missing required commands: ${missing[*]}"
  exit 1
fi

if [[ "$mode" != "--ci" && "$repo_root" == *:* ]]; then
  cat <<'EOF'
Preflight failed: repository path contains ":".
This breaks local tool resolution and Rust dynamic library paths.
Move or symlink the repository to a path without ":" and retry.
EOF
  exit 1
fi

node_major="$(node -p 'process.versions.node.split(".")[0]')"
if (( node_major < 20 )); then
  echo "Preflight failed: Node.js 20+ is required."
  exit 1
fi

pnpm_major="$(pnpm --version | cut -d. -f1)"
if (( pnpm_major < 10 )); then
  echo "Preflight failed: pnpm 10+ is required."
  exit 1
fi

rust_version="$(rustc --version | awk '{print $2}')"
rust_major="$(echo "$rust_version" | cut -d. -f1)"
rust_minor="$(echo "$rust_version" | cut -d. -f2)"
if (( rust_major < 1 )) || (( rust_major == 1 && rust_minor < 88 )); then
  echo "Preflight failed: rustc 1.88+ is required."
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "Preflight failed: node_modules is missing. Run 'pnpm install'."
  exit 1
fi

echo "Preflight passed."
