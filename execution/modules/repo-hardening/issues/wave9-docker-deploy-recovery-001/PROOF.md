---
proof_id: "proof-wave9-docker-deploy-recovery-001"
subject_type: "issue"
subject_id: "wave9-docker-deploy-recovery-001"
status: "draft"
criteria_evidence:
  - criterion: "next.config.mjs changes do not break next build"
    evidence: "pnpm --filter @linksites/web-master run build succeeded with output: 'standalone' added, and produced a real apps/web-master/.next/standalone directory (verified via ls). apps/cms's build requires a live DATABASE_URI regardless of this change and was never part of CI's build step (CI only builds web-master and web-company)."
  - criterion: "Full workspace verification remains green"
    evidence: "typecheck (6 packages), factory-catalog (230 tests), program-ledger (44 tests), CMS integration tests (18 tests), lint, web-master build, web-company build -- all green"
  - criterion: "Dockerfiles read for correctness"
    evidence: "Both Dockerfiles follow the standard 3-stage (deps/builder/runner) Next.js standalone-output Docker pattern: correct COPY paths matching each app's actual .next/standalone and .next/static output locations, non-root user (uid/gid 1001), correct EXPOSE/PORT/HOSTNAME for a containerized Next.js server."
artifacts:
  - "deploy/docker-compose.deploy.yml"
  - "deploy/docker/cms.Dockerfile"
  - "deploy/docker/web-master.Dockerfile"
  - "deploy/README.md"
  - "apps/cms/docker-compose.deploy.yml (converted to a deprecation pointer)"
  - "apps/cms/next.config.mjs, apps/web-master/next.config.mjs (output: 'standalone' added)"
  - "scripts/verify-docker-build.sh"
verification_summary:
  - "Full CI-equivalent gate green EXCEPT a live Docker build, which could not be executed: `docker build` for web-master.Dockerfile hung indefinitely with zero output while attempting to pull the node:22.17.0-alpine base image -- this sandboxed environment's Docker daemon has no working network path to a registry, the same class of limitation as this session's other live-infrastructure gaps (GAP-50)."
optional_fields:
  commands_run:
    - "pnpm install"
    - "pnpm run typecheck (workspace-wide)"
    - "pnpm --filter @linksites/web-master run build"
    - "pnpm --filter @linksites/cms run build (confirmed pre-existing, unrelated failure: requires live DATABASE_URI, not a regression from this change)"
    - "pnpm --filter @linksites/factory-catalog run test"
    - "pnpm --filter @linksites/program-ledger run test"
    - "pnpm --filter @linksites/cms run test:int"
    - "pnpm exec turbo run lint --filter=@linksites/cms --filter=@linksites/web-master"
    - "pnpm --filter @linksites/web-company run build"
    - "docker build -f deploy/docker/web-master.Dockerfile ... (attempted, hung on base-image pull, killed after ~6 minutes with zero output)"
  open_gaps:
    - "Neither Dockerfile has been built or run successfully anywhere -- this environment cannot reach a container registry. A real build/run verification on a real host (or any environment with network access) is required before this scaffolding is trusted for an actual deployment."
    - "deploy/README.md references apps/cms/deploy/prod/.env.example and a render-runtime-env-from-gsm.sh script -- neither of these were part of the recovered stash content and their existence/correctness was not verified in this Issue."
    - "The 4 LiNKdev/factory/scripts/*.mjs files from the same original stash were deliberately NOT recovered (see ISSUE.md out_of_scope) -- they remain only in the dropped stash history (git reflog) if ever needed for reference, though reviving them would contradict Decision DR-01."
  notes:
    - "This Issue exists specifically because Carlos asked for the two local stashes to be investigated and reported on, then explicitly approved executing the recommendation: discard the pure-duplicate stash, recover only the real, unmerged half of the other."
---

# Proof

## Subject

`wave9-docker-deploy-recovery-001` -- recovering real Docker/Traefik deployment scaffolding from an uncommitted stash.

## Criteria To Evidence Map / Artifacts / Verification Summary

See front matter.

## Failures Or Gaps

See front matter `open_gaps`. Most importantly: the Docker builds themselves are unverified in this environment. This is disclosed prominently, not glossed over.

## Gate Guidance

Non-vacuous: this Proof explicitly does NOT claim the Docker images build or run -- it claims only what was actually checked (config correctness by reading, and that the Next.js `standalone` output changes don't break the existing, already-verified build pipeline).
