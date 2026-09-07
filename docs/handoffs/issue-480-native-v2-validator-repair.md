# Issue 480 successor handoff — native Revision 2 validator repair

This handoff requests a new independent Luna High review. It does not
authorize a Phase PR, merge, provider admission, deployment, VPS operation, or
staging/main promotion.

## Exact review identity

- Repository: `linktrend/LiNKsites`
- Issue: `#480`
- Branch: `issue/480-repair-server03-deployment-template-release-stat-validator`
- Review base commit: `205377db5e659a48a845c4630301178e2f220971`
- Review base tree: `8c714cfd87b0c116ffd64196a880915d11875de7`
- Immutable repair parent commit: `b49dadbee2f3cfa04033bf58640a5acfe4b1588e`
- Immutable repair parent tree: `2da3aac57d6e5574e60cbee07a1acdabe17612f7`

The final remote branch head and tree must be read back after this handoff and
checkpoint are pushed. Review is valid only when it compares that exact head to
the exact review base above.

## Repair scope

The deployment runtime now consumes the dependency-free canonical native
Revision 2 validator shared with the factory-catalog provider client. The
validator enforces closed catalogue governance, complete manifest and
materializer shape, exhaustive inventory, every dependency-lock entry and
closure (including circular-runtime-dependency rejection), receipt shape, and
cross-file identities. Verified-cache `catalogueSha256` is compared with the
SHA-256 of the mounted catalogue bytes before publishing eligibility is
returned. Deferred mode remains provider-independent and retains fail-closed
rendering, intake, and publishing boundaries.

## Verification

Passed on this worktree:

```text
node --test deploy/tests/deployment-manifest.test.mjs deploy/tests/runtime-contract.test.mjs deploy/tests/deployment-surface.test.mjs
  36/36 passed
pnpm --filter @linksites/factory-catalog exec vitest run
  367 passed, 4 skipped
pnpm --filter @linksites/factory-catalog typecheck
pnpm typecheck
  9/9 packages passed
pnpm lint
  0 errors; existing warnings only
node --check deploy/config/runtime-contract.mjs
node --check packages/factory-catalog/src/nativeRevision2Validator.js
git diff --check
```

Adversarial coverage includes malformed governance, incomplete manifest,
unknown and circular dependency closure, unsafe materializer network settings,
forged verified-cache catalogue digest, and stale mounted catalogue bytes.

The all-deployment glob also includes the unrelated pre-existing
`deploy/tests/iss33-config-cutover.test.mjs` failure about legacy configuration
names absent from `deploy/config/production.env.example`; that legacy-surface
failure is outside this repair and was not changed.

## Review boundary

Do not use providers or credentials, do not deploy, do not open or merge a PR,
and do not treat this checkpoint as admission or production proof. A fresh
independent review must issue the next verdict against the exact pushed commit,
tree, and base.
