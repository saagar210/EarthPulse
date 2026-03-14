# Rollback and Recovery Runbook

## Local recovery

Use this when a local readiness pass leaves the workspace in a bad state.

1. Stop running dev processes.
2. Re-run `pnpm preflight`.
3. Re-run the canonical verification script.
4. If build artifacts look suspect, use the repo cleanup commands documented in the README:
   - `pnpm clean:heavy`
   - `pnpm clean:full-local` only when a full reinstall is acceptable

## Release recovery

Use `docs/release/ROLLBACK_DRILL.md` for release rollback validation and `docs/release/RELEASE_RUNBOOK.md` for the release flow.

Current default posture:

- Internal beta: unsigned artifacts are acceptable if verification is green.
- External distribution: not ready until signing and notarization credentials are configured and validated.

## Verification after recovery

```bash
bash .codex/scripts/run_verify_commands.sh
```

Do not call the repo recovered until the deterministic verify flow is green from a compliant branch.
