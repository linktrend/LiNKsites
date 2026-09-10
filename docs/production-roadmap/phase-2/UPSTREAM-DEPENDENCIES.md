# LiNKsites upstream dependencies and ownership

Status: planning inputs only; these identities are not runtime receipts

Every revision below was verified as a locally present Git commit with the
listed tree. The founder supplied them as accepted end-to-end planning inputs.
Acceptance of a plan does not prove that its service is deployed, configured,
selectable or compatible with LiNKsites. Runtime use needs the separate exact
handoff named in this document.

## Revision register

| Program | Accepted planning commit | Tree | LiNKsites relationship |
| --- | --- | --- | --- |
| LiNKbrain | `6a11a3e832de538d9907a746abadb895b3497314` | `250b6ede24afda9d2294a7a98c6300ecf6127533` | indirect shared identity/knowledge consumer; no source or live dependency for first private site |
| LiNKskills | `8f27a179c891c0fdcbe0ccc5c010f5de1b08b275` | `911626f69484df0f8b82a5872844492983242979` | indirect shared tool/provider program; no direct runtime dependency |
| LiNKautowork | `605c8281997e4793a826ce4c82b8dcbd6017ba26` | `c03f9c65879c0195416cc0699c1caa346d9bb63b` | direct signed automation gateway/event/receipt dependency for full operation |
| LiNKlibraries | `5188aaf1a9313a3746075cd6ccea0937c05f7a32` | `e389671f1dc19f6c1e17a2fd3520f4d9e3b1c139` | direct immutable website provider and Master Website Template owner |
| OpenClaw Prime | `c2d161883f796e568b8a13dc8face7997d23d413` | `d5caa266aa16af1ca0460f7368e340649aaec09f` | optional operator/assistant consumer through Platform contracts; no direct Sites mutation path |
| LiNKconsole | `7c106b05235d77004dbd6a8ee1c8fda3b089fcbc` | `87df3891b17511c0c0cf50af8461119310e8c881` | later operator visibility through its own admitted catalogue; not a deployment authority |
| LiNKportal | `13e65266f41113aca6da3fe9490374729d630281` | `c18e00ad2ebca0338afebc5118f59a09a26df063` | later Program registration/visibility; plan records LiNKsites as Server03 and makes no runtime claim |
| LiNKresearch | `51ed267545a90d07eb92f1da2bb7c13d47d8e54f` | `d4c28fa1be6654fc6abb76a79b33ce4b01c19922` | possible upstream approved research/facts source through contracts; manual approved facts remain valid initial intake |
| LiNKeditorial | `e00441491cb1108aa5e104ccf5bd2932057118f9` | `eb20777f96fe5bb313b2d7c5377003f9b81cb45e` | possible content brief/approval source; its plan expressly forbids direct Editorial-to-Sites mutation |
| LiNKchannel | `15202c44f01a37f9082994a77a3657b4eb1028ca` | `2541df785ee387c8095f37ad27833933da0ec19e` | later owned-property/analytics consumer; its plan waits for a future exact Sites handoff |
| LiNKclient | `de332c01cdc22076dcc97067e17cf8ef296b6e7f` | `d4e4a5224b075a7ca3ed8265f584b38fc1d76a19` | later client-facing consumer through explicit ports; no direct source dependency |
| LiNKdeveloper | `bea8a525bb3b4bff94e35a304b52c27075918fae` | `96ee8e3ce419c897c36bbdf11605d126c15121d9` | separate application factory; its plan preserves the existing LiNKsites deployment plan and does not own Sites |

Programs classified as indirect or later consumers are recorded so execution
agents do not invent connections or accidentally transfer authority. Their
plans are not prerequisites for the first private website or the single
Server03 installation.

## Direct dependency D1 — LiNKharness and the LiNKsites Profile

LiNKsites protected source already records accepted LiNKharness H-09 at commit
`7f8d5199f67057fb0a314c1d90e04ea6f64df0bf`, tree
`2ce580d54ffa7abbee77fe3710130b9e37c3c31f`. Execution must refresh this
identity and consume the exact Profile/Harness ports already present. It must
not rebuild a private ledger, retry controller, lock manager, evidence store or
generic executor in LiNKsites.

Required source handoff:

- exact protected LiNKharness release identity and compatibility range;
- schemas/fixtures for the Profile port and evidence/verdict envelope actually
  imported by LiNKsites;
- consumer conformance result against the final LiNKsites candidate.

## Direct dependency D2 — LiNKlibraries provider

LiNKlibraries owns reusable template bytes and semantic/design contracts.
LiNKsites owns customer data, Payload, assembly, adapter, rendering, hosting,
per-site adoption and operational proof.

Two milestones are intentionally separate:

1. **Initial operational website:** use `marketing-smb-v1` only after
   LiNKlibraries issues a current exact qualification/admission/selectability
   handoff. At the accepted planning revision it is `quarantined` and
   `selectable: false`; older local evidence cannot override that state.
2. **Full intended website system:** consume admitted
   `master-template-type-1` A1/A2/A3 and A/B/C/L releases and satisfy LS-FR-01
   through LS-FR-25. Current 1.0.0, 2.0.0-a1.1 and 2.0.0 bytes are planning and
   candidate inputs, not production-selectable proof.

Each consumed handoff must contain repository, protected commit/tree, entry and
version, lifecycle state, manifest/inventory/dependency-lock/artifact digests,
compatibility range, qualification/admission evidence, release receipt and
provider-owned reference-output fixtures. LiNKsites stores a sanitized,
versioned copy of only the schemas/fixtures/wire mappings it actually needs,
with provenance. It never copies provider implementation into its own
authority.

## Direct dependency D3 — LiNKplatform

The Platform plan and contracts were reviewed at local protected
`development` commit `67ba864667c8e8dd2b3baed00830c28e3035cea3`, tree
`863e6b1f40def2df99aeb748dd9be570d28b1fb2`. The Platform execution task
`01a0843c-0df9-74e2-907a-05c5f736d6ed` remains the sole owner of its source,
shared environments, migrations, credentials, claims, recovery and production
receipts. LiNKsites must not repair or mutate Platform.

Required handoff before affected LiNKsites source/live gates:

- exact protected Platform contracts version and sanitized claim fixtures;
- canonical actor/service registration and scoped credential reference for
  LiNKsites where required;
- migration-package intake contract plus stage/production application receipts
  for any Platform-owned prerequisite;
- exact live issuer/service endpoints and health evidence used by LiNKsites;
- explicit HOLD for every surface not yet operational.

The old Platform plan's execution model and historical environment statements
are not imported. Only current accepted interfaces and current task receipts
control.

## Direct dependency D4 — LiNKautowork

LiNKautowork owns its gateway, binding, n8n invocation, persistence,
JetStream, kill switch and automation receipts. LiNKsites owns the website
Program, its input, permission to act, outcome acceptance and durable outbox.

Required handoff for full live integration:

- exact gateway contract/version and private endpoint;
- Platform claim/audience/scopes and LiNKsites consumer registration;
- allowed event names, organisation/environment grants and signing key IDs by
  secret reference only;
- idempotency, timestamp/nonce, timeout, retry, acknowledgement and durable
  receipt schemas/fixtures;
- live health and one exact bound automation receipt that explicitly does not
  claim LiNKsites completion.

Until this handoff is operational, the initial private website uses the
existing manual/file adapter at the same canonical input/completion boundary.
That proves LiNKsites; it does not pretend LiNKautowork is live. The same
Server03 installation is later configured to the live gateway—there is no
second production installation.

## Publication rule for worker-visible inputs

Before any implementation worker depends on an upstream interface, the
coordinator must commit a sanitized input bundle under
`docs/end-to-end-delivery/upstreams/<program>/<version>/` on a governed
LiNKsites issue branch. Each bundle records source repository, commit, tree,
original path, content SHA-256, copied schema/fixture SHA-256, compatibility
range, owner and evidence level. Secrets, implementation source, customer data
and mutable local paths are prohibited.

The bundle is accepted only after:

1. the upstream owner confirms the exact source identity;
2. LiNKsites validates the copied bytes against their original digests;
3. the issue checkpoint is committed and pushed;
4. the exact branch commit/tree is used as the starting ref for dependent
   workers; and
5. a later upstream semantic change invalidates dependent evidence and creates
   a new bundle version instead of editing history.
