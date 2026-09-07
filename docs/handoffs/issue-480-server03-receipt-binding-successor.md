# Issue 480 successor handoff — Server03 deferred runtime and native Revision 2 admission

This handoff requests fresh independent rereview. It does not authorize a
Phase PR, merge, VPS operation, provider admission, staging/main promotion, or
production release.

## Exact identity

- Repository: `linktrend/LiNKsites`
- Successor branch: `issue/480-repair-server03-deployment-template-release-stat-successor`
- Exact remote review base commit: `205377db5e659a48a845c4630301178e2f220971`
- Exact remote review base tree: `8c714cfd87b0c116ffd64196a880915d11875de7`
- Implementation checkpoint pushed before this handoff update: `de5d90c467f77bd873cae6a2edbf7b24923b52b3`
- Implementation checkpoint tree: `3d7084b29ef4eaebde8d0263de72bf69d54d6a41`

The implementation checkpoint is a fresh successor from the requested remote
candidate. The final branch head and tree must be read back after this handoff
document is committed and pushed; completion evidence is valid only when it
binds that exact remote branch head and tree.

## Repaired boundaries

1. Deferred template state is provider-independent. Server03 base Compose,
   runtime configuration, preflight, foundation preflight, and health smoke do
   not require provider root/checkout/receipt/artifact mounts. The ready-only
   Compose overlay adds those mounts and environment values only after native
   Revision 2 admission.
2. Deferred production keeps infrastructure and service health available while
   fail-closing template-dependent rendering, publishing, orchestrator intake,
   and site-pilot work. Disposable local compose proof remains explicitly
   exempt through its existing proof flags.
3. Ready admission now verifies the committed catalogue, exactly one selected
   entry/version, admitted/selectable/compatible status, release manifest,
   exhaustive artifact inventory, dependency lock, artifact bytes, provider
   commit/tree, receipt, and all cross-file identities. Manifest publishing
   eligibility is set only after that complete admission succeeds.
4. Fixtures now include native catalogue and artifact-inventory files and
   adversarial tests cover non-selectable records, missing selected records,
   and missing inventory, in addition to existing receipt, checkout, and lock
   drift cases.

## Verification performed

Passed on the implementation checkpoint:

```text
node --test deploy/tests/deployment-manifest.test.mjs deploy/tests/runtime-contract.test.mjs deploy/tests/deployment-surface.test.mjs
  34/34 passed
pnpm --filter @linksites/factory-catalog exec vitest run
  367 passed, 4 skipped
GITHUB_HEAD_REF=phase/480-independent-review-repair pnpm --filter @linksites/program-orchestrator test
  74/74 passed
pnpm --filter @linksites/web-master test
  72/72 passed
DATABASE_URI=postgresql://127.0.0.1:5432/linksites_test pnpm --filter @linksites/cms test:int
  91 passed, 1 skipped
pnpm typecheck
  9/9 packages passed
pnpm lint
  0 errors; existing warnings only
node --check deploy/config/runtime-contract.mjs
node --check deploy/scripts/generate-deployment-manifest.mjs
bash -n deploy/scripts/preflight.sh deploy/scripts/preflight-server03-foundation.sh deploy/scripts/postdeploy-smoke.sh
git diff --check
```

The unscoped orchestrator package command also ran its 74 tests but its
environment-dependent protected-development scope assertion saw the managed
`.agents/skills/model-routing/SKILL.md` path; the intended phase-scoped run
passed the same complete suite 74/74. No VPS, live provider, credential,
deployment, Phase PR, or merge claim is made.

## Review request

Review the exact remote successor branch against the exact base commit/tree
above. Confirm the final completion evidence's branch, commit, tree, scoped
diff, focused tests, and manifest evidence all match the final remote head.
