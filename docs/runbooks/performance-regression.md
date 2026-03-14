# Performance Regression Runbook

- Owner: Operations Owner
- Last reviewed: 2026-03-13

## When To Use This

Use this runbook when:

- Vite warns about oversized chunks
- bundle size grows unexpectedly
- build time becomes meaningfully slower
- the app feels sluggish on startup or during interaction

## Signals

Primary repo-defined signals:

- `pnpm perf:bundle`
- `pnpm perf:assets`
- `pnpm perf:build`
- deterministic verify output

Secondary signals:

- slow local startup in `pnpm tauri dev`
- map or sidebar lag during smoke testing

## First Response

1. Re-run the relevant perf commands.
2. Compare results to the last accepted baseline or last green branch.
3. Identify whether the change is startup, bundle, asset, or runtime-interaction related.

## Common Root Causes

| Symptom              | Likely cause                                        | First fix direction                                 |
| -------------------- | --------------------------------------------------- | --------------------------------------------------- |
| large frontend chunk | new heavy dependency or poor chunking               | split vendor chunks or lazy-load secondary features |
| slower build         | extra transforms or large asset pipeline            | isolate config or asset changes                     |
| runtime lag          | too much work at startup                            | defer non-critical panel work                       |
| asset failure        | unexpected tracked artifact or missing public asset | fix asset pipeline or cleanup rules                 |

## Recovery Commands

```bash
pnpm perf:bundle
pnpm perf:assets
pnpm perf:build
pnpm build
```

If the problem is clearly cache-related, use:

```bash
pnpm clean:heavy
```

## Exit Criteria

Do not call the issue resolved until:

- the triggering perf signal is back within the accepted range
- the app still passes smoke and deterministic verification
- the release notes or PR notes mention any accepted tradeoff
