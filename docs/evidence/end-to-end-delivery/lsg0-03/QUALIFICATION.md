# LSG0-03 qualification (Issue 536)

**Status: HOLD** (not PASS)

This packet inspected the exact supplied LiNKlibraries protected identity and classified the Phase 2 LSG0-03 required outputs. It did not treat owner source/protocol handoffs as proof of selectable admission. LiNKlibraries was not edited.

## Identities

| Role | Repository | Ref / checkout | Commit | Tree |
| --- | --- | --- | --- | --- |
| Writer start | linktrend/LiNKsites | issue/536-refresh-lsg0-03-protected-linklibraries-admissio (cloud writer `cursor/linksites-lsg0-03-admission-refresh-536-059d`) | `e93a9fe9bda5a81abd8af65f6b2f8e8da33feecd` | `569a93f0a90cbc375db2d560329ac2895a79885c` |
| Read-only source | linktrend/LiNKlibraries | `development` at supplied commit (detached; not later tip) | `dacdf036312462c2373afc9cc4302e3231f7e6e9` | `d3c5f1e2a3450b016084ae09666ac193297ac9fc` |

Cached LiNKlibraries checkout was already at later tip `de58ffb031e13a2c200058468834875ad4dd2d92` / tree `ddbe660a91a7a176f637e6d2a9d31897107bd951`. That tip was not used.

## Required outputs

| ID | Required output | Classification |
| --- | --- | --- |
| LSG0-03-R1 | Current exact **selectable** `marketing-smb-v1` with qualification/admission and immutable digests | **missing and needs work** |
| LSG0-03-R1-observation | Inspect lifecycle/selectability/admission/digests on the supplied tree | **completed** |
| LSG0-03-R2 | Exact **admitted** Master Website Template A1/A2/A3 and A/B/C/L handoff | **missing and needs work** |
| LSG0-03-R2-observation | Inspect current release, pointer, layouts/plans, digests, receipts | **completed** |
| LSG0-03-R2-candidate-bytes | 2.0.0 A1/A2/A3 packs and A/B/C/L plans as source input | **done but requires testing/fixing** |

## Protected facts

`marketing-smb-v1` on `entries/marketing-smb-v1/entry.json` and `indexes/catalog.json` is `state=quarantined`, `selectable=false`. Declared file SHA-256 values match the working tree. Historical WP-0 admission is `candidate_nonselectable_pending_governed_admission` and is not current admission.

Master Website Template entry `master-template-type-1` has **no** `current.json`. Governance for 1.0.0 is `draft` / `non_selectable` with qualification and admission `pending`. Catalogue and release receipts for `1.0.0`, `2.0.0`, and `2.0.0-a1.1` are all `draft` / `non_selectable` with `admission=not_performed`. Current candidate `2.0.0` has A1/A2/A3 layouts and A/B/C/L plans; git artifact tree `b599c0f0ee6bc2aad3484aa42ef1fd9e86a05758` matches the receipt. `docs/architecture/master-template/LINKSITES-HANDOFF.md` still says draft / non_selectable / no `current.json`. The final 2.0.0 addendum is an external-consumer-gate-pending candidate, not admission.

## Why HOLD

LSG0-03 PASS requires protected bytes and receipts that prove **both** providers selectable and admitted. This tree proves the opposite: quarantined legacy template and draft MWT candidate without a production pointer.

## Owner actions

1. LiNKlibraries: independently qualify and admit selectable `marketing-smb-v1` on a protected identity, or retire it in favor of an admitted replacement first-website provider.
2. LiNKlibraries: publish `current.json`, set selectable/admitted governance and receipts for the current MWT release covering A1/A2/A3 and A/B/C/L.
3. LiNKsites coordinator: refresh LSG0-03 against that new exact commit/tree. Do not mutate LiNKlibraries from this repo.

## Lean review

Founder-approved lean policy applies. No independent reviewer for this evidence refresh. Replacement proof: exact commit/tree, JSON validity, scoped path check, changed-path secret scan, `git diff --check`.
