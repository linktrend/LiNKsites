import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Minimal migration to ensure Payload lock tables exist without touching existing enums/tables.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
      "id" serial PRIMARY KEY NOT NULL,
      "global_slug" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "users_id" integer,
      "api_keys_id" integer,
      "roles_id" integer,
      "sites_id" integer,
      "site_settings_id" integer,
      "languages_id" integer,
      "media_id" integer,
      "navigation_id" integer,
      "testimonials_id" integer,
      "article_categories_id" integer,
      "case_study_categories_id" integer,
      "offer_categories_id" integer,
      "help_categories_id" integer,
      "video_categories_id" integer,
      "articles_id" integer,
      "help_articles_id" integer,
      "videos_id" integer,
      "pages_id" integer,
      "home_pages_id" integer,
      "about_pages_id" integer,
      "contact_pages_id" integer,
      "faq_pages_id" integer,
      "careers_pages_id" integer,
      "pricing_pages_id" integer,
      "terms_pages_id" integer,
      "privacy_pages_id" integer,
      "offer_pages_id" integer,
      "case_study_pages_id" integer,
      "article_pages_id" integer,
      "help_article_pages_id" integer,
      "video_pages_id" integer,
      "translation_queue_id" integer
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "payload_locked_documents_rels";
    DROP TABLE IF EXISTS "payload_locked_documents";
  `)
}

