/**
 * Exact LiNKlibraries master-skeleton pin for this LiNKsites connection proof.
 *
 * Identity remains master-template-type-1@1.0.0 draft / non_selectable.
 * Do not pin d7997b6 (superseded skeleton), 9bdee5dd (PR #124), or b2d2bbb0
 * (retired #180 provider SHA).
 */
export const LINKLIBRARIES_REPOSITORY_URL = 'https://github.com/linktrend/LiNKlibraries.git' as const
export const MASTER_TEMPLATE_ENTRY_ID = 'master-template-type-1' as const
export const MASTER_TEMPLATE_VERSION = '1.0.0' as const

export const REJECTED_PROVIDER_SHA_PREFIXES = [
  'd7997b6e',
  '9bdee5dd',
  'b2d2bbb0',
] as const

export const MASTER_TEMPLATE_PIN = Object.freeze({
  repositoryUrl: LINKLIBRARIES_REPOSITORY_URL,
  branch: 'issue/133-master-template-token-override-hygiene',
  commitSha: '3bf53b8b407545fc7ed359f29cb8a5810295e8de',
  entryId: MASTER_TEMPLATE_ENTRY_ID,
  version: MASTER_TEMPLATE_VERSION,
  artifactTreeSha1: '92e6d6ad7b070671ad5b3b3ddadc4574309ce414',
  releaseManifestSha256: '0fcabbf2cf13239b66ebf9fa319dc64a3a109015191d9d434b7d69eb8e869a2f',
  inventorySha256: '25e3c8520db2081646cf8f41d5847d96a6a86c6f4b6fb6ab947d1f2e3595d53c',
  catalogueFileSha256: '7baf1d51ba0cba53bd3af97e8a228f44a516a44c512be1a250a5ed0c38e36c83',
  catalogueRecordsSha256: 'e70dd0605613e8305200658227cacf7f89f2f6a1dc6503ae7734a462035ed2d2',
  releaseSourceCommitSha: '1635a64f1d90efd049c959a7cf38ebac7ccbfdac',
  releaseSourceRepositoryTreeSha1: '873c4acc582050b416fb5a8bc59990345711df46',
  lifecycle: 'draft',
  selectability: 'non_selectable',
  compatibility: 'unknown',
  sourceRepository: 'LiNKsites',
})

export type MasterTemplatePin = typeof MASTER_TEMPLATE_PIN

export class MasterTemplateConsumerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MasterTemplateConsumerError'
  }
}

export function assertAdmissibleProviderSha(commitSha: string): void {
  const normalized = commitSha.trim().toLowerCase()
  for (const prefix of REJECTED_PROVIDER_SHA_PREFIXES) {
    if (normalized.startsWith(prefix)) {
      throw new MasterTemplateConsumerError(
        `Refusing retired or superseded LiNKlibraries SHA prefix ${prefix}; pin issue/133 3bf53b8b407545fc7ed359f29cb8a5810295e8de.`,
      )
    }
  }
  if (!/^[a-f0-9]{40}$/.test(normalized)) {
    throw new MasterTemplateConsumerError('LiNKlibraries consumption requires a full 40-character commit SHA.')
  }
  if (normalized !== MASTER_TEMPLATE_PIN.commitSha) {
    throw new MasterTemplateConsumerError(
      `Provider SHA ${normalized} is not the current master-template pin ${MASTER_TEMPLATE_PIN.commitSha}.`,
    )
  }
}
