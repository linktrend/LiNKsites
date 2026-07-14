# LiNKsites Program Manual

## Section 15 — Hosting Topology, Frontend Runtime, Cloudflare, Traefik, and Regional Scaling

**Document set:** LiNKsites Program Manual  
**Section:** 15 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, LiNKsites product and engineering agents, infrastructure and platform agents, frontend implementers, Cloudflare and Traefik operators, repository auditors, security and QA agents, capacity planners, OpenClaw oversight designers, and future human collaborators  

---

## 1. Purpose of this section

This section defines how LiNKsites hosts many customer websites on shared frontend VPS capacity while preserving independent domains, content, releases, analytics, and operational state.

It establishes:

- The initial centralized-control and distributed-frontend topology
- The role of the shared Next.js frontend platform
- The role of Cloudflare at the public edge
- The role of Traefik at each VPS origin
- Hostname-to-site resolution
- Site placement and capacity management
- Initial non-regional placement
- Later regional bundling
- Release, migration, failover, and rollback patterns
- The autonomy boundary and OpenClaw oversight role

This section does not set a permanent number of sites per VPS. It defines how that number will be measured and controlled.

## 2. Direct answers to the hosting questions

### 2.1 Is the system shared?

Yes. Standard LiNKsites customers normally share a governed frontend platform and shared VPS capacity. They retain isolated site identity, content, assets, domain, analytics, forms, entitlement, and operational records.

### 2.2 Does each site have its own frontend codebase?

Normally no. A VPS runs one approved frontend platform release, potentially with multiple identical runtime replicas. The platform resolves the incoming hostname to the correct Site Assignment and renders that site's published content and design manifest.

### 2.3 Does each VPS have its own Payload or PostgreSQL database?

No, not initially. Regional frontends use the central Payload published-content plane defined in Section 12 plus controlled caching or release artifacts. Moving a site between VPS deployments does not move its authoritative database.

### 2.4 Are “locales” the sales markets?

No. Hosting regions describe where VPS frontend capacity is located. They do not define every place where LiNKsites may sell, and they are separate from website language locales.

### 2.5 Is the estimate of 20 sites per VPS a fixed limit?

No. That number was an AI-generated planning estimate based on assumed site and server characteristics. It must be replaced by load tests and production measurements. A VPS may safely host fewer or more sites depending on size, traffic, rendering mode, media, cache hit rate, integrations, and resource class.

## 3. Governing doctrine

1. **Shared code, scoped data.** Sites share the platform but never share unscoped customer data.
2. **Central content authority, regional delivery.** Payload published content remains centralized initially; frontends and caches may be distributed.
3. **Hostname is a primary site identity input.** The origin resolves a validated host to a Site Assignment; it does not trust arbitrary browser-supplied tenant identifiers.
4. **Cloudflare and Traefik have different roles.** Cloudflare is the public edge; Traefik is the origin reverse proxy and service router.
5. **The application is not exposed directly.** The frontend runtime sits behind an origin reverse proxy.
6. **Capacity is multidimensional.** Customer count alone does not determine saturation.
7. **Regional placement begins when justified.** Early customers may share the first available VPS regardless of their region. Later cohorts are grouped by region when scale and density justify it.
8. **Site migration is a routine lifecycle.** It changes frontend placement, not content authority or customer identity.
9. **Infrastructure is declarative and reproducible.** Every VPS, route, service, and assignment has desired state, version, and verification.
10. **OpenClaw oversees exceptions, not packet flow.** Public websites remain available without OpenClaw.

## 4. Target logical topology

```text
Website visitor
      ↓
Cloudflare DNS and proxied edge
      ↓
Selected regional VPS origin
      ↓
Traefik router and middleware
      ↓
Shared LiNKsites frontend runtime replicas
      ↓
Published-content cache or central Payload API
      ↓
Central Payload PostgreSQL authority
```

Separate internal paths manage:

- Deployments
- Site Assignment changes
- Revalidation
- Monitoring
- Secrets
- Backups
- Incident actions

## 5. Control plane versus serving plane

### 5.1 Control plane

The control plane manages desired state:

- VPS and region registry
- Runtime cluster records
- Site Assignments
- Domain and route configuration
- Platform releases
- Capacity and placement
- Deployment plans
- Migration plans
- Monitoring and backup profiles
- Incidents and exceptions

### 5.2 Serving plane

The serving plane handles visitor traffic:

- Cloudflare edge
- VPS network boundary
- Traefik
- Frontend runtime
- Published-content cache
- Public media

The serving plane uses approved snapshots of control-plane state. It must not require a live orchestration-agent decision for every request.

## 6. Site Assignment

A **Site Assignment** identifies where and how one website is served.

```yaml
site_assignment_id: stable-id
site_id: customer-or-preview-site-id
state: planned-provisioning-active-migrating-draining-other
site_class: customer-or-preview
hostnames: []
primary_hostname: hostname
frontend_region_id: region-id
vps_id: vps-id
runtime_cluster_id: cluster-id
hosting_class: shared-or-dedicated
platform_release_id: release-id
site_assembly_manifest_id: manifest-version
published_content_release_id: release-id
route_configuration_id: route-version
cloudflare_configuration_refs: []
traefik_configuration_ref: config-version
capacity_allocation_id: allocation-id
monitoring_profile_id: profile-id
backup_recovery_profile_id: profile-id
activated_at: timestamp
supersedes: optional-assignment
```

The Site Assignment is not stored only in Traefik labels or DNS records. Those are deployed projections of the governed assignment.

## 7. Hostname resolution

The serving path should resolve a request in this order:

1. Cloudflare receives a request for an authorized hostname.
2. Cloudflare routes the request to the assigned origin according to the active DNS and proxy configuration.
3. Traefik matches the hostname and entry point to an approved router.
4. Traefik applies registered middleware and forwards to the correct frontend service.
5. The frontend validates the effective host against its local Site Assignment snapshot.
6. The frontend resolves the Site ID, manifest, content release, and locale behavior.
7. The response includes release and observability context without exposing internal identifiers unnecessarily.

Unknown hostnames fail closed. They must not render the first customer, a default tenant, or a random cached site.

## 8. Shared frontend runtime

The intended frontend platform is provisionally based on Next.js and React, subject to repository audit.

The shared runtime owns:

- Host-to-site resolution
- Route and page rendering
- Payload published-content retrieval
- Site Design Profile and token application
- Component Registry rendering
- Metadata and structured data
- Locale routing
- Forms and registered integrations
- Analytics emission
- Cache and revalidation behavior
- Error handling
- Release identification

Customer-specific content and configuration remain data. Routine customer fulfilment does not create a new application fork.

## 9. Frontend runtime replicas

A VPS may initially run one frontend runtime instance. It may later run multiple identical replicas when workload or availability justifies it.

Replicas must share:

- Platform release
- Site Assignment snapshot
- Required encryption or signing configuration
- Content-release resolution
- Cache-coordination strategy
- Observability schema
- Secret references

Multiple instances introduce cache and state-coordination issues. The implementation must follow the exact installed Next.js version's self-hosting guidance and test multi-instance behavior.

## 10. Stateless request handling

The frontend should remain stateless for ordinary website requests where practical.

Do not depend on:

- Local in-memory customer session for public content identity
- One particular replica receiving every request
- Unreplicated local files as the only content copy
- Per-site runtime mutation
- Agent memory

Stateful requirements such as rate limiting, form idempotency, preview authorization, or session data should use an explicit shared service or appropriately sticky and recoverable design.

## 11. Reverse proxy requirement

Current Next.js self-hosting guidance recommends placing a reverse proxy in front of the application rather than exposing the Next.js server directly. The reverse proxy can handle request validation and network concerns while the application focuses on rendering.

LiNKsites assigns this origin role to Traefik. See the current [Next.js self-hosting guide](https://nextjs.org/docs/app/guides/self-hosting).

## 12. Traefik role

Traefik is the VPS-local reverse proxy and routing layer.

It should own or project:

- HTTP and HTTPS entry points
- Host-based routers
- TLS behavior at the origin boundary
- Registered middleware
- Frontend services
- Load balancing across local replicas
- Health checks
- Controlled redirects
- Request limits and timeouts appropriate to the origin
- Access logs and routing metrics

Traefik does not own:

- Customer content
- Product entitlement
- Site design
- Payload publication
- Commercial domain authority
- Global placement policy

See the current Traefik documentation for [HTTP routers](https://doc.traefik.io/traefik/reference/routing-configuration/http/routing/router/) and [HTTP services and load balancing](https://doc.traefik.io/traefik/reference/routing-configuration/http/load-balancing/service/).

## 13. Traefik router contract

Each deployed site or hostname group should have a logical router contract containing:

- Router ID
- Host rule
- Entry point
- TLS profile
- Middleware chain
- Target service
- Rule priority where needed
- Site Assignment reference
- Configuration version
- Activation and rollback state

Dynamic configuration may be generated through a supported provider such as container labels or file configuration. The control-plane record remains authoritative.

## 14. Traefik services

A Traefik service represents one or more frontend runtime endpoints.

The service contract includes:

- Runtime cluster and platform release
- Endpoint set
- Load-balancing method
- Health-check path and expected response
- Pass-host-header behavior
- Timeouts
- Draining state
- Observability tags

Health checks must verify more than an open TCP port. They should establish that the runtime can identify its release and perform the minimum serving behavior required by the deployment profile.

## 15. Middleware policy

Middlewares should be reusable, versioned policies for concerns such as:

- HTTP-to-HTTPS redirect
- Security headers
- Request-size limits
- Compression where appropriate
- Rate or abuse controls
- Maintenance mode
- Preview access
- Origin authentication or source validation
- Canonical hostname redirects

Middleware order matters and must be tested. Customer-specific arbitrary middleware is not permitted outside a registered exception.

## 16. Cloudflare role

Cloudflare is the intended public DNS and edge layer for web traffic.

For proxied web records, Cloudflare sits between visitors and the origin and can apply caching, protection, redirects, and other edge configuration. DNS-only records expose the origin directly and do not receive the same HTTP proxy behavior.

LiNKsites uses Cloudflare for policy-selected functions such as:

- DNS for customer web hostnames
- HTTP/HTTPS proxying
- Edge TLS
- CDN caching
- DDoS protection
- WAF or rate controls where configured
- Redirects
- Cache invalidation
- Edge analytics and logs

See Cloudflare's current [DNS proxy-status documentation](https://developers.cloudflare.com/dns/proxy-status/).

## 17. Cloudflare is not the origin router

Cloudflare determines how public traffic reaches the assigned origin and applies edge policy. Traefik determines how traffic is routed inside that origin VPS.

The layers remain independent:

| Layer | Primary routing key | Responsibility |
|---|---|---|
| Cloudflare | Public DNS hostname and edge policy | Visitor-to-origin delivery |
| Traefik | Origin host rule and entry point | Origin-to-frontend-service delivery |
| Frontend | Validated effective host and site registry | Site and content rendering |

All three must agree. A mismatch is a configuration incident.

## 18. Origin protection

The origin should be configured so visitors cannot bypass important Cloudflare controls merely by discovering the VPS address.

Controls may include:

- Network rules limiting public origin access
- Authenticated origin requests
- Origin TLS
- Host allowlists
- No default catch-all customer response
- Non-public management interfaces
- Separate management network or access path
- Regular verification of exposed ports

The exact Cloudflare-origin authentication and firewall mechanism is selected during infrastructure implementation.

## 19. TLS layers

The topology has two encrypted relationships:

- Visitor to Cloudflare edge
- Cloudflare to Traefik/origin

Both should use valid, policy-approved TLS. Edge TLS does not justify an unencrypted or unverified origin connection.

Certificate issuance, renewal, domain validation, and failure handling are defined in Section 17.

## 20. Cache hierarchy

LiNKsites may use:

- Browser cache
- Cloudflare edge cache
- Traefik or origin-layer behavior where justified
- Next.js runtime or data cache
- Published-content release cache
- Object-storage/CDN cache

Every cache must define:

- Key
- Site and hostname boundary
- Locale boundary
- Content or platform release boundary
- Eligible response types
- Time to live
- Invalidation trigger
- Stale-serving behavior
- Privacy and authorization behavior

Caching without site-aware keys can serve one customer's content to another and is a critical isolation risk.

## 21. Cache policy by content class

### 21.1 Immutable versioned assets

Hashed platform and media derivatives can normally receive long-lived cache behavior because a changed asset receives a new URL or version.

### 21.2 Published public pages

May be cached according to the site's rendering and freshness policy. Publication must trigger targeted invalidation or revalidation.

### 21.3 Draft and preview content

Must not enter a shared public cache that could expose drafts or cross prospects. Access, cookie, token, and host behavior must be validated.

### 21.4 Dynamic or user-specific responses

Must be excluded or carefully varied according to explicit policy.

Cloudflare does not cache all HTML automatically under every configuration. Cache rules and origin headers must be designed and verified against the current service behavior. See [Cloudflare default cache behavior](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/).

## 22. Cache invalidation

A content or platform release may trigger invalidation by:

- Site or hostname
- Route
- Prefix
- Cache tag
- Versioned key
- Complete site release switch

Purging everything for every customer update is simple but may create unnecessary origin load and hide poor key design. Targeted invalidation is preferred when reliable.

Every invalidation has request, result, release, and serving verification records.

## 23. Multi-instance Next.js caching

When multiple frontend instances serve the same sites, local runtime caches can diverge.

LiNKsites must use one tested strategy, such as:

- Versioned published-content artifacts with immutable release selection
- A shared cache handler or backing store supported by the installed framework
- Coordinated revalidation and release switching
- Minimal local caching with Cloudflare carrying appropriate public caching

The repository audit and load test must prove the chosen behavior. A successful update on one replica does not prove that all replicas serve the same content release.

## 24. Runtime packaging

The frontend platform, Traefik configuration, and supporting agents should be packaged reproducibly.

The initial implementation may use containers and a simple orchestrator appropriate to a small number of VPS hosts. Kubernetes or another large cluster manager is not required merely to appear scalable.

Required properties are:

- Pinned images or packages
- Immutable release IDs
- Environment and secret references
- Health checks
- Resource limits
- Restart policy
- Log collection
- Declarative configuration
- Rollback
- Rebuild from source and manifests

The repository audit determines which existing container and deployment work is usable.

## 25. Platform release deployment

A deployment should follow:

1. Build and test the platform release once.
2. Produce a signed or checksummed artifact.
3. Select target VPS/runtime clusters.
4. Verify capacity and compatibility.
5. Deploy a new runtime replica set.
6. Run health and representative multi-site tests.
7. Shift Traefik traffic to the new service.
8. Verify real site releases.
9. Drain the old service.
10. Retain the rollback target for the defined period.

Site content does not need to be republished solely because the runtime release changes, unless compatibility requires migration.

## 26. Blue/green or equivalent release switching

The platform should support two release slots or an equivalent atomic switching method:

- Current active release
- Candidate release

Traefik changes traffic only after the candidate passes health and site-level smoke checks. Rollback returns traffic to the prior service without reconstructing it during the incident.

The exact deployment technique may evolve, but partial in-place mutation without a known-good rollback should not be the normal path.

## 27. VPS record

```yaml
vps_id: stable-id
provider_ref: provider-reference
region_id: region-id
state: planned-provisioning-active-draining-maintenance-retired
resource_class:
  cpu: capacity
  memory: capacity
  storage: capacity
  network: capacity
runtime_cluster_refs: []
traefik_release_id: release-id
platform_release_ids: []
site_assignment_ids: []
capacity_policy_id: policy-id
monitoring_profile_id: profile-id
backup_profile_id: profile-id
security_baseline_id: baseline-id
created_at: timestamp
last_verified_at: timestamp
```

Provider-specific details remain behind an infrastructure adapter where practical.

## 28. Capacity is multidimensional

Measure at least:

- CPU utilization and saturation
- Memory working set and pressure
- Storage capacity and I/O
- Network throughput and connections
- Request rate and concurrency
- Response latency
- Error and timeout rate
- Cache hit and miss rate
- Next.js render and revalidation workload
- Image optimization workload
- Background tasks
- Build and deployment headroom
- Traffic concentration on one site
- Incident recovery headroom

Twenty quiet static SMB sites are not equivalent to twenty high-traffic, media-heavy, dynamically rendered sites.

## 29. Capacity unit and site weight

The placement system should assign a measured **site weight** or resource profile instead of counting every site equally.

Possible dimensions include:

- Baseline memory allocation
- Typical and peak requests
- Dynamic render share
- Media and image-processing demand
- Integration traffic
- Geographic traffic distribution
- Scheduled content work
- Tier and dedicated-resource entitlement
- Growth trend

The model begins conservatively and is recalibrated with observed resource usage.

## 30. Headroom policy

A VPS should not be filled to average observed maximum.

Reserve headroom for:

- Traffic spikes
- One noisy site
- Platform release overlap
- Cache cold starts
- Revalidation
- Monitoring and backup work
- Failover or temporary reassignment
- Incident diagnostics

Placement thresholds have warning, stop-placement, scale-out, and emergency states. Exact percentages require load testing.

## 31. Initial placement phase

At launch, LiNKsites may operate one shared frontend VPS and place early customers there regardless of their home region.

The objectives are:

- Prove the platform
- Measure real site weight
- Validate multi-tenancy
- Validate monitoring and recovery
- Understand traffic patterns
- Avoid premature infrastructure fragmentation

The first additional VPS may be opened when the original approaches its safe capacity or when reliability requires a second failure domain.

## 32. Transitional scaling phase

When an existing VPS approaches its stop-placement threshold:

- Open another VPS in a region that best supports the next meaningful customer cohort and operational plan.
- Place new compatible customers from that region there where practical.
- Do not migrate every existing site immediately merely to create geographic neatness.
- Continue measuring latency, cost, reliability, and operational burden.

Capacity and customer distribution determine the sequence.

## 33. Regional bundling phase

Once LiNKsites has approximately 60–80 customers, the intended posture is to establish a clearer VPS presence in each justified customer region and bundle sites according to region for speed and operational organization.

The 60–80 range is a business planning trigger, not an automatic infrastructure command. Before opening a region, verify:

- Sufficient customer and traffic density
- Measurable latency benefit
- Provider and support availability
- Operating cost
- Backup and monitoring coverage
- Failover strategy
- Data and content connectivity
- Migration capacity

Some customers may remain on an earlier VPS until a safe maintenance or migration window.

## 34. Region definition

A hosting region record includes:

- Region ID and provider location
- Intended customer geography
- Network-latency profile
- Available VPS classes
- Operational support and maintenance constraints
- Failover relationships
- Payload and object-storage connectivity
- Compliance or data-residency classification where applicable
- Cost profile

Region is not inferred from website language. A Traditional Chinese site may serve visitors worldwide; placement follows actual customer/visitor and operational evidence.

## 35. Placement engine

The placement engine applies hard filters:

- Hosting class and tier
- Region eligibility
- Current VPS state
- Platform release compatibility
- Available capacity and headroom
- Required integration connectivity
- Security and isolation requirements
- Maintenance or incident state

It then ranks by:

- Visitor latency
- Customer geography
- Capacity balance
- Cost
- Failure-domain distribution
- Migration burden
- Existing customer cohort
- Operational simplicity

The result is a Placement Proposal with reasons and alternates.

## 36. Noisy-neighbor control

Shared hosting must prevent one site from materially degrading others.

Controls may include:

- Per-site or per-route rate limits
- Resource and request budgets
- Cache controls
- Timeouts
- Background-job isolation
- Media-processing separation
- Alerting on site-level usage
- Automatic restriction of abusive or failed integrations under policy
- Migration to a larger or dedicated hosting class

The system should identify the site causing pressure rather than report only VPS-wide CPU.

## 37. Dedicated hosting

Premium or Enterprise policy may permit dedicated frontend allocation when commercially justified.

Dedicated does not automatically imply a separate Payload database. It may mean:

- Dedicated runtime service
- Dedicated VPS
- Dedicated region or failure domain
- Higher resource and service profile

CMS/database isolation is a separate architecture and entitlement decision.

## 38. Site migration

A migration changes Site Assignment.

```text
migration_planned
→ target_provisioned
→ target_release_deployed
→ content_and_config_verified
→ cache_warmed where appropriate
→ edge_route_changed
→ production_verified
→ source_draining
→ source_released
```

The site keeps its Customer Site ID, Payload identity, published release, and domain.

## 39. Migration contract

The contract should contain:

- Site ID
- Source and target VPS/region
- Reason
- Platform and content release
- Capacity receipts
- DNS/Cloudflare change plan
- Traefik target configuration
- Cache and warmup plan
- Validation suite
- Rollback plan
- Maintenance or no-downtime expectation
- Authorized window
- Completion evidence

## 40. Migration verification

Verify:

- Correct host and customer content
- TLS
- Routes and redirects
- Forms and integrations
- Analytics
- Cache keys
- Performance and latency
- Payload connectivity
- Monitoring
- No traffic reaching the drained origin after the expected transition period

Migration completion is not inferred solely from a changed DNS record.

## 41. Failure domains

The topology should identify failure domains:

- Cloudflare account or zone
- DNS configuration
- VPS
- Provider region
- Traefik
- Frontend platform release
- Central Payload service
- Payload database
- Object storage
- Deployment control plane

The system distinguishes edge, origin, application, content, and database incidents. A regional frontend failure must not corrupt central content.

## 42. VPS failure behavior

For an unhealthy VPS:

1. Stop new placements and deployments.
2. Confirm failure through multiple signals.
3. Preserve diagnostic evidence.
4. Route or fail over eligible sites according to recovery policy.
5. Verify target capacity and release compatibility.
6. Update Cloudflare/origin routing.
7. Validate critical sites.
8. Repair, rebuild, or retire the VPS.

The detailed autonomous recovery process appears in Section 16.

## 43. Central Payload connectivity

Frontends should not open uncontrolled database connections. They access Payload through the selected supported interface or published-content cache.

Connectivity policy defines:

- Endpoint
- Authentication
- Timeouts
- Retry
- Circuit breaking
- Cache fallback
- Release identity
- Health checks
- Observability

An unavailable CMS should not remove already valid cached/static pages unnecessarily.

## 44. Media delivery

Public media should normally be delivered from governed object storage and CDN-compatible URLs rather than copied manually onto every VPS.

The frontend manifest identifies exact asset versions. Cloudflare or another CDN may cache public derivatives.

Private source and preview media require separate access policies and cache behavior.

## 45. Configuration reconciliation

An autonomous reconciler should compare desired and observed state for:

- VPS existence and health
- Traefik configuration
- Runtime release
- Site Assignments
- Cloudflare records and proxy state
- Routes and TLS
- Capacity allocations
- Monitoring agents
- Backup agents

Drift produces a corrective Issue or automatic remediation within policy. The reconciler does not overwrite an active emergency change without recognizing its authority and expiry.

## 46. Secrets and management access

Each VPS should receive only the secrets required for its assigned services.

Controls include:

- No secrets embedded in container images or repositories
- Separate deployment and runtime identities
- Restricted management access
- Rotatable credentials
- Audited changes
- No shared root credential across all VPS hosts where avoidable
- No public Traefik dashboard or management endpoint
- Removal of credentials when a VPS is retired

Detailed security controls are defined in Section 18.

## 47. Observability

Observe at Cloudflare, Traefik, runtime, site, and content-release levels.

Required dimensions include:

- Requests and bandwidth
- Status codes
- Origin latency
- Cache hit ratio
- Traefik router and service health
- Frontend render latency and errors
- Site-level availability
- Content-release identity
- CPU, memory, disk, and network
- Deployment and migration events
- TLS state
- Unknown-host requests
- Cross-site mismatch alarms

Metrics should allow Carlos or OpenClaw to answer which customers are affected, not only which server is unhealthy.

## 48. Autonomous hosting operations

Routine actions should be autonomous:

- Provision a standardized VPS
- Install the security and runtime baseline
- Deploy Traefik and frontend releases
- Reconcile routes
- Place sites
- Track capacity
- Stop placement at thresholds
- Open scale-out requests
- Deploy updates
- Migrate sites
- Drain services
- Detect and remediate common drift

Irreversible provider actions, ambiguous domain authority, large migrations, and high-risk incident decisions follow explicit authority policy.

## 49. OpenClaw role

OpenClaw may:

- Summarize capacity and health
- Present a proposed new region or VPS
- Investigate drift and failed deployments
- Approve or execute delegated migrations
- Help Carlos respond to an incident
- Explain resource usage in plain language
- Coordinate exception recovery

OpenClaw is not the reverse proxy, load balancer, placement database, health checker, or request-time tenant resolver.

## 50. Cost model

Track by VPS, region, site, and hosting class:

- Compute
- Storage
- Network and bandwidth
- Cloudflare services
- Backup storage
- Monitoring and logging
- Payload/API egress where relevant
- Deployment and maintenance compute
- Intervention
- Migration
- Idle headroom
- Dedicated-resource premium

Allocation may use measured site weight rather than equal division by customer count.

## 51. Repository audit questions

The later audit must determine:

1. Whether one shared frontend platform truly exists or sites are separate repositories.
2. Which Next.js version, router model, build mode, cache behavior, and runtime packaging are current.
3. How hostnames resolve to site identities.
4. Whether an unknown host can expose a default customer.
5. Whether Traefik is installed and how routers, middleware, TLS, services, and health checks are defined.
6. Whether Traefik configuration has a governed source of truth.
7. Whether Cloudflare zones, DNS, proxy status, cache rules, and credentials are managed reproducibly.
8. Whether origins can be bypassed directly.
9. Whether cache keys include hostname, locale, authorization, and release boundaries.
10. Whether multiple Next.js replicas coordinate cache and required encryption/signing configuration.
11. Whether public frontends use Payload APIs/caches rather than working tables or database connections.
12. Whether sites have explicit Site Assignments.
13. Whether capacity is measured or the 20-site estimate is hard-coded.
14. Whether site-level resource usage and noisy neighbors are observable.
15. Whether deployments support health checks and rollback.
16. Whether site migrations preserve content identity and verify edge traffic.
17. Whether regional placement is confused with language or sales market.
18. Whether management endpoints and secrets are exposed.
19. Whether OpenClaw is a runtime dependency.
20. Which infrastructure code, container files, scripts, and dashboards can be retained or must be replaced.

## 52. Initial implementation sequence

1. Audit current frontend, VPS, Docker/container, Traefik, Cloudflare, and deployment assets.
2. Define canonical Region, VPS, Runtime Cluster, Site Assignment, Route, Capacity Allocation, and Migration schemas.
3. Produce one hardened reproducible VPS baseline.
4. Deploy Traefik and one shared frontend runtime behind it.
5. Implement strict hostname-to-site resolution and unknown-host failure.
6. Connect to central Payload published content and release cache.
7. Configure Cloudflare edge, origin TLS, and origin-protection policy.
8. Define site-safe cache keys and targeted invalidation.
9. Implement health, deployment, rollback, and configuration reconciliation.
10. Load test representative Standard, Premium, media-heavy, dynamic, and traffic-spike profiles.
11. Replace the 20-site estimate with a measured capacity policy.
12. Prove several isolated customer sites on one VPS.
13. Prove a blue/green platform release and rollback.
14. Prove a site migration to a second VPS without moving Payload data.
15. Add regional placement only when the customer and traffic evidence justifies it.

## 53. Decisions intentionally still open

This section does not finalize:

- VPS provider
- Initial VPS size
- Safe sites-per-VPS count
- Exact CPU, memory, disk, and traffic thresholds
- Initial VPS region
- Exact customer count or density for each later region
- Container orchestration tooling
- Next.js rendering and shared-cache implementation
- Cloudflare plan and optional products
- Origin-authentication method
- Exact Traefik provider and configuration layout
- Failover automation and spare-capacity targets
- Dedicated-hosting prices
- Maintenance windows
- Data-residency commitments

These are deployment, commercial, and operational decisions to resolve through repository audit, load testing, pilots, and measured production behavior.

## 54. Acceptance criteria

This part of LiNKsites is adequately defined and implemented when:

1. Cloudflare, Traefik, frontend runtime, Payload, and PostgreSQL have distinct documented roles.
2. Customer web traffic reaches the application through Cloudflare and Traefik according to policy rather than exposing Next.js directly.
3. Hostname resolution fails closed for unknown or conflicting domains.
4. Many customer sites can share one frontend platform release without sharing unscoped data.
5. Site Assignment, route, runtime, content release, and platform release are versioned and attributable.
6. No frontend VPS contains its own authoritative Payload database merely because it serves a region.
7. Cache keys and invalidation preserve hostname, site, locale, authorization, and release boundaries.
8. Draft and preview content cannot enter public customer caches.
9. Multiple runtime replicas serve consistent releases and use a tested cache-coordination strategy.
10. Traefik routers, middleware, services, health checks, and TLS configuration are generated from governed desired state.
11. Cloudflare DNS and proxy configuration is reproducible and verifiable.
12. Direct-origin bypass is controlled according to security policy.
13. Platform releases support candidate health checks, controlled traffic switching, draining, and rollback.
14. Capacity is measured across CPU, memory, storage, network, request, cache, rendering, and headroom dimensions.
15. The 20-sites-per-VPS figure is treated as an estimate until replaced by measurement.
16. Early customers may share the initial VPS regardless of customer region.
17. Later VPS additions favor useful regional cohorts as existing capacity fills.
18. Around 60–80 customers, regional bundling is evaluated and implemented only where density and benefit justify it.
19. A site can move between VPS regions without changing its Payload content authority or Customer Site ID.
20. Site-level usage and noisy-neighbor effects are observable and controllable.
21. Routine provisioning, placement, deployment, migration, and drift correction can operate autonomously.
22. OpenClaw assists the solo owner without becoming part of live request serving.

## 55. Governing conclusion

LiNKsites should scale website delivery independently from content authority. One central Payload content plane can feed multiple shared frontend VPS deployments, while Cloudflare brings traffic to the correct origin, Traefik routes it to the correct local runtime service, and the frontend resolves the hostname to the correct site and published release.

The first customers should use a simple shared deployment so LiNKsites can measure real behavior. The system should not create artificial regional complexity before it has customers and traffic. As each VPS approaches measured safe capacity, LiNKsites adds capacity, increasingly choosing regions that serve the next customer cohorts well. At approximately 60–80 customers, the business intends to operate clearer regional bundles where evidence supports them.

The architecture does not assume that 20 sites always fit on a VPS. It measures resource pressure, cache effectiveness, traffic, rendering cost, headroom, and noisy neighbors. Sites receive explicit assignments, deployments are reproducible and reversible, caches remain tenant-safe, and migration changes only frontend placement. OpenClaw can help Carlos understand and oversee the system, but every website continues to route and serve through deterministic infrastructure when OpenClaw is unavailable.

## 56. Primary technical references

- [Next.js self-hosting guide](https://nextjs.org/docs/app/guides/self-hosting)
- [Cloudflare DNS proxy status](https://developers.cloudflare.com/dns/proxy-status/)
- [Cloudflare default cache behavior](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)
- [Traefik HTTP routers](https://doc.traefik.io/traefik/reference/routing-configuration/http/routing/router/)
- [Traefik HTTP services and load balancing](https://doc.traefik.io/traefik/reference/routing-configuration/http/load-balancing/service/)

---

**End of Section 15**
