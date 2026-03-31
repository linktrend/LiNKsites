# Migration Guide

Date: Dec 22, 2025

## 1. Wave 1 → Wave 2 Changes
- Next.js upgraded 15.4.7 → 16.1.0 (App Router).
- PayloadCMS upgraded 3.65.0 → 3.69.0.
- Breaking changes: None observed during validation.
- Migration steps: `pnpm update` (ensure Node 18.20.2+ or 20.9+).

## 2. Configuration Changes
- Removed invalid `favicon` and `ogImage` entries from `src/payload.config.ts`.
- GitHub workflows reordered to install pnpm before node setup; dependency review conditional added.

## 3. Code Changes
- Site scoping logic reordered in `src/hooks/enforceSiteScope.ts` to ensure scope before locale validation.
- Test data updated to include `locale` and `allowedLocales` where required.
- Additional hook and access control adjustments across collections/globals for site + locale safety.

## 4. Database Changes
- No schema changes between waves; existing migrations remain valid.
- Dev environments rely on Payload auto-push; production should run migrations explicitly.

## 5. Rollback Procedures
- Code: use git to revert to pre-Wave-2 commit (note branch/tag before rollback).
- Dependencies: `pnpm install` after resetting `package.json`/`pnpm-lock.yaml` to prior versions.
- Database: take backups before rollbacks; restore from latest dump if needed.
- Verify: after rollback, run `pnpm dev` and `pnpm test` to confirm stability.
