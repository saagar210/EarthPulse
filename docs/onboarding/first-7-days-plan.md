# EarthPulse First 7 Days Plan

## Goal

Get a new contributor from first launch to a safe, verified change without relying on tribal knowledge.

## Day 1

- Read `README.md`
- Complete `docs/onboarding/environment-setup.md`
- Run `pnpm preflight`
- Run `pnpm tauri dev`

## Day 2

- Read `docs/onboarding/repo-tour.md`
- Walk the main UI flows in desktop mode
- Run `pnpm test:e2e`

## Day 3

- Read `docs/architecture/system-overview.md`
- Read `docs/architecture/frontend-backend-boundary.md`
- Trace one feature from UI to Rust handler and back

## Day 4

- Read `docs/runbooks/data-source-failure.md`
- Read `docs/runbooks/incident-triage.md`
- Reproduce one non-destructive smoke issue in browser preview and in desktop mode

## Day 5

- Run `bash .codex/scripts/run_verify_commands.sh`
- Review the release docs in `docs/release/`
- Review the current release notes in `docs/releases/`

## Day 6

- Pick a small safe task:
  - UI copy or empty state
  - doc correction
  - test improvement
- Make the change on a compliant branch

## Day 7

- Open a PR with the required template sections
- Ask for review with one known risk and one validation note
- Update docs if the change touched behavior or setup
