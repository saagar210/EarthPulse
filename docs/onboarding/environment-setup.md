# EarthPulse Environment Setup

## Supported local setup

Use a local path that does **not** contain `:`. The repo preflight rejects colon-delimited paths because they break local tool resolution and Rust dynamic library loading.

Required tools:

- Node.js 20+
- pnpm 10+
- Rust 1.88+
- Git

## Install sequence

```bash
pnpm install
pnpm preflight
```

If `pnpm preflight` fails:

1. Fix the reported tool or version mismatch first.
2. If the failure mentions `node_modules`, run `pnpm install`.
3. If the failure mentions the repo path, move or create a worktree in a colon-free directory and retry.

## Optional configuration

Set `EARTHPULSE_NASA_API_KEY` or `NASA_API_KEY` only if NASA demo-key limits affect local smoke testing. It is not required for first launch.

## Local run modes

- Desktop truth: `pnpm tauri dev`
- Browser preview with mocked desktop data: `pnpm dev`

Use the browser preview for quick UI smoke checks only. Use the desktop app for real launch validation.
