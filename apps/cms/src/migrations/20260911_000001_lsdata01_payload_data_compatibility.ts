import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * LSDATA-01 additive Payload/data compatibility. Does not edit applied migration
 * bytes. Existing Offer/Case/template rows stay; new columns use compatible
 * defaults. Replay is idempotent (IF NOT EXISTS / exception handlers).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_template_adoptions_compatibility_class" AS ENUM (
        'retained-production-pin',
        'schema-compatibility-copy'
      );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      CREATE TYPE "enum_template_adoptions_activation_state" AS ENUM (
        'inactive',
        'active',
        'rejected'
      );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    ALTER TABLE "template_adoptions" ADD COLUMN IF NOT EXISTS "tenant_org_id" varchar;
    ALTER TABLE "template_adoptions" ADD COLUMN IF NOT EXISTS "compatibility_class" "enum_template_adoptions_compatibility_class" NOT NULL DEFAULT 'retained-production-pin';
    ALTER TABLE "template_adoptions" ADD COLUMN IF NOT EXISTS "activation_state" "enum_template_adoptions_activation_state" NOT NULL DEFAULT 'active';

    UPDATE "template_adoptions" AS ta
    SET "tenant_org_id" = s."org_id"
    FROM "sites" AS s
    WHERE ta."site_id" = s."id"
      AND ta."tenant_org_id" IS NULL
      AND s."org_id" IS NOT NULL;

    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "template_adoption_id" integer;
    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "entitlement_snapshot_id" integer;

    DO $$ BEGIN
      ALTER TABLE "template_adoptions" ADD CONSTRAINT "template_adoptions_lsdata01_activation_chk"
        CHECK (
          ("compatibility_class" = 'retained-production-pin')
          OR (
            "compatibility_class" = 'schema-compatibility-copy'
            AND "activation_state" <> 'active'
          )
        );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "template_adoptions" DROP CONSTRAINT IF EXISTS "template_adoptions_lsdata01_activation_chk";
    ALTER TABLE "sites" DROP COLUMN IF EXISTS "entitlement_snapshot_id";
    ALTER TABLE "sites" DROP COLUMN IF EXISTS "template_adoption_id";
    ALTER TABLE "template_adoptions" DROP COLUMN IF EXISTS "activation_state";
    ALTER TABLE "template_adoptions" DROP COLUMN IF EXISTS "compatibility_class";
    ALTER TABLE "template_adoptions" DROP COLUMN IF EXISTS "tenant_org_id";
  `)
}
