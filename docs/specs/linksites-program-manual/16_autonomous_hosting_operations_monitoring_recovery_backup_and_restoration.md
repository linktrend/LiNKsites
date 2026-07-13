# LiNKsites Program Manual

## Section 16 — Autonomous Hosting Operations, Monitoring, Recovery, Backup, and Restoration

**Document set:** LiNKsites Program Manual  
**Section:** 16 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, LiNKsites product and engineering agents, infrastructure and reliability agents, database and storage operators, repository auditors, OpenClaw oversight designers, and future human collaborators  

---

## 1. Purpose of this section

This section defines how LiNKsites keeps active customer websites available, detects degradation, contains failures, protects recoverable state, restores service, and learns from operational events with as little routine human involvement as safely possible.

It covers:

- Continuous monitoring of customer sites and shared infrastructure
- Metrics, logs, traces, synthetic checks, and operational events
- Alert evaluation, routing, deduplication, and escalation
- Autonomous diagnosis and allowlisted remediation
- Incident state, runbooks, recovery, and post-incident work
- Backups for PostgreSQL, Supabase Storage or other object storage, Payload media, platform configuration, and essential VPS state
- Recovery-point and recovery-time objectives
- Backup verification and restoration testing
- Site-level, VPS-level, content-plane, and provider-level recovery
- The boundary between deterministic automation, AI assistance, OpenClaw, and Carlos

This section does not define general security controls, customer domain onboarding, or every quality test. Those are covered in Sections 17–19. It defines the operational controls needed to keep the hosting service working and recoverable.

## 2. Direct answers

### 2.1 Is LiNKsites hosting autonomous?

It must be autonomous for routine, repeatable, reversible operations. The system should detect common failures, collect evidence, execute approved recovery actions, verify the result, and close or escalate the incident without waiting for Carlos.

Autonomy does not mean that every possible failure is handed to an AI agent with unrestricted server access. It means that known conditions have deterministic monitors, policies, runbooks, authority limits, and safe executors.

### 2.2 Does OpenClaw run the monitoring system?

No. Monitoring, alerting, backups, and recovery schedules continue when OpenClaw is unavailable.

OpenClaw may:

- Explain an incident in plain English
- Coordinate an approved runbook
- Ask Carlos for a decision when authority is required
- Track unresolved exceptions
- Compare proposed actions with operating policy
- Help verify that an incident is actually resolved

OpenClaw is an external supervisory operator, not a component in the customer-request path or a prerequisite for automated remediation.

### 2.3 Is a VPS snapshot a sufficient backup?

No. A provider snapshot can accelerate recovery, but it is not the complete backup strategy. It may share the same provider failure domain, may not provide application-consistent database recovery, and may omit external services and object storage.

### 2.4 Is a successful backup job proof that data is recoverable?

No. A backup is trusted only to the level demonstrated by integrity checks and restoration tests. LiNKsites records both backup creation and restore evidence.

### 2.5 Should every frontend VPS contain full copies of all operational data?

No. Frontend VPSs should remain disposable and rebuildable. They cache and serve published content, but they do not become independent authoritative databases.

## 3. Governing operational doctrine

LiNKsites follows these rules:

1. **Monitor from outside the failure domain.** A VPS cannot be the only observer of itself.
2. **Measure customer outcomes, not merely process existence.** A running container does not prove that a website works.
3. **Prefer replacement over repair for disposable frontend infrastructure.** Rebuild from governed desired state when that is safer than modifying an unknown host.
4. **Protect authoritative state separately from serving capacity.** Content and operational records require backups; frontend compute should be reproducible.
5. **Automate only bounded, observable, reversible recovery actions.** Broad improvisational access is not autonomy.
6. **Fail closed where tenant isolation or publication authority is uncertain.** Temporary unavailability is preferable to cross-customer exposure.
7. **Record every material action.** Detection, diagnosis, remediation, escalation, restoration, and verification create durable operational evidence.
8. **Keep recovery independent.** Backups, credentials, instructions, and monitoring must not all fail with the same VPS, provider account, or secret.
9. **Restore before declaring success.** Integrity checks and rehearsed restorations are part of normal operation.
10. **Use established open-source components.** LiNKsites composes proven monitoring and backup tools rather than building them from first principles.
11. **Separate internal objectives from customer promises.** An engineering recovery target is not automatically a contractual SLA.
12. **Reduce alert noise.** Carlos should receive a concise actionable exception, not every downstream symptom.

## 4. Operating model

The hosting operation is a set of continuous control loops:

1. Observe the desired and actual state.
2. Evaluate the difference.
3. Classify the condition.
4. Gather evidence.
5. Select an approved response.
6. Confirm authority.
7. Execute the response.
8. Verify customer-visible recovery.
9. Record the outcome.
10. Escalate if the condition remains unresolved or leaves the automation boundary.

A monitoring signal alone does not authorize arbitrary action. The combination of signal, evidence, policy, current state, and runbook determines what the system may do.

## 5. Operational planes

LiNKsites distinguishes four related planes:

| Plane | Purpose | Examples |
|---|---|---|
| Serving plane | Handles customer website requests | Cloudflare, Traefik, Next.js runtime, caches |
| Content plane | Holds and publishes governed content | Payload, PostgreSQL, Supabase working records, object storage |
| Operations plane | Observes and controls the first two planes | Prometheus, Alertmanager, Grafana, Loki, deployment and recovery executors |
| Oversight plane | Helps humans interpret and govern exceptions | OpenClaw, Carlos, approved human collaborators |

The operations plane must remain sufficiently independent to detect failures in the serving and content planes. The oversight plane consumes operations data but is not required for normal alert evaluation or recovery.

## 6. Recommended open-source observability stack

The initial recommended stack is:

| Capability | Recommended component | Role |
|---|---|---|
| Metrics store and rule evaluation | Prometheus | Scrapes metrics and evaluates recording and alerting rules |
| Alert routing | Alertmanager | Groups, deduplicates, inhibits, silences, and routes alerts |
| Dashboards | Grafana | Presents service, VPS, site, capacity, backup, and incident views |
| Telemetry collection | Grafana Alloy | Collects and forwards host, container, application, and log telemetry |
| Log aggregation | Grafana Loki | Stores searchable structured logs with controlled labels |
| External protocol probing | Prometheus Blackbox Exporter | Performs HTTP, HTTPS, DNS, TCP, and certificate-oriented probes |
| Host metrics | Node Exporter or equivalent Alloy integration | Reports host CPU, memory, disk, filesystem, and network conditions |
| Container metrics | Docker/Alloy integration or cAdvisor where justified | Reports runtime and container resource behavior |
| Application instrumentation | OpenTelemetry-compatible instrumentation where useful | Produces request metrics and later traces without hard binding the application to one backend |

This is a composable recommendation, not permission to install every component before it is needed. The minimum viable stack should provide independent uptime probes, host and container metrics, structured logs, alert routing, and backup-job monitoring. Distributed tracing can be added when request paths and scale justify its operational cost.

### 6.1 Optional human-friendly status interface

Uptime Kuma or another open-source uptime interface may be added for a simple visual status board. It must not become a second conflicting source of incident truth. Prometheus rules and the Incident Record remain authoritative unless the implementation decision deliberately selects another authoritative monitor.

## 7. Monitoring-plane placement

The sole monitoring instance must not run only on the same frontend VPS it monitors.

The recommended initial pattern is:

- A small dedicated operations VPS, or an independently hosted monitoring service under LiNKtrend control
- Network reachability to permitted metrics endpoints on each frontend VPS
- Public synthetic checks through Cloudflare, matching a real visitor path
- Private origin and service checks through secured routes
- Off-host log and alert storage
- Alert delivery through at least two independent channels where practical

At larger scale, the operations plane may be replicated. The initial goal is failure-domain independence, not immediate high-complexity clustering.

If the operations plane itself fails, a separate dead-man or heartbeat monitor must detect the absence of its expected signal.

## 8. Telemetry types

LiNKsites uses five complementary evidence types.

### 8.1 Metrics

Numeric time-series values such as request rate, latency, error rate, disk usage, memory pressure, cache effectiveness, and backup age.

### 8.2 Logs

Structured event records explaining what occurred in an application, proxy, executor, or host. Logs must include correlation fields and must exclude secrets and unnecessary sensitive content.

### 8.3 Traces

Request-path evidence showing time spent across edge, origin, application, cache, Payload, and database calls. Tracing is initially selective and sampled because universal tracing can add cost and complexity.

### 8.4 Synthetic checks

Scheduled actions that behave like a visitor or customer workflow. They prove that a site can be resolved, negotiated over TLS, rendered, and used—not merely that a process exists.

### 8.5 Operational events

Discrete changes such as deployment, content publication, DNS change, site migration, backup completion, secret rotation, remediation, and incident declaration. Events provide the change timeline against which metrics and logs are interpreted.

## 9. Telemetry identity and correlation

Every relevant signal should carry the smallest useful set of stable identifiers:

- `environment_id`
- `region_id`
- `vps_id`
- `service_id`
- `platform_release_id`
- `site_id`, when site-specific
- `content_release_id`, when content-specific
- `deployment_id`
- `run_id`
- `incident_id`, after an incident exists
- `trace_id` or `request_id`, where applicable

Customer names, full URLs containing personal data, raw lead data, and unbounded user values must not become metric labels. High-cardinality information belongs in logs or event records, not in Prometheus label sets.

## 10. Health endpoints

Each runtime exposes separate health meanings:

| Endpoint type | Question answered | Dependency depth |
|---|---|---|
| Process liveness | Is the process event loop alive? | No external dependencies |
| Readiness | Can this instance accept traffic safely? | Required local dependencies and configuration |
| Dependency health | Can it reach Payload, cache, or other required services? | Named dependency only |
| Site smoke check | Can a particular site resolve and render its certified public release? | Full request path |

Liveness must not fail merely because an external service is temporarily slow; otherwise the system can create restart loops. Readiness may remove a service from routing when it cannot serve correct responses.

Health responses must not disclose configuration, secrets, stack traces, database addresses, or tenant data.

## 11. Synthetic website checks

Public checks execute through the same Cloudflare hostname that a visitor uses. The baseline check validates:

1. DNS resolves to the intended proxied edge path.
2. TLS succeeds and the certificate is valid.
3. HTTP response is successful or follows only approved redirects.
4. The expected Customer Site ID marker is present.
5. The expected platform and content release markers are compatible.
6. No unknown-site, preview, maintenance, or cross-tenant marker appears.
7. Response time is within the current operating threshold.
8. A stable critical asset loads successfully.

Deeper checks may also test:

- A key interior page
- Mobile viewport rendering
- A form in non-delivering test mode
- Robots and sitemap endpoints
- Published structured data
- Cache headers
- Regional response behavior

Checks must avoid creating real leads, sending customer messages, contaminating analytics, or repeatedly invoking expensive AI or third-party services.

## 12. Probe scheduling and coverage

Not every page of every site requires the same probe interval.

LiNKsites defines monitoring profiles by site and service class. A profile specifies:

- Homepage probe interval
- Critical-route sample set
- Allowed probe regions
- Timeout and retry policy
- Certificate-expiry warning thresholds
- Content marker expectations
- Form-check mode
- Alert persistence period
- Maintenance-window behavior
- Customer tier or dedicated-hosting exceptions

At small scale, every active homepage can be probed frequently. At larger scale, stable secondary routes are sampled, while shared platform canaries receive deeper and more frequent tests.

## 13. Canary sites

Each platform deployment maintains non-customer canary sites that exercise representative features:

- Standard-tier component set
- Premium-tier component set
- Enterprise or advanced-integration features
- Typical Payload queries
- Media delivery
- Forms in safe test mode
- Locale and routing variations, where supported

Canaries are tested before and after platform releases. They reduce the need to use a customer site as the first proof that a shared deployment works.

## 14. Infrastructure metrics

Every frontend and operations VPS reports at least:

- CPU utilization, load, and sustained saturation
- Memory use, reclaim pressure, and out-of-memory events
- Filesystem capacity, inode use, and read/write errors
- Disk latency and throughput
- Network throughput, packet errors, connection pressure, and retransmission indicators where available
- Host uptime and reboot events
- Time synchronization health
- Container lifecycle, restart count, and resource consumption
- Image and deployment version
- Backup-agent and telemetry-agent health
- Security-update and package-drift indicators where approved

Capacity alerts use duration and trend, not only instantaneous thresholds.

## 15. Traefik and frontend metrics

LiNKsites observes:

- Request rate by safe route class and response class
- Error ratio
- Latency distribution
- Open connections
- Backend health
- Retry and timeout counts
- Request and response size distribution
- Per-site or per-host usage using bounded identifiers
- Cache hit and miss behavior
- Next.js process health and restarts
- Server-side rendering duration
- Payload fetch latency and errors
- Unknown-host requests
- Release-marker mismatch
- Tenant-resolution failure

Unknown-host or site-ID mismatch events are operationally important because they may indicate drift, attack traffic, or isolation failure.

## 16. Content-plane monitoring

The central content plane requires its own indicators:

- PostgreSQL connection count and saturation
- Transaction rate and failure rate
- Query latency and slow-query evidence
- Lock contention and deadlocks
- Replication or WAL archival lag when applicable
- Database storage growth
- Payload API latency and error rate
- Publication queue depth and age
- Working-to-draft and draft-to-published promotion failures
- Object-storage error rate and capacity
- Backup freshness
- Restore-test freshness

Frontend monitoring must distinguish “origin is up” from “content plane is unavailable” so that recovery chooses the right failure domain.

## 17. Service-level indicators and objectives

An SLI is a measured indicator. An SLO is an internal target for that indicator. An SLA is a customer-facing commitment and may have contractual consequences.

LiNKsites initially defines internal SLOs. It does not silently advertise them as SLAs.

Candidate SLIs include:

- Successful eligible HTTP responses divided by total eligible requests
- Proportion of requests below a latency threshold
- Successful synthetic homepage checks
- Successful content publications
- Successful form submissions reaching the approved destination
- Backup jobs completed within schedule
- Restores proven within the required test window
- Mean time to detect
- Mean time to contain
- Mean time to restore
- Percentage of incidents remediated without human intervention

The denominator excludes approved maintenance and clearly classified malicious or invalid requests only according to written policy.

## 18. Recovery objectives

Two distinct objectives govern recoverability:

- **Recovery Point Objective (RPO):** the maximum targeted amount of recent data that may be lost after a failure.
- **Recovery Time Objective (RTO):** the maximum targeted time to restore the defined service after a failure.

RPO and RTO apply to a named asset and failure scenario. A statement such as “four-hour recovery” is incomplete unless it specifies whether it refers to one site, one VPS, the central database, media storage, or the entire platform.

## 19. Provisional recovery classes

The following are engineering starting points, not customer promises:

| Asset or service | Provisional RPO | Provisional RTO | Recovery method |
|---|---:|---:|---|
| Frontend VPS runtime | No authoritative-data loss expected | 60 minutes for replacement target | Rebuild and reassign from desired state |
| Platform configuration | 24 hours maximum, with every approved change versioned immediately | 4 hours | Restore versioned configuration and reconcile |
| Central PostgreSQL content and operational records | 15 minutes where PITR is enabled; otherwise the approved backup interval | 4 hours initial target | PITR or verified database restore |
| Published media and objects | 24 hours maximum initial target, tightened where publication volume requires | 8 hours initial target | Restore or synchronize from independent object backup |
| Secrets and recovery credentials | Every approved change captured | 4 hours, subject to security verification | Recover from encrypted independent secret escrow and rotate |
| Observability history | 24 hours | 24 hours | Restore configuration first; historical telemetry second |

Repository audit, provider capabilities, cost, real dataset size, and restore drills must replace these provisional values with measured objectives.

Because all sites initially share the central content plane, its protection must meet the strongest justified shared requirement. The database cannot safely apply different physical RPOs to individual rows merely because customers bought different website tiers.

## 20. Alert taxonomy

| Severity | Meaning | Default response |
|---|---|---|
| SEV-0 | Confirmed or credible tenant isolation breach, destructive compromise, or active widespread data corruption | Contain immediately; halt risky automation; urgent OpenClaw/Carlos escalation |
| SEV-1 | Widespread outage, central content-plane failure, unrecoverable publication path, or imminent data loss | Immediate automated containment and recovery; urgent escalation if not rapidly verified |
| SEV-2 | One customer production site unavailable, major degradation, failed restore objective, or high capacity risk | Automated diagnosis and bounded recovery; prompt escalation on failure |
| SEV-3 | Non-critical degradation, drift, backup delay within remaining safety margin, or growth warning | Create Operations Issue and schedule remediation |
| SEV-4 | Informational change, recovered transient condition, or trend for review | Record and summarize; no interruption |

Severity describes impact and urgency, not which component emitted the first alert.

## 21. Alert rule design

An alert rule contains:

- Stable alert name and version
- Signal and query
- Persistence duration
- Severity mapping
- Scope identifiers
- Likely failure domain
- Runbook reference
- Safe automated actions
- Escalation policy
- Suppression and maintenance behavior
- Resolution condition

Alerts should require persistence where appropriate so that brief network noise does not trigger destructive recovery. Immediate alerts are reserved for signals where delay creates meaningful danger, such as verified cross-tenant content.

## 22. Grouping, deduplication, and inhibition

Alertmanager groups related alerts so Carlos does not receive hundreds of notifications when one VPS fails.

Examples:

- A `VPSUnreachable` alert inhibits downstream `SiteUnreachable` notifications for sites assigned to that VPS while retaining their evidence.
- A `CentralPayloadUnavailable` alert groups frontend content-fetch failures across regions.
- A planned maintenance record suppresses only alerts within its declared scope and time window.
- A single site failure remains separate from a regional infrastructure failure.

Silences require an owner, reason, scope, start, and expiry. Permanent unexplained silences are prohibited.

## 23. Dead-man monitoring

Expected periodic signals prove that scheduled systems are still executing. LiNKsites monitors the absence of:

- Backup-completion heartbeat
- Restore-test heartbeat
- Monitoring-rule evaluation
- Telemetry arrival from each VPS
- Scheduled site-probe batches
- Certificate-renewal checks
- Capacity evaluations
- Configuration reconciliation

The absence of a success signal is itself an alert. This prevents a failed scheduler from appearing healthy merely because it emitted no explicit error.

## 24. Incident Record

Every SEV-0 through SEV-2 condition and selected recurring SEV-3 conditions create an Incident Record.

```yaml
incident_id: inc_...
opened_at: timestamp
detected_by: alert-or-operator
severity: SEV-2
status: investigating
failure_domain: frontend-vps
affected_sites:
  - site_id
affected_services:
  - service_id
first_signal_ref: alert-ref
correlated_changes:
  - deployment-or-publication-ref
runbook_id: rb-vps-recovery
authority_level: autonomous-reversible
actions:
  - run_id: run-id
    action: restart-candidate
    result: unsuccessful
customer_visible_state: unavailable
recovery_verified_at: null
owner: operations-controller
openclaw_case_ref: null
post_incident_review_required: true
```

The record is append-oriented. Corrections do not erase the original event trail.

## 25. Incident state model

An incident progresses through controlled states:

```text
suspected
→ confirmed
→ contained
→ recovering
→ verifying
→ resolved
→ reviewed
→ closed
```

Alternative terminal states are `false_positive`, `duplicate`, and `accepted_risk`, each requiring evidence and authority.

`resolved` means customer-visible service and required data are restored. `closed` means follow-up obligations have been dispositioned.

## 26. Diagnostic evidence bundle

Before remediation, the controller captures the evidence that can safely be collected without delaying urgent containment:

- Alert and recent signal history
- Affected Site Assignments
- Current platform and content releases
- Recent deployments, publications, migrations, and DNS changes
- Relevant Traefik, frontend, Payload, and database logs
- Resource and capacity state
- External and origin probe results
- Backup freshness
- Current maintenance and change windows
- Prior related incidents

An AI agent may summarize or classify this evidence, but the source evidence remains attached.

## 27. Runbooks as executable policy

A runbook is a versioned response contract, not only prose.

Every runbook defines:

- Trigger conditions
- Conditions that disqualify automation
- Required evidence
- Authority class
- Preconditions
- Ordered actions
- Maximum attempts
- Cooldown periods
- Verification checks
- Rollback or compensation
- Escalation condition
- Expected records

Runbooks should expose deterministic steps as scripts or automations. AI assistance may interpret ambiguous evidence or draft a recommendation, but it does not replace explicit authority and verification.

## 28. Autonomous remediation allowlist

Candidate automatically authorized actions include:

- Re-run a failed read-only health probe
- Restart one unhealthy frontend container within attempt limits
- Remove an unready replica from Traefik routing
- Activate an already deployed, verified previous runtime release
- Purge a precisely scoped cache after a verified publication mismatch
- Reconcile a missing non-destructive configuration item from approved desired state
- Rebuild a disposable frontend VPS from approved infrastructure definition
- Move eligible sites to verified spare capacity
- Expand storage or compute within a pre-approved budget and limit
- Renew or retry a certificate operation under the domain policy in Section 17
- Re-run a failed backup or integrity check

Actions that are not automatically authorized include:

- Deleting a database or backup repository
- Restoring the entire central database over the current production system without a controlled recovery decision
- Overwriting customer DNS outside declared records
- Disabling tenant isolation controls
- Revealing or broadly rotating secrets without incident authority
- Sending customer communications not covered by an approved template and event policy
- Increasing infrastructure beyond an approved spending limit
- Accepting data loss
- Treating an unknown incident as solved because an AI agent is confident

## 29. Retry and anti-thrashing controls

Every remediation specifies:

- Maximum attempts per incident and time window
- Delay and backoff
- Jitter where concurrent retries could synchronize
- Cooldown after success
- Circuit breaker after repeated failure
- Idempotency key
- Current-state precondition
- Compensation or rollback

Repeated restarts without diagnosis are not self-healing. They are hidden instability. After the attempt limit, the service moves to a safer state and escalates.

## 30. Recovery verification

A command succeeding does not resolve an incident. Verification must test the original customer-visible outcome.

Examples:

- After a container restart, an external site check must pass through Cloudflare.
- After route rollback, the expected Site ID and release marker must appear.
- After database restoration, integrity queries, Payload reads, publication state, and selected site smoke tests must pass.
- After object restoration, referenced media hashes and URLs must resolve.
- After VPS replacement, assigned sites, TLS, telemetry, backups, and configuration reconciliation must all pass.

## 31. OpenClaw incident role

OpenClaw may receive a structured Incident Brief containing:

- What customers experience
- What the system believes failed
- Evidence and confidence
- Actions already taken
- Current risk
- Remaining recovery options
- Authority required
- Recommended next action

OpenClaw may coordinate approved executors or request Carlos's decision. It must not receive unrestricted standing credentials merely because it explains incidents.

If OpenClaw fails, alerts still route, runbooks still execute within their authority, and Carlos can access dashboards and recovery instructions directly.

## 32. Backup is a system, not a file

LiNKsites treats backup as a lifecycle:

1. Identify authoritative and reconstructable assets.
2. Set RPO, retention, and encryption policy.
3. Capture a consistent backup.
4. Transfer it to an independent repository.
5. Record a Backup Manifest.
6. Verify integrity.
7. Apply retention without destroying required recovery points.
8. Restore on schedule into an isolated environment.
9. Verify application behavior.
10. Record evidence and remediate failures.

## 33. Backup inventory

The inventory covers:

| Asset | Authoritative? | Protection approach |
|---|---|---|
| Central PostgreSQL database | Yes | Managed PITR where justified plus independent logical or physical recovery path |
| Supabase working records | Yes for work-in-progress and operational state | Included in database protection according to schema and project topology |
| Payload collections and publication state | Yes | Included in PostgreSQL protection |
| Supabase Storage or other object storage | Yes for stored media and files | Separate object synchronization/versioned backup |
| Frontend source and infrastructure definitions | Yes as configuration | Version-controlled repositories and protected release artifacts |
| VPS operating system | No, normally reconstructable | Rebuild from hardened image and configuration; snapshot only as accelerator |
| Necessary local volumes | Depends | Explicit inventory and file-level backup; eliminate avoidable local authority |
| Cloudflare, Traefik, and site-assignment desired state | Yes | Versioned configuration and database records plus export/reconciliation evidence |
| Secrets and recovery keys | Yes | Encrypted, access-controlled, independent recovery escrow |
| Logs and metrics | Operational evidence | Retention according to value, cost, security, and incident needs |
| Preview inventory | Mixed | Preserve reusable source and state; disposable builds may be regenerated |

Unknown persistent volumes are a repository-audit failure. Every volume must be classified as authoritative, derived, cache, temporary, or prohibited.

## 34. PostgreSQL protection

PostgreSQL is the authoritative data store behind Payload and may also hold Supabase working-layer records. Its protection requires:

- Provider backups or physical backup/PITR according to the selected hosting model
- Independent logical exports at an interval justified by RPO and cost
- Schema and migration history in version control
- Roles, extensions, policies, functions, and triggers included or reproducibly defined
- Backup encryption and restricted access
- Restore to an isolated target before promotion
- Version compatibility documentation
- Consistency checks after restore

Current PostgreSQL documentation distinguishes logical dumps from physical and continuous-archiving recovery. Logical dumps are portable across more version and architecture changes; PITR provides recovery to a chosen time but depends on a valid base backup and the required WAL sequence. LiNKsites uses each method for its appropriate purpose rather than pretending one replaces all others.

## 35. Managed Supabase backup boundary

If LiNKsites uses managed Supabase:

- Native daily backups and optional PITR protect the database according to the purchased service and retention.
- PITR cost and recovery duration must be included in the operating economics.
- LiNKsites retains an independent recovery path so provider-account loss or project deletion does not make every backup inaccessible.
- Logical dumps must be scheduled even when the provider uses physical backups if portability is required.
- Supabase database backups do **not** include objects stored through Supabase Storage.
- Storage-object protection is therefore a separate mandatory workflow.

Provider documentation, subscription level, retention, and actual restore behavior must be checked during implementation because these capabilities and prices can change.

## 36. Database backup consistency

A backup run records:

- Database identity and project
- PostgreSQL version
- Backup method and tool version
- Start and completion time
- Transaction or WAL position where applicable
- Included schemas
- Explicit exclusions
- Encryption key reference, never the key itself
- Repository and object reference
- Size and checksum
- Integrity-check result
- Retention class
- Earliest and latest intended recovery point

Application changes that require coordinated database and object state must record the common recovery boundary or the reconciliation procedure.

## 37. Object-storage and media protection

Media protection covers:

- Original approved customer assets
- Generated and adapted images or video used by active sites
- Published derivatives that cannot be deterministically regenerated at acceptable cost
- File metadata, rights and provenance records, hashes, and content references
- Supabase Storage buckets or alternate S3-compatible buckets

Recommended protection uses a versioned or append-resistant destination in a separate account or provider boundary. `rclone`, storage-native replication, or another proven open-source transfer layer may copy objects, but the process must preserve object identity, verify hashes, and record deletions separately.

A database restore without its referenced media is incomplete.

## 38. Frontend VPS protection

The frontend VPS should contain as little irreplaceable state as possible.

Protected items may include:

- Governed Traefik configuration or generated desired-state inputs
- Deployment manifest and current release pointer
- Approved local certificates only if certificate architecture requires them
- Site-assignment cache that can be regenerated
- Local application configuration excluding recoverable secrets
- Necessary operational agent state

The preferred recovery is:

1. Provision a clean VPS.
2. Apply the hardened base configuration.
3. Install the approved runtime stack.
4. Retrieve secrets through the approved mechanism.
5. Deploy the verified platform release.
6. Reconcile assigned sites.
7. Pass origin and external checks.
8. Switch eligible traffic.

Whole-machine snapshots are optional recovery accelerators, not the only source of truth.

## 39. File-level backup tool

For governed filesystem data and configuration exports, `restic` is the recommended initial open-source backup tool because it supports encrypted repositories, snapshot retention, integrity checking, and restoration across several storage backends.

The repository design must include:

- A destination outside the protected VPS
- Separate credentials for backup creation and destructive maintenance where supported
- Encrypted repository password or key recovery
- Scheduled `check` operations
- Controlled `forget` and `prune` policy
- Test restoration
- Repository monitoring

Append-only or object-lock capabilities should be used where the selected backend supports them. A compromised production host should not automatically have authority to erase all recovery history.

## 40. Secrets and recovery material

Secrets are not placed in ordinary backups as plain environment files.

Recovery must cover:

- Secret-manager data or encrypted export
- Restic repository recovery credentials
- Database recovery credentials
- Cloudflare and DNS recovery access
- Domain registrar recovery access
- Code-signing or deployment credentials
- Break-glass instructions and identity requirements

The recovery mechanism uses encryption, least privilege, access logging, and separation from the production account. A recovery key stored only on the failed VPS is not a recovery key.

Detailed secret-access and rotation rules appear in Section 18.

## 41. Configuration protection

Rebuildable infrastructure depends on protected desired state:

- Docker Compose or selected orchestration definitions
- Image digests and release manifests
- Traefik routers, middleware, and services
- Cloudflare DNS and edge policy definitions
- Site Assignment records
- Monitoring rules and dashboards
- Alert routing
- Backup schedules and retention policies
- Hardened host configuration
- Runbooks and executor versions

Configuration is versioned, reviewed, reproducible, and periodically compared with actual state. Provider configuration that cannot be fully managed as code must be exported or reconstructed through documented APIs and reconciliation jobs.

## 42. Backup independence and the 3-2-1 principle

LiNKsites aims to maintain:

- At least three usable copies of critical data, counting the live copy
- At least two storage mechanisms or failure characteristics
- At least one copy outside the primary provider or administrative failure domain

For the most critical assets, one recovery copy should resist immediate alteration or deletion from compromised production credentials.

The precise implementation depends on provider and budget, but all copies must not disappear when one cloud account is locked, deleted, compromised, or unavailable.

## 43. Backup schedule and retention

Schedules derive from RPO and change rate. A candidate initial policy may include:

- Continuous or provider-managed PITR for the central database where economically justified
- Daily independent logical database backup
- More frequent logical backup or WAL-based recovery as data volume and order activity grow
- Daily object synchronization with version retention, tightened as media publication volume grows
- Backup after material schema or infrastructure changes
- Daily configuration and manifest protection where not already committed immediately
- Weekly repository integrity check with periodic deeper verification
- Monthly isolated restore drill, with more frequent targeted restores during launch and rapid change

Retention uses daily, weekly, monthly, and selected long-term recovery points. Exact counts are implementation decisions based on storage cost, legal policy later defined, customer commitments, and observed recovery needs.

Retention deletion runs separately from backup creation and requires stricter credentials and safeguards.

## 44. Backup Manifest

Every backup execution creates or updates a Backup Manifest.

```yaml
backup_id: bak_...
asset_id: central-postgres
asset_class: database
method: logical-dump
tool: supabase-cli-or-pg-dump
tool_version: version
started_at: timestamp
completed_at: timestamp
status: verified
recovery_window:
  earliest: timestamp
  latest: timestamp
repository_id: independent-backup-store
object_ref: encrypted-reference
checksum: digest
size_bytes: integer
encryption_key_ref: key-reference
retention_policy_id: retention-core-v1
integrity_check:
  status: passed
  run_id: run-id
restore_test:
  last_tested_at: timestamp
  result: passed
  evidence_ref: evidence-id
```

The manifest must not contain the repository password or raw secret.

## 45. Backup gates

A backup is classified as:

- `created`: the tool reported creation
- `transferred`: the object exists in the intended repository
- `verified`: integrity and expected-content checks passed
- `restore_proven`: a qualifying restoration test passed within the policy window
- `expired`: outside retention
- `invalid`: corrupt, incomplete, inconsistent, or unrecoverable

Operational dashboards show the highest achieved state. Reporting only `created` as “protected” is misleading.

## 46. Restoration testing

Restoration tests are scheduled production work, not optional disaster exercises.

Test classes include:

1. **File restore:** recover selected configuration or media objects and compare hashes.
2. **Database logical restore:** restore into isolated PostgreSQL and execute schema and data checks.
3. **Point-in-time restore:** restore to a selected time before a known test mutation.
4. **Site reconstruction:** rebuild a site from restored content, assignments, assets, and a verified platform release.
5. **VPS disaster recovery:** provision a clean VPS and restore serving capacity.
6. **Full platform exercise:** restore the minimum viable content and serving planes into an isolated environment.

Tests must never overwrite production. Test environments are isolated and removed under policy after evidence is retained.

## 47. Restore evidence

A restoration test records:

- Backup and recovery point used
- Target environment
- Executor and tool versions
- Start and completion time
- Achieved RTO
- Estimated or demonstrated RPO
- Integrity checks
- Site smoke-test results
- Missing or manually reconstructed items
- Errors and workarounds
- Destruction of the isolated test environment
- Required corrective Issues

A stale successful test does not indefinitely prove new backups or new software versions are recoverable.

## 48. Database point-in-time recovery

The controlled PITR sequence is:

1. Confirm the failure and identify the desired recovery time.
2. Freeze risky writes or route the system into maintenance/read-only state.
3. Preserve current evidence and, where safe, capture the damaged state for investigation.
4. Restore to a new isolated database target rather than immediately overwriting the source.
5. Validate schema, tenant boundaries, Payload collections, working records, publication pointers, and recent known transactions.
6. Reconcile object-storage state.
7. Run application smoke checks against the restored target.
8. Obtain the authority required for production cutover.
9. Switch controlled connections.
10. Verify customer sites and operational workflows.
11. Retain the prior target until rollback is no longer required.

Choosing the recovery point may discard valid writes after that time. This is not an automatically authorized decision unless an explicit scenario and authority policy already approves it.

## 49. Individual-site recovery

LiNKsites should avoid restoring the entire shared database merely to recover one customer's content.

Site-level recovery uses:

- Content release history
- Payload versioning where configured
- Exported site bundle or logical subset recovery
- Asset-version history
- Site Assignment history
- Launch Manifest and Launch Certificate

The system reconstructs or repromotes the last known-good site state, verifies it in preview, and then publishes it. Shared database PITR is reserved for failures that require database-wide recovery.

## 50. Bad-content recovery

If incorrect but technically valid content is published:

1. Freeze further promotion for the site.
2. Identify the last approved content release.
3. Restore or republish that release.
4. Purge only affected caches.
5. Verify public content markers and critical pages.
6. Preserve the faulty release and evidence.
7. Determine whether the cause was source data, mapping, approval, promotion, or cache invalidation.

This normally does not require database restore.

## 51. Bad-platform-release recovery

If a shared frontend release causes failures:

1. Stop traffic expansion to the candidate.
2. Route traffic to the already deployed last-known-good runtime.
3. Verify representative canaries and affected sites through Cloudflare.
4. Mark the release rejected or quarantined.
5. Preserve logs and deployment evidence.
6. Create corrective engineering Issues.

Rollback should switch to a known artifact. It must not compile an untested “old” version during the incident.

## 52. Frontend VPS failure recovery

When one VPS becomes unavailable:

1. Independent probes confirm edge and origin behavior.
2. Site Assignments identify affected customers.
3. The controller distinguishes network, provider, host, Traefik, and runtime failure.
4. One bounded restart or service recovery may run if evidence supports it.
5. If the host remains untrusted or unavailable, eligible sites move to verified spare capacity or a replacement VPS.
6. DNS or edge-origin configuration changes according to Section 15 and Section 17.
7. External smoke checks verify every reassigned site or a risk-based complete batch.
8. The failed host is quarantined for evidence or decommissioned.

No authoritative customer content moves with this recovery because the central content plane remains authoritative.

## 53. Central Payload or database failure

The response distinguishes:

- Payload application failure while PostgreSQL remains healthy
- Connection saturation
- Faulty migration
- Database corruption
- Provider outage
- Credential failure
- Accidental destructive change
- Object-storage mismatch

Where cached published content can be served safely, frontends may continue serving a known-good release in degraded mode. Drafting, publication, and customer changes pause. Stale content must not be mistaken for a fully healthy content plane.

## 54. Provider outage and regional failure

Regional frontend failure may be handled by site reassignment if spare capacity and domain policies permit.

A central managed-Supabase outage is a different failure domain. Frontend region multiplication does not by itself create database high availability. The chosen Supabase or PostgreSQL service level, caching strategy, backup strategy, and later disaster-recovery topology determine recovery.

LiNKsites does not claim multi-region database failover until it has been explicitly designed, paid for, implemented, and tested.

## 55. Maintenance operations

Routine maintenance includes:

- Operating-system security updates
- Container image and dependency updates
- Traefik and telemetry-agent updates
- Certificate and domain checks
- Database maintenance and migration rehearsal
- Backup integrity and restore tests
- Capacity rebalancing
- Removal of expired preview infrastructure
- Log and metric retention enforcement
- Secret rotation
- Runbook exercise and revision

Maintenance is represented by a Change Record with scope, timing, expected impact, rollback, and verification. Monitoring is suppressed only as narrowly as necessary.

## 56. Patch and reboot workflow

For a shared frontend VPS:

1. Confirm spare capacity or approved maintenance behavior.
2. Drain or move eligible traffic.
3. Capture current release, assignment, and configuration evidence.
4. Apply the approved update through a versioned executor.
5. Reboot if required.
6. Validate host, Traefik, runtime, telemetry, and backups.
7. Run canary and assigned-site checks.
8. Restore normal routing.
9. Record versions and results.

Unattended updates may be authorized for low-risk classes, but major version changes require staged testing.

## 57. Operations Issues and Runs

Each scheduled or event-triggered operation is an Issue. Each attempt is a Run.

Examples:

- `OPS-MONITOR-SITE`
- `OPS-EVALUATE-CAPACITY`
- `OPS-RESTART-FRONTEND-REPLICA`
- `OPS-REBUILD-VPS`
- `OPS-BACKUP-DATABASE`
- `OPS-CHECK-BACKUP-REPOSITORY`
- `OPS-TEST-RESTORE`
- `OPS-ROLLBACK-PLATFORM`
- `OPS-RESTORE-CONTENT-RELEASE`
- `OPS-ROTATE-RECOVERY-CREDENTIAL`

Each Run records inputs, executor, version, idempotency key, authority, evidence, outputs, duration, cost, and result.

Section 20 defines the complete Issue, Run, executor, retry, and compensation model.

## 58. Executor selection

Deterministic executors handle:

- Metric collection and rule evaluation
- Backup commands
- Checksums and repository checks
- Container operations
- Infrastructure provisioning
- Traffic switching
- Site smoke tests
- Restore validation queries
- Incident-record updates

AI agents may:

- Correlate evidence across logs and changes
- Suggest likely failure domains
- Summarize an incident
- Propose a runbook or corrective engineering Issue
- Translate operational state for Carlos

AI agents do not replace checksums, health checks, access controls, database constraints, or authority policy.

## 59. Operations controller state

The controller tracks:

- Desired state
- Observed state
- Last verified state
- Current incident state
- Pending changes
- Active maintenance
- Remediation attempt count
- Cooldown and circuit-breaker state
- Backup and restore freshness
- Current capacity headroom
- Authority and budget remaining

Controller state must survive the failure of the website VPS it manages.

## 60. Capacity-triggered operations

Section 15 defines multidimensional capacity. Section 16 operationalizes it.

The system:

1. Calculates current and forecast headroom.
2. Separates sustained growth from a temporary spike.
3. Identifies noisy-neighbor sites.
4. Evaluates vertical scaling, new VPS capacity, caching improvement, or reassignment.
5. Prices the action against an approved budget.
6. Executes automatically only within authority.
7. Verifies capacity and customer behavior after the change.

The original estimate of approximately 20 sites per VPS remains a planning hypothesis until this loop replaces it with measured safe capacity.

## 61. Cost control

Operational resilience has costs:

- Monitoring VPS and telemetry storage
- Log and metrics retention
- Backup storage and transfer
- Managed Supabase PITR
- Spare frontend capacity
- Restore-test environments
- Incident-related AI usage
- External alert delivery

LiNKsites records cost per shared platform, VPS, active site, preview site, backup class, and incident where practical.

Cost reduction must not silently eliminate the only independent backup, outside monitor, or recovery credential. The system should first reduce noisy telemetry, unnecessary retention, inefficient polling, and expensive AI diagnosis.

## 62. Operational dashboards

Minimum dashboards include:

1. **Customer service health:** active sites, failing sites, latency, certificates, and forms.
2. **VPS and regional health:** resource pressure, replicas, routing, and headroom.
3. **Content-plane health:** Payload, PostgreSQL, publications, storage, and connections.
4. **Release health:** current releases, canaries, errors, and rollback readiness.
5. **Backup and recovery:** backup age, verification, retention, restore-test age, and achieved objectives.
6. **Incident operations:** current incidents, severity, age, actions, and authority blockers.
7. **Autonomy:** conditions detected, automatically resolved, escalated, failed, and repeatedly recurring.
8. **Cost and growth:** telemetry, backup, compute, storage, and per-site operating trends.

Carlos's default view should explain exceptions and required decisions in plain English while preserving links to technical evidence.

## 63. Notification channels

Alert delivery should have:

- A primary immediate channel
- A secondary channel for critical failure
- A durable Operations Issue or Incident Record
- Escalation when acknowledgement or recovery does not occur
- Rate limits and grouping
- Test notifications

Email alone may be too slow for urgent incidents, while chat alone may not be durable. Exact channels are implementation decisions tied to the tools Carlos actually uses.

Customer notifications are separate from internal alerts and require approved policies and templates.

## 64. Post-incident review

A review is required for:

- Every SEV-0 and SEV-1 incident
- Material data loss or restore
- Tenant isolation risk
- Missed recovery objective
- Repeated SEV-2 incident
- Automation that worsened impact
- An alert that failed to fire
- A recovery path that failed its test

The review states:

- What happened
- Customer and business impact
- Detection and response timeline
- Contributing technical and process conditions
- Why safeguards did or did not work
- Recovery effectiveness
- Corrective Issues with owners and priorities
- Monitoring, runbook, test, and architecture changes

The purpose is system improvement, not blame.

## 65. Recurrence prevention

An incident is not fully learned from until corrective work enters the Program. Corrective actions may change:

- A monitor or threshold
- A health endpoint
- A deployment gate
- A component or data contract
- A backup schedule
- A restoration procedure
- A capacity policy
- A runbook
- An executor permission
- An engineering test
- Customer or internal documentation

Recurring incidents must not remain permanently normalized as routine restarts.

## 66. Repository audit requirements

An engineering audit must determine:

1. Which monitoring, logging, alerting, and backup repositories already exist.
2. Whether Prometheus, Grafana, Loki, Alloy, Uptime Kuma, Sentry-like tooling, or alternatives are already partially deployed.
3. Where monitoring currently runs and whether it shares the frontend failure domain.
4. Which health and metrics endpoints exist.
5. Whether logs are structured and correlated.
6. Whether application logs expose secrets or customer data.
7. Which Docker volumes and host paths are persistent.
8. Which persistent assets are authoritative versus reconstructable.
9. How Payload media is stored.
10. Whether Supabase Storage is used and how objects are backed up.
11. Which Supabase plan and backup capabilities are active.
12. Whether PITR is enabled and economically justified.
13. Whether logical database dumps exist independently of provider backups.
14. Where backup repositories and recovery credentials reside.
15. Whether production credentials can delete all backups.
16. Which backup jobs have actual restore evidence.
17. Whether migrations, RLS policies, functions, triggers, roles, and extensions are reproducible.
18. Whether VPS builds are reproducible from clean infrastructure.
19. Whether platform rollback uses known immutable artifacts.
20. Whether Site Assignment supports automated recovery and reassignment.
21. Whether monitoring profiles and recovery profiles are modeled.
22. Which runbooks are executable versus prose only.
23. What automation has server access and its limits.
24. Whether OpenClaw is incorrectly embedded in any runtime dependency.
25. Which alerts are actionable and which are noise.
26. Whether dead-man checks cover schedulers, backups, and telemetry.
27. Whether recovery costs and objectives are measured.
28. Whether isolated restore testing is possible without production access.

The audit reports `implemented`, `partial`, `conflicting`, `obsolete`, `missing`, or `unknown` for each requirement and attaches evidence.

## 67. Initial implementation sequence

### Phase 1 — Inventory and desired state

- Classify all services, volumes, databases, buckets, configuration, and secrets.
- Assign owners, recovery classes, and provisional RPO/RTO.
- Identify existing tools to retain, consolidate, or retire.

### Phase 2 — External visibility

- Deploy an independent operations plane.
- Implement public homepage probes, origin checks, dead-man monitoring, and alert delivery.
- Create the customer-health and VPS-health dashboards.

### Phase 3 — Host and application telemetry

- Collect host, container, Traefik, frontend, Payload, database, and backup metrics.
- Centralize structured logs.
- Add release, site, deployment, and Run correlation.

### Phase 4 — Backup foundation

- Implement central database protection and independent logical recovery.
- Implement separate object-storage backup.
- Protect configuration and recovery material.
- Create Backup Manifests and freshness alerts.

### Phase 5 — Verified recovery

- Automate file and database restoration into isolation.
- Prove a site-level restoration.
- Prove a clean VPS rebuild.
- Record achieved RPO and RTO.

### Phase 6 — Bounded self-healing

- Implement low-risk remediation runbooks.
- Add attempt limits, cooldowns, idempotency, and customer-visible verification.
- Measure false positives and autonomous recovery success.

### Phase 7 — Disaster exercises

- Exercise VPS loss, bad platform release, bad content release, database point recovery, object recovery, and monitoring-plane failure.
- Correct the discovered weaknesses.

### Phase 8 — Scale and optimize

- Add regional and capacity-aware operations.
- Tune telemetry retention and cost.
- Expand traces and per-site indicators only where evidence justifies them.

## 68. Decisions intentionally still open

The following remain implementation or commercial decisions:

- Final monitoring-plane provider and region
- Whether Uptime Kuma is added to the Prometheus-based stack
- Prometheus local versus remote retention architecture at scale
- Exact log and trace retention
- Managed Grafana components versus fully self-hosted components
- Supabase plan and PITR retention
- Final database and object RPO/RTO
- Backup repository providers
- Object-lock or append-only mechanism
- Exact restic retention schedule
- Spare-capacity percentage
- Customer-facing SLA, if any
- Notification channels
- Authority and spending limits for automatic scaling
- Which incident types justify customer communication
- When multi-region database recovery becomes economically necessary

These decisions must be made before corresponding production promises are issued, but they do not prevent repository audit and implementation of the common foundation.

## 69. Acceptance criteria

This part of LiNKsites is adequately implemented when:

1. Every production site has an external customer-path probe.
2. Monitoring remains able to detect a frontend VPS failure when that VPS is completely unavailable.
3. Host, container, proxy, frontend, content-plane, storage, and backup health are visible.
4. Metrics use bounded labels and logs exclude secrets.
5. Alerts group and inhibit downstream symptoms without losing evidence.
6. Every actionable alert names a runbook and escalation policy.
7. Monitoring, backup, and restore schedules have dead-man checks.
8. SEV-0 through SEV-2 incidents create durable Incident Records.
9. Automated remediation is allowlisted, bounded, idempotent, and verified externally.
10. Repeated failed remediation stops and escalates rather than thrashing.
11. OpenClaw can explain and coordinate exceptions but is not required for site serving, alerting, backup, or routine recovery.
12. Frontend VPSs can be rebuilt without recovering an authoritative local database.
13. Central PostgreSQL has a documented provider-native and independent recovery path.
14. Supabase Storage or other object storage is protected separately from database backups.
15. Backup repositories are outside the protected VPS and at least one critical copy is outside the primary administrative failure domain.
16. Production credentials cannot casually erase every recovery copy.
17. Every backup creates a manifest and receives integrity verification.
18. Restore tests prove selected files, the database, object references, a customer site, and a clean VPS rebuild.
19. Restoration evidence includes achieved recovery time and data boundary.
20. A single site can return to a known-good content release without restoring the entire shared database.
21. A bad platform release can roll back to an already verified immutable artifact.
22. A VPS failure can trigger reassignment or clean replacement without moving content authority.
23. Recovery targets are internal objectives until explicitly converted into customer commitments.
24. Capacity alerts use measured multidimensional headroom rather than a fixed site-count assumption.
25. Operational costs and autonomous recovery outcomes are measurable.
26. Post-incident actions enter the engineering and operating backlog.

## 70. Governing conclusion

LiNKsites hosting is autonomous when normal operations are governed by observable state, deterministic rules, bounded authority, tested runbooks, reproducible infrastructure, and customer-visible verification. It is not autonomous merely because an agent can log into a server and attempt repairs.

The recommended foundation composes mature open-source observability components: Prometheus evaluates metrics and rules; Alertmanager turns related signals into controlled notifications; Grafana presents the operating state; Alloy collects telemetry; Loki retains structured logs; and Blackbox Exporter proves that sites work through the public path. A separate monitoring failure domain observes shared frontend VPSs and the central content plane.

Authoritative data receives layered protection. Managed Supabase database backups or PITR are useful but do not cover Storage objects and must not be the only recovery path. PostgreSQL, object storage, configuration, and secrets each receive explicit protection. Frontend VPSs remain disposable and are rebuilt from desired state. Backups become trusted through checks and isolated restoration—not through job-completion messages.

The system handles known, reversible failures automatically, stops when attempts become unsafe or ineffective, and escalates a concise evidence-backed exception. OpenClaw assists Carlos as the external supervisory operator, but the sites, monitoring, backups, and routine recovery continue without it.

## 71. Primary technical references

- [Prometheus alerting rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/)
- [Prometheus Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [Grafana Alloy documentation](https://grafana.com/docs/alloy/latest/)
- [Grafana Alloy: monitor Docker containers](https://grafana.com/docs/alloy/latest/monitor/monitor-docker-containers/)
- [Grafana Loki documentation](https://grafana.com/docs/loki/latest/)
- [PostgreSQL backup and restore](https://www.postgresql.org/docs/current/backup.html)
- [PostgreSQL continuous archiving and point-in-time recovery](https://www.postgresql.org/docs/current/continuous-archiving.html)
- [Supabase database backups](https://supabase.com/docs/guides/platform/backups)
- [Supabase database overview and Storage backup boundary](https://supabase.com/docs/guides/database/overview)
- [Supabase backup and restore using the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
- [restic documentation](https://restic.readthedocs.io/en/stable/)
- [Docker volumes](https://docs.docker.com/engine/storage/volumes/)

---

**End of Section 16**
