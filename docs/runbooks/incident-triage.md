# Incident Triage Runbook

- Owner: Operations Owner
- Last reviewed: 2026-03-13

## When To Use This

Use this runbook when EarthPulse is running but one or more of these are true:

- the app crashes or fails to launch
- a critical panel is blank or obviously stale
- exports, settings, or watchlists fail
- performance regresses enough to block normal use

## Severity Guide

| Severity | Meaning                      | Example                                            |
| -------- | ---------------------------- | -------------------------------------------------- |
| Sev 1    | app unusable                 | desktop app does not launch or instantly crashes   |
| Sev 2    | core feature broken          | earthquakes, map, or settings fail in desktop mode |
| Sev 3    | partial degradation          | one source fails but app remains usable            |
| Sev 4    | cosmetic or low-impact issue | copy, spacing, or non-blocking preview defect      |

## First 15 Minutes

1. Confirm whether the issue is happening in desktop mode or browser preview.
2. Reproduce once in `pnpm tauri dev` if the issue touches native behavior.
3. Check the in-app **Data Health** panel.
4. Check the terminal for fetch, invoke, tray, or file-system errors.
5. Decide severity using the table above.
6. If the app is launch-blocked, stop feature work and stabilize first.

## Fast Diagnosis Matrix

| Symptom                               | First place to look                       | Likely class                              |
| ------------------------------------- | ----------------------------------------- | ----------------------------------------- |
| App will not open                     | `pnpm preflight`, `pnpm tauri dev` output | environment or Tauri startup              |
| One live panel is empty               | Data Health + terminal                    | upstream failure or empty/error-state gap |
| Settings do not persist               | desktop logs + settings flow              | command or SQLite issue                   |
| Browser test passes but desktop fails | desktop logs                              | native boundary issue                     |
| Replay or historical flow feels stuck | UI state and console                      | frontend mode-state bug                   |

## Containment

- Prefer rollback to the last green commit if a Sev 1 or Sev 2 issue lands after merge.
- Do not trust browser preview alone for incident closure.
- If an upstream feed is the only failing area, keep the app usable with degraded-state messaging rather than hiding the panel.

## Validation Before Closure

Run the smallest relevant proof first, then the full repo gate:

```bash
pnpm preflight
pnpm tauri dev
pnpm test:e2e
bash .codex/scripts/run_verify_commands.sh
```

## Communication Template

Use this plain-language format:

- What is broken
- Who is affected
- Current severity
- Known workaround, if any
- Next update time

## Escalate When

- a Sev 1 or Sev 2 issue cannot be reproduced locally but appears in CI or release runs
- release signing/notarization fails after credentials are provisioned
- repeated upstream failures cause misleading UI state instead of degraded messaging
