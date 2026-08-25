import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * LS-03 additive Payload owner migration. Does not edit applied migration bytes.
 * Fresh, upgrade, Offer/Case compatibility, failed-safety, and rollback are
 * proven by fixtures and contract tests that execute this SQL.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_template_adoptions_adoption_state" AS ENUM ('linked', 'adopted', 'replaced', 'rolled_back');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      CREATE TYPE "enum_entitlement_snapshots_plan_id" AS ENUM ('A', 'B', 'C', 'L');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      CREATE TYPE "enum_products_semantic_kind" AS ENUM ('product');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      CREATE TYPE "enum_services_semantic_kind" AS ENUM ('service');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      CREATE TYPE "enum_policies_policy_kind" AS ENUM ('privacy', 'terms', 'cookie', 'other');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      CREATE TYPE "enum_core_settings_content_mode" AS ENUM ('product', 'service', 'hybrid', 'neither');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      CREATE TYPE "enum_core_settings_capability_plan_id" AS ENUM ('A', 'B', 'C', 'L');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      CREATE TYPE "enum_ls03_workflow_status" AS ENUM ('draft', 'pending', 'approved', 'published');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      CREATE TYPE "enum_ls03_v_published_locale" AS ENUM ('en', 'zh-TW', 'es');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "entitlement_snapshots" (
      "id" serial PRIMARY KEY NOT NULL,
      "snapshot_id" varchar NOT NULL,
      "site_id" integer,
      "locale" varchar,
      "site_ref" varchar NOT NULL,
      "plan_id" "enum_entitlement_snapshots_plan_id" NOT NULL,
      "granted_credits" numeric NOT NULL,
      "budgets_a" numeric NOT NULL DEFAULT 30,
      "budgets_b" numeric NOT NULL DEFAULT 15,
      "budgets_c" numeric NOT NULL DEFAULT 6,
      "budgets_l" numeric NOT NULL DEFAULT 0,
      "schema_version_major" numeric NOT NULL DEFAULT 1,
      "schema_version_minor" numeric NOT NULL DEFAULT 0,
      "digest" varchar NOT NULL,
      "before_record" jsonb,
      "after_record" jsonb,
      "rollback_record" jsonb,
      "actor_id" varchar NOT NULL,
      "evidence_digest" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "entitlement_snapshots_snapshot_id_idx" ON "entitlement_snapshots" ("snapshot_id");

    CREATE TABLE IF NOT EXISTS "template_adoptions" (
      "id" serial PRIMARY KEY NOT NULL,
      "adoption_id" varchar NOT NULL,
      "site_id" integer,
      "locale" varchar,
      "adoption_state" "enum_template_adoptions_adoption_state" NOT NULL,
      "identities_provider" varchar NOT NULL,
      "identities_layout" varchar NOT NULL,
      "identities_plan" varchar NOT NULL,
      "identities_overlay" varchar NOT NULL,
      "identities_config" varchar NOT NULL,
      "identities_content" varchar NOT NULL,
      "identities_adapter" varchar NOT NULL,
      "identities_effective" varchar NOT NULL,
      "entitlement_snapshot_id" integer,
      "before_record" jsonb,
      "after_record" jsonb,
      "rollback_record" jsonb,
      "actor_id" varchar NOT NULL,
      "evidence_digest" varchar NOT NULL,
      "deprecated_template_id_projection" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "template_adoptions_adoption_id_idx" ON "template_adoptions" ("adoption_id");

    CREATE TABLE IF NOT EXISTS "products" (
      "id" serial PRIMARY KEY NOT NULL,
      "semantic_kind" "enum_products_semantic_kind" DEFAULT 'product' NOT NULL,
      "sku" varchar,
      "featured_image_id" integer,
      "seo_og_image_id" integer,
      "seo_no_index" boolean DEFAULT false,
      "site_id" integer,
      "locale" varchar,
      "status" "enum_ls03_workflow_status" DEFAULT 'draft',
      "submitted_by_id" integer,
      "reviewed_by_id" integer,
      "reviewed_at" timestamp(3) with time zone,
      "auto_approved" boolean,
      "published_at" timestamp(3) with time zone,
      "provenance_source_identity" varchar,
      "provenance_evidence_digest" varchar,
      "provenance_actor_id" varchar,
      "provenance_recorded_at" timestamp(3) with time zone,
      "provenance_locale_bound" boolean DEFAULT true,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" "enum_ls03_workflow_status" DEFAULT 'draft'
    );
    CREATE TABLE IF NOT EXISTS "products_locales" (
      "title" varchar,
      "slug" varchar,
      "summary" varchar,
      "description" jsonb,
      "seo_title" varchar,
      "seo_description" varchar,
      "seo_keywords" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "services" (
      "id" serial PRIMARY KEY NOT NULL,
      "semantic_kind" "enum_services_semantic_kind" DEFAULT 'service' NOT NULL,
      "service_code" varchar,
      "featured_image_id" integer,
      "seo_og_image_id" integer,
      "seo_no_index" boolean DEFAULT false,
      "site_id" integer,
      "locale" varchar,
      "status" "enum_ls03_workflow_status" DEFAULT 'draft',
      "submitted_by_id" integer,
      "reviewed_by_id" integer,
      "reviewed_at" timestamp(3) with time zone,
      "auto_approved" boolean,
      "published_at" timestamp(3) with time zone,
      "provenance_source_identity" varchar,
      "provenance_evidence_digest" varchar,
      "provenance_actor_id" varchar,
      "provenance_recorded_at" timestamp(3) with time zone,
      "provenance_locale_bound" boolean DEFAULT true,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" "enum_ls03_workflow_status" DEFAULT 'draft'
    );
    CREATE TABLE IF NOT EXISTS "services_locales" (
      "title" varchar,
      "slug" varchar,
      "summary" varchar,
      "description" jsonb,
      "seo_title" varchar,
      "seo_description" varchar,
      "seo_keywords" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "results_work" (
      "id" serial PRIMARY KEY NOT NULL,
      "client" varchar,
      "featured_image_id" integer,
      "seo_og_image_id" integer,
      "seo_no_index" boolean DEFAULT false,
      "site_id" integer,
      "locale" varchar,
      "status" "enum_ls03_workflow_status" DEFAULT 'draft',
      "submitted_by_id" integer,
      "reviewed_by_id" integer,
      "reviewed_at" timestamp(3) with time zone,
      "auto_approved" boolean,
      "published_at" timestamp(3) with time zone,
      "provenance_source_identity" varchar,
      "provenance_evidence_digest" varchar,
      "provenance_actor_id" varchar,
      "provenance_recorded_at" timestamp(3) with time zone,
      "provenance_locale_bound" boolean DEFAULT true,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" "enum_ls03_workflow_status" DEFAULT 'draft'
    );
    CREATE TABLE IF NOT EXISTS "results_work_locales" (
      "title" varchar,
      "slug" varchar,
      "industry" varchar,
      "summary" varchar,
      "outcome" jsonb,
      "seo_title" varchar,
      "seo_description" varchar,
      "seo_keywords" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "service_areas" (
      "id" serial PRIMARY KEY NOT NULL,
      "site_id" integer,
      "locale" varchar,
      "status" "enum_ls03_workflow_status" DEFAULT 'draft',
      "submitted_by_id" integer,
      "reviewed_by_id" integer,
      "reviewed_at" timestamp(3) with time zone,
      "auto_approved" boolean,
      "published_at" timestamp(3) with time zone,
      "provenance_source_identity" varchar,
      "provenance_evidence_digest" varchar,
      "provenance_actor_id" varchar,
      "provenance_recorded_at" timestamp(3) with time zone,
      "provenance_locale_bound" boolean DEFAULT true,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" "enum_ls03_workflow_status" DEFAULT 'draft'
    );
    CREATE TABLE IF NOT EXISTS "service_areas_locales" (
      "name" varchar,
      "slug" varchar,
      "region" varchar,
      "coverage_summary" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "policies" (
      "id" serial PRIMARY KEY NOT NULL,
      "policy_kind" "enum_policies_policy_kind" NOT NULL,
      "last_reviewed_at" timestamp(3) with time zone,
      "seo_og_image_id" integer,
      "seo_no_index" boolean DEFAULT false,
      "site_id" integer,
      "locale" varchar,
      "status" "enum_ls03_workflow_status" DEFAULT 'draft',
      "submitted_by_id" integer,
      "reviewed_by_id" integer,
      "reviewed_at" timestamp(3) with time zone,
      "auto_approved" boolean,
      "published_at" timestamp(3) with time zone,
      "provenance_source_identity" varchar,
      "provenance_evidence_digest" varchar,
      "provenance_actor_id" varchar,
      "provenance_recorded_at" timestamp(3) with time zone,
      "provenance_locale_bound" boolean DEFAULT true,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" "enum_ls03_workflow_status" DEFAULT 'draft'
    );
    CREATE TABLE IF NOT EXISTS "policies_locales" (
      "title" varchar,
      "slug" varchar,
      "body" jsonb,
      "seo_title" varchar,
      "seo_description" varchar,
      "seo_keywords" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "core_settings" (
      "id" serial PRIMARY KEY NOT NULL,
      "site_id" integer,
      "locale" varchar,
      "content_mode" "enum_core_settings_content_mode" NOT NULL,
      "capability_plan_id" "enum_core_settings_capability_plan_id" NOT NULL,
      "template_adoption_id" integer,
      "entitlement_snapshot_id" integer,
      "deprecated_template_id_projection" varchar,
      "brand_primary_action_href" varchar,
      "provenance_source_identity" varchar,
      "provenance_evidence_digest" varchar,
      "provenance_actor_id" varchar,
      "provenance_recorded_at" timestamp(3) with time zone,
      "provenance_locale_bound" boolean DEFAULT true,
      "_status" "enum_ls03_workflow_status" DEFAULT 'draft',
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE TABLE IF NOT EXISTS "core_settings_locales" (
      "brand_legal_name" varchar,
      "brand_short_name" varchar,
      "brand_primary_action_label" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "_products_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_semantic_kind" "enum_products_semantic_kind" DEFAULT 'product',
      "version_sku" varchar,
      "version_featured_image_id" integer,
      "version_seo_og_image_id" integer,
      "version_seo_no_index" boolean DEFAULT false,
      "version_site_id" integer,
      "version_locale" varchar,
      "version_status" "enum_ls03_workflow_status" DEFAULT 'draft',
      "version_submitted_by_id" integer,
      "version_reviewed_by_id" integer,
      "version_reviewed_at" timestamp(3) with time zone,
      "version_auto_approved" boolean,
      "version_published_at" timestamp(3) with time zone,
      "version_provenance_source_identity" varchar,
      "version_provenance_evidence_digest" varchar,
      "version_provenance_actor_id" varchar,
      "version_provenance_recorded_at" timestamp(3) with time zone,
      "version_provenance_locale_bound" boolean DEFAULT true,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum_ls03_workflow_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "snapshot" boolean,
      "published_locale" "enum_ls03_v_published_locale",
      "latest" boolean
    );
    CREATE TABLE IF NOT EXISTS "_products_v_locales" (
      "version_title" varchar,
      "version_slug" varchar,
      "version_summary" varchar,
      "version_description" jsonb,
      "version_seo_title" varchar,
      "version_seo_description" varchar,
      "version_seo_keywords" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "_services_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_semantic_kind" "enum_services_semantic_kind" DEFAULT 'service',
      "version_service_code" varchar,
      "version_featured_image_id" integer,
      "version_seo_og_image_id" integer,
      "version_seo_no_index" boolean DEFAULT false,
      "version_site_id" integer,
      "version_locale" varchar,
      "version_status" "enum_ls03_workflow_status" DEFAULT 'draft',
      "version_submitted_by_id" integer,
      "version_reviewed_by_id" integer,
      "version_reviewed_at" timestamp(3) with time zone,
      "version_auto_approved" boolean,
      "version_published_at" timestamp(3) with time zone,
      "version_provenance_source_identity" varchar,
      "version_provenance_evidence_digest" varchar,
      "version_provenance_actor_id" varchar,
      "version_provenance_recorded_at" timestamp(3) with time zone,
      "version_provenance_locale_bound" boolean DEFAULT true,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum_ls03_workflow_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "snapshot" boolean,
      "published_locale" "enum_ls03_v_published_locale",
      "latest" boolean
    );
    CREATE TABLE IF NOT EXISTS "_services_v_locales" (
      "version_title" varchar,
      "version_slug" varchar,
      "version_summary" varchar,
      "version_description" jsonb,
      "version_seo_title" varchar,
      "version_seo_description" varchar,
      "version_seo_keywords" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "_results_work_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_client" varchar,
      "version_featured_image_id" integer,
      "version_seo_og_image_id" integer,
      "version_seo_no_index" boolean DEFAULT false,
      "version_site_id" integer,
      "version_locale" varchar,
      "version_status" "enum_ls03_workflow_status" DEFAULT 'draft',
      "version_submitted_by_id" integer,
      "version_reviewed_by_id" integer,
      "version_reviewed_at" timestamp(3) with time zone,
      "version_auto_approved" boolean,
      "version_published_at" timestamp(3) with time zone,
      "version_provenance_source_identity" varchar,
      "version_provenance_evidence_digest" varchar,
      "version_provenance_actor_id" varchar,
      "version_provenance_recorded_at" timestamp(3) with time zone,
      "version_provenance_locale_bound" boolean DEFAULT true,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum_ls03_workflow_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "snapshot" boolean,
      "published_locale" "enum_ls03_v_published_locale",
      "latest" boolean
    );
    CREATE TABLE IF NOT EXISTS "_results_work_v_locales" (
      "version_title" varchar,
      "version_slug" varchar,
      "version_industry" varchar,
      "version_summary" varchar,
      "version_outcome" jsonb,
      "version_seo_title" varchar,
      "version_seo_description" varchar,
      "version_seo_keywords" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "_service_areas_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_site_id" integer,
      "version_locale" varchar,
      "version_status" "enum_ls03_workflow_status" DEFAULT 'draft',
      "version_submitted_by_id" integer,
      "version_reviewed_by_id" integer,
      "version_reviewed_at" timestamp(3) with time zone,
      "version_auto_approved" boolean,
      "version_published_at" timestamp(3) with time zone,
      "version_provenance_source_identity" varchar,
      "version_provenance_evidence_digest" varchar,
      "version_provenance_actor_id" varchar,
      "version_provenance_recorded_at" timestamp(3) with time zone,
      "version_provenance_locale_bound" boolean DEFAULT true,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum_ls03_workflow_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "snapshot" boolean,
      "published_locale" "enum_ls03_v_published_locale",
      "latest" boolean
    );
    CREATE TABLE IF NOT EXISTS "_service_areas_v_locales" (
      "version_name" varchar,
      "version_slug" varchar,
      "version_region" varchar,
      "version_coverage_summary" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "_policies_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_policy_kind" "enum_policies_policy_kind",
      "version_last_reviewed_at" timestamp(3) with time zone,
      "version_seo_og_image_id" integer,
      "version_seo_no_index" boolean DEFAULT false,
      "version_site_id" integer,
      "version_locale" varchar,
      "version_status" "enum_ls03_workflow_status" DEFAULT 'draft',
      "version_submitted_by_id" integer,
      "version_reviewed_by_id" integer,
      "version_reviewed_at" timestamp(3) with time zone,
      "version_auto_approved" boolean,
      "version_published_at" timestamp(3) with time zone,
      "version_provenance_source_identity" varchar,
      "version_provenance_evidence_digest" varchar,
      "version_provenance_actor_id" varchar,
      "version_provenance_recorded_at" timestamp(3) with time zone,
      "version_provenance_locale_bound" boolean DEFAULT true,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum_ls03_workflow_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "snapshot" boolean,
      "published_locale" "enum_ls03_v_published_locale",
      "latest" boolean
    );
    CREATE TABLE IF NOT EXISTS "_policies_v_locales" (
      "version_title" varchar,
      "version_slug" varchar,
      "version_body" jsonb,
      "version_seo_title" varchar,
      "version_seo_description" varchar,
      "version_seo_keywords" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "_core_settings_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_site_id" integer,
      "version_locale" varchar,
      "version_content_mode" "enum_core_settings_content_mode",
      "version_capability_plan_id" "enum_core_settings_capability_plan_id",
      "version_template_adoption_id" integer,
      "version_entitlement_snapshot_id" integer,
      "version_deprecated_template_id_projection" varchar,
      "version_brand_primary_action_href" varchar,
      "version_provenance_source_identity" varchar,
      "version_provenance_evidence_digest" varchar,
      "version_provenance_actor_id" varchar,
      "version_provenance_recorded_at" timestamp(3) with time zone,
      "version_provenance_locale_bound" boolean DEFAULT true,
      "version__status" "enum_ls03_workflow_status" DEFAULT 'draft',
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "snapshot" boolean,
      "published_locale" "enum_ls03_v_published_locale",
      "latest" boolean
    );
    CREATE TABLE IF NOT EXISTS "_core_settings_v_locales" (
      "version_brand_legal_name" varchar,
      "version_brand_short_name" varchar,
      "version_brand_primary_action_label" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "deprecated_template_id_projection" boolean DEFAULT true;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "template_adoption_id" integer;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "entitlement_snapshot_id" integer;
    ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "provenance_source_identity" varchar;
    ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "provenance_evidence_digest" varchar;
    ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "provenance_actor_id" varchar;
    ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "provenance_recorded_at" timestamp(3) with time zone;
    ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "provenance_locale_bound" boolean DEFAULT true;
    ALTER TABLE "_articles_v" ADD COLUMN IF NOT EXISTS "version_provenance_source_identity" varchar;
    ALTER TABLE "_articles_v" ADD COLUMN IF NOT EXISTS "version_provenance_evidence_digest" varchar;
    ALTER TABLE "_articles_v" ADD COLUMN IF NOT EXISTS "version_provenance_actor_id" varchar;
    ALTER TABLE "_articles_v" ADD COLUMN IF NOT EXISTS "version_provenance_recorded_at" timestamp(3) with time zone;
    ALTER TABLE "_articles_v" ADD COLUMN IF NOT EXISTS "version_provenance_locale_bound" boolean DEFAULT true;
    ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "provenance_source_identity" varchar;
    ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "provenance_evidence_digest" varchar;
    ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "provenance_actor_id" varchar;
    ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "provenance_recorded_at" timestamp(3) with time zone;
    ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "provenance_locale_bound" boolean DEFAULT true;
    ALTER TABLE "_videos_v" ADD COLUMN IF NOT EXISTS "version_provenance_source_identity" varchar;
    ALTER TABLE "_videos_v" ADD COLUMN IF NOT EXISTS "version_provenance_evidence_digest" varchar;
    ALTER TABLE "_videos_v" ADD COLUMN IF NOT EXISTS "version_provenance_actor_id" varchar;
    ALTER TABLE "_videos_v" ADD COLUMN IF NOT EXISTS "version_provenance_recorded_at" timestamp(3) with time zone;
    ALTER TABLE "_videos_v" ADD COLUMN IF NOT EXISTS "version_provenance_locale_bound" boolean DEFAULT true;
    ALTER TABLE "faq_pages" ADD COLUMN IF NOT EXISTS "provenance_source_identity" varchar;
    ALTER TABLE "faq_pages" ADD COLUMN IF NOT EXISTS "provenance_evidence_digest" varchar;
    ALTER TABLE "faq_pages" ADD COLUMN IF NOT EXISTS "provenance_actor_id" varchar;
    ALTER TABLE "faq_pages" ADD COLUMN IF NOT EXISTS "provenance_recorded_at" timestamp(3) with time zone;
    ALTER TABLE "faq_pages" ADD COLUMN IF NOT EXISTS "provenance_locale_bound" boolean DEFAULT true;
    ALTER TABLE "_faq_pages_v" ADD COLUMN IF NOT EXISTS "version_provenance_source_identity" varchar;
    ALTER TABLE "_faq_pages_v" ADD COLUMN IF NOT EXISTS "version_provenance_evidence_digest" varchar;
    ALTER TABLE "_faq_pages_v" ADD COLUMN IF NOT EXISTS "version_provenance_actor_id" varchar;
    ALTER TABLE "_faq_pages_v" ADD COLUMN IF NOT EXISTS "version_provenance_recorded_at" timestamp(3) with time zone;
    ALTER TABLE "_faq_pages_v" ADD COLUMN IF NOT EXISTS "version_provenance_locale_bound" boolean DEFAULT true;
    ALTER TABLE "help_articles" ADD COLUMN IF NOT EXISTS "provenance_source_identity" varchar;
    ALTER TABLE "help_articles" ADD COLUMN IF NOT EXISTS "provenance_evidence_digest" varchar;
    ALTER TABLE "help_articles" ADD COLUMN IF NOT EXISTS "provenance_actor_id" varchar;
    ALTER TABLE "help_articles" ADD COLUMN IF NOT EXISTS "provenance_recorded_at" timestamp(3) with time zone;
    ALTER TABLE "help_articles" ADD COLUMN IF NOT EXISTS "provenance_locale_bound" boolean DEFAULT true;
    ALTER TABLE "_help_articles_v" ADD COLUMN IF NOT EXISTS "version_provenance_source_identity" varchar;
    ALTER TABLE "_help_articles_v" ADD COLUMN IF NOT EXISTS "version_provenance_evidence_digest" varchar;
    ALTER TABLE "_help_articles_v" ADD COLUMN IF NOT EXISTS "version_provenance_actor_id" varchar;
    ALTER TABLE "_help_articles_v" ADD COLUMN IF NOT EXISTS "version_provenance_recorded_at" timestamp(3) with time zone;
    ALTER TABLE "_help_articles_v" ADD COLUMN IF NOT EXISTS "version_provenance_locale_bound" boolean DEFAULT true;
    ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "provenance_source_identity" varchar;
    ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "provenance_evidence_digest" varchar;
    ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "provenance_actor_id" varchar;
    ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "provenance_recorded_at" timestamp(3) with time zone;
    ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "provenance_locale_bound" boolean DEFAULT true;
    ALTER TABLE "_team_members_v" ADD COLUMN IF NOT EXISTS "version_provenance_source_identity" varchar;
    ALTER TABLE "_team_members_v" ADD COLUMN IF NOT EXISTS "version_provenance_evidence_digest" varchar;
    ALTER TABLE "_team_members_v" ADD COLUMN IF NOT EXISTS "version_provenance_actor_id" varchar;
    ALTER TABLE "_team_members_v" ADD COLUMN IF NOT EXISTS "version_provenance_recorded_at" timestamp(3) with time zone;
    ALTER TABLE "_team_members_v" ADD COLUMN IF NOT EXISTS "version_provenance_locale_bound" boolean DEFAULT true;
    ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "provenance_source_identity" varchar;
    ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "provenance_evidence_digest" varchar;
    ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "provenance_actor_id" varchar;
    ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "provenance_recorded_at" timestamp(3) with time zone;
    ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "provenance_locale_bound" boolean DEFAULT true;
    ALTER TABLE "_locations_v" ADD COLUMN IF NOT EXISTS "version_provenance_source_identity" varchar;
    ALTER TABLE "_locations_v" ADD COLUMN IF NOT EXISTS "version_provenance_evidence_digest" varchar;
    ALTER TABLE "_locations_v" ADD COLUMN IF NOT EXISTS "version_provenance_actor_id" varchar;
    ALTER TABLE "_locations_v" ADD COLUMN IF NOT EXISTS "version_provenance_recorded_at" timestamp(3) with time zone;
    ALTER TABLE "_locations_v" ADD COLUMN IF NOT EXISTS "version_provenance_locale_bound" boolean DEFAULT true;

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "template_adoptions_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "entitlement_snapshots_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "products_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "services_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "results_work_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "service_areas_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "policies_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "core_settings_id" integer;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "core_settings_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "policies_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "service_areas_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "results_work_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "services_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "products_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "entitlement_snapshots_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "template_adoptions_id";
    ALTER TABLE "_locations_v" DROP COLUMN IF EXISTS "version_provenance_locale_bound";
    ALTER TABLE "_locations_v" DROP COLUMN IF EXISTS "version_provenance_recorded_at";
    ALTER TABLE "_locations_v" DROP COLUMN IF EXISTS "version_provenance_actor_id";
    ALTER TABLE "_locations_v" DROP COLUMN IF EXISTS "version_provenance_evidence_digest";
    ALTER TABLE "_locations_v" DROP COLUMN IF EXISTS "version_provenance_source_identity";
    ALTER TABLE "locations" DROP COLUMN IF EXISTS "provenance_locale_bound";
    ALTER TABLE "locations" DROP COLUMN IF EXISTS "provenance_recorded_at";
    ALTER TABLE "locations" DROP COLUMN IF EXISTS "provenance_actor_id";
    ALTER TABLE "locations" DROP COLUMN IF EXISTS "provenance_evidence_digest";
    ALTER TABLE "locations" DROP COLUMN IF EXISTS "provenance_source_identity";
    ALTER TABLE "_team_members_v" DROP COLUMN IF EXISTS "version_provenance_locale_bound";
    ALTER TABLE "_team_members_v" DROP COLUMN IF EXISTS "version_provenance_recorded_at";
    ALTER TABLE "_team_members_v" DROP COLUMN IF EXISTS "version_provenance_actor_id";
    ALTER TABLE "_team_members_v" DROP COLUMN IF EXISTS "version_provenance_evidence_digest";
    ALTER TABLE "_team_members_v" DROP COLUMN IF EXISTS "version_provenance_source_identity";
    ALTER TABLE "team_members" DROP COLUMN IF EXISTS "provenance_locale_bound";
    ALTER TABLE "team_members" DROP COLUMN IF EXISTS "provenance_recorded_at";
    ALTER TABLE "team_members" DROP COLUMN IF EXISTS "provenance_actor_id";
    ALTER TABLE "team_members" DROP COLUMN IF EXISTS "provenance_evidence_digest";
    ALTER TABLE "team_members" DROP COLUMN IF EXISTS "provenance_source_identity";
    ALTER TABLE "_help_articles_v" DROP COLUMN IF EXISTS "version_provenance_locale_bound";
    ALTER TABLE "_help_articles_v" DROP COLUMN IF EXISTS "version_provenance_recorded_at";
    ALTER TABLE "_help_articles_v" DROP COLUMN IF EXISTS "version_provenance_actor_id";
    ALTER TABLE "_help_articles_v" DROP COLUMN IF EXISTS "version_provenance_evidence_digest";
    ALTER TABLE "_help_articles_v" DROP COLUMN IF EXISTS "version_provenance_source_identity";
    ALTER TABLE "help_articles" DROP COLUMN IF EXISTS "provenance_locale_bound";
    ALTER TABLE "help_articles" DROP COLUMN IF EXISTS "provenance_recorded_at";
    ALTER TABLE "help_articles" DROP COLUMN IF EXISTS "provenance_actor_id";
    ALTER TABLE "help_articles" DROP COLUMN IF EXISTS "provenance_evidence_digest";
    ALTER TABLE "help_articles" DROP COLUMN IF EXISTS "provenance_source_identity";
    ALTER TABLE "_faq_pages_v" DROP COLUMN IF EXISTS "version_provenance_locale_bound";
    ALTER TABLE "_faq_pages_v" DROP COLUMN IF EXISTS "version_provenance_recorded_at";
    ALTER TABLE "_faq_pages_v" DROP COLUMN IF EXISTS "version_provenance_actor_id";
    ALTER TABLE "_faq_pages_v" DROP COLUMN IF EXISTS "version_provenance_evidence_digest";
    ALTER TABLE "_faq_pages_v" DROP COLUMN IF EXISTS "version_provenance_source_identity";
    ALTER TABLE "faq_pages" DROP COLUMN IF EXISTS "provenance_locale_bound";
    ALTER TABLE "faq_pages" DROP COLUMN IF EXISTS "provenance_recorded_at";
    ALTER TABLE "faq_pages" DROP COLUMN IF EXISTS "provenance_actor_id";
    ALTER TABLE "faq_pages" DROP COLUMN IF EXISTS "provenance_evidence_digest";
    ALTER TABLE "faq_pages" DROP COLUMN IF EXISTS "provenance_source_identity";
    ALTER TABLE "_videos_v" DROP COLUMN IF EXISTS "version_provenance_locale_bound";
    ALTER TABLE "_videos_v" DROP COLUMN IF EXISTS "version_provenance_recorded_at";
    ALTER TABLE "_videos_v" DROP COLUMN IF EXISTS "version_provenance_actor_id";
    ALTER TABLE "_videos_v" DROP COLUMN IF EXISTS "version_provenance_evidence_digest";
    ALTER TABLE "_videos_v" DROP COLUMN IF EXISTS "version_provenance_source_identity";
    ALTER TABLE "videos" DROP COLUMN IF EXISTS "provenance_locale_bound";
    ALTER TABLE "videos" DROP COLUMN IF EXISTS "provenance_recorded_at";
    ALTER TABLE "videos" DROP COLUMN IF EXISTS "provenance_actor_id";
    ALTER TABLE "videos" DROP COLUMN IF EXISTS "provenance_evidence_digest";
    ALTER TABLE "videos" DROP COLUMN IF EXISTS "provenance_source_identity";
    ALTER TABLE "_articles_v" DROP COLUMN IF EXISTS "version_provenance_locale_bound";
    ALTER TABLE "_articles_v" DROP COLUMN IF EXISTS "version_provenance_recorded_at";
    ALTER TABLE "_articles_v" DROP COLUMN IF EXISTS "version_provenance_actor_id";
    ALTER TABLE "_articles_v" DROP COLUMN IF EXISTS "version_provenance_evidence_digest";
    ALTER TABLE "_articles_v" DROP COLUMN IF EXISTS "version_provenance_source_identity";
    ALTER TABLE "articles" DROP COLUMN IF EXISTS "provenance_locale_bound";
    ALTER TABLE "articles" DROP COLUMN IF EXISTS "provenance_recorded_at";
    ALTER TABLE "articles" DROP COLUMN IF EXISTS "provenance_actor_id";
    ALTER TABLE "articles" DROP COLUMN IF EXISTS "provenance_evidence_digest";
    ALTER TABLE "articles" DROP COLUMN IF EXISTS "provenance_source_identity";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "entitlement_snapshot_id";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "template_adoption_id";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "deprecated_template_id_projection";
    DROP TABLE IF EXISTS "_core_settings_v_locales";
    DROP TABLE IF EXISTS "_core_settings_v";
    DROP TABLE IF EXISTS "_policies_v_locales";
    DROP TABLE IF EXISTS "_policies_v";
    DROP TABLE IF EXISTS "_service_areas_v_locales";
    DROP TABLE IF EXISTS "_service_areas_v";
    DROP TABLE IF EXISTS "_results_work_v_locales";
    DROP TABLE IF EXISTS "_results_work_v";
    DROP TABLE IF EXISTS "_services_v_locales";
    DROP TABLE IF EXISTS "_services_v";
    DROP TABLE IF EXISTS "_products_v_locales";
    DROP TABLE IF EXISTS "_products_v";
    DROP TABLE IF EXISTS "core_settings_locales";
    DROP TABLE IF EXISTS "core_settings";
    DROP TABLE IF EXISTS "policies_locales";
    DROP TABLE IF EXISTS "policies";
    DROP TABLE IF EXISTS "service_areas_locales";
    DROP TABLE IF EXISTS "service_areas";
    DROP TABLE IF EXISTS "results_work_locales";
    DROP TABLE IF EXISTS "results_work";
    DROP TABLE IF EXISTS "services_locales";
    DROP TABLE IF EXISTS "services";
    DROP TABLE IF EXISTS "products_locales";
    DROP TABLE IF EXISTS "products";
    DROP TABLE IF EXISTS "template_adoptions";
    DROP TABLE IF EXISTS "entitlement_snapshots";
  `)
}
