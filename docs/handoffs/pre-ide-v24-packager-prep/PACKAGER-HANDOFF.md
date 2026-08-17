# Packager handoff — after IDE Development v2.4 rollout

## Role boundary (this prep agent)

Done now:

- Resolved and recorded exact head/tree/base for PR #164, PR #180, and Item5 #183/#184
- Confirmed no newer unreviewed tip drift on those refs
- Created `phase/pre-ide-v24-accepted-consolidation` from `origin/development`
- Integrated only independently accepted commits in deterministic order
- Documented conflicts (none)
- Ran focused/fast tests + diff checks only (no Full)
- Pushed clean phase checkpoint with remote equality
- Prepared future PR body, evidence ledger, rollback, and this handoff

Explicitly **not** done (and must not be done by implementers):

- Open / update / reopen / close any PR
- Merge to `development`
- Promote to `staging` / `main`
- Deploy
- Request Bugbot
- Publish Review Ready for this phase tip unless Packager policy says otherwise after v2.4

## When Packager may proceed

1. IDE Development **v2.4** has been rolled out to LiNKsites per studio process.
2. Re-fetch and confirm the phase tip still equals the recorded remote tip (or re-integrate if `development` moved).
3. Open a **draft** PR into `development` from `phase/pre-ide-v24-accepted-consolidation` using `FUTURE-PR-BODY.md`.
4. Author must be Packager account `linktrend` per packager author policy.
5. Wait for Fast green on the exact PR head; then Bugbot per packager limits.
6. Full suite only under exact-head Full authorization policy — not assumed by this prep.

## Exact refs for Packager

| Item | Value |
| --- | --- |
| Repo | `linktrend/LiNKsites` |
| Phase branch | `phase/pre-ide-v24-accepted-consolidation` |
| Base at prep time | `d773991729db7a2f9cfbf0d26cd0e3b312efef77` |
| Related open PRs (do not auto-supersede without Principal) | #164, #180; closed #184 remains closed |
| Related issue | #183 |

## Product caveat (must appear on PR)

Draft / non-selectable master-template ownership is complete; the template is **not** product-ready and must remain non-selectable / quarantined until Library qualification says otherwise.

## Artifact index

- `SOURCE-PINS.md` — exact head/tree/base for all three surfaces
- `CONFLICT-LEDGER.md` — integration order and conflict outcomes
- `EVIDENCE-LEDGER.md` — focused/fast evidence
- `FUTURE-PR-BODY.md` — consolidated PR text for later
- `ROLLBACK.md` — abandon/withdraw contract
- `PACKAGER-HANDOFF.md` — this file
