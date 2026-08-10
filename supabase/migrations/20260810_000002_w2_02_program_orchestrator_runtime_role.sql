-- migrate:up
-- W2-02 correction: the program-orchestrator connection uses the existing
-- svc_linksites_runtime role. Align that actual role with the W2-02 ledger
-- boundary and the server-side org/site session scope. This is additive and
-- leaves all earlier migrations unchanged.

grant usage on schema lsites_ledger to svc_linksites_runtime;
grant select, insert, update on lsites_ledger.program_runtime_states to svc_linksites_runtime;
grant select, insert, update on lsites_ledger.program_intake to svc_linksites_runtime;
grant select, insert on lsites_ledger.program_completion_deliveries to svc_linksites_runtime;
grant select, insert on lsites_ledger.evidence_receipts to svc_linksites_runtime;

create policy w2_02_runtime_org_boundary on lsites_ledger.program_runtime_states
  for all to svc_linksites_runtime
  using (org_id = nullif(current_setting('app.org_id', true), '')::uuid)
  with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);
create policy w2_02_runtime_org_boundary on lsites_ledger.program_intake
  for all to svc_linksites_runtime
  using (org_id = nullif(current_setting('app.org_id', true), '')::uuid)
  with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);
create policy w2_02_runtime_org_boundary on lsites_ledger.program_completion_deliveries
  for all to svc_linksites_runtime
  using (org_id = nullif(current_setting('app.org_id', true), '')::uuid)
  with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);
create policy w2_02_runtime_org_boundary on lsites_ledger.evidence_receipts
  for all to svc_linksites_runtime
  using (org_id = nullif(current_setting('app.org_id', true), '')::uuid)
  with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);

drop policy if exists working_packages_runtime_org_access on lsites_sites.working_packages;
create policy working_packages_runtime_org_access on lsites_sites.working_packages
  for all to svc_linksites_runtime
  using (org_id = nullif(current_setting('app.org_id', true), '')::uuid)
  with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);
drop policy if exists working_versions_runtime_org_access on lsites_sites.working_content_versions;
create policy working_versions_runtime_org_access on lsites_sites.working_content_versions
  for all to svc_linksites_runtime
  using (org_id = nullif(current_setting('app.org_id', true), '')::uuid)
  with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);
drop policy if exists working_receipts_runtime_org_access on lsites_sites.working_content_promotion_receipts;
create policy working_receipts_runtime_org_access on lsites_sites.working_content_promotion_receipts
  for all to svc_linksites_runtime
  using (org_id = nullif(current_setting('app.org_id', true), '')::uuid)
  with check (org_id = nullif(current_setting('app.org_id', true), '')::uuid);

-- migrate:down intentionally omitted; this is a forward-only production
-- privilege/RLS correction and must not be rolled back by application code.
