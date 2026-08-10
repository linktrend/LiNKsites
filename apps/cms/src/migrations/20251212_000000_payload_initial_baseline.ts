import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_sites_status" AS ENUM('draft', 'active', 'published', 'archived');
  CREATE TYPE "public"."enum_sites_sync_frequency" AS ENUM('hourly', 'daily', 'weekly');
  CREATE TYPE "public"."enum_site_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_navigation_nav_key" AS ENUM('primary', 'footer', 'secondary');
  CREATE TYPE "public"."enum_navigation_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__navigation_v_version_nav_key" AS ENUM('primary', 'footer', 'secondary');
  CREATE TYPE "public"."enum__navigation_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__navigation_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_testimonials_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__testimonials_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__testimonials_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_locations_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__locations_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__locations_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_team_members_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__team_members_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__team_members_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_article_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__article_categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__article_categories_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_case_study_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__case_study_categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__case_study_categories_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_offer_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__offer_categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__offer_categories_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_help_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__help_categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__help_categories_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_video_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__video_categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__video_categories_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_articles_blocks_callout_type" AS ENUM('info', 'warning', 'success', 'error');
  CREATE TYPE "public"."enum_articles_blocks_video_embed_aspect_ratio" AS ENUM('16:9', '4:3', '1:1');
  CREATE TYPE "public"."enum_articles_blocks_related_content_display_style" AS ENUM('grid', 'list', 'carousel');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_blocks_callout_type" AS ENUM('info', 'warning', 'success', 'error');
  CREATE TYPE "public"."enum__articles_v_blocks_video_embed_aspect_ratio" AS ENUM('16:9', '4:3', '1:1');
  CREATE TYPE "public"."enum__articles_v_blocks_related_content_display_style" AS ENUM('grid', 'list', 'carousel');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_help_articles_blocks_callout_type" AS ENUM('info', 'warning', 'success', 'error');
  CREATE TYPE "public"."enum_help_articles_blocks_video_embed_aspect_ratio" AS ENUM('16:9', '4:3', '1:1');
  CREATE TYPE "public"."enum_help_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__help_articles_v_blocks_callout_type" AS ENUM('info', 'warning', 'success', 'error');
  CREATE TYPE "public"."enum__help_articles_v_blocks_video_embed_aspect_ratio" AS ENUM('16:9', '4:3', '1:1');
  CREATE TYPE "public"."enum__help_articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__help_articles_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_videos_blocks_callout_type" AS ENUM('info', 'warning', 'success', 'error');
  CREATE TYPE "public"."enum_videos_blocks_related_content_display_style" AS ENUM('grid', 'list', 'carousel');
  CREATE TYPE "public"."enum_videos_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__videos_v_blocks_callout_type" AS ENUM('info', 'warning', 'success', 'error');
  CREATE TYPE "public"."enum__videos_v_blocks_related_content_display_style" AS ENUM('grid', 'list', 'carousel');
  CREATE TYPE "public"."enum__videos_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__videos_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_pages_blocks_hero_cta_style" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_cta_button_style" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum_pages_blocks_cta_background_color" AS ENUM('default', 'primary', 'secondary', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_callout_type" AS ENUM('info', 'warning', 'success', 'error');
  CREATE TYPE "public"."enum_pages_blocks_related_content_display_style" AS ENUM('grid', 'list', 'carousel');
  CREATE TYPE "public"."enum_pages_blocks_video_embed_aspect_ratio" AS ENUM('16:9', '4:3', '1:1');
  CREATE TYPE "public"."enum_pages_page_type" AS ENUM('home', 'about', 'contact', 'pricing', 'privacy', 'terms', 'faq', 'careers', 'landing', 'generic');
  CREATE TYPE "public"."enum_pages_preview_environment" AS ENUM('private-preview');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_cta_style" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_button_style" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_background_color" AS ENUM('default', 'primary', 'secondary', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_callout_type" AS ENUM('info', 'warning', 'success', 'error');
  CREATE TYPE "public"."enum__pages_v_blocks_related_content_display_style" AS ENUM('grid', 'list', 'carousel');
  CREATE TYPE "public"."enum__pages_v_blocks_video_embed_aspect_ratio" AS ENUM('16:9', '4:3', '1:1');
  CREATE TYPE "public"."enum__pages_v_version_page_type" AS ENUM('home', 'about', 'contact', 'pricing', 'privacy', 'terms', 'faq', 'careers', 'landing', 'generic');
  CREATE TYPE "public"."enum__pages_v_version_preview_environment" AS ENUM('private-preview');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_offer_pages_blocks_hero_cta_style" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum_offer_pages_blocks_cta_button_style" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum_offer_pages_blocks_cta_background_color" AS ENUM('default', 'primary', 'secondary', 'dark');
  CREATE TYPE "public"."enum_offer_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__offer_pages_v_blocks_hero_cta_style" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum__offer_pages_v_blocks_cta_button_style" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum__offer_pages_v_blocks_cta_background_color" AS ENUM('default', 'primary', 'secondary', 'dark');
  CREATE TYPE "public"."enum__offer_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__offer_pages_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_case_study_pages_blocks_hero_cta_style" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum_case_study_pages_blocks_callout_type" AS ENUM('info', 'warning', 'success', 'error');
  CREATE TYPE "public"."enum_case_study_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__case_study_pages_v_blocks_hero_cta_style" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum__case_study_pages_v_blocks_callout_type" AS ENUM('info', 'warning', 'success', 'error');
  CREATE TYPE "public"."enum__case_study_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__case_study_pages_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_video_pages_blocks_related_content_display_style" AS ENUM('grid', 'list', 'carousel');
  CREATE TYPE "public"."enum_video_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__video_pages_v_blocks_related_content_display_style" AS ENUM('grid', 'list', 'carousel');
  CREATE TYPE "public"."enum__video_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__video_pages_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_faq_pages_blocks_hero_cta_style" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum_faq_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__faq_pages_v_blocks_hero_cta_style" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum__faq_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__faq_pages_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_terms_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__terms_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__terms_pages_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_privacy_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__privacy_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__privacy_pages_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_cookie_policy_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__cookie_policy_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__cookie_policy_pages_v_published_locale" AS ENUM('en', 'zh-TW', 'es');
  CREATE TYPE "public"."enum_translation_queue_status" AS ENUM('pending', 'in_progress', 'completed', 'skipped');
  CREATE TYPE "public"."enum_footer_social_links_platform" AS ENUM('facebook', 'twitter', 'linkedin', 'instagram', 'youtube');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar,
  	"last_name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"enable_a_p_i_key" boolean,
  	"api_key" varchar,
  	"api_key_index" varchar,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "users_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "users_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"roles_id" integer,
  	"sites_id" integer
  );
  
  CREATE TABLE "api_keys" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"key" varchar,
  	"key_prefix" varchar,
  	"last_used" timestamp(3) with time zone,
  	"site_id" integer NOT NULL,
  	"locale" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "roles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"permissions_read" boolean DEFAULT true,
  	"permissions_create" boolean DEFAULT false,
  	"permissions_update" boolean DEFAULT false,
  	"permissions_delete" boolean DEFAULT false,
  	"permissions_publish" boolean DEFAULT false,
  	"permissions_approve" boolean DEFAULT false,
  	"permissions_submit_for_review" boolean DEFAULT false,
  	"permissions_manage_users" boolean DEFAULT false,
  	"permissions_manage_roles" boolean DEFAULT false,
  	"permissions_manage_sites" boolean DEFAULT false,
  	"is_default" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sites_youtube_playlist_ids" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"playlist_id" varchar NOT NULL
  );
  
  CREATE TABLE "sites_permission_overrides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"role_id" integer NOT NULL,
  	"permissions_read" boolean,
  	"permissions_create" boolean,
  	"permissions_update" boolean,
  	"permissions_delete" boolean,
  	"permissions_publish" boolean,
  	"permissions_approve" boolean
  );
  
  CREATE TABLE "sites" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"domain" varchar NOT NULL,
  	"status" "enum_sites_status" DEFAULT 'draft' NOT NULL,
  	"template_id" varchar NOT NULL,
  	"org_id" varchar NOT NULL,
  	"program_id" varchar NOT NULL,
  	"lead_id" varchar NOT NULL,
  	"default_language_id" integer NOT NULL,
  	"youtube_api_key" varchar,
  	"youtube_channel_id" varchar,
  	"default_video_category_id" integer,
  	"auto_sync_enabled" boolean DEFAULT false,
  	"sync_frequency" "enum_sites_sync_frequency" DEFAULT 'daily',
  	"last_synced_at" timestamp(3) with time zone,
  	"rebuild_webhook_url" varchar,
  	"rebuild_webhook_secret" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sites_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"languages_id" integer
  );
  
  CREATE TABLE "site_domains" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hostname" varchar NOT NULL,
  	"site_id" integer NOT NULL,
  	"primary" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_id" integer,
  	"locale" varchar,
  	"template_id" varchar,
  	"theme_primary_color" varchar DEFAULT '#002244',
  	"theme_secondary_color" varchar DEFAULT '#00bcd4',
  	"theme_accent_color" varchar DEFAULT '#ff5722',
  	"branding_logo_id" integer,
  	"branding_favicon_id" integer,
  	"metadata_defaults_title_suffix" varchar DEFAULT '| LiNKtrend',
  	"auto_approve" boolean DEFAULT false,
  	"status" "enum_site_settings_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_site_settings_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "site_settings_locales" (
  	"metadata_defaults_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_template_id" varchar,
  	"version_theme_primary_color" varchar DEFAULT '#002244',
  	"version_theme_secondary_color" varchar DEFAULT '#00bcd4',
  	"version_theme_accent_color" varchar DEFAULT '#ff5722',
  	"version_branding_logo_id" integer,
  	"version_branding_favicon_id" integer,
  	"version_metadata_defaults_title_suffix" varchar DEFAULT '| LiNKtrend',
  	"version_auto_approve" boolean DEFAULT false,
  	"version_status" "enum__site_settings_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__site_settings_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__site_settings_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_site_settings_v_locales" (
  	"version_metadata_defaults_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "languages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"is_default" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"credit" varchar,
  	"site_id" integer NOT NULL,
  	"locale" varchar NOT NULL,
  	"uploaded_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_tablet_url" varchar,
  	"sizes_tablet_width" numeric,
  	"sizes_tablet_height" numeric,
  	"sizes_tablet_mime_type" varchar,
  	"sizes_tablet_filesize" numeric,
  	"sizes_tablet_filename" varchar
  );
  
  CREATE TABLE "media_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nav_key" "enum_navigation_nav_key" DEFAULT 'primary',
  	"url" varchar,
  	"external" boolean DEFAULT false,
  	"order" numeric DEFAULT 0,
  	"parent_id" integer,
  	"site_id" integer,
  	"locale" varchar,
  	"status" "enum_navigation_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_navigation_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "navigation_locales" (
  	"label" varchar,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_navigation_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nav_key" "enum__navigation_v_version_nav_key" DEFAULT 'primary',
  	"version_url" varchar,
  	"version_external" boolean DEFAULT false,
  	"version_order" numeric DEFAULT 0,
  	"version_parent_id" integer,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_status" "enum__navigation_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__navigation_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__navigation_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_navigation_v_locales" (
  	"version_label" varchar,
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"avatar_id" integer,
  	"featured" boolean DEFAULT false,
  	"site_id" integer,
  	"locale" varchar,
  	"status" "enum_testimonials_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_testimonials_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "testimonials_locales" (
  	"author" varchar,
  	"role" varchar,
  	"slug" varchar,
  	"quote" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_testimonials_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_avatar_id" integer,
  	"version_featured" boolean DEFAULT false,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_status" "enum__testimonials_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__testimonials_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__testimonials_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_testimonials_v_locales" (
  	"version_author" varchar,
  	"version_role" varchar,
  	"version_slug" varchar,
  	"version_quote" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "locations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phone" varchar,
  	"email" varchar,
  	"zip" varchar,
  	"map_url" varchar,
  	"featured" boolean DEFAULT false,
  	"site_id" integer,
  	"locale" varchar,
  	"status" "enum_locations_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_locations_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "locations_locales" (
  	"name" varchar,
  	"slug" varchar,
  	"street" varchar,
  	"city" varchar,
  	"state" varchar,
  	"country" varchar,
  	"business_hours" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_locations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_phone" varchar,
  	"version_email" varchar,
  	"version_zip" varchar,
  	"version_map_url" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_status" "enum__locations_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__locations_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__locations_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_locations_v_locales" (
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_street" varchar,
  	"version_city" varchar,
  	"version_state" varchar,
  	"version_country" varchar,
  	"version_business_hours" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "team_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"photo_id" integer,
  	"email" varchar,
  	"phone" varchar,
  	"social_linkedin" varchar,
  	"social_twitter" varchar,
  	"social_website" varchar,
  	"featured" boolean DEFAULT false,
  	"site_id" integer,
  	"locale" varchar,
  	"status" "enum_team_members_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_team_members_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "team_members_locales" (
  	"name" varchar,
  	"slug" varchar,
  	"role" varchar,
  	"bio" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_team_members_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_photo_id" integer,
  	"version_email" varchar,
  	"version_phone" varchar,
  	"version_social_linkedin" varchar,
  	"version_social_twitter" varchar,
  	"version_social_website" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_status" "enum__team_members_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__team_members_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__team_members_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_team_members_v_locales" (
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_role" varchar,
  	"version_bio" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "article_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"site_id" integer,
  	"locale" varchar,
  	"status" "enum_article_categories_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_article_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "article_categories_locales" (
  	"name" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_article_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_parent_id" integer,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_status" "enum__article_categories_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__article_categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__article_categories_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_article_categories_v_locales" (
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "case_study_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"site_id" integer,
  	"locale" varchar,
  	"status" "enum_case_study_categories_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_case_study_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "case_study_categories_locales" (
  	"name" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_case_study_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_parent_id" integer,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_status" "enum__case_study_categories_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__case_study_categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__case_study_categories_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_case_study_categories_v_locales" (
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "offer_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"site_id" integer,
  	"locale" varchar,
  	"status" "enum_offer_categories_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_offer_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "offer_categories_locales" (
  	"name" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_offer_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_parent_id" integer,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_status" "enum__offer_categories_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__offer_categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__offer_categories_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_offer_categories_v_locales" (
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "help_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"site_id" integer,
  	"locale" varchar,
  	"status" "enum_help_categories_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_help_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "help_categories_locales" (
  	"name" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_help_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_parent_id" integer,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_status" "enum__help_categories_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__help_categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__help_categories_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_help_categories_v_locales" (
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "video_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"site_id" integer,
  	"locale" varchar,
  	"status" "enum_video_categories_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_video_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "video_categories_locales" (
  	"name" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_video_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_parent_id" integer,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_status" "enum__video_categories_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__video_categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__video_categories_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_video_categories_v_locales" (
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "articles_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt_text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_articles_blocks_callout_type" DEFAULT 'info',
  	"message" jsonb,
  	"icon" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_video_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"youtube_id" varchar,
  	"caption" varchar,
  	"autoplay" boolean DEFAULT false,
  	"controls" boolean DEFAULT true,
  	"aspect_ratio" "enum_articles_blocks_video_embed_aspect_ratio" DEFAULT '16:9',
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_related_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Related Content',
  	"display_style" "enum_articles_blocks_related_content_display_style" DEFAULT 'grid',
  	"block_name" varchar
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category_id" integer,
  	"author_id" integer,
  	"featured_image_id" integer,
  	"read_time" numeric,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"site_id" integer,
  	"locale" varchar,
  	"status" "enum_articles_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "articles_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "articles_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "articles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"articles_id" integer,
  	"case_study_pages_id" integer,
  	"videos_id" integer,
  	"video_pages_id" integer
  );
  
  CREATE TABLE "_articles_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt_text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__articles_v_blocks_callout_type" DEFAULT 'info',
  	"message" jsonb,
  	"icon" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_video_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"youtube_id" varchar,
  	"caption" varchar,
  	"autoplay" boolean DEFAULT false,
  	"controls" boolean DEFAULT true,
  	"aspect_ratio" "enum__articles_v_blocks_video_embed_aspect_ratio" DEFAULT '16:9',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v_blocks_related_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Related Content',
  	"display_style" "enum__articles_v_blocks_related_content_display_style" DEFAULT 'grid',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_category_id" integer,
  	"version_author_id" integer,
  	"version_featured_image_id" integer,
  	"version_read_time" numeric,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__articles_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_articles_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_articles_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "_articles_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"articles_id" integer,
  	"case_study_pages_id" integer,
  	"videos_id" integer,
  	"video_pages_id" integer
  );
  
  CREATE TABLE "help_articles_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "help_articles_blocks_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt_text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "help_articles_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_help_articles_blocks_callout_type" DEFAULT 'info',
  	"message" jsonb,
  	"icon" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "help_articles_blocks_faq_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "help_articles_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Frequently Asked Questions',
  	"block_name" varchar
  );
  
  CREATE TABLE "help_articles_blocks_video_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"youtube_id" varchar,
  	"caption" varchar,
  	"autoplay" boolean DEFAULT false,
  	"controls" boolean DEFAULT true,
  	"aspect_ratio" "enum_help_articles_blocks_video_embed_aspect_ratio" DEFAULT '16:9',
  	"block_name" varchar
  );
  
  CREATE TABLE "help_articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category_id" integer,
  	"popularity" numeric DEFAULT 0,
  	"last_viewed_at" timestamp(3) with time zone,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"site_id" integer,
  	"locale" varchar,
  	"status" "enum_help_articles_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_help_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "help_articles_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "help_articles_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "help_articles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"help_articles_id" integer
  );
  
  CREATE TABLE "_help_articles_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_help_articles_v_blocks_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt_text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_help_articles_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__help_articles_v_blocks_callout_type" DEFAULT 'info',
  	"message" jsonb,
  	"icon" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_help_articles_v_blocks_faq_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_help_articles_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Frequently Asked Questions',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_help_articles_v_blocks_video_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"youtube_id" varchar,
  	"caption" varchar,
  	"autoplay" boolean DEFAULT false,
  	"controls" boolean DEFAULT true,
  	"aspect_ratio" "enum__help_articles_v_blocks_video_embed_aspect_ratio" DEFAULT '16:9',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_help_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_category_id" integer,
  	"version_popularity" numeric DEFAULT 0,
  	"version_last_viewed_at" timestamp(3) with time zone,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_status" "enum__help_articles_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__help_articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__help_articles_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_help_articles_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_help_articles_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "_help_articles_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"help_articles_id" integer
  );
  
  CREATE TABLE "videos_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "videos_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_videos_blocks_callout_type" DEFAULT 'info',
  	"message" jsonb,
  	"icon" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "videos_blocks_related_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Related Content',
  	"display_style" "enum_videos_blocks_related_content_display_style" DEFAULT 'grid',
  	"block_name" varchar
  );
  
  CREATE TABLE "videos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category_id" integer,
  	"youtube_id" varchar,
  	"duration" numeric,
  	"thumbnail_id" integer,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"site_id" integer,
  	"locale" varchar,
  	"status" "enum_videos_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_videos_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "videos_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"transcript" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "videos_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "videos_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"articles_id" integer,
  	"case_study_pages_id" integer,
  	"videos_id" integer,
  	"video_pages_id" integer
  );
  
  CREATE TABLE "_videos_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_videos_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__videos_v_blocks_callout_type" DEFAULT 'info',
  	"message" jsonb,
  	"icon" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_videos_v_blocks_related_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Related Content',
  	"display_style" "enum__videos_v_blocks_related_content_display_style" DEFAULT 'grid',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_videos_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_category_id" integer,
  	"version_youtube_id" varchar,
  	"version_duration" numeric,
  	"version_thumbnail_id" integer,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_status" "enum__videos_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__videos_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__videos_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_videos_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_transcript" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_videos_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "_videos_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"articles_id" integer,
  	"case_study_pages_id" integer,
  	"videos_id" integer,
  	"video_pages_id" integer
  );
  
  CREATE TABLE "pages_blocks_hero_social_proof" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"publication" varchar,
  	"quote" varchar,
  	"author" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"body" varchar,
  	"background_image_id" integer,
  	"cta_text" varchar,
  	"cta_url" varchar,
  	"cta_style" "enum_pages_blocks_hero_cta_style" DEFAULT 'primary',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" varchar,
  	"description" varchar,
  	"link_text" varchar,
  	"link_url" varchar
  );
  
  CREATE TABLE "pages_blocks_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_plans_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar,
  	"included" boolean DEFAULT true
  );
  
  CREATE TABLE "pages_blocks_pricing_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" varchar,
  	"period" varchar,
  	"description" varchar,
  	"cta_text" varchar,
  	"cta_url" varchar,
  	"highlighted" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"monthly_label" varchar,
  	"yearly_label" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"company" varchar,
  	"role" varchar,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"button_text" varchar,
  	"button_url" varchar,
  	"button_style" "enum_pages_blocks_cta_button_style" DEFAULT 'primary',
  	"background_color" "enum_pages_blocks_cta_background_color" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Frequently Asked Questions',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt_text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_articles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_case_studies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_offer_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"placeholder" varchar,
  	"button_label" varchar DEFAULT 'Subscribe',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_pages_blocks_callout_type" DEFAULT 'info',
  	"message" jsonb,
  	"icon" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_related_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Related Content',
  	"display_style" "enum_pages_blocks_related_content_display_style" DEFAULT 'grid',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_video_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"youtube_id" varchar,
  	"caption" varchar,
  	"autoplay" boolean DEFAULT false,
  	"controls" boolean DEFAULT true,
  	"aspect_ratio" "enum_pages_blocks_video_embed_aspect_ratio" DEFAULT '16:9',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_locations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Locations',
  	"subtitle" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Team',
  	"subtitle" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_trust_feed_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" varchar,
  	"rating" numeric,
  	"quote" varchar,
  	"author" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "pages_blocks_trust_feed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"min_rating" numeric DEFAULT 4,
  	"allow_positive_only" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"page_type" "enum_pages_page_type",
  	"site_id" integer,
  	"locale" varchar,
  	"seo_image_id" integer,
  	"preview_environment" "enum_pages_preview_environment",
  	"promotion_run_marker" varchar,
  	"status" "enum_pages_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"testimonials_id" integer,
  	"articles_id" integer,
  	"case_study_pages_id" integer,
  	"offer_pages_id" integer,
  	"videos_id" integer,
  	"video_pages_id" integer,
  	"locations_id" integer,
  	"team_members_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_hero_social_proof" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"publication" varchar,
  	"quote" varchar,
  	"author" varchar,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"body" varchar,
  	"background_image_id" integer,
  	"cta_text" varchar,
  	"cta_url" varchar,
  	"cta_style" "enum__pages_v_blocks_hero_cta_style" DEFAULT 'primary',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" varchar,
  	"description" varchar,
  	"link_text" varchar,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_plans_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"feature" varchar,
  	"included" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" varchar,
  	"period" varchar,
  	"description" varchar,
  	"cta_text" varchar,
  	"cta_url" varchar,
  	"highlighted" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"monthly_label" varchar,
  	"yearly_label" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"company" varchar,
  	"role" varchar,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"button_text" varchar,
  	"button_url" varchar,
  	"button_style" "enum__pages_v_blocks_cta_button_style" DEFAULT 'primary',
  	"background_color" "enum__pages_v_blocks_cta_background_color" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Frequently Asked Questions',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt_text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_articles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_case_studies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_offer_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"placeholder" varchar,
  	"button_label" varchar DEFAULT 'Subscribe',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__pages_v_blocks_callout_type" DEFAULT 'info',
  	"message" jsonb,
  	"icon" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_related_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Related Content',
  	"display_style" "enum__pages_v_blocks_related_content_display_style" DEFAULT 'grid',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_video_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"youtube_id" varchar,
  	"caption" varchar,
  	"autoplay" boolean DEFAULT false,
  	"controls" boolean DEFAULT true,
  	"aspect_ratio" "enum__pages_v_blocks_video_embed_aspect_ratio" DEFAULT '16:9',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_locations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Locations',
  	"subtitle" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Team',
  	"subtitle" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_trust_feed_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" varchar,
  	"rating" numeric,
  	"quote" varchar,
  	"author" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_trust_feed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"min_rating" numeric DEFAULT 4,
  	"allow_positive_only" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_page_type" "enum__pages_v_version_page_type",
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_seo_image_id" integer,
  	"version_preview_environment" "enum__pages_v_version_preview_environment",
  	"version_promotion_run_marker" varchar,
  	"version_status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"testimonials_id" integer,
  	"articles_id" integer,
  	"case_study_pages_id" integer,
  	"offer_pages_id" integer,
  	"videos_id" integer,
  	"video_pages_id" integer,
  	"locations_id" integer,
  	"team_members_id" integer
  );
  
  CREATE TABLE "offer_pages_blocks_hero_social_proof" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"publication" varchar,
  	"quote" varchar,
  	"author" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "offer_pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"body" varchar,
  	"background_image_id" integer,
  	"cta_text" varchar,
  	"cta_url" varchar,
  	"cta_style" "enum_offer_pages_blocks_hero_cta_style" DEFAULT 'primary',
  	"block_name" varchar
  );
  
  CREATE TABLE "offer_pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "offer_pages_blocks_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt_text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "offer_pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"button_text" varchar,
  	"button_url" varchar,
  	"button_style" "enum_offer_pages_blocks_cta_button_style" DEFAULT 'primary',
  	"background_color" "enum_offer_pages_blocks_cta_background_color" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "offer_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category_id" integer,
  	"featured_image_id" integer,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"site_id" integer,
  	"locale" varchar,
  	"status" "enum_offer_pages_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_offer_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "offer_pages_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"excerpt" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_offer_pages_v_blocks_hero_social_proof" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"publication" varchar,
  	"quote" varchar,
  	"author" varchar,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_offer_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"body" varchar,
  	"background_image_id" integer,
  	"cta_text" varchar,
  	"cta_url" varchar,
  	"cta_style" "enum__offer_pages_v_blocks_hero_cta_style" DEFAULT 'primary',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_offer_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_offer_pages_v_blocks_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt_text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_offer_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"button_text" varchar,
  	"button_url" varchar,
  	"button_style" "enum__offer_pages_v_blocks_cta_button_style" DEFAULT 'primary',
  	"background_color" "enum__offer_pages_v_blocks_cta_background_color" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_offer_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_category_id" integer,
  	"version_featured_image_id" integer,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_status" "enum__offer_pages_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__offer_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__offer_pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_offer_pages_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_excerpt" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "case_study_pages_results" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "case_study_pages_results_locales" (
  	"metric" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "case_study_pages_blocks_hero_social_proof" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"publication" varchar,
  	"quote" varchar,
  	"author" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "case_study_pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"body" varchar,
  	"background_image_id" integer,
  	"cta_text" varchar,
  	"cta_url" varchar,
  	"cta_style" "enum_case_study_pages_blocks_hero_cta_style" DEFAULT 'primary',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_study_pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "case_study_pages_blocks_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt_text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "case_study_pages_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_case_study_pages_blocks_callout_type" DEFAULT 'info',
  	"message" jsonb,
  	"icon" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "case_study_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category_id" integer,
  	"client" varchar,
  	"featured_image_id" integer,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"site_id" integer,
  	"locale" varchar,
  	"status" "enum_case_study_pages_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_case_study_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "case_study_pages_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"industry" varchar,
  	"excerpt" varchar,
  	"challenge" jsonb,
  	"solution" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_case_study_pages_v_version_results" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_case_study_pages_v_version_results_locales" (
  	"metric" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_case_study_pages_v_blocks_hero_social_proof" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"publication" varchar,
  	"quote" varchar,
  	"author" varchar,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_case_study_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"body" varchar,
  	"background_image_id" integer,
  	"cta_text" varchar,
  	"cta_url" varchar,
  	"cta_style" "enum__case_study_pages_v_blocks_hero_cta_style" DEFAULT 'primary',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_case_study_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_case_study_pages_v_blocks_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"alt_text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_case_study_pages_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__case_study_pages_v_blocks_callout_type" DEFAULT 'info',
  	"message" jsonb,
  	"icon" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_case_study_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_category_id" integer,
  	"version_client" varchar,
  	"version_featured_image_id" integer,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_status" "enum__case_study_pages_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__case_study_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__case_study_pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_case_study_pages_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_industry" varchar,
  	"version_excerpt" varchar,
  	"version_challenge" jsonb,
  	"version_solution" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "video_pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "video_pages_blocks_related_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Related Content',
  	"display_style" "enum_video_pages_blocks_related_content_display_style" DEFAULT 'grid',
  	"block_name" varchar
  );
  
  CREATE TABLE "video_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"youtube_id" varchar,
  	"auto_ingest" boolean DEFAULT true,
  	"category_id" integer,
  	"thumbnail" varchar,
  	"duration" numeric,
  	"view_count" numeric,
  	"auto_ingested" boolean DEFAULT false,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"site_id" integer,
  	"locale" varchar,
  	"status" "enum_video_pages_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_video_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "video_pages_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"transcript" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "video_pages_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "video_pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"articles_id" integer,
  	"case_study_pages_id" integer,
  	"videos_id" integer,
  	"video_pages_id" integer
  );
  
  CREATE TABLE "_video_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_video_pages_v_blocks_related_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Related Content',
  	"display_style" "enum__video_pages_v_blocks_related_content_display_style" DEFAULT 'grid',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_video_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_youtube_id" varchar,
  	"version_auto_ingest" boolean DEFAULT true,
  	"version_category_id" integer,
  	"version_thumbnail" varchar,
  	"version_duration" numeric,
  	"version_view_count" numeric,
  	"version_auto_ingested" boolean DEFAULT false,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_status" "enum__video_pages_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__video_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__video_pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_video_pages_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_transcript" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_video_pages_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "_video_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"articles_id" integer,
  	"case_study_pages_id" integer,
  	"videos_id" integer,
  	"video_pages_id" integer
  );
  
  CREATE TABLE "faq_pages_blocks_hero_social_proof" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"publication" varchar,
  	"quote" varchar,
  	"author" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "faq_pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"body" varchar,
  	"background_image_id" integer,
  	"cta_text" varchar,
  	"cta_url" varchar,
  	"cta_style" "enum_faq_pages_blocks_hero_cta_style" DEFAULT 'primary',
  	"block_name" varchar
  );
  
  CREATE TABLE "faq_pages_blocks_faq_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "faq_pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Frequently Asked Questions',
  	"block_name" varchar
  );
  
  CREATE TABLE "faq_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"site_id" integer,
  	"locale" varchar,
  	"status" "enum_faq_pages_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_faq_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "faq_pages_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_faq_pages_v_blocks_hero_social_proof" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"publication" varchar,
  	"quote" varchar,
  	"author" varchar,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_faq_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"body" varchar,
  	"background_image_id" integer,
  	"cta_text" varchar,
  	"cta_url" varchar,
  	"cta_style" "enum__faq_pages_v_blocks_hero_cta_style" DEFAULT 'primary',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_faq_pages_v_blocks_faq_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_faq_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Frequently Asked Questions',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_faq_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_status" "enum__faq_pages_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__faq_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__faq_pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_faq_pages_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "terms_pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "terms_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"last_updated" timestamp(3) with time zone,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"site_id" integer,
  	"locale" varchar,
  	"status" "enum_terms_pages_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_terms_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "terms_pages_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_terms_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_terms_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_last_updated" timestamp(3) with time zone,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_status" "enum__terms_pages_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__terms_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__terms_pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_terms_pages_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "privacy_pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "privacy_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"last_updated" timestamp(3) with time zone,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"site_id" integer,
  	"locale" varchar,
  	"status" "enum_privacy_pages_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_privacy_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "privacy_pages_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_privacy_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_privacy_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_last_updated" timestamp(3) with time zone,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_status" "enum__privacy_pages_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__privacy_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__privacy_pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_privacy_pages_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "cookie_policy_pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "cookie_policy_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"last_updated" timestamp(3) with time zone,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"site_id" integer,
  	"locale" varchar,
  	"status" "enum_cookie_policy_pages_status" DEFAULT 'draft',
  	"submitted_by_id" integer,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"auto_approved" boolean,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_cookie_policy_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cookie_policy_pages_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_cookie_policy_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cookie_policy_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_last_updated" timestamp(3) with time zone,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_site_id" integer,
  	"version_locale" varchar,
  	"version_status" "enum__cookie_policy_pages_v_version_status" DEFAULT 'draft',
  	"version_submitted_by_id" integer,
  	"version_reviewed_by_id" integer,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_auto_approved" boolean,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__cookie_policy_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__cookie_policy_pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_cookie_policy_pages_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "translation_queue" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"document_id" varchar NOT NULL,
  	"collection_slug" varchar NOT NULL,
  	"site_id" integer NOT NULL,
  	"locale" varchar NOT NULL,
  	"source_locale" varchar NOT NULL,
  	"target_locale" varchar NOT NULL,
  	"status" "enum_translation_queue_status" DEFAULT 'pending',
  	"auto_generated" boolean DEFAULT true,
  	"assigned_to_id" integer,
  	"notes" varchar,
  	"completed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"api_keys_id" integer,
  	"roles_id" integer,
  	"sites_id" integer,
  	"site_domains_id" integer,
  	"site_settings_id" integer,
  	"languages_id" integer,
  	"media_id" integer,
  	"navigation_id" integer,
  	"testimonials_id" integer,
  	"locations_id" integer,
  	"team_members_id" integer,
  	"article_categories_id" integer,
  	"case_study_categories_id" integer,
  	"offer_categories_id" integer,
  	"help_categories_id" integer,
  	"video_categories_id" integer,
  	"articles_id" integer,
  	"help_articles_id" integer,
  	"videos_id" integer,
  	"pages_id" integer,
  	"offer_pages_id" integer,
  	"case_study_pages_id" integer,
  	"video_pages_id" integer,
  	"faq_pages_id" integer,
  	"terms_pages_id" integer,
  	"privacy_pages_id" integer,
  	"cookie_policy_pages_id" integer,
  	"translation_queue_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "header_navigation_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "header_navigation_children_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "header_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "header_navigation_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer NOT NULL,
  	"cta_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_locales" (
  	"cta_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "footer_columns_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "footer_columns_locales" (
  	"heading" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_footer_social_links_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_locales" (
  	"copyright" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "seo" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title_template" varchar DEFAULT '%s | LiNKtrend',
  	"default_og_image_id" integer,
  	"favicon_id" integer,
  	"google_analytics_id" varchar,
  	"google_tag_manager_id" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "seo_locales" (
  	"default_title" varchar,
  	"default_description" varchar,
  	"default_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "legal" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"terms_url" varchar,
  	"privacy_url" varchar,
  	"cookie_policy_url" varchar,
  	"cookie_consent_enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "legal_locales" (
  	"cookie_consent_message" varchar,
  	"cookie_consent_accept_button_text" varchar DEFAULT 'Accept',
  	"cookie_consent_decline_button_text" varchar DEFAULT 'Decline',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact_info" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"address_zip" varchar,
  	"social_media_facebook" varchar,
  	"social_media_twitter" varchar,
  	"social_media_linkedin" varchar,
  	"social_media_instagram" varchar,
  	"social_media_youtube" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "contact_info_locales" (
  	"address_street" varchar,
  	"address_city" varchar,
  	"address_state" varchar,
  	"address_country" varchar,
  	"business_hours" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_texts" ADD CONSTRAINT "users_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_sites_fk" FOREIGN KEY ("sites_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sites_youtube_playlist_ids" ADD CONSTRAINT "sites_youtube_playlist_ids_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites_permission_overrides" ADD CONSTRAINT "sites_permission_overrides_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sites_permission_overrides" ADD CONSTRAINT "sites_permission_overrides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites" ADD CONSTRAINT "sites_default_language_id_languages_id_fk" FOREIGN KEY ("default_language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sites" ADD CONSTRAINT "sites_default_video_category_id_video_categories_id_fk" FOREIGN KEY ("default_video_category_id") REFERENCES "public"."video_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sites_rels" ADD CONSTRAINT "sites_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites_rels" ADD CONSTRAINT "sites_rels_languages_fk" FOREIGN KEY ("languages_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_domains" ADD CONSTRAINT "site_domains_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_branding_logo_id_media_id_fk" FOREIGN KEY ("branding_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_branding_favicon_id_media_id_fk" FOREIGN KEY ("branding_favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_parent_id_site_settings_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_branding_logo_id_media_id_fk" FOREIGN KEY ("version_branding_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_branding_favicon_id_media_id_fk" FOREIGN KEY ("version_branding_favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v_locales" ADD CONSTRAINT "_site_settings_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_texts" ADD CONSTRAINT "media_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation" ADD CONSTRAINT "navigation_parent_id_navigation_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation" ADD CONSTRAINT "navigation_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation" ADD CONSTRAINT "navigation_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation" ADD CONSTRAINT "navigation_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_locales" ADD CONSTRAINT "navigation_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v" ADD CONSTRAINT "_navigation_v_parent_id_navigation_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navigation_v" ADD CONSTRAINT "_navigation_v_version_parent_id_navigation_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."navigation"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navigation_v" ADD CONSTRAINT "_navigation_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navigation_v" ADD CONSTRAINT "_navigation_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navigation_v" ADD CONSTRAINT "_navigation_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navigation_v_locales" ADD CONSTRAINT "_navigation_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials_locales" ADD CONSTRAINT "testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_parent_id_testimonials_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_avatar_id_media_id_fk" FOREIGN KEY ("version_avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v_locales" ADD CONSTRAINT "_testimonials_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_testimonials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "locations" ADD CONSTRAINT "locations_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "locations" ADD CONSTRAINT "locations_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "locations" ADD CONSTRAINT "locations_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "locations_locales" ADD CONSTRAINT "locations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_locations_v" ADD CONSTRAINT "_locations_v_parent_id_locations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_locations_v" ADD CONSTRAINT "_locations_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_locations_v" ADD CONSTRAINT "_locations_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_locations_v" ADD CONSTRAINT "_locations_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_locations_v_locales" ADD CONSTRAINT "_locations_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_locations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members_locales" ADD CONSTRAINT "team_members_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_parent_id_team_members_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v_locales" ADD CONSTRAINT "_team_members_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_team_members_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "article_categories" ADD CONSTRAINT "article_categories_parent_id_article_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."article_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "article_categories" ADD CONSTRAINT "article_categories_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "article_categories" ADD CONSTRAINT "article_categories_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "article_categories" ADD CONSTRAINT "article_categories_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "article_categories_locales" ADD CONSTRAINT "article_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."article_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_article_categories_v" ADD CONSTRAINT "_article_categories_v_parent_id_article_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."article_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_article_categories_v" ADD CONSTRAINT "_article_categories_v_version_parent_id_article_categories_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."article_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_article_categories_v" ADD CONSTRAINT "_article_categories_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_article_categories_v" ADD CONSTRAINT "_article_categories_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_article_categories_v" ADD CONSTRAINT "_article_categories_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_article_categories_v_locales" ADD CONSTRAINT "_article_categories_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_article_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_study_categories" ADD CONSTRAINT "case_study_categories_parent_id_case_study_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."case_study_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_study_categories" ADD CONSTRAINT "case_study_categories_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_study_categories" ADD CONSTRAINT "case_study_categories_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_study_categories" ADD CONSTRAINT "case_study_categories_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_study_categories_locales" ADD CONSTRAINT "case_study_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_study_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_study_categories_v" ADD CONSTRAINT "_case_study_categories_v_parent_id_case_study_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."case_study_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_study_categories_v" ADD CONSTRAINT "_case_study_categories_v_version_parent_id_case_study_categories_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."case_study_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_study_categories_v" ADD CONSTRAINT "_case_study_categories_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_study_categories_v" ADD CONSTRAINT "_case_study_categories_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_study_categories_v" ADD CONSTRAINT "_case_study_categories_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_study_categories_v_locales" ADD CONSTRAINT "_case_study_categories_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_study_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offer_categories" ADD CONSTRAINT "offer_categories_parent_id_offer_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."offer_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offer_categories" ADD CONSTRAINT "offer_categories_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offer_categories" ADD CONSTRAINT "offer_categories_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offer_categories" ADD CONSTRAINT "offer_categories_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offer_categories_locales" ADD CONSTRAINT "offer_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offer_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offer_categories_v" ADD CONSTRAINT "_offer_categories_v_parent_id_offer_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."offer_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offer_categories_v" ADD CONSTRAINT "_offer_categories_v_version_parent_id_offer_categories_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."offer_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offer_categories_v" ADD CONSTRAINT "_offer_categories_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offer_categories_v" ADD CONSTRAINT "_offer_categories_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offer_categories_v" ADD CONSTRAINT "_offer_categories_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offer_categories_v_locales" ADD CONSTRAINT "_offer_categories_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offer_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "help_categories" ADD CONSTRAINT "help_categories_parent_id_help_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."help_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "help_categories" ADD CONSTRAINT "help_categories_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "help_categories" ADD CONSTRAINT "help_categories_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "help_categories" ADD CONSTRAINT "help_categories_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "help_categories_locales" ADD CONSTRAINT "help_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."help_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_help_categories_v" ADD CONSTRAINT "_help_categories_v_parent_id_help_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."help_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_help_categories_v" ADD CONSTRAINT "_help_categories_v_version_parent_id_help_categories_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."help_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_help_categories_v" ADD CONSTRAINT "_help_categories_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_help_categories_v" ADD CONSTRAINT "_help_categories_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_help_categories_v" ADD CONSTRAINT "_help_categories_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_help_categories_v_locales" ADD CONSTRAINT "_help_categories_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_help_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "video_categories" ADD CONSTRAINT "video_categories_parent_id_video_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."video_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "video_categories" ADD CONSTRAINT "video_categories_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "video_categories" ADD CONSTRAINT "video_categories_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "video_categories" ADD CONSTRAINT "video_categories_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "video_categories_locales" ADD CONSTRAINT "video_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."video_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_video_categories_v" ADD CONSTRAINT "_video_categories_v_parent_id_video_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."video_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_video_categories_v" ADD CONSTRAINT "_video_categories_v_version_parent_id_video_categories_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."video_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_video_categories_v" ADD CONSTRAINT "_video_categories_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_video_categories_v" ADD CONSTRAINT "_video_categories_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_video_categories_v" ADD CONSTRAINT "_video_categories_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_video_categories_v_locales" ADD CONSTRAINT "_video_categories_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_video_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_rich_text" ADD CONSTRAINT "articles_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_media" ADD CONSTRAINT "articles_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_media" ADD CONSTRAINT "articles_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_callout" ADD CONSTRAINT "articles_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_video_embed" ADD CONSTRAINT "articles_blocks_video_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_related_content" ADD CONSTRAINT "articles_blocks_related_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_article_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."article_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_locales" ADD CONSTRAINT "articles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_texts" ADD CONSTRAINT "articles_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_case_study_pages_fk" FOREIGN KEY ("case_study_pages_id") REFERENCES "public"."case_study_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_video_pages_fk" FOREIGN KEY ("video_pages_id") REFERENCES "public"."video_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_rich_text" ADD CONSTRAINT "_articles_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_media" ADD CONSTRAINT "_articles_v_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_media" ADD CONSTRAINT "_articles_v_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_callout" ADD CONSTRAINT "_articles_v_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_video_embed" ADD CONSTRAINT "_articles_v_blocks_video_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_related_content" ADD CONSTRAINT "_articles_v_blocks_related_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_category_id_article_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."article_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_locales" ADD CONSTRAINT "_articles_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_texts" ADD CONSTRAINT "_articles_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_case_study_pages_fk" FOREIGN KEY ("case_study_pages_id") REFERENCES "public"."case_study_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_video_pages_fk" FOREIGN KEY ("video_pages_id") REFERENCES "public"."video_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "help_articles_blocks_rich_text" ADD CONSTRAINT "help_articles_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."help_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "help_articles_blocks_media" ADD CONSTRAINT "help_articles_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "help_articles_blocks_media" ADD CONSTRAINT "help_articles_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."help_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "help_articles_blocks_callout" ADD CONSTRAINT "help_articles_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."help_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "help_articles_blocks_faq_questions" ADD CONSTRAINT "help_articles_blocks_faq_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."help_articles_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "help_articles_blocks_faq" ADD CONSTRAINT "help_articles_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."help_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "help_articles_blocks_video_embed" ADD CONSTRAINT "help_articles_blocks_video_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."help_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_category_id_help_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."help_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "help_articles_locales" ADD CONSTRAINT "help_articles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."help_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "help_articles_texts" ADD CONSTRAINT "help_articles_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."help_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "help_articles_rels" ADD CONSTRAINT "help_articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."help_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "help_articles_rels" ADD CONSTRAINT "help_articles_rels_help_articles_fk" FOREIGN KEY ("help_articles_id") REFERENCES "public"."help_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_help_articles_v_blocks_rich_text" ADD CONSTRAINT "_help_articles_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_help_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_help_articles_v_blocks_media" ADD CONSTRAINT "_help_articles_v_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_help_articles_v_blocks_media" ADD CONSTRAINT "_help_articles_v_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_help_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_help_articles_v_blocks_callout" ADD CONSTRAINT "_help_articles_v_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_help_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_help_articles_v_blocks_faq_questions" ADD CONSTRAINT "_help_articles_v_blocks_faq_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_help_articles_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_help_articles_v_blocks_faq" ADD CONSTRAINT "_help_articles_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_help_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_help_articles_v_blocks_video_embed" ADD CONSTRAINT "_help_articles_v_blocks_video_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_help_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_help_articles_v" ADD CONSTRAINT "_help_articles_v_parent_id_help_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."help_articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_help_articles_v" ADD CONSTRAINT "_help_articles_v_version_category_id_help_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."help_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_help_articles_v" ADD CONSTRAINT "_help_articles_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_help_articles_v" ADD CONSTRAINT "_help_articles_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_help_articles_v" ADD CONSTRAINT "_help_articles_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_help_articles_v" ADD CONSTRAINT "_help_articles_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_help_articles_v_locales" ADD CONSTRAINT "_help_articles_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_help_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_help_articles_v_texts" ADD CONSTRAINT "_help_articles_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_help_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_help_articles_v_rels" ADD CONSTRAINT "_help_articles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_help_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_help_articles_v_rels" ADD CONSTRAINT "_help_articles_v_rels_help_articles_fk" FOREIGN KEY ("help_articles_id") REFERENCES "public"."help_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "videos_blocks_rich_text" ADD CONSTRAINT "videos_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "videos_blocks_callout" ADD CONSTRAINT "videos_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "videos_blocks_related_content" ADD CONSTRAINT "videos_blocks_related_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "videos" ADD CONSTRAINT "videos_category_id_video_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."video_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "videos" ADD CONSTRAINT "videos_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "videos" ADD CONSTRAINT "videos_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "videos" ADD CONSTRAINT "videos_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "videos" ADD CONSTRAINT "videos_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "videos" ADD CONSTRAINT "videos_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "videos_locales" ADD CONSTRAINT "videos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "videos_texts" ADD CONSTRAINT "videos_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "videos_rels" ADD CONSTRAINT "videos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "videos_rels" ADD CONSTRAINT "videos_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "videos_rels" ADD CONSTRAINT "videos_rels_case_study_pages_fk" FOREIGN KEY ("case_study_pages_id") REFERENCES "public"."case_study_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "videos_rels" ADD CONSTRAINT "videos_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "videos_rels" ADD CONSTRAINT "videos_rels_video_pages_fk" FOREIGN KEY ("video_pages_id") REFERENCES "public"."video_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_videos_v_blocks_rich_text" ADD CONSTRAINT "_videos_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_videos_v_blocks_callout" ADD CONSTRAINT "_videos_v_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_videos_v_blocks_related_content" ADD CONSTRAINT "_videos_v_blocks_related_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_videos_v" ADD CONSTRAINT "_videos_v_parent_id_videos_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_videos_v" ADD CONSTRAINT "_videos_v_version_category_id_video_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."video_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_videos_v" ADD CONSTRAINT "_videos_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_videos_v" ADD CONSTRAINT "_videos_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_videos_v" ADD CONSTRAINT "_videos_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_videos_v" ADD CONSTRAINT "_videos_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_videos_v" ADD CONSTRAINT "_videos_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_videos_v_locales" ADD CONSTRAINT "_videos_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_videos_v_texts" ADD CONSTRAINT "_videos_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_videos_v_rels" ADD CONSTRAINT "_videos_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_videos_v_rels" ADD CONSTRAINT "_videos_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_videos_v_rels" ADD CONSTRAINT "_videos_v_rels_case_study_pages_fk" FOREIGN KEY ("case_study_pages_id") REFERENCES "public"."case_study_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_videos_v_rels" ADD CONSTRAINT "_videos_v_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_videos_v_rels" ADD CONSTRAINT "_videos_v_rels_video_pages_fk" FOREIGN KEY ("video_pages_id") REFERENCES "public"."video_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_social_proof" ADD CONSTRAINT "pages_blocks_hero_social_proof_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_features_items" ADD CONSTRAINT "pages_blocks_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_features" ADD CONSTRAINT "pages_blocks_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_plans_features" ADD CONSTRAINT "pages_blocks_pricing_plans_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_plans" ADD CONSTRAINT "pages_blocks_pricing_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing" ADD CONSTRAINT "pages_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial" ADD CONSTRAINT "pages_blocks_testimonial_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonial" ADD CONSTRAINT "pages_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_questions" ADD CONSTRAINT "pages_blocks_faq_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media" ADD CONSTRAINT "pages_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media" ADD CONSTRAINT "pages_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_articles" ADD CONSTRAINT "pages_blocks_articles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_case_studies" ADD CONSTRAINT "pages_blocks_case_studies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_offer_showcase" ADD CONSTRAINT "pages_blocks_offer_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_newsletter" ADD CONSTRAINT "pages_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_callout" ADD CONSTRAINT "pages_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_related_content" ADD CONSTRAINT "pages_blocks_related_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video_embed" ADD CONSTRAINT "pages_blocks_video_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_locations" ADD CONSTRAINT "pages_blocks_locations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_members" ADD CONSTRAINT "pages_blocks_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_trust_feed_reviews" ADD CONSTRAINT "pages_blocks_trust_feed_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_trust_feed"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_trust_feed" ADD CONSTRAINT "pages_blocks_trust_feed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_case_study_pages_fk" FOREIGN KEY ("case_study_pages_id") REFERENCES "public"."case_study_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_offer_pages_fk" FOREIGN KEY ("offer_pages_id") REFERENCES "public"."offer_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_video_pages_fk" FOREIGN KEY ("video_pages_id") REFERENCES "public"."video_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_social_proof" ADD CONSTRAINT "_pages_v_blocks_hero_social_proof_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_features_items" ADD CONSTRAINT "_pages_v_blocks_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_features" ADD CONSTRAINT "_pages_v_blocks_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_plans_features" ADD CONSTRAINT "_pages_v_blocks_pricing_plans_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_plans" ADD CONSTRAINT "_pages_v_blocks_pricing_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing" ADD CONSTRAINT "_pages_v_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial" ADD CONSTRAINT "_pages_v_blocks_testimonial_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonial" ADD CONSTRAINT "_pages_v_blocks_testimonial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_questions" ADD CONSTRAINT "_pages_v_blocks_faq_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media" ADD CONSTRAINT "_pages_v_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media" ADD CONSTRAINT "_pages_v_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_articles" ADD CONSTRAINT "_pages_v_blocks_articles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_case_studies" ADD CONSTRAINT "_pages_v_blocks_case_studies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_offer_showcase" ADD CONSTRAINT "_pages_v_blocks_offer_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_newsletter" ADD CONSTRAINT "_pages_v_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_callout" ADD CONSTRAINT "_pages_v_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_related_content" ADD CONSTRAINT "_pages_v_blocks_related_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_embed" ADD CONSTRAINT "_pages_v_blocks_video_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_locations" ADD CONSTRAINT "_pages_v_blocks_locations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_team_members" ADD CONSTRAINT "_pages_v_blocks_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_trust_feed_reviews" ADD CONSTRAINT "_pages_v_blocks_trust_feed_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_trust_feed"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_trust_feed" ADD CONSTRAINT "_pages_v_blocks_trust_feed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_case_study_pages_fk" FOREIGN KEY ("case_study_pages_id") REFERENCES "public"."case_study_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_offer_pages_fk" FOREIGN KEY ("offer_pages_id") REFERENCES "public"."offer_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_video_pages_fk" FOREIGN KEY ("video_pages_id") REFERENCES "public"."video_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offer_pages_blocks_hero_social_proof" ADD CONSTRAINT "offer_pages_blocks_hero_social_proof_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offer_pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offer_pages_blocks_hero" ADD CONSTRAINT "offer_pages_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offer_pages_blocks_hero" ADD CONSTRAINT "offer_pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offer_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offer_pages_blocks_rich_text" ADD CONSTRAINT "offer_pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offer_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offer_pages_blocks_media" ADD CONSTRAINT "offer_pages_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offer_pages_blocks_media" ADD CONSTRAINT "offer_pages_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offer_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offer_pages_blocks_cta" ADD CONSTRAINT "offer_pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offer_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offer_pages" ADD CONSTRAINT "offer_pages_category_id_offer_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."offer_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offer_pages" ADD CONSTRAINT "offer_pages_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offer_pages" ADD CONSTRAINT "offer_pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offer_pages" ADD CONSTRAINT "offer_pages_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offer_pages" ADD CONSTRAINT "offer_pages_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offer_pages" ADD CONSTRAINT "offer_pages_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offer_pages_locales" ADD CONSTRAINT "offer_pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offer_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offer_pages_v_blocks_hero_social_proof" ADD CONSTRAINT "_offer_pages_v_blocks_hero_social_proof_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offer_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offer_pages_v_blocks_hero" ADD CONSTRAINT "_offer_pages_v_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offer_pages_v_blocks_hero" ADD CONSTRAINT "_offer_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offer_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offer_pages_v_blocks_rich_text" ADD CONSTRAINT "_offer_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offer_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offer_pages_v_blocks_media" ADD CONSTRAINT "_offer_pages_v_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offer_pages_v_blocks_media" ADD CONSTRAINT "_offer_pages_v_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offer_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offer_pages_v_blocks_cta" ADD CONSTRAINT "_offer_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offer_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offer_pages_v" ADD CONSTRAINT "_offer_pages_v_parent_id_offer_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."offer_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offer_pages_v" ADD CONSTRAINT "_offer_pages_v_version_category_id_offer_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."offer_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offer_pages_v" ADD CONSTRAINT "_offer_pages_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offer_pages_v" ADD CONSTRAINT "_offer_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offer_pages_v" ADD CONSTRAINT "_offer_pages_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offer_pages_v" ADD CONSTRAINT "_offer_pages_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offer_pages_v" ADD CONSTRAINT "_offer_pages_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offer_pages_v_locales" ADD CONSTRAINT "_offer_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offer_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_study_pages_results" ADD CONSTRAINT "case_study_pages_results_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_study_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_study_pages_results_locales" ADD CONSTRAINT "case_study_pages_results_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_study_pages_results"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_study_pages_blocks_hero_social_proof" ADD CONSTRAINT "case_study_pages_blocks_hero_social_proof_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_study_pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_study_pages_blocks_hero" ADD CONSTRAINT "case_study_pages_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_study_pages_blocks_hero" ADD CONSTRAINT "case_study_pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_study_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_study_pages_blocks_rich_text" ADD CONSTRAINT "case_study_pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_study_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_study_pages_blocks_media" ADD CONSTRAINT "case_study_pages_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_study_pages_blocks_media" ADD CONSTRAINT "case_study_pages_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_study_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_study_pages_blocks_callout" ADD CONSTRAINT "case_study_pages_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_study_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_study_pages" ADD CONSTRAINT "case_study_pages_category_id_case_study_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."case_study_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_study_pages" ADD CONSTRAINT "case_study_pages_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_study_pages" ADD CONSTRAINT "case_study_pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_study_pages" ADD CONSTRAINT "case_study_pages_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_study_pages" ADD CONSTRAINT "case_study_pages_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_study_pages" ADD CONSTRAINT "case_study_pages_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_study_pages_locales" ADD CONSTRAINT "case_study_pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_study_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_study_pages_v_version_results" ADD CONSTRAINT "_case_study_pages_v_version_results_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_study_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_study_pages_v_version_results_locales" ADD CONSTRAINT "_case_study_pages_v_version_results_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_study_pages_v_version_results"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_study_pages_v_blocks_hero_social_proof" ADD CONSTRAINT "_case_study_pages_v_blocks_hero_social_proof_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_study_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_study_pages_v_blocks_hero" ADD CONSTRAINT "_case_study_pages_v_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_study_pages_v_blocks_hero" ADD CONSTRAINT "_case_study_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_study_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_study_pages_v_blocks_rich_text" ADD CONSTRAINT "_case_study_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_study_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_study_pages_v_blocks_media" ADD CONSTRAINT "_case_study_pages_v_blocks_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_study_pages_v_blocks_media" ADD CONSTRAINT "_case_study_pages_v_blocks_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_study_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_study_pages_v_blocks_callout" ADD CONSTRAINT "_case_study_pages_v_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_study_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_study_pages_v" ADD CONSTRAINT "_case_study_pages_v_parent_id_case_study_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."case_study_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_study_pages_v" ADD CONSTRAINT "_case_study_pages_v_version_category_id_case_study_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."case_study_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_study_pages_v" ADD CONSTRAINT "_case_study_pages_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_study_pages_v" ADD CONSTRAINT "_case_study_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_study_pages_v" ADD CONSTRAINT "_case_study_pages_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_study_pages_v" ADD CONSTRAINT "_case_study_pages_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_study_pages_v" ADD CONSTRAINT "_case_study_pages_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_study_pages_v_locales" ADD CONSTRAINT "_case_study_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_study_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "video_pages_blocks_rich_text" ADD CONSTRAINT "video_pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."video_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "video_pages_blocks_related_content" ADD CONSTRAINT "video_pages_blocks_related_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."video_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "video_pages" ADD CONSTRAINT "video_pages_category_id_video_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."video_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "video_pages" ADD CONSTRAINT "video_pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "video_pages" ADD CONSTRAINT "video_pages_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "video_pages" ADD CONSTRAINT "video_pages_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "video_pages" ADD CONSTRAINT "video_pages_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "video_pages_locales" ADD CONSTRAINT "video_pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."video_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "video_pages_texts" ADD CONSTRAINT "video_pages_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."video_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "video_pages_rels" ADD CONSTRAINT "video_pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."video_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "video_pages_rels" ADD CONSTRAINT "video_pages_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "video_pages_rels" ADD CONSTRAINT "video_pages_rels_case_study_pages_fk" FOREIGN KEY ("case_study_pages_id") REFERENCES "public"."case_study_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "video_pages_rels" ADD CONSTRAINT "video_pages_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "video_pages_rels" ADD CONSTRAINT "video_pages_rels_video_pages_fk" FOREIGN KEY ("video_pages_id") REFERENCES "public"."video_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_video_pages_v_blocks_rich_text" ADD CONSTRAINT "_video_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_video_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_video_pages_v_blocks_related_content" ADD CONSTRAINT "_video_pages_v_blocks_related_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_video_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_video_pages_v" ADD CONSTRAINT "_video_pages_v_parent_id_video_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."video_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_video_pages_v" ADD CONSTRAINT "_video_pages_v_version_category_id_video_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."video_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_video_pages_v" ADD CONSTRAINT "_video_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_video_pages_v" ADD CONSTRAINT "_video_pages_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_video_pages_v" ADD CONSTRAINT "_video_pages_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_video_pages_v" ADD CONSTRAINT "_video_pages_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_video_pages_v_locales" ADD CONSTRAINT "_video_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_video_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_video_pages_v_texts" ADD CONSTRAINT "_video_pages_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_video_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_video_pages_v_rels" ADD CONSTRAINT "_video_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_video_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_video_pages_v_rels" ADD CONSTRAINT "_video_pages_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_video_pages_v_rels" ADD CONSTRAINT "_video_pages_v_rels_case_study_pages_fk" FOREIGN KEY ("case_study_pages_id") REFERENCES "public"."case_study_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_video_pages_v_rels" ADD CONSTRAINT "_video_pages_v_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_video_pages_v_rels" ADD CONSTRAINT "_video_pages_v_rels_video_pages_fk" FOREIGN KEY ("video_pages_id") REFERENCES "public"."video_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_pages_blocks_hero_social_proof" ADD CONSTRAINT "faq_pages_blocks_hero_social_proof_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_pages_blocks_hero" ADD CONSTRAINT "faq_pages_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faq_pages_blocks_hero" ADD CONSTRAINT "faq_pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_pages_blocks_faq_questions" ADD CONSTRAINT "faq_pages_blocks_faq_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_pages_blocks_faq" ADD CONSTRAINT "faq_pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_pages" ADD CONSTRAINT "faq_pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faq_pages" ADD CONSTRAINT "faq_pages_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faq_pages" ADD CONSTRAINT "faq_pages_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faq_pages" ADD CONSTRAINT "faq_pages_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faq_pages_locales" ADD CONSTRAINT "faq_pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_faq_pages_v_blocks_hero_social_proof" ADD CONSTRAINT "_faq_pages_v_blocks_hero_social_proof_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_faq_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_faq_pages_v_blocks_hero" ADD CONSTRAINT "_faq_pages_v_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faq_pages_v_blocks_hero" ADD CONSTRAINT "_faq_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_faq_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_faq_pages_v_blocks_faq_questions" ADD CONSTRAINT "_faq_pages_v_blocks_faq_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_faq_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_faq_pages_v_blocks_faq" ADD CONSTRAINT "_faq_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_faq_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_faq_pages_v" ADD CONSTRAINT "_faq_pages_v_parent_id_faq_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."faq_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faq_pages_v" ADD CONSTRAINT "_faq_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faq_pages_v" ADD CONSTRAINT "_faq_pages_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faq_pages_v" ADD CONSTRAINT "_faq_pages_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faq_pages_v" ADD CONSTRAINT "_faq_pages_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faq_pages_v_locales" ADD CONSTRAINT "_faq_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_faq_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "terms_pages_blocks_rich_text" ADD CONSTRAINT "terms_pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."terms_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "terms_pages" ADD CONSTRAINT "terms_pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "terms_pages" ADD CONSTRAINT "terms_pages_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "terms_pages" ADD CONSTRAINT "terms_pages_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "terms_pages" ADD CONSTRAINT "terms_pages_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "terms_pages_locales" ADD CONSTRAINT "terms_pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."terms_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_terms_pages_v_blocks_rich_text" ADD CONSTRAINT "_terms_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_terms_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_terms_pages_v" ADD CONSTRAINT "_terms_pages_v_parent_id_terms_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."terms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_terms_pages_v" ADD CONSTRAINT "_terms_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_terms_pages_v" ADD CONSTRAINT "_terms_pages_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_terms_pages_v" ADD CONSTRAINT "_terms_pages_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_terms_pages_v" ADD CONSTRAINT "_terms_pages_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_terms_pages_v_locales" ADD CONSTRAINT "_terms_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_terms_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "privacy_pages_blocks_rich_text" ADD CONSTRAINT "privacy_pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."privacy_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "privacy_pages" ADD CONSTRAINT "privacy_pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "privacy_pages" ADD CONSTRAINT "privacy_pages_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "privacy_pages" ADD CONSTRAINT "privacy_pages_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "privacy_pages" ADD CONSTRAINT "privacy_pages_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "privacy_pages_locales" ADD CONSTRAINT "privacy_pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."privacy_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_privacy_pages_v_blocks_rich_text" ADD CONSTRAINT "_privacy_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_privacy_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_privacy_pages_v" ADD CONSTRAINT "_privacy_pages_v_parent_id_privacy_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."privacy_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_privacy_pages_v" ADD CONSTRAINT "_privacy_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_privacy_pages_v" ADD CONSTRAINT "_privacy_pages_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_privacy_pages_v" ADD CONSTRAINT "_privacy_pages_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_privacy_pages_v" ADD CONSTRAINT "_privacy_pages_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_privacy_pages_v_locales" ADD CONSTRAINT "_privacy_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_privacy_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cookie_policy_pages_blocks_rich_text" ADD CONSTRAINT "cookie_policy_pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cookie_policy_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cookie_policy_pages" ADD CONSTRAINT "cookie_policy_pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cookie_policy_pages" ADD CONSTRAINT "cookie_policy_pages_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cookie_policy_pages" ADD CONSTRAINT "cookie_policy_pages_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cookie_policy_pages" ADD CONSTRAINT "cookie_policy_pages_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cookie_policy_pages_locales" ADD CONSTRAINT "cookie_policy_pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cookie_policy_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cookie_policy_pages_v_blocks_rich_text" ADD CONSTRAINT "_cookie_policy_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cookie_policy_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cookie_policy_pages_v" ADD CONSTRAINT "_cookie_policy_pages_v_parent_id_cookie_policy_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cookie_policy_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cookie_policy_pages_v" ADD CONSTRAINT "_cookie_policy_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cookie_policy_pages_v" ADD CONSTRAINT "_cookie_policy_pages_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cookie_policy_pages_v" ADD CONSTRAINT "_cookie_policy_pages_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cookie_policy_pages_v" ADD CONSTRAINT "_cookie_policy_pages_v_version_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cookie_policy_pages_v_locales" ADD CONSTRAINT "_cookie_policy_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cookie_policy_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "translation_queue" ADD CONSTRAINT "translation_queue_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "translation_queue" ADD CONSTRAINT "translation_queue_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_api_keys_fk" FOREIGN KEY ("api_keys_id") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sites_fk" FOREIGN KEY ("sites_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_domains_fk" FOREIGN KEY ("site_domains_id") REFERENCES "public"."site_domains"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_settings_fk" FOREIGN KEY ("site_settings_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_languages_fk" FOREIGN KEY ("languages_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_navigation_fk" FOREIGN KEY ("navigation_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_article_categories_fk" FOREIGN KEY ("article_categories_id") REFERENCES "public"."article_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_case_study_categories_fk" FOREIGN KEY ("case_study_categories_id") REFERENCES "public"."case_study_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_offer_categories_fk" FOREIGN KEY ("offer_categories_id") REFERENCES "public"."offer_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_help_categories_fk" FOREIGN KEY ("help_categories_id") REFERENCES "public"."help_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_video_categories_fk" FOREIGN KEY ("video_categories_id") REFERENCES "public"."video_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_help_articles_fk" FOREIGN KEY ("help_articles_id") REFERENCES "public"."help_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_offer_pages_fk" FOREIGN KEY ("offer_pages_id") REFERENCES "public"."offer_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_case_study_pages_fk" FOREIGN KEY ("case_study_pages_id") REFERENCES "public"."case_study_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_video_pages_fk" FOREIGN KEY ("video_pages_id") REFERENCES "public"."video_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faq_pages_fk" FOREIGN KEY ("faq_pages_id") REFERENCES "public"."faq_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_terms_pages_fk" FOREIGN KEY ("terms_pages_id") REFERENCES "public"."terms_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_privacy_pages_fk" FOREIGN KEY ("privacy_pages_id") REFERENCES "public"."privacy_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cookie_policy_pages_fk" FOREIGN KEY ("cookie_policy_pages_id") REFERENCES "public"."cookie_policy_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_translation_queue_fk" FOREIGN KEY ("translation_queue_id") REFERENCES "public"."translation_queue"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_navigation_children" ADD CONSTRAINT "header_navigation_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_navigation_children_locales" ADD CONSTRAINT "header_navigation_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_navigation_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_navigation" ADD CONSTRAINT "header_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_navigation_locales" ADD CONSTRAINT "header_navigation_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header" ADD CONSTRAINT "header_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header_locales" ADD CONSTRAINT "header_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links_locales" ADD CONSTRAINT "footer_columns_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_locales" ADD CONSTRAINT "footer_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_social_links" ADD CONSTRAINT "footer_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "seo" ADD CONSTRAINT "seo_default_og_image_id_media_id_fk" FOREIGN KEY ("default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo" ADD CONSTRAINT "seo_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo_locales" ADD CONSTRAINT "seo_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."seo"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "legal_locales" ADD CONSTRAINT "legal_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legal"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_info_locales" ADD CONSTRAINT "contact_info_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_info"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "users_texts_order_parent" ON "users_texts" USING btree ("order","parent_id");
  CREATE INDEX "users_rels_order_idx" ON "users_rels" USING btree ("order");
  CREATE INDEX "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id");
  CREATE INDEX "users_rels_path_idx" ON "users_rels" USING btree ("path");
  CREATE INDEX "users_rels_roles_id_idx" ON "users_rels" USING btree ("roles_id");
  CREATE INDEX "users_rels_sites_id_idx" ON "users_rels" USING btree ("sites_id");
  CREATE INDEX "api_keys_site_idx" ON "api_keys" USING btree ("site_id");
  CREATE INDEX "api_keys_locale_idx" ON "api_keys" USING btree ("locale");
  CREATE INDEX "api_keys_updated_at_idx" ON "api_keys" USING btree ("updated_at");
  CREATE INDEX "api_keys_created_at_idx" ON "api_keys" USING btree ("created_at");
  CREATE UNIQUE INDEX "roles_name_idx" ON "roles" USING btree ("name");
  CREATE INDEX "roles_updated_at_idx" ON "roles" USING btree ("updated_at");
  CREATE INDEX "roles_created_at_idx" ON "roles" USING btree ("created_at");
  CREATE INDEX "sites_youtube_playlist_ids_order_idx" ON "sites_youtube_playlist_ids" USING btree ("_order");
  CREATE INDEX "sites_youtube_playlist_ids_parent_id_idx" ON "sites_youtube_playlist_ids" USING btree ("_parent_id");
  CREATE INDEX "sites_permission_overrides_order_idx" ON "sites_permission_overrides" USING btree ("_order");
  CREATE INDEX "sites_permission_overrides_parent_id_idx" ON "sites_permission_overrides" USING btree ("_parent_id");
  CREATE INDEX "sites_permission_overrides_role_idx" ON "sites_permission_overrides" USING btree ("role_id");
  CREATE UNIQUE INDEX "sites_domain_idx" ON "sites" USING btree ("domain");
  CREATE INDEX "sites_org_id_idx" ON "sites" USING btree ("org_id");
  CREATE INDEX "sites_program_id_idx" ON "sites" USING btree ("program_id");
  CREATE INDEX "sites_lead_id_idx" ON "sites" USING btree ("lead_id");
  CREATE INDEX "sites_default_language_idx" ON "sites" USING btree ("default_language_id");
  CREATE INDEX "sites_default_video_category_idx" ON "sites" USING btree ("default_video_category_id");
  CREATE INDEX "sites_updated_at_idx" ON "sites" USING btree ("updated_at");
  CREATE INDEX "sites_created_at_idx" ON "sites" USING btree ("created_at");
  CREATE INDEX "sites_rels_order_idx" ON "sites_rels" USING btree ("order");
  CREATE INDEX "sites_rels_parent_idx" ON "sites_rels" USING btree ("parent_id");
  CREATE INDEX "sites_rels_path_idx" ON "sites_rels" USING btree ("path");
  CREATE INDEX "sites_rels_languages_id_idx" ON "sites_rels" USING btree ("languages_id");
  CREATE UNIQUE INDEX "site_domains_hostname_idx" ON "site_domains" USING btree ("hostname");
  CREATE INDEX "site_domains_site_idx" ON "site_domains" USING btree ("site_id");
  CREATE INDEX "site_domains_updated_at_idx" ON "site_domains" USING btree ("updated_at");
  CREATE INDEX "site_domains_created_at_idx" ON "site_domains" USING btree ("created_at");
  CREATE INDEX "site_settings_site_idx" ON "site_settings" USING btree ("site_id");
  CREATE INDEX "site_settings_locale_idx" ON "site_settings" USING btree ("locale");
  CREATE INDEX "site_settings_branding_branding_logo_idx" ON "site_settings" USING btree ("branding_logo_id");
  CREATE INDEX "site_settings_branding_branding_favicon_idx" ON "site_settings" USING btree ("branding_favicon_id");
  CREATE INDEX "site_settings_submitted_by_idx" ON "site_settings" USING btree ("submitted_by_id");
  CREATE INDEX "site_settings_reviewed_by_idx" ON "site_settings" USING btree ("reviewed_by_id");
  CREATE INDEX "site_settings_updated_at_idx" ON "site_settings" USING btree ("updated_at");
  CREATE INDEX "site_settings_created_at_idx" ON "site_settings" USING btree ("created_at");
  CREATE INDEX "site_settings__status_idx" ON "site_settings" USING btree ("_status");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_settings_v_parent_idx" ON "_site_settings_v" USING btree ("parent_id");
  CREATE INDEX "_site_settings_v_version_version_site_idx" ON "_site_settings_v" USING btree ("version_site_id");
  CREATE INDEX "_site_settings_v_version_version_locale_idx" ON "_site_settings_v" USING btree ("version_locale");
  CREATE INDEX "_site_settings_v_version_branding_version_branding_logo_idx" ON "_site_settings_v" USING btree ("version_branding_logo_id");
  CREATE INDEX "_site_settings_v_version_branding_version_branding_favic_idx" ON "_site_settings_v" USING btree ("version_branding_favicon_id");
  CREATE INDEX "_site_settings_v_version_version_submitted_by_idx" ON "_site_settings_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_site_settings_v_version_version_reviewed_by_idx" ON "_site_settings_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_site_settings_v_version_version_updated_at_idx" ON "_site_settings_v" USING btree ("version_updated_at");
  CREATE INDEX "_site_settings_v_version_version_created_at_idx" ON "_site_settings_v" USING btree ("version_created_at");
  CREATE INDEX "_site_settings_v_version_version__status_idx" ON "_site_settings_v" USING btree ("version__status");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_snapshot_idx" ON "_site_settings_v" USING btree ("snapshot");
  CREATE INDEX "_site_settings_v_published_locale_idx" ON "_site_settings_v" USING btree ("published_locale");
  CREATE INDEX "_site_settings_v_latest_idx" ON "_site_settings_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_site_settings_v_locales_locale_parent_id_unique" ON "_site_settings_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "languages_code_idx" ON "languages" USING btree ("code");
  CREATE INDEX "languages_updated_at_idx" ON "languages" USING btree ("updated_at");
  CREATE INDEX "languages_created_at_idx" ON "languages" USING btree ("created_at");
  CREATE INDEX "media_site_idx" ON "media" USING btree ("site_id");
  CREATE INDEX "media_locale_idx" ON "media" USING btree ("locale");
  CREATE INDEX "media_uploaded_by_idx" ON "media" USING btree ("uploaded_by_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_tablet_sizes_tablet_filename_idx" ON "media" USING btree ("sizes_tablet_filename");
  CREATE INDEX "media_texts_order_parent" ON "media_texts" USING btree ("order","parent_id");
  CREATE INDEX "navigation_parent_idx" ON "navigation" USING btree ("parent_id");
  CREATE INDEX "navigation_site_idx" ON "navigation" USING btree ("site_id");
  CREATE INDEX "navigation_locale_idx" ON "navigation" USING btree ("locale");
  CREATE INDEX "navigation_submitted_by_idx" ON "navigation" USING btree ("submitted_by_id");
  CREATE INDEX "navigation_reviewed_by_idx" ON "navigation" USING btree ("reviewed_by_id");
  CREATE INDEX "navigation_updated_at_idx" ON "navigation" USING btree ("updated_at");
  CREATE INDEX "navigation_created_at_idx" ON "navigation" USING btree ("created_at");
  CREATE INDEX "navigation__status_idx" ON "navigation" USING btree ("_status");
  CREATE INDEX "navigation_slug_idx" ON "navigation_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "navigation_locales_locale_parent_id_unique" ON "navigation_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_navigation_v_parent_idx" ON "_navigation_v" USING btree ("parent_id");
  CREATE INDEX "_navigation_v_version_version_parent_idx" ON "_navigation_v" USING btree ("version_parent_id");
  CREATE INDEX "_navigation_v_version_version_site_idx" ON "_navigation_v" USING btree ("version_site_id");
  CREATE INDEX "_navigation_v_version_version_locale_idx" ON "_navigation_v" USING btree ("version_locale");
  CREATE INDEX "_navigation_v_version_version_submitted_by_idx" ON "_navigation_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_navigation_v_version_version_reviewed_by_idx" ON "_navigation_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_navigation_v_version_version_updated_at_idx" ON "_navigation_v" USING btree ("version_updated_at");
  CREATE INDEX "_navigation_v_version_version_created_at_idx" ON "_navigation_v" USING btree ("version_created_at");
  CREATE INDEX "_navigation_v_version_version__status_idx" ON "_navigation_v" USING btree ("version__status");
  CREATE INDEX "_navigation_v_created_at_idx" ON "_navigation_v" USING btree ("created_at");
  CREATE INDEX "_navigation_v_updated_at_idx" ON "_navigation_v" USING btree ("updated_at");
  CREATE INDEX "_navigation_v_snapshot_idx" ON "_navigation_v" USING btree ("snapshot");
  CREATE INDEX "_navigation_v_published_locale_idx" ON "_navigation_v" USING btree ("published_locale");
  CREATE INDEX "_navigation_v_latest_idx" ON "_navigation_v" USING btree ("latest");
  CREATE INDEX "_navigation_v_version_version_slug_idx" ON "_navigation_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_navigation_v_locales_locale_parent_id_unique" ON "_navigation_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "testimonials_avatar_idx" ON "testimonials" USING btree ("avatar_id");
  CREATE INDEX "testimonials_site_idx" ON "testimonials" USING btree ("site_id");
  CREATE INDEX "testimonials_locale_idx" ON "testimonials" USING btree ("locale");
  CREATE INDEX "testimonials_submitted_by_idx" ON "testimonials" USING btree ("submitted_by_id");
  CREATE INDEX "testimonials_reviewed_by_idx" ON "testimonials" USING btree ("reviewed_by_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "testimonials__status_idx" ON "testimonials" USING btree ("_status");
  CREATE INDEX "testimonials_slug_idx" ON "testimonials_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "testimonials_locales_locale_parent_id_unique" ON "testimonials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_testimonials_v_parent_idx" ON "_testimonials_v" USING btree ("parent_id");
  CREATE INDEX "_testimonials_v_version_version_avatar_idx" ON "_testimonials_v" USING btree ("version_avatar_id");
  CREATE INDEX "_testimonials_v_version_version_site_idx" ON "_testimonials_v" USING btree ("version_site_id");
  CREATE INDEX "_testimonials_v_version_version_locale_idx" ON "_testimonials_v" USING btree ("version_locale");
  CREATE INDEX "_testimonials_v_version_version_submitted_by_idx" ON "_testimonials_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_testimonials_v_version_version_reviewed_by_idx" ON "_testimonials_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_testimonials_v_version_version_updated_at_idx" ON "_testimonials_v" USING btree ("version_updated_at");
  CREATE INDEX "_testimonials_v_version_version_created_at_idx" ON "_testimonials_v" USING btree ("version_created_at");
  CREATE INDEX "_testimonials_v_version_version__status_idx" ON "_testimonials_v" USING btree ("version__status");
  CREATE INDEX "_testimonials_v_created_at_idx" ON "_testimonials_v" USING btree ("created_at");
  CREATE INDEX "_testimonials_v_updated_at_idx" ON "_testimonials_v" USING btree ("updated_at");
  CREATE INDEX "_testimonials_v_snapshot_idx" ON "_testimonials_v" USING btree ("snapshot");
  CREATE INDEX "_testimonials_v_published_locale_idx" ON "_testimonials_v" USING btree ("published_locale");
  CREATE INDEX "_testimonials_v_latest_idx" ON "_testimonials_v" USING btree ("latest");
  CREATE INDEX "_testimonials_v_version_version_slug_idx" ON "_testimonials_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_testimonials_v_locales_locale_parent_id_unique" ON "_testimonials_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "locations_site_idx" ON "locations" USING btree ("site_id");
  CREATE INDEX "locations_locale_idx" ON "locations" USING btree ("locale");
  CREATE INDEX "locations_submitted_by_idx" ON "locations" USING btree ("submitted_by_id");
  CREATE INDEX "locations_reviewed_by_idx" ON "locations" USING btree ("reviewed_by_id");
  CREATE INDEX "locations_updated_at_idx" ON "locations" USING btree ("updated_at");
  CREATE INDEX "locations_created_at_idx" ON "locations" USING btree ("created_at");
  CREATE INDEX "locations__status_idx" ON "locations" USING btree ("_status");
  CREATE INDEX "locations_slug_idx" ON "locations_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "locations_locales_locale_parent_id_unique" ON "locations_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_locations_v_parent_idx" ON "_locations_v" USING btree ("parent_id");
  CREATE INDEX "_locations_v_version_version_site_idx" ON "_locations_v" USING btree ("version_site_id");
  CREATE INDEX "_locations_v_version_version_locale_idx" ON "_locations_v" USING btree ("version_locale");
  CREATE INDEX "_locations_v_version_version_submitted_by_idx" ON "_locations_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_locations_v_version_version_reviewed_by_idx" ON "_locations_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_locations_v_version_version_updated_at_idx" ON "_locations_v" USING btree ("version_updated_at");
  CREATE INDEX "_locations_v_version_version_created_at_idx" ON "_locations_v" USING btree ("version_created_at");
  CREATE INDEX "_locations_v_version_version__status_idx" ON "_locations_v" USING btree ("version__status");
  CREATE INDEX "_locations_v_created_at_idx" ON "_locations_v" USING btree ("created_at");
  CREATE INDEX "_locations_v_updated_at_idx" ON "_locations_v" USING btree ("updated_at");
  CREATE INDEX "_locations_v_snapshot_idx" ON "_locations_v" USING btree ("snapshot");
  CREATE INDEX "_locations_v_published_locale_idx" ON "_locations_v" USING btree ("published_locale");
  CREATE INDEX "_locations_v_latest_idx" ON "_locations_v" USING btree ("latest");
  CREATE INDEX "_locations_v_version_version_slug_idx" ON "_locations_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_locations_v_locales_locale_parent_id_unique" ON "_locations_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "team_members_photo_idx" ON "team_members" USING btree ("photo_id");
  CREATE INDEX "team_members_site_idx" ON "team_members" USING btree ("site_id");
  CREATE INDEX "team_members_locale_idx" ON "team_members" USING btree ("locale");
  CREATE INDEX "team_members_submitted_by_idx" ON "team_members" USING btree ("submitted_by_id");
  CREATE INDEX "team_members_reviewed_by_idx" ON "team_members" USING btree ("reviewed_by_id");
  CREATE INDEX "team_members_updated_at_idx" ON "team_members" USING btree ("updated_at");
  CREATE INDEX "team_members_created_at_idx" ON "team_members" USING btree ("created_at");
  CREATE INDEX "team_members__status_idx" ON "team_members" USING btree ("_status");
  CREATE INDEX "team_members_slug_idx" ON "team_members_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "team_members_locales_locale_parent_id_unique" ON "team_members_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_team_members_v_parent_idx" ON "_team_members_v" USING btree ("parent_id");
  CREATE INDEX "_team_members_v_version_version_photo_idx" ON "_team_members_v" USING btree ("version_photo_id");
  CREATE INDEX "_team_members_v_version_version_site_idx" ON "_team_members_v" USING btree ("version_site_id");
  CREATE INDEX "_team_members_v_version_version_locale_idx" ON "_team_members_v" USING btree ("version_locale");
  CREATE INDEX "_team_members_v_version_version_submitted_by_idx" ON "_team_members_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_team_members_v_version_version_reviewed_by_idx" ON "_team_members_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_team_members_v_version_version_updated_at_idx" ON "_team_members_v" USING btree ("version_updated_at");
  CREATE INDEX "_team_members_v_version_version_created_at_idx" ON "_team_members_v" USING btree ("version_created_at");
  CREATE INDEX "_team_members_v_version_version__status_idx" ON "_team_members_v" USING btree ("version__status");
  CREATE INDEX "_team_members_v_created_at_idx" ON "_team_members_v" USING btree ("created_at");
  CREATE INDEX "_team_members_v_updated_at_idx" ON "_team_members_v" USING btree ("updated_at");
  CREATE INDEX "_team_members_v_snapshot_idx" ON "_team_members_v" USING btree ("snapshot");
  CREATE INDEX "_team_members_v_published_locale_idx" ON "_team_members_v" USING btree ("published_locale");
  CREATE INDEX "_team_members_v_latest_idx" ON "_team_members_v" USING btree ("latest");
  CREATE INDEX "_team_members_v_version_version_slug_idx" ON "_team_members_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_team_members_v_locales_locale_parent_id_unique" ON "_team_members_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "article_categories_parent_idx" ON "article_categories" USING btree ("parent_id");
  CREATE INDEX "article_categories_site_idx" ON "article_categories" USING btree ("site_id");
  CREATE INDEX "article_categories_locale_idx" ON "article_categories" USING btree ("locale");
  CREATE INDEX "article_categories_submitted_by_idx" ON "article_categories" USING btree ("submitted_by_id");
  CREATE INDEX "article_categories_reviewed_by_idx" ON "article_categories" USING btree ("reviewed_by_id");
  CREATE INDEX "article_categories_updated_at_idx" ON "article_categories" USING btree ("updated_at");
  CREATE INDEX "article_categories_created_at_idx" ON "article_categories" USING btree ("created_at");
  CREATE INDEX "article_categories__status_idx" ON "article_categories" USING btree ("_status");
  CREATE INDEX "article_categories_slug_idx" ON "article_categories_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "article_categories_locales_locale_parent_id_unique" ON "article_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_article_categories_v_parent_idx" ON "_article_categories_v" USING btree ("parent_id");
  CREATE INDEX "_article_categories_v_version_version_parent_idx" ON "_article_categories_v" USING btree ("version_parent_id");
  CREATE INDEX "_article_categories_v_version_version_site_idx" ON "_article_categories_v" USING btree ("version_site_id");
  CREATE INDEX "_article_categories_v_version_version_locale_idx" ON "_article_categories_v" USING btree ("version_locale");
  CREATE INDEX "_article_categories_v_version_version_submitted_by_idx" ON "_article_categories_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_article_categories_v_version_version_reviewed_by_idx" ON "_article_categories_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_article_categories_v_version_version_updated_at_idx" ON "_article_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_article_categories_v_version_version_created_at_idx" ON "_article_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_article_categories_v_version_version__status_idx" ON "_article_categories_v" USING btree ("version__status");
  CREATE INDEX "_article_categories_v_created_at_idx" ON "_article_categories_v" USING btree ("created_at");
  CREATE INDEX "_article_categories_v_updated_at_idx" ON "_article_categories_v" USING btree ("updated_at");
  CREATE INDEX "_article_categories_v_snapshot_idx" ON "_article_categories_v" USING btree ("snapshot");
  CREATE INDEX "_article_categories_v_published_locale_idx" ON "_article_categories_v" USING btree ("published_locale");
  CREATE INDEX "_article_categories_v_latest_idx" ON "_article_categories_v" USING btree ("latest");
  CREATE INDEX "_article_categories_v_version_version_slug_idx" ON "_article_categories_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_article_categories_v_locales_locale_parent_id_unique" ON "_article_categories_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "case_study_categories_parent_idx" ON "case_study_categories" USING btree ("parent_id");
  CREATE INDEX "case_study_categories_site_idx" ON "case_study_categories" USING btree ("site_id");
  CREATE INDEX "case_study_categories_locale_idx" ON "case_study_categories" USING btree ("locale");
  CREATE INDEX "case_study_categories_submitted_by_idx" ON "case_study_categories" USING btree ("submitted_by_id");
  CREATE INDEX "case_study_categories_reviewed_by_idx" ON "case_study_categories" USING btree ("reviewed_by_id");
  CREATE INDEX "case_study_categories_updated_at_idx" ON "case_study_categories" USING btree ("updated_at");
  CREATE INDEX "case_study_categories_created_at_idx" ON "case_study_categories" USING btree ("created_at");
  CREATE INDEX "case_study_categories__status_idx" ON "case_study_categories" USING btree ("_status");
  CREATE INDEX "case_study_categories_slug_idx" ON "case_study_categories_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "case_study_categories_locales_locale_parent_id_unique" ON "case_study_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_case_study_categories_v_parent_idx" ON "_case_study_categories_v" USING btree ("parent_id");
  CREATE INDEX "_case_study_categories_v_version_version_parent_idx" ON "_case_study_categories_v" USING btree ("version_parent_id");
  CREATE INDEX "_case_study_categories_v_version_version_site_idx" ON "_case_study_categories_v" USING btree ("version_site_id");
  CREATE INDEX "_case_study_categories_v_version_version_locale_idx" ON "_case_study_categories_v" USING btree ("version_locale");
  CREATE INDEX "_case_study_categories_v_version_version_submitted_by_idx" ON "_case_study_categories_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_case_study_categories_v_version_version_reviewed_by_idx" ON "_case_study_categories_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_case_study_categories_v_version_version_updated_at_idx" ON "_case_study_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_case_study_categories_v_version_version_created_at_idx" ON "_case_study_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_case_study_categories_v_version_version__status_idx" ON "_case_study_categories_v" USING btree ("version__status");
  CREATE INDEX "_case_study_categories_v_created_at_idx" ON "_case_study_categories_v" USING btree ("created_at");
  CREATE INDEX "_case_study_categories_v_updated_at_idx" ON "_case_study_categories_v" USING btree ("updated_at");
  CREATE INDEX "_case_study_categories_v_snapshot_idx" ON "_case_study_categories_v" USING btree ("snapshot");
  CREATE INDEX "_case_study_categories_v_published_locale_idx" ON "_case_study_categories_v" USING btree ("published_locale");
  CREATE INDEX "_case_study_categories_v_latest_idx" ON "_case_study_categories_v" USING btree ("latest");
  CREATE INDEX "_case_study_categories_v_version_version_slug_idx" ON "_case_study_categories_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_case_study_categories_v_locales_locale_parent_id_unique" ON "_case_study_categories_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "offer_categories_parent_idx" ON "offer_categories" USING btree ("parent_id");
  CREATE INDEX "offer_categories_site_idx" ON "offer_categories" USING btree ("site_id");
  CREATE INDEX "offer_categories_locale_idx" ON "offer_categories" USING btree ("locale");
  CREATE INDEX "offer_categories_submitted_by_idx" ON "offer_categories" USING btree ("submitted_by_id");
  CREATE INDEX "offer_categories_reviewed_by_idx" ON "offer_categories" USING btree ("reviewed_by_id");
  CREATE INDEX "offer_categories_updated_at_idx" ON "offer_categories" USING btree ("updated_at");
  CREATE INDEX "offer_categories_created_at_idx" ON "offer_categories" USING btree ("created_at");
  CREATE INDEX "offer_categories__status_idx" ON "offer_categories" USING btree ("_status");
  CREATE INDEX "offer_categories_slug_idx" ON "offer_categories_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "offer_categories_locales_locale_parent_id_unique" ON "offer_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_offer_categories_v_parent_idx" ON "_offer_categories_v" USING btree ("parent_id");
  CREATE INDEX "_offer_categories_v_version_version_parent_idx" ON "_offer_categories_v" USING btree ("version_parent_id");
  CREATE INDEX "_offer_categories_v_version_version_site_idx" ON "_offer_categories_v" USING btree ("version_site_id");
  CREATE INDEX "_offer_categories_v_version_version_locale_idx" ON "_offer_categories_v" USING btree ("version_locale");
  CREATE INDEX "_offer_categories_v_version_version_submitted_by_idx" ON "_offer_categories_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_offer_categories_v_version_version_reviewed_by_idx" ON "_offer_categories_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_offer_categories_v_version_version_updated_at_idx" ON "_offer_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_offer_categories_v_version_version_created_at_idx" ON "_offer_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_offer_categories_v_version_version__status_idx" ON "_offer_categories_v" USING btree ("version__status");
  CREATE INDEX "_offer_categories_v_created_at_idx" ON "_offer_categories_v" USING btree ("created_at");
  CREATE INDEX "_offer_categories_v_updated_at_idx" ON "_offer_categories_v" USING btree ("updated_at");
  CREATE INDEX "_offer_categories_v_snapshot_idx" ON "_offer_categories_v" USING btree ("snapshot");
  CREATE INDEX "_offer_categories_v_published_locale_idx" ON "_offer_categories_v" USING btree ("published_locale");
  CREATE INDEX "_offer_categories_v_latest_idx" ON "_offer_categories_v" USING btree ("latest");
  CREATE INDEX "_offer_categories_v_version_version_slug_idx" ON "_offer_categories_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_offer_categories_v_locales_locale_parent_id_unique" ON "_offer_categories_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "help_categories_parent_idx" ON "help_categories" USING btree ("parent_id");
  CREATE INDEX "help_categories_site_idx" ON "help_categories" USING btree ("site_id");
  CREATE INDEX "help_categories_locale_idx" ON "help_categories" USING btree ("locale");
  CREATE INDEX "help_categories_submitted_by_idx" ON "help_categories" USING btree ("submitted_by_id");
  CREATE INDEX "help_categories_reviewed_by_idx" ON "help_categories" USING btree ("reviewed_by_id");
  CREATE INDEX "help_categories_updated_at_idx" ON "help_categories" USING btree ("updated_at");
  CREATE INDEX "help_categories_created_at_idx" ON "help_categories" USING btree ("created_at");
  CREATE INDEX "help_categories__status_idx" ON "help_categories" USING btree ("_status");
  CREATE INDEX "help_categories_slug_idx" ON "help_categories_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "help_categories_locales_locale_parent_id_unique" ON "help_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_help_categories_v_parent_idx" ON "_help_categories_v" USING btree ("parent_id");
  CREATE INDEX "_help_categories_v_version_version_parent_idx" ON "_help_categories_v" USING btree ("version_parent_id");
  CREATE INDEX "_help_categories_v_version_version_site_idx" ON "_help_categories_v" USING btree ("version_site_id");
  CREATE INDEX "_help_categories_v_version_version_locale_idx" ON "_help_categories_v" USING btree ("version_locale");
  CREATE INDEX "_help_categories_v_version_version_submitted_by_idx" ON "_help_categories_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_help_categories_v_version_version_reviewed_by_idx" ON "_help_categories_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_help_categories_v_version_version_updated_at_idx" ON "_help_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_help_categories_v_version_version_created_at_idx" ON "_help_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_help_categories_v_version_version__status_idx" ON "_help_categories_v" USING btree ("version__status");
  CREATE INDEX "_help_categories_v_created_at_idx" ON "_help_categories_v" USING btree ("created_at");
  CREATE INDEX "_help_categories_v_updated_at_idx" ON "_help_categories_v" USING btree ("updated_at");
  CREATE INDEX "_help_categories_v_snapshot_idx" ON "_help_categories_v" USING btree ("snapshot");
  CREATE INDEX "_help_categories_v_published_locale_idx" ON "_help_categories_v" USING btree ("published_locale");
  CREATE INDEX "_help_categories_v_latest_idx" ON "_help_categories_v" USING btree ("latest");
  CREATE INDEX "_help_categories_v_version_version_slug_idx" ON "_help_categories_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_help_categories_v_locales_locale_parent_id_unique" ON "_help_categories_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "video_categories_parent_idx" ON "video_categories" USING btree ("parent_id");
  CREATE INDEX "video_categories_site_idx" ON "video_categories" USING btree ("site_id");
  CREATE INDEX "video_categories_locale_idx" ON "video_categories" USING btree ("locale");
  CREATE INDEX "video_categories_submitted_by_idx" ON "video_categories" USING btree ("submitted_by_id");
  CREATE INDEX "video_categories_reviewed_by_idx" ON "video_categories" USING btree ("reviewed_by_id");
  CREATE INDEX "video_categories_updated_at_idx" ON "video_categories" USING btree ("updated_at");
  CREATE INDEX "video_categories_created_at_idx" ON "video_categories" USING btree ("created_at");
  CREATE INDEX "video_categories__status_idx" ON "video_categories" USING btree ("_status");
  CREATE INDEX "video_categories_slug_idx" ON "video_categories_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "video_categories_locales_locale_parent_id_unique" ON "video_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_video_categories_v_parent_idx" ON "_video_categories_v" USING btree ("parent_id");
  CREATE INDEX "_video_categories_v_version_version_parent_idx" ON "_video_categories_v" USING btree ("version_parent_id");
  CREATE INDEX "_video_categories_v_version_version_site_idx" ON "_video_categories_v" USING btree ("version_site_id");
  CREATE INDEX "_video_categories_v_version_version_locale_idx" ON "_video_categories_v" USING btree ("version_locale");
  CREATE INDEX "_video_categories_v_version_version_submitted_by_idx" ON "_video_categories_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_video_categories_v_version_version_reviewed_by_idx" ON "_video_categories_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_video_categories_v_version_version_updated_at_idx" ON "_video_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_video_categories_v_version_version_created_at_idx" ON "_video_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_video_categories_v_version_version__status_idx" ON "_video_categories_v" USING btree ("version__status");
  CREATE INDEX "_video_categories_v_created_at_idx" ON "_video_categories_v" USING btree ("created_at");
  CREATE INDEX "_video_categories_v_updated_at_idx" ON "_video_categories_v" USING btree ("updated_at");
  CREATE INDEX "_video_categories_v_snapshot_idx" ON "_video_categories_v" USING btree ("snapshot");
  CREATE INDEX "_video_categories_v_published_locale_idx" ON "_video_categories_v" USING btree ("published_locale");
  CREATE INDEX "_video_categories_v_latest_idx" ON "_video_categories_v" USING btree ("latest");
  CREATE INDEX "_video_categories_v_version_version_slug_idx" ON "_video_categories_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_video_categories_v_locales_locale_parent_id_unique" ON "_video_categories_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articles_blocks_rich_text_order_idx" ON "articles_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "articles_blocks_rich_text_parent_id_idx" ON "articles_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_rich_text_path_idx" ON "articles_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "articles_blocks_rich_text_locale_idx" ON "articles_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "articles_blocks_media_order_idx" ON "articles_blocks_media" USING btree ("_order");
  CREATE INDEX "articles_blocks_media_parent_id_idx" ON "articles_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_media_path_idx" ON "articles_blocks_media" USING btree ("_path");
  CREATE INDEX "articles_blocks_media_locale_idx" ON "articles_blocks_media" USING btree ("_locale");
  CREATE INDEX "articles_blocks_media_media_idx" ON "articles_blocks_media" USING btree ("media_id");
  CREATE INDEX "articles_blocks_callout_order_idx" ON "articles_blocks_callout" USING btree ("_order");
  CREATE INDEX "articles_blocks_callout_parent_id_idx" ON "articles_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_callout_path_idx" ON "articles_blocks_callout" USING btree ("_path");
  CREATE INDEX "articles_blocks_callout_locale_idx" ON "articles_blocks_callout" USING btree ("_locale");
  CREATE INDEX "articles_blocks_video_embed_order_idx" ON "articles_blocks_video_embed" USING btree ("_order");
  CREATE INDEX "articles_blocks_video_embed_parent_id_idx" ON "articles_blocks_video_embed" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_video_embed_path_idx" ON "articles_blocks_video_embed" USING btree ("_path");
  CREATE INDEX "articles_blocks_video_embed_locale_idx" ON "articles_blocks_video_embed" USING btree ("_locale");
  CREATE INDEX "articles_blocks_related_content_order_idx" ON "articles_blocks_related_content" USING btree ("_order");
  CREATE INDEX "articles_blocks_related_content_parent_id_idx" ON "articles_blocks_related_content" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_related_content_path_idx" ON "articles_blocks_related_content" USING btree ("_path");
  CREATE INDEX "articles_blocks_related_content_locale_idx" ON "articles_blocks_related_content" USING btree ("_locale");
  CREATE INDEX "articles_category_idx" ON "articles" USING btree ("category_id");
  CREATE INDEX "articles_author_idx" ON "articles" USING btree ("author_id");
  CREATE INDEX "articles_featured_image_idx" ON "articles" USING btree ("featured_image_id");
  CREATE INDEX "articles_seo_seo_og_image_idx" ON "articles" USING btree ("seo_og_image_id");
  CREATE INDEX "articles_site_idx" ON "articles" USING btree ("site_id");
  CREATE INDEX "articles_locale_idx" ON "articles" USING btree ("locale");
  CREATE INDEX "articles_submitted_by_idx" ON "articles" USING btree ("submitted_by_id");
  CREATE INDEX "articles_reviewed_by_idx" ON "articles" USING btree ("reviewed_by_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "articles_slug_idx" ON "articles_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "articles_locales_locale_parent_id_unique" ON "articles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articles_texts_order_parent" ON "articles_texts" USING btree ("order","parent_id");
  CREATE INDEX "articles_texts_locale_parent" ON "articles_texts" USING btree ("locale","parent_id");
  CREATE INDEX "articles_rels_order_idx" ON "articles_rels" USING btree ("order");
  CREATE INDEX "articles_rels_parent_idx" ON "articles_rels" USING btree ("parent_id");
  CREATE INDEX "articles_rels_path_idx" ON "articles_rels" USING btree ("path");
  CREATE INDEX "articles_rels_locale_idx" ON "articles_rels" USING btree ("locale");
  CREATE INDEX "articles_rels_articles_id_idx" ON "articles_rels" USING btree ("articles_id","locale");
  CREATE INDEX "articles_rels_case_study_pages_id_idx" ON "articles_rels" USING btree ("case_study_pages_id","locale");
  CREATE INDEX "articles_rels_videos_id_idx" ON "articles_rels" USING btree ("videos_id","locale");
  CREATE INDEX "articles_rels_video_pages_id_idx" ON "articles_rels" USING btree ("video_pages_id","locale");
  CREATE INDEX "_articles_v_blocks_rich_text_order_idx" ON "_articles_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_rich_text_parent_id_idx" ON "_articles_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_rich_text_path_idx" ON "_articles_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_rich_text_locale_idx" ON "_articles_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_articles_v_blocks_media_order_idx" ON "_articles_v_blocks_media" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_media_parent_id_idx" ON "_articles_v_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_media_path_idx" ON "_articles_v_blocks_media" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_media_locale_idx" ON "_articles_v_blocks_media" USING btree ("_locale");
  CREATE INDEX "_articles_v_blocks_media_media_idx" ON "_articles_v_blocks_media" USING btree ("media_id");
  CREATE INDEX "_articles_v_blocks_callout_order_idx" ON "_articles_v_blocks_callout" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_callout_parent_id_idx" ON "_articles_v_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_callout_path_idx" ON "_articles_v_blocks_callout" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_callout_locale_idx" ON "_articles_v_blocks_callout" USING btree ("_locale");
  CREATE INDEX "_articles_v_blocks_video_embed_order_idx" ON "_articles_v_blocks_video_embed" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_video_embed_parent_id_idx" ON "_articles_v_blocks_video_embed" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_video_embed_path_idx" ON "_articles_v_blocks_video_embed" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_video_embed_locale_idx" ON "_articles_v_blocks_video_embed" USING btree ("_locale");
  CREATE INDEX "_articles_v_blocks_related_content_order_idx" ON "_articles_v_blocks_related_content" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_related_content_parent_id_idx" ON "_articles_v_blocks_related_content" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_related_content_path_idx" ON "_articles_v_blocks_related_content" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_related_content_locale_idx" ON "_articles_v_blocks_related_content" USING btree ("_locale");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_category_idx" ON "_articles_v" USING btree ("version_category_id");
  CREATE INDEX "_articles_v_version_version_author_idx" ON "_articles_v" USING btree ("version_author_id");
  CREATE INDEX "_articles_v_version_version_featured_image_idx" ON "_articles_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_articles_v_version_seo_version_seo_og_image_idx" ON "_articles_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_articles_v_version_version_site_idx" ON "_articles_v" USING btree ("version_site_id");
  CREATE INDEX "_articles_v_version_version_locale_idx" ON "_articles_v" USING btree ("version_locale");
  CREATE INDEX "_articles_v_version_version_submitted_by_idx" ON "_articles_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_articles_v_version_version_reviewed_by_idx" ON "_articles_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_snapshot_idx" ON "_articles_v" USING btree ("snapshot");
  CREATE INDEX "_articles_v_published_locale_idx" ON "_articles_v" USING btree ("published_locale");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_articles_v_locales_locale_parent_id_unique" ON "_articles_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_articles_v_texts_order_parent" ON "_articles_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_articles_v_texts_locale_parent" ON "_articles_v_texts" USING btree ("locale","parent_id");
  CREATE INDEX "_articles_v_rels_order_idx" ON "_articles_v_rels" USING btree ("order");
  CREATE INDEX "_articles_v_rels_parent_idx" ON "_articles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_articles_v_rels_path_idx" ON "_articles_v_rels" USING btree ("path");
  CREATE INDEX "_articles_v_rels_locale_idx" ON "_articles_v_rels" USING btree ("locale");
  CREATE INDEX "_articles_v_rels_articles_id_idx" ON "_articles_v_rels" USING btree ("articles_id","locale");
  CREATE INDEX "_articles_v_rels_case_study_pages_id_idx" ON "_articles_v_rels" USING btree ("case_study_pages_id","locale");
  CREATE INDEX "_articles_v_rels_videos_id_idx" ON "_articles_v_rels" USING btree ("videos_id","locale");
  CREATE INDEX "_articles_v_rels_video_pages_id_idx" ON "_articles_v_rels" USING btree ("video_pages_id","locale");
  CREATE INDEX "help_articles_blocks_rich_text_order_idx" ON "help_articles_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "help_articles_blocks_rich_text_parent_id_idx" ON "help_articles_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "help_articles_blocks_rich_text_path_idx" ON "help_articles_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "help_articles_blocks_rich_text_locale_idx" ON "help_articles_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "help_articles_blocks_media_order_idx" ON "help_articles_blocks_media" USING btree ("_order");
  CREATE INDEX "help_articles_blocks_media_parent_id_idx" ON "help_articles_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "help_articles_blocks_media_path_idx" ON "help_articles_blocks_media" USING btree ("_path");
  CREATE INDEX "help_articles_blocks_media_locale_idx" ON "help_articles_blocks_media" USING btree ("_locale");
  CREATE INDEX "help_articles_blocks_media_media_idx" ON "help_articles_blocks_media" USING btree ("media_id");
  CREATE INDEX "help_articles_blocks_callout_order_idx" ON "help_articles_blocks_callout" USING btree ("_order");
  CREATE INDEX "help_articles_blocks_callout_parent_id_idx" ON "help_articles_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "help_articles_blocks_callout_path_idx" ON "help_articles_blocks_callout" USING btree ("_path");
  CREATE INDEX "help_articles_blocks_callout_locale_idx" ON "help_articles_blocks_callout" USING btree ("_locale");
  CREATE INDEX "help_articles_blocks_faq_questions_order_idx" ON "help_articles_blocks_faq_questions" USING btree ("_order");
  CREATE INDEX "help_articles_blocks_faq_questions_parent_id_idx" ON "help_articles_blocks_faq_questions" USING btree ("_parent_id");
  CREATE INDEX "help_articles_blocks_faq_questions_locale_idx" ON "help_articles_blocks_faq_questions" USING btree ("_locale");
  CREATE INDEX "help_articles_blocks_faq_order_idx" ON "help_articles_blocks_faq" USING btree ("_order");
  CREATE INDEX "help_articles_blocks_faq_parent_id_idx" ON "help_articles_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "help_articles_blocks_faq_path_idx" ON "help_articles_blocks_faq" USING btree ("_path");
  CREATE INDEX "help_articles_blocks_faq_locale_idx" ON "help_articles_blocks_faq" USING btree ("_locale");
  CREATE INDEX "help_articles_blocks_video_embed_order_idx" ON "help_articles_blocks_video_embed" USING btree ("_order");
  CREATE INDEX "help_articles_blocks_video_embed_parent_id_idx" ON "help_articles_blocks_video_embed" USING btree ("_parent_id");
  CREATE INDEX "help_articles_blocks_video_embed_path_idx" ON "help_articles_blocks_video_embed" USING btree ("_path");
  CREATE INDEX "help_articles_blocks_video_embed_locale_idx" ON "help_articles_blocks_video_embed" USING btree ("_locale");
  CREATE INDEX "help_articles_category_idx" ON "help_articles" USING btree ("category_id");
  CREATE INDEX "help_articles_popularity_idx" ON "help_articles" USING btree ("popularity");
  CREATE INDEX "help_articles_last_viewed_at_idx" ON "help_articles" USING btree ("last_viewed_at");
  CREATE INDEX "help_articles_seo_seo_og_image_idx" ON "help_articles" USING btree ("seo_og_image_id");
  CREATE INDEX "help_articles_site_idx" ON "help_articles" USING btree ("site_id");
  CREATE INDEX "help_articles_locale_idx" ON "help_articles" USING btree ("locale");
  CREATE INDEX "help_articles_submitted_by_idx" ON "help_articles" USING btree ("submitted_by_id");
  CREATE INDEX "help_articles_reviewed_by_idx" ON "help_articles" USING btree ("reviewed_by_id");
  CREATE INDEX "help_articles_updated_at_idx" ON "help_articles" USING btree ("updated_at");
  CREATE INDEX "help_articles_created_at_idx" ON "help_articles" USING btree ("created_at");
  CREATE INDEX "help_articles__status_idx" ON "help_articles" USING btree ("_status");
  CREATE INDEX "help_articles_slug_idx" ON "help_articles_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "help_articles_locales_locale_parent_id_unique" ON "help_articles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "help_articles_texts_order_parent" ON "help_articles_texts" USING btree ("order","parent_id");
  CREATE INDEX "help_articles_texts_locale_parent" ON "help_articles_texts" USING btree ("locale","parent_id");
  CREATE INDEX "help_articles_rels_order_idx" ON "help_articles_rels" USING btree ("order");
  CREATE INDEX "help_articles_rels_parent_idx" ON "help_articles_rels" USING btree ("parent_id");
  CREATE INDEX "help_articles_rels_path_idx" ON "help_articles_rels" USING btree ("path");
  CREATE INDEX "help_articles_rels_help_articles_id_idx" ON "help_articles_rels" USING btree ("help_articles_id");
  CREATE INDEX "_help_articles_v_blocks_rich_text_order_idx" ON "_help_articles_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_help_articles_v_blocks_rich_text_parent_id_idx" ON "_help_articles_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_help_articles_v_blocks_rich_text_path_idx" ON "_help_articles_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_help_articles_v_blocks_rich_text_locale_idx" ON "_help_articles_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_help_articles_v_blocks_media_order_idx" ON "_help_articles_v_blocks_media" USING btree ("_order");
  CREATE INDEX "_help_articles_v_blocks_media_parent_id_idx" ON "_help_articles_v_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "_help_articles_v_blocks_media_path_idx" ON "_help_articles_v_blocks_media" USING btree ("_path");
  CREATE INDEX "_help_articles_v_blocks_media_locale_idx" ON "_help_articles_v_blocks_media" USING btree ("_locale");
  CREATE INDEX "_help_articles_v_blocks_media_media_idx" ON "_help_articles_v_blocks_media" USING btree ("media_id");
  CREATE INDEX "_help_articles_v_blocks_callout_order_idx" ON "_help_articles_v_blocks_callout" USING btree ("_order");
  CREATE INDEX "_help_articles_v_blocks_callout_parent_id_idx" ON "_help_articles_v_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "_help_articles_v_blocks_callout_path_idx" ON "_help_articles_v_blocks_callout" USING btree ("_path");
  CREATE INDEX "_help_articles_v_blocks_callout_locale_idx" ON "_help_articles_v_blocks_callout" USING btree ("_locale");
  CREATE INDEX "_help_articles_v_blocks_faq_questions_order_idx" ON "_help_articles_v_blocks_faq_questions" USING btree ("_order");
  CREATE INDEX "_help_articles_v_blocks_faq_questions_parent_id_idx" ON "_help_articles_v_blocks_faq_questions" USING btree ("_parent_id");
  CREATE INDEX "_help_articles_v_blocks_faq_questions_locale_idx" ON "_help_articles_v_blocks_faq_questions" USING btree ("_locale");
  CREATE INDEX "_help_articles_v_blocks_faq_order_idx" ON "_help_articles_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_help_articles_v_blocks_faq_parent_id_idx" ON "_help_articles_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_help_articles_v_blocks_faq_path_idx" ON "_help_articles_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_help_articles_v_blocks_faq_locale_idx" ON "_help_articles_v_blocks_faq" USING btree ("_locale");
  CREATE INDEX "_help_articles_v_blocks_video_embed_order_idx" ON "_help_articles_v_blocks_video_embed" USING btree ("_order");
  CREATE INDEX "_help_articles_v_blocks_video_embed_parent_id_idx" ON "_help_articles_v_blocks_video_embed" USING btree ("_parent_id");
  CREATE INDEX "_help_articles_v_blocks_video_embed_path_idx" ON "_help_articles_v_blocks_video_embed" USING btree ("_path");
  CREATE INDEX "_help_articles_v_blocks_video_embed_locale_idx" ON "_help_articles_v_blocks_video_embed" USING btree ("_locale");
  CREATE INDEX "_help_articles_v_parent_idx" ON "_help_articles_v" USING btree ("parent_id");
  CREATE INDEX "_help_articles_v_version_version_category_idx" ON "_help_articles_v" USING btree ("version_category_id");
  CREATE INDEX "_help_articles_v_version_version_popularity_idx" ON "_help_articles_v" USING btree ("version_popularity");
  CREATE INDEX "_help_articles_v_version_version_last_viewed_at_idx" ON "_help_articles_v" USING btree ("version_last_viewed_at");
  CREATE INDEX "_help_articles_v_version_seo_version_seo_og_image_idx" ON "_help_articles_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_help_articles_v_version_version_site_idx" ON "_help_articles_v" USING btree ("version_site_id");
  CREATE INDEX "_help_articles_v_version_version_locale_idx" ON "_help_articles_v" USING btree ("version_locale");
  CREATE INDEX "_help_articles_v_version_version_submitted_by_idx" ON "_help_articles_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_help_articles_v_version_version_reviewed_by_idx" ON "_help_articles_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_help_articles_v_version_version_updated_at_idx" ON "_help_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_help_articles_v_version_version_created_at_idx" ON "_help_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_help_articles_v_version_version__status_idx" ON "_help_articles_v" USING btree ("version__status");
  CREATE INDEX "_help_articles_v_created_at_idx" ON "_help_articles_v" USING btree ("created_at");
  CREATE INDEX "_help_articles_v_updated_at_idx" ON "_help_articles_v" USING btree ("updated_at");
  CREATE INDEX "_help_articles_v_snapshot_idx" ON "_help_articles_v" USING btree ("snapshot");
  CREATE INDEX "_help_articles_v_published_locale_idx" ON "_help_articles_v" USING btree ("published_locale");
  CREATE INDEX "_help_articles_v_latest_idx" ON "_help_articles_v" USING btree ("latest");
  CREATE INDEX "_help_articles_v_version_version_slug_idx" ON "_help_articles_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_help_articles_v_locales_locale_parent_id_unique" ON "_help_articles_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_help_articles_v_texts_order_parent" ON "_help_articles_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_help_articles_v_texts_locale_parent" ON "_help_articles_v_texts" USING btree ("locale","parent_id");
  CREATE INDEX "_help_articles_v_rels_order_idx" ON "_help_articles_v_rels" USING btree ("order");
  CREATE INDEX "_help_articles_v_rels_parent_idx" ON "_help_articles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_help_articles_v_rels_path_idx" ON "_help_articles_v_rels" USING btree ("path");
  CREATE INDEX "_help_articles_v_rels_help_articles_id_idx" ON "_help_articles_v_rels" USING btree ("help_articles_id");
  CREATE INDEX "videos_blocks_rich_text_order_idx" ON "videos_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "videos_blocks_rich_text_parent_id_idx" ON "videos_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "videos_blocks_rich_text_path_idx" ON "videos_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "videos_blocks_rich_text_locale_idx" ON "videos_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "videos_blocks_callout_order_idx" ON "videos_blocks_callout" USING btree ("_order");
  CREATE INDEX "videos_blocks_callout_parent_id_idx" ON "videos_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "videos_blocks_callout_path_idx" ON "videos_blocks_callout" USING btree ("_path");
  CREATE INDEX "videos_blocks_callout_locale_idx" ON "videos_blocks_callout" USING btree ("_locale");
  CREATE INDEX "videos_blocks_related_content_order_idx" ON "videos_blocks_related_content" USING btree ("_order");
  CREATE INDEX "videos_blocks_related_content_parent_id_idx" ON "videos_blocks_related_content" USING btree ("_parent_id");
  CREATE INDEX "videos_blocks_related_content_path_idx" ON "videos_blocks_related_content" USING btree ("_path");
  CREATE INDEX "videos_blocks_related_content_locale_idx" ON "videos_blocks_related_content" USING btree ("_locale");
  CREATE INDEX "videos_category_idx" ON "videos" USING btree ("category_id");
  CREATE INDEX "videos_thumbnail_idx" ON "videos" USING btree ("thumbnail_id");
  CREATE INDEX "videos_seo_seo_og_image_idx" ON "videos" USING btree ("seo_og_image_id");
  CREATE INDEX "videos_site_idx" ON "videos" USING btree ("site_id");
  CREATE INDEX "videos_locale_idx" ON "videos" USING btree ("locale");
  CREATE INDEX "videos_submitted_by_idx" ON "videos" USING btree ("submitted_by_id");
  CREATE INDEX "videos_reviewed_by_idx" ON "videos" USING btree ("reviewed_by_id");
  CREATE INDEX "videos_updated_at_idx" ON "videos" USING btree ("updated_at");
  CREATE INDEX "videos_created_at_idx" ON "videos" USING btree ("created_at");
  CREATE INDEX "videos__status_idx" ON "videos" USING btree ("_status");
  CREATE INDEX "videos_slug_idx" ON "videos_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "videos_locales_locale_parent_id_unique" ON "videos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "videos_texts_order_parent" ON "videos_texts" USING btree ("order","parent_id");
  CREATE INDEX "videos_texts_locale_parent" ON "videos_texts" USING btree ("locale","parent_id");
  CREATE INDEX "videos_rels_order_idx" ON "videos_rels" USING btree ("order");
  CREATE INDEX "videos_rels_parent_idx" ON "videos_rels" USING btree ("parent_id");
  CREATE INDEX "videos_rels_path_idx" ON "videos_rels" USING btree ("path");
  CREATE INDEX "videos_rels_locale_idx" ON "videos_rels" USING btree ("locale");
  CREATE INDEX "videos_rels_articles_id_idx" ON "videos_rels" USING btree ("articles_id","locale");
  CREATE INDEX "videos_rels_case_study_pages_id_idx" ON "videos_rels" USING btree ("case_study_pages_id","locale");
  CREATE INDEX "videos_rels_videos_id_idx" ON "videos_rels" USING btree ("videos_id","locale");
  CREATE INDEX "videos_rels_video_pages_id_idx" ON "videos_rels" USING btree ("video_pages_id","locale");
  CREATE INDEX "_videos_v_blocks_rich_text_order_idx" ON "_videos_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_videos_v_blocks_rich_text_parent_id_idx" ON "_videos_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_videos_v_blocks_rich_text_path_idx" ON "_videos_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_videos_v_blocks_rich_text_locale_idx" ON "_videos_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_videos_v_blocks_callout_order_idx" ON "_videos_v_blocks_callout" USING btree ("_order");
  CREATE INDEX "_videos_v_blocks_callout_parent_id_idx" ON "_videos_v_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "_videos_v_blocks_callout_path_idx" ON "_videos_v_blocks_callout" USING btree ("_path");
  CREATE INDEX "_videos_v_blocks_callout_locale_idx" ON "_videos_v_blocks_callout" USING btree ("_locale");
  CREATE INDEX "_videos_v_blocks_related_content_order_idx" ON "_videos_v_blocks_related_content" USING btree ("_order");
  CREATE INDEX "_videos_v_blocks_related_content_parent_id_idx" ON "_videos_v_blocks_related_content" USING btree ("_parent_id");
  CREATE INDEX "_videos_v_blocks_related_content_path_idx" ON "_videos_v_blocks_related_content" USING btree ("_path");
  CREATE INDEX "_videos_v_blocks_related_content_locale_idx" ON "_videos_v_blocks_related_content" USING btree ("_locale");
  CREATE INDEX "_videos_v_parent_idx" ON "_videos_v" USING btree ("parent_id");
  CREATE INDEX "_videos_v_version_version_category_idx" ON "_videos_v" USING btree ("version_category_id");
  CREATE INDEX "_videos_v_version_version_thumbnail_idx" ON "_videos_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_videos_v_version_seo_version_seo_og_image_idx" ON "_videos_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_videos_v_version_version_site_idx" ON "_videos_v" USING btree ("version_site_id");
  CREATE INDEX "_videos_v_version_version_locale_idx" ON "_videos_v" USING btree ("version_locale");
  CREATE INDEX "_videos_v_version_version_submitted_by_idx" ON "_videos_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_videos_v_version_version_reviewed_by_idx" ON "_videos_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_videos_v_version_version_updated_at_idx" ON "_videos_v" USING btree ("version_updated_at");
  CREATE INDEX "_videos_v_version_version_created_at_idx" ON "_videos_v" USING btree ("version_created_at");
  CREATE INDEX "_videos_v_version_version__status_idx" ON "_videos_v" USING btree ("version__status");
  CREATE INDEX "_videos_v_created_at_idx" ON "_videos_v" USING btree ("created_at");
  CREATE INDEX "_videos_v_updated_at_idx" ON "_videos_v" USING btree ("updated_at");
  CREATE INDEX "_videos_v_snapshot_idx" ON "_videos_v" USING btree ("snapshot");
  CREATE INDEX "_videos_v_published_locale_idx" ON "_videos_v" USING btree ("published_locale");
  CREATE INDEX "_videos_v_latest_idx" ON "_videos_v" USING btree ("latest");
  CREATE INDEX "_videos_v_version_version_slug_idx" ON "_videos_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_videos_v_locales_locale_parent_id_unique" ON "_videos_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_videos_v_texts_order_parent" ON "_videos_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_videos_v_texts_locale_parent" ON "_videos_v_texts" USING btree ("locale","parent_id");
  CREATE INDEX "_videos_v_rels_order_idx" ON "_videos_v_rels" USING btree ("order");
  CREATE INDEX "_videos_v_rels_parent_idx" ON "_videos_v_rels" USING btree ("parent_id");
  CREATE INDEX "_videos_v_rels_path_idx" ON "_videos_v_rels" USING btree ("path");
  CREATE INDEX "_videos_v_rels_locale_idx" ON "_videos_v_rels" USING btree ("locale");
  CREATE INDEX "_videos_v_rels_articles_id_idx" ON "_videos_v_rels" USING btree ("articles_id","locale");
  CREATE INDEX "_videos_v_rels_case_study_pages_id_idx" ON "_videos_v_rels" USING btree ("case_study_pages_id","locale");
  CREATE INDEX "_videos_v_rels_videos_id_idx" ON "_videos_v_rels" USING btree ("videos_id","locale");
  CREATE INDEX "_videos_v_rels_video_pages_id_idx" ON "_videos_v_rels" USING btree ("video_pages_id","locale");
  CREATE INDEX "pages_blocks_hero_social_proof_order_idx" ON "pages_blocks_hero_social_proof" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_social_proof_parent_id_idx" ON "pages_blocks_hero_social_proof" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_social_proof_locale_idx" ON "pages_blocks_hero_social_proof" USING btree ("_locale");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_locale_idx" ON "pages_blocks_hero" USING btree ("_locale");
  CREATE INDEX "pages_blocks_hero_background_image_idx" ON "pages_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "pages_blocks_features_items_order_idx" ON "pages_blocks_features_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_features_items_parent_id_idx" ON "pages_blocks_features_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_features_items_locale_idx" ON "pages_blocks_features_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_features_order_idx" ON "pages_blocks_features" USING btree ("_order");
  CREATE INDEX "pages_blocks_features_parent_id_idx" ON "pages_blocks_features" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_features_path_idx" ON "pages_blocks_features" USING btree ("_path");
  CREATE INDEX "pages_blocks_features_locale_idx" ON "pages_blocks_features" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_plans_features_order_idx" ON "pages_blocks_pricing_plans_features" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_plans_features_parent_id_idx" ON "pages_blocks_pricing_plans_features" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_plans_features_locale_idx" ON "pages_blocks_pricing_plans_features" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_plans_order_idx" ON "pages_blocks_pricing_plans" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_plans_parent_id_idx" ON "pages_blocks_pricing_plans" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_plans_locale_idx" ON "pages_blocks_pricing_plans" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_order_idx" ON "pages_blocks_pricing" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_parent_id_idx" ON "pages_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_path_idx" ON "pages_blocks_pricing" USING btree ("_path");
  CREATE INDEX "pages_blocks_pricing_locale_idx" ON "pages_blocks_pricing" USING btree ("_locale");
  CREATE INDEX "pages_blocks_testimonial_order_idx" ON "pages_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonial_parent_id_idx" ON "pages_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonial_path_idx" ON "pages_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonial_locale_idx" ON "pages_blocks_testimonial" USING btree ("_locale");
  CREATE INDEX "pages_blocks_testimonial_image_idx" ON "pages_blocks_testimonial" USING btree ("image_id");
  CREATE INDEX "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonials_locale_idx" ON "pages_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_locale_idx" ON "pages_blocks_cta" USING btree ("_locale");
  CREATE INDEX "pages_blocks_faq_questions_order_idx" ON "pages_blocks_faq_questions" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_questions_parent_id_idx" ON "pages_blocks_faq_questions" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_questions_locale_idx" ON "pages_blocks_faq_questions" USING btree ("_locale");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_locale_idx" ON "pages_blocks_faq" USING btree ("_locale");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_rich_text_locale_idx" ON "pages_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "pages_blocks_media_order_idx" ON "pages_blocks_media" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_parent_id_idx" ON "pages_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_path_idx" ON "pages_blocks_media" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_locale_idx" ON "pages_blocks_media" USING btree ("_locale");
  CREATE INDEX "pages_blocks_media_media_idx" ON "pages_blocks_media" USING btree ("media_id");
  CREATE INDEX "pages_blocks_articles_order_idx" ON "pages_blocks_articles" USING btree ("_order");
  CREATE INDEX "pages_blocks_articles_parent_id_idx" ON "pages_blocks_articles" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_articles_path_idx" ON "pages_blocks_articles" USING btree ("_path");
  CREATE INDEX "pages_blocks_articles_locale_idx" ON "pages_blocks_articles" USING btree ("_locale");
  CREATE INDEX "pages_blocks_case_studies_order_idx" ON "pages_blocks_case_studies" USING btree ("_order");
  CREATE INDEX "pages_blocks_case_studies_parent_id_idx" ON "pages_blocks_case_studies" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_case_studies_path_idx" ON "pages_blocks_case_studies" USING btree ("_path");
  CREATE INDEX "pages_blocks_case_studies_locale_idx" ON "pages_blocks_case_studies" USING btree ("_locale");
  CREATE INDEX "pages_blocks_offer_showcase_order_idx" ON "pages_blocks_offer_showcase" USING btree ("_order");
  CREATE INDEX "pages_blocks_offer_showcase_parent_id_idx" ON "pages_blocks_offer_showcase" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_offer_showcase_path_idx" ON "pages_blocks_offer_showcase" USING btree ("_path");
  CREATE INDEX "pages_blocks_offer_showcase_locale_idx" ON "pages_blocks_offer_showcase" USING btree ("_locale");
  CREATE INDEX "pages_blocks_newsletter_order_idx" ON "pages_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "pages_blocks_newsletter_parent_id_idx" ON "pages_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_newsletter_path_idx" ON "pages_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "pages_blocks_newsletter_locale_idx" ON "pages_blocks_newsletter" USING btree ("_locale");
  CREATE INDEX "pages_blocks_callout_order_idx" ON "pages_blocks_callout" USING btree ("_order");
  CREATE INDEX "pages_blocks_callout_parent_id_idx" ON "pages_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_callout_path_idx" ON "pages_blocks_callout" USING btree ("_path");
  CREATE INDEX "pages_blocks_callout_locale_idx" ON "pages_blocks_callout" USING btree ("_locale");
  CREATE INDEX "pages_blocks_related_content_order_idx" ON "pages_blocks_related_content" USING btree ("_order");
  CREATE INDEX "pages_blocks_related_content_parent_id_idx" ON "pages_blocks_related_content" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_related_content_path_idx" ON "pages_blocks_related_content" USING btree ("_path");
  CREATE INDEX "pages_blocks_related_content_locale_idx" ON "pages_blocks_related_content" USING btree ("_locale");
  CREATE INDEX "pages_blocks_video_embed_order_idx" ON "pages_blocks_video_embed" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_embed_parent_id_idx" ON "pages_blocks_video_embed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_embed_path_idx" ON "pages_blocks_video_embed" USING btree ("_path");
  CREATE INDEX "pages_blocks_video_embed_locale_idx" ON "pages_blocks_video_embed" USING btree ("_locale");
  CREATE INDEX "pages_blocks_locations_order_idx" ON "pages_blocks_locations" USING btree ("_order");
  CREATE INDEX "pages_blocks_locations_parent_id_idx" ON "pages_blocks_locations" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_locations_path_idx" ON "pages_blocks_locations" USING btree ("_path");
  CREATE INDEX "pages_blocks_locations_locale_idx" ON "pages_blocks_locations" USING btree ("_locale");
  CREATE INDEX "pages_blocks_team_members_order_idx" ON "pages_blocks_team_members" USING btree ("_order");
  CREATE INDEX "pages_blocks_team_members_parent_id_idx" ON "pages_blocks_team_members" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_team_members_path_idx" ON "pages_blocks_team_members" USING btree ("_path");
  CREATE INDEX "pages_blocks_team_members_locale_idx" ON "pages_blocks_team_members" USING btree ("_locale");
  CREATE INDEX "pages_blocks_trust_feed_reviews_order_idx" ON "pages_blocks_trust_feed_reviews" USING btree ("_order");
  CREATE INDEX "pages_blocks_trust_feed_reviews_parent_id_idx" ON "pages_blocks_trust_feed_reviews" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_trust_feed_reviews_locale_idx" ON "pages_blocks_trust_feed_reviews" USING btree ("_locale");
  CREATE INDEX "pages_blocks_trust_feed_order_idx" ON "pages_blocks_trust_feed" USING btree ("_order");
  CREATE INDEX "pages_blocks_trust_feed_parent_id_idx" ON "pages_blocks_trust_feed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_trust_feed_path_idx" ON "pages_blocks_trust_feed" USING btree ("_path");
  CREATE INDEX "pages_blocks_trust_feed_locale_idx" ON "pages_blocks_trust_feed" USING btree ("_locale");
  CREATE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_site_idx" ON "pages" USING btree ("site_id");
  CREATE INDEX "pages_locale_idx" ON "pages" USING btree ("locale");
  CREATE INDEX "pages_seo_seo_image_idx" ON "pages" USING btree ("seo_image_id");
  CREATE INDEX "pages_promotion_run_marker_idx" ON "pages" USING btree ("promotion_run_marker");
  CREATE INDEX "pages_submitted_by_idx" ON "pages" USING btree ("submitted_by_id");
  CREATE INDEX "pages_reviewed_by_idx" ON "pages" USING btree ("reviewed_by_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_locale_idx" ON "pages_rels" USING btree ("locale");
  CREATE INDEX "pages_rels_testimonials_id_idx" ON "pages_rels" USING btree ("testimonials_id","locale");
  CREATE INDEX "pages_rels_articles_id_idx" ON "pages_rels" USING btree ("articles_id","locale");
  CREATE INDEX "pages_rels_case_study_pages_id_idx" ON "pages_rels" USING btree ("case_study_pages_id","locale");
  CREATE INDEX "pages_rels_offer_pages_id_idx" ON "pages_rels" USING btree ("offer_pages_id","locale");
  CREATE INDEX "pages_rels_videos_id_idx" ON "pages_rels" USING btree ("videos_id","locale");
  CREATE INDEX "pages_rels_video_pages_id_idx" ON "pages_rels" USING btree ("video_pages_id","locale");
  CREATE INDEX "pages_rels_locations_id_idx" ON "pages_rels" USING btree ("locations_id","locale");
  CREATE INDEX "pages_rels_team_members_id_idx" ON "pages_rels" USING btree ("team_members_id","locale");
  CREATE INDEX "_pages_v_blocks_hero_social_proof_order_idx" ON "_pages_v_blocks_hero_social_proof" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_social_proof_parent_id_idx" ON "_pages_v_blocks_hero_social_proof" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_social_proof_locale_idx" ON "_pages_v_blocks_hero_social_proof" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_locale_idx" ON "_pages_v_blocks_hero" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_hero_background_image_idx" ON "_pages_v_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "_pages_v_blocks_features_items_order_idx" ON "_pages_v_blocks_features_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_features_items_parent_id_idx" ON "_pages_v_blocks_features_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_features_items_locale_idx" ON "_pages_v_blocks_features_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_features_order_idx" ON "_pages_v_blocks_features" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_features_parent_id_idx" ON "_pages_v_blocks_features" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_features_path_idx" ON "_pages_v_blocks_features" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_features_locale_idx" ON "_pages_v_blocks_features" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_plans_features_order_idx" ON "_pages_v_blocks_pricing_plans_features" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_plans_features_parent_id_idx" ON "_pages_v_blocks_pricing_plans_features" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_plans_features_locale_idx" ON "_pages_v_blocks_pricing_plans_features" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_plans_order_idx" ON "_pages_v_blocks_pricing_plans" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_plans_parent_id_idx" ON "_pages_v_blocks_pricing_plans" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_plans_locale_idx" ON "_pages_v_blocks_pricing_plans" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_order_idx" ON "_pages_v_blocks_pricing" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_parent_id_idx" ON "_pages_v_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_path_idx" ON "_pages_v_blocks_pricing" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_pricing_locale_idx" ON "_pages_v_blocks_pricing" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_testimonial_order_idx" ON "_pages_v_blocks_testimonial" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonial_parent_id_idx" ON "_pages_v_blocks_testimonial" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonial_path_idx" ON "_pages_v_blocks_testimonial" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonial_locale_idx" ON "_pages_v_blocks_testimonial" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_testimonial_image_idx" ON "_pages_v_blocks_testimonial" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_testimonials_order_idx" ON "_pages_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_path_idx" ON "_pages_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonials_locale_idx" ON "_pages_v_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_locale_idx" ON "_pages_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_faq_questions_order_idx" ON "_pages_v_blocks_faq_questions" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_questions_parent_id_idx" ON "_pages_v_blocks_faq_questions" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_questions_locale_idx" ON "_pages_v_blocks_faq_questions" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_locale_idx" ON "_pages_v_blocks_faq" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_rich_text_locale_idx" ON "_pages_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_media_order_idx" ON "_pages_v_blocks_media" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_parent_id_idx" ON "_pages_v_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_path_idx" ON "_pages_v_blocks_media" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_locale_idx" ON "_pages_v_blocks_media" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_media_media_idx" ON "_pages_v_blocks_media" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_articles_order_idx" ON "_pages_v_blocks_articles" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_articles_parent_id_idx" ON "_pages_v_blocks_articles" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_articles_path_idx" ON "_pages_v_blocks_articles" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_articles_locale_idx" ON "_pages_v_blocks_articles" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_case_studies_order_idx" ON "_pages_v_blocks_case_studies" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_case_studies_parent_id_idx" ON "_pages_v_blocks_case_studies" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_case_studies_path_idx" ON "_pages_v_blocks_case_studies" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_case_studies_locale_idx" ON "_pages_v_blocks_case_studies" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_offer_showcase_order_idx" ON "_pages_v_blocks_offer_showcase" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_offer_showcase_parent_id_idx" ON "_pages_v_blocks_offer_showcase" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_offer_showcase_path_idx" ON "_pages_v_blocks_offer_showcase" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_offer_showcase_locale_idx" ON "_pages_v_blocks_offer_showcase" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_newsletter_order_idx" ON "_pages_v_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_newsletter_parent_id_idx" ON "_pages_v_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_newsletter_path_idx" ON "_pages_v_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_newsletter_locale_idx" ON "_pages_v_blocks_newsletter" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_callout_order_idx" ON "_pages_v_blocks_callout" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_callout_parent_id_idx" ON "_pages_v_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_callout_path_idx" ON "_pages_v_blocks_callout" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_callout_locale_idx" ON "_pages_v_blocks_callout" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_related_content_order_idx" ON "_pages_v_blocks_related_content" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_related_content_parent_id_idx" ON "_pages_v_blocks_related_content" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_related_content_path_idx" ON "_pages_v_blocks_related_content" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_related_content_locale_idx" ON "_pages_v_blocks_related_content" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_video_embed_order_idx" ON "_pages_v_blocks_video_embed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_video_embed_parent_id_idx" ON "_pages_v_blocks_video_embed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_embed_path_idx" ON "_pages_v_blocks_video_embed" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_video_embed_locale_idx" ON "_pages_v_blocks_video_embed" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_locations_order_idx" ON "_pages_v_blocks_locations" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_locations_parent_id_idx" ON "_pages_v_blocks_locations" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_locations_path_idx" ON "_pages_v_blocks_locations" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_locations_locale_idx" ON "_pages_v_blocks_locations" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_team_members_order_idx" ON "_pages_v_blocks_team_members" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_team_members_parent_id_idx" ON "_pages_v_blocks_team_members" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_team_members_path_idx" ON "_pages_v_blocks_team_members" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_team_members_locale_idx" ON "_pages_v_blocks_team_members" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_trust_feed_reviews_order_idx" ON "_pages_v_blocks_trust_feed_reviews" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_trust_feed_reviews_parent_id_idx" ON "_pages_v_blocks_trust_feed_reviews" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_trust_feed_reviews_locale_idx" ON "_pages_v_blocks_trust_feed_reviews" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_trust_feed_order_idx" ON "_pages_v_blocks_trust_feed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_trust_feed_parent_id_idx" ON "_pages_v_blocks_trust_feed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_trust_feed_path_idx" ON "_pages_v_blocks_trust_feed" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_trust_feed_locale_idx" ON "_pages_v_blocks_trust_feed" USING btree ("_locale");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_site_idx" ON "_pages_v" USING btree ("version_site_id");
  CREATE INDEX "_pages_v_version_version_locale_idx" ON "_pages_v" USING btree ("version_locale");
  CREATE INDEX "_pages_v_version_seo_version_seo_image_idx" ON "_pages_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_pages_v_version_version_promotion_run_marker_idx" ON "_pages_v" USING btree ("version_promotion_run_marker");
  CREATE INDEX "_pages_v_version_version_submitted_by_idx" ON "_pages_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_pages_v_version_version_reviewed_by_idx" ON "_pages_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_locale_idx" ON "_pages_v_rels" USING btree ("locale");
  CREATE INDEX "_pages_v_rels_testimonials_id_idx" ON "_pages_v_rels" USING btree ("testimonials_id","locale");
  CREATE INDEX "_pages_v_rels_articles_id_idx" ON "_pages_v_rels" USING btree ("articles_id","locale");
  CREATE INDEX "_pages_v_rels_case_study_pages_id_idx" ON "_pages_v_rels" USING btree ("case_study_pages_id","locale");
  CREATE INDEX "_pages_v_rels_offer_pages_id_idx" ON "_pages_v_rels" USING btree ("offer_pages_id","locale");
  CREATE INDEX "_pages_v_rels_videos_id_idx" ON "_pages_v_rels" USING btree ("videos_id","locale");
  CREATE INDEX "_pages_v_rels_video_pages_id_idx" ON "_pages_v_rels" USING btree ("video_pages_id","locale");
  CREATE INDEX "_pages_v_rels_locations_id_idx" ON "_pages_v_rels" USING btree ("locations_id","locale");
  CREATE INDEX "_pages_v_rels_team_members_id_idx" ON "_pages_v_rels" USING btree ("team_members_id","locale");
  CREATE INDEX "offer_pages_blocks_hero_social_proof_order_idx" ON "offer_pages_blocks_hero_social_proof" USING btree ("_order");
  CREATE INDEX "offer_pages_blocks_hero_social_proof_parent_id_idx" ON "offer_pages_blocks_hero_social_proof" USING btree ("_parent_id");
  CREATE INDEX "offer_pages_blocks_hero_social_proof_locale_idx" ON "offer_pages_blocks_hero_social_proof" USING btree ("_locale");
  CREATE INDEX "offer_pages_blocks_hero_order_idx" ON "offer_pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "offer_pages_blocks_hero_parent_id_idx" ON "offer_pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "offer_pages_blocks_hero_path_idx" ON "offer_pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "offer_pages_blocks_hero_locale_idx" ON "offer_pages_blocks_hero" USING btree ("_locale");
  CREATE INDEX "offer_pages_blocks_hero_background_image_idx" ON "offer_pages_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "offer_pages_blocks_rich_text_order_idx" ON "offer_pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "offer_pages_blocks_rich_text_parent_id_idx" ON "offer_pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "offer_pages_blocks_rich_text_path_idx" ON "offer_pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "offer_pages_blocks_rich_text_locale_idx" ON "offer_pages_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "offer_pages_blocks_media_order_idx" ON "offer_pages_blocks_media" USING btree ("_order");
  CREATE INDEX "offer_pages_blocks_media_parent_id_idx" ON "offer_pages_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "offer_pages_blocks_media_path_idx" ON "offer_pages_blocks_media" USING btree ("_path");
  CREATE INDEX "offer_pages_blocks_media_locale_idx" ON "offer_pages_blocks_media" USING btree ("_locale");
  CREATE INDEX "offer_pages_blocks_media_media_idx" ON "offer_pages_blocks_media" USING btree ("media_id");
  CREATE INDEX "offer_pages_blocks_cta_order_idx" ON "offer_pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "offer_pages_blocks_cta_parent_id_idx" ON "offer_pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "offer_pages_blocks_cta_path_idx" ON "offer_pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "offer_pages_blocks_cta_locale_idx" ON "offer_pages_blocks_cta" USING btree ("_locale");
  CREATE INDEX "offer_pages_category_idx" ON "offer_pages" USING btree ("category_id");
  CREATE INDEX "offer_pages_featured_image_idx" ON "offer_pages" USING btree ("featured_image_id");
  CREATE INDEX "offer_pages_seo_seo_og_image_idx" ON "offer_pages" USING btree ("seo_og_image_id");
  CREATE INDEX "offer_pages_site_idx" ON "offer_pages" USING btree ("site_id");
  CREATE INDEX "offer_pages_locale_idx" ON "offer_pages" USING btree ("locale");
  CREATE INDEX "offer_pages_submitted_by_idx" ON "offer_pages" USING btree ("submitted_by_id");
  CREATE INDEX "offer_pages_reviewed_by_idx" ON "offer_pages" USING btree ("reviewed_by_id");
  CREATE INDEX "offer_pages_updated_at_idx" ON "offer_pages" USING btree ("updated_at");
  CREATE INDEX "offer_pages_created_at_idx" ON "offer_pages" USING btree ("created_at");
  CREATE INDEX "offer_pages__status_idx" ON "offer_pages" USING btree ("_status");
  CREATE INDEX "offer_pages_slug_idx" ON "offer_pages_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "offer_pages_locales_locale_parent_id_unique" ON "offer_pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_offer_pages_v_blocks_hero_social_proof_order_idx" ON "_offer_pages_v_blocks_hero_social_proof" USING btree ("_order");
  CREATE INDEX "_offer_pages_v_blocks_hero_social_proof_parent_id_idx" ON "_offer_pages_v_blocks_hero_social_proof" USING btree ("_parent_id");
  CREATE INDEX "_offer_pages_v_blocks_hero_social_proof_locale_idx" ON "_offer_pages_v_blocks_hero_social_proof" USING btree ("_locale");
  CREATE INDEX "_offer_pages_v_blocks_hero_order_idx" ON "_offer_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_offer_pages_v_blocks_hero_parent_id_idx" ON "_offer_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_offer_pages_v_blocks_hero_path_idx" ON "_offer_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_offer_pages_v_blocks_hero_locale_idx" ON "_offer_pages_v_blocks_hero" USING btree ("_locale");
  CREATE INDEX "_offer_pages_v_blocks_hero_background_image_idx" ON "_offer_pages_v_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "_offer_pages_v_blocks_rich_text_order_idx" ON "_offer_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_offer_pages_v_blocks_rich_text_parent_id_idx" ON "_offer_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_offer_pages_v_blocks_rich_text_path_idx" ON "_offer_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_offer_pages_v_blocks_rich_text_locale_idx" ON "_offer_pages_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_offer_pages_v_blocks_media_order_idx" ON "_offer_pages_v_blocks_media" USING btree ("_order");
  CREATE INDEX "_offer_pages_v_blocks_media_parent_id_idx" ON "_offer_pages_v_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "_offer_pages_v_blocks_media_path_idx" ON "_offer_pages_v_blocks_media" USING btree ("_path");
  CREATE INDEX "_offer_pages_v_blocks_media_locale_idx" ON "_offer_pages_v_blocks_media" USING btree ("_locale");
  CREATE INDEX "_offer_pages_v_blocks_media_media_idx" ON "_offer_pages_v_blocks_media" USING btree ("media_id");
  CREATE INDEX "_offer_pages_v_blocks_cta_order_idx" ON "_offer_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_offer_pages_v_blocks_cta_parent_id_idx" ON "_offer_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_offer_pages_v_blocks_cta_path_idx" ON "_offer_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_offer_pages_v_blocks_cta_locale_idx" ON "_offer_pages_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_offer_pages_v_parent_idx" ON "_offer_pages_v" USING btree ("parent_id");
  CREATE INDEX "_offer_pages_v_version_version_category_idx" ON "_offer_pages_v" USING btree ("version_category_id");
  CREATE INDEX "_offer_pages_v_version_version_featured_image_idx" ON "_offer_pages_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_offer_pages_v_version_seo_version_seo_og_image_idx" ON "_offer_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_offer_pages_v_version_version_site_idx" ON "_offer_pages_v" USING btree ("version_site_id");
  CREATE INDEX "_offer_pages_v_version_version_locale_idx" ON "_offer_pages_v" USING btree ("version_locale");
  CREATE INDEX "_offer_pages_v_version_version_submitted_by_idx" ON "_offer_pages_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_offer_pages_v_version_version_reviewed_by_idx" ON "_offer_pages_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_offer_pages_v_version_version_updated_at_idx" ON "_offer_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_offer_pages_v_version_version_created_at_idx" ON "_offer_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_offer_pages_v_version_version__status_idx" ON "_offer_pages_v" USING btree ("version__status");
  CREATE INDEX "_offer_pages_v_created_at_idx" ON "_offer_pages_v" USING btree ("created_at");
  CREATE INDEX "_offer_pages_v_updated_at_idx" ON "_offer_pages_v" USING btree ("updated_at");
  CREATE INDEX "_offer_pages_v_snapshot_idx" ON "_offer_pages_v" USING btree ("snapshot");
  CREATE INDEX "_offer_pages_v_published_locale_idx" ON "_offer_pages_v" USING btree ("published_locale");
  CREATE INDEX "_offer_pages_v_latest_idx" ON "_offer_pages_v" USING btree ("latest");
  CREATE INDEX "_offer_pages_v_version_version_slug_idx" ON "_offer_pages_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_offer_pages_v_locales_locale_parent_id_unique" ON "_offer_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "case_study_pages_results_order_idx" ON "case_study_pages_results" USING btree ("_order");
  CREATE INDEX "case_study_pages_results_parent_id_idx" ON "case_study_pages_results" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "case_study_pages_results_locales_locale_parent_id_unique" ON "case_study_pages_results_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "case_study_pages_blocks_hero_social_proof_order_idx" ON "case_study_pages_blocks_hero_social_proof" USING btree ("_order");
  CREATE INDEX "case_study_pages_blocks_hero_social_proof_parent_id_idx" ON "case_study_pages_blocks_hero_social_proof" USING btree ("_parent_id");
  CREATE INDEX "case_study_pages_blocks_hero_social_proof_locale_idx" ON "case_study_pages_blocks_hero_social_proof" USING btree ("_locale");
  CREATE INDEX "case_study_pages_blocks_hero_order_idx" ON "case_study_pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "case_study_pages_blocks_hero_parent_id_idx" ON "case_study_pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "case_study_pages_blocks_hero_path_idx" ON "case_study_pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "case_study_pages_blocks_hero_locale_idx" ON "case_study_pages_blocks_hero" USING btree ("_locale");
  CREATE INDEX "case_study_pages_blocks_hero_background_image_idx" ON "case_study_pages_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "case_study_pages_blocks_rich_text_order_idx" ON "case_study_pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "case_study_pages_blocks_rich_text_parent_id_idx" ON "case_study_pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "case_study_pages_blocks_rich_text_path_idx" ON "case_study_pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "case_study_pages_blocks_rich_text_locale_idx" ON "case_study_pages_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "case_study_pages_blocks_media_order_idx" ON "case_study_pages_blocks_media" USING btree ("_order");
  CREATE INDEX "case_study_pages_blocks_media_parent_id_idx" ON "case_study_pages_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "case_study_pages_blocks_media_path_idx" ON "case_study_pages_blocks_media" USING btree ("_path");
  CREATE INDEX "case_study_pages_blocks_media_locale_idx" ON "case_study_pages_blocks_media" USING btree ("_locale");
  CREATE INDEX "case_study_pages_blocks_media_media_idx" ON "case_study_pages_blocks_media" USING btree ("media_id");
  CREATE INDEX "case_study_pages_blocks_callout_order_idx" ON "case_study_pages_blocks_callout" USING btree ("_order");
  CREATE INDEX "case_study_pages_blocks_callout_parent_id_idx" ON "case_study_pages_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "case_study_pages_blocks_callout_path_idx" ON "case_study_pages_blocks_callout" USING btree ("_path");
  CREATE INDEX "case_study_pages_blocks_callout_locale_idx" ON "case_study_pages_blocks_callout" USING btree ("_locale");
  CREATE INDEX "case_study_pages_category_idx" ON "case_study_pages" USING btree ("category_id");
  CREATE INDEX "case_study_pages_featured_image_idx" ON "case_study_pages" USING btree ("featured_image_id");
  CREATE INDEX "case_study_pages_seo_seo_og_image_idx" ON "case_study_pages" USING btree ("seo_og_image_id");
  CREATE INDEX "case_study_pages_site_idx" ON "case_study_pages" USING btree ("site_id");
  CREATE INDEX "case_study_pages_locale_idx" ON "case_study_pages" USING btree ("locale");
  CREATE INDEX "case_study_pages_submitted_by_idx" ON "case_study_pages" USING btree ("submitted_by_id");
  CREATE INDEX "case_study_pages_reviewed_by_idx" ON "case_study_pages" USING btree ("reviewed_by_id");
  CREATE INDEX "case_study_pages_updated_at_idx" ON "case_study_pages" USING btree ("updated_at");
  CREATE INDEX "case_study_pages_created_at_idx" ON "case_study_pages" USING btree ("created_at");
  CREATE INDEX "case_study_pages__status_idx" ON "case_study_pages" USING btree ("_status");
  CREATE INDEX "case_study_pages_slug_idx" ON "case_study_pages_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "case_study_pages_locales_locale_parent_id_unique" ON "case_study_pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_case_study_pages_v_version_results_order_idx" ON "_case_study_pages_v_version_results" USING btree ("_order");
  CREATE INDEX "_case_study_pages_v_version_results_parent_id_idx" ON "_case_study_pages_v_version_results" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_case_study_pages_v_version_results_locales_locale_parent_id" ON "_case_study_pages_v_version_results_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_case_study_pages_v_blocks_hero_social_proof_order_idx" ON "_case_study_pages_v_blocks_hero_social_proof" USING btree ("_order");
  CREATE INDEX "_case_study_pages_v_blocks_hero_social_proof_parent_id_idx" ON "_case_study_pages_v_blocks_hero_social_proof" USING btree ("_parent_id");
  CREATE INDEX "_case_study_pages_v_blocks_hero_social_proof_locale_idx" ON "_case_study_pages_v_blocks_hero_social_proof" USING btree ("_locale");
  CREATE INDEX "_case_study_pages_v_blocks_hero_order_idx" ON "_case_study_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_case_study_pages_v_blocks_hero_parent_id_idx" ON "_case_study_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_case_study_pages_v_blocks_hero_path_idx" ON "_case_study_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_case_study_pages_v_blocks_hero_locale_idx" ON "_case_study_pages_v_blocks_hero" USING btree ("_locale");
  CREATE INDEX "_case_study_pages_v_blocks_hero_background_image_idx" ON "_case_study_pages_v_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "_case_study_pages_v_blocks_rich_text_order_idx" ON "_case_study_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_case_study_pages_v_blocks_rich_text_parent_id_idx" ON "_case_study_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_case_study_pages_v_blocks_rich_text_path_idx" ON "_case_study_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_case_study_pages_v_blocks_rich_text_locale_idx" ON "_case_study_pages_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_case_study_pages_v_blocks_media_order_idx" ON "_case_study_pages_v_blocks_media" USING btree ("_order");
  CREATE INDEX "_case_study_pages_v_blocks_media_parent_id_idx" ON "_case_study_pages_v_blocks_media" USING btree ("_parent_id");
  CREATE INDEX "_case_study_pages_v_blocks_media_path_idx" ON "_case_study_pages_v_blocks_media" USING btree ("_path");
  CREATE INDEX "_case_study_pages_v_blocks_media_locale_idx" ON "_case_study_pages_v_blocks_media" USING btree ("_locale");
  CREATE INDEX "_case_study_pages_v_blocks_media_media_idx" ON "_case_study_pages_v_blocks_media" USING btree ("media_id");
  CREATE INDEX "_case_study_pages_v_blocks_callout_order_idx" ON "_case_study_pages_v_blocks_callout" USING btree ("_order");
  CREATE INDEX "_case_study_pages_v_blocks_callout_parent_id_idx" ON "_case_study_pages_v_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "_case_study_pages_v_blocks_callout_path_idx" ON "_case_study_pages_v_blocks_callout" USING btree ("_path");
  CREATE INDEX "_case_study_pages_v_blocks_callout_locale_idx" ON "_case_study_pages_v_blocks_callout" USING btree ("_locale");
  CREATE INDEX "_case_study_pages_v_parent_idx" ON "_case_study_pages_v" USING btree ("parent_id");
  CREATE INDEX "_case_study_pages_v_version_version_category_idx" ON "_case_study_pages_v" USING btree ("version_category_id");
  CREATE INDEX "_case_study_pages_v_version_version_featured_image_idx" ON "_case_study_pages_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_case_study_pages_v_version_seo_version_seo_og_image_idx" ON "_case_study_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_case_study_pages_v_version_version_site_idx" ON "_case_study_pages_v" USING btree ("version_site_id");
  CREATE INDEX "_case_study_pages_v_version_version_locale_idx" ON "_case_study_pages_v" USING btree ("version_locale");
  CREATE INDEX "_case_study_pages_v_version_version_submitted_by_idx" ON "_case_study_pages_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_case_study_pages_v_version_version_reviewed_by_idx" ON "_case_study_pages_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_case_study_pages_v_version_version_updated_at_idx" ON "_case_study_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_case_study_pages_v_version_version_created_at_idx" ON "_case_study_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_case_study_pages_v_version_version__status_idx" ON "_case_study_pages_v" USING btree ("version__status");
  CREATE INDEX "_case_study_pages_v_created_at_idx" ON "_case_study_pages_v" USING btree ("created_at");
  CREATE INDEX "_case_study_pages_v_updated_at_idx" ON "_case_study_pages_v" USING btree ("updated_at");
  CREATE INDEX "_case_study_pages_v_snapshot_idx" ON "_case_study_pages_v" USING btree ("snapshot");
  CREATE INDEX "_case_study_pages_v_published_locale_idx" ON "_case_study_pages_v" USING btree ("published_locale");
  CREATE INDEX "_case_study_pages_v_latest_idx" ON "_case_study_pages_v" USING btree ("latest");
  CREATE INDEX "_case_study_pages_v_version_version_slug_idx" ON "_case_study_pages_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_case_study_pages_v_locales_locale_parent_id_unique" ON "_case_study_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "video_pages_blocks_rich_text_order_idx" ON "video_pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "video_pages_blocks_rich_text_parent_id_idx" ON "video_pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "video_pages_blocks_rich_text_path_idx" ON "video_pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "video_pages_blocks_rich_text_locale_idx" ON "video_pages_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "video_pages_blocks_related_content_order_idx" ON "video_pages_blocks_related_content" USING btree ("_order");
  CREATE INDEX "video_pages_blocks_related_content_parent_id_idx" ON "video_pages_blocks_related_content" USING btree ("_parent_id");
  CREATE INDEX "video_pages_blocks_related_content_path_idx" ON "video_pages_blocks_related_content" USING btree ("_path");
  CREATE INDEX "video_pages_blocks_related_content_locale_idx" ON "video_pages_blocks_related_content" USING btree ("_locale");
  CREATE UNIQUE INDEX "video_pages_youtube_id_idx" ON "video_pages" USING btree ("youtube_id");
  CREATE INDEX "video_pages_category_idx" ON "video_pages" USING btree ("category_id");
  CREATE INDEX "video_pages_seo_seo_og_image_idx" ON "video_pages" USING btree ("seo_og_image_id");
  CREATE INDEX "video_pages_site_idx" ON "video_pages" USING btree ("site_id");
  CREATE INDEX "video_pages_locale_idx" ON "video_pages" USING btree ("locale");
  CREATE INDEX "video_pages_submitted_by_idx" ON "video_pages" USING btree ("submitted_by_id");
  CREATE INDEX "video_pages_reviewed_by_idx" ON "video_pages" USING btree ("reviewed_by_id");
  CREATE INDEX "video_pages_updated_at_idx" ON "video_pages" USING btree ("updated_at");
  CREATE INDEX "video_pages_created_at_idx" ON "video_pages" USING btree ("created_at");
  CREATE INDEX "video_pages__status_idx" ON "video_pages" USING btree ("_status");
  CREATE INDEX "video_pages_slug_idx" ON "video_pages_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "video_pages_locales_locale_parent_id_unique" ON "video_pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "video_pages_texts_order_parent" ON "video_pages_texts" USING btree ("order","parent_id");
  CREATE INDEX "video_pages_texts_locale_parent" ON "video_pages_texts" USING btree ("locale","parent_id");
  CREATE INDEX "video_pages_rels_order_idx" ON "video_pages_rels" USING btree ("order");
  CREATE INDEX "video_pages_rels_parent_idx" ON "video_pages_rels" USING btree ("parent_id");
  CREATE INDEX "video_pages_rels_path_idx" ON "video_pages_rels" USING btree ("path");
  CREATE INDEX "video_pages_rels_locale_idx" ON "video_pages_rels" USING btree ("locale");
  CREATE INDEX "video_pages_rels_articles_id_idx" ON "video_pages_rels" USING btree ("articles_id","locale");
  CREATE INDEX "video_pages_rels_case_study_pages_id_idx" ON "video_pages_rels" USING btree ("case_study_pages_id","locale");
  CREATE INDEX "video_pages_rels_videos_id_idx" ON "video_pages_rels" USING btree ("videos_id","locale");
  CREATE INDEX "video_pages_rels_video_pages_id_idx" ON "video_pages_rels" USING btree ("video_pages_id","locale");
  CREATE INDEX "_video_pages_v_blocks_rich_text_order_idx" ON "_video_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_video_pages_v_blocks_rich_text_parent_id_idx" ON "_video_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_video_pages_v_blocks_rich_text_path_idx" ON "_video_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_video_pages_v_blocks_rich_text_locale_idx" ON "_video_pages_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_video_pages_v_blocks_related_content_order_idx" ON "_video_pages_v_blocks_related_content" USING btree ("_order");
  CREATE INDEX "_video_pages_v_blocks_related_content_parent_id_idx" ON "_video_pages_v_blocks_related_content" USING btree ("_parent_id");
  CREATE INDEX "_video_pages_v_blocks_related_content_path_idx" ON "_video_pages_v_blocks_related_content" USING btree ("_path");
  CREATE INDEX "_video_pages_v_blocks_related_content_locale_idx" ON "_video_pages_v_blocks_related_content" USING btree ("_locale");
  CREATE INDEX "_video_pages_v_parent_idx" ON "_video_pages_v" USING btree ("parent_id");
  CREATE INDEX "_video_pages_v_version_version_youtube_id_idx" ON "_video_pages_v" USING btree ("version_youtube_id");
  CREATE INDEX "_video_pages_v_version_version_category_idx" ON "_video_pages_v" USING btree ("version_category_id");
  CREATE INDEX "_video_pages_v_version_seo_version_seo_og_image_idx" ON "_video_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_video_pages_v_version_version_site_idx" ON "_video_pages_v" USING btree ("version_site_id");
  CREATE INDEX "_video_pages_v_version_version_locale_idx" ON "_video_pages_v" USING btree ("version_locale");
  CREATE INDEX "_video_pages_v_version_version_submitted_by_idx" ON "_video_pages_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_video_pages_v_version_version_reviewed_by_idx" ON "_video_pages_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_video_pages_v_version_version_updated_at_idx" ON "_video_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_video_pages_v_version_version_created_at_idx" ON "_video_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_video_pages_v_version_version__status_idx" ON "_video_pages_v" USING btree ("version__status");
  CREATE INDEX "_video_pages_v_created_at_idx" ON "_video_pages_v" USING btree ("created_at");
  CREATE INDEX "_video_pages_v_updated_at_idx" ON "_video_pages_v" USING btree ("updated_at");
  CREATE INDEX "_video_pages_v_snapshot_idx" ON "_video_pages_v" USING btree ("snapshot");
  CREATE INDEX "_video_pages_v_published_locale_idx" ON "_video_pages_v" USING btree ("published_locale");
  CREATE INDEX "_video_pages_v_latest_idx" ON "_video_pages_v" USING btree ("latest");
  CREATE INDEX "_video_pages_v_version_version_slug_idx" ON "_video_pages_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_video_pages_v_locales_locale_parent_id_unique" ON "_video_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_video_pages_v_texts_order_parent" ON "_video_pages_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_video_pages_v_texts_locale_parent" ON "_video_pages_v_texts" USING btree ("locale","parent_id");
  CREATE INDEX "_video_pages_v_rels_order_idx" ON "_video_pages_v_rels" USING btree ("order");
  CREATE INDEX "_video_pages_v_rels_parent_idx" ON "_video_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_video_pages_v_rels_path_idx" ON "_video_pages_v_rels" USING btree ("path");
  CREATE INDEX "_video_pages_v_rels_locale_idx" ON "_video_pages_v_rels" USING btree ("locale");
  CREATE INDEX "_video_pages_v_rels_articles_id_idx" ON "_video_pages_v_rels" USING btree ("articles_id","locale");
  CREATE INDEX "_video_pages_v_rels_case_study_pages_id_idx" ON "_video_pages_v_rels" USING btree ("case_study_pages_id","locale");
  CREATE INDEX "_video_pages_v_rels_videos_id_idx" ON "_video_pages_v_rels" USING btree ("videos_id","locale");
  CREATE INDEX "_video_pages_v_rels_video_pages_id_idx" ON "_video_pages_v_rels" USING btree ("video_pages_id","locale");
  CREATE INDEX "faq_pages_blocks_hero_social_proof_order_idx" ON "faq_pages_blocks_hero_social_proof" USING btree ("_order");
  CREATE INDEX "faq_pages_blocks_hero_social_proof_parent_id_idx" ON "faq_pages_blocks_hero_social_proof" USING btree ("_parent_id");
  CREATE INDEX "faq_pages_blocks_hero_social_proof_locale_idx" ON "faq_pages_blocks_hero_social_proof" USING btree ("_locale");
  CREATE INDEX "faq_pages_blocks_hero_order_idx" ON "faq_pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "faq_pages_blocks_hero_parent_id_idx" ON "faq_pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "faq_pages_blocks_hero_path_idx" ON "faq_pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "faq_pages_blocks_hero_locale_idx" ON "faq_pages_blocks_hero" USING btree ("_locale");
  CREATE INDEX "faq_pages_blocks_hero_background_image_idx" ON "faq_pages_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "faq_pages_blocks_faq_questions_order_idx" ON "faq_pages_blocks_faq_questions" USING btree ("_order");
  CREATE INDEX "faq_pages_blocks_faq_questions_parent_id_idx" ON "faq_pages_blocks_faq_questions" USING btree ("_parent_id");
  CREATE INDEX "faq_pages_blocks_faq_questions_locale_idx" ON "faq_pages_blocks_faq_questions" USING btree ("_locale");
  CREATE INDEX "faq_pages_blocks_faq_order_idx" ON "faq_pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "faq_pages_blocks_faq_parent_id_idx" ON "faq_pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "faq_pages_blocks_faq_path_idx" ON "faq_pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "faq_pages_blocks_faq_locale_idx" ON "faq_pages_blocks_faq" USING btree ("_locale");
  CREATE INDEX "faq_pages_seo_seo_og_image_idx" ON "faq_pages" USING btree ("seo_og_image_id");
  CREATE INDEX "faq_pages_site_idx" ON "faq_pages" USING btree ("site_id");
  CREATE INDEX "faq_pages_locale_idx" ON "faq_pages" USING btree ("locale");
  CREATE INDEX "faq_pages_submitted_by_idx" ON "faq_pages" USING btree ("submitted_by_id");
  CREATE INDEX "faq_pages_reviewed_by_idx" ON "faq_pages" USING btree ("reviewed_by_id");
  CREATE INDEX "faq_pages_updated_at_idx" ON "faq_pages" USING btree ("updated_at");
  CREATE INDEX "faq_pages_created_at_idx" ON "faq_pages" USING btree ("created_at");
  CREATE INDEX "faq_pages__status_idx" ON "faq_pages" USING btree ("_status");
  CREATE INDEX "faq_pages_slug_idx" ON "faq_pages_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "faq_pages_locales_locale_parent_id_unique" ON "faq_pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_faq_pages_v_blocks_hero_social_proof_order_idx" ON "_faq_pages_v_blocks_hero_social_proof" USING btree ("_order");
  CREATE INDEX "_faq_pages_v_blocks_hero_social_proof_parent_id_idx" ON "_faq_pages_v_blocks_hero_social_proof" USING btree ("_parent_id");
  CREATE INDEX "_faq_pages_v_blocks_hero_social_proof_locale_idx" ON "_faq_pages_v_blocks_hero_social_proof" USING btree ("_locale");
  CREATE INDEX "_faq_pages_v_blocks_hero_order_idx" ON "_faq_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_faq_pages_v_blocks_hero_parent_id_idx" ON "_faq_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_faq_pages_v_blocks_hero_path_idx" ON "_faq_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_faq_pages_v_blocks_hero_locale_idx" ON "_faq_pages_v_blocks_hero" USING btree ("_locale");
  CREATE INDEX "_faq_pages_v_blocks_hero_background_image_idx" ON "_faq_pages_v_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "_faq_pages_v_blocks_faq_questions_order_idx" ON "_faq_pages_v_blocks_faq_questions" USING btree ("_order");
  CREATE INDEX "_faq_pages_v_blocks_faq_questions_parent_id_idx" ON "_faq_pages_v_blocks_faq_questions" USING btree ("_parent_id");
  CREATE INDEX "_faq_pages_v_blocks_faq_questions_locale_idx" ON "_faq_pages_v_blocks_faq_questions" USING btree ("_locale");
  CREATE INDEX "_faq_pages_v_blocks_faq_order_idx" ON "_faq_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_faq_pages_v_blocks_faq_parent_id_idx" ON "_faq_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_faq_pages_v_blocks_faq_path_idx" ON "_faq_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_faq_pages_v_blocks_faq_locale_idx" ON "_faq_pages_v_blocks_faq" USING btree ("_locale");
  CREATE INDEX "_faq_pages_v_parent_idx" ON "_faq_pages_v" USING btree ("parent_id");
  CREATE INDEX "_faq_pages_v_version_seo_version_seo_og_image_idx" ON "_faq_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_faq_pages_v_version_version_site_idx" ON "_faq_pages_v" USING btree ("version_site_id");
  CREATE INDEX "_faq_pages_v_version_version_locale_idx" ON "_faq_pages_v" USING btree ("version_locale");
  CREATE INDEX "_faq_pages_v_version_version_submitted_by_idx" ON "_faq_pages_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_faq_pages_v_version_version_reviewed_by_idx" ON "_faq_pages_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_faq_pages_v_version_version_updated_at_idx" ON "_faq_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_faq_pages_v_version_version_created_at_idx" ON "_faq_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_faq_pages_v_version_version__status_idx" ON "_faq_pages_v" USING btree ("version__status");
  CREATE INDEX "_faq_pages_v_created_at_idx" ON "_faq_pages_v" USING btree ("created_at");
  CREATE INDEX "_faq_pages_v_updated_at_idx" ON "_faq_pages_v" USING btree ("updated_at");
  CREATE INDEX "_faq_pages_v_snapshot_idx" ON "_faq_pages_v" USING btree ("snapshot");
  CREATE INDEX "_faq_pages_v_published_locale_idx" ON "_faq_pages_v" USING btree ("published_locale");
  CREATE INDEX "_faq_pages_v_latest_idx" ON "_faq_pages_v" USING btree ("latest");
  CREATE INDEX "_faq_pages_v_version_version_slug_idx" ON "_faq_pages_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_faq_pages_v_locales_locale_parent_id_unique" ON "_faq_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "terms_pages_blocks_rich_text_order_idx" ON "terms_pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "terms_pages_blocks_rich_text_parent_id_idx" ON "terms_pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "terms_pages_blocks_rich_text_path_idx" ON "terms_pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "terms_pages_blocks_rich_text_locale_idx" ON "terms_pages_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "terms_pages_seo_seo_og_image_idx" ON "terms_pages" USING btree ("seo_og_image_id");
  CREATE INDEX "terms_pages_site_idx" ON "terms_pages" USING btree ("site_id");
  CREATE INDEX "terms_pages_locale_idx" ON "terms_pages" USING btree ("locale");
  CREATE INDEX "terms_pages_submitted_by_idx" ON "terms_pages" USING btree ("submitted_by_id");
  CREATE INDEX "terms_pages_reviewed_by_idx" ON "terms_pages" USING btree ("reviewed_by_id");
  CREATE INDEX "terms_pages_updated_at_idx" ON "terms_pages" USING btree ("updated_at");
  CREATE INDEX "terms_pages_created_at_idx" ON "terms_pages" USING btree ("created_at");
  CREATE INDEX "terms_pages__status_idx" ON "terms_pages" USING btree ("_status");
  CREATE INDEX "terms_pages_slug_idx" ON "terms_pages_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "terms_pages_locales_locale_parent_id_unique" ON "terms_pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_terms_pages_v_blocks_rich_text_order_idx" ON "_terms_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_terms_pages_v_blocks_rich_text_parent_id_idx" ON "_terms_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_terms_pages_v_blocks_rich_text_path_idx" ON "_terms_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_terms_pages_v_blocks_rich_text_locale_idx" ON "_terms_pages_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_terms_pages_v_parent_idx" ON "_terms_pages_v" USING btree ("parent_id");
  CREATE INDEX "_terms_pages_v_version_seo_version_seo_og_image_idx" ON "_terms_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_terms_pages_v_version_version_site_idx" ON "_terms_pages_v" USING btree ("version_site_id");
  CREATE INDEX "_terms_pages_v_version_version_locale_idx" ON "_terms_pages_v" USING btree ("version_locale");
  CREATE INDEX "_terms_pages_v_version_version_submitted_by_idx" ON "_terms_pages_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_terms_pages_v_version_version_reviewed_by_idx" ON "_terms_pages_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_terms_pages_v_version_version_updated_at_idx" ON "_terms_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_terms_pages_v_version_version_created_at_idx" ON "_terms_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_terms_pages_v_version_version__status_idx" ON "_terms_pages_v" USING btree ("version__status");
  CREATE INDEX "_terms_pages_v_created_at_idx" ON "_terms_pages_v" USING btree ("created_at");
  CREATE INDEX "_terms_pages_v_updated_at_idx" ON "_terms_pages_v" USING btree ("updated_at");
  CREATE INDEX "_terms_pages_v_snapshot_idx" ON "_terms_pages_v" USING btree ("snapshot");
  CREATE INDEX "_terms_pages_v_published_locale_idx" ON "_terms_pages_v" USING btree ("published_locale");
  CREATE INDEX "_terms_pages_v_latest_idx" ON "_terms_pages_v" USING btree ("latest");
  CREATE INDEX "_terms_pages_v_version_version_slug_idx" ON "_terms_pages_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_terms_pages_v_locales_locale_parent_id_unique" ON "_terms_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "privacy_pages_blocks_rich_text_order_idx" ON "privacy_pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "privacy_pages_blocks_rich_text_parent_id_idx" ON "privacy_pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "privacy_pages_blocks_rich_text_path_idx" ON "privacy_pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "privacy_pages_blocks_rich_text_locale_idx" ON "privacy_pages_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "privacy_pages_seo_seo_og_image_idx" ON "privacy_pages" USING btree ("seo_og_image_id");
  CREATE INDEX "privacy_pages_site_idx" ON "privacy_pages" USING btree ("site_id");
  CREATE INDEX "privacy_pages_locale_idx" ON "privacy_pages" USING btree ("locale");
  CREATE INDEX "privacy_pages_submitted_by_idx" ON "privacy_pages" USING btree ("submitted_by_id");
  CREATE INDEX "privacy_pages_reviewed_by_idx" ON "privacy_pages" USING btree ("reviewed_by_id");
  CREATE INDEX "privacy_pages_updated_at_idx" ON "privacy_pages" USING btree ("updated_at");
  CREATE INDEX "privacy_pages_created_at_idx" ON "privacy_pages" USING btree ("created_at");
  CREATE INDEX "privacy_pages__status_idx" ON "privacy_pages" USING btree ("_status");
  CREATE INDEX "privacy_pages_slug_idx" ON "privacy_pages_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "privacy_pages_locales_locale_parent_id_unique" ON "privacy_pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_privacy_pages_v_blocks_rich_text_order_idx" ON "_privacy_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_privacy_pages_v_blocks_rich_text_parent_id_idx" ON "_privacy_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_privacy_pages_v_blocks_rich_text_path_idx" ON "_privacy_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_privacy_pages_v_blocks_rich_text_locale_idx" ON "_privacy_pages_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_privacy_pages_v_parent_idx" ON "_privacy_pages_v" USING btree ("parent_id");
  CREATE INDEX "_privacy_pages_v_version_seo_version_seo_og_image_idx" ON "_privacy_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_privacy_pages_v_version_version_site_idx" ON "_privacy_pages_v" USING btree ("version_site_id");
  CREATE INDEX "_privacy_pages_v_version_version_locale_idx" ON "_privacy_pages_v" USING btree ("version_locale");
  CREATE INDEX "_privacy_pages_v_version_version_submitted_by_idx" ON "_privacy_pages_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_privacy_pages_v_version_version_reviewed_by_idx" ON "_privacy_pages_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_privacy_pages_v_version_version_updated_at_idx" ON "_privacy_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_privacy_pages_v_version_version_created_at_idx" ON "_privacy_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_privacy_pages_v_version_version__status_idx" ON "_privacy_pages_v" USING btree ("version__status");
  CREATE INDEX "_privacy_pages_v_created_at_idx" ON "_privacy_pages_v" USING btree ("created_at");
  CREATE INDEX "_privacy_pages_v_updated_at_idx" ON "_privacy_pages_v" USING btree ("updated_at");
  CREATE INDEX "_privacy_pages_v_snapshot_idx" ON "_privacy_pages_v" USING btree ("snapshot");
  CREATE INDEX "_privacy_pages_v_published_locale_idx" ON "_privacy_pages_v" USING btree ("published_locale");
  CREATE INDEX "_privacy_pages_v_latest_idx" ON "_privacy_pages_v" USING btree ("latest");
  CREATE INDEX "_privacy_pages_v_version_version_slug_idx" ON "_privacy_pages_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_privacy_pages_v_locales_locale_parent_id_unique" ON "_privacy_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cookie_policy_pages_blocks_rich_text_order_idx" ON "cookie_policy_pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "cookie_policy_pages_blocks_rich_text_parent_id_idx" ON "cookie_policy_pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "cookie_policy_pages_blocks_rich_text_path_idx" ON "cookie_policy_pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "cookie_policy_pages_blocks_rich_text_locale_idx" ON "cookie_policy_pages_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "cookie_policy_pages_seo_seo_og_image_idx" ON "cookie_policy_pages" USING btree ("seo_og_image_id");
  CREATE INDEX "cookie_policy_pages_site_idx" ON "cookie_policy_pages" USING btree ("site_id");
  CREATE INDEX "cookie_policy_pages_locale_idx" ON "cookie_policy_pages" USING btree ("locale");
  CREATE INDEX "cookie_policy_pages_submitted_by_idx" ON "cookie_policy_pages" USING btree ("submitted_by_id");
  CREATE INDEX "cookie_policy_pages_reviewed_by_idx" ON "cookie_policy_pages" USING btree ("reviewed_by_id");
  CREATE INDEX "cookie_policy_pages_updated_at_idx" ON "cookie_policy_pages" USING btree ("updated_at");
  CREATE INDEX "cookie_policy_pages_created_at_idx" ON "cookie_policy_pages" USING btree ("created_at");
  CREATE INDEX "cookie_policy_pages__status_idx" ON "cookie_policy_pages" USING btree ("_status");
  CREATE INDEX "cookie_policy_pages_slug_idx" ON "cookie_policy_pages_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "cookie_policy_pages_locales_locale_parent_id_unique" ON "cookie_policy_pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_cookie_policy_pages_v_blocks_rich_text_order_idx" ON "_cookie_policy_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_cookie_policy_pages_v_blocks_rich_text_parent_id_idx" ON "_cookie_policy_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_cookie_policy_pages_v_blocks_rich_text_path_idx" ON "_cookie_policy_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_cookie_policy_pages_v_blocks_rich_text_locale_idx" ON "_cookie_policy_pages_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_cookie_policy_pages_v_parent_idx" ON "_cookie_policy_pages_v" USING btree ("parent_id");
  CREATE INDEX "_cookie_policy_pages_v_version_seo_version_seo_og_image_idx" ON "_cookie_policy_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_cookie_policy_pages_v_version_version_site_idx" ON "_cookie_policy_pages_v" USING btree ("version_site_id");
  CREATE INDEX "_cookie_policy_pages_v_version_version_locale_idx" ON "_cookie_policy_pages_v" USING btree ("version_locale");
  CREATE INDEX "_cookie_policy_pages_v_version_version_submitted_by_idx" ON "_cookie_policy_pages_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_cookie_policy_pages_v_version_version_reviewed_by_idx" ON "_cookie_policy_pages_v" USING btree ("version_reviewed_by_id");
  CREATE INDEX "_cookie_policy_pages_v_version_version_updated_at_idx" ON "_cookie_policy_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_cookie_policy_pages_v_version_version_created_at_idx" ON "_cookie_policy_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_cookie_policy_pages_v_version_version__status_idx" ON "_cookie_policy_pages_v" USING btree ("version__status");
  CREATE INDEX "_cookie_policy_pages_v_created_at_idx" ON "_cookie_policy_pages_v" USING btree ("created_at");
  CREATE INDEX "_cookie_policy_pages_v_updated_at_idx" ON "_cookie_policy_pages_v" USING btree ("updated_at");
  CREATE INDEX "_cookie_policy_pages_v_snapshot_idx" ON "_cookie_policy_pages_v" USING btree ("snapshot");
  CREATE INDEX "_cookie_policy_pages_v_published_locale_idx" ON "_cookie_policy_pages_v" USING btree ("published_locale");
  CREATE INDEX "_cookie_policy_pages_v_latest_idx" ON "_cookie_policy_pages_v" USING btree ("latest");
  CREATE INDEX "_cookie_policy_pages_v_version_version_slug_idx" ON "_cookie_policy_pages_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_cookie_policy_pages_v_locales_locale_parent_id_unique" ON "_cookie_policy_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "translation_queue_document_id_idx" ON "translation_queue" USING btree ("document_id");
  CREATE INDEX "translation_queue_collection_slug_idx" ON "translation_queue" USING btree ("collection_slug");
  CREATE INDEX "translation_queue_site_idx" ON "translation_queue" USING btree ("site_id");
  CREATE INDEX "translation_queue_locale_idx" ON "translation_queue" USING btree ("locale");
  CREATE INDEX "translation_queue_target_locale_idx" ON "translation_queue" USING btree ("target_locale");
  CREATE INDEX "translation_queue_assigned_to_idx" ON "translation_queue" USING btree ("assigned_to_id");
  CREATE INDEX "translation_queue_updated_at_idx" ON "translation_queue" USING btree ("updated_at");
  CREATE INDEX "translation_queue_created_at_idx" ON "translation_queue" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_api_keys_id_idx" ON "payload_locked_documents_rels" USING btree ("api_keys_id");
  CREATE INDEX "payload_locked_documents_rels_roles_id_idx" ON "payload_locked_documents_rels" USING btree ("roles_id");
  CREATE INDEX "payload_locked_documents_rels_sites_id_idx" ON "payload_locked_documents_rels" USING btree ("sites_id");
  CREATE INDEX "payload_locked_documents_rels_site_domains_id_idx" ON "payload_locked_documents_rels" USING btree ("site_domains_id");
  CREATE INDEX "payload_locked_documents_rels_site_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("site_settings_id");
  CREATE INDEX "payload_locked_documents_rels_languages_id_idx" ON "payload_locked_documents_rels" USING btree ("languages_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_navigation_id_idx" ON "payload_locked_documents_rels" USING btree ("navigation_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_locations_id_idx" ON "payload_locked_documents_rels" USING btree ("locations_id");
  CREATE INDEX "payload_locked_documents_rels_team_members_id_idx" ON "payload_locked_documents_rels" USING btree ("team_members_id");
  CREATE INDEX "payload_locked_documents_rels_article_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("article_categories_id");
  CREATE INDEX "payload_locked_documents_rels_case_study_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("case_study_categories_id");
  CREATE INDEX "payload_locked_documents_rels_offer_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("offer_categories_id");
  CREATE INDEX "payload_locked_documents_rels_help_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("help_categories_id");
  CREATE INDEX "payload_locked_documents_rels_video_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("video_categories_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_help_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("help_articles_id");
  CREATE INDEX "payload_locked_documents_rels_videos_id_idx" ON "payload_locked_documents_rels" USING btree ("videos_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_offer_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("offer_pages_id");
  CREATE INDEX "payload_locked_documents_rels_case_study_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("case_study_pages_id");
  CREATE INDEX "payload_locked_documents_rels_video_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("video_pages_id");
  CREATE INDEX "payload_locked_documents_rels_faq_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("faq_pages_id");
  CREATE INDEX "payload_locked_documents_rels_terms_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("terms_pages_id");
  CREATE INDEX "payload_locked_documents_rels_privacy_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("privacy_pages_id");
  CREATE INDEX "payload_locked_documents_rels_cookie_policy_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("cookie_policy_pages_id");
  CREATE INDEX "payload_locked_documents_rels_translation_queue_id_idx" ON "payload_locked_documents_rels" USING btree ("translation_queue_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "header_navigation_children_order_idx" ON "header_navigation_children" USING btree ("_order");
  CREATE INDEX "header_navigation_children_parent_id_idx" ON "header_navigation_children" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "header_navigation_children_locales_locale_parent_id_unique" ON "header_navigation_children_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "header_navigation_order_idx" ON "header_navigation" USING btree ("_order");
  CREATE INDEX "header_navigation_parent_id_idx" ON "header_navigation" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "header_navigation_locales_locale_parent_id_unique" ON "header_navigation_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "header_logo_idx" ON "header" USING btree ("logo_id");
  CREATE UNIQUE INDEX "header_locales_locale_parent_id_unique" ON "header_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_columns_links_locales_locale_parent_id_unique" ON "footer_columns_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_columns_locales_locale_parent_id_unique" ON "footer_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_social_links_order_idx" ON "footer_social_links" USING btree ("_order");
  CREATE INDEX "footer_social_links_parent_id_idx" ON "footer_social_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "seo_default_og_image_idx" ON "seo" USING btree ("default_og_image_id");
  CREATE INDEX "seo_favicon_idx" ON "seo" USING btree ("favicon_id");
  CREATE UNIQUE INDEX "seo_locales_locale_parent_id_unique" ON "seo_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "legal_locales_locale_parent_id_unique" ON "legal_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "contact_info_locales_locale_parent_id_unique" ON "contact_info_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "users_texts" CASCADE;
  DROP TABLE "users_rels" CASCADE;
  DROP TABLE "api_keys" CASCADE;
  DROP TABLE "roles" CASCADE;
  DROP TABLE "sites_youtube_playlist_ids" CASCADE;
  DROP TABLE "sites_permission_overrides" CASCADE;
  DROP TABLE "sites" CASCADE;
  DROP TABLE "sites_rels" CASCADE;
  DROP TABLE "site_domains" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TABLE "_site_settings_v_locales" CASCADE;
  DROP TABLE "languages" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_texts" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "navigation_locales" CASCADE;
  DROP TABLE "_navigation_v" CASCADE;
  DROP TABLE "_navigation_v_locales" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "testimonials_locales" CASCADE;
  DROP TABLE "_testimonials_v" CASCADE;
  DROP TABLE "_testimonials_v_locales" CASCADE;
  DROP TABLE "locations" CASCADE;
  DROP TABLE "locations_locales" CASCADE;
  DROP TABLE "_locations_v" CASCADE;
  DROP TABLE "_locations_v_locales" CASCADE;
  DROP TABLE "team_members" CASCADE;
  DROP TABLE "team_members_locales" CASCADE;
  DROP TABLE "_team_members_v" CASCADE;
  DROP TABLE "_team_members_v_locales" CASCADE;
  DROP TABLE "article_categories" CASCADE;
  DROP TABLE "article_categories_locales" CASCADE;
  DROP TABLE "_article_categories_v" CASCADE;
  DROP TABLE "_article_categories_v_locales" CASCADE;
  DROP TABLE "case_study_categories" CASCADE;
  DROP TABLE "case_study_categories_locales" CASCADE;
  DROP TABLE "_case_study_categories_v" CASCADE;
  DROP TABLE "_case_study_categories_v_locales" CASCADE;
  DROP TABLE "offer_categories" CASCADE;
  DROP TABLE "offer_categories_locales" CASCADE;
  DROP TABLE "_offer_categories_v" CASCADE;
  DROP TABLE "_offer_categories_v_locales" CASCADE;
  DROP TABLE "help_categories" CASCADE;
  DROP TABLE "help_categories_locales" CASCADE;
  DROP TABLE "_help_categories_v" CASCADE;
  DROP TABLE "_help_categories_v_locales" CASCADE;
  DROP TABLE "video_categories" CASCADE;
  DROP TABLE "video_categories_locales" CASCADE;
  DROP TABLE "_video_categories_v" CASCADE;
  DROP TABLE "_video_categories_v_locales" CASCADE;
  DROP TABLE "articles_blocks_rich_text" CASCADE;
  DROP TABLE "articles_blocks_media" CASCADE;
  DROP TABLE "articles_blocks_callout" CASCADE;
  DROP TABLE "articles_blocks_video_embed" CASCADE;
  DROP TABLE "articles_blocks_related_content" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_locales" CASCADE;
  DROP TABLE "articles_texts" CASCADE;
  DROP TABLE "articles_rels" CASCADE;
  DROP TABLE "_articles_v_blocks_rich_text" CASCADE;
  DROP TABLE "_articles_v_blocks_media" CASCADE;
  DROP TABLE "_articles_v_blocks_callout" CASCADE;
  DROP TABLE "_articles_v_blocks_video_embed" CASCADE;
  DROP TABLE "_articles_v_blocks_related_content" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "_articles_v_locales" CASCADE;
  DROP TABLE "_articles_v_texts" CASCADE;
  DROP TABLE "_articles_v_rels" CASCADE;
  DROP TABLE "help_articles_blocks_rich_text" CASCADE;
  DROP TABLE "help_articles_blocks_media" CASCADE;
  DROP TABLE "help_articles_blocks_callout" CASCADE;
  DROP TABLE "help_articles_blocks_faq_questions" CASCADE;
  DROP TABLE "help_articles_blocks_faq" CASCADE;
  DROP TABLE "help_articles_blocks_video_embed" CASCADE;
  DROP TABLE "help_articles" CASCADE;
  DROP TABLE "help_articles_locales" CASCADE;
  DROP TABLE "help_articles_texts" CASCADE;
  DROP TABLE "help_articles_rels" CASCADE;
  DROP TABLE "_help_articles_v_blocks_rich_text" CASCADE;
  DROP TABLE "_help_articles_v_blocks_media" CASCADE;
  DROP TABLE "_help_articles_v_blocks_callout" CASCADE;
  DROP TABLE "_help_articles_v_blocks_faq_questions" CASCADE;
  DROP TABLE "_help_articles_v_blocks_faq" CASCADE;
  DROP TABLE "_help_articles_v_blocks_video_embed" CASCADE;
  DROP TABLE "_help_articles_v" CASCADE;
  DROP TABLE "_help_articles_v_locales" CASCADE;
  DROP TABLE "_help_articles_v_texts" CASCADE;
  DROP TABLE "_help_articles_v_rels" CASCADE;
  DROP TABLE "videos_blocks_rich_text" CASCADE;
  DROP TABLE "videos_blocks_callout" CASCADE;
  DROP TABLE "videos_blocks_related_content" CASCADE;
  DROP TABLE "videos" CASCADE;
  DROP TABLE "videos_locales" CASCADE;
  DROP TABLE "videos_texts" CASCADE;
  DROP TABLE "videos_rels" CASCADE;
  DROP TABLE "_videos_v_blocks_rich_text" CASCADE;
  DROP TABLE "_videos_v_blocks_callout" CASCADE;
  DROP TABLE "_videos_v_blocks_related_content" CASCADE;
  DROP TABLE "_videos_v" CASCADE;
  DROP TABLE "_videos_v_locales" CASCADE;
  DROP TABLE "_videos_v_texts" CASCADE;
  DROP TABLE "_videos_v_rels" CASCADE;
  DROP TABLE "pages_blocks_hero_social_proof" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_features_items" CASCADE;
  DROP TABLE "pages_blocks_features" CASCADE;
  DROP TABLE "pages_blocks_pricing_plans_features" CASCADE;
  DROP TABLE "pages_blocks_pricing_plans" CASCADE;
  DROP TABLE "pages_blocks_pricing" CASCADE;
  DROP TABLE "pages_blocks_testimonial" CASCADE;
  DROP TABLE "pages_blocks_testimonials" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_faq_questions" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages_blocks_media" CASCADE;
  DROP TABLE "pages_blocks_articles" CASCADE;
  DROP TABLE "pages_blocks_case_studies" CASCADE;
  DROP TABLE "pages_blocks_offer_showcase" CASCADE;
  DROP TABLE "pages_blocks_newsletter" CASCADE;
  DROP TABLE "pages_blocks_callout" CASCADE;
  DROP TABLE "pages_blocks_related_content" CASCADE;
  DROP TABLE "pages_blocks_video_embed" CASCADE;
  DROP TABLE "pages_blocks_locations" CASCADE;
  DROP TABLE "pages_blocks_team_members" CASCADE;
  DROP TABLE "pages_blocks_trust_feed_reviews" CASCADE;
  DROP TABLE "pages_blocks_trust_feed" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_social_proof" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_features_items" CASCADE;
  DROP TABLE "_pages_v_blocks_features" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_plans_features" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_plans" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonial" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_questions" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_media" CASCADE;
  DROP TABLE "_pages_v_blocks_articles" CASCADE;
  DROP TABLE "_pages_v_blocks_case_studies" CASCADE;
  DROP TABLE "_pages_v_blocks_offer_showcase" CASCADE;
  DROP TABLE "_pages_v_blocks_newsletter" CASCADE;
  DROP TABLE "_pages_v_blocks_callout" CASCADE;
  DROP TABLE "_pages_v_blocks_related_content" CASCADE;
  DROP TABLE "_pages_v_blocks_video_embed" CASCADE;
  DROP TABLE "_pages_v_blocks_locations" CASCADE;
  DROP TABLE "_pages_v_blocks_team_members" CASCADE;
  DROP TABLE "_pages_v_blocks_trust_feed_reviews" CASCADE;
  DROP TABLE "_pages_v_blocks_trust_feed" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "offer_pages_blocks_hero_social_proof" CASCADE;
  DROP TABLE "offer_pages_blocks_hero" CASCADE;
  DROP TABLE "offer_pages_blocks_rich_text" CASCADE;
  DROP TABLE "offer_pages_blocks_media" CASCADE;
  DROP TABLE "offer_pages_blocks_cta" CASCADE;
  DROP TABLE "offer_pages" CASCADE;
  DROP TABLE "offer_pages_locales" CASCADE;
  DROP TABLE "_offer_pages_v_blocks_hero_social_proof" CASCADE;
  DROP TABLE "_offer_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_offer_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_offer_pages_v_blocks_media" CASCADE;
  DROP TABLE "_offer_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_offer_pages_v" CASCADE;
  DROP TABLE "_offer_pages_v_locales" CASCADE;
  DROP TABLE "case_study_pages_results" CASCADE;
  DROP TABLE "case_study_pages_results_locales" CASCADE;
  DROP TABLE "case_study_pages_blocks_hero_social_proof" CASCADE;
  DROP TABLE "case_study_pages_blocks_hero" CASCADE;
  DROP TABLE "case_study_pages_blocks_rich_text" CASCADE;
  DROP TABLE "case_study_pages_blocks_media" CASCADE;
  DROP TABLE "case_study_pages_blocks_callout" CASCADE;
  DROP TABLE "case_study_pages" CASCADE;
  DROP TABLE "case_study_pages_locales" CASCADE;
  DROP TABLE "_case_study_pages_v_version_results" CASCADE;
  DROP TABLE "_case_study_pages_v_version_results_locales" CASCADE;
  DROP TABLE "_case_study_pages_v_blocks_hero_social_proof" CASCADE;
  DROP TABLE "_case_study_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_case_study_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_case_study_pages_v_blocks_media" CASCADE;
  DROP TABLE "_case_study_pages_v_blocks_callout" CASCADE;
  DROP TABLE "_case_study_pages_v" CASCADE;
  DROP TABLE "_case_study_pages_v_locales" CASCADE;
  DROP TABLE "video_pages_blocks_rich_text" CASCADE;
  DROP TABLE "video_pages_blocks_related_content" CASCADE;
  DROP TABLE "video_pages" CASCADE;
  DROP TABLE "video_pages_locales" CASCADE;
  DROP TABLE "video_pages_texts" CASCADE;
  DROP TABLE "video_pages_rels" CASCADE;
  DROP TABLE "_video_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_video_pages_v_blocks_related_content" CASCADE;
  DROP TABLE "_video_pages_v" CASCADE;
  DROP TABLE "_video_pages_v_locales" CASCADE;
  DROP TABLE "_video_pages_v_texts" CASCADE;
  DROP TABLE "_video_pages_v_rels" CASCADE;
  DROP TABLE "faq_pages_blocks_hero_social_proof" CASCADE;
  DROP TABLE "faq_pages_blocks_hero" CASCADE;
  DROP TABLE "faq_pages_blocks_faq_questions" CASCADE;
  DROP TABLE "faq_pages_blocks_faq" CASCADE;
  DROP TABLE "faq_pages" CASCADE;
  DROP TABLE "faq_pages_locales" CASCADE;
  DROP TABLE "_faq_pages_v_blocks_hero_social_proof" CASCADE;
  DROP TABLE "_faq_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_faq_pages_v_blocks_faq_questions" CASCADE;
  DROP TABLE "_faq_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_faq_pages_v" CASCADE;
  DROP TABLE "_faq_pages_v_locales" CASCADE;
  DROP TABLE "terms_pages_blocks_rich_text" CASCADE;
  DROP TABLE "terms_pages" CASCADE;
  DROP TABLE "terms_pages_locales" CASCADE;
  DROP TABLE "_terms_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_terms_pages_v" CASCADE;
  DROP TABLE "_terms_pages_v_locales" CASCADE;
  DROP TABLE "privacy_pages_blocks_rich_text" CASCADE;
  DROP TABLE "privacy_pages" CASCADE;
  DROP TABLE "privacy_pages_locales" CASCADE;
  DROP TABLE "_privacy_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_privacy_pages_v" CASCADE;
  DROP TABLE "_privacy_pages_v_locales" CASCADE;
  DROP TABLE "cookie_policy_pages_blocks_rich_text" CASCADE;
  DROP TABLE "cookie_policy_pages" CASCADE;
  DROP TABLE "cookie_policy_pages_locales" CASCADE;
  DROP TABLE "_cookie_policy_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_cookie_policy_pages_v" CASCADE;
  DROP TABLE "_cookie_policy_pages_v_locales" CASCADE;
  DROP TABLE "translation_queue" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "header_navigation_children" CASCADE;
  DROP TABLE "header_navigation_children_locales" CASCADE;
  DROP TABLE "header_navigation" CASCADE;
  DROP TABLE "header_navigation_locales" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_locales" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns_links_locales" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer_columns_locales" CASCADE;
  DROP TABLE "footer_social_links" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_locales" CASCADE;
  DROP TABLE "seo" CASCADE;
  DROP TABLE "seo_locales" CASCADE;
  DROP TABLE "legal" CASCADE;
  DROP TABLE "legal_locales" CASCADE;
  DROP TABLE "contact_info" CASCADE;
  DROP TABLE "contact_info_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_sites_status";
  DROP TYPE "public"."enum_sites_sync_frequency";
  DROP TYPE "public"."enum_site_settings_status";
  DROP TYPE "public"."enum__site_settings_v_version_status";
  DROP TYPE "public"."enum__site_settings_v_published_locale";
  DROP TYPE "public"."enum_navigation_nav_key";
  DROP TYPE "public"."enum_navigation_status";
  DROP TYPE "public"."enum__navigation_v_version_nav_key";
  DROP TYPE "public"."enum__navigation_v_version_status";
  DROP TYPE "public"."enum__navigation_v_published_locale";
  DROP TYPE "public"."enum_testimonials_status";
  DROP TYPE "public"."enum__testimonials_v_version_status";
  DROP TYPE "public"."enum__testimonials_v_published_locale";
  DROP TYPE "public"."enum_locations_status";
  DROP TYPE "public"."enum__locations_v_version_status";
  DROP TYPE "public"."enum__locations_v_published_locale";
  DROP TYPE "public"."enum_team_members_status";
  DROP TYPE "public"."enum__team_members_v_version_status";
  DROP TYPE "public"."enum__team_members_v_published_locale";
  DROP TYPE "public"."enum_article_categories_status";
  DROP TYPE "public"."enum__article_categories_v_version_status";
  DROP TYPE "public"."enum__article_categories_v_published_locale";
  DROP TYPE "public"."enum_case_study_categories_status";
  DROP TYPE "public"."enum__case_study_categories_v_version_status";
  DROP TYPE "public"."enum__case_study_categories_v_published_locale";
  DROP TYPE "public"."enum_offer_categories_status";
  DROP TYPE "public"."enum__offer_categories_v_version_status";
  DROP TYPE "public"."enum__offer_categories_v_published_locale";
  DROP TYPE "public"."enum_help_categories_status";
  DROP TYPE "public"."enum__help_categories_v_version_status";
  DROP TYPE "public"."enum__help_categories_v_published_locale";
  DROP TYPE "public"."enum_video_categories_status";
  DROP TYPE "public"."enum__video_categories_v_version_status";
  DROP TYPE "public"."enum__video_categories_v_published_locale";
  DROP TYPE "public"."enum_articles_blocks_callout_type";
  DROP TYPE "public"."enum_articles_blocks_video_embed_aspect_ratio";
  DROP TYPE "public"."enum_articles_blocks_related_content_display_style";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_blocks_callout_type";
  DROP TYPE "public"."enum__articles_v_blocks_video_embed_aspect_ratio";
  DROP TYPE "public"."enum__articles_v_blocks_related_content_display_style";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum__articles_v_published_locale";
  DROP TYPE "public"."enum_help_articles_blocks_callout_type";
  DROP TYPE "public"."enum_help_articles_blocks_video_embed_aspect_ratio";
  DROP TYPE "public"."enum_help_articles_status";
  DROP TYPE "public"."enum__help_articles_v_blocks_callout_type";
  DROP TYPE "public"."enum__help_articles_v_blocks_video_embed_aspect_ratio";
  DROP TYPE "public"."enum__help_articles_v_version_status";
  DROP TYPE "public"."enum__help_articles_v_published_locale";
  DROP TYPE "public"."enum_videos_blocks_callout_type";
  DROP TYPE "public"."enum_videos_blocks_related_content_display_style";
  DROP TYPE "public"."enum_videos_status";
  DROP TYPE "public"."enum__videos_v_blocks_callout_type";
  DROP TYPE "public"."enum__videos_v_blocks_related_content_display_style";
  DROP TYPE "public"."enum__videos_v_version_status";
  DROP TYPE "public"."enum__videos_v_published_locale";
  DROP TYPE "public"."enum_pages_blocks_hero_cta_style";
  DROP TYPE "public"."enum_pages_blocks_cta_button_style";
  DROP TYPE "public"."enum_pages_blocks_cta_background_color";
  DROP TYPE "public"."enum_pages_blocks_callout_type";
  DROP TYPE "public"."enum_pages_blocks_related_content_display_style";
  DROP TYPE "public"."enum_pages_blocks_video_embed_aspect_ratio";
  DROP TYPE "public"."enum_pages_page_type";
  DROP TYPE "public"."enum_pages_preview_environment";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_hero_cta_style";
  DROP TYPE "public"."enum__pages_v_blocks_cta_button_style";
  DROP TYPE "public"."enum__pages_v_blocks_cta_background_color";
  DROP TYPE "public"."enum__pages_v_blocks_callout_type";
  DROP TYPE "public"."enum__pages_v_blocks_related_content_display_style";
  DROP TYPE "public"."enum__pages_v_blocks_video_embed_aspect_ratio";
  DROP TYPE "public"."enum__pages_v_version_page_type";
  DROP TYPE "public"."enum__pages_v_version_preview_environment";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_offer_pages_blocks_hero_cta_style";
  DROP TYPE "public"."enum_offer_pages_blocks_cta_button_style";
  DROP TYPE "public"."enum_offer_pages_blocks_cta_background_color";
  DROP TYPE "public"."enum_offer_pages_status";
  DROP TYPE "public"."enum__offer_pages_v_blocks_hero_cta_style";
  DROP TYPE "public"."enum__offer_pages_v_blocks_cta_button_style";
  DROP TYPE "public"."enum__offer_pages_v_blocks_cta_background_color";
  DROP TYPE "public"."enum__offer_pages_v_version_status";
  DROP TYPE "public"."enum__offer_pages_v_published_locale";
  DROP TYPE "public"."enum_case_study_pages_blocks_hero_cta_style";
  DROP TYPE "public"."enum_case_study_pages_blocks_callout_type";
  DROP TYPE "public"."enum_case_study_pages_status";
  DROP TYPE "public"."enum__case_study_pages_v_blocks_hero_cta_style";
  DROP TYPE "public"."enum__case_study_pages_v_blocks_callout_type";
  DROP TYPE "public"."enum__case_study_pages_v_version_status";
  DROP TYPE "public"."enum__case_study_pages_v_published_locale";
  DROP TYPE "public"."enum_video_pages_blocks_related_content_display_style";
  DROP TYPE "public"."enum_video_pages_status";
  DROP TYPE "public"."enum__video_pages_v_blocks_related_content_display_style";
  DROP TYPE "public"."enum__video_pages_v_version_status";
  DROP TYPE "public"."enum__video_pages_v_published_locale";
  DROP TYPE "public"."enum_faq_pages_blocks_hero_cta_style";
  DROP TYPE "public"."enum_faq_pages_status";
  DROP TYPE "public"."enum__faq_pages_v_blocks_hero_cta_style";
  DROP TYPE "public"."enum__faq_pages_v_version_status";
  DROP TYPE "public"."enum__faq_pages_v_published_locale";
  DROP TYPE "public"."enum_terms_pages_status";
  DROP TYPE "public"."enum__terms_pages_v_version_status";
  DROP TYPE "public"."enum__terms_pages_v_published_locale";
  DROP TYPE "public"."enum_privacy_pages_status";
  DROP TYPE "public"."enum__privacy_pages_v_version_status";
  DROP TYPE "public"."enum__privacy_pages_v_published_locale";
  DROP TYPE "public"."enum_cookie_policy_pages_status";
  DROP TYPE "public"."enum__cookie_policy_pages_v_version_status";
  DROP TYPE "public"."enum__cookie_policy_pages_v_published_locale";
  DROP TYPE "public"."enum_translation_queue_status";
  DROP TYPE "public"."enum_footer_social_links_platform";`)
}
