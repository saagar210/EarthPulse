# Changelog Draft

## Unreleased

### Theme: Settings reliability hardening
- Settings modal save path now awaits backend persistence before closing.
- Added explicit save-in-progress state and inline save error feedback.
- Sanitized Ollama model input before local-state and backend persistence.

### Theme: Data health telemetry UX correctness
- Added timer-driven refresh in `SourceHealthPanel` so age/stale indicators continue updating even when no new telemetry event arrives.
- Updated helper functions to compute age/status from a stable shared timestamp.

### Theme: Backend validation + testability
- Extracted settings payload validation into dedicated `validate_settings` helper.
- Added unit tests covering valid payload, empty model rejection, and invalid coordinate rejection.

### Theme: Session auditability/resume hardening
- Added `codex/` operational artifacts:
  - `PLAN.md`
  - `SESSION_LOG.md`
  - `DECISIONS.md`
  - `CHECKPOINTS.md`
  - `VERIFICATION.md`
  - `CHANGELOG_DRAFT.md`

### Theme: Build optimization (continuation)
- Added conservative Vite `manualChunks` configuration to isolate `uplot` into a dedicated `vendor-charts` chunk.
- Reduced primary vendor bundle size from ~680 kB to ~558 kB (warning remains; deferred deeper lazy-loading work).
