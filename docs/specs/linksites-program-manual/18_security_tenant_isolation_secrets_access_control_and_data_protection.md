# LiNKsites Program Manual

## Section 18 — Security, Tenant Isolation, Secrets, Access Control, and Data Protection

**Document set:** LiNKsites Program Manual  
**Section:** 18 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, LiNKsites product and engineering agents, security and infrastructure agents, Payload and Supabase implementers, database administrators, repository auditors, OpenClaw oversight designers, and future human collaborators  

---

## 1. Purpose of this section

This section defines how LiNKsites protects customer separation, visitor and business data, production services, credentials, administrative operations, and autonomous executors across a shared website-factory architecture.

It covers:

- Threat and trust-boundary definition
- Customer and Site ID isolation
- Isolation in host routing, content, databases, caches, object storage, logs, and integrations
- Human roles, service identities, and authorization
- Payload access control and authentication boundaries
- Supabase/PostgreSQL schemas, grants, Row Level Security, views, functions, and privileged keys
- Secret creation, storage, injection, rotation, revocation, and recovery
- Cloudflare, Traefik, Next.js, host, container, and network controls
- AI-agent and executor permissions
- Audit evidence, security testing, vulnerability handling, and incident containment
- Data minimization, retention-policy support, deletion, and backup protection

This section defines technical security doctrine. It does not finalize jurisdiction-specific legal duties, consent text, contracts, or retention periods. Those are resolved later, but the system must make the eventual policy enforceable and auditable.

## 2. Direct security decisions

### 2.1 Is LiNKsites a multi-tenant system?

Yes. Multiple customer sites share platform code, frontend VPS capacity, and initially a central Payload/PostgreSQL content plane. Tenant isolation is therefore a primary architectural invariant, not an optional enhancement.

### 2.2 Is one database required per customer?

No. The initial system uses a shared database with explicit Site ID scoping, restrictive grants, server-side authorization, PostgreSQL constraints, and Row Level Security where applicable. Dedicated databases may become an enterprise or exceptional isolation option later, but they are not required for safe initial operation.

### 2.3 Can a public website browser connect directly to Supabase?

Not by default. A basic LiNKsites public website does not need general browser access to the Supabase Data API. Public form and integration operations go through controlled LiNKsites server endpoints.

If a future capability genuinely requires browser access, only the necessary dedicated API surface is exposed with explicit grants, RLS, rate limits, and tests. The entire operational or content schema is never exposed for convenience.

### 2.4 Can an executor use the Supabase `service_role` or secret key in browser code?

No. Supabase secret keys and the legacy `service_role` bypass RLS and belong only in secured backend services. They must never appear in `NEXT_PUBLIC_` variables, browser bundles, static files, client logs, or prompts.

### 2.5 Does Payload authentication automatically provide sufficient authorization?

No. Payload access control must be explicit by operation, collection, document, field, role, and Site ID. Authentication answers who is calling; authorization answers what that identity may do.

### 2.6 Can an AI agent receive full production access because it is supervised by OpenClaw?

No. Agents and automations receive the smallest capability required for one Issue or approved runbook. OpenClaw supervision does not convert unrestricted credentials into an acceptable control.

### 2.7 Is Cloudflare the entire security system?

No. Cloudflare reduces edge exposure and filters traffic, but tenant authorization, content scoping, secrets, database controls, and server-side validation remain mandatory.

## 3. Governing security doctrine

LiNKsites follows these rules:

1. **Assume every external input is untrusted.** This includes visitor input, lead research, customer assets, scraped pages, webhook payloads, uploaded files, and AI-generated output.
2. **Enforce authorization on a trusted service layer.** Client-side hiding is not access control.
3. **Deny by default.** Access is granted explicitly to a named identity, role, capability, tenant, action, and environment.
4. **Make tenant identity explicit.** Every customer-owned record and operation carries a stable Site ID or Customer ID.
5. **Use multiple independent isolation controls.** Routing, application queries, database policies, constraints, cache keys, and storage paths reinforce one another.
6. **Separate public, administrative, and privileged service surfaces.** They do not share broad credentials or equivalent network exposure.
7. **Use human and service identities separately.** An automation must not impersonate Carlos.
8. **Keep secrets out of code, content, logs, prompts, and browser bundles.**
9. **Prefer short-lived and narrowly scoped credentials.**
10. **Treat privileged local APIs and database functions as security boundaries.** Convenience does not justify bypassing checks.
11. **Record security-relevant actions.** Evidence must identify actor, authority, target, result, and correlation.
12. **Fail closed on tenant ambiguity.** Unknown or conflicting Site IDs must never fall back to a default customer.
13. **Separate production from preview, development, and testing.**
14. **Make security controls testable as code.** Policies without automated negative tests will drift.
15. **Protect recovery systems from production compromise.**
16. **OpenClaw explains and coordinates security exceptions; it is not a universal privileged runtime.**

## 4. Security objectives

LiNKsites protects:

- **Confidentiality:** one customer, visitor, agent, or service sees only authorized data.
- **Integrity:** content, configuration, orders, submissions, releases, and evidence change only through authorized paths.
- **Availability:** security controls resist abuse without unnecessarily disabling legitimate websites.
- **Authenticity:** the system can establish which identity or service performed an action.
- **Accountability:** material actions leave durable evidence.
- **Recoverability:** data and configuration can be restored without weakening access controls.
- **Tenant isolation:** compromise or failure in one site does not expose or modify another site.

## 5. Primary protected assets

Protected assets include:

- Customer Site IDs and Site Assignments
- Published and draft content
- Preview foundations and customer adaptations
- Form submissions and visitor contact data
- Customer business information not intended for public display
- Payload administrative accounts and API keys
- Supabase/PostgreSQL data and keys
- Object-storage media and provenance records
- Domain, DNS, and certificate authority
- Cloudflare and VPS infrastructure control
- Odoo, Stripe, messaging, analytics, and other integration credentials
- Source repositories, build pipelines, artifacts, and signing metadata
- Backups and recovery credentials
- Audit logs, Incident Records, and security evidence
- Agent instructions, run permissions, and executor identities

## 6. Threat assumptions

LiNKsites assumes the possibility of:

- Automated internet attacks against public endpoints
- Credential theft or reuse
- Malicious or compromised third-party scripts
- Cross-site scripting, injection, request forgery, and authorization bypass
- Insecure direct object references or broken object-level authorization
- Hostname confusion and cache poisoning
- Cross-tenant database queries or storage paths
- Excessively privileged service keys
- Misconfigured RLS or Payload access control
- A compromised frontend container or VPS
- A compromised dependency, build action, image, or repository token
- Accidental administrator or automation error
- Malicious content embedded in researched websites or uploaded assets
- Prompt injection intended to manipulate an AI executor
- Provider outage or provider-account compromise
- Backup deletion or encryption by an attacker
- Insider misuse by a future collaborator
- Lost or stolen administrator device

Security design does not assume that Carlos, OpenClaw, an AI agent, a provider, or a single firewall can never fail.

## 7. Trust boundaries

LiNKsites explicitly separates:

1. Public visitor browser
2. Cloudflare edge
3. Traefik and frontend serving plane
4. Public form and webhook services
5. Payload public-read API
6. Payload administrative interface and APIs
7. Supabase Data API, if enabled
8. Direct PostgreSQL access
9. Object storage
10. Operations and observability plane
11. CI/CD and artifact registry
12. Secret-management plane
13. Autonomous executors and agent sandboxes
14. OpenClaw oversight
15. Human administrative access
16. Third-party provider APIs

Data crossing a boundary requires a defined identity, protocol, validation, authorization, and audit policy.

## 8. Data classification

| Class | Examples | Default handling |
|---|---|---|
| Public | Published website copy, approved public media, public business address | May be served publicly only in approved published state |
| Internal | Component metadata, capacity metrics, non-sensitive run records | Authenticated LiNKtrend access; not publicly indexed |
| Customer confidential | Draft content, unpublished assets, customer operational configuration | Site-scoped access; encrypted transport; restricted roles |
| Sensitive visitor data | Form contact fields, message contents, booking requests | Minimal collection; restricted access; protected logs and exports |
| Restricted operational | DNS authority, deployment controls, incident evidence, audit data | Privileged role or service only; enhanced auditing |
| Secret | API keys, passwords, signing keys, database credentials, recovery keys | Secret manager only; never ordinary application data |

The most restrictive applicable class controls handling. AI-generated summaries do not automatically lower the source classification.

## 9. Tenant identity hierarchy

LiNKsites uses stable internal identifiers:

```text
LiNKtrend Organization
└── Customer Account
    └── Customer Site
        ├── Hostnames
        ├── Content and releases
        ├── Media
        ├── Forms and submissions
        ├── Integrations
        ├── Analytics
        └── Operational history
```

- `customer_id` identifies the commercial customer.
- `site_id` identifies one managed website.
- A customer may later own multiple Site IDs.
- Hostnames, human-readable slugs, email addresses, and database row IDs do not replace Site ID.

## 10. Tenant Isolation Invariant

For every request, query, cache entry, file, event, and operation involving customer data:

```text
authorized tenant scope
= resolved identity scope
= record Site ID
= route or hostname Site ID
= operation target Site ID
```

If these do not agree, the operation is rejected and recorded. The system never “chooses the closest match.”

## 11. Site ID on all tenant-owned records

Tenant-owned tables and Payload collections contain a non-null immutable `site_id` or an equally strong parent relationship that resolves to it.

Examples:

- Content entries
- Media metadata
- Form Definitions and Submissions
- Preview records
- Site Specifications
- Domain Records
- Integration Records
- Deployment and release records
- Analytics configuration
- Customer change requests
- Outbox and webhook events

Site ID is assigned by trusted server logic, not accepted blindly from the browser.

## 12. Relational integrity

Where practical, database design uses composite uniqueness and foreign keys so a record cannot reference an object from another site.

Conceptual pattern:

```sql
unique (site_id, id)

foreign key (site_id, media_id)
  references media (site_id, id)
```

This reinforces application filters. A foreign key on `media_id` alone may prove that media exists while failing to prove that it belongs to the same site.

## 13. Hostname isolation

The public request path resolves the normalized hostname to exactly one active Domain Record and Site Assignment.

The runtime then binds:

- Hostname
- Site ID
- Platform release
- Published content release
- Cache namespace
- Monitoring profile

Unknown, inactive, duplicate, or conflicting hostnames fail closed. They never render a default customer or the most recently accessed site.

## 14. Content isolation

Public content queries require:

- Resolved Site ID
- Published status
- Active content release or approved publication pointer
- Correct locale where relevant
- Correct resource type and route

A public request cannot ask for another Site ID through a query parameter and override hostname-derived scope.

Draft, preview, superseded, quarantined, and working-layer data are unavailable through the public content path.

## 15. Cache isolation

Every shared cache key includes the necessary dimensions:

- Site ID or verified hostname
- Canonical route
- Locale
- Published content release
- Platform release where response compatibility requires
- Authentication or preview mode where applicable

Preview and authenticated responses do not enter shared public caches. Cache invalidation is site- and release-scoped. A cache hit must not bypass tenant resolution.

## 16. Object-storage isolation

Object identity includes tenant scope using governed bucket and path patterns or metadata:

```text
site/{site_id}/asset/{asset_id}/{version}/{safe-file-name}
```

Controls include:

- Server-assigned Site ID
- Non-guessable object IDs where privacy requires
- RLS or provider policy for private buckets
- Signed URLs with short expiry for restricted objects
- Content-type enforcement
- No user-controlled path traversal
- Cross-check between database metadata and object path
- Separate public-published and private-working access semantics

Storage object existence does not by itself authorize access.

## 17. Log and telemetry isolation

Logs contain stable Site IDs and correlation IDs, not unnecessary customer content. They must not include:

- Passwords or API keys
- Supabase secret or service-role keys
- Authorization headers
- Session cookies
- Turnstile tokens
- Complete form messages unless explicitly protected and necessary
- Database connection strings
- Private media URLs with reusable signatures
- Prompt content containing secrets

Access to logs is itself role-controlled. Search results must not allow a customer-support role to inspect unrelated tenants.

## 18. Human roles

Initial roles are capabilities, not job titles:

| Role | Permitted scope |
|---|---|
| Owner | Company-level governance, exceptional authority, recovery |
| Platform administrator | Infrastructure and platform configuration within approved policy |
| Security administrator | Identity, secret, policy, and incident controls |
| Content administrator | Approved content across designated sites |
| Site editor | Draft and update content for assigned Site IDs |
| Release approver | Approve or promote governed releases for assigned scope |
| Operations responder | Monitor and execute approved recovery runbooks |
| Support viewer | Read limited customer and incident data needed for support |
| Auditor | Read immutable configuration and evidence without mutation |
| Billing or Sales operator | Commercial records through the Sales/Odoo contract, not CMS administration |

Carlos may initially hold several roles, but the system still represents them separately so privileges can later be delegated safely.

## 19. Service identities

Every automation, backend, CI job, and integration uses a named service identity, for example:

- `svc-frontend-read-published`
- `svc-form-accept-submission`
- `svc-payload-content-promoter`
- `svc-deployment-controller`
- `svc-backup-writer`
- `svc-restore-operator`
- `svc-domain-controller`
- `svc-sales-odoo-adapter`

A service identity has:

- Owner
- Purpose
- Environment
- Allowed actions
- Tenant scope or scope derivation
- Credential type
- Issue/run authorization requirement
- Creation and expiry
- Rotation schedule
- Last use
- Revocation state

Shared “admin bot” credentials are prohibited.

## 20. Authentication and authorization

- **Authentication** establishes identity.
- **Authorization** evaluates whether that identity may perform a specific action on a specific resource in a specific tenant and environment.

LiNKsites performs authorization at every trusted service boundary. A valid session or API key does not automatically authorize every Site ID.

## 21. Authorization decision contract

An authorization decision evaluates:

```yaml
subject:
  identity_id: identity-reference
  identity_type: human-or-service
  roles:
    - role
action: content.publish
resource:
  type: content-release
  id: release-id
  site_id: site-id
context:
  environment: production
  issue_id: issue-id
  run_id: run-id
  authentication_strength: mfa
  network_context: approved
decision: allow
policy_version: policy-v3
```

The decision is server-side and auditable for sensitive operations.

## 22. Least privilege

Access is minimized across:

- Actions
- Resource types
- Site IDs
- Environments
- Time window
- Network source
- API scopes
- Database tables and columns
- Object-storage buckets and paths
- Secret identities
- Infrastructure providers
- Runbook actions

Read, create, update, delete, publish, deploy, restore, and revoke are separate permissions.

## 23. Separation of duties

High-risk operations may require two distinct authorities or at least two independent gates:

- Approving and publishing a major customer change
- Creating and using a new privileged service identity
- Restoring the central production database
- Modifying tenant-isolation policy
- Deleting backups or changing retention
- Transferring domains
- Rotating root or break-glass credentials
- Disabling security monitoring

For a solo owner, the second gate may be a deterministic verification policy rather than a second employee. The system records that the same person held multiple roles; it does not pretend separation existed where it did not.

## 24. Break-glass access

Break-glass access is reserved for recovery when normal identity systems fail.

It requires:

- Independent protected credential
- Strong authentication
- Explicit invocation reason
- Short-lived session where supported
- Immediate alert
- Complete audit logging
- Restricted action scope
- Post-use credential rotation or validation
- Incident or recovery record

Break-glass credentials are not used for routine convenience.

## 25. Human account lifecycle

Every human account follows:

```text
requested
→ identity_verified
→ role_approved
→ provisioned
→ active
→ reviewed
→ suspended_or_changed
→ revoked
```

Controls include:

- Unique account per person
- No shared human login
- MFA for privileged access
- Recovery methods
- Session revocation
- Prompt role removal when access is no longer required
- Periodic access review
- Last-login and anomalous-use monitoring

Deleting a user record alone must not be assumed to invalidate all existing sessions or tokens. Revocation behavior is tested for each identity provider.

## 26. Session policy

Administrative sessions use:

- Secure, HttpOnly, SameSite cookies where browser-based
- TLS only
- Bounded lifetime
- Idle timeout appropriate to risk
- Reauthentication for high-risk operations
- CSRF controls where required
- Session revocation
- Device and access-event evidence

Tokens are not placed in URLs, analytics, client-readable logs, or untrusted browser storage without an explicit justified design.

## 27. Payload authentication

Payload provides authentication strategies such as sessions/JWTs and API keys. LiNKsites uses them under these rules:

- Human admin accounts and service accounts are distinct.
- API keys belong to dedicated auth records, not personal users.
- Each service account receives only the required access-control functions.
- Administrative and public API routes are separated in policy and exposure.
- API keys are secret-manager references and are rotated.
- Password reset and verification flows use configured trusted server URLs.
- Account lockout, rate limits, MFA capability, and recovery are assessed for the selected Payload version and identity design.

## 28. Payload access control

Payload access is defined per:

- Collection
- Global
- Field
- Operation: create, read, update, delete
- Version access
- Admin interface access
- Document Site ID
- Publication status
- User or service role

Public read access returns only approved published documents for the resolved Site ID.

Administrative UI visibility is not the only control. The API access function must enforce the same permission.

## 29. Payload Local API warning

Payload's Local API skips access control by default unless configured with `overrideAccess: false`.

Therefore:

- Untrusted or user-initiated operations must not call the Local API through a path that silently bypasses access checks.
- Wrapper functions distinguish privileged internal operations from access-controlled operations.
- Every privileged Local API call names the service identity, Issue, Run, Site ID, and reason.
- Tests prove that a request cannot change tenant scope merely because execution occurs inside the same Node.js process.

This is a critical repository-audit item.

## 30. Payload privilege wrappers

Privileged CMS functions are narrow capabilities such as:

- `read_published_site(site_id, release_id)`
- `create_draft_from_working(site_id, promotion_id)`
- `publish_approved_release(site_id, approval_id)`
- `restore_content_release(site_id, release_id)`

The application does not hand general Local API access to agents or arbitrary route handlers.

## 31. Supabase exposure stance

The recommended initial stance is:

- Public browsers do not directly query operational or content tables.
- Public forms call a LiNKsites server endpoint.
- Internal services access PostgreSQL through dedicated roles or a deliberately limited API.
- The Supabase Data API is disabled if no feature requires it.
- If the Data API is used, expose a dedicated `api` schema rather than the broad `public` schema where practical.
- Internal tables and helper functions reside in unexposed schemas.

This reduces the public attack surface and makes authorization easier to reason about.

## 32. Supabase 2026 Data API behavior

Supabase is changing default Data API exposure for new tables. Projects may require explicit grants before new `public` tables are reachable, while existing projects and settings can differ.

LiNKsites therefore never assumes exposure behavior from the project creation date. It audits:

- Which schemas are exposed
- Whether Data API is enabled
- Default privileges
- Table and sequence grants
- Function execute grants
- RLS status and policies
- Existing tables that retained older grants

PostgreSQL grants decide whether a role can access an object at all. RLS decides which rows that role may access. Both are required where the API surface is exposed.

## 33. Supabase schema strategy

Recommended logical schemas:

| Schema | Purpose | Data API exposure |
|---|---|---|
| `private` | Internal operational tables and helper functions | No |
| `content` | Payload-owned or content-domain tables where compatible | No direct public exposure |
| `api` | Deliberately exposed views, tables, or functions | Only if required |
| `audit` | Security and operational evidence | No |
| `public` | Minimized; not treated as automatically safe | Depends on audited project configuration |

Final names must respect Payload and Supabase implementation constraints, but the public/private distinction remains.

## 34. Database grants

LiNKsites grants privileges explicitly:

- `anon`: no table access unless a specific public Data API capability requires it
- `authenticated`: only declared API objects and actions
- frontend service: read approved published content, no draft or secret access
- form service: insert submissions and outbox events through a constrained capability
- content promoter: required working/draft/published transitions only
- backup identity: read or replication capability required for backup, not application mutation
- migration identity: schema migration under controlled deployment only
- auditor: read approved evidence

Default privileges are reviewed so new tables and functions do not become accessible accidentally.

## 35. Row Level Security

RLS is enabled on every table in an exposed schema and used in private schemas as defense in depth where feasible.

Policies:

- Name the target role with `TO`.
- Include a Site ID or ownership predicate.
- Separate select, insert, update, and delete.
- Use both `USING` and `WITH CHECK` for updates.
- Never treat `TO authenticated` alone as tenant authorization.
- Test positive and negative cases.
- Avoid policy recursion and unbounded complexity.
- Consider performance and indexes for policy predicates.

Conceptual example:

```sql
create policy "site editors read assigned records"
on api.site_content
for select
to authenticated
using (
  exists (
    select 1
    from private.site_memberships m
    where m.user_id = (select auth.uid())
      and m.site_id = site_content.site_id
      and m.can_read = true
  )
);
```

Exact SQL is produced only after the repository schema and authentication model are audited.

## 36. Authorization claims

Supabase user-editable metadata is not used for authorization. `raw_user_meta_data` or equivalent user-controlled claims may appear in JWTs and are unsafe as the source of tenant roles.

Authorization claims use protected application metadata or database membership records. The design accounts for JWT staleness: role changes may require token refresh or server-side session/membership validation for sensitive operations.

## 37. Views

Views can bypass RLS depending on ownership and configuration.

LiNKsites requires:

- Postgres 15+ security-invoker views where an exposed view should obey caller RLS.
- Revoked access or unexposed placement for views that cannot safely inherit caller restrictions.
- Explicit tests for cross-site rows.
- No assumption that a filtered view is secure merely because its SQL contains a Site ID column.

## 38. Database functions

Functions are APIs. They require:

- Explicit execute grants
- Fixed and safe search path
- Validated arguments
- Tenant scope derived from trusted identity or checked against membership
- Controlled error responses
- Audit for privileged actions
- Tests for SQL injection and authorization bypass

`SECURITY DEFINER` is not added merely to make permission errors disappear.

When it is genuinely required:

- The function resides in a non-exposed schema.
- Execute is revoked from `PUBLIC` and granted narrowly.
- Caller identity and Site ID are checked explicitly.
- Owner privileges are minimized.
- Search path is fixed.
- Security advisors and tests are run.

## 39. Secret and service-role Supabase keys

Supabase secret keys and the legacy `service_role` provide elevated backend access and can bypass RLS.

Rules:

- Server-only use
- Dedicated service identity where the platform supports multiple secret keys
- Never prefix with `NEXT_PUBLIC_`
- Never embed in Payload content or frontend environment
- Never expose to an AI prompt
- Restrict which backend service can read each key
- Rotate after suspected exposure
- Monitor use
- Prefer a narrower database role or server endpoint when full bypass is unnecessary

The publishable key or legacy anon key is not itself authorization; grants and RLS still control reachable data.

## 40. Supabase Storage

Storage access control uses PostgreSQL RLS on storage metadata plus object-path discipline.

Rules include:

- Public buckets contain only approved public assets.
- Working, customer-confidential, and uploaded objects use private buckets.
- Server assigns or validates the Site ID path prefix.
- Signed URLs are short-lived and purpose-specific.
- Upsert permissions account for insert, select, and update requirements.
- Object deletion is separate from database metadata deletion.
- Storage policies are tested for read, create, replace, move, and delete across different Site IDs.
- Database backup and object backup remain separate under Section 16.

## 41. Direct PostgreSQL roles

Direct database connections use dedicated roles:

- Runtime read role
- Form-write role
- Payload application role
- Migration role
- Backup role
- Restore role
- Monitoring role
- Read-only audit role

The superuser or database owner is not the ordinary application credential. Network access, connection pool, TLS, statement timeouts, and query logging are configured by role and purpose.

## 42. Connection pooling and tenant context

If tenant context is set through database session variables, the design must account for pooled connections and transaction boundaries. Tenant state must not leak from one request to the next.

Safer patterns include:

- Explicit Site ID predicates in every query
- Transaction-local context reset automatically
- Prepared capability functions that derive scope from trusted identity
- Pool modes compatible with the chosen context method

Isolation tests use interleaved requests to detect connection-reuse leaks.

## 43. Public form security boundary

The form service from Section 17:

- Derives Site ID from the trusted hostname and Form Definition.
- Does not accept arbitrary destination addresses from the browser.
- Does not give the browser direct database credentials.
- Validates schema, length, format, rate, and Turnstile token.
- Stores visitor input in controlled fields.
- Escapes content before notification rendering.
- Uses a transactional outbox.
- Restricts reads of submissions to authorized site or LiNKtrend roles.

## 44. Customer portal boundary

An authenticated customer portal is not required for the initial managed service. Customer updates may enter through Sales/Support workflows.

If a portal is later added, it becomes a separate authentication and authorization surface with:

- Customer-to-Site membership
- MFA or risk-appropriate authentication
- RLS and Payload access tests
- Invite and revocation lifecycle
- Session management
- Audit trail
- No automatic access to internal factory or Sales data

## 45. Secrets-management architecture

LiNKsites uses an established secret-management solution rather than building one.

Candidate open-source options include OpenBao or Infisical, subject to repository audit and operational evaluation. A managed provider secret manager may also be selected if it materially reduces solo-operator risk.

Required capabilities:

- Central inventory
- Fine-grained access
- Human and machine authentication
- Version history
- Rotation support
- Audit events
- Environment separation
- Revocation
- Backup and recovery
- API and CLI integration
- Short-lived or dynamic credentials where possible

The final tool is open; the interface and lifecycle are mandatory.

## 46. Secret Record

The system stores secret metadata, not secret values, in ordinary Program records.

```yaml
secret_record_id: secmeta_...
secret_manager_ref: path-or-object-reference
secret_class: messaging-api-key
owner_service_id: svc-form-delivery
environment: production
site_scope: shared-or-site-id
provider: provider-name
created_at: timestamp
last_rotated_at: timestamp
rotation_due_at: timestamp
expires_at: timestamp-or-null
allowed_consumers:
  - service-identity
recovery_profile_id: profile-reference
status: active
```

## 47. Secret injection

Secrets are delivered to services at runtime through:

- Secret-manager agent or API
- Docker Compose secrets or equivalent file mounts
- Short-lived environment injection by a trusted deployment system
- Dynamic database credentials where supported

Per-service access is required. A container receives only its own secrets.

Ordinary `.env` files are not a secret manager. Development `.env` files remain ignored by Git and contain no production secrets.

## 48. Secret lifecycle

```text
requested
→ approved
→ generated
→ stored
→ granted
→ used
→ rotated
→ revoked
→ destroyed
```

Every secret has an owner, purpose, consumers, environment, rotation condition, and recovery method.

Unused and unknown secrets are revoked after dependency analysis. Rotation is tested so it does not require an outage.

## 49. Secret rotation

Rotation uses overlap where provider support allows:

1. Create new credential.
2. Store as new secret version.
3. Deploy to allowed consumers.
4. Verify successful use.
5. Stop use of old credential.
6. Revoke old credential.
7. Verify no failed consumers.
8. Record evidence.

Emergency rotation accelerates this sequence and creates an Incident Record.

## 50. CI/CD credentials

Build and deployment pipelines should prefer workload identity or OIDC exchange for short-lived provider credentials.

Controls include:

- Environment protection
- Branch and review gates
- Minimal repository and infrastructure scopes
- No untrusted pull-request access to production secrets
- Redacted logs
- Pinned action or dependency versions
- Separate build and deployment identities
- Artifact identity carried from build to production
- Prompt revocation after compromise

## 51. Environment separation

Development, test, preview, staging, and production use separate:

- Databases or strongly isolated schemas/projects according to risk
- API keys
- secret paths
- object-storage buckets
- messaging sender modes
- analytics properties
- OAuth applications or redirect URIs
- domain records
- service identities

Production visitor data is not copied into development by default. Test fixtures use synthetic data.

## 52. Encryption in transit

LiNKsites requires TLS for:

- Visitor to Cloudflare
- Cloudflare to origin
- Internal service connections crossing hosts or untrusted networks
- PostgreSQL and Supabase connections
- Object storage
- Secret-manager access
- Provider APIs
- Administrative access
- Backup transfer

Certificate validation is enabled. Disabling verification is not an acceptable generic workaround.

## 53. Encryption at rest

LiNKsites confirms provider encryption for:

- Database storage
- Object storage
- Backups
- Monitoring data
- VPS disks where available
- Secret manager

Provider encryption at rest does not replace application authorization. Highly restricted values may receive application-layer encryption where the threat model and operational need justify it.

## 54. Key management

Encryption keys are separated from encrypted data and from ordinary production credentials.

Key policy defines:

- Key owner
- Purpose and algorithm
- Creation and rotation
- Allowed services
- Backup and recovery
- Revocation
- Audit
- Destruction

The key needed to decrypt every backup must not exist only inside the primary provider account being protected.

## 55. Cloudflare edge controls

Cloudflare provides:

- Proxied DNS and edge termination
- WAF managed rules where available
- Custom security rules
- Rate limiting and challenge controls according to plan
- Turnstile for forms
- DDoS protection capabilities
- TLS policy
- Cache and bot controls

LiNKsites starts managed rules in monitored or tuned modes where needed, evaluates false positives against canaries, and then enforces them. Rule exceptions are narrow, justified, versioned, and monitored.

## 56. Origin protection

The origin should not accept unrestricted direct public traffic that bypasses Cloudflare controls.

Candidate controls include:

- Provider firewall allowing Cloudflare origin ranges
- Cloudflare Tunnel where architecture and plan support it
- Authenticated Origin Pulls
- Origin authentication header or token with rotation
- Network ACLs
- Private origin service

The selected control must account for IP-range updates, health probes, emergency access, and certificate renewal. Origin protection complements, rather than replaces, hostname and Site ID validation.

## 57. Traefik security boundary

Traefik:

- Exposes only required entry points
- Routes only declared hostnames and services
- Uses verified origin certificates
- Applies governed security middleware
- Protects dashboards and administrative APIs from public access
- Redacts sensitive headers from logs
- Limits request sizes and timeouts
- Forwards trusted client-address data only from known proxies
- Rejects unknown hosts

The Docker socket is not exposed broadly to application containers. If Traefik uses Docker discovery, socket access is minimized or mediated through an approved socket proxy.

## 58. Security headers

The frontend applies a tested header baseline:

- Content-Security-Policy
- Strict-Transport-Security after HTTPS readiness
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- Frame restrictions through CSP `frame-ancestors`
- Cache-Control appropriate to content sensitivity

Headers are generated from the site's declared third-party integrations. They are tested so that policy does not silently break required forms, media, analytics, or embeds.

## 59. Content Security Policy

CSP limits permitted script, style, image, media, font, frame, connection, and form destinations.

LiNKsites prefers:

- No uncontrolled inline scripts
- Nonce- or hash-based script allowance where dynamic rendering requires
- Provider-specific allowlists derived from Integration Records
- `object-src 'none'`
- Explicit `base-uri` and `frame-ancestors`
- Report-only deployment before enforcement for major changes
- CSP violation monitoring without collecting unnecessary visitor data

Each new third-party integration must declare its CSP impact.

## 60. Input validation and output encoding

All inputs have:

- Expected schema
- Type
- Length and size
- Character and format constraints
- Allowed values
- Normalization
- Authorization scope
- Error behavior

Output is encoded for its context: HTML, attribute, URL, JSON, email, shell, or database. Sanitization is used for approved rich content, while plain text remains plain text.

AI-generated content is untrusted until it passes the same validation and content gates as human input.

## 61. Next.js data boundary

The frontend distinguishes server-only and client-visible code.

Rules:

- Server-only data access remains in server modules.
- Client components receive only serialized fields intended for the visitor.
- Secrets are never imported into client code.
- `NEXT_PUBLIC_` is used only for values safe to publish.
- Server Actions and route handlers authenticate and authorize independently.
- Cached server data includes tenant and authorization scope.
- Error responses do not serialize stack traces or hidden records.
- Build-time variables are reviewed because they can become part of static output.

## 62. Server-side request forgery controls

Lead research, image retrieval, webhooks, previews, and integrations may fetch external URLs. Fetchers enforce:

- Allowed protocols
- DNS and IP resolution checks
- Blocked loopback, link-local, metadata, and private-network targets unless explicitly required
- Redirect revalidation
- Request and response size limits
- Timeouts
- Content-type expectations
- Download quarantine
- No forwarding of internal credentials

An AI-selected URL does not bypass SSRF policy.

## 63. Upload and media security

Uploads use:

- File-size limits
- Allowlisted content types
- Extension and content inspection
- Malware scanning where required
- Private quarantine
- Image/video decoding safeguards
- Removal of unnecessary metadata where policy requires
- Safe generated filenames
- No executable serving
- Site-scoped object paths
- Rights and provenance linkage

Public forms do not accept files unless the complete workflow exists.

## 64. Host hardening

Each VPS uses a reproducible hardened baseline:

- Supported operating-system version
- Minimal installed packages
- Prompt security updates under Section 16 maintenance policy
- Firewall with deny-by-default inbound rules
- SSH keys, no password login
- Privileged access restricted and audited
- Time synchronization
- No unnecessary services
- File permissions and ownership
- Intrusion and authentication-event monitoring
- Disk and log management
- Automated configuration drift detection

Manual changes outside desired state are exceptions and must be reconciled.

## 65. Container hardening

Containers should:

- Run as non-root where compatible
- Use read-only filesystems where feasible
- Drop unnecessary Linux capabilities
- Prevent privilege escalation
- Use resource limits
- Mount only required files and secrets
- Avoid host network and privileged mode
- Avoid Docker socket access
- Use minimal pinned base images
- Expose only required ports to internal networks
- Produce structured logs without secrets
- Be replaced rather than manually modified

## 66. Network segmentation

Networks separate:

- Public Traefik ingress
- Frontend runtime
- Operations and metrics
- Administrative services
- Content-plane access
- Backup transfer

Only required flows are allowed. Database and administration ports are not exposed publicly. Monitoring endpoints require network and identity controls rather than relying on obscure ports.

## 67. Administrative access

Human infrastructure access uses:

- Named account
- MFA where provider supports it
- SSH key or identity-aware access
- Approved source or brokered access
- Short-lived elevation
- Session evidence for high-risk systems
- No shared root password
- Emergency path independent of the ordinary device

Carlos receives a plain-English access map and recovery procedure appropriate for a solo nontechnical owner.

## 68. Dependency and supply-chain security

Repositories must:

- Pin dependencies and commit lockfiles
- Track supported versions of Next.js, Payload, Supabase clients, Traefik, and telemetry tools
- Review changelogs for breaking security changes
- Scan dependencies and container images
- Remove unused packages
- Generate an SBOM for release artifacts where practical
- Pin CI actions and external build inputs
- Protect default branches and release tags
- Build in controlled environments
- Promote the same verified artifact to production
- Record artifact digest in the Platform Release

Automated upgrades create reviewed work; they do not silently deploy major changes across all customers.

## 69. Infrastructure-as-code security

Infrastructure definitions are:

- Versioned
- Reviewed
- Secret-free
- Validated before application
- Applied through named identities
- Scoped to environment and region
- Protected against destructive defaults
- Compared with observed state

Plan output is reviewed for deletions, public exposure, permission expansion, and replacement of stateful resources.

## 70. Executor security model

An executor receives a capability envelope:

```yaml
run_id: run_...
executor_id: executor-identity
issue_id: issue-id
environment: production
site_scope:
  - site-id
allowed_capabilities:
  - payload.create_draft
  - media.read_working
denied_capabilities:
  - payload.publish
  - database.raw_sql
  - secret.read_unscoped
expires_at: timestamp
budget_limit: amount-or-units
network_policy: approved-destinations
audit_required: true
```

The executor cannot expand its own envelope.

## 71. AI-agent security

AI agents are treated as probabilistic executors handling untrusted data.

Controls include:

- Minimal tools per Issue
- Sandboxed workspace
- No production secret in prompt or memory
- Structured inputs and outputs
- Schema validation
- Deterministic gates before side effects
- Explicit distinction between instructions and researched content
- Domain allowlists for sensitive tools
- Human or policy approval for high-risk actions
- Complete tool-call evidence
- Time, token, network, and cost limits
- No autonomous privilege escalation

An agent's textual claim that an action is safe is not an authorization decision.

## 72. Prompt-injection defense

Content from websites, social platforms, customer documents, repositories, issue comments, images, and emails may contain instructions aimed at an AI executor.

LiNKsites:

- Labels external content as data.
- Separates governing instructions from retrieved material.
- Does not allow source content to change tool permissions.
- Validates tool arguments outside the model.
- Restricts network and filesystem scope.
- Requires evidence for claims derived from sources.
- Blocks secret retrieval initiated only by untrusted content.
- Uses deterministic parsers and allowlists for high-risk fields.
- Escalates conflicting or suspicious instructions.

## 73. Capability broker

Privileged actions should be performed through narrow brokered APIs rather than handing agents root credentials.

Examples:

- `deploy_verified_release(release_id, vps_id)`
- `publish_approved_content(site_id, approval_id)`
- `rotate_named_secret(secret_record_id)`
- `create_custom_hostname(domain_record_id)`
- `restore_site_release(site_id, release_id)`

The broker verifies Issue state, authority, inputs, environment, budget, and idempotency before executing deterministic code.

## 74. OpenClaw security boundary

OpenClaw may:

- Review a security brief
- Coordinate an approved incident runbook
- Request a scoped capability for one Run
- Explain access or policy state to Carlos
- Present decisions requiring owner authority
- Track unresolved security work

OpenClaw must not:

- Hold universal standing credentials
- Receive every production secret
- Bypass Site ID policy
- Make websites depend on its availability
- Approve its own privilege expansion
- erase or rewrite security evidence

## 75. Security audit events

Events include:

- Login, logout, failure, recovery, and MFA changes
- Role and membership changes
- Service-identity creation and revocation
- Secret read, rotation, and failure where exposed
- Payload privileged operation
- RLS, grant, schema, or function change
- Domain and DNS authority change
- Deployment and rollback
- Content approval and publication
- Backup deletion or restore
- Break-glass use
- WAF or origin-policy change
- Security alert suppression
- Agent capability grant
- Export or bulk read of restricted data

## 76. Audit Event contract

```yaml
audit_event_id: aud_...
occurred_at: timestamp
actor_id: human-or-service-id
actor_type: human-service-agent
authentication_context: mfa-or-workload
action: payload.publish
resource_type: content-release
resource_id: release-id
site_id: site-id
environment: production
authority_ref: approval-or-runbook
issue_id: issue-id
run_id: run-id
result: allowed-and-completed
source_context: safe-network-reference
previous_state_digest: digest
new_state_digest: digest
correlation_id: correlation-id
```

Secret values and sensitive payload bodies are excluded.

## 77. Audit integrity

Audit records use append-oriented storage, limited mutation rights, off-host retention, time synchronization, and integrity verification. Operators who administer the target service should not automatically be able to erase all evidence of their actions.

Corrections append new events or annotations rather than silently changing history.

## 78. Data minimization

LiNKsites collects only data required to:

- Build and operate the site
- Fulfil customer requests
- Deliver form submissions
- Maintain security and reliability
- Process approved commercial events
- Produce necessary audit evidence

Lead-research and scraped data do not automatically enter permanent customer records. Generated copies are not retained merely because storage is inexpensive.

## 79. Retention profiles

Every data class references a Retention Profile defining:

- Business purpose
- Start event
- Active retention
- Archive behavior
- Deletion or anonymization trigger
- Legal or incident hold support
- Backup-expiry interaction
- Responsible owner
- Verification

Final periods are intentionally not set in this technical section. The architecture must support policy by site, data class, and jurisdiction where later required.

## 80. Deletion and anonymization

Deletion is a governed workflow across:

- PostgreSQL records
- Payload versions
- Supabase Storage or other object storage
- Search indexes
- Analytics and logs where applicable
- External integrations
- Caches
- Backups through retention expiry rather than unsafe surgical rewriting unless required and feasible

The system distinguishes:

- Logical deactivation
- Customer-visible deletion
- Operational retention
- Anonymization
- Backup expiry
- Legal or incident hold

Deletion authority and evidence are recorded.

## 81. Backup security

Section 16 backups use:

- Encryption
- Separate credentials
- Off-provider or separate-account copy
- Append-only or object-lock protection where supported
- Restricted restore rights
- Integrity checks
- Restore-test isolation
- Audit of retention deletion
- Independent recovery credentials

A production service should be able to create backups without automatically receiving permission to delete every historical recovery point.

## 82. Vulnerability management

LiNKsites maintains:

- Asset and version inventory
- Dependency and image scanning
- Provider and upstream security advisories
- Severity and exploitability evaluation
- Patch target by risk
- Tested emergency update path
- Compensating controls
- Evidence of remediation
- Verification after deployment

An automated scanner finding is triaged; it is neither ignored nor blindly allowed to deploy a breaking fix.

## 83. Security verification baseline

LiNKsites uses the current OWASP Application Security Verification Standard as a requirements and testing reference. ASVS Level 2 is the provisional target for the internet-facing multi-tenant application where applicable, with explicit higher-rigor requirements for secrets, administrative access, tenant isolation, and critical operations.

This is an engineering verification target, not a claim of certification.

## 84. Security testing

Required test families include:

- Authentication and session tests
- Role and permission tests
- Cross-Site ID read, write, update, delete, and publish tests
- Hostname confusion tests
- Cache cross-tenant tests
- Payload API and Local API access tests
- Supabase grants and RLS tests
- View and function privilege tests
- Storage read, write, replace, signed URL, and delete tests
- Form abuse and injection tests
- Webhook authentication and replay tests
- SSRF tests
- XSS and CSP tests
- CSRF tests where applicable
- Secret-scanning tests
- Container and network exposure tests
- Backup confidentiality and restore-access tests
- Agent prompt-injection and capability-escape tests

Negative tests prove that forbidden actions fail. A suite containing only successful authorized paths is incomplete.

## 85. Tenant-isolation test matrix

For at least two synthetic sites, tests attempt:

1. Site A hostname requesting Site B route or record ID.
2. Site A editor reading or modifying Site B draft.
3. Site A service key accessing Site B records.
4. Site A cache entry being served to Site B.
5. Site A media reference pointing to Site B object.
6. Site A form selecting Site B delivery profile.
7. Site A webhook accessing Site B integration.
8. Site A preview token opening Site B preview.
9. Site A analytics identifier appearing on Site B.
10. Site A restore or recycle operation targeting Site B.

Every path must deny, alert where material, and preserve evidence.

## 86. Security Gates

Security gates apply at:

- Component registration
- Vertical-kit release
- Site assembly
- Working-to-Payload promotion
- Preview deployment
- Customer launch
- Platform deployment
- Schema migration
- New integration
- New service identity
- Secret rotation
- Recovery and restore

A gate checks the requirements relevant to that action rather than running one superficial universal scanner.

## 87. Security monitoring

Section 16 monitoring includes:

- Authentication failures and impossible patterns
- Privilege and membership changes
- Unknown hostname traffic
- Cross-tenant denial events
- WAF events and rule anomalies
- Rate-limit and abuse events
- Secret-access anomalies
- Database permission errors and policy changes
- Bulk reads or exports
- Unusual object access
- Agent tool denials and capability expansion attempts
- Audit-log gaps
- Backup deletion attempts
- Origin-bypass attempts

Alerts are tuned so attack noise does not hide credible isolation failures.

## 88. Security incident containment

Candidate containment actions include:

- Disable one service identity
- Revoke or rotate one credential
- Suspend one customer integration
- Remove one site from public serving
- Block one hostname or route
- Open a WAF rule or challenge
- Disable publication while retaining public known-good content
- Quarantine one VPS
- Stop one executor class
- Freeze destructive operations
- Preserve logs and snapshots

Containment is scoped to reduce harm. A cross-tenant incident may require broader action than a single-site abuse event.

## 89. Credential-compromise response

The runbook:

1. Identify credential and allowed scope.
2. Revoke or disable it.
3. Stop or isolate dependent services if necessary.
4. Issue replacement through the secret manager.
5. Deploy to verified consumers.
6. Search audit and provider logs for use.
7. Determine affected Site IDs, data, and time window.
8. Rotate related credentials if dependency requires.
9. Verify service recovery.
10. Preserve evidence and create corrective Issues.

Secrets are never pasted into an incident chat or AI prompt during response.

## 90. Tenant-isolation incident response

If cross-tenant exposure or modification is suspected:

1. Treat it as SEV-0 until disproven.
2. Stop the affected route, cache, release, or service.
3. Preserve evidence.
4. Identify all potentially affected Site IDs and time range.
5. Check hostname resolution, query filters, RLS, Payload access, caches, storage paths, and release mapping.
6. Restore a known-good isolated state.
7. Verify with the complete tenant-isolation matrix.
8. Rotate credentials if their scope contributed.
9. Follow the later-approved notification and legal process.
10. Complete a post-incident review and architectural correction.

Temporary unavailability is preferable to knowingly serving the wrong customer's data.

## 91. Repository audit requirements

The engineering audit must determine:

1. Whether every tenant-owned schema and collection has Site ID.
2. Whether relational references enforce same-site ownership.
3. Whether hostname resolution fails closed.
4. Whether cache keys include Site ID, locale, release, and auth mode.
5. Whether preview responses can enter public caches.
6. Whether object paths and storage policies enforce Site ID.
7. Whether logs contain secrets or visitor payloads.
8. Which human roles and service identities exist.
9. Whether shared accounts or credentials are in use.
10. Whether privileged accounts require MFA.
11. How sessions are revoked.
12. Which Payload collections, globals, fields, and versions have access control.
13. Which Payload APIs are publicly reachable.
14. Where Payload Local API is used and whether `overrideAccess` is explicit.
15. Whether API keys belong to dedicated service accounts.
16. Whether the Supabase Data API is enabled.
17. Which schemas are exposed.
18. Which tables, sequences, views, and functions are granted to `anon`, `authenticated`, and service roles.
19. Whether RLS is enabled and tested on exposed objects.
20. Whether policies use a real tenant predicate rather than only `TO authenticated`.
21. Whether updates use both `USING` and `WITH CHECK`.
22. Whether user-editable metadata influences authorization.
23. Whether views bypass RLS.
24. Which `SECURITY DEFINER` functions exist, where, and who can execute them.
25. Whether default function execute grants remain open to `PUBLIC`.
26. Where Supabase secret/service-role keys are used.
27. Whether any secret key appears in browser code or `NEXT_PUBLIC_` variables.
28. Which direct PostgreSQL roles and connection strings exist.
29. Whether Supabase Storage buckets and policies isolate sites.
30. Whether a central secret manager already exists.
31. Whether secrets appear in repositories, issue trackers, logs, prompts, archives, or Docker Compose files.
32. Which secrets are unknown, unowned, or unrotated.
33. Whether CI uses long-lived cloud credentials.
34. Whether production and non-production secrets are separated.
35. Whether edge WAF and rate controls are configured and tuned.
36. Whether the origin can be reached around Cloudflare.
37. Whether Traefik admin surfaces or Docker socket are exposed.
38. Whether CSP and security headers are implemented per integration.
39. Whether server-side fetchers prevent SSRF.
40. Whether containers run with excess privilege.
41. Whether database, admin, and metrics ports are publicly exposed.
42. Whether dependency locks, image scans, SBOMs, and artifact digests exist.
43. Which agents and automations have production access.
44. Whether executor permissions are task-scoped and expiring.
45. Whether OpenClaw holds inappropriate universal secrets.
46. Whether security audit events are complete and protected.
47. Whether tenant-isolation negative tests exist.
48. Whether backup deletion and restore rights are separated.

Each item is reported as `implemented`, `partial`, `conflicting`, `obsolete`, `missing`, or `unknown`, with evidence and remediation priority.

## 92. Initial implementation sequence

### Phase 1 — Asset, identity, and exposure inventory

- Inventory services, domains, databases, schemas, buckets, identities, keys, ports, and provider accounts.
- Identify public surfaces and current tenant identifiers.
- Scan repositories and operational records for leaked secrets without reproducing them in reports.

### Phase 2 — Tenant isolation foundation

- Establish immutable Customer ID and Site ID.
- Add Site ID to every tenant-owned record.
- Add same-site relational constraints.
- Fix hostname resolution and cache namespaces.
- Build the cross-tenant negative test matrix.

### Phase 3 — Payload authorization

- Define human roles and service accounts.
- Implement collection, field, version, and operation access.
- Wrap privileged Local API use.
- Test public published reads and all cross-site denials.

### Phase 4 — Supabase/PostgreSQL boundary

- Audit exposed schemas and Data API settings.
- Disable unused Data API exposure or create a dedicated API schema.
- Revoke broad grants.
- implement and test RLS.
- Review views, functions, roles, Storage policies, and privileged keys.
- Run Supabase security advisors under the implementation workflow.

### Phase 5 — Secret management

- Select and deploy the secret manager.
- Import and classify secrets.
- Replace shared credentials with service identities.
- Remove secrets from code and files.
- Implement rotation, recovery, and audit.

### Phase 6 — Edge, origin, host, and container hardening

- Tune Cloudflare WAF and rate controls.
- Restrict origin bypass.
- Harden Traefik and admin surfaces.
- Apply CSP and headers.
- Harden VPS, containers, networks, and access.

### Phase 7 — Executor and supply-chain controls

- Implement capability broker and Run envelopes.
- Separate agent data from instructions.
- Pin builds, scan artifacts, and record digests.
- Protect CI/CD with short-lived identities.

### Phase 8 — Audit, monitoring, and exercises

- Implement security events and alerts.
- Exercise credential compromise and tenant-isolation incident response.
- Perform ASVS-based verification.
- Correct findings before customer launch.

## 93. Decisions intentionally still open

- Final human identity provider and SSO design
- Whether Payload-native authentication is sufficient for the initial admin group
- MFA implementation for Payload administration
- Whether any browser-facing Supabase Data API is needed
- Final Supabase project and schema topology
- OpenBao, Infisical, or managed secret-manager selection
- Origin-protection method
- Cloudflare WAF plan and rulesets
- Container runtime and exact socket-proxy design
- Vulnerability-scanning and SBOM tools
- Artifact-signing mechanism
- Customer portal timing and authentication
- Application-layer encryption fields
- Final data-retention and deletion periods
- External penetration-testing schedule
- Customer-facing security commitments

These choices do not prevent implementation of the shared invariants, deny-by-default model, tenant IDs, narrow interfaces, secret lifecycle, and negative tests.

## 94. Acceptance criteria

This part of LiNKsites is adequately implemented when:

1. Every tenant-owned record resolves to one immutable Site ID.
2. Cross-table references cannot silently connect different Site IDs.
3. Unknown or conflicting hostnames fail closed.
4. Public content requires correct Site ID, published status, and release.
5. Cache, storage, logs, analytics, forms, and integrations preserve tenant scope.
6. Automated tests prove Site A cannot read, change, publish, cache, restore, or deliver Site B data.
7. Human and service identities are unique and separately authorized.
8. Privileged human access uses MFA or an approved equivalent control.
9. High-risk operations require explicit authority and independent verification.
10. Break-glass use is restricted, alerted, audited, and reviewed.
11. Payload access control is explicit for collections, fields, operations, versions, and admin access.
12. Untrusted Payload Local API calls use access control rather than default bypass.
13. Browser clients do not receive Payload admin or Supabase secret/service-role credentials.
14. Supabase Data API exposure, schema list, grants, and default privileges are audited.
15. Every exposed Supabase table or view has appropriate grants and RLS.
16. RLS policies enforce ownership or Site ID, not authentication alone.
17. Views and `SECURITY DEFINER` functions are reviewed and tested.
18. Supabase Storage policies prevent cross-site read, upload, replace, and delete.
19. Ordinary applications do not use database-owner or superuser credentials.
20. A centralized secret manager controls production credentials.
21. Secrets do not appear in Git, CMS content, browser bundles, logs, prompts, or ordinary backups.
22. Secret creation, use, rotation, revocation, and recovery are auditable.
23. Production and non-production identities and data are separated.
24. Cloudflare WAF, rate controls, and origin restrictions are deployed and tested.
25. Traefik, admin APIs, database ports, metrics, and Docker access are not publicly exposed.
26. CSP and security headers are generated and verified against approved integrations.
27. External fetchers prevent SSRF and validate redirects.
28. Containers and VPSs follow a reproducible least-privilege baseline.
29. Dependency versions, lockfiles, images, and release digests are controlled.
30. AI agents receive issue-specific capability envelopes and no unrestricted production access.
31. Prompt-injection content cannot change executor authority.
32. OpenClaw can coordinate exceptions without holding universal credentials or becoming a runtime dependency.
33. Security-relevant actions produce protected Audit Events.
34. Security monitoring detects policy changes, credential anomalies, cross-tenant denials, and evidence gaps.
35. Credential-compromise and tenant-isolation incident runbooks are exercised.
36. Backup and restore security preserves encryption, separation, integrity, and auditability.
37. An OWASP ASVS-based verification process is part of release readiness.

## 95. Governing conclusion

LiNKsites can safely use shared infrastructure only if customer identity is explicit and enforced at every layer. The hostname resolves to one Site ID; application operations carry that Site ID; Payload access functions restrict documents and fields; PostgreSQL grants and RLS restrict objects and rows; relational constraints prevent cross-site references; cache keys and object paths preserve scope; and tests deliberately attempt to cross those boundaries.

The simplest secure initial Supabase model does not expose broad database access to public browsers. Forms and other writes pass through controlled server endpoints. Internal schemas remain private, Data API objects require deliberate grants, and RLS supplies defense in depth. Supabase secret or service-role keys remain server-side. Payload Local API bypass behavior is wrapped and audited rather than relied upon casually.

Secrets belong in a dedicated secret-management system and are delivered only to named services. Human, service, agent, and OpenClaw identities remain distinct. Executors receive narrow, expiring capability envelopes, while high-risk effects pass through deterministic brokers and authority gates. Cloudflare, Traefik, Next.js, hosts, containers, and CI/CD each contribute controls without being treated as the single security boundary.

Security is verified through negative tests, protected audit evidence, restore-aware data controls, and exercised incident runbooks. OpenClaw can help Carlos understand and coordinate an exception, but it cannot bypass tenant policy, grant itself privilege, or become the system's universal secret holder.

## 96. Primary technical references

- [Supabase secure product configuration](https://supabase.com/docs/guides/security/product-security)
- [Supabase: securing the Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase 2026 Data API exposure change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
- [Supabase API key changes](https://supabase.com/changelog/29260-upcoming-changes-to-supabase-api-keys)
- [Payload access control](https://payloadcms.com/docs/access-control/overview)
- [Payload collection access control](https://payloadcms.com/docs/access-control/collections)
- [Payload authentication overview](https://payloadcms.com/docs/authentication/overview)
- [Payload API key strategy](https://payloadcms.com/docs/authentication/api-keys)
- [Next.js data security](https://nextjs.org/docs/app/guides/data-security)
- [Next.js Content Security Policy](https://nextjs.org/docs/app/guides/content-security-policy)
- [Cloudflare Web Application Firewall](https://developers.cloudflare.com/waf/)
- [Cloudflare managed WAF rules](https://developers.cloudflare.com/waf/managed-rules/)
- [Docker Compose secrets](https://docs.docker.com/compose/how-tos/use-secrets/)
- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

**End of Section 18**
