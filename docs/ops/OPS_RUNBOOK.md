# LiNKsites Factory Kit - Ops Runbook

This runbook is the operational playbook for:

1. Deploy
2. Rollback
3. TLS/certificate issues
4. Outage response

Scope:
- shared frontend
- premium dedicated frontend(s)
- central CMS
- same VPS model, Supabase Postgres external

## A) Deploy Runbook

### A1. Pre-Deploy Checklist

1. Confirm the release tags (CMS + frontend) to deploy.
2. Confirm environment files/secrets are present for target environment.
3. Confirm Supabase is reachable from VPS.
4. Confirm disk has enough free space.
5. Confirm backup/snapshot exists before production deploy.

### A2. Deployment Order

Use this order to reduce risk:

1. Deploy CMS first.
2. Smoke test CMS API and admin login.
3. Deploy shared frontend.
4. Smoke test shared tenant routing.
5. If needed, deploy/restart premium dedicated frontend containers.

### A3. Post-Deploy Smoke Tests

Run all:

1. CMS health
   - admin login works
   - one public content query with `site=<siteId>` works
2. Shared frontend
   - a demo hostname resolves to correct site
   - a standard client hostname resolves correctly
3. Premium frontend (if any)
   - `SITE_ID`-locked site serves the correct tenant
4. SSL
   - HTTPS valid certificate on tested domains

## B) Rollback Runbook

### B1. Trigger Conditions

Rollback immediately if:

1. Home page fails for multiple domains.
2. Wrong tenant content appears on a domain.
3. CMS becomes unavailable.
4. Critical checkout/contact flow fails.

### B2. Rollback Steps

1. Stop current faulty deployment.
2. Redeploy previous known-good image/tag.
3. Confirm CMS and frontend both use compatible previous versions.
4. Re-run smoke tests from section A3.
5. Record incident details and root cause.

### B3. Data Rollback (Last Resort)

Only use DB rollback if there is data corruption.

1. Announce maintenance window.
2. Restore latest safe backup.
3. Validate core collections (`sites`, `site-domains`, `site-settings`, `pages`).
4. Re-enable traffic only after validation.

## C) Certificate / TLS Issue Playbook

Typical symptoms:
- browser says certificate invalid/expired
- HTTPS works on some domains but not others

### C1. Quick Checks

1. DNS record points to correct VPS IP.
2. Domain has propagated.
3. Proxy ACME challenge logs show success/failure.
4. No port 80/443 firewall block.

### C2. Common Fixes

1. Fix DNS A/CNAME target.
2. Re-run certificate issuance.
3. Ensure proxy can answer HTTP challenge on port 80.
4. For wildcard cert plan, ensure DNS-01 automation credentials are valid.

### C3. Temporary Mitigation

If a single domain fails:
1. Keep shared platform serving other domains.
2. Inform affected client quickly.
3. Use a working demo/subdomain fallback URL if needed.

## D) Outage Playbook

### D1. Priority Order

1. Restore service.
2. Protect data integrity.
3. Communicate status.
4. Perform root-cause analysis.

### D2. Triage Steps (First 10 Minutes)

1. Identify blast radius:
   - one domain, many domains, CMS only, or full outage
2. Check:
   - VPS health (CPU/RAM/disk)
   - proxy status
   - CMS container status
   - frontend container status
   - Supabase availability/connectivity
3. Decide:
   - quick restart vs rollback

### D3. Communication Template

Internal status note:
1. Time issue started
2. Affected services/domains
3. Current action
4. Next update ETA

### D4. Post-Incident

Within 24 hours:

1. Write incident summary.
2. List root cause and contributing factors.
3. Define preventive actions with owners and due dates.

## E) Weekly Ops Checklist

1. Check SSL certificate expiry windows.
2. Check VPS disk growth.
3. Check backup/snapshot success.
4. Review error logs for tenant resolution and CMS auth failures.
5. Test one random demo domain and one client domain.
