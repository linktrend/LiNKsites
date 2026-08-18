/**
 * Exact LiNKlibraries master-template look-and-feel pin.
 *
 * Identity remains master-template-type-1@1.0.0 draft / non_selectable.
 * Do not pin 3bf53b8 (superseded token-hygiene), d7997b6, 9bdee5dd, or b2d2bbb0.
 */
export const LINKLIBRARIES_REPOSITORY_URL = 'https://github.com/linktrend/LiNKlibraries.git' as const
export const MASTER_TEMPLATE_ENTRY_ID = 'master-template-type-1' as const
export const MASTER_TEMPLATE_VERSION = '1.0.0' as const

export const REJECTED_PROVIDER_SHA_PREFIXES = [
  'd7997b6e',
  '9bdee5dd',
  'b2d2bbb0',
  '3bf53b8b',
] as const

export const MASTER_TEMPLATE_PIN = Object.freeze({
  repositoryUrl: LINKLIBRARIES_REPOSITORY_URL,
  branch: 'issue/134-master-template-look-and-feel',
  commitSha: '6b87993ddaf403aebe7bef97bd268a543a1d14eb',
  entryId: MASTER_TEMPLATE_ENTRY_ID,
  version: MASTER_TEMPLATE_VERSION,
  artifactTreeSha1: 'a2bf0d2e7759e5e6952dacfdeab3ef9b03657d3d',
  releaseManifestSha256: '2d0a5f443ca3976478bbf883c091c26f7dc84f6e0fa44045746ea6f22048c35b',
  inventorySha256: 'bb749fbe4c4c11b50c6a5c96ea2bdfbdd343352bcf527f77cd9170b0e076ecbf',
  catalogueFileSha256: 'ab9dde0af419613e4a5a091b13a207d973242ad0546240452b7eb2924b56f05a',
  catalogueRecordsSha256: '03b52875dd3c2fcf5c8fa056560fd77e0986aca04ba69bd11ebf28c866b97f2c',
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
        `Refusing retired or superseded LiNKlibraries SHA prefix ${prefix}; pin issue/134 6b87993ddaf403aebe7bef97bd268a543a1d14eb.`,
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
