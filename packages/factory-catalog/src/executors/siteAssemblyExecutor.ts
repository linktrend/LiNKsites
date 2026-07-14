/**
 * Site Assembly Executor (Phase 3/4 integration, Issue
 * phase3-assembly-and-promotion-ledger-integration-001).
 *
 * Connects the Program Ledger to `assembleSiteManifest()`
 * (siteAssemblyManifest.ts) the same way `SiteSpecificationExecutor`
 * already connects it to `resolveSiteSpecification()`: a real
 * `ExecutorAdapter` that, when dispatched through the Ledger, actually
 * resolves a Site Assembly Manifest from real catalog data -- not a
 * synthetic echo.
 *
 * As with `SiteSpecificationExecutor`, `Issue.input` carries only
 * serializable business identifiers (manifestId, siteId, siteSpecId,
 * kitId, pagePlan, etc.), never live objects. The Kit/Site
 * Specification/Prospect Adaptation objects this executor needs are
 * resolved against injected in-memory catalog data, standing in for
 * what would eventually be Supabase-backed lookups once live
 * infrastructure is available (GAP-50).
 */

import type { ExecutorAdapter, ExecutorResult, Issue, Run } from '@linksites/program-ledger'
import { assembleSiteManifest, SiteAssemblyError, type PagePlanEntry, type SiteClass } from '../siteAssemblyManifest.js'
import { VerticalKitError, type VerticalKit } from '../verticalKit.js'
import type { SiteSpecification } from '../siteSpecification.js'
import type { ProspectAdaptation } from '../prospectAdaptation.js'
import { ComponentRegistryError, type ComponentRegistry } from '../componentRegistry.js'

export const SITE_ASSEMBLY_ISSUE_TYPE = 'linksites.factory.assemble_site_manifest'

export interface SiteAssemblyExecutorDeps {
  kits: Record<string, VerticalKit>
  siteSpecsById: Record<string, SiteSpecification>
  adaptationsById: Record<string, ProspectAdaptation>
  componentRegistry: ComponentRegistry
}

export interface SiteAssemblyExecutorInput {
  manifestId: string
  manifestVersion: number
  siteId: string
  siteClass: SiteClass
  siteSpecId: string
  adaptationId?: string
  kitId: string
  platformReleaseRef: string
  pagePlan: PagePlanEntry[]
}

function isValidInput(input: Record<string, unknown>): input is SiteAssemblyExecutorInput & Record<string, unknown> {
  return (
    typeof input.manifestId === 'string' &&
    typeof input.manifestVersion === 'number' &&
    typeof input.siteId === 'string' &&
    typeof input.siteClass === 'string' &&
    typeof input.siteSpecId === 'string' &&
    typeof input.kitId === 'string' &&
    typeof input.platformReleaseRef === 'string' &&
    Array.isArray(input.pagePlan) &&
    (input.adaptationId === undefined || typeof input.adaptationId === 'string')
  )
}

/**
 * Every known failure mode from `assembleSiteManifest()` and its
 * dependencies represents an inconsistent combination of real objects
 * requested by the caller, not a code defect or infrastructure
 * problem -- classified `invalid_input` (manual §20 §67), mirroring
 * `SiteSpecificationExecutor`'s own classification rule.
 */
function isKnownValidationError(error: unknown): error is Error {
  return error instanceof SiteAssemblyError || error instanceof VerticalKitError || error instanceof ComponentRegistryError
}

export class SiteAssemblyExecutor implements ExecutorAdapter {
  readonly executorId = 'linksites-site-assembly-executor'

  constructor(private readonly deps: SiteAssemblyExecutorDeps) {}

  canHandle(issueType: string): boolean {
    return issueType === SITE_ASSEMBLY_ISSUE_TYPE
  }

  async execute(issue: Issue, _run: Run): Promise<ExecutorResult> {
    if (!isValidInput(issue.input)) {
      return { kind: 'failure', failureClass: 'invalid_input', message: 'Issue input is missing one or more required fields for site assembly.' }
    }

    const kit = this.deps.kits[issue.input.kitId]
    const siteSpec = this.deps.siteSpecsById[issue.input.siteSpecId]
    const adaptation = issue.input.adaptationId ? this.deps.adaptationsById[issue.input.adaptationId] : undefined

    if (!kit) return { kind: 'failure', failureClass: 'invalid_input', message: `No Vertical Kit registered for kitId "${issue.input.kitId}".` }
    if (!siteSpec) return { kind: 'failure', failureClass: 'invalid_input', message: `No Site Specification registered for siteSpecId "${issue.input.siteSpecId}".` }
    if (issue.input.adaptationId && !adaptation) {
      return { kind: 'failure', failureClass: 'invalid_input', message: `No Prospect Adaptation registered for adaptationId "${issue.input.adaptationId}".` }
    }

    try {
      const manifest = assembleSiteManifest({
        manifestId: issue.input.manifestId,
        manifestVersion: issue.input.manifestVersion,
        siteId: issue.input.siteId,
        siteClass: issue.input.siteClass,
        siteSpec,
        adaptation,
        kit,
        componentRegistry: this.deps.componentRegistry,
        platformReleaseRef: issue.input.platformReleaseRef,
        pagePlan: issue.input.pagePlan,
      })
      return { kind: 'success', output: manifest }
    } catch (error) {
      if (isKnownValidationError(error)) {
        return { kind: 'failure', failureClass: 'invalid_input', message: error.message }
      }
      throw error
    }
  }
}
