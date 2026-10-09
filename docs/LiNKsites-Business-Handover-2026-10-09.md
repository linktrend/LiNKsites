# LiNKsites business handover

**Snapshot:** 9 October 2026, Asia/Taipei.

**Audience:** the business AI agent and founder, followed by the engineering AI agent.

**Status:** intended workflow confirmed; full operating service not completed.

**Companion:** `LiNKsites-Engineering-Handover-2026-10-09.md`.

## 1. Purpose and how to use these reports

This report captures the founder's confirmed product intentions, current functional position, gaps and decisions still needed. It is a handover, not a final product requirements document or permission to start implementing recommendations.

The business agent receives both reports first, reviews the remaining business questions with the founder, and adds a clearly identified supplement or revision to this business report. It then sends the completed business requirements and the **engineering report unchanged** to the engineering agent. The engineering agent uses them to prepare the technical PRD. Neither agent should need the preceding chat to understand the assignment.

Use these distinctions throughout: **confirmed requirement** means a founder decision; **verified current state** means observed code or server evidence; **unresolved** means a decision or fact is still missing; **nonbinding recommendation** is advice, not an approved requirement. The technical report contains exact evidence and operating constraints.

## 2. Confirmed business purpose and ownership

LiNKsites is an automated website factory. It turns a complete information package about a target business into a personalized, quality-checked website that is already hosted in the place where it will remain. It returns a temporary viewing URL to the company's Odoo CRM so the sales workflow can begin.

The intended chain is:

**LiNKtarget + LiNKresearch → complete input package → LiNKsites → completed website and temporary URL in Odoo → LiNKsales → LiNKclient.**

LiNKtarget defines the target business. LiNKresearch researches that business. Their combined package must contain everything LiNKsites needs; discovering or researching prospects is outside LiNKsites' scope. LiNKlibraries supplies the reusable website templates. LiNKsites selects the appropriate template, personalizes it, produces and verifies the website, and records the handover.

Ongoing content maintenance after publication belongs to the separate Supabase/automation/Payload process. Hosting maintenance, monitoring, troubleshooting and general server administration also belong elsewhere. The website factory still needs a functioning hosting service and reliable handover to those owners; this does not make it the maintenance owner.

## 3. Confirmed workflow and completion boundary

For a new target business, LiNKsites must:

1. Accept and validate the complete input package from LiNKtarget/LiNKresearch.
2. Select an appropriate usable template from LiNKlibraries.
3. Build the business's website with its correct information, branding, copy and assets.
4. Put its content in Payload CMS, with the intended Supabase connection/synchronization. The exact data ownership and synchronization agreement still needs reconciliation with the existing implementation.
5. Host the website in the common permanent hosting location. A later connection to the customer's domain must use that same hosted website.
6. Assign a unique temporary URL shaped as `https://sites.linktrend.one/<long-numeric-identifier>`. The identifier must support thousands of potential customers. Its exact length and allocation rules are not yet decided.
7. Complete technical, business-information, content, appearance and full user-interface QA. This includes links, buttons, menus, navigation and forms, not just checking that a page loads.
8. Offer an optional human review immediately before handover. A human can request changes, but routine human intervention or mandatory approval is not required.
9. Record the completed website and temporary URL in the correct Odoo company/lead record for LiNKsales to consume. The precise output fields and acceptance acknowledgement still need to be agreed.

Successful completion means the correct website is actually accessible, has passed the agreed QA, and its handover has reached the correct Odoo record. A code change, successful build or generated URL string alone is not completion.

### Rebranding an unsold website

LiNKsites also accepts work to reuse an existing hosted website that a previous target business did not buy. The existing site, structure and hosting remain. Only minor changes are made to adapt it to the new target: names, copy, colours and associated business details, without major redesign. **The temporary URL must change** to a new long numeric identifier.

This is not a new website build or a migration. The behavior of the previous temporary URL, customer associations and historical records remains an unresolved decision.

## 4. Verified current position

The repository contains substantial reusable work: intake validation, durable orchestration, template handling, working-content records, Payload draft/publishing adapters and a private website renderer. These are useful foundations, but they are not yet a complete operating website factory.

Fresh checks on 9 October found:

| Area | Current position | Gap against the confirmed outcome |
| --- | --- | --- |
| Business input | Intake accepts a research summary and source links; content generation separately requires an approved business-facts file. | One complete, connected input package is not implemented. |
| Template use | Production requires an admitted template release; the pinned template and example configuration remain unavailable/deferred. | Usable template selection must be demonstrated. |
| Website creation | Real processing components exist, but production expects an already provisioned site and uses baseline content/assets. | Automatic creation and personalization for each target business are incomplete. |
| Temporary address | Completion currently uses the shared `/en/demo` address. | Unique numeric business URLs and their site mapping are missing. |
| Rebranding | No integrated workflow was found that preserves the site and rotates the temporary URL as required. | The confirmed reuse behavior needs to be specified and implemented. |
| QA and review | Structural checks and a simple renderer probe exist. | Full content, visual and interaction QA, and the optional review/change step, are not demonstrated. |
| Odoo handover | Completion records and an event outbox exist, but no direct Odoo writeback was found. | The correct company record must receive the URL and agreed completion data. |
| Hosting | Server03 has cached release images but **no running LiNKsites service**. `sites.linktrend.one` has no DNS record, working route or matching HTTPS certificate. | The requested hosted outcome is unavailable. |
| Release | Latest implementation is in `development`; the promotion to `staging` is blocked and `main` remains older. | Source integration and production acceptance remain separate unfinished steps. |

Older documents describe a LiNKreach-oriented boundary and explicitly exclude direct Odoo runtime integration. The founder's October decisions above supersede that intended workflow. The older documents remain useful implementation history, not the final business requirements.

No real input-to-Odoo completion on the intended hosted numeric URL has been proved. The existing local and hosted tests do not establish that result.

## 5. Decisions for the business agent to finish with the founder

These are questions to resolve, not defaults to implement:

- **Input agreement:** what exact information must the upstream package contain, who certifies it, and what should happen when essential information or usable media is missing?
- **Template selection:** what business criteria select a template, and what happens if no suitable admitted template exists?
- **QA acceptance:** what constitutes acceptable visual/content quality, what forms should do before sale, where test submissions go, and which failures prevent handover?
- **Optional review:** how is the review opportunity offered; how long may it remain open; when does automatic handover proceed; and what happens when changes are requested?
- **Rebranding and URLs:** what happens to the former URL and previous target's associations; what history is retained; and how are accidental collisions or wrong-business exposure prevented?
- **Odoo completion:** which company/lead record and fields receive the result, what other information LiNKsales requires, and what acknowledgement establishes a successful handover?
- **Content ownership:** agree the precise Supabase/Payload relationship with the separate maintenance owner. Current code uses working records followed by controlled publication; it does not establish a general automatic two-way sync.
- **Hosting boundary:** confirm the permanent common host and who owns later domain connection. Server03 is the currently prepared deployment location; it is not yet an operating LiNKsites installation.

## 6. Nonbinding recommendations

These recommendations are not founder approvals or commitments:

- Prove one complete real-business workflow before adding more templates or expanding features. Include a second business and an unsold-site rebrand to prove separation and reuse.
- Treat the numeric URL as an opaque, collision-checked identifier. The engineering PRD should choose its size and privacy rules; a long number alone is not access control.
- Require a usable URL, recorded QA result and acknowledged Odoo handover before declaring a job complete. Make retries preserve the correct business/site association.
- Keep the business agent's final decisions separate from the frozen engineering snapshot so the engineering agent can see what changed in requirements.

## 7. Evidence and handover cautions

The companion engineering report supplies exact source identities, server paths, test limitations and release blockers. Representative source evidence is the current [input contract](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/packages/types/src/runtime-contracts.ts#L19-L27), [production adapters](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/apps/program-orchestrator/src/adapters.ts), and [older ownership/open-issues document](https://github.com/linktrend/LiNKsites/blob/4f6f65b392c5919e49bb3dbd93b44c489549a238/docs/OPEN-ISSUES.md#L83-L85).

The investigation was performed by Luna 6 High subagents and synthesized by the primary agent. It did not deploy a service, change business records, run a live website-creation job or repair application code. Server access was obtained from the existing **Server03 Production Owner** task. No credentials are included in either report.

Future agents must refresh repository and server facts before execution. The founder authorized bootstrap as needed to deliver these two reports. That authority is scoped here to documentation publication; it must not be interpreted as approval of a new technical PRD, unrelated application changes, credential use, production rollout or maintenance work.
