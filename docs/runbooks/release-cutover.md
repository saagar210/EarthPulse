# Release Cutover Runbook

- Owner: Release Manager
- Last reviewed: 2026-03-13

## Purpose

Use this runbook when promoting EarthPulse from a green branch to a tagged release candidate or stable tag.

## Default Release Target

Current default target: internal unsigned beta.

Use signed distribution only after `docs/release/RELEASE_SECRETS_SETUP.md` is fully completed with real credentials.

## Preconditions

1. Work is merged to the target branch.
2. `bash .codex/scripts/run_verify_commands.sh` passes on the release commit.
3. `quality-foundation` and `security-quality` GitHub workflows are green.
4. Version numbers match in `package.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json`.
5. Release notes are updated in `docs/releases/`.

## RC Cutover

1. Choose the tag: `vX.Y.Z-rc.N`
2. Validate the tag locally:

```bash
node scripts/release/validate-tag-channel.mjs vX.Y.Z-rc.N
```

3. Push the tag.
4. Confirm the `release-matrix` workflow starts.
5. Download and inspect artifacts and checksums.
6. Record outcomes in the current release notes file.

## Stable Cutover

1. Confirm the RC was accepted.
2. Use the promotion flow documented in `docs/release/RC_PROMOTION.md`.
3. Confirm stable artifacts, checksums, and summaries are present.
4. If signed distribution is enabled, validate signed macOS artifacts and notarization output before announcing the release.

## Go / No-Go Questions

Answer all of these before cutover:

- Is the deterministic verify script green?
- Is the desktop app launchable from a supported path?
- Are known issues captured in the release notes?
- Are required release credentials present for the intended release target?
- Is rollback still available if the tag must be withdrawn?

## Rollback Trigger

Stop and roll back when:

- the tagged commit fails release packaging
- artifact contents do not match expectations
- signed macOS packaging fails after secrets are enabled
- a Sev 1 or Sev 2 issue is discovered in release validation

## Post-Cutover Validation

- open one artifact on each supported platform if available
- verify checksums are published
- confirm release notes and rollback notes are linked
- log any follow-up work in the closeout report
