# LiNKsites Program Manual

## Section 03 — Product Definition, Customer Outcomes, Service Tiers, and Commercial Assumptions

**Document set:** LiNKsites Program Manual  
**Section:** 03 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, product and engineering agents, repository auditors, implementation agents, operators, OpenClaw overseers, commercial planners, and future human collaborators  

---

## 1. Purpose of this section

This section defines the LiNKsites customer product and the commercial assumptions that the Program architecture must support. It explains what is actually sold, what outcome the customer should receive, how tiered service should work, which elements are included in every acceptable product, which elements vary by package, and which commercial decisions remain intentionally configurable.

The purpose is not to lock an untested price list prematurely. The purpose is to ensure that an engineering team or AI implementation agent builds a system capable of supporting the intended business model without embedding speculative prices, unsupported promises, or one-off customer arrangements into code.

This section must be read together with the distinction between:

- **Progressive Sales Proof Levels**, which control LiNKtrend's speculative investment before a sale; and
- **Paid Service Tiers**, which define what a customer purchases and is entitled to receive.

These are separate systems and must never be represented by the same field, status, or pricing logic.

## 2. Product definition

LiNKsites sells a **managed SMB website service**.

The customer is purchasing the continuing business outcome of having an appropriate, functioning, professionally presented, hosted, maintained website. The customer is not merely purchasing:

- A generated code bundle
- A theme license
- Access to Payload CMS
- A place on a VPS
- A one-time AI generation run
- A collection of images and copy
- A generic template with the name replaced
- Technical infrastructure that the customer must operate alone

Those elements may contribute to production, but none individually constitutes the complete product.

The LiNKsites product combines:

1. Website planning and specification
2. Governed design selection
3. Reusable foundation selection or creation
4. Business-specific adaptation
5. Copy and media preparation
6. Frontend assembly
7. CMS content creation and publication
8. Functional and quality validation
9. Domain and launch provisioning
10. Managed hosting
11. Monitoring and maintenance
12. Backup and recovery
13. Controlled future changes
14. Continuing service according to purchased entitlement

## 3. Intended customer

The initial customer is a small or medium-sized business that needs an independent, reliable web presence but does not need or cannot justify an unrestricted custom-software engagement.

Typical suitable customers may include businesses that:

- Have no independent website
- Depend mainly on a Facebook, Instagram, Google Business, directory, marketplace, or booking profile
- Have an outdated, broken, slow, insecure, or visually weak website
- Have a website that does not work well on mobile
- Lack clear services, calls to action, contact pathways, or business information
- Cannot update their existing website reliably
- Do not have technical staff
- Prefer a managed service over hiring and supervising a developer
- Need a predictable, bounded outcome
- Fit a supported Vertical Kit and tier
- Can be served with limited, governed variation rather than unrestricted custom engineering

The architecture should support different languages and markets, but initial commercial campaigns and Vertical Kits may be intentionally narrow.

## 4. Customer problem and value proposition

The core customer problem is not simply, “I need HTML.” It is:

> “My business needs a credible and useful independent website, but I do not want to design, build, secure, host, maintain, and troubleshoot it myself.”

LiNKsites addresses this through a managed production model that aims to provide:

- Faster delivery than traditional bespoke agency work
- Lower cost through reuse and automation
- More consistent quality than unconstrained one-prompt generation
- Less customer management burden
- Reliable hosting and maintenance
- Clear product boundaries
- A visible website before purchase where the sales strategy supports it
- Future changes through a governed service rather than ad-hoc developer dependence

The customer-facing value proposition may be expressed differently by vertical, market, tier, and campaign. However, every approved claim must remain grounded in capabilities that LiNKsites can actually deliver.

## 5. Customer outcomes

Every paid LiNKsites product must be designed around customer outcomes rather than the internal tools used to achieve them.

### 5.1 Independent web presence

The customer receives a website reachable through an approved production domain and capable of representing the business independently of a social-media or marketplace platform.

### 5.2 Credible professional presentation

The website should present a coherent business identity, readable content, appropriate imagery, and a design suited to the business category and customer audience.

### 5.3 Clear business communication

The site should clearly communicate, according to available verified information:

- Who the business is
- What it offers
- Who it serves
- Where it operates
- How to contact or engage it
- What the visitor should do next

### 5.4 Functional conversion path

The site should provide the tier-approved means for a visitor to act, such as:

- Telephone call
- Email
- Contact form
- Booking link
- Messaging link
- Location or directions
- Quote request
- Approved external service integration

LiNKsites does not guarantee that a visitor will purchase. It provides and verifies the agreed conversion mechanism.

### 5.5 Mobile usability

The customer receives a responsive site designed and tested for the supported mobile and desktop environments specified in the quality contract.

### 5.6 Baseline discoverability

The site should include the tier-approved technical and content foundations for search discoverability, including suitable metadata, page structure, structured data where applicable, sitemap behavior, crawl controls, performance, and clear content.

LiNKsites must not promise rankings that it cannot control. Ongoing SEO operations, content publishing, link acquisition, or marketing may be separate products or add-ons.

### 5.7 Reliable managed operation

The customer should not need to maintain the underlying operating system, reverse proxy, deployment process, framework dependencies, TLS renewal, backups, or monitoring for a standard managed site.

### 5.8 Controlled updates

The customer receives an approved mechanism for requesting or authorizing changes according to the purchased package. Changes proceed through working, draft, preview, approval, and publication states rather than directly altering live content without validation.

### 5.9 Recoverability

LiNKsites maintains the ability to restore the site or its content according to the backup and recovery policy of the applicable tier.

## 6. Product layers

The managed product consists of several layers that may be packaged differently but must remain conceptually distinct.

### 6.1 Production layer

This is the work required to prepare and finalize the website:

- Site Specification
- Foundation selection
- Business-specific adaptation
- Copy and media
- CMS content population
- Validation
- Customer finalization

### 6.2 Launch layer

This includes:

- Production environment readiness
- Domain and DNS coordination
- TLS
- Publication
- Cache/revalidation
- Launch verification
- Baseline backup

### 6.3 Hosting layer

This includes the runtime required to serve the website, such as:

- Shared or dedicated frontend allocation according to tier
- Edge and routing configuration
- CMS and published-content access
- Resource allocation
- Availability monitoring

### 6.4 Maintenance layer

This includes:

- Dependency and platform maintenance
- Monitoring and safe recovery
- Backup and restore operations
- Security updates
- Integration checks
- Approved technical improvements

### 6.5 Content-change layer

This includes customer-requested or entitlement-driven modifications to:

- Business facts
- Services
- Hours and contact information
- Page copy
- Images
- Calls to action
- Approved pages or sections

The exact allowance and pricing mechanism are package decisions.

### 6.6 Growth layer

Possible growth capabilities include:

- Additional pages
- Content refreshes
- Blog or article production
- SEO operations
- Social or content-distribution services
- Additional languages
- Conversion experiments
- LiNKautowork automation products
- Other future LiNKtrend services

These should be separate entitlements or Product Catalog items unless explicitly included in a tier.

## 7. Paid Service Tiers

The architecture must support at least three governed tiers. Their final public names may change. For clarity in this manual they are referred to provisionally as:

1. Standard
2. Premium
3. Enterprise

The tiers are production contracts, not merely labels. Each tier must have a versioned Tier Specification defining allowed pages, blocks, variants, integrations, hosting characteristics, service entitlements, quality requirements, and exception policy.

### 7.1 Standard tier doctrine

Standard is the most constrained and deterministic product. It should maximize reuse, automation, consistency, and low marginal cost.

Expected characteristics include:

- Supported Vertical Kit required
- Approved reusable foundation
- Constrained page and block set
- Governed design tokens and variants
- Business-specific content and identity
- Standard forms or calls to action
- Shared managed frontend hosting
- Standard maintenance and monitoring
- Limited or rule-based customer changes
- No unique component coding as part of the base product

Standard should not mean poor quality. It means bounded variation and predictable delivery.

### 7.2 Premium tier doctrine

Premium supports greater controlled variation and service depth while retaining the shared platform.

Possible characteristics include:

- Wider selection of foundations and page structures
- More extensive business-specific copy and media work
- Additional pages or sections
- More controlled visual variation
- Additional approved integrations
- Additional localization
- Higher change or support entitlement
- Stronger reporting, backup, or service characteristics
- More extensive preview and finalization work

Premium remains productized. It must not become an unlimited custom-development engagement disguised as a tier.

### 7.3 Enterprise tier doctrine

Enterprise addresses customers whose justified requirements exceed Standard and Premium boundaries.

Possible characteristics include:

- Separately approved component or code variation
- Dedicated frontend runtime
- Dedicated CMS or database isolation where justified and priced
- Advanced integration requirements
- Stronger security or data-residency controls
- Custom service levels
- More extensive localization or multi-location structure
- Formal approval and support arrangements

Enterprise work requires explicit technical feasibility, cost, capacity, and commercial approval. The existence of an Enterprise tier must not authorize arbitrary commitments by an AI or salesperson.

## 8. Tier dimensions

Every Tier Specification should define at least the following dimensions.

| Dimension | Required definition |
|---|---|
| Site structure | Included page types, limits, navigation rules |
| Design | Permitted foundations, variants, token ranges, customization depth |
| Content | Included copy scope, revision model, customer-input requirements |
| Media | Included sourcing/creation, limits, licensing and replacement rules |
| Integrations | Included forms, booking, analytics, messaging, and external services |
| Localization | Supported language count and translation responsibility |
| CMS | Customer editing rights, if any, and change workflow |
| Hosting | Shared/dedicated placement, expected resources, regional policy |
| Reliability | Monitoring, backup, recovery, and support targets |
| Maintenance | Included technical work and exclusions |
| Changes | Allowance, response model, overage or quotation behavior |
| Ownership/export | Rights, exportability, transfer and termination behavior |
| Proof | Eligible preview levels and sales-proof constraints |
| Quality | Required tests and thresholds |
| Exceptions | Actions requiring quotation or higher tier |

## 9. Tier enforcement

Tier rules must be enforced through data and contracts, not remembered informally by an agent.

Each active customer site should reference:

- Product ID
- Tier ID
- Tier Specification version
- Purchased options
- Start date
- Current entitlement state
- Hosting class
- Change allowance or policy reference
- Support policy
- Backup/recovery policy
- Upgrade/downgrade history
- Odoo order/subscription references

Before performing a customer-requested change, the Program should determine:

1. Whether the request is technically supported
2. Whether it is included in entitlement
3. Whether customer authorization is valid
4. Whether it requires Sales quotation or payment
5. Whether it changes tier, capacity, security, or architecture
6. Which quality and publication gates apply

## 10. Progressive Sales Proof Levels versus Paid Service Tiers

Proof level and paid tier answer different questions.

- **Proof level:** How much should LiNKtrend invest before this prospect purchases?
- **Paid tier:** What product and continuing service will the customer receive after purchase?

A Level 1 preview could demonstrate a Standard or Premium offer in a constrained way. A Level 4 preview may represent any justified tier. A prospect shown a sophisticated Level 4 preview does not automatically receive Enterprise service unless that is what the customer purchases.

The system must therefore store separate identifiers such as:

```text
proof_level
recommended_tier_id
quoted_tier_id
purchased_tier_id
active_tier_id
```

These values may differ over the lifecycle and every change must be recorded.

## 11. Product options and add-ons

LiNKsites should support versioned optional capabilities without turning every option into custom code.

Potential website add-ons include:

- Additional pages
- Additional language
- Additional location
- Advanced form
- Booking integration
- Analytics package
- Additional media production
- Content refresh package
- SEO operations
- Enhanced reporting
- Dedicated frontend hosting
- Higher backup or recovery class
- Additional change allowance
- Supported migration from an existing site

Cross-factory add-ons may include LiNKautowork products such as a lead-handling or appointment workflow. These remain separate Product Catalog items even when sold in a bundle.

Every add-on must define:

- Product owner
- Compatibility
- Required tier
- Required inputs
- Setup work
- Recurring work
- Technical dependencies
- Price or pricing-rule reference
- Quality gates
- Support owner
- Deactivation behavior

## 12. Product exclusions

Unless separately defined and purchased, the base LiNKsites product should not imply:

- Unlimited design revisions
- Unlimited pages
- Unlimited custom coding
- Guaranteed search ranking
- Guaranteed leads, sales, revenue, or traffic
- Full brand-strategy engagement
- Original professional photography
- Bespoke video production
- Complex web application development
- Custom back-office software
- Unrestricted third-party integrations
- Customer-controlled server administration
- Emergency response outside the agreed service level
- Legal drafting or legal compliance certification
- Ownership of third-party licensed materials beyond their licenses
- Permanent support for an external service that ceases to operate

Exclusions must be presented clearly in commercial materials and encoded in product definitions where operationally relevant.

## 13. Customer inputs and responsibilities

The managed nature of LiNKsites reduces the customer's technical burden, but the customer may still be responsible for providing or confirming:

- Correct legal or trading name
- Contact information
- Address and service area
- Business hours
- Services and prices where displayed
- Claims that cannot be independently verified
- Logo and brand assets where available
- Rights to customer-supplied text, images, and media
- Staff or testimonial information
- Required policies or regulated statements
- Domain ownership or authorization
- External account authorization
- Final approval where required
- Timely correction of inaccurate information

The Program should use public research to reduce customer effort, but public evidence does not eliminate the need for customer confirmation of material business facts before final publication.

## 14. Content and factual responsibility

LiNKsites must distinguish among:

- Verified public facts
- Customer-supplied facts
- Inferred content
- Marketing language
- Unverified claims
- Placeholder material

Every content item should preserve source and confidence where appropriate. The system must not fabricate:

- Awards
- Certifications
- Years in business
- Customer testimonials
- Staff credentials
- Prices
- Guarantees
- Locations
- Regulatory status
- Business results

Placeholders may be used in controlled previews when clearly marked internally and prevented from becoming published production truth without validation.

## 15. Managed hosting entitlement

Hosting is not a free incidental attachment. It is part of the continuing product and has measurable cost and service obligations.

The hosting entitlement should define:

- Hosting class
- Shared or dedicated runtime
- Region-placement policy
- Included bandwidth or fair-use policy if required
- Availability target
- Monitoring scope
- Backup frequency and retention
- Restore objective
- Maintenance windows
- Incident communication
- Included domain/TLS management
- Supported integrations
- Resource and abuse thresholds
- Suspension and termination behavior

Exact numerical service levels should be established only after infrastructure testing and commercial approval.

## 16. Customer editing model

The role of customer self-service must be configurable by tier and risk.

Possible models include:

1. **Managed-only:** The customer requests changes and LiNKsites performs them.
2. **Restricted CMS access:** The customer may edit selected safe fields or collections.
3. **Expanded CMS access:** Higher tiers receive broader controlled access.

Customer editing must not permit uncontrolled structural breakage, exposure of other tenants, bypass of required approvals, or direct modification of system-owned configuration.

Regardless of editing model, publication rights and rollback behavior must be explicit.

## 17. Initial commercial model assumptions

The final business model remains to be refined through financial analysis and market testing. The Program must nevertheless support the following accepted assumptions.

### 17.1 Managed recurring relationship

LiNKsites is intended to produce continuing revenue through hosting, maintenance, changes, add-ons, or another approved recurring service structure rather than functioning exclusively as one-time project work.

### 17.2 Setup and recurring components

The architecture should support:

- One-time setup or activation fee
- Recurring hosting/service fee
- Paid add-ons
- Tier upgrades or downgrades
- Additional usage or change charges where appropriate
- Discounts and promotions controlled through Odoo/Sales rules

This does not establish the final amounts.

### 17.3 Stripe-first payments

All LiNKtrend product payments are intended to be processed through Stripe first. Odoo records the commercial and accounting consequences. LiNKsites receives only verified activation and service instructions.

### 17.4 Productization over custom service

Commercial viability depends on restricting avoidable customization, maximizing reusable assets, and knowing the true cost of fulfilment and maintenance.

### 17.5 Automation as an economic requirement

The business remains attractive in the AI era only if production, adaptation, hosting, monitoring, recovery, and routine changes are autonomous enough to prevent labor cost from increasing linearly with customer count.

### 17.6 Preview investment

Speculative preview cost is treated as customer-acquisition investment in reusable inventory. The Program should minimize marginal cost without weakening the visible proof that drives the sales thesis.

## 18. Unit-economics framework

The following measures must be supported even though their target values remain undecided.

### 18.1 Foundation economics

- Initial foundation production cost
- Upgrade and maintenance cost
- Number of adaptations
- Total preview engagement
- Sales produced
- Revenue associated with the foundation family
- Residual value
- Retirement/write-off cost

### 18.2 Prospect adaptation economics

- Research-consumption cost
- Copy and media cost
- Model/token cost
- Deterministic compute cost
- Deployment cost
- QA cost
- Total adaptation cost
- Upgrade cost between proof levels

### 18.3 Customer fulfilment economics

- Finalization cost
- Customer-input handling cost
- Launch cost
- Support intervention
- First-month operational cost

### 18.4 Recurring service economics

- Frontend hosting allocation
- CMS/database allocation
- Storage and bandwidth
- Monitoring and backup
- Maintenance
- Model/API usage
- Customer changes
- Incident burden
- Payment-processing cost supplied by Sales/finance
- Gross contribution by tier

### 18.5 Acquisition economics

The Sales Program calculates overall acquisition cost, but LiNKsites supplies:

- Preview cost
- Reuse recovery
- Technical production time
- Proof-level upgrade cost
- Fulfilment cost
- Technical support cost

## 19. Commercial safeguards

The Product Catalog, Sales Program, and LiNKsites must prevent:

- Selling a retired or unavailable tier
- Selling unsupported integrations
- Quoting obsolete prices or entitlements
- Promising custom development under Standard pricing
- Activating work without verified payment state
- Offering service beyond measured capacity
- Applying a discount that makes fulfilment irrational without approval
- Treating a one-time exception as a permanent product capability
- Allowing an AI caller or salesperson to invent delivery commitments

Every quotation should reference a versioned Product/Tier Specification so that fulfilment knows exactly what was sold.

## 20. Upgrade and downgrade doctrine

An upgrade may affect:

- Pages and content
- Components
- Integrations
- Hosting allocation
- Backup policy
- Customer access
- Change entitlement
- Support expectations

The Program must assess feasibility, required migration, cost, and gate impact before activation.

A downgrade must specify:

- Which capabilities cease
- Whether content is hidden, removed, or preserved
- Whether hosting placement changes
- What happens to integrations
- Effective date
- Rollback window
- Customer data/export consequences

No automated downgrade should destroy customer content without an approved retention and authority policy.

## 21. Suspension and termination doctrine

Commercial status does not directly execute destructive infrastructure action. Sales/Odoo policy produces an authorized service instruction.

Possible states include:

- Payment warning
- Grace period
- Restricted changes
- Temporary suspension
- Read-only preservation
- Reactivation
- Scheduled termination
- Export/handoff
- Decommissioned with retained backup
- Final deletion after approved retention

The customer's package and contract determine entitlement. LiNKsites performs the technical workflow with evidence and recoverability appropriate to the state.

## 22. Decisions still required

The following decisions remain to be finalized through business-model work and should not be invented by implementation agents:

- Final tier names
- Exact page and feature limits
- Setup prices
- Recurring prices
- Included revision/change allowances
- Minimum contract term
- Trial or refund approach
- Ownership of code, content, and reusable design elements
- Export and transfer options
- Customer CMS-access policy
- Support hours and response targets
- Backup retention and restore targets per tier
- Fair-use and resource limits
- Enterprise qualification and minimum price
- Initial Vertical Kits
- Tax and market-specific pricing
- Commission rules managed by Sales

Until approved, these belong in configuration or explicit decision registers, not hard-coded production behavior.

## 23. Product acceptance criteria

The LiNKsites product model is correctly implemented when:

1. Paid tiers and proof levels are represented separately.
2. Every sold site references an exact Product/Tier Specification version.
3. Standard delivery cannot silently expand into unrestricted custom work.
4. Customer entitlements are machine-readable and enforced before changes.
5. Preview investment and reusable inventory economics are measurable.
6. Hosting and continuing maintenance are represented as real service obligations.
7. Stripe-confirmed commercial activation precedes paid fulfilment.
8. Odoo retains commercial authority.
9. Customer facts and claims retain source and approval state.
10. Add-ons identify their producing Program and support owner.
11. Upgrade, downgrade, suspension, and termination are controlled workflows.
12. Unresolved prices and terms remain configurable rather than invented.

## 24. Governing conclusion

LiNKsites is a productized managed website service designed to provide SMBs with a credible, useful, hosted, and maintained independent web presence. Its economic advantage comes from governed reuse, progressive preview investment, deterministic production, selective AI, autonomous operations, and recurring managed service—not from selling access to a website-generation tool.

The customer experiences a coherent product. Internally, that product is enforced through versioned Tier Specifications, entitlements, production contracts, quality gates, hosting classes, and lifecycle policies. This separation allows LiNKsites to vary the commercial offer without destabilizing the factory architecture and allows the engineering system to reject promises that the approved product cannot fulfil.

---

**End of Section 03**
