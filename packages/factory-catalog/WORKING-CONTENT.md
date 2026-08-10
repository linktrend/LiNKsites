# Factory Catalog working-content plane

W1-04 has one active working-content model. Supabase stores a lead/site
`working_package_id` and append-only numbered versions in `lsites_sites`:

```text
org + lead + site + Program/run
              |
              v
working package -> version 1 -> version 2 -> ...
                         |
              working -> ready_for_gate -> accepted -> promoted
                         |                    |
                         +-> rejected         +-> W2-03 Payload draft receipt
```

Each version contains the structured page/section payload, asset SHA
references, the accepted `marketing-smb-v1` template/component contract,
canonical 40-character lowercase Git SHAs for LiNKlibraries references,
factual/generated-copy/media provenance, parent version, author/executor,
deterministic SHA-256 checksum, gate evidence, and promotion binding. Version
content and identity are guarded by a database trigger; promoted rows are
immutable and later lifecycle and receipt fields advance only through the
repository operations.

`WorkingContentRepository` is storage-driver agnostic. Its write path locks the
package cursor and requires an expected current version, so concurrent agents
cannot silently replace one another. Reads and promotion preparation recompute
the checksum. `preparePromotion()` locks the exact immutable version and binds
one idempotency key to it; a different key is rejected. `recordPromotionReceipt()`
is append-only and can safely return the same receipt on retry.

The exported `WorkingContentPromotionInput` is the W2-03 boundary. It carries
the exact organization, package/version, checksum, idempotency key, validated
content package, and gate evidence. This packet does not call Payload, publish
content, or schedule synchronization. The old `lsites_core` mirror and its
`sync_ingress`/`sync_jobs` behavior remain historical only and are not active
Factory Catalog package paths.

RLS grants the private tables only to `svc_linksites_runtime`, with
`platform.has_org_access(..., 'client_viewer')` on every operation. Browser and
public roles receive neither mutation grants nor working-content policies.
