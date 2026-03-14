# Release Runbook

## Scope

Operational release flow for unsigned RC/stable artifacts.
Signing and notarization are intentionally deferred to a credentialed follow-up.

## Current Release Posture

The current default target for this repo is **internal unsigned beta readiness**.

- Internal beta ready: local launch works, deterministic verification is green, and unsigned artifacts are acceptable.
- Distribution ready: not complete until signing/notarization secrets are provisioned and signed artifacts are validated.

## Preconditions

1. `bash .codex/scripts/run_verify_commands.sh` passes locally.
2. `quality-foundation` and `security-quality` workflows are green on the release commit.
3. Version sync is clean across `package.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json`.

## Tagging Policy

1. RC: `vX.Y.Z-rc.N`
2. Stable: `vX.Y.Z`
3. Tag version must match app version in all manifests.

Use `scripts/release/validate-tag-channel.mjs` to validate tags before push.

## Pipeline

1. Push an RC or stable tag.
2. `release-matrix` builds desktop bundles for Linux/macOS/Windows.
3. Checksums are generated and uploaded.
4. Build provenance attestation is generated for checksum manifest.

## Credential-Ready Signing Contract

The release workflow now accepts optional signing and notarization credentials without requiring any workflow edits.

For the exact secret names, setup commands, validation steps, and current status, use `docs/release/RELEASE_SECRETS_SETUP.md`.

Add these GitHub Actions secrets when you are ready to enable signed releases:

1. `TAURI_SIGNING_PRIVATE_KEY` — updater signing private key.
2. `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — password for the updater signing key, if one is set.
3. `APPLE_CERTIFICATE` — Apple signing certificate blob for macOS signing.
4. `APPLE_CERTIFICATE_PASSWORD` — password for the Apple certificate.
5. `APPLE_SIGNING_IDENTITY` — signing identity string to use during macOS packaging.
6. `APPLE_API_ISSUER` — App Store Connect issuer identifier for notarization.
7. `APPLE_API_KEY_ID` — App Store Connect API key identifier. The workflow maps this to Tauri's `APPLE_API_KEY` environment variable.
8. `APPLE_API_PRIVATE_KEY` — contents of the `.p8` App Store Connect private key. The workflow writes this to a temporary file and maps it to `APPLE_API_KEY_PATH`.

If these secrets are absent, the workflow continues to produce unsigned artifacts exactly as it does today.

## RC Promotion

1. Run `release-promote` workflow.
2. Input `rc_tag` (existing) and `stable_tag` (new).
3. Workflow retags the same commit as stable.
4. Workflow dispatches `release-matrix` explicitly for stable packaging.

## Remaining Credentialed Follow-Up

1. Populate signing and notarization secrets in GitHub Actions.
2. Run an RC tag through `release-matrix` and verify signed macOS artifacts.
3. Validate updater signatures if updater artifacts are enabled later.
4. Confirm any post-sign artifact replacement and validation steps required by distribution policy.

## Companion Docs

- `docs/release/RELEASE_SECRETS_SETUP.md`
- `docs/runbooks/release-cutover.md`
- `docs/releases/release-notes-template.md`
- `docs/releases/release-notes-v0.1.0.md`
