# 00 — Executive Summary (LiNKsites Audit, 2026-07-13)

**For Carlos. Plain English. Technical detail is in the numbered files in this `audit/` folder and in `docs/specs/linksites-program-manual/`.**

> **Progress addendum (2026-07-14):** You approved proceeding and explicitly rejected pausing between
> phases — the manual + `audit/14_implementation_roadmap.md` now serve as the plan, and work has
> continued Issue-by-Issue since this summary was written. As of this addendum: a real CI gate exists
> (no longer fake-passing), the security findings below are fixed (all 222 Dependabot alerts
> triaged), the legacy `web-company`/old-corporate-site question is resolved (archived, see
> Decision DR-02), a real Program Ledger (Issue/Run/Gate/Event core, Postgres-backed, hierarchy +
> executor registry) exists and is tested, and all 7 of the manual's named Phase 3 reusable-asset
> objects (Vertical Kit, Tier Specification, Reusable Site Foundation, Design Intelligence Catalog,
> Component Registry, Site Specification, Prospect Adaptation) are now real, tested code (90 passing
> tests in `packages/factory-catalog`), and a real executor (`SiteSpecificationExecutor`) now
> connects the Program Ledger to this factory work end to end for the first time. See
> `audit/14_implementation_roadmap.md`'s "Sixth", "Seventh", and "Eighth" work batches for the full
> detail. The items below describing what's still missing remain accurate for what they describe
> (payment/Odoo integration, monitoring/backups, live-Postgres verification, and the Promotion
> Service/Site Assembly Engine that would actually execute against these new objects in production)
> — this addendum only updates what has since changed, it does not re-litigate the rest of the
> original summary.

## What I did

1. Copied the 24-section LiNKsites Program Manual verbatim from your Google Drive into the repo (`docs/specs/linksites-program-manual/`), byte-verified it, and generated a manifest — so this manual is now durable in the repo itself, not dependent on your local Drive.
2. Read the entire manual (all 24 sections) and used it as the reconciled current doctrine, above any older PRD, README claim, or prior architecture note.
3. Did a careful, read-only inspection of the LiNKsites repository — every app, package, migration, config file, doc, test, and CI run I could reach — without deleting, renaming, rewriting, or changing anything.
4. Wrote up the full formal audit the manual requires (16 documents in `audit/`) so a future AI or human can pick this up without needing this conversation.
5. I did **not** start building anything. That's deliberate — you asked me to stop here and report.

## What LiNKsites currently is, in practice

LiNKsites is **not yet the autonomous website factory the manual describes — it's roughly the first third of it, and the third that's furthest along is genuinely solid.**

Concretely, right now you have:

- A real, reasonably well-built **Payload CMS application** (25 content types, role-based publish workflow, per-site access control). This is the strongest asset in the repo.
- A real, reasonably well-built **multi-tenant website frontend** (`web-master`) that can serve different customer sites from one shared codebase based on the hostname a visitor typed. This is the second-strongest asset.
- A working **Postgres database layer** (via Supabase) with correct per-customer data isolation rules already in place.
- **Deployment scaffolding** (Docker + Traefik) that's the right shape for how the manual says hosting should work, but hasn't been proven live.
- A **second, smaller website template** (`web-company`) whose purpose I genuinely can't determine from the evidence — it might be an intentional "premium/dedicated" template, or it might be an abandoned early attempt. I've flagged this as a question for you rather than guessing.

What you do **not** yet have, anywhere in the code:

- Any way to actually **sell and deliver** a site — no payment integration, no Odoo connection, no "customer paid, now build/launch their site" pipeline exists in this repo at all.
- Any of the **reusable factory machinery** the manual describes by name — no Vertical Kits, no Tier Specifications, no Design Catalog, no Preview Inventory. These exist only as descriptions in the manual and in old planning documents, not as working systems.
- A **governed record of work being done** — the manual calls this the "Program Ledger." Without it, there's no systematic way to prove a website was built correctly, retry safely if something fails, or show you an audit trail. This is the single biggest missing piece, because almost everything else in the manual depends on it existing.
- **Monitoring or backups.** If a real customer's site went down or a database was lost today, nothing would automatically detect it, and there is no tested way to recover it.
- **Real automated testing for the safety things that matter most** — specifically, nothing currently proves that one customer's data can never leak to another customer. The building blocks look reasonable, but "looks reasonable" isn't proof, and the manual is explicit that this exact gap is not acceptable once real customers are involved.

One more thing worth knowing plainly: your continuous-integration checkmark (the green checkmark you'd see on GitHub) is currently **fake** — it runs a placeholder that always says "success" without actually testing anything. It's a quick, low-risk fix, but I want you to know that a green checkmark today doesn't mean what it should.

## What's genuinely reusable (don't throw it away)

The Payload CMS app, the multi-tenant frontend, the Supabase schema/isolation pattern, the Traefik deployment scaffolding, and even a demo-site publish script are all real, working starting points. My recommendation across the board is **adapt and extend**, not rebuild from scratch. The manual itself predicted this — it expected to find 60-80% completed work that's a mix of sound and unfinished, and that's what I found: the CMS/frontend/database core is closer to sound; the factory-automation, sales-integration, and operations layers are mostly not built yet.

## What's missing or dangerous — the short list

1. **No proof of customer data isolation.** Not a build task first — a testing task. High priority.
2. **No backups, no monitoring.** If something breaks or data is lost today, you'd find out the hard way.
3. **No way to actually take a payment and deliver a site.** The commercial spine doesn't exist yet in this repo, and part of it depends on your Sales/Odoo systems, which I couldn't reach from here.
4. **The repository itself is mid-change.** There's a large, unfinished, uncommitted change sitting in the working files right now (it looks like someone was migrating how AI-agent instructions are organized across your repos). I didn't touch it, but it needs your attention — either finish it, commit it, or tell someone to undo it, before more work happens on top of it.
5. **A fake-passing CI check**, as mentioned above — cheap to fix, worth fixing early.

## The few decisions that genuinely need you

- **Which SMB vertical and which pricing tier should the first pilot target?** Nothing in the repo tells us this yet — it's a business call, not a technical one.
- **What is `web-company` for?** (second website template — keep investing in it, retire it, or repurpose it as the "premium" template?)
- **Should every outside action LiNKsites takes (publishing a site, sending a webhook, etc.) go through your company-wide LinkSkills permission system, or does LiNKsites' documented independence from LiNKaios mean it's exempt?** This changes how a lot of future work gets built, so it's worth deciding early rather than guessing.
- **The unfinished repo restructuring** mentioned above — commit it, finish it, or revert it.
- **Access to your Sales and Odoo systems/repos** for a future coordinated audit — I could not reach them from here, and the "sell and deliver a site" work can't be reliably estimated without that.

## Proposed first pilot slice (proposed, not decided — your call)

One SMB vertical (to be chosen from your actual lead data, not guessed here), the **Standard** tier (the simplest, least custom-built tier), one hosting region, one payment path, one Odoo mapping — deliberately narrow, per the manual's own instruction not to guess big. Full reasoning in `audit/14_implementation_roadmap.md`.

## The phase sequence (from the manual, restated against what's real today)

Roughly: **finish this audit's loose ends → build the missing "governed record of work" system → build the reusable Vertical Kit/Tier/Design system → build the preview-before-sale pipeline → connect payment/Odoo → build the customer launch pipeline → add monitoring/backup/autonomous operations → run a small real pilot → then expand.** Today, you're solidly in "finish the audit" with a healthy head start on the pipeline's CMS/frontend/database core. Full phase-by-phase detail is in `audit/14_implementation_roadmap.md`.

## What I recommend happens next

Nothing gets built yet. I recommend you:

1. Review this executive summary and skim `audit/13_decision_and_contradiction_register.md` (5 short, specific decisions — none require deep technical knowledge).
2. Make the handful of decisions listed above, at whatever pace suits you.
3. When you're ready, tell the next AI session to proceed with Phase 1 of `audit/14_implementation_roadmap.md` — it's written to be picked up without this conversation.

I'm stopping here, as instructed. No implementation code has been written, and nothing in the repository has been changed except adding the manual copy (`docs/specs/`) and this audit (`audit/`).
