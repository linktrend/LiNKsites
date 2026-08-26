import type { Issue, Run } from './types.ts'
import type { ExecutorAdapter, ExecutorResult } from './executor.ts'
import {
  ExistingSiteMigrationEngine,
  ExistingSiteMigrationError,
  isMigrationIssueType,
  type CompatibilityKind,
  type PinRecord,
} from './existingSiteMigration.ts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new ExistingSiteMigrationError('siteIds must be a string array', 'invalid_pin')
  }
  return value
}

function readCompatibility(value: unknown): CompatibilityKind {
  if (value === 'compatible' || value === 'incompatible') return value
  throw new ExistingSiteMigrationError('compatibility must be compatible or incompatible', 'unknown_compatibility')
}

function readPin(value: unknown): PinRecord {
  if (!isRecord(value)) throw new ExistingSiteMigrationError('targetPin required', 'invalid_pin')
  const selectability = value.selectability
  if (selectability !== 'selectable' && selectability !== 'non_selectable' && selectability !== 'conditionally_selectable') {
    throw new ExistingSiteMigrationError('targetPin.selectability invalid', 'invalid_pin')
  }
  const required = ['repository', 'commitSha', 'treeSha', 'entryId', 'version', 'lifecycle', 'contractName', 'contractVersion', 'compatibleRange'] as const
  for (const key of required) {
    if (typeof value[key] !== 'string' || value[key].length === 0) {
      throw new ExistingSiteMigrationError(`targetPin.${key} required`, 'invalid_pin')
    }
  }
  return {
    repository: value.repository as string,
    commitSha: value.commitSha as string,
    treeSha: value.treeSha as string,
    entryId: value.entryId as string,
    version: value.version as string,
    lifecycle: value.lifecycle as string,
    selectability,
    contractName: value.contractName as string,
    contractVersion: value.contractVersion as string,
    compatibleRange: value.compatibleRange as string,
  }
}

/**
 * Ledger executor adapter for copied existing-site plan/apply/verify/rollback.
 * Gate acceptance remains a distinct ledger authority.
 */
export class ExistingSiteMigrationExecutor implements ExecutorAdapter {
  readonly executorId = 'existing-site-migration'

  constructor(private readonly engine: ExistingSiteMigrationEngine) {}

  canHandle(issueType: string): boolean {
    return isMigrationIssueType(issueType)
  }

  async execute(issue: Issue, _run: Run): Promise<ExecutorResult> {
    try {
      if (!isMigrationIssueType(issue.issueType)) {
        return { kind: 'failure', failureClass: 'invalid_input', message: `unsupported issue type ${issue.issueType}` }
      }
      switch (issue.issueType) {
        case 'site.migration.plan': {
          const plan = this.engine.plan({
            siteIds: readStringArray(issue.input.siteIds),
            targetPin: readPin(issue.input.targetPin),
            compatibility: readCompatibility(issue.input.compatibility),
            deliberate: issue.input.deliberate === true,
          })
          return { kind: 'success', output: plan }
        }
        case 'site.migration.apply': {
          const planId = String(issue.input.planId ?? '')
          return { kind: 'success', output: this.engine.apply(planId) }
        }
        case 'site.migration.verify': {
          const planId = String(issue.input.planId ?? '')
          const unselected = Array.isArray(issue.input.unselectedSiteIds)
            ? issue.input.unselectedSiteIds.filter((item): item is string => typeof item === 'string')
            : []
          return { kind: 'success', output: this.engine.verify(planId, unselected) }
        }
        case 'site.migration.rollback': {
          const planId = String(issue.input.planId ?? '')
          return { kind: 'success', output: this.engine.rollback(planId) }
        }
        default: {
          const exhaustive: never = issue.issueType
          return { kind: 'failure', failureClass: 'invalid_input', message: `unhandled ${String(exhaustive)}` }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'existing-site migration failed'
      const code = error instanceof ExistingSiteMigrationError ? error.code : 'unknown'
      if (code === 'deliberate_migration_required' || code === 'default_must_not_move_existing' || code === 'invalid_pin' || code === 'unknown_compatibility') {
        return { kind: 'failure', failureClass: 'invalid_input', message }
      }
      return { kind: 'failure', failureClass: 'code_defect', message }
    }
  }
}
