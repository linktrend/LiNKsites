import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * The Pages collection persists the private-preview publication boundary.
 * A published private preview is intentionally not a public customer-site
 * activation; both the current and versioned Payload rows must retain that
 * explicit false-by-default value.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages"
      ADD COLUMN IF NOT EXISTS "public_activation" boolean DEFAULT false NOT NULL;
    ALTER TABLE "_pages_v"
      ADD COLUMN IF NOT EXISTS "version_public_activation" boolean DEFAULT false NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_public_activation";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "public_activation";
  `)
}
