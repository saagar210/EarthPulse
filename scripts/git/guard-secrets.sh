#!/usr/bin/env bash
set -euo pipefail

# codex-os-managed
if ! command -v gitleaks >/dev/null 2>&1; then
  echo "gitleaks not found; skipping local secret scan."
  exit 0
fi

gitleaks protect --staged --redact
