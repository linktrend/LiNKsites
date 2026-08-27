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
  // OfferShowcaseBlock stores approved working-content labels rather than
  // OfferPage IDs. Payload's localized hasMany text storage is owned by the
  // parent collection, so add the forward/versions text tables alongside the
  // semantic block columns. The legacy pages_rels offer_pages_id column is
  // intentionally retained for additive compatibility with existing records.
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS "pages_texts" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "text" varchar,
      "locale" "public"."_locales"
    );
    CREATE INDEX IF NOT EXISTS "pages_texts_order_parent" ON "pages_texts" USING btree ("order", "parent_id");
    CREATE INDEX IF NOT EXISTS "pages_texts_locale_parent" ON "pages_texts" USING btree ("locale", "parent_id");
    DO $$ BEGIN
      ALTER TABLE "pages_texts" ADD CONSTRAINT "pages_texts_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "_pages_v_texts" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "text" varchar,
      "locale" "public"."_locales"
    );
    CREATE INDEX IF NOT EXISTS "_pages_v_texts_order_parent" ON "_pages_v_texts" USING btree ("order", "parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_texts_locale_parent" ON "_pages_v_texts" USING btree ("locale", "parent_id");
    DO $$ BEGIN
      ALTER TABLE "_pages_v_texts" ADD CONSTRAINT "_pages_v_texts_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `))

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

  await db.execute(sql.raw(`
    DROP TABLE IF EXISTS "_pages_v_texts" CASCADE;
    DROP TABLE IF EXISTS "pages_texts" CASCADE;
  `))
}
