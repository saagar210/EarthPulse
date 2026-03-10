# EarthPulse Quickstart

## 1) Clone and Install
```bash
pnpm install
```

## 2) Validate Environment
```bash
pnpm preflight
```

If preflight fails because the path contains `:`, move or symlink the repository to a path without `:` and retry.

## 3) Run App
```bash
pnpm tauri dev
```

## 4) Run Deterministic Verification
```bash
bash .codex/scripts/run_verify_commands.sh
```

## 5) Common Commands
```bash
pnpm lint
pnpm typecheck
pnpm exec vite build
CARGO_TARGET_DIR=/tmp/earthpulse-cargo-target cargo check --manifest-path src-tauri/Cargo.toml
```
