# Future consolidated PR body (do not open until after IDE Development v2.4 rollout)

Copy exactly when Review Packager opens the post–v2.4 draft PR into `development`.

---

## Title

Phase: pre-IDE-v2.4 accepted consolidation (CI #164 + master-template #180 + Item5 #183)

## Body

```markdown
## Summary

Consolidates three independently accepted LiNKsites surfaces onto current `development`, prepared before IDE Development v2.4 rollout and held for Packager after that rollout:

1. **CI upgrade (PR #164)** — accepted head `99716bb5506160b871268af37d4bb42e57508fa5` / tree `48853cf5822adb64a28fd65c277aa03a423bc70e`
2. **Master-template delivery (PR #180)** — resolved head `f758632f44661b49d63eb1c33ec213ada17e5150` / tree `34e562834ed943b83f68efc705029cb6637bef55`
3. **Item5 five-provider contracts (issue #183 / closed PR #184)** — accepted head `54f904ccea2e989c35b43ea3688518e9fbd10ea2` / tree `b1bd381b7b78c414bd062bde93a25e70947e6385`

Integration base: `origin/development` `d773991729db7a2f9cfbf0d26cd0e3b312efef77`.
Phase branch: `phase/pre-ide-v24-accepted-consolidation`.

Deterministic order: merge #164 → cherry-pick #180 commits after CI-equivalent tip → merge Item5. Conflict ledger: no conflicts. Path preservation verified for all three surfaces.

## Master-template readiness (explicit)

The Revision 2 `master-template-type-1` consumer/ownership path is **complete for draft / non-selectable governance**. The provider package remains **quarantined / non-selectable** and is **not product-ready**. This PR must not be treated as production template approval or selectable-library admission.

## Item5 / PR #184

PR #184 was closed without merge under the founder boundary; issue branch evidence is preserved. Accepted content is the later issue tip `54f904c…` (includes closed #184 commits plus gitleaks fixture hardening).

## Test plan

- [x] Focused CI contract tests (7) on phase candidate
- [x] Affected package tests/typecheck: types, factory-catalog, program-ledger, program-orchestrator
- [x] Diff checks (`git diff --check`, clean worktree)
- [ ] Hosted Fast on the exact Packager PR head (Packager)
- [ ] Full suite only after Packager labels / policy authorize exact-head Full (not part of pre-rollout prep)
- [ ] Bugbot only after Fast green on the Packager-opened draft PR head

## Out of scope / hard stops for this packaging

- No implementer self-merge
- No staging/main promotion from this PR
- No claim that the master template is selectable or product-ready
```
