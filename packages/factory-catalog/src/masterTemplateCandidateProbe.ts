/**
 * Bounded candidate probe for pre-admission paired proof.
 *
 * This path may inspect a draft / non_selectable master template. It does not
 * admit, activate, or make the release production-selectable.
 */
import { MASTER_TEMPLATE_PIN } from './masterTemplatePin.js'
import {
  type MasterTemplateBundle,
  type VerifiedMasterTemplatePin,
  verifyMasterTemplateBundle,
} from './masterTemplateConsumer.js'
import {
  ALLOWED_OVERRIDE_PATHS,
  FORBIDDEN_GENERATED_TOKEN_PATHS,
} from './masterTemplateOverridePolicy.js'
import {
  projectMasterTemplatePage,
  type LinksitesOwnedSiteCoordinates,
  type ProjectedMasterTemplatePage,
} from './masterTemplateSemanticProjection.js'

export interface MasterTemplateCandidateProbe {
  mode: 'candidate_probe'
  productionSelectable: false
  verified: VerifiedMasterTemplatePin
  allowedOverlayPaths: readonly string[]
  forbiddenGeneratedTokenPaths: readonly string[]
  starterPages: ProjectedMasterTemplatePage[]
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export function probeMasterTemplateCandidate(
  bundle: MasterTemplateBundle,
  site: LinksitesOwnedSiteCoordinates,
): MasterTemplateCandidateProbe {
  const verified = verifyMasterTemplateBundle(bundle)
  if (!isRecord(bundle.defaultContent) || !Array.isArray(bundle.defaultContent.pages)) {
    throw new Error('Candidate probe requires starter example pages from default-content.json.')
  }
  const starterPages = bundle.defaultContent.pages.map((page) => {
    if (!isRecord(page) || !Array.isArray(page.content)) {
      throw new Error('Starter example page is malformed.')
    }
    return projectMasterTemplatePage({
      archetypeId: page.archetypeId,
      title: String(page.title ?? page.slug ?? 'untitled'),
      slug: String(page.slug ?? ''),
      examplePath: typeof page.examplePath === 'string' ? page.examplePath : undefined,
      content: page.content.map((block) => {
        if (!isRecord(block) || typeof block.blockType !== 'string') {
          throw new Error('Starter example block is missing blockType.')
        }
        return {
          id: typeof block.id === 'string' ? block.id : undefined,
          blockType: block.blockType,
          data: isRecord(block.data) ? block.data : {},
        }
      }),
      site,
    })
  })
  return {
    mode: 'candidate_probe',
    productionSelectable: false,
    verified,
    allowedOverlayPaths: ALLOWED_OVERRIDE_PATHS,
    forbiddenGeneratedTokenPaths: FORBIDDEN_GENERATED_TOKEN_PATHS,
    starterPages,
  }
}

export function describeCandidateProbe(probe: MasterTemplateCandidateProbe): string {
  return `${probe.verified.pin.entryId}@${probe.verified.pin.version} inspected as draft candidate from ${MASTER_TEMPLATE_PIN.commitSha}; not production selectable.`
}
