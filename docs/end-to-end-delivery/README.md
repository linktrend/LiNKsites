# LiNKsites end-to-end delivery

Status: correction candidate for Deployment Advisor review; implementation is
not authorised

This is the stable entry point for the governed plan to finish LiNKsites and
operate it through exactly one production installation on Server03. The plan
preserves the completed pre-server engineering, closes the remaining source and
configuration gaps, installs the application once, proves one real private
website, and then completes the full Master Website Template and operational
integration scope without creating a second installation.

## Authoritative package

| Document | Purpose |
| --- | --- |
| [Product and delivery PRD](../production-roadmap/phase-2/END-TO-END-COMPLETION-PRD.md) | Full product outcome, definition of done, scope, architecture, quality budget and rollback |
| [Starting position](../production-roadmap/phase-2/STARTING-POSITION.md) | What works, what needs testing/configuration/repair, what is missing and what remains unknown |
| [Upstream dependencies](../production-roadmap/phase-2/UPSTREAM-DEPENDENCIES.md) | Exact accepted planning revisions, owned interfaces and evidence gates |
| [Atomic work packets](../production-roadmap/phase-2/ATOMIC-WORK-PACKETS.md) | Dependency-ordered work, ownership, acceptance, recovery and proof |
| [Execution route](../production-roadmap/phase-2/EXECUTION-ROUTE.md) | Verified Cursor REST route, queue transition, packet lifecycle and exact commands |
| [Implementation lanes](../production-roadmap/phase-2/IMPLEMENTATION-LANES.md) | Maximum safe parallelism, literal path ownership and integration owner |
| [Machine-readable lane plan](../production-roadmap/phase-2/LANE-PLAN.json) | Exact concurrent lane IDs and dispatcher path scopes |
| [OSS inventory](../production-roadmap/phase-2/OSS-INVENTORY.md) | Existing and proposed open-source runtime components and decision rules |
| [Protocol manifest](../production-roadmap/phase-2/EXECUTION-MANIFEST.json) | IDE Development 2.5.2-compatible machine-readable dependency graph |
| [Planning control manifest](../production-roadmap/phase-2/PLANNING-CONTROL-MANIFEST.json) | Exact planning identities and the non-approval boundary |
| [Readiness report](../production-roadmap/phase-2/CERTAINTY-REPORT.md) | Evidence-backed answers to the three 99% questions and unresolved uncertainty |

The existing [Profile v2 canonical PRD](../architecture/linksites-profile-v2/CANONICAL-PRD-ROADMAP.md),
[LiNKsites production PRD](../PRD.md), and
[technical PRD](../LINKSITES-TECHNICAL-PRD.md) remain product authorities. This
package consolidates their remaining delivery work; it does not reduce their
requirements to the first pilot.

The older
[`VPS-DEPLOYMENT-AND-PILOT-PACKET.md`](../production-roadmap/phase-2/VPS-DEPLOYMENT-AND-PILOT-PACKET.md)
is retained only as historical input. It is not a competing execution plan.

## Approval boundary

Issue 515 authorises planning documents, verification of planning facts, and a
pushed planning checkpoint. It does not authorise product implementation,
worker dispatch, paid Cursor jobs, queue-control changes, pull requests,
protected merges, image publication, Server03 changes, migration, promotion or
deployment.

The current package must first receive substantive Deployment Advisor
acceptance against its exact commit and tree. Even that acceptance does not
authorise execution. A later explicit founder approval bound to the accepted
package is the execution gate.
