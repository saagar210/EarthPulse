# EarthPulse Docs/Comms Closeout Workstream Plan

## 1) Purpose
Create a single execution plan for final documentation, communication, and handoff artifacts so EarthPulse can move from active build mode to a clean, maintainable, and stakeholder-ready closeout.

## 2) Scope
This workstream covers six lanes:
1. Architecture docs
2. Runbooks
3. Onboarding docs
4. Release notes
5. Stakeholder update package
6. Final project closeout artifacts

Out of scope:
- Major feature development
- New product roadmap definition beyond closeout follow-ups
- Re-architecture work

## 3) Success Criteria
A closeout is complete when:
- Every lane has a published artifact set in `docs/` with named owners.
- A new contributor can set up, run, and verify the app using onboarding docs only.
- Operations runbooks enable triage, recovery, and release execution without tribal knowledge.
- Release notes clearly summarize user-facing changes, technical changes, known issues, and rollback notes.
- Stakeholders receive a concise package that explains outcomes, risks, and recommended next moves.
- Final closeout packet includes decisions, unresolved risks, and ownership handoff.

## 4) Suggested Artifact Structure
Use this structure so artifacts are easy to find:

```text
docs/
  architecture/
    system-overview.md
    data-flow.md
    frontend-backend-boundary.md
    dependencies-and-external-services.md
  runbooks/
    incident-triage.md
    data-source-failure.md
    release-cutover.md
    rollback-recovery.md
    performance-regression.md
  onboarding/
    quickstart.md
    environment-setup.md
    repo-tour.md
    common-tasks.md
    first-7-days-plan.md
  releases/
    release-notes-template.md
    release-notes-v1.0.0.md
  comms/
    closeout/
      workstream-plan.md
      stakeholder-update-package.md
      final-closeout-report.md
      handoff-checklist.md
```

## 5) Workstream Breakdown

### Lane A: Architecture Docs
Goal: Preserve system understanding for future maintainers.

Deliverables:
- `docs/architecture/system-overview.md`
- `docs/architecture/data-flow.md`
- `docs/architecture/frontend-backend-boundary.md`
- `docs/architecture/dependencies-and-external-services.md`

Content checklist:
- High-level component map (React/Tauri/Rust boundaries)
- Data ingestion path per major source (USGS, NASA, NOAA, etc.)
- Store and command interaction model
- Background task and refresh cadence summary
- External dependency ownership and failure modes

Definition of done:
- Diagram or structured map included
- Reviewed by one frontend and one backend maintainer
- Includes a "How to update this doc" section

### Lane B: Runbooks
Goal: Enable predictable operations and recovery.

Deliverables:
- `docs/runbooks/incident-triage.md`
- `docs/runbooks/data-source-failure.md`
- `docs/runbooks/release-cutover.md`
- `docs/runbooks/rollback-recovery.md`
- `docs/runbooks/performance-regression.md`

Content checklist:
- Trigger conditions and severity levels
- Immediate actions (first 15 minutes)
- Diagnostic steps and expected signals
- Escalation path and communication template
- Recovery, validation, and post-incident notes

Definition of done:
- Dry run completed for at least two runbooks
- Commands validated against current scripts
- Includes owner, last-reviewed date, and escalation contacts

### Lane C: Onboarding
Goal: Reduce time-to-first-contribution for new teammates.

Deliverables:
- `docs/onboarding/quickstart.md`
- `docs/onboarding/environment-setup.md`
- `docs/onboarding/repo-tour.md`
- `docs/onboarding/common-tasks.md`
- `docs/onboarding/first-7-days-plan.md`

Content checklist:
- Local setup, required toolchain, and sanity checks
- How to run dev mode, lean mode, and build mode
- How to run verification commands
- Where key features live in the repo
- First contribution pathway (safe starter tasks)

Definition of done:
- Fresh machine test passes from zero to running app
- One new contributor completes onboarding without live help
- Known setup pitfalls and fixes are documented

### Lane D: Release Notes
Goal: Make every release understandable and auditable.

Deliverables:
- `docs/releases/release-notes-template.md`
- `docs/releases/release-notes-v1.0.0.md` (or current target)

Content checklist:
- Highlights for end users
- Internal technical changes by subsystem
- Migration/upgrade notes and compatibility constraints
- Known issues and mitigations
- Verification summary (including git/perf guard outcomes)

Definition of done:
- Template approved for reuse
- Current release notes drafted and reviewed
- Notes include rollback guidance and support contact path

### Lane E: Stakeholder Update Package
Goal: Communicate closeout outcomes in clear business language.

Deliverables:
- `docs/comms/closeout/stakeholder-update-package.md`

Content checklist:
- Executive summary (what shipped, why it matters)
- Scope delivered vs. planned
- Quality and performance posture
- Risks and residual debt
- Recommended next phase options with effort bands

Definition of done:
- Non-technical reader can understand status in under 10 minutes
- Contains explicit decisions requested from stakeholders
- Approved by project lead

### Lane F: Final Project Closeout Artifacts
Goal: Complete handoff package for long-term ownership.

Deliverables:
- `docs/comms/closeout/final-closeout-report.md`
- `docs/comms/closeout/handoff-checklist.md`

Content checklist:
- Final scope ledger (completed, deferred, dropped)
- Open risks and debt register with owners
- Ownership map (who maintains what)
- Access/dependency audit (services, keys, vendors, feeds)
- 30/60/90-day follow-up plan

Definition of done:
- Checklist fully resolved or explicitly waived
- Ownership acceptance recorded
- Follow-up review date scheduled

## 6) Execution Plan (4-Week Default)

Week 1: Discovery and skeletons
- Confirm owners for all six lanes
- Create document stubs and shared templates
- Capture architecture baseline and operations inventory

Week 2: Drafting
- Complete first drafts for architecture, runbooks, onboarding
- Build release notes template and current release draft

Week 3: Validation and review
- Run onboarding fresh-install test
- Perform runbook dry runs
- Review stakeholder package and closeout report with leads

Week 4: Publish and handoff
- Incorporate review feedback
- Publish final artifact set in `docs/`
- Hold closeout readout and handoff ownership

## 7) Roles and Ownership Model
Use role-based assignments if names are not final yet.

- Closeout Lead: owns timeline, cross-lane tracking, final signoff
- Architecture Owner: owns architecture lane accuracy
- Operations Owner: owns runbooks and escalation paths
- Developer Experience Owner: owns onboarding lane
- Release Manager: owns release notes quality and cadence
- PM/Comms Owner: owns stakeholder package and closeout narrative

## 8) Dependencies and Risks
Top dependencies:
- Stable feature scope freeze date
- Access to current build/perf verification outputs
- Availability of reviewers across frontend/backend/ops

Top risks and mitigations:
- Risk: Docs drift during late code changes.
  - Mitigation: Enforce a docs update checkpoint for every merged closeout PR.
- Risk: Runbooks are untested.
  - Mitigation: Schedule dry runs with evidence capture before signoff.
- Risk: Stakeholder update is too technical.
  - Mitigation: PM review pass focused on plain-language clarity.

## 9) Working Cadence and Reporting
- Twice-weekly async status updates using this format: Progress, Risks, Decisions needed.
- Weekly 30-minute closeout sync focused on blockers and signoffs.
- End-of-week artifact demo with links to drafts and review asks.

## 10) Tracking Template
Use this mini tracker in your issue board or doc:

| Lane | Owner | Status | Draft Due | Review Due | Publish Due | Notes |
|---|---|---|---|---|---|---|
| Architecture Docs | TBD | Not started | YYYY-MM-DD | YYYY-MM-DD | YYYY-MM-DD | |
| Runbooks | TBD | Not started | YYYY-MM-DD | YYYY-MM-DD | YYYY-MM-DD | |
| Onboarding | TBD | Not started | YYYY-MM-DD | YYYY-MM-DD | YYYY-MM-DD | |
| Release Notes | TBD | Not started | YYYY-MM-DD | YYYY-MM-DD | YYYY-MM-DD | |
| Stakeholder Package | TBD | Not started | YYYY-MM-DD | YYYY-MM-DD | YYYY-MM-DD | |
| Final Closeout | TBD | Not started | YYYY-MM-DD | YYYY-MM-DD | YYYY-MM-DD | |

## 11) Immediate Next Actions
1. Assign owners for each lane.
2. Create all files in the suggested artifact structure.
3. Hold a 45-minute kickoff to confirm due dates and review cadence.
4. Start Week 1 discovery and baseline capture.
