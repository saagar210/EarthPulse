#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

bash ./scripts/clean-heavy-artifacts.sh
rm -rf node_modules

echo "Removed full local reproducible artifacts and caches."
