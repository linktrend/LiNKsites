# LiNKsites Program Manual

## Section 12 — Supabase Working Layer, Payload Draft/Published Layers, and Content Promotion

**Document set:** LiNKsites Program Manual  
**Section:** 12 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, LiNKsites product and engineering agents, Supabase and PostgreSQL implementers, Payload implementers, frontend agents, data architects, repository auditors, security and QA agents, operators, and future human collaborators  

---

## 1. Purpose of this section

This section defines the trusted content path from agent and automation work to a public LiNKsites website.

It reconciles three distinct layers:

1. **Supabase working layer** — where research transformations, candidate copy, candidate media, site specifications, executor results, validation evidence, and promotion requests are created and managed.
2. **Payload draft layer** — where validated website content is represented in the actual CMS schema and rendered in controlled previews without changing the live website.
3. **Payload published layer** — the authoritative source of live website content consumed by production frontends.

The architecture prevents agents, scripts, and scrapers from writing directly into live CMS content. It also avoids maintaining two competing live content databases.

## 2. Direct answers to the central architecture questions

### 2.1 Does Payload require a PostgreSQL database?

Yes. Payload is the CMS application, not a database server. Its officially supported PostgreSQL adapter connects to a PostgreSQL database supplied to it. That database can be hosted by Supabase. Payload does not need an additional mysterious “database inside Payload.”

### 2.2 Can the working data and Payload data be hosted by Supabase?

Yes. Supabase can host the PostgreSQL infrastructure used by:

- LiNKsites working records; and
- Payload-managed CMS records.

They must remain separate in schema ownership, credentials, migrations, access, and authority even when they reside in one PostgreSQL service.

### 2.3 Is there one database per frontend VPS?

No, not in the initial architecture.

The initial model uses one centralized content control plane serving all regional frontend VPS deployments. Each VPS hosts shared frontend runtime capacity for a group of sites. It does not receive its own authoritative CMS database merely because it serves a region.

### 2.4 Is there one Payload instance forever?

Not necessarily. Begin with one logical Payload CMS service and one authoritative published-content plane. The Payload application may later run multiple identical instances for availability or throughput while still using the same logical database authority.

Separate regional or per-customer CMS databases should be introduced only when measured scale, isolation, data-residency, failure-domain, or enterprise requirements justify the operational complexity.

## 3. Governing doctrine

1. **Supabase working is where production work is prepared.** It is not the public website content source.
2. **Payload draft is CMS-shaped but not live.** It supports preview and approval.
3. **Payload published is live truth.** Production frontends consume only the authorized published state or release artifacts derived from it.
4. **Promotion is a controlled service.** Executors cannot promote by directly changing database tables.
5. **No duplicate live authority.** Supabase working records may preserve lineage and history, but they must not become a second independently editable copy of live content.
6. **Payload owns its tables.** Payload migrations and APIs manage Payload data; unrelated scripts do not write raw SQL into Payload-managed tables.
7. **Site and tenant identity is explicit.** Every content object belongs to one foundation, preview, or customer site and cannot be selected by an unvalidated client-supplied identifier.
8. **Publication is separate from generation.** A successful agent Run does not imply draft eligibility, and a successful draft write does not imply publication authority.
9. **Regional frontends remain replaceable.** Moving a site to another VPS does not require duplicating or moving its authoritative content database.
10. **Failures are recoverable.** Each promotion and publication has idempotency, lineage, receipts, and rollback behavior.

## 4. Logical architecture

```text
Executors and workflows
        ↓
Supabase working records and working assets
        ↓ validated promotion request
Promotion Service
        ↓ Payload API or trusted application interface
Payload draft and versions
        ↓ preview and publication Gates
Payload published content
        ↓ API, release cache, or revalidation path
Regional shared frontend VPS deployments
        ↓
Cloudflare and website visitors
```

The exact process boundaries may be deployed together initially, but their logical authority must remain distinct.

## 5. Why Supabase exists in the architecture

Supabase is not included to duplicate Payload. It provides the governed working environment needed by an autonomous factory.

The working layer must support objects that do not belong in a customer-facing CMS, including:

- Program, Module, Stage, Issue, and Run records
- Lead Research Package references
- Site Specifications
- Prospect Adaptation Contracts
- Foundation reservations
- Candidate copy and media
- Claim and evidence relationships
- Validation failures
- Model and executor evidence
- Cost records
- Promotion requests
- Gate receipts
- Exception queues
- Retry and compensation state
- Recycle and cleansing evidence

Payload should not become the universal workflow engine for all of these objects.

## 6. What Supabase working must not become

The working layer must not become:

- A second live CMS
- A direct data source for public website pages
- A place where every Payload record is mirrored continuously without a defined operational need
- An unrestricted browser database
- A secret store embedded in ordinary rows
- A dumping ground for raw crawler output without identity, provenance, retention, or ownership
- A route for agents to bypass Payload access control

If a copy of published content is retained in a working record for lineage, it is a historical input/output artifact identified by version and checksum—not an independently editable live authority.

## 7. Why Payload exists in the architecture

Payload is the website CMS and content lifecycle authority. It provides schemas representing the pages, globals, media references, navigation, localized fields, and structured content that frontends render.

Its responsibilities include:

- Website content collections and globals
- Draft and published states
- Version history
- CMS access control
- Preview-compatible content APIs
- Publication hooks
- Localized content where configured
- Media records and governed storage references
- Content relationships
- Admin UI for authorized human use where required

Payload officially supports PostgreSQL through its Postgres adapter and provides versions and drafts suitable for controlled preview workflows. See the current [Payload PostgreSQL adapter documentation](https://payloadcms.com/docs/database/postgres) and [Payload drafts documentation](https://payloadcms.com/docs/versions/drafts).

## 8. Content authority matrix

| Information | Working authority | Draft authority | Live authority |
|---|---|---|---|
| Candidate copy | Supabase working | None until promoted | None |
| Candidate media metadata | Supabase working | None until promoted | None |
| Validation results | Supabase working | Referenced receipt | Referenced receipt |
| Site Specification | Supabase working | Reference only | Reference only |
| CMS-shaped preview content | Promotion lineage in Supabase | Payload draft/version | None |
| Published page content | Promotion/publication receipt | Prior draft/version | Payload published document |
| Workflow and Run state | Supabase working | None | None |
| Public frontend output | Deployment records | Preview render | Published content or derived release |

## 9. Centralized initial database topology

The intended initial topology is centralized:

- One logical Supabase/PostgreSQL working control plane
- One logical Payload CMS service
- One authoritative Payload PostgreSQL content store
- One or more shared regional frontend VPS deployments
- Cloudflare in front of public traffic

The Payload PostgreSQL store may be hosted in the same Supabase project/database as the working layer only if the repository and migration audit proves that strict separation is safe.

### 9.1 Preferred logical separation

A same-database design would use concepts equivalent to:

- Private LiNKsites working schema or schemas
- Payload-owned CMS schema
- Separate database roles and connection credentials
- Separate migration ownership
- Separate backup and restore impact analysis
- No public Data API exposure of Payload-owned tables

### 9.2 Mandatory deployment fallback

Payload's current PostgreSQL adapter documents `schemaName` as experimental. Therefore, same-database schema isolation must not be assumed safe without a version-specific integration test.

If the audit cannot prove safe schema isolation and migration behavior, use:

- One central Supabase project/database for LiNKsites working data; and
- A separate central Supabase-hosted PostgreSQL project/database for Payload.

This fallback still uses Supabase-hosted PostgreSQL and still uses one central content authority. It does not create one database per VPS.

## 10. Why not one database per VPS initially

A Payload database per frontend VPS would introduce:

- Multiple content authorities
- Cross-region synchronization
- Conflict resolution
- More migrations
- More backups and restore procedures
- Greater security and credential surface
- Harder site migration
- Risk of stale content
- Higher operational cost for a solo nontechnical owner

Regional VPS capacity exists to serve frontends close to grouped customers and to scale runtime resources. It does not require regionalizing the CMS and database at the same time.

The system should scale separate concerns separately:

- Frontend runtime placement
- CMS application throughput
- Database capacity
- Media delivery
- Cache and CDN behavior

## 11. Frontend content-consumption rule

Production frontends must not query Supabase working tables.

They should consume:

- Payload's authenticated or public content API under explicit access rules;
- Payload's trusted Local API when co-located appropriately;
- a versioned published-content release derived from Payload; or
- a cache populated from Payload published content.

They must not query Payload-managed PostgreSQL tables directly from browser code.

The exact serving mode may combine static generation, server rendering, incremental revalidation, and caching according to the frontend platform. The source version and invalidation behavior must remain traceable.

## 12. CMS-outage behavior

Public websites should continue serving the most recent valid published content when the CMS or database is temporarily unavailable, wherever the selected rendering and cache mode permits it.

An outage should normally affect:

- New draft creation
- Preview freshness
- Publication
- Revalidation
- Uncached dynamic content

It should not unnecessarily remove already published static or cached pages.

This requires:

- Versioned release artifacts or dependable caches
- Defined time-to-live and stale-serving policy
- Health checks
- Safe revalidation retries
- Clear distinction between content freshness and site availability

## 13. Supabase working schema domains

The working database should separate logical domains such as:

### 13.1 Control and orchestration

- Programs
- Program versions
- Modules
- Stages
- Issues
- Runs
- Executors
- Events
- Idempotency records
- Exceptions

### 13.2 Research and evidence

- Organizations and locations references
- Research packages
- Evidence and claims
- Conflicts and gaps
- Source snapshots references

### 13.3 Product capability

- Tier Specifications
- Vertical Kits
- Component and design references
- Foundations
- Compatibility records

### 13.4 Preview and customer production

- Site Specifications
- Adaptation Contracts
- Reservations
- Working content items
- Working media records
- Preview records
- Customer-site technical references

### 13.5 Validation and publication control

- Gate definitions
- Gate executions
- Receipts
- Promotion requests
- Promotion items
- Publication requests
- Rollback records

### 13.6 Economics and observability

- Cost events
- Usage events
- Capacity allocations
- Metrics
- Incidents

These domains may use multiple PostgreSQL schemas or a carefully prefixed schema depending on tooling and migration decisions.

## 14. Working record common fields

Important working tables should use common control fields where applicable:

- Stable UUID or equivalent ID
- Site, prospect, customer, or foundation scope
- Version
- State
- Created and updated timestamps
- Creator executor and Run
- Program definition version
- Source contract references
- Correlation ID
- Idempotency key
- Content checksum
- Supersession reference
- Retention class
- Sensitivity class
- Optimistic concurrency or revision field

Database-specific implementation details will be finalized through schema design and query analysis.

## 15. Payload content model

Payload should represent website-facing content such as:

- Sites
- Pages
- Navigation
- Globals or site settings
- Reusable CMS block instances where appropriate
- Media records
- Locations
- Services
- Team members
- Testimonials only when valid
- Forms or integration configuration references
- Localized content
- SEO fields

Each document should carry stable external references needed for lineage, such as:

- LiNKsites site ID
- Working package ID
- Promotion ID
- Site Specification version
- Content item or source bundle reference
- Asset reference
- Release or publication identifier

Payload internal IDs remain Payload's responsibility.

## 16. Payload draft and versions

Payload's draft capability relies on versions and allows draft content to remain newer than the last published content. This matches LiNKsites' need to render a prospect or customer preview without changing live content.

Draft use must define:

- Collections and globals with versions enabled
- Draft access policy
- Preview token or session behavior
- Maximum version retention policy
- Autosave policy if the Admin UI is used
- Promotion-created versus human-edited drafts
- Conflict handling
- Publication authority

Payload draft status is necessary but not sufficient. LiNKsites still requires external Gate receipts and promotion lineage.

## 17. Promotion Service definition

The **Promotion Service** is the only trusted application path by which an approved Supabase working package becomes Payload draft content.

It may be implemented as a dedicated service, a tightly scoped backend module, or a set of trusted workers. Its logical responsibilities remain the same.

It must:

- Authenticate the promotion request
- Validate authority
- Verify source versions and checksums
- Verify required Gate receipts
- Resolve target site and Payload schema mapping
- Create or update drafts through supported Payload interfaces
- Register media references
- Preserve source lineage
- Operate idempotently
- Produce item-level and package-level receipts
- Compensate or report partial failure
- Never publish merely because draft promotion succeeded

## 18. Why not raw SQL into Payload tables

Payload manages relational structure, versions, drafts, relationships, localization, migrations, and hooks. Direct SQL writes from agents or automations can bypass those invariants.

The Promotion Service should use:

- Payload Local API where appropriately co-located and trusted;
- Payload REST or other supported API through server-side authentication; or
- a version-tested supported application interface.

Raw SQL into Payload-owned tables is prohibited for routine promotion. Emergency repair requires a separately authorized, tested, and auditable procedure.

## 19. Promotion Request contract

```yaml
promotion_request_id: stable-id
schema_version: version
idempotency_key: unique-key
target:
  site_id: site-id
  site_class: foundation-preview-customer
  payload_instance_id: cms-id
  target_state: draft
source:
  working_package_id: package-id
  working_package_version: version
  package_checksum: checksum
  site_specification_id: specification-version
  assembly_manifest_id: manifest-version
items:
  - source_item_id: working-content-or-asset-id
    source_version: version
    payload_collection: registered-collection
    payload_operation: create-or-update
    target_external_key: stable-key
required_gate_receipts: []
authority_ref: authority-record
requested_by_run: run-id
correlation_id: end-to-end-id
```

The request must not contain unrestricted collection names, arbitrary code, or unvalidated Payload operations supplied by an agent.

## 20. CMS Mapping Registry

The Promotion Service uses a versioned **CMS Mapping Registry** to translate working schemas into Payload collections, globals, blocks, and fields.

Each mapping should define:

- Working object type and schema version
- Payload collection or global
- Payload schema version
- Field mappings
- Required transformations
- Relationship resolution
- Locale behavior
- Asset behavior
- Create/update key
- Fields owned by LiNKsites automation
- Fields editable by authorized CMS users
- Conflict policy
- Validation rules
- Reverse lineage fields

An agent cannot invent a new field during promotion. A missing mapping is a capability-development or migration Issue.

## 21. Promotion stages

1. Receive the Promotion Request.
2. Check schema version and idempotency.
3. Lock or reserve the target promotion scope.
4. Re-read the exact working package version.
5. Verify checksum, Site Specification, proof/tier constraints, and Gate receipts.
6. Verify target site identity and access.
7. Resolve the CMS Mapping Registry version.
8. Create or verify media records and relationships.
9. Create or update Payload drafts.
10. Read back the affected Payload documents.
11. Compare accepted values and relationships against the request.
12. Produce a Promotion Receipt.
13. Release the lock and emit a draft-ready event.

Readback verification is required. A successful HTTP response alone does not prove that the expected draft state exists.

## 22. Promotion Receipt

```yaml
promotion_receipt_id: stable-id
promotion_request_id: request-id
status: succeeded-partial-failed-compensated
payload_instance_id: cms-id
target_site_id: site-id
source_package_checksum: checksum
mapping_registry_version: version
item_results:
  - source_item_id: item-id
    payload_document_id: payload-id
    payload_version_id: payload-version-id
    result_checksum: checksum
    status: status
draft_release_id: release-id
started_at: timestamp
completed_at: timestamp
executor_run_id: run-id
readback_validation_receipt: receipt-id
compensation_ref: optional-reference
```

The receipt becomes part of the preview or customer-site release lineage.

## 23. Idempotency and duplicate safety

Retrying the same promotion must not create duplicate pages, media records, navigation items, or relationships.

Controls include:

- Unique idempotency key
- Stable external key for Payload documents
- Source version and checksum
- Target site scope
- Promotion state lock
- Read-before-create where safe
- Upsert semantics implemented through the supported Payload interface
- Item-level result ledger

A request with the same idempotency key but different checksum must be rejected as a contract conflict.

## 24. Transaction and saga behavior

Supabase working and Payload may be separate databases. The architecture must not require one cross-database transaction.

Promotion should use a saga-style workflow:

- Working package remains immutable during the attempt.
- Promotion items have explicit states.
- Payload changes occur through supported transactions where available.
- Readback establishes actual target state.
- Partial failure either resumes safely, rolls back the created draft changes, or produces a manual exception package.
- Publication remains blocked until package-level consistency is proven.

Even if both layers share one PostgreSQL database initially, the Promotion Service should preserve this contract boundary so later separation does not require redesign.

## 25. Outbox and event delivery

Important state changes should use a durable outbox/inbox or equivalent mechanism.

Examples include:

- Working package validated
- Promotion requested
- Payload draft ready
- Preview validation passed
- Publication authorized
- Content published
- Frontend revalidation requested
- Frontend revalidation completed
- Publication rolled back

Events must include stable ID, type, schema version, subject, correlation ID, causation ID, timestamp, producer, and payload checksum.

At-least-once delivery is acceptable when consumers are idempotent. Silent best-effort webhooks are not sufficient for critical publication state.

## 26. Draft preview

After promotion, preview rendering must request Payload draft content through an authorized preview path.

The path should validate:

- Preview identity
- Site identity
- Requested content release
- Preview access token or session
- Expiration
- User or executor authority
- Route

Draft content must not become visible through the ordinary public published API by accident.

The preview render is tested against the exact draft release recorded in the Promotion Receipt.

## 27. Draft editing after promotion

Payload may permit authorized human or OpenClaw-mediated editing through the Admin UI. If draft editing occurs after automated promotion, the system must decide which layer owns the next change.

Recommended rule:

- Payload draft may be edited by an authorized operator for a bounded correction.
- The edit produces a new Payload version and attribution.
- Before publication, the change is exported or summarized into a reconciliation record so the working lineage is not falsely shown as identical to the draft.
- Repeated or structural changes should return to the Supabase working workflow.

The system must not continually overwrite an authorized human correction with an older working package.

## 28. Publication definition

Publication is the transition by which an approved Payload draft version becomes the live content version for the site.

Publication requires:

- Exact draft release identity
- Publication authority
- Preview validation receipts
- Factual and production approval
- Rights and media status
- Site/tier conformance
- Customer approval where required
- Integration readiness
- Domain and hosting readiness for launch or update
- Rollback target

Publication does not mean that the frontend has already refreshed. Content publication and frontend activation are separate recorded steps.

## 29. Publication Request

```yaml
publication_request_id: stable-id
idempotency_key: unique-key
site_id: site-id
payload_instance_id: cms-id
draft_release_id: release-id
expected_current_published_release_id: current-release-or-null
target_routes: []
required_gate_receipts: []
authority_ref: authority-record
customer_approval_ref: optional-reference
rollback_release_id: prior-release-or-null
requested_at: timestamp
correlation_id: end-to-end-id
```

The expected current release prevents a stale publisher from overwriting a newer publication silently.

## 30. Publication sequence

1. Validate the Publication Request.
2. Verify expected current release.
3. Re-read the exact Payload draft and Gate receipts.
4. Confirm no draft change occurred after validation.
5. Publish through Payload's supported interface.
6. Read back the published state.
7. Produce a Published Content Release and checksum.
8. Emit targeted revalidation or cache invalidation.
9. Verify the frontend serves the intended release.
10. Produce a Publication Receipt.

If frontend verification fails, the system distinguishes a content publication success from a frontend activation failure and follows the defined recovery policy.

## 31. Published Content Release

The release should identify:

- Site
- Payload documents and versions
- Global and navigation versions
- Media asset versions
- Locale versions
- Site Assembly Manifest
- Platform release
- Publication time
- Publisher authority
- Content checksum or manifest checksum
- Prior release
- Rollback target
- Frontend revalidation result

This release is the reconstructable content state served to visitors.

## 32. Frontend revalidation and cache invalidation

Publication should trigger only the routes, sites, tags, or artifacts affected by the change where the frontend platform supports targeted invalidation.

The revalidation contract should include:

- Site ID
- Published release ID
- Affected routes or content tags
- Locale
- Urgency
- Idempotency key
- Requested and completed timestamps
- Target frontend deployment class
- Result and observed release

The frontend should verify that it rendered the intended published version rather than report success merely because a cache command returned.

## 33. Rollback

Rollback restores a known-good Payload published release and causes the frontends to serve it.

Rollback requires:

- Incident or authorized rollback request
- Target prior release
- Impacted site and routes
- Content and media availability
- Compatibility with the current frontend platform
- Revalidation plan
- Post-rollback verification

If a platform release is incompatible with the older content schema, content rollback may need to coordinate with frontend rollback or a compatibility adapter.

Working records and the failed release remain preserved for diagnosis.

## 34. Site and tenant isolation

Each record and operation must resolve site scope from trusted server-side context.

Controls include:

- Stable site identity
- Payload access rules scoped to site or authorized role
- Working-layer row ownership and tenant/site predicates
- No trust in browser-supplied `site_id` alone
- Target site embedded in signed promotion authority
- Stable external keys unique within site scope
- Storage paths and buckets with site or lifecycle boundaries
- Cache keys including site and release identity
- Preview authorization separate from production access

Shared CMS and database infrastructure must not allow one customer's content to be read or updated through another customer's route or credentials.

## 35. Supabase Data API exposure

Working tables should normally live in a private, non-exposed schema and be accessed through trusted backend services. If any schema is exposed through Supabase's Data API, access requires deliberate grants and Row Level Security.

Current Supabase guidance states that RLS must be enabled on tables in exposed schemas. A private schema is appropriate where direct Data API access is not required. See [Securing your API](https://supabase.com/docs/guides/api/securing-your-api) and [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

RLS and grants solve different problems:

- Grants determine whether a database role can access a schema, table, function, or column.
- RLS determines which rows an allowed role may access or change.

Both must follow least privilege.

## 36. Service credentials

- Browser code must never receive a Supabase service-role or secret key.
- Payload uses a dedicated database role or credential appropriate to its managed schema/database.
- The Promotion Service uses a narrowly scoped server-side identity.
- Public frontends use only the content interface and public credentials required by their serving design.
- Administrative or executor credentials live in a secret manager or equivalent protected runtime facility.
- Credential rotation and revocation must not require editing content records.

Authorization claims must come from trusted application metadata or server-side policy, not user-editable profile metadata.

## 37. Row Level Security

RLS policies should reflect actual access relationships, such as:

- Executor may read/write records for the assigned Issue and site scope.
- Reviewer may read candidates and create Gate receipts but not publish.
- Promotion Service may read only validated packages and write promotion state.
- Operator may access sites within delegated scope.
- Customer CMS user, if later enabled, may access only the customer's allowed Payload content fields through Payload access control.

Using an authenticated role without an ownership predicate is not tenant authorization.

Privileged database functions require special review. `SECURITY DEFINER` must never be added simply to make a permissions error disappear.

## 38. Supabase Storage

Supabase Storage may hold working and media objects if selected as the object-storage provider. Storage access is controlled through policies on storage metadata and should use distinct buckets or path policies for:

- Raw source evidence
- Private working assets
- Preview-approved assets
- Production assets
- Quarantined assets
- Temporary processing outputs

Current Supabase Storage guidance uses RLS policies on `storage.objects` and denies uploads by default without suitable policies. See [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).

Object names alone are not authorization. Signed URLs, public buckets, and cache behavior must follow the asset's lifecycle and site scope.

## 39. Database roles and migration ownership

Use separate database roles for:

- Supabase/platform administration
- LiNKsites schema migrations
- LiNKsites runtime services
- Payload migrations
- Payload runtime
- Read-only diagnostics where needed

Each migration system owns only its schema or database.

Payload production schema changes should use version-controlled Payload migrations. Payload documentation distinguishes development push behavior from production migrations. LiNKsites working schemas use their own migration chain. One migration tool must not treat the other system's tables as unmanaged objects to drop or rewrite.

## 40. Schema evolution

Schema changes require compatibility planning across:

- Supabase working records
- CMS Mapping Registry
- Payload collections and versions
- Site Assembly Manifests
- Frontend components
- Published releases
- Promotion and publication events

A safe sequence may include:

1. Add backward-compatible target fields.
2. Deploy mapping support.
3. Migrate or repromote affected drafts.
4. Deploy compatible frontend support.
5. Publish migrated content.
6. Remove old fields only after no active site or rollback depends on them.

Destructive changes require backups, test restores, impact reports, and rollback plans.

## 41. Connection and capacity management

The architecture should avoid one database connection per site or one permanent connection per frontend request.

Capacity design should account for:

- Payload application connection pools
- Promotion and publication workers
- Supabase working services
- Background jobs
- Preview traffic
- Production content reads
- Migration sessions
- Observability queries

Provider-supported pooling and connection modes should be selected using current documentation and tested workload. Exact pool sizes are deployment configuration, not constants in this manual.

## 42. Central scaling path

Scale the initial central architecture in this order where evidence supports it:

1. Improve queries and indexes.
2. Improve caching and published-release delivery.
3. Tune application and database connection pools.
4. Add Payload application instances behind controlled routing.
5. Separate working and Payload databases if initially co-located.
6. Add read replicas where supported and consistency behavior is understood.
7. Partition workloads or introduce additional CMS authorities only when the operational case is proven.

Regional frontend expansion is independent and may occur earlier.

## 43. Triggers for later data-plane separation

Possible triggers include:

- Measured database saturation
- CMS throughput limits
- Unacceptable regional content latency not solved by caching
- Enterprise isolation requirements
- Data-residency commitments
- Restore blast-radius concerns
- Migration-risk separation
- Different availability targets
- Security-boundary requirements

Customer count alone is not a sufficient trigger. The earlier estimate of approximately 20 sites per VPS and later regional grouping are planning hypotheses to be replaced by measured CPU, memory, traffic, build, cache, and operational data.

## 44. Backup and restore boundaries

Backups must cover:

- Supabase working database
- Payload database
- Object storage
- Configuration and migrations
- CMS Mapping Registry
- Site Assembly Manifests
- Published Content Releases
- Secrets through their own secure recovery process

Restores require cross-system consistency checks. Restoring Payload without the matching media objects, or restoring working promotion state without the actual Payload version, can create false state.

The detailed backup, recovery, and regional hosting policy is defined in Section 16.

## 45. Observability

The content plane should expose:

- Working package throughput
- Validation failures
- Promotion latency and failure
- Payload write and readback results
- Draft counts and age
- Publication latency
- Revalidation latency
- Content-release mismatch
- Database connections and query health
- Storage errors
- RLS or authorization denials
- Cross-site access alarms
- Rollback events
- Stale preview and stale production signals

Every log and metric should carry correlation, site, release, and Run identifiers without reproducing unnecessary private content.

## 46. Failure scenarios

### 46.1 Supabase working unavailable

New production and promotion pause. Existing published websites should continue serving cached or published content.

### 46.2 Payload unavailable

Draft, publication, and uncached content operations pause. Existing cached/static websites continue where possible.

### 46.3 Promotion partial failure

The saga resumes idempotently, compensates draft changes, or enters an exception state. Publication remains blocked.

### 46.4 Publication succeeded but frontend did not refresh

The system records publication success and activation failure separately, retries targeted revalidation, and may roll back if the content/frontend mismatch is unsafe.

### 46.5 Frontend serves wrong site content

Treat as a critical isolation incident: restrict serving, preserve evidence, validate route, cache, site resolution, and release mapping, then restore a known-good state.

### 46.6 Working and draft diverge after human edit

Block automated overwrite until the draft edit is reconciled or intentionally superseded.

## 47. Autonomous operation

Routine content-plane operations should be autonomous:

- Validate working packages
- Create promotion requests
- Promote drafts
- Verify readback
- Deploy previews
- Run Gates
- Publish authorized releases
- Revalidate frontends
- Verify serving
- Retry transient failures
- Roll back under an approved automatic policy
- Open exceptions

OpenClaw may investigate and present exceptions, approve actions within delegated authority, or help Carlos operate the system. It is not a required component for ordinary reads, promotion, publication, or website serving.

## 48. Repository audit questions

The later audit must determine:

1. Which Supabase projects and schemas currently exist.
2. Whether Payload currently uses PostgreSQL, MongoDB, SQLite, or another adapter.
3. Whether Payload is already connected to Supabase PostgreSQL.
4. Whether working and Payload tables are mixed in `public`.
5. Whether Payload `schemaName` and migrations behave safely in the exact installed version.
6. Whether a separate Payload database is already used or required.
7. Which schemas are exposed through the Supabase Data API.
8. Whether RLS is enabled and correctly scoped on exposed tables.
9. Whether service-role or database credentials appear in frontend code or repositories.
10. Whether agents or n8n workflows write directly to Payload tables.
11. Whether a Promotion Service exists and uses supported Payload interfaces.
12. Whether drafts, versions, preview, and publication are configured.
13. Whether stable external keys and idempotency exist.
14. Whether published content is duplicated in working tables as a competing authority.
15. Whether frontends query Supabase working or Payload tables directly.
16. Whether site scoping, caching, and preview access prevent cross-customer leakage.
17. Whether migrations are versioned and separated by owner.
18. Whether publication triggers reliable targeted revalidation and verification.
19. Whether backup and restore cover the relational and object-storage sides together.
20. What can be retained, migrated, separated, or retired.

## 49. Initial implementation sequence

1. Audit existing Supabase, Payload, database, storage, and frontend repositories.
2. Confirm the exact Payload version and PostgreSQL adapter behavior.
3. Choose same-database schema isolation only if integration and destructive-migration tests pass; otherwise use two central Supabase-hosted databases.
4. Define private working schemas, roles, RLS, grants, and migration ownership.
5. Define Payload collections, globals, versions, drafts, and access control.
6. Define stable site, content, asset, and external mapping identifiers.
7. Build the CMS Mapping Registry.
8. Build the Promotion Request, Service, readback, and Receipt.
9. Implement durable events and idempotency.
10. Implement authorized draft preview.
11. Implement Publication Request, release manifest, revalidation, and Receipt.
12. Implement rollback and content/frontend consistency verification.
13. Prove tenant isolation with multiple sites sharing one CMS and one frontend VPS.
14. Prove that a frontend migration between VPS deployments requires no content database move.
15. Load test working, promotion, CMS, and published-content paths separately.

## 50. Decisions intentionally still open

This section does not finalize:

- Whether the first production deployment uses one Supabase database with separate schemas or two central Supabase projects
- The exact Payload version and adapter configuration
- The exact Payload deployment host
- The object-storage provider and bucket layout
- The rendering mix of static generation, server rendering, and revalidation
- Cache durations and stale-serving limits
- Exact database pool sizes
- Backup frequency and recovery objectives
- Customer CMS access policy
- Exact retention of Payload versions and working records
- Future read-replica or regional database strategy
- Enterprise isolation and data-residency options

These are engineering and commercial deployment decisions to be resolved through the repository audit, testing, measured load, and later operational sections.

## 51. Acceptance criteria

This part of LiNKsites is adequately defined and implemented when:

1. Supabase working, Payload draft, and Payload published have separate, explicit authorities.
2. Payload uses a supplied PostgreSQL database and no one assumes it contains a separate hidden database.
3. Payload PostgreSQL may be hosted by Supabase.
4. The initial architecture has one central logical content plane, not one database per frontend VPS.
5. Same-database co-location is used only after exact-version schema and migration safety are proven.
6. A two-central-database fallback preserves the same logical architecture if co-location is unsafe.
7. Public frontends never consume Supabase working tables.
8. Public browser code never receives service-role or secret credentials.
9. Payload-owned tables are changed only through Payload migrations and supported application interfaces.
10. Every working package, promotion, draft release, publication, and frontend activation is versioned and attributable.
11. Promotion is idempotent and verifies Payload readback.
12. Draft promotion cannot publish content.
13. Publication verifies the exact draft and expected current release.
14. Frontend revalidation identifies and verifies the published release actually served.
15. Candidate and preview-only material cannot silently become live truth.
16. Human draft edits cannot be overwritten without reconciliation.
17. Cross-database partial failure is handled through durable saga state rather than assumed atomicity.
18. Site isolation is enforced in working records, Payload access, storage, preview, routing, and caches.
19. Exposed Supabase schemas use least-privilege grants and RLS.
20. Existing published sites can continue serving during a temporary working-layer or CMS outage where the frontend cache/release mode permits it.
21. Moving a site between VPS regions does not require duplicating its authoritative database.
22. Scaling decisions are based on measured workload and isolation needs rather than guessed customer counts.

## 52. Governing conclusion

Supabase and Payload are not competitors in LiNKsites. They serve different stages of one controlled content lifecycle.

Supabase is the factory floor: research-derived content, media candidates, agent and automation outputs, costs, validation, and exceptions are created and managed there. Payload is the CMS authority: validated content is promoted into drafts, previewed in the real website schema, and published only after the required authority and quality evidence exists. The published Payload release is what production frontends serve.

The initial system should remain centralized even as frontend VPS capacity expands regionally. One logical Payload content plane can feed many regional shared frontends, while caching and release artifacts protect site availability. Payload's PostgreSQL database may be hosted by Supabase, with working and CMS data separated logically and operationally. If exact-version testing cannot prove safe schema co-location, two central Supabase-hosted databases provide a clean fallback without creating regional content divergence.

This architecture gives Carlos the autonomy he needs without exposing the live CMS to every executor. Agents can research and create freely inside bounded working records; deterministic services decide what is valid; Payload preserves draft and published content; frontends serve only authorized releases; and OpenClaw helps oversee exceptions without becoming a hidden runtime dependency.

## 53. Primary technical references

- [Payload PostgreSQL database adapter](https://payloadcms.com/docs/database/postgres)
- [Payload drafts](https://payloadcms.com/docs/versions/drafts)
- [Payload versions](https://payloadcms.com/docs/versions/overview)
- [Payload database migrations](https://payloadcms.com/docs/database/migrations)
- [Supabase: securing the Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)

---

**End of Section 12**
