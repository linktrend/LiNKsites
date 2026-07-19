# LiNKsites Operations Manual

**Who this is for:** you — LiNKtrend’s Principal. You make strategic and commercial decisions. You do not write code, run servers, or manage day-to-day website production.

**What this is:** a plain-English handbook for how LiNKsites works *today*, and what your role in it is. It is not a technical design document.

**Honesty rule:** everything below describes what is actually built and tested in the software right now. Where something is planned but not available yet, it is labeled clearly under [Current status](#current-status-what-is-not-available-yet).

---

## What LiNKsites is

LiNKsites is LiNKtrend’s **website factory and managed website service** for small and medium-sized businesses.

It does two related jobs:

1. **Factory** — prepare reusable website foundations, adapt them into real previews for prospects, and convert paid orders into launched customer sites.
2. **Managed service** — host, monitor, maintain, and update those sites so the customer does not have to run technical infrastructure themselves.

The sales idea behind it is **build-first, sell-later**: a qualified prospect should see an actual website representing what LiNKsites can provide, not only a promise that one will be built after payment. If they do not buy, the reusable foundation can be cleaned and offered to someone else.

LiNKsites does **not** find leads, make sales calls, or charge cards. That belongs to the shared **LiNKtrend Sales** process (and Stripe / Odoo). LiNKsites receives “please make a preview” or “this customer paid — activate their site” packages and does the technical work.

---

## Your role today

### Where your decisions matter

| When | What you decide | What happens if you say no / wait |
| --- | --- | --- |
| Product strategy | Which verticals and tiers LiNKsites should sell | Engineering keeps provisional defaults; no invented final prices |
| Material spend / architecture | New VPSs, major provider changes, large unplanned cost | Work stays within approved bounds or waits as an exception |
| Security / legal / irreversible actions | Incidents, deletions, contractual exceptions | System must escalate rather than guess |
| Release promotion | Approving `development` → `staging` → `main` when asked | Code can sit on `development` until you promote |

### What you do **not** need to do

- Write code or approve every small coding task
- Configure Cloudflare, Traefik, or databases day to day
- Manually assemble each customer website
- Run sales outreach or process Stripe payments yourself (Sales Program owns that)

Someone technical (or an AI agent under factory rules) handles mechanics. Your job is direction and the checkpoints above.

---

## How a website is supposed to be born (plain walkthrough)

### 1. Sales qualifies a prospect

Sales researches the business and decides whether a LiNKsites preview investment is worth it. They request a **proof level** (how complete the preview should be) — this is *not* the same as the paid package the customer might buy later.

### 2. LiNKsites builds a preview from inventory

The factory picks the best **reusable foundation** it already has (or builds one when justified), applies the prospect’s name/contact/services, promotes content into the CMS as a **draft**, and prepares a private preview link with quality checks.

### 3. Sales presents the preview

If the prospect engages, Sales may ask for a richer preview. If they buy, Sales sends a **paid activation** package after Stripe and Odoo confirm payment.

### 4. LiNKsites launches the customer site

The preview is locked so it cannot be recycled by mistake. Content is finalized, published, connected to the customer’s domain, and launched under managed hosting.

### 5. If they do not buy

Prospect-specific details are removed. The reusable foundation returns to inventory for another suitable prospect.

**Honesty:** steps 1 and the live “Sales ↔ payment ↔ launch” wiring are only partly real in software today. The factory objects for foundations, specs, promotion-to-draft, and recycle locks exist and are tested. The live Sales/payment connection and full “push the live customer site live automatically” path are still ahead — see [Current status](#current-status-what-is-not-available-yet).

---

## What already exists (so you know the investment is real)

As of mid-July 2026, this repository already has:

- A real **CMS** (Payload) that can hold many sites’ content with draft/publish.
- A real **shared website frontend** that can show different sites based on the domain name.
- A real **Program Ledger** — the factory’s official logbook of work items, attempts, and pass/fail checks.
- Real **factory building blocks**: vertical kits, tiers, foundations, design catalog, component registry, site specs, prospect adaptations, promotion-to-draft, preview inventory pieces, and conversion locks.
- Database rules that isolate one organization’s data from another’s (proven with automated attack-style tests).
- Deployment scaffolding (Docker + Traefik) shaped for shared hosting behind Cloudflare.

That is the “first third” of the full vision — and it is solid enough to keep building on, not throw away.

---

## What happens when something goes wrong

The intended design (and what the Ledger already supports in software):

- Work is broken into small **Issues**; each attempt is a **Run**.
- A **Gate** must accept the result — “the agent said it worked” is not enough.
- Retries are allowed within limits; endless loops are not.
- Failures should leave a record and escalate when automation cannot safely continue.
- OpenClaw (if used later) may investigate and run pre-approved recovery steps; normal sites should keep serving without waiting on OpenClaw.
- You are pulled in for material cost, destructive actions, security, or unresolved exceptions — explained in plain language with options.

Until monitoring and backup automation are finished, a real production outage would still need technical help more than the handbook can pretend otherwise. That gap is called out below.

---

## Current status (what is not available yet)

| Topic | Status today |
| --- | --- |
| Sell → pay → auto-launch a real customer | **Not wired.** Stripe/Odoo/Sales adapters are not in this repo yet. |
| Full monitoring, backups, automatic recovery | **Not built.** Hosting scaffolding exists; autonomous ops do not. |
| First real paying customer through this factory | **Not done yet.** Pilot vertical (Home Services / Standard) is chosen; live pilot waits on commercial + ops spine. |
| Customer editing their own CMS | **Off for everyone at launch** (by your decision). LiNKtrend manages content, mostly via automation. |
| Final public prices and legal packaging | **Not locked.** Code has provisional placeholders only. |
| OpenClaw day-to-day control | **Not required and not the control system.** Optional overseer later. |
| Fancy operator dashboard for you | **Not built.** Status today comes from technical people, GitHub, and audit/roadmap notes. |

---

## FAQ

**Is LiNKsites a website builder the customer logs into?**  
No. The customer buys a managed outcome. At launch they do not get CMS login.

**Why show a website before they pay?**  
So the sale is based on proof, not a promise — and so unsuccessful offers still leave a reusable foundation for the next prospect.

**Who sells and who builds?**  
Sales sells and takes payment. LiNKsites builds, launches, and hosts. They hand packages back and forth; they do not merge into one system.

**Do I need to understand Payload, Next.js, or Traefik?**  
No. Those are implementation details. You care about product direction, exceptions, and when to promote releases.

**Is the factory “done”?**  
The CMS, frontend, Ledger, and core factory objects are real and tested. Connecting live sales/payment, finishing autonomous hosting ops, and running the first real customer pilot are the remaining milestones — not “rewrite everything from scratch.”

**What should I watch as progress?**  
Prefer `docs/OPEN-ISSUES.md` and the Intent / Technical PRD over older scattered docs. Ask for briefings when a phase needs a Principal decision (pricing, pilot go-live, security incident, promotion to production).

---

## One-page reminder

1. LiNKsites makes and hosts managed SMB websites from reusable foundations.  
2. Prospects can see a real preview before buying; unsold work is recycled.  
3. Sales owns leads and payment; LiNKsites owns the website technical lifecycle.  
4. Your day-to-day role is strategy and exceptions — not coding or server babysitting.  
5. CMS, shared frontend, Ledger, and factory building blocks are already real.  
6. Live sell→launch wiring, monitoring/backups, and the first real customer pilot are still ahead — and this handbook already says so honestly.
