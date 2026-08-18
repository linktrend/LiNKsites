/**
 * Consumer-side overlay policy derived from the pinned Library
 * derivation/policy.json. Allowed overlays stay on authored sources.
 * Generated token projections fail closed.
 */
import { MasterTemplateConsumerError } from './masterTemplatePin.js'

export const ALLOWED_OVERRIDE_PATHS = [
  'artifact/content/default-content.json',
  'artifact/design/theme.json',
  'artifact/modules/manifest.json#/modules/*/enabledByDefault',
] as const

export const FORBIDDEN_GENERATED_TOKEN_PATHS = [
  'artifact/design/tokens.css',
  'artifact/design/tokens.json',
  'artifact/design/variants.json',
] as const

export type OverlayKind = 'vertical' | 'type'

export interface TemplateOverlayAttempt {
  path: string
  kind?: OverlayKind
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export function assertDerivationPolicy(policy: unknown): void {
  if (!isRecord(policy)) throw new MasterTemplateConsumerError('Derivation policy is not an object.')
  const allowed = policy.allowedOverridePaths
  const forbidden = policy.forbiddenOverridePaths
  if (!Array.isArray(allowed) || !Array.isArray(forbidden)) {
    throw new MasterTemplateConsumerError('Derivation policy is missing allowed/forbidden override paths.')
  }
  for (const path of ALLOWED_OVERRIDE_PATHS) {
    if (!allowed.includes(path)) {
      throw new MasterTemplateConsumerError(`Pinned derivation policy no longer allows overlay path "${path}".`)
    }
  }
  for (const path of FORBIDDEN_GENERATED_TOKEN_PATHS) {
    if (!forbidden.includes(path)) {
      throw new MasterTemplateConsumerError(`Pinned derivation policy must forbid generated token overlay "${path}".`)
    }
  }
}

function matchesAllowed(path: string): boolean {
  if ((ALLOWED_OVERRIDE_PATHS as readonly string[]).includes(path)) return true
  return path.startsWith('artifact/modules/manifest.json#/modules/') && path.endsWith('/enabledByDefault')
}

export function assertOverlayAllowed(attempt: TemplateOverlayAttempt): void {
  const path = attempt.path
  if ((FORBIDDEN_GENERATED_TOKEN_PATHS as readonly string[]).includes(path)) {
    throw new MasterTemplateConsumerError(
      `Generated token overlay "${path}" is forbidden; overlays may change theme.json, default-content.json, or module enabledByDefault only.`,
    )
  }
  if (!matchesAllowed(path)) {
    throw new MasterTemplateConsumerError(`Overlay path "${path}" is not an allowed authored overlay.`)
  }
}
