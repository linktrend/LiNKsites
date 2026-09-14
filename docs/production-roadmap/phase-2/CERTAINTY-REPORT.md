# LiNKsites planning readiness and certainty report

Status: correction candidate; substantive Deployment Advisor acceptance pending

Scope: planning completeness, current factual reliability and practicality of
the proposed end-to-end method. No implementation or live completion is
claimed.

## Direct answer to the three questions

### 1. Is the PRD/work-packet package detailed enough for agents to complete LiNKsites end to end?

Current answer: **not yet represented as 99% certain**.

The revision now covers the full product, not only a pilot: Profile v2 and all
LS-FR requirements, exact provider ownership, one initial private site, full
Master Website Template completion, Platform/Autowork integration, source
repair, immutable release, one Server03 installation, recovery and final
handoff. It defines atomic dependencies, literal lane ownership, acceptance,
evidence, stop/recovery rules, exact dispatcher lifecycle and maximum safe
parallelism.

The remaining planning check is independent substantive review by Deployment
Advisor 2 against the exact pushed commit/tree. This task will not call its own
package 99% complete or execution-ready before that review passes.

The first exact review correctly rejected commit
`4a3fd2304d9d837ad874914169e37f427370b572`: it found the wrong queue-lock name
and no executable owner for current dependency alerts. This revision uses the
persistent dispatcher lock transaction and adds LSSEC-01. The prior FAIL is not
relabelled; the superseding exact identity needs a new verdict.

### 2. Are the material factual statements forming the plan accurate?

Current answer: **99% confidence for the bounded current-state statements in
this revision; no 99% claim is made for future external state.**

The bounded statements were checked through current Git/GitHub identities,
local exact upstream commit/tree objects, source files, dispatcher API GETs,
queue-control readback and read-only Server03 evidence. The plan explicitly
classifies future endpoints, receipts, database content, provider lifecycle and
production behavior as execution-time inputs or unknowns.

Material corrections to the previous revision are:

- `marketing-smb-v1` is currently quarantined/non-selectable in the accepted
  LiNKlibraries planning revision, not currently approved for production;
- a truthful upstream admission is required before the agreed first private
  website can use it;
- Master Website Template v2 and LS-FR-01 through LS-FR-25 remain part of final
  LiNKsites DONE, not silently excluded as later unrelated work;
- the verified execution route is the Keychain-backed Cursor REST dispatcher,
  not Cursor desktop, CLI sign-in or presence of an SDK/key in another runtime;
- the current queue has no LiNKsites owner membership and needs one additive,
  reversible post-approval transition;
- that transition uses the persistent dispatcher `.dispatch.lock` across
  latest-state mutation, readback, capacity reconciliation and owned rollback;
- GitHub currently reports 33 open Dependabot alerts (13 high and 20 medium),
  now owned by an exclusive pre-release remediation/disposition packet;
- accepted upstream plans are planning inputs, not source/live/runtime proof;
- Platform remains owned by its active task and is consumed through exact
  handoffs, never repaired from LiNKsites; and
- exactly one Server03 installation is created; later accepted releases update
  that installation.

External state can change. LSG0-00 deliberately repeats cheap exact readbacks
after approval and invalidates affected packets on drift.

### 3. Can the specified method deliver the agreed definition of done end to end?

Current answer: **not yet represented as 99% certain**.

The technical route is available and the repository contains substantial
completed engineering, but three required outcomes are presently outside
LiNKsites source authority:

1. a current selectable legacy provider and later admitted Master Website
   Template releases from LiNKlibraries;
2. current Platform contracts/live receipts from the Platform-owned task; and
3. the live LiNKautowork endpoint/registration/grants/receipt handoff.

The package assigns exact contracts, owners, evidence and recovery behavior for
these dependencies and allows independent LiNKsites work to continue safely.
It does not pretend that planning can create missing upstream runtime proof.
End-to-end delivery reaches the requested confidence only when:

- Deployment Advisor 2 accepts this exact package as sufficient;
- each direct upstream owner confirms its required handoff is deliverable under
  its accepted plan and current authority; and
- the post-approval Gate 0 refresh confirms GitHub, Cursor, queue and Server03
  access without material drift.

These are evidence gates, not routine requests to the founder. The coordinator
actively consumes/reconciles the handoffs and continues all dependency-ready
work after approval.

## Evidence matrix

| Area | Current state | Confidence treatment |
| --- | --- | --- |
| LiNKsites protected source/ref identities | exact GitHub readback | 99% current snapshot; refresh at Gate 0 |
| Existing Profile v2/source engineering | protected source plus exact release evidence | working source, not live proof |
| Retained branch inventory | unique families identified | final file-level disposition is first execution packet |
| Cursor account/model/repository route | direct REST `check` passed | verified; no worker created |
| Queue authority | current JSON/lock/suspension read | exact additive transition specified, not performed |
| Dependency advisories | GitHub Dependabot API: 33 open, 13 high and 20 medium | LSSEC-01 remediates release blockers and evidentially dispositions the rest before Full/release |
| LiNKlibraries legacy provider | source exists; current catalogue quarantined/non-selectable | upstream work/evidence required; no local override |
| Master Website Template | planned/candidate source exists; current operational plan says non-selectable | full consumer requirement preserved; exact handoff required |
| Platform | current source/task inspected | solely upstream-owned; plan acceptance is not live readiness |
| LiNKautowork | accepted plan and Sites adapter source exist | initial manual boundary available; live handoff required for final DONE |
| Server03 capability | SSH/Docker/shared services/networks/databases observed | capable host; no LiNKsites installation exists |
| Production data/config/secrets | partial objects/mechanisms, final values absent/unknown | resolve just in time; backup/restore before mutation |
| One production installation | absent | planned work, exactly one |
| Real website/full live proof | absent | planned acceptance; cannot be pre-certified |

## What advisor acceptance must test

The advisor is asked to reject the package if any of these is missing or
contradictory:

- full intended product requirements or an explicit authorized supersession;
- preservation of existing work and the user dirty file;
- exact direct dependencies and worker-visible publication of their contracts;
- provider lifecycle truth and separation of initial/final milestones;
- protocol-valid manifest and atomic dependency graph;
- feasible literal lane scopes with no migration/root/shared-file collision;
- real Cursor/queue/Git branch admission and checkpoint route;
- continuous use of the exact persistent queue lock, latest-state preservation,
  owned rollback and capacity reconciliation;
- an executable owner and release threshold for every current dependency alert;
- one-source-promotion/five-image/one-installation delivery;
- backup/restore, least privilege, private routing and rollback;
- bounded, non-repetitive tests and exactly one independent source review
  (LSREV-01); or
- a path from current HOLDs to evidence without invented PASS.

## Approval boundary

This report does not ask the founder to approve execution. After a substantive
advisor PASS, the exact review identity and any required correction are recorded
in this package. Only then can this task report whether all three requested 99%
certainty thresholds were met and ask for the separate founder execution
decision.
