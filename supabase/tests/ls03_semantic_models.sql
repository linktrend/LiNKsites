-- LS-03 semantic model safety (ISS-10..12).
-- Run with: psql $DATABASE_URL -v ON_ERROR_STOP=1 -f supabase/tests/ls03_semantic_models.sql
\set ON_ERROR_STOP on

BEGIN;

\i supabase/tests/fixtures/ls03_fresh.sql
\i supabase/tests/fixtures/ls03_production_upgrade.sql
\i supabase/tests/fixtures/ls03_offer_case_compat.sql
\i supabase/tests/fixtures/ls03_rollback.sql
\i supabase/tests/fixtures/ls03_failed_migration.sql

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM lsites_sites.template_adoptions WHERE adoption_id = 'adopt:fresh-site'
  ) THEN
    RAISE EXCEPTION 'fresh template adoption fixture missing';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM lsites_sites.legacy_template_id_projections WHERE deprecated_template_id = 'master-template-type-1'
  ) THEN
    RAISE EXCEPTION 'legacy template projection fixture missing';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM lsites_sites.offer_case_compatibility WHERE target_collection = 'results-work'
  ) THEN
    RAISE EXCEPTION 'offer/case compatibility fixture missing';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM lsites_sites.template_adoptions
    WHERE adoption_id = 'adopt:rollback-site' AND adoption_state = 'rolled_back'
  ) THEN
    RAISE EXCEPTION 'rollback template adoption fixture missing';
  END IF;
  IF EXISTS (
    SELECT 1 FROM lsites_sites.template_adoptions WHERE adoption_id = 'adopt:fail-site'
  ) THEN
    RAISE EXCEPTION 'failed SHA-1 adoption leaked';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'lsites_sites'
      AND tablename = 'template_adoptions'
      AND policyname = 'template_adoptions_runtime_org_access'
  ) THEN
    RAISE EXCEPTION 'LS-03 template_adoptions runtime RLS policy missing';
  END IF;
END
$$;

ROLLBACK;
