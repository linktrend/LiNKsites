# LiNKsites Profile v2 planning validation

## Exact source reconciliation

This plan consumes all LS-FR-01 through LS-FR-25 requirements from the sealed
Master Website Template v2 handoff at LiNKlibraries commit
`f25b385c1e34d958834ce4b7e085ab454a956918`. The handoff remains provider /
consumer authority; this Profile plan makes the final Harness-versus-domain
decision and supplies LiNKsites packets.

The required LiNKsites execution baseline is 2.5.1 `main` commit
`e46ce0c657a7445bfb898ac208f6f5d889b550f2`, tree
`3e98a86abbdc753933e9c7238d9c29f47b03022e`. The documentation worktree was
created through agentsetup from the then-current `development` ref, which still
showed 2.5.0. The manifest intentionally binds the authoritative 2.5.1 baseline.
Before execution, the issue branch must be recreated/rebased through the
governed procedure once `development` contains that baseline; no execution may
silently use the older tree.

## Coordination with the Master plan

- LiNKlibraries MWT-01–07 may run in parallel with LiNKharness work.
- LiNKsites LS-01–04 may build against accepted exact contracts.
- LS-05/08 paired A1 proof waits for immutable `2.0.0-a1.1`.
- A2/A3 work waits for the Master plan's approved post-A1 amendment.
- LiNKharness conformance uses exact LiNKsites Profile receipts; universal
  defects return to LiNKharness and domain defects return here.
- Admission/selectability, main, publish and deploy remain genuine approvals.

No planned path writes LiNKlibraries. No Master asset/semantic contract is
assigned to Harness. No generic Ledger/retry/gate/evidence authority is assigned
to LiNKsites after cutover.

## Validation required at checkpoint

- JSON parse, canonical schema and semantic PLAN lifecycle validation.
- initial executable manifest: 1 packet / 3 Issues, stopping before the external
  Harness gate; full roadmap: 12 packets / 36 Issues.
- LS-FR-01–25 presence and packet coverage.
- packet path ownership, one migration writer and one composition-root writer.
- provider A1/A2/A3 external-gate and receipt identities.
- manifest baseline equals the authoritative 2.5.1 revision.
- `git diff --check`, documentation links and independent architecture review.

## Proof limit

This proves planning structure only. It is not provider candidate,
materialization, Payload migration, server HTML, browser, visual,
accessibility, performance, admission, hosted, deployment or production proof.

LS-01–11 require exact rebaselined manifest amendments at the Harness, A1,
A2/A3 and final conformance gates described above.

Official Cursor documentation confirms Auto Cost is SDK selector `auto-smart`
with `optimize_for=cost`, and identifies Composer 2.5 and Cursor Grok 4.6 as
Cursor Models. The current read-only shell has Cursor Agent
`2026.08.11-e8db854` but reports `Not logged in`; therefore exact live selector,
parameter, effective optimization-mode/model and non-Fast readback are unproved.
No agent was created and every Cursor dispatch remains HOLD.

`MODEL-ROUTING-AUTHORITY.json` binds 1/1 manifest packet and 3/3 Issues to
primary route, deterministic one-hop quality fallback, separate independent
reviewer and distinct Terra High checkpoint verifier. Its SHA-256 digest is
`sha256:fca37a8a69e5628853e51899466a683db615afe9b2876cc3bcaf92174e16c6c8`.
Any byte change invalidates affected PREPARED intents and idempotency identities.

## Final planning-candidate results

- canonical IDE 2.5.1 manifest and PLAN lifecycle validation: **PASS**;
- initial manifest boundary: **PASS**, 1 packet / 3 Issues, LS-00 only;
- full-roadmap structure: **PASS**, 12 packets / 36 Issues;
- LS-FR-01 through LS-FR-25 unique coverage: **PASS**, 25 / 25;
- cross-repository sequencing and Master Template coordination re-review:
  **ACCEPT**;
- independent Terra review of all three current planning candidates: **ACCEPT**,
  no P0–P3 planning defects;
- whitespace and documentation-specific credential-pattern checks: **PASS**;
- current implementation route binding: **PASS**, 1/1 packet and 3/3 Issues;
- live Cursor selector/mode/effective-model readiness: **HOLD**, current shell
  unauthenticated; agent creation/acceptance/readback: **NOT RUN**;
- repository-wide IDE secret scan: **HOLD**, because the existing fixture
  declaration is bound to the prior candidate tree (219 stale fixture
  declarations after staging this documentation-only tree); refresh must use
  the official IDE fixture procedure, outside this planning scope;
- provider, Harness compatibility and product/runtime behavior: **NOT RUN**,
  reserved for the gated execution packets.
