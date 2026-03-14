# Data Source Failure Runbook

## When to use this

Use this when a panel is empty, stale, or clearly out of date in the desktop app.

## First checks

1. Open the **Data Health** panel and identify which source is stale, degraded, or failed.
2. Check the `pnpm tauri dev` terminal for fetch or parse errors.
3. Confirm whether the source is expected to have live fallback behavior:
   - Volcanoes can degrade to curated fallback data.
   - Browser preview mode uses mocked data and should not be used to diagnose live upstream failures.

## Expected behaviors

- `ok`: recent successful live update
- `stale`: source has not refreshed within expected cadence or is using fallback data
- `error`: most recent update failed without fallback

## Recovery steps

1. Re-run the affected desktop session with `pnpm tauri dev`.
2. If the issue is source-specific, confirm the app still handles loading, empty, and degraded states without silent failure.
3. If the failure is only in browser preview, verify the same flow in the desktop app before treating it as a backend incident.

## Escalate when

- A critical source such as earthquakes or ISS remains failed across restarts.
- A source loops repeated terminal errors.
- The UI goes blank or misleading instead of showing degraded/error state.
