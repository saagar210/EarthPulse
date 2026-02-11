# Decisions

## 2026-02-10

1. **Keep existing settings contract shape and key/value persistence model.**
   - Rationale: avoids migration risk and preserves compatibility.
   - Alternative rejected: replacing settings with a typed table schema.

2. **Prioritize UX and correctness hardening over feature expansion.**
   - Rationale: user dissatisfaction likely from quality/process concerns, not missing broad functionality.

3. **Treat missing `glib-2.0` as environment blocker, not code blocker.**
   - Rationale: frontend validation remains green; Rust test command failure is reproducible host dependency issue.

4. **Do not close settings modal on failed persistence.**
   - Rationale: prevents silent data-loss UX and gives user direct remediation path.
   - Alternative rejected: optimistic close + toast later.

5. **Add timer-driven health panel updates instead of backend heartbeat spam.**
   - Rationale: keeps backend event volume unchanged and solves UI staleness locally.

6. **Do not introduce a new test framework in this continuation pass.**
   - Rationale: no existing frontend test harness in package scripts; adding one would be a larger tooling change than requested.

7. **Adopt conservative chunk splitting only (uPlot extraction).**
   - Rationale: avoids risky circular chunk dependencies seen with aggressive vendor partitioning.
