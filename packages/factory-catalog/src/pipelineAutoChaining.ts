/**
 * Pipeline Auto-Chaining (Phase 3/4 integration, closes the remaining
 * "automatic pipeline chaining" half of GAP-04).
 *
 * `audit/14_implementation_roadmap.md` (Eighth work batch) and
 * `pipelineChaining.ts`'s own module doc both name the one piece of
 * GAP-04 that the pure mapping helpers deliberately did NOT do:
 * "automatic pipeline chaining across the three executors (Site
 * Specification -> Site Assembly -> Promotion as one flow) -- each is
 * independently dispatchable today, not yet auto-sequenced."
 *
 * WHY A SIBLING MODULE (not an edit to pipelineChaining.ts): that module
 * is explicitly, intentionally pure -- its own doc comment guarantees
 * "no side effects, no ledger interaction, no dispatch of the next
 * Issue." Adding ledger reads/writes and Issue creation there would
 * break that contract and its stated boundary. This module is the
 * honest, natural next layer: it REUSES those pure mappers
 * (`buildSiteAssemblyInputFromSiteSpecification`,
 * `buildPromotionRequestFromManifest`) and wraps them in the missing
 * "on Gate acceptance, create the next Issue" orchestration, using only
 * existing Program Ledger primitives (`getIssue`/`getRun`/`createIssue`).
 * It is a natural extension of what already exists, not a parallel
 * mechanism.
 *
 * GATE DISCIPLINE (the critical invariant): auto-chaining creates the
 * NEXT Issue if and ONLY if the CURRENT Issue's Gate has genuinely
 * passed. It NEVER bypasses or skips a Gate. Concretely, before creating
 * the next Issue it requires all three of:
 *   1. the supplied `GateResult.decision === 'accepted'`;
 *   2. the ledger's authoritative Issue state is `completed` (which the
 *      Program Ledger sets only on an accepted Gate -- see
 *      `ProgramLedger.decideGate`); and
 *   3. the Gate's Run actually `succeeded` and produced the expected
 *      output object to map from.
 * If the Gate was rejected (or anything else fails these checks), it
 * returns `{ chained: false, reason }` and creates NOTHING. The newly
 * created next Issue is created in its normal `ready` state and must run
 * and pass its OWN Gate before it, in turn, can chain onward -- no
 * verification step is skipped anywhere in the chain.
 *
 * WHAT THIS STILL DOES NOT DO: it does not invent the real content each
 * next stage needs (a `pagePlan` / information architecture, or a
 * `WorkingPackage` of real content items) -- exactly the boundary
 * `pipelineChaining.ts` documents. Those remain caller-supplied via the
 * `assemblyInput`/`promotionInput` options, propagated into the pure
 * mappers. This module supplies the sequencing; it does not fabricate
 * content this repository does not have.
 */

import type { CreateIssueInput, GateResult, Issue, ProgramLedger, SideEffectClass } from '@linksites/program-ledger'
import { SITE_ASSEMBLY_ISSUE_TYPE } from './executors/siteAssemblyExecutor.js'
import { SITE_SPECIFICATION_ISSUE_TYPE } from './executors/siteSpecificationExecutor.js'
import { PROMOTE_WORKING_PACKAGE_ISSUE_TYPE } from './executors/promotionExecutor.js'
import {
  buildPromotionRequestFromManifest,
  buildSiteAssemblyInputFromSiteSpecification,
  type BuildPromotionRequestExtras,
  type BuildSiteAssemblyInputExtras,
} from './pipelineChaining.js'
import type { SiteSpecification } from './siteSpecification.js'
import type { SiteAssemblyManifest } from './siteAssemblyManifest.js'

export class PipelineAutoChainingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PipelineAutoChainingError'
  }
}

/**
 * The outcome of an auto-chaining attempt. `chained: false` is a normal,
 * expected result (e.g. the Gate was rejected) -- NOT an error -- and
 * carries a human-readable `reason` for audit/logging. A genuinely
 * broken precondition (wrong source Issue type, missing/mismatched
 * ledger records) throws `PipelineAutoChainingError` instead, because it
 * indicates caller misuse rather than a legitimate "gate said no".
 */
export type PipelineChainOutcome =
  | { chained: true; nextIssue: Issue }
  | { chained: false; reason: string }

/** Program Ledger placement + governance metadata for the Issue this module creates. */
export interface NextIssuePlacement {
  programRef: string
  moduleRef?: string
  stageRef?: string
  sideEffectClass?: SideEffectClass
  maxAttempts?: number
  backoffBaseMs?: number
  backoffMaxMs?: number
  timeoutMs?: number
}

export interface ChainToSiteAssemblyOptions {
  /**
   * Real, caller-supplied inputs the Site Assembly stage additionally
   * needs (page plan, target manifest identity, etc.). Passed straight
   * into `buildSiteAssemblyInputFromSiteSpecification` -- this module
   * does NOT invent a pagePlan.
   */
  assemblyInput: BuildSiteAssemblyInputExtras
  /** Where/how to place the created Site Assembly Issue in the ledger. */
  placement: NextIssuePlacement
}

export interface ChainToPromotionOptions {
  /**
   * Real, caller-supplied inputs the Promotion stage additionally needs
   * (working package of content items, idempotency key, etc.). Passed
   * straight into `buildPromotionRequestFromManifest` -- this module does
   * NOT invent content.
   */
  promotionInput: BuildPromotionRequestExtras
  /** Where/how to place the created Promotion Issue in the ledger. */
  placement: NextIssuePlacement
}

function placementToCreateInput(
  issueType: string,
  input: Record<string, unknown>,
  placement: NextIssuePlacement,
): CreateIssueInput {
  return {
    issueType,
    programRef: placement.programRef,
    moduleRef: placement.moduleRef,
    stageRef: placement.stageRef,
    input,
    sideEffectClass: placement.sideEffectClass,
    maxAttempts: placement.maxAttempts,
    backoffBaseMs: placement.backoffBaseMs,
    backoffMaxMs: placement.backoffMaxMs,
    timeoutMs: placement.timeoutMs,
  }
}

/**
 * Resolves the accepted source Issue for a Gate result, enforcing the
 * gate-discipline invariant. Returns the successful Run's output when
 * (and only when) the Gate genuinely passed; otherwise returns a
 * `blocked` reason so the caller can record it and create nothing.
 *
 * Throws `PipelineAutoChainingError` only for caller misuse: a source
 * Issue whose type is not `expectedSourceIssueType`, or ledger records
 * that cannot be resolved at all.
 */
async function resolveAcceptedGateOutput(
  ledger: ProgramLedger,
  gateResult: GateResult,
  expectedSourceIssueType: string,
): Promise<{ ok: true; output: unknown } | { ok: false; reason: string }> {
  // 1. The Gate decision itself must be an acceptance. A rejected (or
  //    still-pending) Gate never chains -- this is the critical negative
  //    case that keeps chaining from bypassing verification.
  if (gateResult.decision !== 'accepted') {
    return { ok: false, reason: `Gate ${gateResult.gateId} for Issue ${gateResult.issueId} was not accepted (decision: "${gateResult.decision}") -- not chaining.` }
  }

  const issue = await ledger.getIssue(gateResult.issueId)
  if (!issue) {
    throw new PipelineAutoChainingError(`Source Issue ${gateResult.issueId} referenced by Gate ${gateResult.gateId} was not found in the ledger.`)
  }
  if (issue.issueType !== expectedSourceIssueType) {
    throw new PipelineAutoChainingError(
      `Gate ${gateResult.gateId} belongs to Issue type "${issue.issueType}", but this chaining step expects a "${expectedSourceIssueType}" source Issue.`,
    )
  }

  // 2. Cross-check against the ledger's authoritative state. The Program
  //    Ledger sets Issue.state to `completed` ONLY via an accepted Gate
  //    (decideGate). Requiring it here means a fabricated/mismatched
  //    GateResult cannot trick this module into chaining off an Issue the
  //    ledger itself does not consider gated-and-complete.
  if (issue.state !== 'completed') {
    return { ok: false, reason: `Source Issue ${gateResult.issueId} is in state "${issue.state}", not "completed" -- its Gate has not genuinely passed, so not chaining.` }
  }

  // 3. The Gate's Run must actually have succeeded and produced output to
  //    map from.
  const run = await ledger.getRun(gateResult.runId)
  if (!run) {
    throw new PipelineAutoChainingError(`Run ${gateResult.runId} referenced by Gate ${gateResult.gateId} was not found in the ledger.`)
  }
  if (run.state !== 'succeeded' || run.output == null) {
    return { ok: false, reason: `Run ${gateResult.runId} for Issue ${gateResult.issueId} did not produce a successful output (state: "${run.state}") -- not chaining.` }
  }

  return { ok: true, output: run.output }
}

function assertLooksLikeSiteSpecification(output: unknown): SiteSpecification {
  const spec = output as Partial<SiteSpecification>
  if (!spec || typeof spec.siteSpecId !== 'string' || typeof spec.siteRef !== 'string' || typeof spec.kitId !== 'string') {
    throw new PipelineAutoChainingError('Accepted Site Specification Run output is missing required fields (siteSpecId/siteRef/kitId) -- cannot map it to a Site Assembly input.')
  }
  return spec as SiteSpecification
}

function assertLooksLikeSiteAssemblyManifest(output: unknown): SiteAssemblyManifest {
  const manifest = output as Partial<SiteAssemblyManifest>
  if (!manifest || typeof manifest.manifestId !== 'string' || typeof manifest.siteId !== 'string' || manifest.schemaVersion == null) {
    throw new PipelineAutoChainingError('Accepted Site Assembly Run output is missing required fields (manifestId/siteId/schemaVersion) -- cannot map it to a Promotion request.')
  }
  return manifest as SiteAssemblyManifest
}

/**
 * When a Site Specification Issue's Gate has genuinely passed, creates
 * the next Issue in the chain -- a Site Assembly Issue -- with the Site
 * Specification's accepted output mapped as its input via the existing
 * `buildSiteAssemblyInputFromSiteSpecification` helper.
 *
 * Creates NOTHING (returns `{ chained: false }`) if the Gate was not
 * accepted. Does not dispatch the created Issue -- it is created `ready`
 * and must pass its own Gate before chaining onward.
 */
export async function chainSiteSpecificationToSiteAssembly(
  ledger: ProgramLedger,
  gateResult: GateResult,
  options: ChainToSiteAssemblyOptions,
): Promise<PipelineChainOutcome> {
  const gate = await resolveAcceptedGateOutput(ledger, gateResult, SITE_SPECIFICATION_ISSUE_TYPE)
  if (!gate.ok) return { chained: false, reason: gate.reason }

  const spec = assertLooksLikeSiteSpecification(gate.output)
  const assemblyInput = buildSiteAssemblyInputFromSiteSpecification(spec, options.assemblyInput)

  const nextIssue = await ledger.createIssue(
    placementToCreateInput(SITE_ASSEMBLY_ISSUE_TYPE, { ...assemblyInput }, options.placement),
  )
  return { chained: true, nextIssue }
}

/**
 * When a Site Assembly Issue's Gate has genuinely passed, creates the
 * next Issue in the chain -- a Promotion Issue -- with the Site Assembly
 * Manifest's accepted output mapped as its input via the existing
 * `buildPromotionRequestFromManifest` helper.
 *
 * Creates NOTHING (returns `{ chained: false }`) if the Gate was not
 * accepted. Does not dispatch the created Issue.
 */
export async function chainSiteAssemblyToPromotion(
  ledger: ProgramLedger,
  gateResult: GateResult,
  options: ChainToPromotionOptions,
): Promise<PipelineChainOutcome> {
  const gate = await resolveAcceptedGateOutput(ledger, gateResult, SITE_ASSEMBLY_ISSUE_TYPE)
  if (!gate.ok) return { chained: false, reason: gate.reason }

  const manifest = assertLooksLikeSiteAssemblyManifest(gate.output)
  const promotionRequest = buildPromotionRequestFromManifest(manifest, options.promotionInput)

  const nextIssue = await ledger.createIssue(
    placementToCreateInput(PROMOTE_WORKING_PACKAGE_ISSUE_TYPE, { ...promotionRequest }, options.placement),
  )
  return { chained: true, nextIssue }
}
