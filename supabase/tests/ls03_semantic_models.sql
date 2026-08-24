-- LS-03 semantic model safety (ISS-10..12).
-- Run with: psql $DATABASE_URL -v ON_ERROR_STOP=1 -f supabase/tests/ls03_semantic_models.sql
\set ON_ERROR_STOP on

BEGIN;

\i supabase/tests/fixtures/ls03_fresh.sql
\i supabase/tests/fixtures/ls03_production_upgrade.sql
\i supabase/tests/fixtures/ls03_offer_case_compat.sql

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
END
$$;

ROLLBACK;
