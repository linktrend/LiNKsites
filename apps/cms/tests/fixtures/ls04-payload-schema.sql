-- Exact baseline identifiers required by the LS-04 Payload migration.
CREATE TYPE "public"."_locales" AS ENUM ('en', 'zh-TW', 'es');

CREATE TABLE "public"."pages" ("id" serial PRIMARY KEY);
CREATE TABLE "public"."_pages_v" ("id" serial PRIMARY KEY);

CREATE TABLE "public"."pages_blocks_hero" ("id" serial PRIMARY KEY);
CREATE TABLE "public"."pages_blocks_cta" ("id" serial PRIMARY KEY);
CREATE TABLE "public"."pages_blocks_articles" ("id" serial PRIMARY KEY);
CREATE TABLE "public"."pages_blocks_offer_showcase" ("id" serial PRIMARY KEY);
CREATE TABLE "public"."_pages_v_blocks_hero" ("id" serial PRIMARY KEY);
CREATE TABLE "public"."_pages_v_blocks_cta" ("id" serial PRIMARY KEY);
CREATE TABLE "public"."_pages_v_blocks_articles" ("id" serial PRIMARY KEY);
CREATE TABLE "public"."_pages_v_blocks_offer_showcase" ("id" serial PRIMARY KEY);
CREATE TABLE "public"."offer_pages_blocks_hero" ("id" serial PRIMARY KEY);
CREATE TABLE "public"."offer_pages_blocks_cta" ("id" serial PRIMARY KEY);
CREATE TABLE "public"."_offer_pages_v_blocks_hero" ("id" serial PRIMARY KEY);
CREATE TABLE "public"."_offer_pages_v_blocks_cta" ("id" serial PRIMARY KEY);
CREATE TABLE "public"."case_study_pages_blocks_hero" ("id" serial PRIMARY KEY);
CREATE TABLE "public"."_case_study_pages_v_blocks_hero" ("id" serial PRIMARY KEY);
CREATE TABLE "public"."faq_pages_blocks_hero" ("id" serial PRIMARY KEY);
CREATE TABLE "public"."_faq_pages_v_blocks_hero" ("id" serial PRIMARY KEY);
