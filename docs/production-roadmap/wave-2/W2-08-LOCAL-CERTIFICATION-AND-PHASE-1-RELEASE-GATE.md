# W2-08 — Pre-VPS Source Certification and Phase 1 Release Gate

**Status:** Source certification passed at `258aa36ff3cef4d6921c48e72c3d39cf74811146`; authoritative integration and separate Phase 2 VPS authority remain pending
**Wave:** 2 final checkpoint
**Executor:** Terra master; independent verdict by Sol Medium

## Outcome

Demonstrate at one exact, clean checkpoint that all product coding and deployment preparation required before VPS access are complete. This is the Delivery Phase 1 gate, not a VPS deployment. By Principal direction on 2026-08-10, runtime, recovery, and end-to-end proof are executed in Phase 2 on the VPS rather than locally.

## Preconditions

- Every packet handoff and correction is integrated.
- Paired LiNKlibraries SHA(s) are frozen.
- No unresolved source-level finding exists; runtime suites are explicitly assigned to Phase 2 rather than silently skipped.
- The Phase 2 VPS packet contains the runtime, recovery, and first-site proof gates.

## Pre-VPS certification run

1. Freeze the integrated candidate SHA and confirm its worktree is clean.
2. Confirm every W1/W2 implementation commit is reachable from that candidate and that the executable deployment bundle, configuration contract, migration process, operations manual, and Phase 2 packet are present.
3. Confirm the active build/deploy surface excludes `web-company`, retired mirror-sync, and direct raw-n8n paths.
4. Reconcile documentation, source, package scripts, Compose definitions, and configuration names so the Phase 2 operator has no undocumented coding task.
5. Dispatch a fresh independent source/evidence audit at the frozen SHA. A verdict other than `PASS` creates narrow correction work and a fresh audit.
6. Record the release handoff and request separate Phase 2 VPS authority. Do not execute the VPS operation under this packet.

## Phase 1 definition of done

Phase 1 is complete only when:

- all roadmap requirements and packet acceptance gates are satisfied;
- no product coding, deployment artifact, configuration contract, migration process, or operations/runbook requirement remains unprepared before VPS access;
- deployable artifacts, configuration schema, runbooks, rollback, and Phase 2 packet are complete;
- no mock, legacy sync, direct raw-n8n, active `web-company`, or undocumented manual coding step remains on the production path;
- every claim is backed by evidence tied to exact source/artifact/library/schema revisions;
- the independent source/evidence audit returns `PASS` at the same exact SHA;
- the worktree is clean.

Runtime proof is deliberately deferred to Phase 2. The VPS test must prove service startup, migrations, private access, noindex, recovery, backups, rollback, real CRM-shaped delivery, and live operational behavior; Phase 1 makes no claim about those unexecuted conditions.

## Release evidence bundle

- exact Git SHA(s), lockfile and schema versions, and the Phase 2 image-digest procedure
- source/evidence audit report and explicit list of Phase 2 runtime gates
- Program graph and redacted run/evidence export
- content/library/CMS/deployment receipts
- screenshots and functional/quality reports
- configuration-name and secret-owner matrix
- prepared backup/restore/rollback procedure (runtime proof belongs to Phase 2)
- known limitations, all explicitly assigned to Phase 2 or later approved scope
- clean Git status

## Independent audit and correction loop

Freeze the candidate and dispatch the audit packet to a fresh Sol Medium agent. Any verdict other than `PASS` is not completion. Convert each finding to an atomic correction Issue, assign non-overlapping Luna High agents, integrate, rerun affected and full certification, then dispatch a fresh independent re-audit on the new SHA.

## Handoff

After PASS, report Phase 1 complete and request explicit authorization for Delivery Phase 2. Do not deploy, configure the VPS, create DNS records, activate domains, or run the live first-site test under Phase 1 authority.
