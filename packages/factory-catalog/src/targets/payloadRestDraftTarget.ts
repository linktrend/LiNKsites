/**
 * PayloadRestDraftTarget — real implementation of {@link PayloadDraftTarget}
 * that calls Payload CMS's REST API.
 *
 * ## API shape (Payload 3.x REST)
 *
 * upsertDraft flow:
 *   1. GET  /api/<collection>?where[<lookupField>][equals]=<externalKey>&draft=true&limit=1
 *      → finds an existing draft to update
 *   2a. PATCH /api/<collection>/<id>?draft=true   (doc exists)
 *   2b. POST  /api/<collection>?draft=true         (doc is new)
 *
 * readback flow:
 *   GET /api/<collection>/<id>?draft=true
 *   → compound payloadDocumentId encodes "<collection>/<id>" so readback
 *     knows which collection to query (Payload IDs are per-collection, not
 *     globally unique across all collections).
 *
 * ## Checksum
 * A deterministic SHA-256 hex digest of the canonical JSON form of the
 * response document (keys sorted). This uniquely identifies the document's
 * content at write time, matching the intent of manual §12.21's
 * readback-verification step.
 *
 * ## Authentication
 * Payload's REST API accepts `Authorization: Bearer <token>` where the
 * token is either a JWT from `POST /api/users/login` or an API key string
 * issued by `POST /api/users/:id/api-key`. Provide the api key / JWT via
 * {@link PayloadRestDraftTargetConfig.apiKey}.
 *
 * ## lookupField
 * Defaults to `'slug'`. Collections in the LiNKsites CMS all carry a
 * `slug` field (either as a plain text field or via `createSlugField()`).
 * Callers constructing a {@link WorkingPackageItem} must include the
 * externalKey value as the `slug` (or chosen `lookupField`) in the item
 * `data` payload -- the target will also ensure it is set on write via the
 * merged data (so a caller that forgets it in `data` still works).
 */

import type { PayloadDraftTarget } from '../promotionService.js'

export interface PayloadRestDraftTargetConfig {
  /** Base URL of the Payload CMS instance, e.g. `http://localhost:3000`. Trailing slash is stripped. */
  baseUrl: string
  /**
   * Credential for authenticated requests. Two formats are accepted:
   *
   * - **JWT token** (from `POST /api/users/login`): pass the raw token string;
   *   the header will be `Authorization: Bearer <token>`.
   * - **Payload API key** (from `POST /api/users/:id/api-key`): pass
   *   `{ collectionSlug: 'users', apiKey: '<key>' }`; the header will be
   *   `Authorization: users API-Key <key>`.
   *
   * Omit to make unauthenticated requests (works only against a Payload
   * instance in bootstrap mode — no users created yet).
   */
  credential?: string | { collectionSlug: string; apiKey: string }
  /**
   * The collection field used to look up existing documents by
   * `externalKey`. Defaults to `'slug'`. Must be an indexed, unique field
   * on the target collection so the lookup query reliably returns at most
   * one document.
   */
  lookupField?: string
}

type PayloadListResponse = {
  docs: Array<Record<string, unknown>>
  totalDocs: number
}

type PayloadDocResponse = Record<string, unknown>

/** Compound payloadDocumentId separator. Must not appear in Payload collection slugs. */
const ID_SEP = '::'

/**
 * Real {@link PayloadDraftTarget} that calls Payload CMS's REST API.
 *
 * Construct one instance per logical Payload endpoint and reuse it across
 * all promotion calls -- the instance is stateless and safe to share.
 */
export class PayloadRestDraftTarget implements PayloadDraftTarget {
  private readonly baseUrl: string
  private readonly credential: PayloadRestDraftTargetConfig['credential']
  private readonly lookupField: string

  constructor(config: PayloadRestDraftTargetConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '')
    this.credential = config.credential
    this.lookupField = config.lookupField ?? 'slug'
  }

  /**
   * Creates or updates a Payload draft document for the given collection and
   * external key, returning the compound document ID and a SHA-256 checksum
   * of the stored document.
   */
  async upsertDraft(
    collection: string,
    externalKey: string,
    data: Record<string, unknown>,
  ): Promise<{ payloadDocumentId: string; resultChecksum: string }> {
    const existing = await this.findByExternalKey(collection, externalKey)

    // Always include externalKey as the lookupField value in the written data
    // so future lookups can find this document.
    const writeData: Record<string, unknown> = { ...data, [this.lookupField]: externalKey }

    let responseDoc: PayloadDocResponse
    if (existing !== null) {
      const existingId = String(existing['id'])
      responseDoc = await this.patchDraft(collection, existingId, writeData)
    } else {
      responseDoc = await this.createDraft(collection, writeData)
    }

    // Payload wraps created/updated docs under a `doc` key on create (POST),
    // or returns the doc directly on update (PATCH). Normalise both.
    const doc = this.normaliseResponse(responseDoc)
    const docId = String(doc['id'])
    const resultChecksum = await computeChecksum(doc)

    return {
      payloadDocumentId: `${collection}${ID_SEP}${docId}`,
      resultChecksum,
    }
  }

  /**
   * Reads back a draft document using the compound ID returned by
   * {@link upsertDraft}. Returns the raw document object, or `null` if the
   * document cannot be retrieved (404, access denied, or any transport error).
   */
  async readback(payloadDocumentId: string): Promise<Record<string, unknown> | null> {
    const parsed = parseCompoundId(payloadDocumentId)
    if (parsed === null) return null
    const { collection, id } = parsed

    const url = `${this.baseUrl}/api/${collection}/${encodeURIComponent(id)}?draft=true`
    try {
      const response = await fetch(url, { headers: this.buildHeaders() })
      if (response.status === 404) return null
      if (!response.ok) return null
      const body = (await response.json()) as PayloadDocResponse
      return this.normaliseResponse(body)
    } catch {
      return null
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Queries the collection for an existing document matching the externalKey. */
  private async findByExternalKey(
    collection: string,
    externalKey: string,
  ): Promise<Record<string, unknown> | null> {
    const url = new URL(`${this.baseUrl}/api/${collection}`)
    url.searchParams.set(`where[${this.lookupField}][equals]`, externalKey)
    url.searchParams.set('draft', 'true')
    url.searchParams.set('limit', '1')
    url.searchParams.set('depth', '0')

    try {
      const response = await fetch(url.toString(), { headers: this.buildHeaders() })
      if (!response.ok) return null
      const body = (await response.json()) as PayloadListResponse
      return body.docs?.[0] ?? null
    } catch {
      return null
    }
  }

  /** Creates a new draft document via POST. */
  private async createDraft(
    collection: string,
    data: Record<string, unknown>,
  ): Promise<PayloadDocResponse> {
    const url = `${this.baseUrl}/api/${collection}?draft=true`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.buildHeaders() },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(
        `Payload POST /${collection} failed (${response.status} ${response.statusText})${body ? `: ${body}` : ''}`,
      )
    }
    return response.json() as Promise<PayloadDocResponse>
  }

  /** Updates an existing draft document via PATCH. */
  private async patchDraft(
    collection: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<PayloadDocResponse> {
    const url = `${this.baseUrl}/api/${collection}/${encodeURIComponent(id)}?draft=true`
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...this.buildHeaders() },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(
        `Payload PATCH /${collection}/${id} failed (${response.status} ${response.statusText})${body ? `: ${body}` : ''}`,
      )
    }
    return response.json() as Promise<PayloadDocResponse>
  }

  /**
   * Payload REST responses differ between POST and PATCH:
   * - POST creates: `{ message: '...', doc: { id, ...fields } }`
   * - PATCH updates: `{ message: '...', doc: { id, ...fields } }` (3.x)
   *   OR directly `{ id, ...fields }` in some versions.
   *
   * Normalise to always return the document object.
   */
  private normaliseResponse(raw: PayloadDocResponse): Record<string, unknown> {
    if (raw['doc'] !== undefined && typeof raw['doc'] === 'object' && raw['doc'] !== null) {
      return raw['doc'] as Record<string, unknown>
    }
    return raw
  }

  private buildHeaders(): Record<string, string> {
    const cred = this.credential
    if (!cred) return {}
    if (typeof cred === 'string') {
      return { Authorization: `Bearer ${cred}` }
    }
    return { Authorization: `${cred.collectionSlug} API-Key ${cred.apiKey}` }
  }
}

// ---------------------------------------------------------------------------
// Module-level helpers (pure, no this-binding)
// ---------------------------------------------------------------------------

/**
 * Parses a compound payloadDocumentId like `"pages::abc123"` into its
 * collection slug and Payload document ID. Returns `null` for malformed IDs.
 */
function parseCompoundId(compoundId: string): { collection: string; id: string } | null {
  const sepIdx = compoundId.indexOf(ID_SEP)
  if (sepIdx === -1 || sepIdx === 0 || sepIdx === compoundId.length - ID_SEP.length) {
    return null
  }
  return {
    collection: compoundId.slice(0, sepIdx),
    id: compoundId.slice(sepIdx + ID_SEP.length),
  }
}

/**
 * Computes a stable, deterministic SHA-256 hex digest of a document object.
 * Keys are sorted before serialisation to ensure the same object always
 * produces the same checksum regardless of property insertion order.
 *
 * Uses the Web Crypto API (`crypto.subtle`) which is available globally in
 * Node.js 19+ and all modern browsers.
 */
async function computeChecksum(doc: Record<string, unknown>): Promise<string> {
  const stable = stableStringify(doc)
  const buffer = new TextEncoder().encode(stable)
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Produces a deterministic JSON string by sorting object keys at every
 * nesting level.
 */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  const sorted = Object.keys(value as Record<string, unknown>)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`)
    .join(',')
  return `{${sorted}}`
}
