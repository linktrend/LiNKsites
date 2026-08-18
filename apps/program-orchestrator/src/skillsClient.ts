import { SkillsPolicyError, type MinimalSkillsFeedback, type MinimalSkillsUseReport, type SkillPayload, type SkillPin, type SkillResourceKind, validateMinimalSkillsReport, verifySkillsReceipt } from './skillsPolicy.ts'
import { bindProviderBaseline, type SkillsBaseline } from '@linksites/types'

export interface SkillsRequest extends SkillPin {
  kind: SkillResourceKind
  fragmentId?: string
}

export interface SkillsTransport {
  retrieve(request: SkillsRequest): Promise<SkillPayload>
  submitUseReport?(report: MinimalSkillsUseReport): Promise<void>
  submitFeedback?(feedback: MinimalSkillsFeedback): Promise<void>
}

export interface SkillsClientOptions {
  baseline: unknown
  now?: () => Date
  allowlist?: readonly LinksitesSkillAllowlistEntry[]
}

export type LinksitesSkillAllowlistEntry = {
  skillId: string
  version: string
  inputSchemaRef: string
  outputSchemaRef: string
}

export const DEFAULT_LINKSITES_SKILL_ALLOWLIST: readonly LinksitesSkillAllowlistEntry[] = Object.freeze([])

/** Thin, injected LiNKsites consumer. It retrieves; the caller executes locally. */
export class SkillsClient {
  private readonly now: () => Date
  private readonly baseline: SkillsBaseline
  private readonly allowlist: readonly LinksitesSkillAllowlistEntry[]

  constructor(private readonly transport: SkillsTransport, options: SkillsClientOptions) {
    this.now = options.now ?? (() => new Date())
    this.baseline = bindProviderBaseline('skills', options.baseline)
    this.allowlist = options.allowlist ?? DEFAULT_LINKSITES_SKILL_ALLOWLIST
  }

  async retrieve(request: SkillsRequest): Promise<SkillPayload> {
    if (!request.skillId || !request.releaseId || !request.version || ['latest', 'native'].includes(request.releaseId.toLowerCase()) || ['latest', 'native'].includes(request.version.toLowerCase()) || !/^sha256:[a-f0-9]{64}$/u.test(request.digest)) throw new SkillsPolicyError('unPinnedExactRelease')
    const allowed = this.allowlist.find((entry) => entry.skillId === request.skillId && entry.version === request.version)
    if (!allowed) throw new SkillsPolicyError('unknownSkill')
    // One exact request only: no latest, native, name-only, catalogue dump, or retry fallback.
    const resource = await this.transport.retrieve(request)
    return verifySkillsReceipt(request.kind, request, resource, this.now(), this.baseline)
  }

  guide(pin: SkillPin) { return this.retrieve({ ...pin, kind: 'guide' }) }
  catalogue(pin: SkillPin) { return this.retrieve({ ...pin, kind: 'catalogue' }) }
  summary(pin: SkillPin) { return this.retrieve({ ...pin, kind: 'summary' }) }
  fragment(pin: SkillPin, fragmentId: string) { return this.retrieve({ ...pin, kind: 'fragment', fragmentId }) }
  release(pin: SkillPin) { return this.retrieve({ ...pin, kind: 'release' }) }

  async reportUse(report: MinimalSkillsUseReport): Promise<void> {
    validateMinimalSkillsReport(report)
    if (this.transport.submitUseReport) await this.transport.submitUseReport(report)
  }

  async submitFeedback(feedback: MinimalSkillsFeedback): Promise<void> {
    validateMinimalSkillsReport(feedback)
    if (this.transport.submitFeedback) await this.transport.submitFeedback(feedback)
  }
}
