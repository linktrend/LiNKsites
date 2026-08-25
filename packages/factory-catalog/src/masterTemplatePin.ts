/**
 * Exact LiNKlibraries master-template look-and-feel pin.
 *
 * The A1 candidate is inspectable but remains draft / non_selectable. Provider
 * bytes remain external; this module stores identity and receipt coordinates.
 */
export const LINKLIBRARIES_REPOSITORY_URL = 'https://github.com/linktrend/LiNKlibraries.git' as const
export const MASTER_TEMPLATE_ENTRY_ID = 'master-template-type-1' as const
export const MASTER_TEMPLATE_VERSION = '2.0.0-a1.1' as const

export const REJECTED_PROVIDER_SHA_PREFIXES = [
  'd7997b6e',
  '9bdee5dd',
  'b2d2bbb0',
  '3bf53b8b',
] as const

export const MASTER_TEMPLATE_PIN = Object.freeze({
  repositoryUrl: LINKLIBRARIES_REPOSITORY_URL,
  branch: 'development',
  commitSha: 'dbf749cb48ffa03bf2e702d37b608f14c63e0520',
  providerTreeSha: 'a968c801f0fa7cbeac40edc788a4f081617e2759',
  sourceReleaseCommitSha: 'f28fd53d454cbc33d97951d8e62826dae5a83e40',
  sourceReleaseTreeSha: '34dc7467f4eb382ab7fbe258c5adc0f857d8ab5b',
  entryId: MASTER_TEMPLATE_ENTRY_ID,
  version: MASTER_TEMPLATE_VERSION,
  artifactTreeSha1: 'a8c6c23fd41a5f0eb9221276998f96862a50119f',
  releaseManifestSha256: 'd681e5305b611aa5247a0fa1711ce75e0a1734e121e6790e50c802b26c1c9697',
  inventorySha256: 'ad743168022139e7e70bd38ae19c56503cdfc2c4fcc912ece154f4f17b70cc98',
  catalogueFileSha256: 'da2178f497593c858611a29e40c53fa7798e31fa3cc3700bcf4e1c4a1f309543',
  catalogueRecordsSha256: '66a8971e38cc9bfb06836d8427534ca96de68065d0fca3b28f992e83584c7674',
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
