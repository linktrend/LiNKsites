# Product constraints

Boundaries for **LiNKsites** (LinkSites suite product repo). Issues link here when scope questions arise.

**MVO context:** [`MVO_ROLE.md`](MVO_ROLE.md)  
**Canonical product truth:** LiNKtrend-System [`PRINCIPAL_PRODUCT_DEFINITION.md`](https://github.com/linktrend/LiNKtrend-System/blob/development/LiNKdev/product/grounding/PRINCIPAL_PRODUCT_DEFINITION.md)

---

## Repo boundaries

| In this repo | External / not here |
|--------------|---------------------|
| Payload CMS (`apps/cms`) | LiNKaios Client + Admin shell (`LiNKtrend-System`) |
| Next.js templates (`apps/web-master`, `apps/web-company`) | Suite workflow map, Plane sync, Zulip streams |
| Shared packages (`packages/*`) | LinkSkills capability connectors |
| Publish / VPS routing scripts | LiNKautowork n8n fork (`LiNKautowork`) |
| Supabase migrations for site/brain hooks | LiNKbot runtime (`LiNKbot-core`) |
| `sites_specs/` authoritative specs | CRM/Odoo business schemas (use governed Capabilities) |

Do **not** embed LiNKaios operator UI, `ui-standards.ts`, or control-plane dashboards in customer-facing templates.

Do **not** run LiNKdev Planner/Go or treat this repo as the MVO program home — see [`../programs/linksites/PROGRAM.md`](../programs/linksites/PROGRAM.md).

---

## Payload and templates

- Content model changes belong in `apps/cms` with migrations/scripts per project SOPs
- Templates consume **vendored** assets from `packages/ui` — copy-in model, not runtime imports from monorepo packages in production spin-offs unless explicitly designed
- Preserve `siteId` and CMS contracts when changing routing or deploy modes
- Shared platform (many hostnames) vs premium dedicated frontends — both modes stay supported

---

## Customer UI vs operator UI

| Surface | Authority |
|---------|-----------|
| **Customer / template UI** | `packages/ui`, template-local design tokens, `.cursor/rules/12-linksites-ui-policy.mdc` |
| **LiNKaios operator UI** | LiNKtrend-System only — not this repo |

Never apply LiNKaios shell chrome, data-table families, or `ui-standards.ts` tokens to published SMB marketing sites unless an issue explicitly requires it.

---

## Security and secrets

- All secrets in **Google Secret Manager**; never commit credentials
- Use `${ENV_VAR}` placeholders in config; document names in `.env.example`
- Side effects (publish, DNS, external APIs) require **LinkSkills leases** when invoked from MVO flows — no ungoverned production writes from agents
- Principal approval gates apply to protected publish and outreach actions per MVO policy

---

## Non-goals (this repo)

- LiNKaios control plane or Admin UI
- Inventing CRM stages, Odoo records, or Plane issue shapes
- Parallel orchestration outside LiNKdev factory in LiNKtrend-System
- Fake publish success without live URL and audit trace from LiNKaios

---

## Stack reference

See repository [README.md](../../../README.md) and [docs/README.md](../../../docs/README.md) for layout, verify commands, and operational SOPs.
