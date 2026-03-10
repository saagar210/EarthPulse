# EarthPulse Final UI/UX Polish + Usability Completion Plan

## 1) Goal
Ship a final, practical UI/UX polish pass for the existing EarthPulse interface with focus on:
- completion of key user flows
- consistency across controls and panels
- accessibility baseline improvements
- low-risk finish quality (no broad redesign)

This plan is intentionally scoped to finish well, not expand product surface.

## 2) Current Interface Baseline (What We Are Polishing)
Primary surfaces already in place:
- App shell: `src/App.tsx` (Header, map, sidebar, replay bar, historical bar, settings/help modals)
- Header controls and export menu: `src/components/Header.tsx`
- Right sidebar with stacked panels: `src/components/Sidebar/Sidebar.tsx`
- Layer toggles + map style selector: `src/components/Sidebar/LayerPanel.tsx`, `src/components/Sidebar/MapStyleSelector.tsx`
- Live event feed + map fly-to: `src/components/Sidebar/EventFeed.tsx`
- Replay and historical modes: `src/components/Timeline/ReplayBar.tsx`, `src/components/Timeline/HistoricalBar.tsx`
- Settings modal + keyboard shortcut help modal: `src/components/Settings/SettingsPanel.tsx`, `src/components/Sidebar/ShortcutsHelp.tsx`

What this means:
- The product is feature-complete enough for a final polish pass.
- Most work should be interaction clarity, state consistency, and accessibility hardening.

## 3) Scope Guardrails (Avoid Overbuilding)
In scope:
- UI consistency, readability, and interaction clarity
- accessibility fixes for keyboard, labels, focus, and contrast
- completion of empty/loading/error/success states
- final usability tuning of existing flows

Out of scope for this pass:
- major IA redesign or new navigation model
- net-new data sources or backend feature work
- deep animation or visual rebrand
- large component rewrites unless required to pass gates

## 4) Completion Workstreams

### Workstream A: Visual and Interaction Consistency
Objective: make controls and panel patterns feel like one system.

Tasks:
- Standardize panel headers (title treatment, spacing, divider rhythm) across all sidebar blocks.
- Normalize control primitives:
  - button sizes and padding
  - toggle/checkbox spacing
  - input heights and border treatments
  - hover/focus/disabled states
- Reduce ultra-small UI text where it hurts readability (especially `text-[10px]` usages) and set practical minimum body size.
- Ensure icon-only controls in header have clear labels/tooltips and focus-visible styling.

Exit gate:
- Any two panels compared side-by-side should look intentionally related (same spacing cadence, type scale, control behavior).

### Workstream B: State Completeness and Copy Clarity
Objective: every visible area handles real-world states clearly.

Tasks:
- Apply a consistent state model per panel:
  - loading
  - empty/no data
  - error
  - populated
- Replace silent `null` returns where they hide context with lightweight placeholders where appropriate.
- Tighten microcopy:
  - concise, action-oriented labels
  - plain language for status messages
  - consistent units/time formatting (km, h/m ago, UTC/local guidance where needed)
- Add clear mode indicators when Replay or Historical mode is active and ensure mode-exit is obvious.

Exit gate:
- No major panel leaves the user wondering whether data is missing, loading, broken, or simply unavailable.

### Workstream C: Accessibility Baseline (Practical AA Pass)
Objective: reach a reliable accessibility floor without full redesign.

Tasks:
- Keyboard:
  - all actionable controls reachable via tab
  - logical focus order
  - visible focus indicator on all interactive elements
- Semantics:
  - icon buttons with accessible names (`aria-label`)
  - modals with dialog semantics and predictable close behavior
  - labels associated with form fields
- Contrast and readability:
  - check text/background contrast for gray-on-dark combinations
  - ensure status colors are not the only signal (add text/state labels)
- Motion and feedback:
  - avoid relying only on subtle color changes for state updates
  - keep timing/status feedback understandable for screen-reader and keyboard users

Exit gate:
- Critical flows are fully keyboard-usable and core controls are understandable without mouse-only or color-only cues.

### Workstream D: Usability Finish for Core Flows
Objective: make the top flows fast and low-friction for first-time and repeat users.

Core flow checklist:
1. Turn layers on/off and understand what changed on map.
2. Click event feed item and reliably orient to mapped location.
3. Start, control, and exit Replay mode confidently.
4. Enter, search, and exit Historical mode confidently.
5. Open settings, edit values, save/cancel with clear validation feedback.
6. Create/remove watchlists without confusion.
7. Export screenshot/data with clear action outcomes.

Tasks:
- Reduce ambiguity in compact controls (icons, tiny labels, crowded sections).
- Improve progressive disclosure in dense sidebar:
  - keep high-value info visible
  - collapse lower-priority detail where needed
- Ensure success feedback exists for important actions (save, add, export, remove).

Exit gate:
- Each core flow can be completed by a first-time user without external explanation.

## 5) Practical Polish Gates (Ship/No-Ship)
Use these as release gates; do not expand scope beyond them.

### Gate 1: Consistency
- Pass if:
  - common controls share a unified style system
  - spacing/type rhythm is consistent across header, sidebar, bars, and modals
  - no panel looks like a separate design language

### Gate 2: State Coverage
- Pass if:
  - all primary panels have clear loading/empty/error/populated behavior
  - no critical user action fails silently

### Gate 3: Accessibility Minimum
- Pass if:
  - keyboard navigation works end-to-end on core flows
  - icon-only controls are labeled
  - dialogs are operable and dismissible via keyboard
  - contrast issues in primary text/actions are resolved

### Gate 4: Usability
- Pass if:
  - core flow checklist (Section 4D) completes in manual test without confusion points
  - mode transitions (Live/Replay/Historical) are always clear

### Gate 5: Performance and Stability Guard
- Pass if:
  - polish changes do not regress existing perf checks
  - no visible UI jank introduced in map + sidebar interactions

## 6) Recommended Execution Sequence (Fast, Low Risk)
1. Baseline capture and issue list (0.5 day)
2. Consistency pass on shared primitives + spacing/type (1 day)
3. State completion + copy clarity (1 day)
4. Accessibility hardening (1 day)
5. Core flow usability pass + final QA gate run (0.5-1 day)

Target: 4-5 days, depending on how many accessibility fixes are structural.

## 7) QA and Verification Checklist
Manual acceptance run:
- Header actions: settings, export, status readability
- Sidebar scan: every panel has understandable state
- Replay/Historical: enter/use/exit with no ambiguity
- Keyboard-only pass: tab, enter/space, escape, shortcuts help
- Small-window pass: verify layout remains usable without clipping critical actions

Project checks:
- Run canonical verification script: `.codex/scripts/run_verify_commands.sh`
- Confirm no performance gate regressions before calling done

## 8) Definition of Done for This Polish Pass
This pass is complete when:
- all five polish gates pass
- core flow checklist passes in manual QA
- no P0/P1 usability or accessibility issues remain
- final UI feels coherent and predictable without adding net-new product scope

