# ARCHIVED — Stale agent build-session reports, not living reference docs

**Archived:** 2026-07-14, as a continuation of the repo-root-level documentation cleanup pass
recorded in `audit/13_decision_and_contradiction_register.md` (DR-09), which deliberately deferred
`apps/cms/docs/` for a separate, careful pass.

## What this is

This directory holds one-off "I finished this task" narrative reports produced during a specific
multi-wave hardening effort on the CMS app (`apps/cms`), dated December 22, 2025. Each file here is
a point-in-time record of a completed wave/validation pass — organized around a wave number and a
"Status: ✅ COMPLETE" header with a detailed fix-by-fix checklist — rather than living documentation
a developer would open today to understand or operate the app. This directory sits alongside the
pre-existing `apps/cms/docs/archive/` directory (created during an earlier internal cleanup of this
same app), which already holds a package summary (`ARCHIVE_PACKAGE.md`) referencing these three
files by name; this batch physically archives the files that summary already treats as historical.

## Why archived here instead of deleted

Per repo convention (see `archive/old_linktrend-legacy-corporate-site/ARCHIVED.md` for the pattern
this manifest follows): preserve historical process records instead of deleting them outright, in
case anyone needs to trace back what a specific wave of hardening work actually did, while making
clear none of this is active reference documentation. Nothing in this directory is linked from
application code, build config, or CI — it is prose-only historical material.

## What was archived and why

- **`FIXES_COMPLETED.md`** — "Fixes Completed - December 22, 2024" (sic; internally dated
  inconsistently with the Wave reports, which are dated December 22, 2025): a checklist-style log
  of specific security/dependency fixes applied during the hardening effort, including items marked
  "REQUIRES MANUAL FIX" that were open at the time. Superseded as an ongoing reference by
  `SECURITY_AUDIT.md` and `KNOWN_ISSUES.md`, both of which remain in place as the current, living
  security/issue status for the app.
- **`WAVE_2_COMPLETION_REPORT.md`** — "Wave 2: Core Fixes Implementation - Completion Report": a
  detailed, fix-by-fix narrative of what Wave 2 resolved (dependency upgrades, workflow ordering,
  test results at that point in time). A historical record of one specific wave, not an ongoing
  reference; current architecture, migration, and known-issue state are covered by `ARCHITECTURE.md`,
  `MIGRATION_GUIDE.md`, and `KNOWN_ISSUES.md`, which remain in place.
- **`WAVE_3_VALIDATION_REPORT.md`** — "Wave 3 - Code Testing & Validation Report": a large
  (1,000+ line) point-in-time validation snapshot ("Overall Health Status: GREEN", phase-by-phase
  validation results, "Recommendation: PROCEED TO WAVE 4"). A historical validation record for a
  now-finished wave, not something a developer needs to consult to work with the app today; current
  status lives in `AGENT_BRIEFING.md`, `KNOWN_ISSUES.md`, and `SECURITY_AUDIT.md`, which remain in
  place.

## If this needs to be resurrected

These are historical records only. If you need to understand the CMS app's current architecture,
known issues, or security status **today**, read `ARCHITECTURE.md`, `KNOWN_ISSUES.md`,
`SECURITY_AUDIT.md`, `MIGRATION_GUIDE.md`, and `AGENT_BRIEFING.md` instead of these reports. If you
specifically need to trace what a particular hardening wave did and when, these files (and git
history) remain the source of truth for that narrower question.
