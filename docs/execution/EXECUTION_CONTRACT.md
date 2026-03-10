# EarthPulse Execution Contract Pack

## Purpose
Provide a single execution contract for humans and agents so implementation runs deterministically and with low-noise reporting.

## Priority Order
1. System/developer instructions
2. Repository `AGENTS.md`
3. Task prompt and acceptance criteria
4. This contract

## Supported Environment Contract
1. Repository path must not contain `:`.
2. Required toolchain:
   - Node.js 20+
   - pnpm 10+
   - Rust 1.88+
3. Local dependencies must be installed (`pnpm install`).

Use `pnpm preflight` before running build/test/verify tasks.
If local path policy is violated, deterministic verify runs strict preflight as advisory and continues with `pnpm preflight:ci`.

## Canonical Execution Commands
1. Preflight: `pnpm preflight`
2. Lint: `pnpm lint`
3. Typecheck: `pnpm typecheck`
4. Frontend build: `pnpm exec vite build`
5. Backend check: `CARGO_TARGET_DIR=/tmp/earthpulse-cargo-target cargo check --manifest-path src-tauri/Cargo.toml`
6. Deterministic verify: `bash .codex/scripts/run_verify_commands.sh`

## Phase Handoff Package (Required)
Each phase handoff must include:
1. Inputs used
2. Changes made
3. Verification commands and outcomes
4. Risks and deferred items
5. Rollback note

## Reporting Contract
1. Keep default updates PM-friendly and low-noise.
2. Use concrete outcomes, not implementation narration.
3. Label uncertainty explicitly with `Uncertain:` and add validation plan.

## Gate Trustworthiness Rules
1. No placeholder checks that silently pass.
2. Any required gate in `fail` or `not-run` blocks ship-readiness.
3. Metrics comparisons must be mathematically valid (no divide-by-zero baselines).

## Sub-Agent Coordination Rules
1. One scoped objective per sub-agent.
2. Agent output must include file evidence and done criteria.
3. Coordinator reconciles conflicts before merging recommendations.

## External Blockers Contract
Execution can continue autonomously unless blocked by:
1. Missing signing/notarization credentials
2. Missing telemetry destination credentials
3. Environment path policy violation not yet remediated
