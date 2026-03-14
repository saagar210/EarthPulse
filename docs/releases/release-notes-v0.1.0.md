# EarthPulse Release Notes v0.1.0

- Date: 2026-03-13
- Channel: internal readiness baseline
- Release posture: internal unsigned beta

## Highlights

- Desktop app launch is validated from a supported local path.
- Deterministic verification is green from a compliant branch.
- Browser preview now supports realistic smoke checks through a mocked Tauri bridge.
- Handoff docs, runbooks, and release guidance are now published in `docs/`.

## Technical Changes

- Frontend:
  - added browser-preview runtime mocks for Tauri APIs
  - improved replay, settings, watchlist, and dialog accessibility
  - added better loading, empty, and degraded states in key panels
- Backend:
  - verified desktop runtime against live data with a personal NASA API key
  - preserved the existing Tauri command contract
- Tooling / CI:
  - stabilized Playwright smoke setup
  - reduced the largest frontend chunk below the old warning threshold
- Docs / runbooks:
  - added architecture docs, onboarding docs, runbooks, release notes, and closeout artifacts

## Verification Summary

- `bash .codex/scripts/run_verify_commands.sh`: passed
- `pnpm test:e2e`: passed
- Desktop launch: passed with `pnpm tauri dev` from a colon-free path

## Known Issues

- the original workspace path containing `:` remains unsupported for local desktop execution
- signed/notarized distribution is not complete until GitHub Actions release credentials are provisioned
- live upstream services can still degrade independently of local app health

## Rollback Notes

- Previous known-good state: last green commit before release tagging
- Rollback docs:
  - `docs/release/ROLLBACK_DRILL.md`
  - `docs/runbooks/rollback-recovery.md`

## Follow-Up Items

- provision signing and notarization secrets if the target changes from internal beta to signed distribution
- expand smoke coverage further around export and summary generation flows
