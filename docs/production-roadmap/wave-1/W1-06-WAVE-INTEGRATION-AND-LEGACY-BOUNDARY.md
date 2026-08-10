# W1-06 — Wave 1 Integration and Legacy Boundary

**Status:** Planned — pending W1-02 through W1-05 completion
**Wave:** 1 integration checkpoint
**Executor:** Terra master with narrowly scoped Luna High correction agents when needed

## Outcome

Integrate the accepted Wave 1 lanes onto one exact checkpoint, prove they work together, and prevent retired architectures from remaining accidentally executable. This packet creates the only candidate SHA the independent Sol Medium auditor may evaluate.

## Preconditions

- W1-01 contracts were frozen and used by all lanes.
- Each lane reports exact base/result SHA, changed files, validation, blockers, and interface handoff.
- No lane is self-approved.

## Integration procedure

1. Confirm each branch started from the approved wave base or document/review every intervening commit.
2. Inspect diffs before integration; reject unrelated edits, generated noise, secrets, binary artifacts, or unapproved dependencies.
3. Integrate in dependency order: W1-01, ledger, working content, library consumer, orchestrator.
4. Resolve shared files centrally—workspace config, lockfile, exports, contracts, migrations, and active documentation.
5. Connect the orchestrator only to ports/fixtures appropriate to Wave 1. Do not fabricate Wave 2 success with mocks presented as production proof.
6. Reconcile database migrations in creation order; run a clean reset and migration validation.
7. Inventory legacy surfaces:
   - retired `lsites_core` mirror/sync scripts and references;
   - direct raw-n8n environment variables/calls;
   - `apps/web-company` paused duplicate;
   - mock template/content fallbacks;
   - empty Stage/Phase definitions.
8. Remove unsafe legacy entry points from active scripts/configuration or place them behind an unmistakable historical/archive boundary. Destructive code removal reserved for W2-07 must be tracked explicitly.
9. Run one Wave 1 fixture through manual intake -> durable claim -> Program graph -> fake executor evidence/gates -> completion sink, including restart and duplicate replay.
10. Create `execution/evidence/<wave-or-checkpoint>/` or the repository's approved equivalent containing machine-readable command results, fixture IDs, schema/contract versions, and exact SHA. Do not commit secrets or uncontrolled logs.

## Required validation

- clean install using the pinned lockfile
- root build/typecheck/lint/test commands that apply
- all package tests for types, ledger, Factory Catalog, and orchestrator
- clean Supabase migration/reset and RLS integration tests
- LiNKlibraries validation at its paired SHA
- fixture lifecycle including duplicate, restart, gate failure, and successful completion
- `git diff --check`, secret scan, and active-drift searches

Any skipped suite must have an owner, reason, and blocking disposition. “Environment unavailable” is not a PASS for a required local dependency.

## Wave 1 PASS gate

- One clean checkpoint contains compatible canonical contracts, Phase-based durable ledger, working-content store, SHA-pinned library consumption, and continuous-runtime foundation.
- All required validations pass at that exact SHA.
- Evidence distinguishes fakes/fixtures from live service proof.
- Known Wave 2 gaps are mapped to a packet and no unknown critical gap remains.
- Worktree is clean.

## Handoff to independent audit

Freeze the candidate SHA. Give the Sol Medium auditor the audit packet, roadmap, exact SHA(s), lane handoffs, validation evidence, and known limitations. Do not begin Wave 2 until the verdict is `PASS`; `PASS WITH CONDITIONS`, `HOLD`, or `FAIL` enters a Luna correction and fresh independent re-audit loop.

