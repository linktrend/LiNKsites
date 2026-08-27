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

The Principal binds this Program to the single portfolio Cursor account and
receipt `sha256:23a0173dc24e67a86a87aacd7aee8b8ec93719371070a7e26fe7045b33267aeb`.
Auto Cost is unavailable, so all current work is Composer or Grok. The same
account preflight is not repeated unless the Principal changes that identity.

`MODEL-ROUTING-AUTHORITY.json` binds 1/1 manifest packet and 3/3 Issues to
primary route, deterministic one-hop quality fallback, separate independent
reviewer and distinct Terra High checkpoint verifier. Its SHA-256 digest is
`sha256:8ee161e801560811c74012375a30904223796b05e86c25bc9af1a68902b9c4c2`;
the successor manifest digest is
`sha256:80b046ca6e6236744a673e4a05505fc829701c047e6f6996b9142a06a268fc05`.
The portfolio identity gate source is LiNKharness commit
`3f8bb465dbbc69cccb213e4ad1cada8644d0320a`, path
`docs/architecture/linkharness-v1/PORTFOLIO-MODEL-ROUTING-IDENTITY-GATE.json`;
its digest is
`sha256:d7634cd1db0695570f044d7c8a65bbd4f4a7407ebd31c782cf8f896fff453345`.
Every PREPARED intent derived from the superseded authority is invalid.

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
- portfolio account binding and zero-Auto route classification: **PASS**;
  execution approval and dispatch/readback: **NOT RUN**;
- repository-wide IDE secret scan: **HOLD**, because the existing fixture
  declaration is bound to the prior candidate tree (219 stale fixture
  declarations after staging this documentation-only tree); refresh must use
  the official IDE fixture procedure, outside this planning scope;
- provider, Harness compatibility and product/runtime behavior: **NOT RUN**,
  reserved for the gated execution packets.
