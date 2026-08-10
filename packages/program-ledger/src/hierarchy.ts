/**
 * The durable Program -> Module -> Phase -> Issue -> Run vocabulary.
 *
 * The catalog below is intentionally small at the Phase/Issue level: it
 * contains the real first private-demo path that W2-02 will compose. The
 * remaining Modules retain their canonical purpose and are populated by the
 * packet that owns their execution detail rather than by invented placeholders.
 */

import type { SchemaVersion } from './types.js'
import { SCHEMA_VERSION } from './types.js'

export interface IssueDefinition {
  issueKey: string
  title: string
  issueType: string
  objective: string
  dependsOnIssueKeys: string[]
}

export interface PhaseDefinition {
  phaseId: string
  title: string
  objective: string
  issues: IssueDefinition[]
}

export interface ModuleDefinition {
  moduleId: string
  title: string
  purpose: string
  band: 'product-capability' | 'preview-production' | 'paid-fulfilment' | 'managed-service' | 'control-improvement'
  phases: PhaseDefinition[]
}

export interface ProgramDefinition {
  schemaVersion: SchemaVersion
  programId: string
  title: string
  modules: ModuleDefinition[]
}

const demo = (phaseId: string, title: string, objective: string, issues: IssueDefinition[]): PhaseDefinition => ({
  phaseId,
  title,
  objective,
  issues,
})

const issue = (issueKey: string, title: string, issueType: string, objective: string, dependsOnIssueKeys: string[] = []): IssueDefinition => ({
  issueKey,
  title,
  issueType,
  objective,
  dependsOnIssueKeys,
})

const FIRST_PRIVATE_DEMO_PHASES: Record<string, PhaseDefinition[]> = {
  M06: [
    demo('inventory', 'Preview inventory management', 'Match and reserve one compatible reusable foundation without conflicting reservations.', [
      issue('foundation-reservation', 'Reserve foundation inventory', 'foundation.reserve', 'Reserve a compatible foundation/template inventory item for the accepted preview request.', ['vertical-qualification']),
    ]),
  ],
  M07: [
    demo('intake', 'Lead intake and qualification', 'Accept and qualify one canonical lead package for the private demo.', [
      issue('lead-research', 'Pull and validate lead research', 'lead.research.validate', 'Validate the canonical lead/research package before any website work.'),
      issue('program-claim', 'Create the private-demo Program', 'program.claim', 'Idempotently create or recover the private-demo Program graph.', ['lead-research']),
      issue('vertical-qualification', 'Qualify vertical compatibility', 'lead.vertical.qualify', 'Confirm the lead can use an approved vertical foundation.', ['program-claim']),
      issue('library-verification', 'Verify exact library artifacts', 'library.verify', 'Verify the exact approved LiNKlibraries artifacts and SHA receipts.', ['foundation-reservation']),
    ]),
  ],
  M08: [
    demo('prospect-adaptation', 'Prospect site adaptation', 'Bind the approved foundation and exact library inputs to this prospect before content production.', [
      issue('site-specification', 'Build site specification and assembly manifest', 'site.plan', 'Produce the lead-specific site specification and assembly manifest from the reserved foundation and verified library.', ['library-verification']),
    ]),
  ],
  M09: [
    demo('content', 'Lead-specific content and media', 'Produce grounded copy and provenance-bearing media inputs.', [
      issue('information-architecture', 'Create information architecture and copy', 'content.information_architecture', 'Create lead-specific information architecture and copy inputs.', ['site-specification']),
      issue('media-provenance', 'Source and process media', 'content.media.provenance', 'Source/process media with a durable provenance manifest.', ['information-architecture']),
      issue('working-content-assembly', 'Assemble working-content version', 'content.working.assemble', 'Assemble and validate one immutable working-content version.', ['media-provenance']),
      issue('content-gates', 'Run content and quality gates', 'content.gates', 'Record evidence-backed content, schema, quality, security, privacy, and asset gate results.', ['working-content-assembly']),
    ]),
  ],
  M10: [
    demo('promotion', 'Working-to-Payload promotion', 'Promote only an accepted exact working-content version to Payload draft and verify parity.', [
      issue('payload-draft', 'Promote exact version to Payload draft', 'payload.draft.promote', 'Promote only the accepted working version to a Payload draft.', ['content-gates']),
      issue('payload-parity', 'Run CMS read-back parity gate', 'payload.readback.gate', 'Read the draft back and record field-level parity evidence.', ['payload-draft']),
    ]),
  ],
  M11: [
    demo('private-preview', 'Private Payload preview', 'Promote the accepted version to a private, non-indexable preview and verify it.', [
      issue('private-publication', 'Publish private preview', 'preview.private.publish', 'Publish only to the authorized private preview environment.', ['payload-parity']),
      issue('site-render-validation', 'Render and validate the private site', 'preview.render.validate', 'Render and validate the complete private preview.', ['private-publication']),
    ]),
  ],
  M12: [
    demo('completion', 'Evidence and completion', 'Capture final evidence and emit one replay-safe completion record.', [
      issue('final-evidence', 'Capture functional, visual, SEO, accessibility, and privacy evidence', 'preview.evidence.capture', 'Capture the required final evidence receipts for the private preview.', ['site-render-validation']),
      issue('completion-record', 'Emit CRM-shaped completion record', 'completion.emit', 'Emit exactly one evidence-backed completion record for the accepted private demo.', ['final-evidence']),
    ]),
  ],
}

const moduleDefinition = (
  moduleId: string,
  title: string,
  purpose: string,
  band: ModuleDefinition['band'],
): ModuleDefinition => ({ moduleId, title, purpose, band, phases: FIRST_PRIVATE_DEMO_PHASES[moduleId] ?? [] })

/** Canonical LiNKsites Program catalog. */
export const LINKSITES_PROGRAM: ProgramDefinition = {
  schemaVersion: SCHEMA_VERSION,
  programId: 'linksites',
  title: 'LiNKsites — autonomous website factory and managed-website business',
  modules: [
    moduleDefinition('M01', 'Product and Tier Governance', 'Governs product outcomes, tier specifications, add-ons, and exclusions.', 'product-capability'),
    moduleDefinition('M02', 'Design Intelligence Operations', 'Governs design tokens and site design profile resolution.', 'product-capability'),
    moduleDefinition('M03', 'Component and Frontend Platform', 'Governs the Component Registry and real apps/web-master components.', 'product-capability'),
    moduleDefinition('M04', 'Vertical Kit Operations', 'Governs vertical kit lifecycle and production patterns.', 'product-capability'),
    moduleDefinition('M05', 'Reusable Site Foundation Production', 'Governs reusable foundation lifecycle and adaptation contracts.', 'product-capability'),
    moduleDefinition('M06', 'Preview Inventory Management', 'Governs preview inventory reservations and cost records.', 'preview-production'),
    moduleDefinition('M07', 'Preview Request Intake and Planning', 'Validates preview requests and produces site specifications.', 'preview-production'),
    moduleDefinition('M08', 'Prospect Site Adaptation', 'Applies the prospect adaptation contract atop a reserved foundation.', 'preview-production'),
    moduleDefinition('M09', 'Content and Media Production', 'Produces grounded copy, media plans, and provenance manifests.', 'preview-production'),
    moduleDefinition('M10', 'Working-to-Payload Promotion', 'Operates the sole trusted path from working records to Payload drafts.', 'preview-production'),
    moduleDefinition('M11', 'Preview Deployment and Validation', 'Builds, tests, and validates private preview releases.', 'preview-production'),
    moduleDefinition('M12', 'Preview Outcome, Upgrade, Recycling', 'Handles Outcome Records and Conversion Lock wiring.', 'preview-production'),
    moduleDefinition('M13', 'Paid-Order Intake and Customer Finalization', 'Validates paid activation packages and customer site instances.', 'paid-fulfilment'),
    moduleDefinition('M14', 'Production Publication and Launch Certification', 'Operates launch readiness and launch certification.', 'paid-fulfilment'),
    moduleDefinition('M15', 'Domain, DNS, TLS, and Hosting Provisioning', 'Provisions approved custom hostnames and hosting assignments.', 'paid-fulfilment'),
    moduleDefinition('M16', 'Site Operations, Monitoring, and Recovery', 'Operates monitoring, incidents, and recovery.', 'managed-service'),
    moduleDefinition('M17', 'Customer Changes and Service Evolution', 'Handles entitlement-bounded customer change requests.', 'managed-service'),
    moduleDefinition('M18', 'Capacity, Regional Placement, and Infrastructure Scaling', 'Operates capacity and placement decisions.', 'managed-service'),
    moduleDefinition('M19', 'Suspension, Export, Termination, and Decommissioning', 'Handles suspension, export, and decommissioning.', 'managed-service'),
    moduleDefinition('M20', 'Quality, Cost, Performance, and Program Improvement', 'Operates cross-cutting quality, cost, and performance improvement.', 'control-improvement'),
  ],
}

export class HierarchyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'HierarchyError'
  }
}

export class HierarchyRegistry {
  constructor(private readonly programs: ProgramDefinition[] = [LINKSITES_PROGRAM]) {}

  getProgram(programId: string): ProgramDefinition | null {
    return this.programs.find((program) => program.programId === programId) ?? null
  }

  getModule(programId: string, moduleId: string): ModuleDefinition | null {
    return this.getProgram(programId)?.modules.find((module) => module.moduleId === moduleId) ?? null
  }

  getPhase(programId: string, moduleId: string, phaseId: string): PhaseDefinition | null {
    return this.getModule(programId, moduleId)?.phases.find((phase) => phase.phaseId === phaseId) ?? null
  }

  getIssue(programId: string, moduleId: string, phaseId: string, issueKey: string): IssueDefinition | null {
    return this.getPhase(programId, moduleId, phaseId)?.issues.find((candidate) => candidate.issueKey === issueKey) ?? null
  }

  /** Throws when any supplied hierarchy reference is unknown. */
  assertValidRefs(programRef: string, moduleRef?: string, phaseRef?: string): void {
    const program = this.getProgram(programRef)
    if (!program) throw new HierarchyError(`Unknown programRef "${programRef}" -- not a registered Program.`)
    if (moduleRef === undefined) {
      if (phaseRef !== undefined) throw new HierarchyError(`phaseRef "${phaseRef}" was provided without a moduleRef.`)
      return
    }
    const module = this.getModule(programRef, moduleRef)
    if (!module) throw new HierarchyError(`Unknown moduleRef "${moduleRef}" for Program "${programRef}".`)
    if (phaseRef !== undefined && !module.phases.some((phase) => phase.phaseId === phaseRef)) {
      throw new HierarchyError(`Unknown phaseRef "${phaseRef}" for Module "${moduleRef}".`)
    }
  }
}
