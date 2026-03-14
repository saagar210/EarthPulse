# Release Secrets Setup

- Owner: Release Manager
- Last reviewed: 2026-03-13
- Current status: workflow support is ready, but signing and notarization values are not provisioned in this repository by default

## Purpose

This doc explains how to provision the optional GitHub Actions secrets required for signed desktop releases. These secrets are not required for the default internal unsigned beta flow.

## When This Is Required

Complete this doc only if the target changes from internal unsigned beta to signed public distribution.

## Required GitHub Actions Secrets

| Secret                               | Purpose                                             |
| ------------------------------------ | --------------------------------------------------- |
| `TAURI_SIGNING_PRIVATE_KEY`          | updater signing private key                         |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | password for the updater signing key, if used       |
| `APPLE_CERTIFICATE`                  | macOS signing certificate blob                      |
| `APPLE_CERTIFICATE_PASSWORD`         | password for the macOS certificate                  |
| `APPLE_SIGNING_IDENTITY`             | macOS signing identity string                       |
| `APPLE_API_ISSUER`                   | App Store Connect issuer identifier                 |
| `APPLE_API_KEY_ID`                   | App Store Connect API key identifier                |
| `APPLE_API_PRIVATE_KEY`              | contents of the App Store Connect `.p8` private key |

## Current Repository Status

As of 2026-03-13, the release workflow already accepts these secret names, but they were not present in the repository at the time this doc was authored.

That means:

- unsigned internal beta releases are supported now
- signed public distribution is still blocked on real credential provisioning

## Provisioning Steps

1. Confirm you are using the correct repo:

```bash
gh auth status
gh repo view saagar210/EarthPulse
```

2. Add each secret from a secure local source. Examples:

```bash
gh secret set --repo saagar210/EarthPulse TAURI_SIGNING_PRIVATE_KEY < tauri-signing-key.pem
gh secret set --repo saagar210/EarthPulse TAURI_SIGNING_PRIVATE_KEY_PASSWORD
gh secret set --repo saagar210/EarthPulse APPLE_CERTIFICATE < apple-certificate.p12.base64
gh secret set --repo saagar210/EarthPulse APPLE_CERTIFICATE_PASSWORD
gh secret set --repo saagar210/EarthPulse APPLE_SIGNING_IDENTITY
gh secret set --repo saagar210/EarthPulse APPLE_API_ISSUER
gh secret set --repo saagar210/EarthPulse APPLE_API_KEY_ID
gh secret set --repo saagar210/EarthPulse APPLE_API_PRIVATE_KEY < AuthKey_XXXXXX.p8
```

3. Confirm the secret names exist:

```bash
gh secret list --repo saagar210/EarthPulse
```

4. Run a release candidate tag through `release-matrix`.

5. Validate:

- signed macOS artifacts are produced
- notarization succeeds
- checksums are still generated
- release notes capture the signed-release validation result

## Handling Rules

- Never commit secret values to the repo.
- Never store secret values in docs or tracked config files.
- Keep the `.p8`, `.p12`, and private signing key files in a secure credential store, not in the repository.
- Rotate any key that was pasted into chat or shared insecurely.

## Exit Criteria

Do not call signed distribution ready until:

- all required secrets are present
- a signed RC is built successfully
- notarization completes for macOS
- the release notes and runbook are updated with the signed validation evidence
