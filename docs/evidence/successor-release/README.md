# LiNKsites successor release — Issue 571

Authorization: Portfolio Successor Launch Authorization v1, approved at launch
on 2026-09-15 Asia/Taipei. The launch execution and server contracts supersede
historical packet-level approval, worker-routing and redundant review gates.
The exact final combined candidate still requires relevant source checks,
protected integration and live acceptance. No completion is claimed here.

## Reconciliation

Protected starting point: development
`4b2dbaf5c0ce34076e5d62f8703bbda197dd8ffb`, tree
`e29607c43146decdf81c2f132562745f6a911780`.

The eight engineering lanes recorded in
`../end-to-end-delivery/CHECKPOINT-LEDGER.json` were verified against original
commit/tree identities and equal replay patch IDs. Their existing consolidation
is reused through `c61c766db06e063086b817608a273f4dc535ec72`, including toolchain
and Alpine package pins. A1 work at `df53bbaf854a44ea651deb5af4f165aa9df4cccb`
is retained with candidate-validation corrections. Its historical proof is not
current release acceptance.

Predecessor Issue 570 audit is complete and frozen. Its five uncommitted files
remain untouched in its original worktree. This release reuses its exact A1
pins, candidate receipt shape and candidate inventory-digest correction.
The proposed relaxation of production governance is not included: production
still rejects failed qualification and missing required human review.
Candidate validation uses the actual catalogue and receipt bytes, with exact
catalogue pins; it does not substitute an empty catalogue or rewrite manifest
and receipt digests. Unknown receipt fields remain subject to closed validation.

PR 569 (`64f2cab2a94bed739c4704a8b6980278e2c58133`) is an unintegrated, failed
three-file repair, not the combined engineering release. Its useful corrections
are reimplemented here. Legacy orchestration tests retain exact historical
Library input `a7193d40152747db2a03e094fa263f324a971a0b`; A1 candidate tests use
separate input `998c02c29fae5acc429804d7e03dcc74df7e7a52`. Historical test input
is not current production selection authority.

## Release boundary

One five-workload release targets Server03 in deferred-template/manual mode.
A1 remains draft/non-selectable. Optional provider/account/model configuration
is post-DONE under the revised launch contract. Server03 acceptance must prove
empty-site/deferred-template operation, persistence/restart, isolated restore
and rollback. No live, provider-selectability or publication claim follows from
local candidate checks.

## Validation so far

- All eight recorded lane replay patch identities match their originals.
- 50 deployment/runtime/manifest/toolchain tests passed on local Node 26.5.0.
- 18 Python promotion trust/transition tests passed.
- Exact A1 materialization passed only with explicit draft_candidate_probe;
  ordinary production selection rejected it.
- Dependency installation, builds, containers, Supabase and final CI run only
  in GitHub Actions or on the assigned server under the host resource rule.

Final commit/tree, hosted CI, protected integration and live receipts remain
pending and must be recorded before acceptance.
