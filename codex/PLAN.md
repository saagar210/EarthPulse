# Delta Plan

## A) Executive Summary

### Current state (repo-grounded)
- App is a Tauri desktop shell with React/TypeScript frontend and Rust backend orchestration (`src/App.tsx`, `src-tauri/src/lib.rs`).
- Data ingestion is event-driven with multiple background pollers and UI listeners for earthquakes, ISS, solar, hazards, satellites, etc. (`src-tauri/src/lib.rs`, `src/stores/*Store.ts`).
- Settings persistence recently expanded to include additional preferences, but UX and runtime consistency still require hardening (`src-tauri/src/commands/settings.rs`, `src/stores/settingsStore.ts`, `src/components/Settings/SettingsPanel.tsx`).
- Source health telemetry was added and surfaced in sidebar, but freshness rendering and operability polish are incomplete (`src/stores/sourceHealthStore.ts`, `src/hooks/useSourceHealth.ts`, `src/components/Sidebar/SourceHealthPanel.tsx`).
- Validation coverage exists for frontend lint/build; Rust tests are environment-blocked due missing GLib system package.

### Key risks
- Inconsistent settings behavior when persistence fails (UI currently closes modal immediately, limited user feedback).
- Freshness/status panel may present stale timestamps without periodic recomputation.
- Notification preference semantics can drift if controls exist without clear runtime behavior.
- Baseline Rust test inability reduces confidence without compensating targeted checks.

### Improvement themes (prioritized)
1. Settings UX + persistence reliability hardening.
2. Telemetry/freshness UX correctness and readability.
3. Backend settings/notification contract quality and targeted regression tests.
4. Session auditability/resume artifacts for long-running autonomous iteration.

## B) Constraints & Invariants (Repo-derived)

### Explicit invariants
- Preserve Tauri command names and payload compatibility for existing frontend invocation paths (`get_settings`, `save_settings`, data-fetch commands).
- Preserve existing map/sidebar workflows and layer controls.
- Keep notification checks and data polling cadence unchanged unless explicitly improved for correctness.

### Implicit invariants (inferred)
- Zustand stores are source of truth for frontend rendering.
- Backend DB settings are source of truth for runtime notifications.
- App should continue to run without mandatory external LLM service (Ollama summary is optional).

### Non-goals
- No architectural rewrite of polling system.
- No redesign of map component tree.
- No CI system introduction in this pass.

## C) Proposed Changes by Theme (Prioritized)

### Theme 1: Settings UX + persistence reliability
- **Current approach:** Settings modal writes to store and backend; closes regardless of persistence success.
- **Proposed:** Add save-in-flight + save-error state, trim/sanitize model input before local/state persistence, close only on success.
- **Why:** Prevent silent failures and improve trustworthiness.
- **Tradeoffs:** Slightly more component state and async handling complexity.
- **Scope boundary:** Settings panel + settings store typing only; no global modal framework changes.
- **Migration:** Non-breaking, incremental changes in existing files.

### Theme 2: Source health/freshness correctness
- **Current approach:** Status computed at render time from latest event snapshot, but no periodic tick means age/staleness can freeze between events.
- **Proposed:** Add lightweight timer-driven refresh in health panel and readable labels for stale/error states.
- **Why:** Telemetry must remain accurate over time without requiring new events.
- **Tradeoffs:** Minimal periodic render overhead.
- **Scope boundary:** Sidebar health component only.
- **Migration:** UI-only enhancement, no backend contract changes.

### Theme 3: Backend contract + targeted tests
- **Current approach:** Expanded settings schema exists; validation test coverage is thin and environment blocks full cargo test.
- **Proposed:** Add focused Rust tests where possible and tighten command validation behavior consistency.
- **Why:** Improve confidence despite environment limitations.
- **Tradeoffs:** Limited by host dependencies.
- **Scope boundary:** `commands/settings.rs`, `db.rs`, existing helper tests.
- **Migration:** Backward-compatible command payload extensions retained.

### Theme 4: Session artifacts and checkpointing
- **Current approach:** No persistent codex operation trail in-repo.
- **Proposed:** Add and maintain `codex/*` planning/log files per request.
- **Why:** Resume safety and auditability.
- **Tradeoffs:** Additional documentation maintenance overhead.
- **Scope boundary:** `codex/` only.

## D) File/Module Delta (Exact)

### ADD
- `codex/SESSION_LOG.md` – chronological execution log.
- `codex/PLAN.md` – this plan.
- `codex/DECISIONS.md` – judgment calls.
- `codex/CHECKPOINTS.md` – checkpoint records.
- `codex/VERIFICATION.md` – command evidence.
- `codex/CHANGELOG_DRAFT.md` – delivery draft.

### MODIFY
- `src/components/Settings/SettingsPanel.tsx` – async save hardening + user-visible errors.
- `src/stores/settingsStore.ts` – helper alignment/sanitization support if needed.
- `src/components/Sidebar/SourceHealthPanel.tsx` – periodic freshness updates.
- `src-tauri/src/commands/settings.rs` – validation/test hardening.
- `src-tauri/src/db.rs` and/or `src-tauri/src/lib.rs` – only if required by correctness fixes.

### REMOVE/DEPRECATE
- None planned.

### Boundary rules
- No new cross-layer dependency from Rust backend into frontend-specific semantics.
- Keep frontend-only health rendering logic out of backend.

## E) Data Models & API Contracts (Delta)

### Current
- Settings contract defined in `SaveSettingsPayload`/`SettingsResponse` (`src-tauri/src/commands/settings.rs`).
- Frontend persisted settings shape defined in `PersistedSettings` (`src/stores/settingsStore.ts`).

### Proposed
- Preserve existing fields; improve input sanitation and error messaging semantics.

### Compatibility
- Backward compatible with existing frontend payload keys.

### Migrations
- No DB schema migration needed (key/value settings table already supports extra keys).

### Versioning
- Internal app contract; no external API version bump required.

## F) Implementation Sequence (Dependency-Explicit)

1. **Objective:** Create session artifacts and checkpoints.
   - Files: `codex/*`
   - Preconditions: discovery done.
   - Verification: `git status`, markdown sanity.
   - Rollback: remove `codex/` additions.

2. **Objective:** Harden settings save UX flow.
   - Files: `src/components/Settings/SettingsPanel.tsx` (+ store if needed)
   - Preconditions: baseline green frontend checks.
   - Verification: `pnpm lint`, `pnpm build`.
   - Rollback: restore panel file.

3. **Objective:** Improve health panel freshness correctness.
   - Files: `src/components/Sidebar/SourceHealthPanel.tsx`
   - Preconditions: step 2 green.
   - Verification: `pnpm lint`, `pnpm build`.
   - Rollback: restore panel file.

4. **Objective:** Add targeted backend validation/tests improvements.
   - Files: `src-tauri/src/commands/settings.rs` (and minimal related files if needed)
   - Preconditions: step 3 green.
   - Verification: `cargo fmt`, `pnpm lint`, `pnpm build`; attempt `cargo test` and document env block.
   - Rollback: restore touched Rust files.

5. **Objective:** Final hardening, docs, changelog draft, checkpoints.
   - Files: `codex/*`
   - Verification: repeat full suite from baseline.
   - Rollback: revert documentation-only changes if needed.

## G) Error Handling & Edge Cases
- Handle settings save failure in modal (display actionable error, keep dialog open).
- Handle blank/whitespace Ollama model consistently.
- Ensure source health view updates age labels even without new events.
- Validate numeric ranges remain enforced in backend command layer.

## H) Integration & Testing Strategy
- Frontend regression checks: lint + build after each implementation step.
- Rust checks: `cargo fmt` each Rust touch; `cargo test` attempted and recorded with env limitations.
- Manual UI sanity via screenshot capture for changed visual surfaces.

## I) Assumptions & Judgment Calls
- Assumption: unsatisfied feedback stems from polish/reliability gaps and lack of auditable process artifacts.
- Judgment call: prioritize non-breaking hardening over broad redesign.
- Alternative rejected: removing new telemetry/settings features entirely (would regress requested improvements).

## J) Next Theme Prioritization (Post-continuation)
1. **Bundle-size optimization via lazy loading (highest next ROI).**
   - Introduce dynamic imports for heavier sidebar modules and non-critical overlays.
   - Goal: eliminate Vite >500k warning while preserving startup responsiveness.
2. **Environment parity for Rust verification.**
   - Ensure CI/dev image includes `glib-2.0` pkg-config metadata so `cargo test` is actionable.
3. **Targeted integration checks (once harness exists).**
   - Add focused settings round-trip and failed-save UI behavior tests using a selected frontend test runner.
