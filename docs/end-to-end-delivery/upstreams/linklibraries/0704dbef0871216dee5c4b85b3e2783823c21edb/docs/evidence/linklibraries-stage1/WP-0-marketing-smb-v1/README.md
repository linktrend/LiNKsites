# WP-0 `marketing-smb-v1` Library-local admission evidence

This is the bounded LSG0-03 implementation record for the reusable LiNKlibraries
entry `marketing-smb-v1`. The historical issue-branch starting identity is
commit `dacdf036312462c2373afc9cc4302e3231f7e6e9` / tree
`d3c5f1e2a3450b016084ae09666ac193297ac9fc`. The existing product candidate this
completion evidence binds is commit
`4f1aed3e4e6b630a6249eb33ab7e88e2bc3e978b` / tree
`b1966bfa8d6b333ad687474e63651bb9b3a8baac` on
`issue/432-qualify-admit-and-publish-selectable-marketing-s`.

The implementation scope is LiNKlibraries only. No LiNKsites, LiNKdeveloper,
VPS/cloud, credentials, deployment, settings, protected refs, or unrelated
worktrees were changed.

The entry is a schema-v2 `template` with Library-local `usable` / `selectable`
status. Selectability means the local structural, schema, provenance, asset,
secret-scan, and deterministic catalogue proofs passed. It is not proof of
LiNKsites renderer compatibility, Payload CMS compatibility, consumer
integration, provider live state, deployment, or production publication.

`receipt.json` records the immutable base SHA, SHA-256 entry-file and catalog
digests, and a truthfully labeled Git SHA-1 tree object. The pushed Git tip is
the external immutable binding because a commit cannot contain its own SHA.
Re-verify it with `git rev-parse` at the named issue branch before any later
consumer integration decision.

Unknown or unqualified entries remain non-selectable. If a required local
proof is missing, the entry must fail closed and stay non-selectable.

`completion-binding.json` records focused local tests against that candidate,
the installed managed-core completion manifest, and the exact HOLD for an
independent narrow review or durable lean waiver. No review, waiver, Phase PR,
hosted gate, provider mutation, or live use is claimed here.
