# LiNKsites handoff (not this LiNKlibraries project)

**This LiNKlibraries project (MT-01–MT-06) is checkpointed** on:

- Branch `issue/132-master-template-skeleton-integration`
- SHA `d7997b6e3119c6efa7874973e4fe48bf88b0939b`
- GitHub issue **132**
- Identity `master-template-type-1` still `draft` / `non_selectable`, no
  `current.json`
- Combined `artifactTreeSha1` `8ac14545549491db348049808358d118e91abbe8`

LiNKsites agents must pin **this SHA**. Do **not** pin PR **#124** head
`9bdee5dd2ed34da1973dcf7e494def79bdc51776` and do **not** pin PR **#180**’s old
provider SHA `b2d2bbb0`. This SHA has **no dentist vertical**.

This is a **handoff list** for a later LiNKsites-owned stream. It is **not** a
Library start gate. LiNKsites PR **#180** does not block Library work.

Execute these items against the checkpointed MT-06 provider contract above. Do
not implement them in LiNKlibraries.

## Product sequence reminder

Master skeleton (LiNKlibraries now) → later **vertical** clone (e.g. dentists)
→ later **types** (Dental Type 1, Type 2) as new derived Library releases.
`master-template-type-1` is the extracted **master** candidate, not Dental
Type 1.

## Adapter and consumption (former MT-07)

- Consume exact reviewed provider schemas/fixtures; pin Library SHA
  `d7997b6e3119c6efa7874973e4fe48bf88b0939b` (issue 132), not #124 `9bdee5dd`
  and not #180 `b2d2bbb0`.
- Bounded candidate-probe path for pre-admission paired proof, separate from
  production materialization. Production continues to reject drafts.
- Align source-inventory shape with the provider contract (nested
  `template.sourceRepository` / `source.commitSha` / `source.treeSha`, not
  consumer top-level field assumptions).
- Add or remove `master-template-candidate-probe.ts` deliberately.
- Map semantic IDs to Payload projections and React implementation symbols.
- Replace all-sections-to-`hero` working-content promotion with a typed
  semantic projection; fail on an unmapped required component.
- Retain site/locale/publication/routes/runtime in LiNKsites.
- Derive types or fixtures from provider schemas rather than recoding enums by
  hand where practical.
- Store exact provider and effective specialization identities.
- Remove per-release code constants from selection policy while retaining exact
  receipt pins.
- Keep legacy proof paths explicitly separate and temporary.
- Prove stale `marketing-smb-v1` approved fixtures cannot override current
  Library quarantine/selectability state.
- Preserve every previously landed migration byte-for-byte. Generalize template
  identity only through a **new additive** migration with fresh-install and
  upgrade-path fixtures. Do not edit applied SQL.
- Atomically install a verified consumer-owned cache. Runtime startup must not
  require the provider checkout/intake mount.
- Distinct working-content components retain distinct semantic identities
  through Payload and rendering.
- Missing capability or semantic ID fails closed; no local provider fallback.

## Version migration and rollback (former MT-08)

- Fixture a compatible additive target and one breaking target.
- Unchanged-site pin when default changes.
- Plan/apply migration on copied fixture data; prove override replay and
  effective digest.
- Simulated failure retains the old active pin.
- Retirement blocks new default selection without deleting historic retrieval.
- Machine-readable receipts name exact before/after identities, checks,
  results, and rollback reference.

## GitOps (when LiNKsites work starts)

Own issue branch, `agentsetup`, focused tests, checkpoint push, no implementer
PR, no merge, no selectability/admission/activation change, no live deployment.

## Focused tests (later)

Adapter coverage and working-content → Payload → renderer projection; stale
legacy-authority rejection; atomic materialization/startup without provider
checkout; additive/breaking migration and rollback fixtures.
