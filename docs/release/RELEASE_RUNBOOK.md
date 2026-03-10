# Release Runbook

## Scope
Operational release flow for unsigned RC/stable artifacts.
Signing and notarization are intentionally deferred to a credentialed follow-up.

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

## RC Promotion
1. Run `release-promote` workflow.
2. Input `rc_tag` (existing) and `stable_tag` (new).
3. Workflow retags the same commit as stable.
4. Workflow dispatches `release-matrix` explicitly for stable packaging.

## Deferred Steps
1. Signing certificates.
2. macOS notarization credentials.
3. Post-sign artifact replacement and validation.
