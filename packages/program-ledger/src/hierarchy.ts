/**
 * Program/Module/Stage hierarchy (Phase 2, Issue phase2-program-hierarchy-001).
 *
 * The LiNKsites Program Manual (§01, §05) is explicit that LiNKsites itself
 * IS one Program, decomposed into 20 named Modules (M01-M20) grouped into
 * four functional bands: product/capability (M01-M05), preview-production
 * (M06-M12), paid-fulfilment (M13-M15), managed-service (M16-M19), and
 * control/improvement (M20). This file makes that hierarchy a real,
 * queryable object instead of the opaque `programRef`/`moduleRef`/
 * `stageRef` strings that `packages/program-ledger/src/types.ts` accepted
 * with a documented "not yet built" caveat.
 *
 * Scope: this models the LiNKsites Program's own Modules as static,
 * versioned data (per docs/archive/policies/CONTRACT_AND_SCHEMA_VERSIONING_POLICY.md).
 * Stage-level decomposition within each Module is deliberately left open
 * (`stages: []`) -- the manual's Section 05 defines Module *purpose* in
 * detail but Stage-level breakdown is Module-specific detail owned by
 * each Module's own future implementation work, not invented here.
 */

import type { SchemaVersion } from './types.js'
import { SCHEMA_VERSION } from './types.js'

export interface StageDefinition {
  stageId: string
  title: string
}

export interface ModuleDefinition {
  moduleId: string
  title: string
  /** One-line purpose, drawn from manual §05's Module descriptions. */
  purpose: string
  band: 'product-capability' | 'preview-production' | 'paid-fulfilment' | 'managed-service' | 'control-improvement'
  stages: StageDefinition[]
}

export interface ProgramDefinition {
  schemaVersion: SchemaVersion
  programId: string
  title: string
  modules: ModuleDefinition[]
}

/**
 * The LiNKsites Program itself, per manual §05. This is the ONE Program
 * this repository's Program Ledger is currently scoped to govern -- the
 * manual's cross-Program contracts (Sales, Odoo, Stripe) are explicitly
 * separate Programs this repository does not own (manual §02, §21) and
 * are not modeled here.
 */
export const LINKSITES_PROGRAM: ProgramDefinition = {
  schemaVersion: SCHEMA_VERSION,
  programId: 'linksites',
  title: 'LiNKsites — autonomous website factory and managed-website business',
  modules: [
    { moduleId: 'M01', title: 'Product & Tier Governance', purpose: 'Governs product outcomes, tier specifications, add-ons, and exclusions.', band: 'product-capability', stages: [] },
    { moduleId: 'M02', title: 'Design Intelligence Operations', purpose: 'Governs the Design Intelligence Catalog, tokens, and site design profile resolution.', band: 'product-capability', stages: [] },
    { moduleId: 'M03', title: 'Component & Frontend Platform Operations', purpose: 'Governs the Component Registry, Site Assembly Engine, and platform releases.', band: 'product-capability', stages: [] },
    { moduleId: 'M04', title: 'Vertical Kit Operations', purpose: 'Governs Vertical Kit lifecycle, Kit Tier Variants, and vertical-specific production patterns.', band: 'product-capability', stages: [] },
    { moduleId: 'M05', title: 'Reusable Foundation Production', purpose: 'Governs Reusable Site Foundation lifecycle, manifests, and adaptation contracts.', band: 'product-capability', stages: [] },
    { moduleId: 'M06', title: 'Preview Inventory Management', purpose: 'Governs the Preview Inventory portfolio, foundation reservations, and cost ledger.', band: 'preview-production', stages: [] },
    { moduleId: 'M07', title: 'Preview Intake & Planning', purpose: 'Validates Preview Production Requests and produces Site Specifications.', band: 'preview-production', stages: [] },
    { moduleId: 'M08', title: 'Prospect Site Adaptation', purpose: 'Applies the Prospect Adaptation Contract atop a reserved foundation.', band: 'preview-production', stages: [] },
    { moduleId: 'M09', title: 'Content & Media Production', purpose: 'Produces Copy Bundles, Media Plans, and Provenance Manifests from Lead Research Packages.', band: 'preview-production', stages: [] },
    { moduleId: 'M10', title: 'Working-to-Payload Promotion', purpose: 'Operates the Promotion Service, the sole trusted path from Supabase working records to Payload drafts.', band: 'preview-production', stages: [] },
    { moduleId: 'M11', title: 'Preview Deployment & Validation', purpose: 'Builds, tests, and deploys Preview Releases and records Quality Gate results.', band: 'preview-production', stages: [] },
    { moduleId: 'M12', title: 'Preview Outcome, Upgrade & Recycling', purpose: 'Handles conversion locks, upgrades, and the cleansing/recycling pipeline for unsold previews.', band: 'preview-production', stages: [] },
    { moduleId: 'M13', title: 'Paid Order Intake & Customer Finalization', purpose: 'Validates Paid Website Activation Packages and creates Customer Site Instances.', band: 'paid-fulfilment', stages: [] },
    { moduleId: 'M14', title: 'Production Publication & Launch Certification', purpose: 'Operates the launch readiness Gate, Launch Manifest, and Launch Certificate.', band: 'paid-fulfilment', stages: [] },
    { moduleId: 'M15', title: 'Domain, DNS, TLS & Hosting Provisioning', purpose: 'Provisions custom hostnames, certificates, and hosting assignments for launched sites.', band: 'paid-fulfilment', stages: [] },
    { moduleId: 'M16', title: 'Site Operations, Monitoring & Recovery', purpose: 'Operates monitoring, incident response, and autonomous remediation for live sites.', band: 'managed-service', stages: [] },
    { moduleId: 'M17', title: 'Customer Changes & Service Evolution', purpose: 'Handles Customer Change Requests and entitlement-bounded scope changes.', band: 'managed-service', stages: [] },
    { moduleId: 'M18', title: 'Capacity, Regional Placement & Scaling', purpose: 'Operates the placement engine, capacity forecasting, and regional bundling decisions.', band: 'managed-service', stages: [] },
    { moduleId: 'M19', title: 'Suspension, Export & Termination', purpose: 'Handles payment-driven suspension, customer data export, and decommissioning.', band: 'managed-service', stages: [] },
    { moduleId: 'M20', title: 'Quality, Cost & Performance Improvement', purpose: 'Operates cross-cutting observability, cost accounting, and continuous-improvement loops.', band: 'control-improvement', stages: [] },
  ],
}

export class HierarchyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'HierarchyError'
  }
}

/**
 * Validates that a `programRef`/`moduleRef`/`stageRef` triple (as accepted
 * by `Issue` in types.ts) refers to a real, known Program/Module/Stage.
 * Stage validation is a no-op for now since no Module defines Stages yet
 * (see the module-level doc comment) -- an unset `stageRef` is always
 * valid, and any provided `stageRef` is currently rejected until a Module
 * actually defines Stages, so callers get an explicit error rather than a
 * silently-ignored value.
 */
export class HierarchyRegistry {
  constructor(private readonly programs: ProgramDefinition[] = [LINKSITES_PROGRAM]) {}

  getProgram(programId: string): ProgramDefinition | null {
    return this.programs.find((p) => p.programId === programId) ?? null
  }

  getModule(programId: string, moduleId: string): ModuleDefinition | null {
    const program = this.getProgram(programId)
    if (!program) return null
    return program.modules.find((m) => m.moduleId === moduleId) ?? null
  }

  /** Throws HierarchyError if the refs don't resolve; returns nothing on success. */
  assertValidRefs(programRef: string, moduleRef?: string, stageRef?: string): void {
    const program = this.getProgram(programRef)
    if (!program) {
      throw new HierarchyError(`Unknown programRef "${programRef}" -- not a registered Program.`)
    }
    if (moduleRef !== undefined) {
      const module_ = this.getModule(programRef, moduleRef)
      if (!module_) {
        throw new HierarchyError(`Unknown moduleRef "${moduleRef}" for Program "${programRef}".`)
      }
      if (stageRef !== undefined) {
        const stage = module_.stages.find((s) => s.stageId === stageRef)
        if (!stage) {
          throw new HierarchyError(
            `Unknown stageRef "${stageRef}" for Module "${moduleRef}" -- this Module has not defined any Stages yet.`,
          )
        }
      }
    } else if (stageRef !== undefined) {
      throw new HierarchyError(`stageRef "${stageRef}" was provided without a moduleRef.`)
    }
  }
}
