#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

violations="$(
  git ls-files | grep -E '^(dist/|node_modules/|src-tauri/gen/|src-tauri/target/)|(^|/)\.DS_Store$|\.dmg$|\.app/' || true
)"

if [[ -n "$violations" ]]; then
  cat <<EOF
ERROR: Tracked build artifacts or local bloat were found.
Remove these files from Git tracking before building:

$violations
EOF
  exit 1
fi

echo "No tracked build artifacts found."
