import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * LSDATA-01 additive Payload/data compatibility. Does not edit applied migration
 * bytes. Existing Offer/Case/template rows stay; historical adoption rows are
 * rejected until their exact provider/adapter pair is classified. Replay is
 * idempotent (IF NOT EXISTS / exception handlers).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_template_adoptions_compatibility_class" AS ENUM (
        'unverified',
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
    ALTER TABLE "template_adoptions" ADD COLUMN IF NOT EXISTS "compatibility_class" "enum_template_adoptions_compatibility_class" NOT NULL DEFAULT 'unverified';
    ALTER TABLE "template_adoptions" ADD COLUMN IF NOT EXISTS "activation_state" "enum_template_adoptions_activation_state" NOT NULL DEFAULT 'rejected';

    UPDATE "template_adoptions" AS ta
    SET "tenant_org_id" = s."org_id"
    FROM "sites" AS s
    WHERE ta."site_id" = s."id"
      AND ta."tenant_org_id" IS NULL
      AND s."org_id" IS NOT NULL;

    DO $$ BEGIN
      IF EXISTS (
        SELECT 1
        FROM "template_adoptions"
        WHERE "tenant_org_id" IS NULL
      ) THEN
        RAISE EXCEPTION 'LSDATA-01 tenant backfill incomplete: template adoption has no owning tenant';
      END IF;
    END $$;

    ALTER TABLE "template_adoptions" ALTER COLUMN "tenant_org_id" SET NOT NULL;

    UPDATE "template_adoptions"
    SET "compatibility_class" = 'retained-production-pin',
        "activation_state" = 'active'
    WHERE "identities_provider" = '0178894d6ce718bb7dff3c141892f82144e2d18c'
      AND "identities_adapter" = '6cab53da19ba390d392157dbcc38979f1a6c86b5'
      AND "tenant_org_id" IS NOT NULL;

    UPDATE "template_adoptions"
    SET "compatibility_class" = 'schema-compatibility-copy',
        "activation_state" = 'inactive'
    WHERE "identities_provider" IN (
        'e389671f1dc19f6c1e17a2fd3520f4d9e3b1c139',
        '2ce580d54ffa7abbee77fe3710130b9e37c3c31f',
        '863e6b1f40def2df99aeb748dd9be570d28b1fb2'
      )
      AND "identities_adapter" = '2ce580d54ffa7abbee77fe3710130b9e37c3c31f';

    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "template_adoption_id" integer;
    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "entitlement_snapshot_id" integer;

    DO $$ BEGIN
      ALTER TABLE "template_adoptions" ADD CONSTRAINT "template_adoptions_lsdata01_activation_chk"
        CHECK (
          (
            "compatibility_class" = 'unverified'
            AND "activation_state" = 'rejected'
          )
          OR (
            "compatibility_class" = 'retained-production-pin'
            AND "identities_provider" = '0178894d6ce718bb7dff3c141892f82144e2d18c'
            AND "identities_adapter" = '6cab53da19ba390d392157dbcc38979f1a6c86b5'
            AND "tenant_org_id" IS NOT NULL
            AND "activation_state" = 'active'
          )
          OR (
            "compatibility_class" = 'schema-compatibility-copy'
            AND "identities_provider" IN (
              'e389671f1dc19f6c1e17a2fd3520f4d9e3b1c139',
              '2ce580d54ffa7abbee77fe3710130b9e37c3c31f',
              '863e6b1f40def2df99aeb748dd9be570d28b1fb2'
            )
            AND "identities_adapter" = '2ce580d54ffa7abbee77fe3710130b9e37c3c31f'
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
