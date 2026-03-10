# RC Promotion Policy

## Intent
Promote only release candidates that have passed objective quality and security gates.

## Promotion Rules
1. RC tag format must be `vX.Y.Z-rc.N`.
2. Stable tag format must be `vX.Y.Z`.
3. Stable tag must equal the RC base version (`vX.Y.Z-rc.N` -> `vX.Y.Z`).
4. Stable tag must point to the same commit as the promoted RC.
5. Promotion must run through `release-promote` workflow (no manual local retagging).

## Required Gates Before Promotion
1. `quality-foundation` green.
2. `security-quality` green.
3. `release-matrix` green for the RC tag.
4. Rollback drill executed and documented for current release cycle.

## Deferred Gate
Signing and notarization are handled in a separate credentialed release step.
