/**
 * Exact LiNKlibraries master-template look-and-feel pin.
 *
 * Independently recomputed from protected LiNKlibraries development
 * 998c02c29fae5acc429804d7e03dcc74df7e7a52 (tree 63c7f6f8811b93f90a1dcc101cdeea94bdc6d4b3).
 * The A1 candidate is inspectable but remains draft / non_selectable. Provider
 * bytes remain external; this module stores identity and receipt coordinates.
 */
import type { Revision2ProviderPin } from './libraryProviderClient.ts'

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
  commitSha: '998c02c29fae5acc429804d7e03dcc74df7e7a52',
  providerTreeSha: '63c7f6f8811b93f90a1dcc101cdeea94bdc6d4b3',
  sourceReleaseCommitSha: '998c02c29fae5acc429804d7e03dcc74df7e7a52',
  sourceReleaseTreeSha: '63c7f6f8811b93f90a1dcc101cdeea94bdc6d4b3',
  entryId: MASTER_TEMPLATE_ENTRY_ID,
  version: MASTER_TEMPLATE_VERSION,
  artifactTreeSha1: '6aadb2dff52efe30f512ddb2a5510a881fc027e2',
  releaseManifestSha256: 'b4e0b141631694101b8daf5494499160b31e2ba6cbe66d0ec622f9690d567026',
  inventorySha256: '29262c08e9db2797ff292dc8179965c0ed080064a0b71d1bb477c4e0d63f0f72',
  payloadSha256: '884eaaa612a25167c84eb77dd271ee1413dabe6f08c56dc65464c5b464d2e4d6',
  dependencyLockSha256: '59f4db72af5de4731c68ee44b525f494c6cd067b42f8da310c345829f1b09c23',
  catalogueFileSha256: '5f9c0f6bbfcede994411f8dabe04a89809d7959550985e0a7dda8c9988be22ee',
  catalogueRecordsSha256: '749e2d6a340fad7be1fb68bad2d03c5f472a3976275048fa7a845bf3fd99f4ee',
  releaseReceiptSha256: '9e53946b4dadcec3e939bd1f42bb41b1d8851d29ac7c2de3f4a66dcdd9ce1021',
  catalogueBindingReceiptSha256: 'a1b47f09f981c4db4150ee2297a9c4cd6ca45a0f8487449ac1791147cd1aa6d3',
  retainedStagingArtifactTreeSha1: '95d0a2d168b60ba2b4afd32c71928efe3797d2bc',
  releaseSourceCommitSha: '1635a64f1d90efd049c959a7cf38ebac7ccbfdac',
  releaseSourceRepositoryTreeSha1: '873c4acc582050b416fb5a8bc59990345711df46',
  rollback: 'node scripts/v2/rebind-master-template-v2-release.mjs --version 2.0.0-a1.1 --rollback',
  catalogueBound: false,
  lifecycle: 'draft',
  selectability: 'non_selectable',
  compatibility: 'unknown',
  sourceRepository: 'LiNKsites',
})

export type MasterTemplatePin = typeof MASTER_TEMPLATE_PIN

export function masterTemplateRevision2Pin(): Revision2ProviderPin {
  return Object.freeze({
    sourceCommitSha: MASTER_TEMPLATE_PIN.sourceReleaseCommitSha,
    sourceTreeSha: MASTER_TEMPLATE_PIN.sourceReleaseTreeSha,
    providerCommitSha: MASTER_TEMPLATE_PIN.commitSha,
    providerTreeSha: MASTER_TEMPLATE_PIN.providerTreeSha,
    catalogueFileSha256: MASTER_TEMPLATE_PIN.catalogueFileSha256,
    catalogueRecordsSha256: MASTER_TEMPLATE_PIN.catalogueRecordsSha256,
    dependencyLockSha256: MASTER_TEMPLATE_PIN.dependencyLockSha256,
  })
}

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
