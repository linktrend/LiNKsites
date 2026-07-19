# LiNKsites Program Manual

## Section 17 — Domains, DNS, TLS, Forms, Messaging, and External Service Integrations

**Document set:** LiNKsites Program Manual  
**Section:** 17 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, LiNKsites product and engineering agents, domain and infrastructure operators, frontend and backend implementers, integration agents, repository auditors, OpenClaw oversight designers, and future human collaborators  

---

## 1. Purpose of this section

This section defines how a LiNKsites website receives and safely operates on a customer-owned domain, how DNS and TLS are managed, how visitor forms become durable business events, how notifications are delivered, and how external services are connected without weakening the deterministic website factory.

It covers:

- Customer and LiNKsites domain ownership boundaries
- Preview hostnames and production custom hostnames
- Cloudflare for SaaS custom-hostname architecture
- Apex and `www` hostname handling
- DNS discovery, validation, change, rollback, and monitoring
- Domain Control Validation and TLS lifecycle
- Edge-to-origin encryption
- Contact, quote, booking-request, and other website forms
- Spam and abuse controls
- Durable submission storage, outbox processing, and delivery
- Transactional messaging and sender identity
- External-service adapters, OAuth, API keys, and webhooks
- Integration retries, circuit breakers, degradation, and recovery
- Autonomous execution and the OpenClaw boundary

This section does not finalize legal language, consent policy, customer contracts, or customer-facing SLAs. Those matters are intentionally handled later. The architecture must nevertheless preserve the evidence and controls needed to implement the final policy.

## 2. Direct architectural decisions

### 2.1 Who normally owns the customer's domain?

The customer should normally remain the registered owner of its domain and retain access to the registrar account. LiNKsites operates only the DNS records and validations explicitly required to serve and maintain the website.

LiNKtrend must not make a customer dependent on a domain registered anonymously under LiNKtrend's ownership merely for operational convenience.

### 2.2 Must every customer move all DNS to Cloudflare?

No. The preferred scalable model is to connect a customer hostname to a LiNKsites-controlled Cloudflare for SaaS target while the customer retains its authoritative DNS provider.

Full DNS-zone delegation to a LiNKtrend-managed Cloudflare account is an optional service model, not a universal prerequisite.

### 2.3 What hostname should be used if the root domain cannot point to the SaaS target?

LiNKsites may use `www.customer-domain.example` as the primary production hostname and redirect the apex domain to `www`, provided the customer's DNS or registrar supports a safe redirect or another approved apex-routing method.

LiNKsites must not pretend that a normal CNAME works at every zone apex. Apex support depends on the customer's DNS provider, Cloudflare configuration, and purchased capabilities.

### 2.4 Does Cloudflare terminate all encryption?

Cloudflare terminates the public TLS connection at the edge, but traffic from Cloudflare to the LiNKsites origin must also be encrypted and certificate-validated. The target is Full (strict) or an equivalent verified origin mode.

### 2.5 Do forms send directly from the visitor's browser to email?

No. A form submission is first validated and durably stored by a LiNKsites form service. An outbox event then drives email, CRM, webhook, or other delivery. This prevents transient messaging-provider failure from losing the lead.

### 2.6 Must LiNKtrend self-host outbound email?

Not initially. LiNKsites should use a provider adapter and select a reputable transactional messaging service after evaluating cost, deliverability, API quality, and account control. Self-hosting SMTP software is possible but creates reputation, abuse, queue, and deliverability operations that do not need to be part of the first LiNKsites launch.

### 2.7 Are external integrations hard-coded into website components?

No. Website components use stable LiNKsites capability contracts. Provider-specific behavior is isolated behind adapters.

## 3. Governing doctrine

1. **The customer domain is a business asset, not a disposable configuration value.**
2. **Domain ownership, DNS authority, website routing, and TLS authority are separate concepts.**
3. **Make the smallest DNS change that accomplishes the approved outcome.**
4. **Inventory before mutation.** Never modify a DNS zone without preserving its observed records and identifying email and other critical services.
5. **Prevalidate when possible.** Prepare the site, route, and certificate before directing customer traffic.
6. **Fail closed on unknown hostnames.** An unrecognized hostname must never receive another customer's site.
7. **Use end-to-end encryption.** Public-edge TLS does not justify unverified plaintext to the origin.
8. **Store before delivery.** Visitor submissions become durable records before notification or CRM forwarding.
9. **Treat messaging as an asynchronous delivery channel, not the submission database.**
10. **Make integrations replaceable.** Business behavior survives provider change through stable contracts and adapters.
11. **Limit external-service blast radius.** One failing integration must not take down the public website.
12. **Automate routine onboarding and recovery, but require authority for ambiguous or destructive changes.**
13. **OpenClaw supervises exceptions; it does not route domains, terminate TLS, accept forms, or deliver every message.**

## 4. Domain concepts

LiNKsites distinguishes:

| Concept | Meaning |
|---|---|
| Registered domain | The name registered through a registrar, such as `example.com` |
| Registrar | The organization through which registration is maintained |
| Registrant | The legal or account owner of the registered domain |
| Authoritative DNS provider | The system whose nameservers publish the zone records |
| DNS zone | The managed set of records for the domain |
| Apex hostname | The bare domain, such as `example.com` |
| Subdomain hostname | A name under the apex, such as `www.example.com` |
| Canonical hostname | The one public hostname selected as the primary site address |
| Redirect hostname | A secondary hostname that redirects to the canonical hostname |
| Custom hostname | A customer-owned hostname connected to the LiNKsites Cloudflare zone |
| CNAME target | A LiNKsites-owned hostname to which the customer points an eligible hostname |
| Fallback origin | The Cloudflare for SaaS origin used for custom-hostname traffic unless a custom origin is assigned |
| Domain Control Validation | Proof required before a certificate authority issues or renews a certificate |
| Edge certificate | The certificate presented to visitors by Cloudflare |
| Origin certificate | The certificate presented by Traefik or the origin to Cloudflare |

These must not be collapsed into one `domain` text field.

## 5. Domain operating models

### 5.1 Model A — Customer-managed DNS with LiNKsites custom hostname

This is the preferred default.

- Customer retains registrar and authoritative DNS.
- LiNKsites creates the custom-hostname object and validation instructions.
- Customer or an authorized operator creates the minimum required CNAME and validation records.
- Cloudflare routes the customer hostname to the LiNKsites fallback or assigned origin.
- LiNKsites monitors the hostname and certificate state.

Advantages:

- Customer retains control.
- Email and unrelated DNS stay with existing providers.
- LiNKsites avoids managing the entire zone.
- Origin changes can occur behind the stable CNAME target.

Constraints:

- Apex support varies.
- Customer cooperation may be needed.
- Incorrect CAA, DNSSEC, or pre-existing records can block validation.

### 5.2 Model B — LiNKtrend-managed Cloudflare zone

This is optional and requires explicit authority.

- Customer retains registration ownership.
- Authoritative nameservers are changed to the approved Cloudflare zone.
- LiNKsites manages the zone through governed desired state.
- All existing records are inventoried and reconciled before nameserver change.
- Email, verification, and third-party records are preserved.

This model can simplify apex routing and unified edge policy, but it increases LiNKtrend's operational responsibility and failure impact.

### 5.3 Model C — LiNKsites-owned subdomain

This is used for previews, staging, and temporary fallback:

- Example: `site-slug.preview.linksites-domain.example`
- LiNKsites owns DNS and certificate authority for the parent zone.
- No customer registrar access is required.
- The hostname is never presented as proof that the customer's final domain is ready.

### 5.4 Model D — Customer delegates a subdomain

A customer may delegate or CNAME a specific subdomain while retaining its main site and zone elsewhere. This supports landing pages or phased migration. It must be represented as a distinct service scope.

## 6. Recommended Cloudflare for SaaS pattern

The target scalable pattern is:

1. LiNKsites owns a SaaS zone in Cloudflare.
2. LiNKsites configures a CNAME target such as `customers.sites.linktrend.example`.
3. LiNKsites configures a fallback origin that ultimately reaches the appropriate Traefik/frontend runtime.
4. Each customer hostname is created as a Cloudflare custom hostname.
5. Domain and certificate validation are completed.
6. The customer's eligible hostname points by CNAME to the LiNKsites target.
7. The frontend resolves the original hostname to a Customer Site ID and Site Assignment.

Cloudflare for SaaS provides edge routing and certificate handling for customer-owned hostnames. It does not replace LiNKsites hostname-to-site validation at the application layer.

## 7. Apex-domain strategy

The zone apex requires deliberate handling because a conventional CNAME cannot always be placed there.

LiNKsites supports the following ordered strategies:

1. **Primary `www` hostname:** customer creates `www` CNAME to the LiNKsites target; apex redirects to `www` through an approved facility.
2. **Provider-supported apex flattening or ALIAS/ANAME behavior:** use only after compatibility is verified.
3. **Customer zone moved to or already on Cloudflare:** use the supported proxied record and zone configuration.
4. **Cloudflare Apex Proxying or another purchased capability:** use only when the plan and economics justify it.
5. **Alternative approved domain architecture:** record it as an exception with testing and rollback.

The Launch Candidate states which hostname is canonical and how every alternate hostname behaves.

## 8. Domain Record

Every production and preview hostname has a governed Domain Record.

```yaml
domain_record_id: dom_...
site_id: site_...
hostname: www.customer.example
hostname_type: custom-production
canonical_role: primary
registrant_owner: customer
registrar: provider-name
registrar_access_model: customer-controlled
authoritative_dns_provider: provider-name
dns_operating_model: customer-managed-custom-hostname
cloudflare_zone_id: zone-reference
custom_hostname_id: cloudflare-reference
cname_target: customers.sites.linktrend.example
origin_assignment_id: assignment-reference
validation_method: delegated-dcv
hostname_status: active
certificate_status: active
origin_tls_status: verified
observed_dns:
  record_type: CNAME
  value: customers.sites.linktrend.example
  observed_at: timestamp
canonical_redirects:
  - source: customer.example
    target: https://www.customer.example
monitoring_profile_id: profile-reference
last_verified_at: timestamp
```

Raw API tokens and registrar passwords never appear in this record.

## 9. Domain lifecycle

```text
requested
→ discovered
→ authority_pending
→ authority_verified
→ change_planned
→ validation_pending
→ hostname_validated
→ certificate_pending
→ route_ready
→ cutover_pending
→ active
→ monitored
```

Exception states include:

- `blocked_by_dns`
- `blocked_by_caa`
- `blocked_by_dnssec`
- `certificate_failed`
- `routing_failed`
- `rollback_active`
- `customer_action_required`
- `suspended`
- `offboarding`
- `released`

A hostname becomes `active` only when the authoritative Cloudflare state, DNS observation, certificate state, origin route, application Site ID, and public smoke test agree.

## 10. Domain authority evidence

Before LiNKsites makes or requests a production change, it records:

- Customer identity and Site ID
- Exact hostname
- Claimed registrar and DNS provider
- Person or system authorized to approve the change
- Evidence of control through the selected validation method
- Scope of LiNKsites authority
- Expiry or revocation condition for delegated access

Possession of a website logo or public business email address is not sufficient technical proof of DNS control.

## 11. DNS discovery

The discovery stage obtains and records:

- Authoritative nameservers
- DNSSEC status
- Apex A/AAAA/ALIAS behavior
- `www` A/AAAA/CNAME behavior
- MX records
- SPF-related TXT records
- DKIM selector records that can be identified
- DMARC record
- CAA records
- Common verification records
- Other website, API, shop, booking, or app hostnames
- Current TTLs
- Current public website and redirect behavior
- Certificate issuer, names, and expiry

The result is an observed snapshot used for change planning and rollback. Discovery does not grant permission to alter records.

## 12. DNS Change Plan

Every production-domain change has a plan containing:

- Desired record additions, modifications, and removals
- Existing records that must remain untouched
- Canonical-hostname decision
- Validation method
- Certificate-readiness prerequisites
- Proposed TTL changes
- Cutover time window
- Expected propagation behavior
- Pre-cutover and post-cutover tests
- Rollback records and trigger
- Authority and executor
- Customer action instructions, if customer-managed

The plan is machine-readable where possible and has a plain-English version for Carlos or the customer.

## 13. Preserve email and unrelated services

Website onboarding must not overwrite or delete:

- MX records
- SPF, DKIM, and DMARC records
- Mail autodiscovery records
- Verification records for office, analytics, payment, or other services
- Non-website subdomains
- VPN, API, shop, booking, or internal records

A nameserver migration is not approved until the discovered zone and desired zone are compared record by record. A website launch that disables customer email is a failed launch.

## 14. TTL policy

TTL is reduced before a planned cutover only where the current provider and timing allow it. It is restored to the normal governed value after stability is proven.

Automation must account for:

- Existing cached values may remain until their prior TTL expires.
- Authoritative changes are not instantly observed everywhere.
- Repeated changes during propagation create ambiguous state.
- Cloudflare proxied records may expose Cloudflare addresses rather than the origin.

The system observes DNS from multiple resolvers or locations before declaring propagation complete.

## 15. Canonical hostname and redirects

Each site has exactly one canonical production hostname. Alternatives redirect consistently using permanent or temporary status according to the migration state.

The policy defines:

- Apex-to-`www` or `www`-to-apex direction
- HTTP-to-HTTPS redirect
- Path and query preservation
- Removal of redirect loops
- Preview-hostname behavior after production launch
- Search canonical tags and sitemap hostname
- Analytics property hostname

Redirect configuration must be verified through the public edge.

## 16. Preview and staging domains

Preview hostnames are LiNKsites-owned and are isolated from production-domain authority.

They must:

- Resolve only to the intended preview Site ID
- Be clearly marked as preview
- Use their own certificate coverage
- Avoid indexing through appropriate technical controls
- Prevent public form delivery unless explicitly in safe test mode
- Avoid contaminating production analytics
- Expire, redirect, or become inaccessible under the preview lifecycle

The customer domain is never pointed to an uncertified preview runtime merely to simplify launch.

## 17. Custom-hostname creation

For Cloudflare for SaaS, the automation:

1. Confirms the hostname is assigned to exactly one Site ID.
2. Confirms the site has a certified Launch Candidate.
3. Creates the custom-hostname request with the chosen validation method and TLS policy.
4. Records Cloudflare's custom-hostname identifier.
5. Retrieves required validation records.
6. Presents or applies only the approved DNS instructions.
7. Polls the custom-hostname details endpoint under backoff.
8. Confirms hostname status and certificate status are active.
9. Confirms the customer DNS points to the expected target.
10. Runs an external smoke test before completing launch.

Cloudflare's custom-hostname details endpoint is treated as the authoritative provider state. A successful TLS handshake alone is not enough because another matching certificate could mask the actual custom-hostname lifecycle state.

## 18. Domain Control Validation

LiNKsites supports approved Cloudflare methods such as:

- HTTP validation after routing is directed appropriately
- TXT validation before cutover
- Delegated DCV where supported

Selection rules:

- Prefer prevalidation when downtime risk matters.
- Use TXT or delegated validation when certificate readiness must precede traffic cutover.
- Use delegated DCV where a one-time delegation can safely support later renewals.
- Do not use HTTP validation for wildcard needs where the provider states it is unsupported.
- Record validation records so they are not mistakenly deleted after initial activation if renewal depends on them.

## 19. Certificate state

The Certificate Record includes:

- Hostname
- Edge certificate provider reference
- Validation method
- Validation status
- Certificate status
- Issuer
- Covered names
- Minimum TLS version policy
- Issue and expiry timestamps where exposed
- Renewal state
- Last successful public TLS probe
- Origin certificate identity and expiry
- Failure and retry history

Certificate monitoring warns before service impact and distinguishes validation failure from origin-certificate failure.

## 20. TLS layers

LiNKsites uses two encrypted connections:

```text
Visitor browser
  ⇄ public TLS
Cloudflare edge
  ⇄ verified origin TLS
Traefik / LiNKsites origin
```

The public certificate proves the customer hostname to the visitor. The origin certificate proves the intended origin to Cloudflare. These are separate certificates with separate lifecycle and monitoring.

## 21. Origin TLS policy

The target Cloudflare mode is Full (strict) or an equivalent configuration that verifies an unexpired origin certificate issued by a trusted authority or Cloudflare Origin CA and matching the origin hostname.

The origin:

- Accepts HTTPS on the approved port
- Presents the intended certificate
- Does not rely on Flexible SSL
- Rejects or redirects plaintext traffic according to policy
- Restricts direct-origin access under Section 18
- Supports automated renewal or replacement
- Exposes no customer secrets in certificate configuration

Authenticated Origin Pulls may be evaluated as an additional origin-protection control, but it does not replace application tenant resolution.

## 22. Origin certificate alternatives

LiNKsites may use:

1. A Cloudflare Origin CA certificate where traffic is intentionally restricted through Cloudflare.
2. A publicly trusted ACME certificate managed through Traefik or another approved issuer.
3. A provider-managed certificate for a verified origin service.

The implementation selects one primary method and documents renewal and recovery. It must not create competing automated certificate managers for the same hostname without a clear ownership rule.

## 23. Certificate renewal

The renewal control loop:

1. Observes provider certificate and validation state.
2. Warns before the renewal-risk window.
3. Verifies required DNS or delegated-validation records still exist.
4. Triggers only approved revalidation or retry operations.
5. Tests the renewed certificate from outside the origin.
6. Records issuer, names, expiry, and evidence.
7. Escalates when retry backoff approaches service risk.

Deleting a validation record merely because the first certificate is active is prohibited unless provider documentation and the specific method confirm it is unnecessary for renewal.

## 24. CAA records

CAA records can restrict which certificate authorities may issue for a domain. During onboarding, LiNKsites:

- Discovers existing CAA records.
- Determines whether the chosen Cloudflare certificate authority can issue.
- Proposes only the minimum required change.
- Preserves unrelated authorized issuers.
- Verifies public resolution after change.

CAA failure is reported as a certificate-validation problem, not worked around by disabling TLS validation.

## 25. DNSSEC

LiNKsites observes DNSSEC state before nameserver or zone changes.

Nameserver migration must coordinate DS records and zone signing so an old DS record does not cause `SERVFAIL`. DNSSEC is not casually disabled as a generic troubleshooting step. Changes require a provider-specific plan and validation from independent resolvers.

## 26. Domain cutover gate

Production cutover requires:

1. Customer Site ID and hostname mapping are unique.
2. Launch Candidate is certified.
3. Target runtime and fallback origin are healthy.
4. Custom hostname is created.
5. Domain and certificate validation are active or the approved cutover method explicitly requires routing first.
6. DNS plan and rollback are ready.
7. Current email and unrelated records are preserved.
8. Monitoring is active.
9. Form and integration test modes are resolved.
10. External smoke test passes after the change.

The cutover Run records every observation and provider response.

## 27. Domain rollback

Rollback restores the previously recorded routing state when:

- Certificate activation fails beyond the approved window.
- The hostname reaches the wrong Site ID.
- Critical pages or assets fail.
- Customer email or another service is disrupted.
- Redirect loops occur.
- Origin or Cloudflare routing is inconsistent.

Rollback does not delete the Incident Record or evidence. DNS propagation limitations are reflected in status until the rollback is externally observed.

## 28. Domain migration

For an existing website, migration includes:

- Crawl and content transition under Sections 9–14
- Current DNS and certificate inventory
- New route and certificate prevalidation
- Reduced TTL where useful
- Scheduled cutover
- Old-host access retained for rollback
- Redirect mapping if URLs change
- Public verification
- Monitoring comparison
- Delayed decommission of the old host

Domain migration is not complete merely because the homepage loads.

## 29. Domain monitoring

LiNKsites monitors:

- Authoritative nameservers
- Expected A/AAAA/CNAME behavior
- Custom-hostname provider state
- Edge certificate state and expiry
- Origin certificate state and expiry
- HTTP and HTTPS behavior
- Canonical redirects
- Customer Site ID marker
- DNSSEC resolution
- Required DCV records
- Unexpected changes to protected records

Drift creates an Operations Issue. A hostname pointing to an unknown Site ID is treated as a high-severity isolation risk.

## 30. Customer-domain offboarding

Offboarding follows an explicit state transition:

1. Confirm authority and effective date.
2. Preserve required records and customer export.
3. Provide DNS transition instructions.
4. Stop new LiNKsites changes.
5. Confirm customer traffic moved or service termination authority.
6. Remove custom-hostname and certificate bindings under policy.
7. Remove Site Assignment acceptance for the hostname.
8. Retain audit evidence.
9. Revoke delegated credentials.

LiNKsites must never continue answering a former customer's hostname with another customer's site.

## 31. Form-service architecture

A public website form uses this flow:

```text
Visitor form
→ same-origin LiNKsites endpoint
→ schema and abuse validation
→ durable Form Submission
→ transactional Outbox Event
→ delivery workers
   → customer notification
   → LiNKtrend Sales / Odoo handoff
   → approved webhook or integration
→ delivery status and retry
```

The form endpoint may run in the frontend platform or a dedicated service, but it uses the same governed Site ID resolution and central operational data layer.

## 32. Form Definition

Every form is generated from a versioned Form Definition.

```yaml
form_definition_id: frmdef_...
site_id: site_...
form_key: contact-primary
version: 3
status: active
purpose: contact-request
fields:
  - key: name
    type: short_text
    required: true
    max_length: 120
  - key: email
    type: email
    required: true
  - key: phone
    type: phone
    required: false
  - key: message
    type: long_text
    required: true
    max_length: 3000
abuse_profile_id: standard-public-form
delivery_profile_id: customer-contact-v1
success_behavior: inline-confirmation
analytics_event: contact_form_accepted
```

The rendered form and server validator use the same definition version.

## 33. Form Submission

```yaml
submission_id: sub_...
site_id: site_...
form_definition_id: frmdef_...
form_version: 3
received_at: timestamp
status: accepted
idempotency_key: generated-key
source_hostname: www.customer.example
source_path: /contact
payload_encrypted_or_structured_ref: record-reference
abuse_evaluation:
  turnstile: passed
  rate_limit: passed
  honeypot: clear
delivery_events:
  - outbox_event_id: evt_...
retention_profile_id: profile-reference
```

The record uses normalized fields where needed and protects raw visitor content according to Section 18.

## 34. Server-side validation

The backend validates:

- Hostname maps to the declared Site ID.
- Form Definition belongs to that site and is active.
- Submitted definition version is accepted.
- Required fields exist.
- Unknown fields are rejected or ignored according to schema policy.
- Types, lengths, and formats are valid.
- Payload size is within limits.
- Origin and request context meet policy.
- Abuse controls pass.
- Idempotency does not indicate an already accepted submission.

Client-side validation improves usability but never replaces backend validation.

## 35. Turnstile validation

Cloudflare Turnstile is the recommended initial bot-challenge layer for public forms because it integrates with the selected edge architecture.

The server must call the Siteverify endpoint. Client-side widget success alone is not trusted.

Current provider behavior includes:

- Tokens expire after five minutes.
- Tokens are single-use.
- Validation supports an idempotency key.
- Expired or repeated tokens fail.

LiNKsites records the validation result and error class, not the secret key or reusable token.

Turnstile is one signal, not the entire abuse system.

## 36. Layered spam and abuse controls

The form-service profile may combine:

- Cloudflare edge rules
- Per-IP and per-site rate limits
- Turnstile
- Honeypot fields
- Minimum plausible completion time
- Duplicate-content detection
- Disposable or malformed address signals
- URL and payload pattern limits
- Site-specific allow or block policy
- Quarantine instead of destructive discard for ambiguous submissions

AI classification may assist after durable receipt, but the public request path should not require an expensive frontier model for every submission.

## 37. Form-response semantics

The visitor receives success only after the submission is durably accepted, not after every downstream notification is delivered.

Responses distinguish:

- `accepted`: stored and scheduled for delivery
- `duplicate_accepted`: original is already stored
- `validation_failed`: visitor-correctable field error
- `challenge_failed`: abuse validation failed
- `temporarily_unavailable`: safe retry may be offered
- `rejected`: request violates fixed policy

Public responses do not reveal internal provider details, spam scores, database errors, or customer email addresses.

## 38. Idempotency

Forms use an idempotency key tied to Site ID, form, and a bounded submission attempt. If the browser retries after a timeout, LiNKsites returns the recorded result rather than creating duplicate leads and notifications.

Delivery workers also use stable idempotency keys per destination so an email or CRM record is not duplicated merely because acknowledgement was lost.

## 39. Transactional outbox

The accepted Form Submission and its Outbox Event are committed atomically in the same authoritative transaction where the selected data design allows it.

The Outbox Event records:

- Event ID
- Submission ID
- Site ID
- Event type
- Destination capability
- Payload reference
- Attempt count
- Next attempt time
- Delivery state
- Last error class
- Provider message or object reference

Workers claim events safely, deliver them, record outcomes, and retry under policy. The outbox removes the unsafe gap between “database accepted” and “notification requested.”

## 40. Form-delivery destinations

Approved destinations may include:

- Customer notification email
- Customer CRM or helpdesk
- LiNKtrend Sales/Odoo lead record
- Customer-owned webhook
- Booking or scheduling system
- SMS or messaging notification
- Internal fraud or abuse review

Each destination has its own adapter, credentials, retry policy, and delivery state. Failure of one destination does not erase or block the others unless the business rule explicitly requires coordinated delivery.

## 41. Customer notification

The standard contact-form notification contains:

- Customer site identity
- Form purpose
- Submission timestamp
- Structured visitor fields
- Safe link to the authoritative submission record where available
- Delivery/reference identifier

Visitor-provided content is escaped and must not control headers, recipients, templates, or executable links.

The notification email is a delivery copy. It is not the only stored copy of the lead.

## 42. Form receipt to visitor

An optional visitor acknowledgement may be sent after acceptance. It uses a governed template and does not promise a response time unless the customer has approved that promise.

Acknowledgement failure does not change the accepted status of the lead. Bounce and delivery events are recorded separately.

## 43. File uploads

Public file uploads are disabled by default because they add malware, storage, privacy, validation, and delivery complexity.

Where a tier or vertical requires uploads, the workflow includes:

- Explicit allowed file types and size
- Content inspection and malware scanning
- Private object storage
- Randomized non-guessable object identity
- No direct execution or public serving
- Retention and deletion profile
- Authorized download path
- Quarantine state
- Delivery by reference, not giant email attachment

## 44. Form changes

Customer-requested form changes produce a new Form Definition version. Existing submissions retain the version used at receipt.

The change workflow tests:

- Frontend rendering
- Server validation
- Abuse controls
- Durable storage
- Every required delivery adapter
- Success and error experience
- Analytics event
- Mobile and accessibility behavior

## 45. Messaging capability model

LiNKsites treats messaging as capabilities rather than provider names:

- `send_transactional_email`
- `send_visitor_acknowledgement`
- `notify_customer_of_lead`
- `send_sms_notification`
- `dispatch_webhook`
- `record_crm_lead`

An adapter implements each capability for a selected provider. Provider replacement does not change website components or Form Definitions.

## 46. Transactional versus marketing messaging

LiNKsites form notifications and visitor receipts are transactional messages triggered by a specific website event.

Bulk prospecting, nurture sequences, newsletters, and campaigns belong to LiNKtrend Sales or the customer's own marketing system. They must not be mixed into the transactional form-delivery queue merely because both use email.

This separation protects reliability, reputation, metrics, permissions, and operational clarity.

## 47. Sender-identity models

LiNKsites supports controlled alternatives:

1. **LiNKsites service sender:** messages originate from a LiNKtrend-controlled operational domain and identify the customer site in the content.
2. **Customer-domain sender:** customer authorizes and configures required DNS authentication for a subdomain or sender.
3. **Customer provider connection:** LiNKsites dispatches through an approved customer-owned messaging account.

Visitor email addresses must normally be placed in a safe reply-to field, not forged as the authenticated sender.

## 48. SPF, DKIM, and DMARC

When sending from a customer or LiNKtrend domain, the messaging onboarding plan covers:

- SPF authorization without creating invalid multiple SPF policies
- DKIM signing and selector records
- DMARC alignment and policy observation
- Return-path and bounce domain behavior
- Provider verification records

LiNKsites must not overwrite existing email authentication records. DNS discovery and a merged change plan are required.

Exact policy strength and legal content are decided with the messaging owner; the technical system records and monitors the selected state.

## 49. Deliverability operations

Messaging monitoring includes:

- API acceptance
- Provider queue or delivery state where exposed
- Bounce rate and bounce class
- Complaint events
- Suppression state
- Sender-domain authentication
- Rate limits and quota
- Template error
- Provider outage
- Delivery latency

Repeated hard bounces are not retried indefinitely. Transient failures use bounded backoff. Provider acceptance is not represented as guaranteed inbox delivery.

## 50. Messaging provider adapter

The adapter contract includes:

```yaml
capability: send_transactional_email
request:
  site_id: site_...
  message_id: msg_...
  template_id: template_...
  template_version: 2
  sender_profile_id: sender_...
  recipients:
    - recipient-reference
  data_ref: encrypted-data-reference
  idempotency_key: stable-key
response:
  accepted: true
  provider_message_id: provider-ref
  provider_status: queued
  retryable: false
```

Provider-specific fields do not leak into website components.

## 51. Message templates

Templates are versioned assets with:

- Purpose
- Allowed sender profiles
- Required and optional variables
- Subject and body variants
- Plain-text and HTML forms where applicable
- Localization where supported
- Test fixtures
- Rendering and injection checks
- Approval state

Visitor data is inserted only into declared escaped variables.

## 52. Bounce and complaint webhooks

Messaging providers may report later events through webhooks. LiNKsites:

1. Authenticates the webhook.
2. Stores the raw event securely or records a verifiable digest and normalized payload.
3. Deduplicates by provider event ID.
4. Maps it to the internal Message ID.
5. Updates delivery state.
6. Applies suppression or retry policy.
7. Creates an Operations Issue when thresholds are exceeded.

Webhook receipt never trusts an unverified public request merely because it contains a plausible provider name.

## 53. Inbound replies

LiNKsites does not need to become a general mailbox system.

Replies may:

- Go directly to an approved customer mailbox through `Reply-To`.
- Enter a connected customer support or CRM system.
- Enter a controlled inbound-message adapter if later required.

Any inbound adapter must map messages to Site ID and Submission ID without exposing unrelated customer correspondence.

## 54. External-integration categories

LiNKsites may connect customer sites to:

- Analytics
- Search and webmaster tools
- Maps and directions
- Appointment booking
- CRM and helpdesk
- Payment or checkout links
- Reviews and reputation platforms
- Social profiles and feeds
- Chat and messaging widgets
- Newsletter signup
- E-commerce or catalog services
- Telephone and call-tracking services
- Customer automation webhooks
- LiNKtrend Sales, Odoo, Stripe, and shared services

Not every integration belongs in every tier. The Site Specification and service tier determine allowed capabilities.

## 55. Integration doctrine

An integration must have:

- A named business purpose
- A stable capability contract
- A provider adapter
- Site-scoped configuration
- Credential ownership and access model
- Test mode or fixture
- Timeout, retry, and idempotency rules
- Failure behavior
- Monitoring and alerting
- Data mapping
- Offboarding and revocation
- Cost and quota visibility where applicable

A copied script tag with unknown ownership is not a completed integration.

## 56. Integration Record

```yaml
integration_id: int_...
site_id: site_...
capability: appointment_booking
provider_adapter: provider-adapter-v1
status: active
credential_ref: secret-reference
configuration:
  booking_page_id: external-reference
environment: production
allowed_origins:
  - https://www.customer.example
webhook_profile_id: profile-reference
timeout_ms: 3000
retry_policy_id: external-standard
circuit_breaker_id: site-booking-provider
last_verified_at: timestamp
last_success_at: timestamp
```

Sensitive provider configuration is referenced, not embedded in public CMS content.

## 57. Adapter boundary

Website and Program logic call a LiNKsites interface such as:

```text
create_booking_request()
record_lead()
send_transactional_email()
resolve_map_location()
start_checkout()
emit_analytics_event()
```

The adapter translates this into the provider API. This boundary permits:

- Provider replacement
- Test doubles
- Central timeout and retry policy
- Common audit records
- Site-level quotas
- Consistent errors
- Gradual migration

## 58. Credential ownership

Every integration states whether credentials belong to:

- LiNKtrend shared platform
- LiNKsites service account
- Individual customer account
- Customer-authorized delegated application

Shared LiNKsites credentials must not allow one site to access another customer's provider data. Customer credentials are stored under site-scoped access controls.

Detailed secrets architecture appears in Section 18.

## 59. OAuth connections

Where OAuth is available, LiNKsites prefers delegated authorization over collecting customer passwords.

The OAuth flow records:

- Customer and Site ID
- Provider and requested scopes
- Redirect and state validation
- Authorization initiator
- Token reference and expiry
- Refresh behavior
- Revocation state
- Last successful use

Scopes are limited to the capability required. Reauthorization becomes an explicit customer-action state.

## 60. Outgoing API calls

All external calls use:

- Explicit connect and response timeouts
- Retry only for classified transient conditions
- Exponential backoff and jitter
- Idempotency key where supported
- Bounded concurrency
- Per-site and provider rate limits
- Structured request and response metadata without secrets
- Circuit breaker
- Correlation to Issue, Run, Submission, or Site ID

The website must not wait indefinitely for a third-party provider.

## 61. Incoming webhooks

An incoming webhook endpoint:

1. Identifies the provider and integration without trusting arbitrary payload fields.
2. Verifies signature, secret, certificate, or approved authentication mechanism.
3. Enforces timestamp or replay window where supported.
4. Reads the raw body if signature verification requires exact bytes.
5. Deduplicates the provider event.
6. Stores or queues the event durably.
7. Returns promptly.
8. Processes business actions asynchronously.
9. Records success, failure, and retry.

Webhook endpoints are site-scoped or map deterministically to one Integration Record.

## 62. Outgoing webhooks

Customer-configured outgoing webhooks include:

- HTTPS-only destination
- Verification or signing method
- Event allowlist
- Site-scoped payload
- Stable event ID
- Timestamp
- Signature
- Timeout
- Attempt number
- Retry schedule
- Disable threshold

The customer receives documentation for signature verification. Repeatedly failing endpoints enter `degraded` or `suspended`, while the underlying Form Submission remains stored.

## 63. Integration idempotency

The internal Event ID is stable across retries. Adapters pass it as the provider idempotency key where supported. If not supported, LiNKsites records a delivery lock and provider reference to reduce duplicates.

An executor crash after provider acceptance but before local acknowledgement produces an `outcome_unknown` state that is reconciled through provider lookup or safe policy—not a blind repeat.

## 64. Circuit breakers

An integration circuit breaker opens when repeated failure indicates that continued calls would add latency, cost, or abuse.

States are:

- `closed`: normal requests allowed
- `open`: fast failure or queued fallback
- `half_open`: limited probe requests

The public site continues to render. Forms continue to store locally where safe. Optional widgets may display a controlled fallback or disappear without breaking layout.

## 65. External-service failure behavior

| Integration failure | Required website behavior |
|---|---|
| Analytics unavailable | Page still loads; event may be dropped or queued under policy |
| Map unavailable | Address and directions link remain available |
| Booking provider unavailable | Offer stored booking request or contact route if configured |
| Messaging provider unavailable | Store form; queue notification; alert on delivery age |
| CRM unavailable | Store form; retry outbox handoff |
| Chat widget unavailable | Site content and contact form remain usable |
| Payment-link provider unavailable | Do not claim payment succeeded; show controlled retry or alternate approved contact path |

An optional external script must not block the core page-rendering path.

## 66. Third-party frontend scripts

Scripts for analytics, chat, maps, reviews, booking, or advertising are governed assets.

LiNKsites records:

- Provider
- Purpose
- Pages loaded
- Loading strategy
- Performance budget
- Integrity or source restrictions where applicable
- Configuration owner
- Environment
- Failure behavior
- Removal procedure
- Last review

Scripts load asynchronously or after interaction where appropriate. A template must not accumulate uncontrolled third-party tags across customers.

## 67. Analytics integrations

Analytics configuration is site-scoped and environment-aware.

It distinguishes:

- Preview and production properties
- Customer-owned and LiNKtrend-owned measurement
- Page views and approved conversion events
- Form acceptance versus downstream delivery
- Internal probes and test traffic
- Canonical hostname
- Cross-domain behavior where required

The final consent and retention policy is handled later, but engineering must allow analytics to be enabled, disabled, and configured without code forks.

## 68. Maps and location

Location components use a structured business address and a provider adapter or approved embed. They preserve a plain-text address and accessible directions link when the map fails.

Provider API keys are never embedded with unrestricted authority. Browser-exposed keys, where technically required, receive domain and API restrictions.

## 69. Booking and scheduling

Booking may be:

- A governed external link
- An embedded provider component
- A LiNKsites request form handed to a scheduling workflow
- A provider API integration

The tier and customer requirement determine the depth. A booking widget is not treated as reliable until availability, mobile behavior, timezone, confirmation, and failure behavior are tested.

## 70. Chat and messaging widgets

Chat is optional. A widget must not:

- Block page load
- Overlap critical mobile controls
- Inject unapproved branding or tracking
- Expose credentials
- Become the only contact method
- Create a cross-customer account mapping

The fallback is the durable LiNKsites form or direct approved contact route.

## 71. Social and review integrations

Simple links are preferred where live embeds add unnecessary performance, tracking, or failure cost. Live feeds or review widgets require:

- Provider ownership verification
- Cache and quota behavior
- Content-failure fallback
- Visual containment
- Site-specific configuration
- Removal path

The website does not depend on scraping a social page during every request.

## 72. Odoo, Stripe, and LiNKtrend Sales boundary

This section defines the integration mechanics, not the cross-Program business contract.

- Form events may create or update LiNKtrend Sales/Odoo records through a versioned adapter.
- Stripe payment events may update order and service state through authenticated webhooks.
- Neither Odoo nor Stripe becomes the website content database.
- Website rendering continues during temporary CRM unavailability.
- Payment success is accepted only from verified provider state, not a browser redirect alone.

Section 21 defines the authoritative cross-Program identities, events, and state transitions.

## 73. Integration testing

Every adapter has:

- Unit tests for mapping and error classification
- Contract tests against fixtures or provider sandbox
- Authentication-failure test
- Timeout and rate-limit test
- Retry and idempotency test
- Webhook signature and replay test
- Site-isolation test
- Degraded-mode test
- Offboarding and revocation test

Production credentials are not required for ordinary automated tests.

## 74. Launch integration certification

Before production activation, LiNKsites verifies:

- Correct Site ID and environment
- Credential scope
- Provider account ownership
- Required DNS records
- Form Definition and endpoint
- Durable submission storage
- Delivery destinations
- Test event and provider acknowledgement
- Failure fallback
- Monitoring
- Customer-visible labels and links

Test leads, test bookings, and test payments are clearly marked and removed or retained under test-data policy.

## 75. Integration observability

Metrics include:

- Calls and latency by capability and provider
- Success, retryable failure, permanent failure, and outcome-unknown counts
- Queue depth and oldest-event age
- Circuit-breaker state
- Rate-limit and quota consumption
- Authentication expiry
- Webhook receipt and processing delay
- Form acceptance and destination-delivery counts
- Bounce and complaint rates
- Cost where provider data permits

Labels use bounded provider, capability, environment, and safe Site ID values. Raw visitor data never becomes a metric label.

## 76. Integration incidents

Runbooks cover:

- Domain validation stuck
- Certificate renewal risk
- DNS drift
- Wrong-site hostname mapping
- Form endpoint unavailable
- Submission queue growth
- Messaging provider outage
- CRM outage
- OAuth token expiry
- Webhook signature failures
- Provider quota exhaustion
- Repeated duplicate events
- Third-party script breaking layout or performance

Section 16 supplies the common Incident Record, severity, retry, recovery, and verification doctrine.

## 77. Autonomous operations

Routine autonomous actions may include:

- Discover and compare DNS records
- Create a prepared custom-hostname object
- Poll validation and certificate state
- Apply pre-approved LiNKtrend-controlled DNS records
- Generate customer-specific DNS instructions
- Retry validation under provider backoff rules
- Renew or replace origin certificates
- Run public TLS and routing probes
- Disable a failing optional widget
- Retry outbox deliveries
- Open or close an integration circuit breaker
- Refresh OAuth tokens through the approved flow
- Quarantine suspicious form submissions

Actions needing authority include:

- Changing customer nameservers
- Removing or overwriting existing DNS records
- Modifying MX or mail-authentication records
- Transferring a domain
- Changing canonical production hostname
- Revoking customer-owned credentials
- Accepting prolonged form-delivery loss
- Sending unapproved bulk messages
- Connecting a provider account whose ownership is ambiguous

## 78. OpenClaw role

OpenClaw may:

- Explain DNS instructions to Carlos or prepare customer-facing steps
- Summarize validation blockers
- Coordinate an authorized cutover
- Interpret a provider incident
- Present failed-form or messaging exceptions
- Ask for authority when an action crosses the automatic boundary
- Verify that the chosen runbook completed

OpenClaw does not need to be available for DNS resolution, TLS handshakes, form acceptance, outbox delivery, OAuth refresh, webhook receipt, or routine certificate monitoring.

## 79. Repository audit requirements

The engineering audit must determine:

1. Which domains and Cloudflare zones already exist.
2. Whether Cloudflare for SaaS is configured and on what plan.
3. Whether a CNAME target and fallback origin exist.
4. How custom hostnames are currently created and mapped.
5. Whether apex routing is assumed to work universally.
6. Whether preview and production domains are separated.
7. Where hostname-to-Site ID resolution occurs.
8. Whether unknown hostnames fail closed.
9. Whether DNS records are inventoried before mutation.
10. Whether MX, SPF, DKIM, DMARC, CAA, and DNSSEC are handled safely.
11. Whether domain authority and customer approval are recorded.
12. Whether custom-hostname and certificate provider states are stored.
13. Which DCV methods are implemented.
14. Whether edge and origin TLS are independently verified.
15. Whether Cloudflare uses Full (strict) or an equivalent verified-origin policy.
16. Which component owns origin certificates and renewal.
17. Whether a domain rollback path exists.
18. Whether forms are hard-coded per site or definition-driven.
19. Whether backend validation uses the same Form Definition version as the frontend.
20. Whether Turnstile is validated server-side.
21. Whether accepted forms are durably stored before notification.
22. Whether a transactional outbox exists.
23. Whether idempotency prevents duplicate leads and deliveries.
24. Where visitor submissions are stored and protected.
25. Whether file uploads exist and how they are scanned.
26. Which email provider or SMTP infrastructure exists.
27. Whether transactional and marketing messaging are separated.
28. How SPF, DKIM, DMARC, bounce, complaint, and suppression are handled.
29. Which external integrations and embedded scripts already exist.
30. Whether providers are isolated behind adapters.
31. Where OAuth tokens and API keys are stored.
32. Whether webhook signatures and replay controls are implemented.
33. Whether integrations have timeout, retry, idempotency, and circuit breakers.
34. Whether one failing integration can block page rendering.
35. Whether Odoo, Stripe, and Sales handoffs already use stable identities.
36. Which operations require OpenClaw and whether any runtime dependency is inappropriate.

Each item is reported as `implemented`, `partial`, `conflicting`, `obsolete`, `missing`, or `unknown`, with repository and runtime evidence.

## 80. Initial implementation sequence

### Phase 1 — Domain and integration inventory

- Inventory existing domains, zones, certificates, forms, messaging services, and provider connections.
- Classify ownership, authority, and environment.
- Identify unsafe shared secrets and hard-coded provider logic.

### Phase 2 — Hostname foundation

- Implement Domain Record and lifecycle.
- Configure LiNKsites preview zone.
- Implement strict hostname-to-Site ID resolution.
- Build DNS discovery and comparison.

### Phase 3 — Cloudflare for SaaS

- Configure the SaaS zone, CNAME target, and fallback origin.
- Implement custom-hostname API adapter.
- Implement DCV state, certificate state, public verification, and rollback.
- Prove `www` onboarding and document apex alternatives.

### Phase 4 — Origin TLS

- Select origin-certificate ownership.
- Enforce Full (strict) or equivalent.
- Automate monitoring, renewal, and failure recovery.

### Phase 5 — Form service

- Implement Form Definition, Submission, validation, Turnstile, idempotency, and transactional outbox.
- Prove durable storage before notification.
- Add site isolation and abuse controls.

### Phase 6 — Transactional messaging

- Select provider through the adapter contract.
- Implement templates, sender profiles, DNS authentication, delivery events, bounce, and suppression.
- Keep marketing messaging outside this path.

### Phase 7 — Integration framework

- Implement Integration Record, secret references, adapter interface, OAuth, webhook gateway, retries, circuit breakers, and observability.
- Migrate existing provider-specific code behind adapters.

### Phase 8 — Launch certification

- Test end-to-end domain, TLS, form, message, and integration workflows.
- Exercise provider outage, DNS rollback, token expiry, and duplicate webhook scenarios.
- Connect Section 16 monitoring and runbooks.

## 81. Decisions intentionally still open

- Final Cloudflare plan and custom-hostname limits
- Whether `www` or apex is the default canonical hostname
- Which apex alternatives are offered by tier
- Whether LiNKtrend-managed DNS is a paid service or included capability
- Preferred DCV method by onboarding model
- Origin CA versus public ACME certificate
- Whether Authenticated Origin Pulls are used initially
- Transactional email provider
- LiNKtrend service-sender domain and naming
- Whether customer-domain sending is offered in every tier
- Form retention and file-upload policy
- SMS, WhatsApp, and voice-notification providers
- Default analytics provider
- Supported booking, chat, CRM, and review adapters at launch
- Customer-facing integration pricing and limits
- Final legal wording, consent, retention, and communication policy

These decisions do not prevent implementation of the stable records, state machines, adapter boundaries, and verification framework.

## 82. Acceptance criteria

This part of LiNKsites is adequately implemented when:

1. Every hostname maps to exactly one Customer Site ID or fails closed.
2. Customer domain registration ownership remains explicit and recoverable.
3. Customer-managed DNS is supported without requiring universal nameserver transfer.
4. LiNKsites can onboard an eligible custom hostname through Cloudflare for SaaS.
5. CNAME-target, fallback-origin, custom-hostname, certificate, route, and Site Assignment states agree.
6. Apex limitations are handled explicitly rather than hidden by assumptions.
7. Every site has one canonical production hostname and tested redirects.
8. DNS discovery preserves MX and other unrelated service records.
9. Nameserver and DNS changes have authority, plan, verification, and rollback.
10. CAA and DNSSEC conditions are detected and handled safely.
11. Domain and certificate validation are monitored through renewal.
12. Public TLS and verified origin TLS are both active.
13. Cloudflare-to-origin traffic uses Full (strict) or an equivalent verified-certificate policy.
14. Preview domains are isolated from production and cannot accidentally deliver real leads.
15. Form rendering and backend validation share a versioned Form Definition.
16. Turnstile or its approved replacement is validated on the server.
17. Every accepted submission is durably stored before any delivery attempt.
18. A transactional outbox prevents messaging or CRM outage from losing leads.
19. Form and delivery retries are idempotent.
20. Visitor data cannot control recipients, headers, templates, or executable content.
21. Public file upload is disabled unless its full secure workflow exists.
22. Transactional website messaging remains separate from prospecting and campaigns.
23. Sender identities and SPF, DKIM, and DMARC records are governed without overwriting existing email configuration.
24. Bounce, complaint, suppression, and provider-delivery events are recorded.
25. External services use stable capability adapters and site-scoped Integration Records.
26. OAuth scopes and API credentials are limited and revocable.
27. Incoming webhooks are authenticated, deduplicated, and replay-controlled.
28. Outgoing calls have timeouts, bounded retries, idempotency, and circuit breakers.
29. Optional third-party failure does not take down core site content or form storage.
30. Domain, form, messaging, and integration metrics connect to Section 16 incidents and runbooks.
31. Routine operations can proceed autonomously within defined authority.
32. OpenClaw assists with exceptions without becoming a runtime dependency.

## 83. Governing conclusion

LiNKsites should give each customer a professional custom domain without taking unnecessary ownership of the customer's digital identity. The customer normally retains the registrar and authoritative DNS account, while LiNKsites uses Cloudflare for SaaS custom hostnames, a stable CNAME target, and a governed fallback origin to route approved hostnames into the shared frontend platform. Full-zone management is optional. Apex limitations are handled honestly, with `www` as a practical primary hostname where necessary.

Domain activation is a controlled state transition. Authority, current DNS, validation, certificate state, origin encryption, Site Assignment, canonical redirects, monitoring, and rollback must all agree. Public traffic is encrypted to Cloudflare and from Cloudflare to a verified origin. Email and unrelated DNS records are preserved.

Forms are durable business-event systems, not browser-to-email shortcuts. The server validates the form and Site ID, applies layered abuse controls, stores the submission, and commits an outbox event before attempting customer email, CRM, or webhook delivery. Messaging and external providers sit behind replaceable adapters with idempotency, timeouts, retry policy, circuit breakers, and observability. A provider outage delays a delivery; it does not erase the lead or break the website.

Known domain, certificate, form, and integration operations can run autonomously through deterministic executors. OpenClaw helps Carlos understand and authorize exceptional changes, but DNS, TLS, form acceptance, and routine delivery continue without it.

## 84. Primary technical references

- [Cloudflare for SaaS overview](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/)
- [Configuring Cloudflare for SaaS](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/getting-started/)
- [Cloudflare custom hostnames](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/domain-support/)
- [Create Cloudflare custom hostnames](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/domain-support/create-custom-hostnames/)
- [Cloudflare Domain Control Validation](https://developers.cloudflare.com/ssl/edge-certificates/changing-dcv-method/)
- [Cloudflare delegated DCV](https://developers.cloudflare.com/ssl/edge-certificates/changing-dcv-method/methods/delegated-dcv/)
- [Cloudflare Full (strict) origin encryption](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/)
- [Cloudflare DNS record management](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/)
- [Cloudflare Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [RFC 1034 — Domain Names: Concepts and Facilities](https://www.rfc-editor.org/rfc/rfc1034)
- [RFC 7208 — Sender Policy Framework](https://www.rfc-editor.org/rfc/rfc7208)
- [RFC 6376 — DomainKeys Identified Mail](https://www.rfc-editor.org/rfc/rfc6376)
- [RFC 7489 — Domain-based Message Authentication, Reporting, and Conformance](https://www.rfc-editor.org/rfc/rfc7489)

---

**End of Section 17**
