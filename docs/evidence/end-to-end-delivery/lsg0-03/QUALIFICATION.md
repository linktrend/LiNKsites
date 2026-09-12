# LSG0-03 qualification (Issue 538)

**Status: HOLD** (not PASS)

This packet re-qualified LSG0-03 against the newly advanced protected LiNKlibraries `development` identity. It inspected only facts that could have changed because that identity moved from `dacdf036312462c2373afc9cc4302e3231f7e6e9` to `96422a39979f6e1e4c068e871051ae45423a5967`. Source bytes, draft or prerelease artifacts, tests, and owner statements were not treated as admitted selectable production providers. LiNKlibraries was not edited.

## Identities

| Role | Repository | Ref / checkout | Commit | Tree |
| --- | --- | --- | --- | --- |
| Writer start | linktrend/LiNKsites | issue/538-refresh-lsg0-03-against-current-protected-linkli | `7a88e6be88202fffe5a7f01526fadb517e2caeeb` | `994f57c50f6ae94157cc5cd3b88ba5f0c6e637ea` |
| Read-only source (this refresh) | linktrend/LiNKlibraries | `development` at supplied commit (detached; not substituted) | `96422a39979f6e1e4c068e871051ae45423a5967` | `384b428eb35ffa21c6eb1fdc1af90997379a99fb` |
| Superseded prior LSG0-03 pin (Issue 536) | linktrend/LiNKlibraries | `development` at previous supplied commit | `dacdf036312462c2373afc9cc4302e3231f7e6e9` | `d3c5f1e2a3450b016084ae09666ac193297ac9fc` |

Cached LiNKsites checkout was already at the supplied Issue 538 commit/tree on `cursor/linksites-lsg0-03-admission-refresh-538-85ea`. Cached LiNKlibraries checkout was already at the supplied commit/tree. Fetched `origin/development` matched the supplied identity; the bound branch tip was not substituted.

## What changed upstream

`git log` / `git diff` from `dacdf036` to `96422a3` touches only lean-review waiver / packager / completion-gate GitOps files (PRs #434 and #436). No `marketing-smb-v1`, Master Website Template registry, catalogue, receipt, layout, plan, or handoff path changed. Re-hashed provider artifacts on `96422a3` match the Issue 536 SHA-256 and git tree values.

## Required outputs

| ID | Required output | Classification |
| --- | --- | --- |
| LSG0-03-R1 | Current exact **selectable** `marketing-smb-v1` with qualification/admission and immutable digests | **missing and needs work** |
| LSG0-03-R1-observation | Inspect lifecycle/selectability/admission/digests on the supplied tree | **completed** |
| LSG0-03-R2 | Exact **admitted** Master Website Template A1/A2/A3 and A/B/C/L handoff | **missing and needs work** |
| LSG0-03-R2-observation | Inspect current release, pointer, layouts/plans, digests, receipts | **completed** |
| LSG0-03-R2-candidate-bytes | 2.0.0 A1/A2/A3 packs and A/B/C/L plans as source input | **done but requires testing/fixing** |

## Protected facts (unchanged provider bytes)

`marketing-smb-v1` on `entries/marketing-smb-v1/entry.json` and `indexes/catalog.json` is `state=quarantined`, `selectable=false`. Declared file SHA-256 values match the working tree (0 mismatches). Historical WP-0 admission is `candidate_nonselectable_pending_governed_admission` and is not current admission.

Master Website Template entry `master-template-type-1` has **no** `current.json`. Governance for 1.0.0 is `draft` / `non_selectable` with qualification and admission `pending`. Catalogue and release receipts for `1.0.0`, `2.0.0`, and `2.0.0-a1.1` are all `draft` / `non_selectable` with `admission=not_performed`. Current candidate `2.0.0` has A1/A2/A3 layouts and A/B/C/L plans; git artifact tree `b599c0f0ee6bc2aad3484aa42ef1fd9e86a05758` matches the receipt. `docs/architecture/master-template/LINKSITES-HANDOFF.md` still says draft / non_selectable / no `current.json`. The final 2.0.0 addendum is an external-consumer-gate-pending candidate, not admission.

## Why HOLD

LSG0-03 PASS requires protected bytes and receipts that prove **both** providers selectable and admitted. This tree still proves the opposite: quarantined legacy template and draft MWT candidate without a production pointer. GitOps waiver work on LiNKlibraries does not admit providers.

## Owner actions

1. LiNKlibraries: independently qualify and admit selectable `marketing-smb-v1` on a protected identity, or retire it in favor of an admitted replacement first-website provider.
2. LiNKlibraries: publish `current.json`, set selectable/admitted governance and receipts for the current MWT release covering A1/A2/A3 and A/B/C/L.
3. LiNKsites coordinator: refresh LSG0-03 against that new exact commit/tree. Do not mutate LiNKlibraries from this repo.

## Lean review

Founder-approved lean policy applies. No independent reviewer for this evidence-only refresh. Replacement proof: exact commit/tree, JSON validity, scoped path check, changed-path secret scan, `git diff --check`.
