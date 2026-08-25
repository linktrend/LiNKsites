import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const blockTables = [
  'pages_blocks_hero',
  'pages_blocks_cta',
  'pages_blocks_articles',
  'pages_blocks_offer_showcase',
  '_pages_v_blocks_hero',
  '_pages_v_blocks_cta',
  '_pages_v_blocks_articles',
  '_pages_v_blocks_offer_showcase',
  'offer_pages_blocks_hero',
  'offer_pages_blocks_cta',
  '_offer_pages_v_blocks_hero',
  '_offer_pages_v_blocks_cta',
  'case_study_pages_blocks_hero',
  '_case_study_pages_v_blocks_hero',
  'faq_pages_blocks_hero',
  '_faq_pages_v_blocks_hero',
] as const

/**
 * LS-04 additive migration. Payload blocks reject unknown keys at the schema
 * boundary, so these columns are required for strict promotion readback to
 * verify the semantic projection emitted by the working-content adapter.
 * Existing content remains valid because all four fields are optional.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const table of blockTables) {
    await db.execute(sql.raw(`
      ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "react_symbol" varchar;
      ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "library_component_id" varchar;
      ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "semantic_id" varchar;
      ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "working_section_id" varchar;
    `))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const table of blockTables) {
    await db.execute(sql.raw(`
      ALTER TABLE "${table}" DROP COLUMN IF EXISTS "working_section_id";
      ALTER TABLE "${table}" DROP COLUMN IF EXISTS "semantic_id";
      ALTER TABLE "${table}" DROP COLUMN IF EXISTS "library_component_id";
      ALTER TABLE "${table}" DROP COLUMN IF EXISTS "react_symbol";
    `))
  }
}
