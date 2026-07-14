/**
 * Preview Deployment (Phase 4, Issue phase4-preview-deployment-001).
 *
 * Manual Section 10 defines Preview Deployment as one of its canonical
 * inventory object types: a controlled, rendered website instance with
 * a prospect adaptation, a proof version, a URL, an access policy, an
 * expiration, a separate analytics identity, and a quality receipt.
 * Section 10 §25 lists the required deployment identity fields
 * explicitly: a stable `previewId`, `prospectId`, a versioned Site
 * Assembly Manifest reference, a versioned Payload draft/preview
 * content reference, a SEPARATE analytics identity (manual doctrine
 * point 6, "every preview is isolated -- no mixing prospect
 * identities, assets, forms, analytics, data" across previews), safe
 * form/conversion behavior, an access policy, an expiration policy, an
 * indexing policy, and a deployment/quality receipt.
 *
 * The manual is explicit (Section 10 §3) that a preview is NOT a live
 * customer site -- it must never be indexable/public by careless
 * default, must not process live form submissions as if production,
 * and must not be treated as if it has customer-approved content.
 * `createPreviewDeployment()` enforces the "never indexable by
 * careless default" rule structurally: its input shape has no
 * `indexingPolicy` field at all, so every created deployment starts
 * `'noindex'` regardless of `accessPolicy`. Only
 * `markDeploymentAsIndexable()` can ever change that, and only under
 * a narrow, explicit condition.
 *
 * Honest scope boundaries:
 * - No live Payload/hosting integration exists in this repository
 *   (GAP-50). `payloadDraftContentRef` and any URL-shaped fields are
 *   opaque, caller-supplied strings, never verified against a real
 *   deployed site or document.
 * - No real Gate-receipt registry exists yet (the same honest-scope
 *   boundary as other Issues this session referencing gate receipt
 *   ids) -- `qualityReceiptRef` is an opaque, unvalidated reference.
 * - This module implements only the record shape and the
 *   isolation/servability/indexing invariants that are checkable with
 *   data that exists today: it does not implement actual preview
 *   rendering, form-safety enforcement, or a real conversion-tracking
 *   analytics pipeline.
 */

import type { SchemaVersion } from '@linksites/types'
import type { SiteAssemblyManifest } from './siteAssemblyManifest.js'

export type PreviewAccessPolicy = 'public' | 'token_required' | 'internal_only'
export type PreviewIndexingPolicy = 'noindex' | 'indexable'
export type PreviewDeploymentStatus = 'active' | 'expired' | 'locked' | 'archived'

export class PreviewDeploymentError extends Error {}

export interface PreviewDeployment {
  schemaVersion: SchemaVersion
  previewId: string
  prospectId: string
  siteAssemblyManifestId: string
  siteAssemblyManifestVersion: number
  /** Opaque ref to the Payload draft/preview content this deployment renders. No live Payload integration exists (GAP-50) -- this is a caller-supplied reference only, never verified against a real deployed document. */
  payloadDraftContentRef: string
  /** A SEPARATE analytics identity per preview (manual §10's isolation doctrine -- previews must never share analytics identity with each other or with a real customer site). */
  analyticsIdentityRef: string
  accessPolicy: PreviewAccessPolicy
  /** Manual §10.3: a preview must never be indexable by careless default -- see createPreviewDeployment()'s own validation of this. */
  indexingPolicy: PreviewIndexingPolicy
  status: PreviewDeploymentStatus
  createdAt: string
  expiresAt: string
  /** Opaque ref to a quality/deployment receipt (manual §10.25) -- no real Gate-receipt registry exists yet (same honest-scope boundary as other Issues this session referencing gate receipt ids), caller-supplied only. */
  qualityReceiptRef: string | null
}

export interface CreatePreviewDeploymentInput {
  previewId: string
  prospectId: string
  manifest: SiteAssemblyManifest
  payloadDraftContentRef: string
  analyticsIdentityRef: string
  accessPolicy: PreviewAccessPolicy
  /** Expiration timestamp (ISO string) -- must be strictly in the future relative to `now` (see below). */
  expiresAt: string
  qualityReceiptRef?: string | null
  /** Injectable "current time" for deterministic testing -- defaults to `new Date()` if omitted. */
  now?: Date
}

/**
 * Creates a new Preview Deployment record. Enforces:
 * 1. `input.expiresAt` must be strictly after `now` (throws
 *    PreviewDeploymentError if the preview would already be expired
 *    at creation time -- a preview created already-expired is
 *    meaningless).
 * 2. Manual §10.3's "must never be indexable by careless default"
 *    rule: if `input.accessPolicy === 'public'` AND no explicit
 *    `indexingPolicy` override is possible in this input shape (there
 *    isn't one -- see below), the resulting deployment's
 *    `indexingPolicy` is ALWAYS forced to `'noindex'`, regardless of
 *    accessPolicy. In other words: this function does not expose an
 *    `indexingPolicy` field on its input at all -- every created
 *    Preview Deployment starts as `'noindex'`. Only a SEPARATE,
 *    explicit function (see `markDeploymentAsIndexable()` below) can
 *    ever change that, and only under a narrow condition. This is
 *    deliberately restrictive by default, matching the manual's own
 *    "never by careless default" framing.
 * 3. Sets status to `'active'`.
 */
export function createPreviewDeployment(input: CreatePreviewDeploymentInput): PreviewDeployment {
  const now = input.now ?? new Date()
  const expiresAt = new Date(input.expiresAt)

  if (expiresAt.getTime() <= now.getTime()) {
    throw new PreviewDeploymentError(
      `Cannot create Preview Deployment "${input.previewId}": expiresAt (${input.expiresAt}) must be strictly after the current time (${now.toISOString()}) -- a preview created already-expired is meaningless.`,
    )
  }

  return {
    schemaVersion: { major: 1, minor: 0 },
    previewId: input.previewId,
    prospectId: input.prospectId,
    siteAssemblyManifestId: input.manifest.manifestId,
    siteAssemblyManifestVersion: input.manifest.manifestVersion,
    payloadDraftContentRef: input.payloadDraftContentRef,
    analyticsIdentityRef: input.analyticsIdentityRef,
    accessPolicy: input.accessPolicy,
    indexingPolicy: 'noindex',
    status: 'active',
    createdAt: now.toISOString(),
    expiresAt: input.expiresAt,
    qualityReceiptRef: input.qualityReceiptRef ?? null,
  }
}

/**
 * The ONLY way to make a Preview Deployment indexable: requires the
 * deployment's accessPolicy to already be `'public'` (throws
 * PreviewDeploymentError if it is `'token_required'` or
 * `'internal_only'` -- a non-public preview must never become
 * indexable) AND requires a non-null `qualityReceiptRef` to already be
 * present (throws PreviewDeploymentError otherwise) -- an unvalidated
 * preview must never be made indexable. Returns a NEW object (does not
 * mutate the input) with `indexingPolicy: 'indexable'`.
 */
export function markDeploymentAsIndexable(deployment: PreviewDeployment): PreviewDeployment {
  if (deployment.accessPolicy !== 'public') {
    throw new PreviewDeploymentError(
      `Cannot mark Preview Deployment "${deployment.previewId}" as indexable: accessPolicy is "${deployment.accessPolicy}", but only a "public" preview may ever become indexable.`,
    )
  }

  if (!deployment.qualityReceiptRef) {
    throw new PreviewDeploymentError(
      `Cannot mark Preview Deployment "${deployment.previewId}" as indexable: no qualityReceiptRef is present -- an unvalidated preview must never be made indexable.`,
    )
  }

  return {
    ...deployment,
    indexingPolicy: 'indexable',
  }
}

/**
 * Manual §10's isolation doctrine: no two Preview Deployments may
 * share the same `analyticsIdentityRef`. Throws
 * PreviewDeploymentError (naming both colliding previewIds) if any
 * collision is found across the given deployments; otherwise returns
 * without error.
 */
export function assertNoAnalyticsIdentityCollision(deployments: PreviewDeployment[]): void {
  const seenByAnalyticsIdentity = new Map<string, string>()

  for (const deployment of deployments) {
    const existingPreviewId = seenByAnalyticsIdentity.get(deployment.analyticsIdentityRef)
    if (existingPreviewId) {
      throw new PreviewDeploymentError(
        `Analytics identity collision: Preview Deployments "${existingPreviewId}" and "${deployment.previewId}" share the same analyticsIdentityRef ("${deployment.analyticsIdentityRef}") -- manual §10's isolation doctrine requires every preview to have a separate analytics identity.`,
      )
    }
    seenByAnalyticsIdentity.set(deployment.analyticsIdentityRef, deployment.previewId)
  }
}

/**
 * Returns true if the deployment is currently servable: status is
 * `'active'` AND `expiresAt` is strictly after the given `now`
 * (defaults to `new Date()`).
 */
export function isDeploymentServable(deployment: PreviewDeployment, now: Date = new Date()): boolean {
  return deployment.status === 'active' && new Date(deployment.expiresAt).getTime() > now.getTime()
}

/**
 * Returns a NEW deployment object (does not mutate the input) with
 * status transitioned to `'expired'` if `expiresAt` has passed
 * relative to `now` (defaults to `new Date()`) AND the current status
 * is `'active'`. If the deployment is not currently `'active'`
 * (e.g. already `'expired'`, `'locked'`, or `'archived'`), returns the
 * SAME object unchanged (no-op, not an error -- expiring an
 * already-non-active deployment is not itself a mistake worth
 * throwing over).
 */
export function expireIfPastDue(deployment: PreviewDeployment, now: Date = new Date()): PreviewDeployment {
  if (deployment.status !== 'active') {
    return deployment
  }

  if (new Date(deployment.expiresAt).getTime() > now.getTime()) {
    return deployment
  }

  return {
    ...deployment,
    status: 'expired',
  }
}
