# W2-08 — Local Certification and Phase 1 Release Gate

**Status:** Planned — requires W2-01 through W2-07 integrated
**Wave:** 2 final checkpoint
**Executor:** Terra master; independent verdict by Sol Medium

## Outcome

Demonstrate at one exact, clean checkpoint that all product coding and deployment preparation required before VPS access are complete. This is the Delivery Phase 1 gate, not a VPS deployment.

## Preconditions

- Every packet handoff and correction is integrated.
- Paired LiNKlibraries SHA(s) are frozen.
- No unresolved required suite is skipped.
- Local production-shaped dependencies are available.

## Certification run

1. Start from a fresh clone/worktree and clean service/data environment.
2. Install from pinned lockfiles and validate tool/runtime versions.
3. Run full CI-equivalent checks and build all deployable artifacts.
4. Apply all migrations from zero and seed only the approved first-test fixture/reference data.
5. Start the production-shaped local stack using the same service definitions intended for Phase 2.
6. Submit the canonical manual lead package through the normal intake port.
7. Observe the continuously running orchestrator claim and complete the full Program graph.
8. Verify working-content lineage/checksum/provenance, Payload draft promotion/read-back, separate private publication, and real `web-master` rendering.
9. Verify the private URL/authentication/noindex behavior and required route/content/visual/accessibility/link/security gates.
10. Verify one CRM-shaped completion record with exact artifact/content/library/evidence receipts.
11. Replay the same input and restart services at defined checkpoints to prove no duplicate logical outcome.
12. Exercise a controlled failure and recovery/dead-letter path.
13. Back up, destroy only the isolated test data environment, restore it, and prove the certified site/run/evidence is recoverable.
14. Shut down cleanly and confirm no unexpected external/live mutation occurred.

## Phase 1 definition of done

Phase 1 is complete only when:

- all roadmap requirements and packet acceptance gates are satisfied;
- the full pre-VPS Program executes locally using production composition and real local CMS/database dependencies;
- all required tests/builds/migrations/security/privacy/restore checks pass;
- deployable artifacts, configuration schema, runbooks, rollback, and Phase 2 packet are complete;
- no mock, legacy sync, direct raw-n8n, active `web-company`, or undocumented manual coding step remains on the production path;
- every claim is backed by evidence tied to exact source/artifact/library/schema revisions;
- the independent Sol Medium audit returns `PASS` at the same exact SHA;
- the worktree is clean.

Local success is pre-deployment evidence only. It does not prove VPS networking, credentials, DNS, TLS, persistent volumes, real CRM/LiNKautowork delivery, or live operational behavior.

## Release evidence bundle

- exact Git SHA(s), image/artifact digests, lockfile and schema versions
- complete command/result manifest and test counts
- Program graph and redacted run/evidence export
- content/library/CMS/deployment receipts
- screenshots and functional/quality reports
- configuration-name and secret-owner matrix
- backup/restore/rollback proof
- known limitations, all explicitly assigned to Phase 2 or later approved scope
- clean Git status

## Independent audit and correction loop

Freeze the candidate and dispatch the audit packet to a fresh Sol Medium agent. Any verdict other than `PASS` is not completion. Convert each finding to an atomic correction Issue, assign non-overlapping Luna High agents, integrate, rerun affected and full certification, then dispatch a fresh independent re-audit on the new SHA.

## Handoff

After PASS, report Phase 1 complete and request explicit authorization for Delivery Phase 2. Do not deploy, configure the VPS, create DNS records, activate domains, or run the live first-site test under Phase 1 authority.

