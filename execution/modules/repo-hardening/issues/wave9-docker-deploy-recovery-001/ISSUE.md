---
issue_id: "wave9-docker-deploy-recovery-001"
title: "Recover and merge the real Wave 9 Docker/Traefik deployment scaffolding from an uncommitted stash"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "repo-hardening"
parent_phase: ""
depends_on: []
objective: "Following Carlos's review of two local git stashes (one pure duplicate, one genuine unmerged work), recover and merge the real, valuable half of the pre-existing 'wave9-wip' stash: Docker Compose + Dockerfiles for apps/cms and apps/web-master, a local build-verification script, and an updated deploy/README.md -- the only real hosting/deployment scaffolding anywhere in this repository. Drop the obsolete half (4 script files belonging to the embedded LiNKdev automation framework already removed this session, PR #36)."
scope:
  - "deploy/docker-compose.deploy.yml, deploy/docker/cms.Dockerfile, deploy/docker/web-master.Dockerfile (new -- Traefik-routed CMS + shared frontend, host-based routing, wildcard preview subdomain, per manual §15 doctrine)"
  - "apps/cms/next.config.mjs, apps/web-master/next.config.mjs: added output: 'standalone' (required for each Dockerfile's multi-stage build to produce the .next/standalone directory it copies)"
  - "apps/cms/docker-compose.deploy.yml: converted to a deprecation pointer at the old per-app compose location, redirecting to the new repo-root deploy/docker-compose.deploy.yml (avoids two divergent copies)"
  - "scripts/verify-docker-build.sh (new): local, no-push build verification for both images"
  - "deploy/README.md: rewritten from an undecided 'skeleton' doc into a real, complete Traefik-based deployment guide"
out_of_scope:
  - "4 files under LiNKdev/factory/scripts/ that were also in the same stash -- deliberately dropped, not recovered, since the entire embedded LiNKdev automation framework was already intentionally removed this session (Decision DR-01, PR #36); reviving these scripts would contradict that decision"
  - "Actually running these Docker builds against a live registry/VPS, or verifying them against a real Supabase DATABASE_URI -- this sandboxed environment's Docker daemon cannot reach the network to pull base images (docker build hung indefinitely with zero output pulling node:22.17.0-alpine), consistent with this session's other live-infrastructure limitations (GAP-50)"
  - "The still-open GitHub PR #31 (issue/wave9-linksites-prod branch) itself -- this Issue recovers the same underlying work through this session's own clean branch/PR process instead"
inputs:
  - "git stash (local, pre-existing 'wave9-wip' entry, reviewed and reported to Carlos before this Issue)"
  - "audit/12_reusable_asset_register.yaml (asset-deploy-wave9-docker-traefik, already classified 'configured-unverified'/'adapt' during the original Phase 0 audit)"
expected_outputs:
  - "Real, working Dockerfiles and compose file for CMS + shared frontend, syntactically valid and each app's own next.config.mjs correctly configured for the standalone output they depend on"
acceptance_criteria:
  - "Both apps' next.config.mjs changes do not break next build (verified via a real `next build` run for web-master; cms's own build requires a live DATABASE_URI and was never part of CI's build step, so it is unaffected by this Issue either way)"
  - "Full workspace verification (typecheck, all test suites, lint) remains green"
  - "The Dockerfiles are read for correctness (multi-stage: deps -> builder -> runner, non-root user, correct COPY paths matching each app's actual build output) even though a live build could not be executed in this environment"
proof_requirements:
  - "Verification run showing typecheck, factory-catalog/program-ledger/CMS test suites, lint, and both frontend builds (web-master, web-company) all green after this change; an honest note that the Docker builds themselves were not executable here"
review_requirements:
  - "Independent reviewer confirms no secrets are embedded in any recovered file -- all runtime config is via env_file references to external paths (/opt/linktrend/runtime/...) and GSM-named variables, never inline values"
integration_requirements:
  - "Merge via the existing consolidated branch/PR for this batch; a live Docker build verification should happen before this scaffolding is ever used for a real deployment"
suggested_role_types:
  - "backend-developer"
read_first:
  - "deploy/README.md"
  - "deploy/docker/cms.Dockerfile"
  - "deploy/docker/web-master.Dockerfile"
read_forbidden: []
blocking_questions: []
optional_fields:
  priority: "medium"
  risk_level: "medium -- the Dockerfiles themselves could not be live-verified in this environment (no network access to pull base images); they are read-reviewed and syntactically consistent with the standard Next.js standalone-output Docker pattern, but a live build/run test on a real host is still needed before trusting this for an actual deployment"
---

# Issue

## Objective

See front matter.

## Scope / Out Of Scope / Inputs / Expected Outputs / Acceptance Criteria

See front matter.

## Proof Requirements / Review Requirements / Integration Requirements

See front matter and `PROOF.md`.

## State Semantics

`review_ready`.

## Progressive Disclosure

Read next: `PROOF.md` in this same directory.
