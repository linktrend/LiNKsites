# LiNKsites implementation lanes

Status: planned maximum safe parallelism after founder approval

The lane plan reduces elapsed time only where paths and interfaces are truly
independent. It does not turn account capacity into a target and does not allow
two agents to edit a shared file.

## Integration owner

LiNKsites owner task `01a088ee-0886-78f2-97af-1924d73ac079` is the sole
coordinator. Implementers commit and push their issue branches. The installed
Phase Packager/Coordinator assembles the Phase PR and the delivery controller
performs protected integration. No Cursor implementer opens a PR, merges,
promotes or deploys.

## Lane plan

The machine-readable candidate is `LANE-PLAN.json`, currently SHA-256
`608e332e0475037accf43ed37c7acb33af96f6513692ee5d20087dd1126c37a0`.
The final `lane_plan_sha256` is recalculated from its advisor-accepted exact
bytes before packet admission. Any change to a lane, dependency or path
produces a new hash and invalidates all unsubmitted packets derived from the
old plan.

| Lane | Packet family | Literal allowed paths | May run with | Must not overlap |
| --- | --- | --- | --- | --- |
| L-UPSTREAM | source-input publication | `docs/end-to-end-delivery/upstreams/` | no product writer depends on it until checkpointed; may run with read-only branch disposition | all product/runtime source |
| L-DATA | additive Payload/data compatibility | `apps/cms/src/collections/`, `apps/cms/src/globals/`, `apps/cms/src/migrations/`, `apps/cms/src/payload-types.ts`, `apps/cms/src/payload.config.ts`, `apps/cms/tests/contracts/`, `packages/factory-catalog/src/adoptionIdentities.ts`, `packages/factory-catalog/src/capabilityCredits.ts` | none; migration/generated-sensitive scope is repository-exclusive | every other writer |
| L-TRUST | protected transition trust | `.github/workflows/linktrend-development-to-staging.yml`, `.github/workflows/linktrend-staging-to-main.yml`, `.github/workflows/linktrend-review-packager.yml`, `.github/workflows/ci.yml`, `.github/linktrend-secret-scan-fixtures.json`, `docs/contracts/CI-SUITE.md`, `scripts/gitops/gate_receipt.py`, `scripts/gitops/promotion_receipt_gate.py`, `scripts/gitops/receipt_seal.py`, `scripts/tests/test_gate_receipt_transition.py`, `scripts/tests/test_promotion_transition_workflows.py`, `scripts/tests/test_promotion_receipt_adversarial.py` | L-FACTORY, L-RENDER, L-AUTOWORK after L-DATA | all other workflow/gitops paths |
| L-FACTORY | provider selection, adoption and deterministic assembly | `packages/factory-catalog/src/`, `packages/factory-catalog/tests/`, `packages/factory-catalog/WORKING-CONTENT.md` | L-TRUST, L-RENDER, L-AUTOWORK after L-DATA | the two data-owned factory files until L-DATA is accepted; root package/lock files |
| L-RENDER | Payload projection, React rendering, routes, SEO/AI, accessibility and forms | `apps/web-master/src/`, `apps/web-master/tests/`, `apps/web-master/template.config.json`, `scripts/profile-v2-quality/ls06/`, `scripts/profile-v2-quality/ls07/` | L-TRUST, L-FACTORY, L-AUTOWORK after L-DATA | root package/lock files; CMS migrations; deployment files |
| L-AUTOWORK | canonical intake/completion and live gateway adapter | `packages/autowork-boundary/src/`, `packages/autowork-boundary/tests/`, `apps/program-orchestrator/src/`, `apps/program-orchestrator/tests/`, `apps/cms/cron/`, `apps/cms/src/payload/utils/autowork.ts`, `apps/cms/tests/contracts/autowork-composition.spec.ts` | L-TRUST, L-FACTORY, L-RENDER after L-DATA | root package/lock files; deployment files |
| L-SECURITY | dependency alert remediation and disposition | `package.json`, `pnpm-lock.yaml`, `apps/cms/package.json`, `apps/web-master/package.json`, `archive/paused-applications/web-company/package.json` | none; runs after all four main source lanes | every product/deployment source path and every unlisted manifest |
| L-DEPLOY | release, runtime configuration and five images | `deploy/config/`, `deploy/docker/`, `deploy/docker-compose.deploy.yml`, `deploy/docker-compose.server03-foundation.yml`, `deploy/docker-compose.template-ready.yml`, `deploy/manifests/`, `deploy/scripts/entrypoint.mjs`, `deploy/scripts/generate-deployment-manifest.mjs`, `deploy/scripts/postdeploy-server03-foundation-smoke.sh`, `deploy/scripts/preflight-server03-foundation.sh`, `deploy/scripts/validate-runtime-config.mjs`, `deploy/tests/deployment-manifest.test.mjs`, `deploy/tests/deployment-surface.test.mjs`, `deploy/tests/runtime-contract.test.mjs`, `.github/workflows/publish-server03-images.yml`, `apps/cms/Dockerfile` | none; starts after L-SECURITY | trust workflow edits, operations files and all shared/root files |
| L-OPS | monitoring, backup, restore and runbook | `deploy/monitoring/`, `deploy/scripts/rehearse-local-restore.mjs`, `deploy/OPERATIONS.md` | none while L-DEPLOY writes; then may be repaired independently before consolidation | L-DEPLOY paths and all Server03 live paths |

Paths above are literal files or slash-terminated directory trees. Actual
dispatcher packets must not replace them with glob syntax or a broad root such
as `apps/`, `packages/`, `docs/`, `scripts/`, `deploy/` or `.github/`.

L-TRUST additionally owns `.github/workflows/ci.yml`,
`docs/contracts/CI-SUITE.md` and
`scripts/tests/test_promotion_receipt_adversarial.py` so the lane can
incorporate and complete retained Issue 511 work recorded at commit
`ee671c0242dd6d6f3832f8a7ed064de03dfc4b98` / tree
`be90a36770dc429101702dbe8cc0c40629fad6e7`. Those paths are admitted to finish
that work rather than discard or duplicate it, and they remain disjoint from
every other lane.

## Maximum concurrency by wave

| Point | Maximum writers | Reason |
| --- | --- | --- |
| upstream publication | 1 | produces the immutable interfaces needed by all dependent lanes |
| data compatibility/migrations | 1 | migration and generated-type scope is exclusive |
| main source repair | 4 | L-TRUST, L-FACTORY, L-RENDER and L-AUTOWORK have disjoint literal paths after interfaces and migrations freeze |
| dependency security | 1 | root lock and affected manifests are shared release inputs; all current alerts receive remediation or explicit evidence-backed disposition |
| deployment source | 1 | release/config/image contracts integrate all service identities and contain a workflow |
| operations source | 1 | shares deployment behavior and starts after L-DEPLOY |
| consolidation/Full/review/promotion/images | 1 | every result is identity-dependent on the preceding result |
| Server03 mutation | 1 privileged owner | exactly one production installation; shared services must not have concurrent Sites mutation |
| live acceptance | 1 product run; no second independent reviewer | LSREV-01 already covered the source Phase; live proof is deterministic identity/health/privacy/backup/restore/rollback/idempotency/completion-chain/controller-readback |

Four is the maximum safe simultaneous LiNKsites writer count, not an arbitrary
cap. More workers would either duplicate one of these cohesive responsibilities
or collide on shared contract, migration, lock, workflow, deployment or root
files. Fewer run when dependencies or account capacity are unavailable.

## Admission and conflict rules

1. Every concurrent packet uses the same owner and this exact lane-plan hash,
   a different `lane_id`, a different precreated issue branch, and only its
   listed literal paths.
2. A worker that discovers a necessary path outside its lane stops and returns
   a path-change request. The coordinator sequences the change or creates a new
   lane plan; the worker never edits opportunistically.
3. `package.json`, `pnpm-lock.yaml`, generated types, migrations, broad roots,
   shared manifests and GitHub workflow collections are exclusive even if two
   agents believe their edits are compatible.
4. Interfaces are frozen before parallel work. A semantic upstream change
   invalidates dependent source and browser evidence.
5. Integration conflicts return to the lane that owns the behavior. The
   coordinator does not use `prefer-incoming` or discard either side.
6. L-SECURITY owns only the five listed manifest/lock paths. If compatibility
   repair needs another manifest, it stops and the coordinator publishes a new
   non-overlapping lane-plan identity before that file is changed.
