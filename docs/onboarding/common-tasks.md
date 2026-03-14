# EarthPulse Common Tasks

## Launch locally

```bash
pnpm preflight
pnpm tauri dev
```

## Run browser preview smoke

```bash
pnpm dev
pnpm test:e2e
```

The browser preview now uses mocked desktop data so UI flows can be exercised without the Tauri bridge.

## Run full verification

```bash
bash .codex/scripts/run_verify_commands.sh
```

Run from a non-`main` branch that matches `codex/<type>/<slug>`.

## Run targeted checks

```bash
pnpm lint
pnpm typecheck
pnpm test:unit
CARGO_TARGET_DIR=/tmp/earthpulse-cargo-target cargo test --manifest-path src-tauri/Cargo.toml
```

## Performance sanity

```bash
pnpm perf:bundle
pnpm perf:assets
```
