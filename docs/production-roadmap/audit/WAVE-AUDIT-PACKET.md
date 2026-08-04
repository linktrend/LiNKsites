# Independent Wave Audit Packet

**Status:** Planned — reusable after each integrated wave and correction checkpoint
**Auditor:** fresh Codex Sol Medium agent
**Mode:** read-only
**Authority:** inspect and report only; never fix, merge, deploy, mutate live services, or approve its own prior work

## Audit objective

Determine whether one exact integrated checkpoint actually satisfies its assigned roadmap/work-packet gates and is safe to advance. The auditor must validate implementation and evidence, not accept summaries, mocks, committed claims, or prior agent verdicts as proof.

## Required audit input

The master supplies:

- audit scope: Wave 1, Wave 2/Phase 1 release, or correction re-audit
- repository path and exact candidate SHA
- paired LiNKlibraries path/SHA when in scope
- approved roadmap and relevant packets
- wave base SHA and integrated commit list
- implementer handoffs and claimed validation evidence
- known limitations/blockers
- expected local service prerequisites

If the candidate SHA or audit scope is ambiguous, return `HOLD`; do not choose a moving branch tip.

## Independence rules

- Use a clean isolated worktree at the exact candidate SHA.
- Confirm identity with `git rev-parse HEAD` and record initial/final `git status --short`.
- Do not trust untracked evidence from an implementer's worktree.
- Do not edit files. Test-created output must be outside the repository or cleaned using non-destructive, specifically scoped means.
- Do not use implementation agents as the source of truth. Resolve discrepancies against source, runtime behavior, contracts, migrations, and test results.
- Audit every required packet; sample only where the packet explicitly allows sampling.

## Audit method

### 1. Scope and provenance

- Verify ancestry from the approved wave base.
- Inspect the full diff and integrated commits.
- Identify unrelated files, hidden generated changes, dependency additions, secrets, or unreviewed cross-repo drift.
- Verify every claimed paired SHA and checksum is immutable and available.

### 2. Requirement traceability

Build a matrix with one row per packet acceptance criterion:

| Requirement | Code/config location | Test/evidence | Auditor reproduction | Verdict |
|---|---|---|---|---|

Use `PASS`, `FAIL`, `NOT PROVEN`, or `OUT OF SCOPE` per row. “Implemented” without reproducible evidence is `NOT PROVEN`.

### 3. Static architecture audit

Inspect active composition roots, imports, schemas, migrations, configuration, scripts, CI, and deployment manifests. Specifically probe:

- Program → Module → Phase → Issue → Executor → Run consistency
- continuously pulling intake semantics
- LiNKreach versus LiNKsites authority
- Payload/Supabase content-authority boundary
- SHA-pinned LiNKlibraries consumption and substantive assets
- LiNKautowork boundary with no raw-n8n coupling
- no active Stripe/Odoo dependency
- production wiring versus test-only construction
- no critical mock/fallback or legacy mirror path
- no active `web-company` by Phase 1 release

### 4. Reproduce validation

Run the packet-prescribed commands from a clean install/environment. Include root and package tests, builds, migrations, real local integration/E2E, container checks, secret/configuration checks, and evidence validation as applicable. Record exact commands, exit codes, counts, skipped tests, duration, and environment/tool versions.

### 5. Adversarial probes

Do not rely only on happy-path tests. At minimum test relevant cases:

- duplicate lead/event/promotion/publication
- competing claims and expired lease
- crash/restart around each material side effect
- missing/tampered evidence or checksum
- blocked dependency/gate bypass
- cross-`org_id` or cross-site access
- anonymous draft/private-content access
- unknown hostname and preview privacy/noindex
- stale/incompatible LiNKlibraries reference
- invalid/replayed signed event
- secret leakage into logs/client/evidence
- required service unavailable at startup/runtime
- backup/restore/rollback for the Phase 1 release audit

### 6. Evidence integrity

Ensure receipts identify exact subject revision, producer/executor version, checksum/SHA, gate, timestamp, and correlation. Confirm evidence can be linked end-to-end and that it was produced by the audited run rather than copied from an older checkpoint.

## Severity and verdict

- **Critical:** security/data loss/unauthorized publication or the claimed Program path is absent/fake.
- **High:** a required acceptance gate fails, production wiring is absent, a side effect is unsafe, or recovery/isolation is not proven.
- **Medium:** material operational or maintainability debt within the approved definition of done.
- **Low:** bounded non-blocking defect or documentation mismatch.

Return exactly one overall verdict, matching the LiNKdeveloper production-readiness precedent:

- `PASS` — all required gates pass; no open Critical/High; no unapproved required evidence gap.
- `HOLD` — code/evidence corrections are required. Any Critical, High, failed mandatory test, or unproven required gate causes HOLD.

A genuinely unavailable prerequisite is recorded in `blocked_by` and still produces `HOLD`; it does not create a third quasi-verdict.

## Required report format

1. **Verdict and exact SHA(s)**
2. **Plain-English founder summary**
3. **Findings**, highest severity first, each containing:
   - stable finding ID
   - severity
   - exact file/line or runtime boundary
   - requirement violated
   - reproducible evidence/command
   - observed versus required behavior
   - narrowly bounded correction acceptance criteria
4. **Requirement traceability matrix**
5. **Commands and validation results**
6. **Skipped/unavailable evidence**
7. **Initial/final Git status**
8. **Safe next action**

The report must also end with the exact `WP_VERDICT` machine block defined in [`../EXECUTION-PROTOCOL.md`](../EXECUTION-PROTOCOL.md). Full SHAs mean all 40 hexadecimal characters; abbreviated SHAs are invalid proof.

Do not redesign or recommend unrelated improvements.

## Correction and re-audit loop

For `HOLD`, the master converts each finding into one or more dependency-ordered atomic correction Issues. Luna High agents receive only the relevant finding, packet context, exact failed SHA, owned paths, tests, and acceptance criteria. After integration, the master runs affected plus full required validation and freezes a new SHA. A fresh Sol Medium audit must assess the entire corrected wave, not merely read the fix diff. Repeat until `PASS`.

For a `HOLD` caused by an external prerequisite, the master may resolve only that prerequisite within existing authority. If doing so needs credentials, infrastructure mutation, scope expansion, or Principal choice, stop and request authorization.
