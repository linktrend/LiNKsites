# LiNKsites open-source continuity rule

Status: planning/acceptance rule for Issue 540; not proof that any
component already meets the rule

Authority: this file. Owning packets remain the existing 30-packet set
plus the three delivery milestones. No 31st packet. No active fork.

## Denominator (unchanged)

- 30 atomic packets as named in `ATOMIC-WORK-PACKETS.md`
- 3 milestones: initial operational acceptance; full product completion;
  deterministic DONE / founder handoff (`LSFULL-03`)

This rule does not reopen work already proven compliant under those packets.
It adds explicit acceptance duties for every **external** open-source
dependency required to build, run, deploy or recover LiNKsites.

`LSACC-02` and `LSACC-03` are **not** members of the 30-packet set. Where
those names would apply, the duties are carried by `LSVAL-01` (licence,
SBOM and supply-chain suite on the exact candidate) and `LSFULL-03`
(live identity, restore and rollback proof), with `LSOPS-01` owning
rollback source.

## Rule

For every such dependency, all of the following must be true before that
dependency may be called complete for release or recovery:

1. **Upstream without vendoring.** LiNKsites consumes the upstream
   project as an external dependency. Source is not copied into this
   repository except for thin wrappers, configuration or generated lock
   metadata that the lockfile already records.
2. **LiNKtrend-controlled read-only archive.** A separate LiNKtrend-owned
   read-only archive or mirror holds the **exact** source tree, package
   artifact or container used. Local caches, CI caches, a lockfile,
   a Dockerfile digest pin, a registry tag, or “upstream is still up”
   do **not** satisfy this clause.
3. **Immutable identity.** Production selection uses an immutable version,
   commit and/or digest. Floating tags (`latest`, major-only Node, GitHub
   Action `@v4`, `pnpm@latest`, un-digested image names) are not production
   identities.
4. **Recorded facts.** Provenance, version, licence, upstream source
   location, artifact location, checksums (or lock integrity) and
   compatibility with the admitted LiNKsites identity are written and
   reviewed.
5. **Reviewed updates only.** Version movement is an explicit, reviewed
   packet action (`LSSEC-01` for npm/lock; `LSDEP-01` for images/base
   images; `LSART-01` for published service images). Silent latest-tag
   pulls are forbidden.
6. **Reproducible if upstream disappears.** Build, runtime, deploy and
   recovery can be repeated from the LiNKtrend archive plus this
   repository’s exact commit/tree. Upstream availability is not evidence.
7. **Tested rollback.** A named prior immutable identity can be selected
   and has a tested rollback procedure. Untested runbook text is not
   proof.
8. **No active fork.** An active LiNKtrend fork of an upstream project is
   prohibited unless the founder separately approves it for a confirmed
   unmet need. A read-only archive is not a fork.

## What does not prove continuity

Existing local `node_modules`, pnpm/npm stores, GitHub Actions caches,
mutable registry tags, an upstream URL that currently resolves, a
repository reference in a lockfile, a digest pin without an owned
archive, or an untested backup/rollback claim.

## Packet allocation

| Duty | Owning packet |
| --- | --- |
| npm/pnpm lock, licence, SBOM, advisory disposition, reviewed JS updates | LSSEC-01 |
| production Dockerfiles, Compose, base-image digest pins, no floating production tags | LSDEP-01 |
| five service images published by digest; registry readback; release SBOM/provenance | LSART-01 |
| commit-addressed release layout that can hold archived material | LSVPS-01 |
| encrypted backup of release metadata and proof of isolated restore | LSVPS-02 |
| start only digest-pinned images; recover by selecting a prior immutable release | LSVPS-04 |
| rollback/restore runbook source | LSOPS-01 |
| licence/SBOM/supply-chain validators on the exact candidate | LSVAL-01 (stands in for LSACC-02) |
| live identity, restore and rollback proof on Server03 | LSVPS-02/04 and LSFULL-03 (stands in for LSACC-03) |

Current component classifications and missing owner actions are in
`docs/evidence/end-to-end-delivery/oss-continuity/`. This documentation
packet does not vendor, mirror, download, fork or modify external
software.
