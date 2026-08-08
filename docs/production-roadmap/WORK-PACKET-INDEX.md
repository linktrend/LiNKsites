# LiNKsites Phase 1 Work-Packet Index

**Status:** Draft — pending Principal approval.

Before any packet, read [`EXECUTION-PROTOCOL.md`](./EXECUTION-PROTOCOL.md), [`WAVE-MANIFEST.yaml`](./WAVE-MANIFEST.yaml), and the current [`EXECUTION-STATE.yaml`](./EXECUTION-STATE.yaml). Use the canonical [`templates/`](./templates/) for Issue, Proof, Review, Integration, and higher-level gate artifacts.

## Model and authority policy

- Master: current primary orchestrator; owns graph, integration, and evidence.
- Implementers: Codex Luna High or explicitly available Grok 4.5 High.
- Independent auditor: Codex Sol Medium after every integrated wave and after corrections.
- No implementer self-approves, merges protected branches, deploys, or mutates live systems.
- Every packet uses an isolated worktree/branch from the exact wave base SHA.

## Wave 1 — contracts and durable foundations

| Packet | Outcome | Dependencies | Safe parallel lane |
|---|---|---|---|
| [W1-01](./wave-1/W1-01-CANONICAL-CONTRACTS-AND-TERMINOLOGY.md) | Canonical scope, Phase terminology, versioned cross-Program contracts | None | First; establishes shared contracts |
| [W1-02](./wave-1/W1-02-LEDGER-PHASE-HIERARCHY-AND-GATES.md) | Program/Module/Phase/Issue hierarchy, durable gates/dependencies | W1-01 contract freeze | Ledger lane |
| [W1-03](./wave-1/W1-03-CONTINUOUS-INTAKE-AND-ORCHESTRATOR-FOUNDATION.md) | Continuous pull/claim/completion runtime foundation | W1-01 contract freeze | Runtime lane |
| [W1-04](./wave-1/W1-04-VERSIONED-WORKING-CONTENT-PLANE.md) | Supabase working-content model, persistence, RLS, receipts | W1-01 contract freeze | Data lane |
| [W1-05](./wave-1/W1-05-LINKLIBRARIES-CONSUMER-AND-MASTER-TEMPLATE-CONTRACT.md) | SHA-pinned Library consumer and substantive master-template entry contract | W1-01 contract freeze | Library/template lane; cross-repo |
| [W1-06](./wave-1/W1-06-WAVE-INTEGRATION-AND-LEGACY-BOUNDARY.md) | Integrate Wave 1, reconcile generated/shared surfaces, retire unsafe legacy entry points | W1-02 through W1-05 | Master/integration lane |

Wave 1 then uses the [independent audit packet](./audit/WAVE-AUDIT-PACKET.md). Wave 2 cannot begin until Wave 1 is `PASS`.

## Wave 2 — complete vertical slice and release readiness

| Packet | Outcome | Dependencies | Safe parallel lane |
|---|---|---|---|
| [W2-01](./wave-2/W2-01-TEMPLATE-ASSET-CONSUMPTION-AND-COPY-ADAPTATION.md) | Exact-SHA complete template-package consumption and lead-specific copy/text adaptation | Wave 1 PASS | Template/content-adaptation lane |
| [W2-02](./wave-2/W2-02-END-TO-END-PROGRAM-ORCHESTRATION.md) | Full first-site Issue graph and durable orchestration | W2-01, W2-03, W2-04 | Runtime lane after prerequisites |
| [W2-03](./wave-2/W2-03-PAYLOAD-PROMOTION-PUBLICATION-AND-CMS-PROOF.md) | Draft promotion, separate publication, real Payload proof | Wave 1 PASS | CMS/promotion lane |
| [W2-04](./wave-2/W2-04-MASTER-TEMPLATE-AND-PRIVATE-DEMO.md) | Production master template, real CMS, private/noindex preview | Wave 1 PASS | Frontend lane |
| [W2-05](./wave-2/W2-05-LINKAUTOWORK-AND-EXTERNAL-EVENT-BOUNDARY.md) | Governed LiNKautowork adapter/events; raw n8n boundary removed | Wave 1 PASS | Integration lane |
| [W2-06](./wave-2/W2-06-OUTCOMES-RECYCLING-AND-LINKSITES-ARCHITECT.md) | Sale/no-sale technical flows and Architect proposal path | W2-02, W2-05 | Lifecycle lane |
| [W2-07](./wave-2/W2-07-DEPLOYMENT-OPERATIONS-CI-AND-LEGACY-REMOVAL.md) | Buildable deploy bundle, ops readiness, CI, web-company removal | All Wave 2 product packets | Deployment/hardening lane |
| [W2-08](./wave-2/W2-08-LOCAL-CERTIFICATION-AND-PHASE-1-RELEASE-GATE.md) | One clean exact-SHA local certification and release evidence | W2-01 through W2-07 | Master/release lane |

Wave 2 and the Phase 1 release use the same independent audit packet. Phase 1 completes only on final `PASS`.

## Phase 2 — separately authorized operations

- [VPS deployment and one-website pilot packet](./phase-2/VPS-DEPLOYMENT-AND-PILOT-PACKET.md)

This packet is not executable under Phase 1 approval.
