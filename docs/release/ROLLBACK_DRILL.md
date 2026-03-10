# Rollback Drill

## Objective
Validate rollback readiness with a repeatable and timed procedure.

## Target SLA
- Detect issue: <= 10 minutes
- Decide rollback: <= 10 minutes
- Complete rollback: <= 20 minutes
- Total recovery SLA: <= 40 minutes

## Drill Steps
1. Start from latest release tag and deployment notes.
2. Simulate a production-blocking regression (functional or startup failure).
3. Trigger rollback by re-promoting previous stable tag.
4. Re-run smoke checks:
   - App startup
   - Settings save/load
   - Replay bar + historical explorer visibility
   - Source health panel rendering
5. Capture elapsed time for each stage.
6. Record findings and corrective actions.

## Required Evidence
1. Timestamped timeline of actions.
2. Rollback command/tag evidence.
3. Smoke-check outcomes.
4. Follow-up tasks with owners.

## Exit Criteria
1. Rollback completes within SLA.
2. No unresolved P0/P1 issues remain from drill.
3. Updated runbook reflects any discovered gaps.
