/**
 * Integration test for PayloadRestDraftTarget against a real running Payload
 * CMS instance.
 *
 * ## How to run
 *
 * This test is skipped unless the environment variable
 * `PAYLOAD_INTEGRATION_TEST_URL` is set to the base URL of a running Payload
 * CMS instance (e.g. `http://localhost:3099`). Authentication is handled via
 * `PAYLOAD_INTEGRATION_TEST_JWT` (a JWT obtained from `POST /api/users/login`
 * for a user in the `super-admin` role) or `PAYLOAD_INTEGRATION_TEST_API_KEY`
 * (a Payload API key from an admin user — the header format used will be
 * `users API-Key <key>`).
 *
 * Minimal required setup (bootstrap order for a fresh Payload 3.x instance):
 *   1. A running Payload CMS instance backed by a real database.
 *   2. Run `pnpm factory:bootstrap` in `apps/cms` to seed Roles, Languages,
 *      and a default Site.
 *   3. `POST /api/users/first-register` with `roles:[<superAdminRoleId>]`,
 *      `assignedSites:[<siteId>]`, `allowedLocales:["en"]` to create the first
 *      admin user.
 *   4. Obtain a JWT: `POST /api/users/login` → `token`.
 *   5. Export:
 *        PAYLOAD_INTEGRATION_TEST_URL=http://localhost:3099
 *        PAYLOAD_INTEGRATION_TEST_JWT=<jwt>          # short-lived; re-login to refresh
 *        PAYLOAD_INTEGRATION_TEST_SITE_ID=<siteId>   # integer or string ID from step 2
 *
 * The test creates and verifies `pages` documents (which require a `site`
 * relationship and `locale` field), then cleans up any documents it created.
 *
 * ## What this proves
 *
 * - `upsertDraft` makes a real POST to `/api/pages?draft=true` and returns a
 *   compound `payloadDocumentId` that encodes the collection and Payload doc ID.
 * - On a second call with the same `externalKey`, it correctly issues a PATCH
 *   to update the existing document rather than creating a duplicate.
 * - `readback` makes a real GET to `/api/pages/<id>?draft=true` and returns
 *   the stored document (confirming the write actually persisted).
 * - Round-trip through PromotionService: the full promotion+readback flow
 *   produces a `succeeded` receipt when driven by a real Payload target.
 *
 * This is the concrete "real target" proof that replaces the in-memory-only
 * test (manual §12.21 readback verification against live infrastructure).
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PayloadRestDraftTarget } from '../src/targets/payloadRestDraftTarget.js'
import { PromotionService } from '../src/promotionService.js'

// ---------------------------------------------------------------------------
// Environment guard
// ---------------------------------------------------------------------------

const PAYLOAD_URL = process.env['PAYLOAD_INTEGRATION_TEST_URL']
const JWT_TOKEN = process.env['PAYLOAD_INTEGRATION_TEST_JWT']
const API_KEY = process.env['PAYLOAD_INTEGRATION_TEST_API_KEY']
const SITE_ID = process.env['PAYLOAD_INTEGRATION_TEST_SITE_ID']

const SKIP_REASON =
  'Set PAYLOAD_INTEGRATION_TEST_URL (base URL), PAYLOAD_INTEGRATION_TEST_JWT (JWT from login), ' +
  'and PAYLOAD_INTEGRATION_TEST_SITE_ID (site ID for pages) to run against a real Payload instance. ' +
  'See the file-level JSDoc for bootstrap steps.'

const runIntegration = Boolean(PAYLOAD_URL && (JWT_TOKEN || API_KEY) && SITE_ID)

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Unique prefix so parallel test runs don't collide. */
const RUN_ID = `int-${Date.now()}`

function testSlug(suffix: string): string {
  return `${RUN_ID}-${suffix}`
}

/** IDs of pages docs created by these tests — cleaned up in afterAll. */
const createdDocIds: Array<{ collection: string; id: string }> = []

/**
 * Extracts the Payload doc ID from a compound payloadDocumentId
 * like "pages::abc123".
 */
function extractPayloadId(compoundId: string): string | null {
  const sepIdx = compoundId.indexOf('::')
  if (sepIdx === -1) return null
  return compoundId.slice(sepIdx + 2)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe.skipIf(!runIntegration)(
  'PayloadRestDraftTarget — real Payload CMS round-trip',
  () => {
    let target: PayloadRestDraftTarget

    beforeAll(() => {
      // Prefer JWT (Bearer format), fall back to API key (users API-Key format).
      const credential =
        JWT_TOKEN
          ? JWT_TOKEN
          : API_KEY
            ? { collectionSlug: 'users', apiKey: API_KEY }
            : undefined

      target = new PayloadRestDraftTarget({
        baseUrl: PAYLOAD_URL!,
        credential,
      })
    })

    afterAll(async () => {
      // Best-effort cleanup: delete any docs created by these tests.
      const authHeader = JWT_TOKEN
        ? `Bearer ${JWT_TOKEN}`
        : API_KEY
          ? `users API-Key ${API_KEY}`
          : undefined
      for (const { collection, id } of createdDocIds) {
        try {
          await fetch(`${PAYLOAD_URL}/api/${collection}/${id}`, {
            method: 'DELETE',
            headers: authHeader ? { Authorization: authHeader } : {},
          })
        } catch {
          // Ignore cleanup errors
        }
      }
    })

    // -----------------------------------------------------------------------
    // Core round-trip
    // -----------------------------------------------------------------------

    it('creates a draft and readback returns the stored document', async () => {
      const externalKey = testSlug('create-roundtrip')
      // site must be provided as a string so the CMS access control can
      // extract it via typeof === 'string' check (works for both UUID and
      // integer-as-string IDs).
      const data = {
        title: 'Integration Test Page',
        slug: externalKey,
        pageType: 'generic',
        site: String(SITE_ID!),
        locale: 'en',
      }

      const result = await target.upsertDraft('pages', externalKey, data)

      // payloadDocumentId must encode the collection and a non-empty doc ID
      expect(result.payloadDocumentId).toMatch(/^pages::/)
      const docId = extractPayloadId(result.payloadDocumentId)
      expect(docId).toBeTruthy()
      expect(result.resultChecksum).toBeTruthy()
      expect(result.resultChecksum).toMatch(/^[0-9a-f]{64}$/) // SHA-256 hex

      createdDocIds.push({ collection: 'pages', id: docId! })

      // readback must return the same document
      const readbackDoc = await target.readback(result.payloadDocumentId)
      expect(readbackDoc).not.toBeNull()
      // Payload may return the ID as an integer or string depending on the DB
      // adapter (postgres uses integer auto-increment IDs; UUID adapters use
      // strings). Compare as strings to be adapter-agnostic.
      expect(String(readbackDoc!['id'])).toBe(docId)
    })

    // -----------------------------------------------------------------------
    // Upsert idempotency (second call should update, not create)
    // -----------------------------------------------------------------------

    it('second upsert with the same externalKey issues a PATCH (not a second POST)', async () => {
      const externalKey = testSlug('upsert-idempotency')
      const data = {
        title: 'First Title',
        slug: externalKey,
        pageType: 'generic',
        site: String(SITE_ID!),
        locale: 'en',
      }

      const first = await target.upsertDraft('pages', externalKey, data)
      const firstDocId = extractPayloadId(first.payloadDocumentId)
      expect(firstDocId).toBeTruthy()
      createdDocIds.push({ collection: 'pages', id: firstDocId! })

      // Second upsert — updated title
      const second = await target.upsertDraft('pages', externalKey, {
        ...data,
        title: 'Updated Title',
      })
      const secondDocId = extractPayloadId(second.payloadDocumentId)

      // Must be the same Payload document ID — PATCH, not a second POST
      expect(secondDocId).toBe(firstDocId)

      // Checksum must change because the title changed
      expect(second.resultChecksum).not.toBe(first.resultChecksum)
    })

    // -----------------------------------------------------------------------
    // Readback returns null for a non-existent document
    // -----------------------------------------------------------------------

    it('readback returns null for a non-existent document ID', async () => {
      const result = await target.readback('pages::00000000-0000-0000-0000-000000000000')
      expect(result).toBeNull()
    })

    // -----------------------------------------------------------------------
    // Full PromotionService round-trip through the real target
    // -----------------------------------------------------------------------

    it('PromotionService produces a succeeded receipt when promotion and readback both succeed', async () => {
      const externalKey = testSlug('promotion-service-roundtrip')
      const service = new PromotionService(target)

      const request = {
        schemaVersion: { major: 1 as const, minor: 0 as const },
        promotionRequestId: `promo-${externalKey}`,
        idempotencyKey: `idem-${externalKey}`,
        targetSiteId: String(SITE_ID!),
        targetState: 'draft' as const,
        workingPackage: {
          workingPackageId: `pkg-${externalKey}`,
          workingPackageVersion: 1,
          packageChecksum: 'checksum-integration-test-1',
          items: [
            {
              sourceItemId: 'source-item-1',
              payloadCollection: 'pages',
              payloadOperation: 'create' as const,
              targetExternalKey: externalKey,
              data: {
                title: 'Promotion Service Integration Test',
                slug: externalKey,
                pageType: 'generic',
                site: String(SITE_ID!),
                locale: 'en',
              },
            },
          ],
        },
        assemblyManifestId: `manifest-${externalKey}`,
        requiredGateReceiptIds: [],
      }

      const receipt = await service.promote(request)

      expect(receipt.status).toBe('succeeded')
      expect(receipt.draftReleaseId).not.toBeNull()
      expect(receipt.itemResults).toHaveLength(1)
      expect(receipt.itemResults[0].status).toBe('succeeded')
      expect(receipt.itemResults[0].payloadDocumentId).toMatch(/^pages::/)
      expect(receipt.itemResults[0].resultChecksum).toMatch(/^[0-9a-f]{64}$/)

      const docId = extractPayloadId(receipt.itemResults[0].payloadDocumentId!)
      if (docId) {
        createdDocIds.push({ collection: 'pages', id: docId })
      }
    })
  },
)

// ---------------------------------------------------------------------------
// Skip report (always runs — documents what was skipped)
// ---------------------------------------------------------------------------

describe('PayloadRestDraftTarget integration — skip report', () => {
  it('documents what is needed to run the live integration tests', () => {
    if (runIntegration) {
      // If we got here, the env vars are set and the integration suite above ran.
      return
    }
    // This is an informational "test" that always passes but logs the skip
    // reason so CI reporters show a clear message.
    console.info(`[PayloadRestDraftTarget integration] SKIPPED — ${SKIP_REASON}`)
  })
})
