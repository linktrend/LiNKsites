-- migrate:up
-- W1-02 corrective integrity extension.
--
-- This migration is additive. Existing Stage values and rows remain intact;
-- the earlier corrective migration continues to project stage_ref into
-- phase_ref. NOT VALID preserves any historical rows that predate tenant
-- hierarchy while enforcing the composite relationships for every new row.

-- Issue hierarchy must remain in one tenant at every level. Nullable refs
-- preserve legacy Issues that have not yet been placed in a Module/Phase.
alter table lsites_ledger.issues
  add constraint fk_ledger_issue_module_org
    foreign key (program_ref, module_ref, org_id)
    references lsites_ledger.modules(program_id, module_id, org_id)
    not valid;

alter table lsites_ledger.issues
  add constraint fk_ledger_issue_phase_org
    foreign key (program_ref, module_ref, phase_ref, org_id)
    references lsites_ledger.phases(program_id, module_id, phase_id, org_id)
    not valid;

alter table lsites_ledger.issues
  add constraint ck_ledger_issue_phase_requires_module
    check (phase_ref is null or module_ref is not null)
    not valid;

-- Dependency targets are real, same-tenant Issues. The owner FK already
-- exists in the prior corrective migration; this closes the target side.
alter table lsites_ledger.issue_dependencies
  add constraint fk_ledger_dependency_target_org
    foreign key (depends_on_issue_id, org_id)
    references lsites_ledger.issues(issue_id, org_id)
    not valid;

-- Every polymorphic ledger record that names an Issue or Run must carry the
-- same tenant as that target. Existing single-column FKs remain in place for
-- legacy delete behaviour; these composite FKs enforce tenant consistency for
-- all future writes.
alter table lsites_ledger.gate_results
  add constraint fk_ledger_gate_issue_org
    foreign key (issue_id, org_id)
    references lsites_ledger.issues(issue_id, org_id)
    not valid,
  add constraint fk_ledger_gate_run_org
    foreign key (run_id, org_id)
    references lsites_ledger.runs(run_id, org_id)
    not valid,
  add constraint ck_ledger_issue_gate_has_run
    check (subject_type <> 'issue' or (issue_id is not null and run_id is not null))
    not valid;

alter table lsites_ledger.ledger_events
  add constraint fk_ledger_event_issue_org
    foreign key (issue_id, org_id)
    references lsites_ledger.issues(issue_id, org_id)
    not valid,
  add constraint fk_ledger_event_run_org
    foreign key (run_id, org_id)
    references lsites_ledger.runs(run_id, org_id)
    not valid;

alter table lsites_ledger.idempotency_records
  add constraint fk_ledger_idempotency_issue_org
    foreign key (issue_id, org_id)
    references lsites_ledger.issues(issue_id, org_id)
    not valid,
  add constraint fk_ledger_idempotency_run_org
    foreign key (run_id, org_id)
    references lsites_ledger.runs(run_id, org_id)
    not valid;

-- Runtime grants and tenant RLS are inherited from the preceding W1-02
-- corrective migration; this file adds no broader access.

-- migrate:down intentionally omitted: these constraints are forward-only
-- hardening and must not be removed by application rollback code.
