import type { LinksitesOversightProjection, StatusReference } from './oversightProjection.ts'
import { bindProviderBaseline, type BrainBaseline } from '@linksites/types'

export interface LinksitesOversightPublisher {
  publish(projection: LinksitesOversightProjection): Promise<void>
}

export interface LinksitesOversightReader {
  metadata(index?: string): Promise<unknown>
  evidence(references: readonly StatusReference[]): Promise<unknown>
}

/** Thin, injected boundary. It has no endpoint, credential, prompt, or provider mutation knowledge. */
export class BrainClient {
  private readonly baseline: BrainBaseline
  constructor(private readonly publisher: LinksitesOversightPublisher, private readonly reader: LinksitesOversightReader | undefined, baseline: unknown) {
    this.baseline = bindProviderBaseline('brain', baseline)
  }

  publish(projection: LinksitesOversightProjection): Promise<void> {
    bindProviderBaseline('brain', projection.providerBaseline)
    if (projection.profile !== 'linksites.oversight' || projection.profileVersion !== '1.0.0' || projection.contractVersion !== '2.0.0') {
      throw new Error('brain_profile_incompatible')
    }
    if (!projection.provenanceDigest || projection.metadata.authority !== 'advisory') {
      throw new Error('brain_provenance_missing')
    }
    return this.publisher.publish(projection)
  }

  async publishMetadata(projection: LinksitesOversightProjection): Promise<void> {
    bindProviderBaseline('brain', projection.providerBaseline)
    if (projection.profile !== 'linksites.oversight' || projection.profileVersion !== '1.0.0' || projection.contractVersion !== '2.0.0') {
      throw new Error('brain_profile_incompatible')
    }
    const metadataProjection: LinksitesOversightProjection = { ...projection, authoritativeLinksitesEvidence: { ...projection.authoritativeLinksitesEvidence, evidenceReferences: [] }, externalArtifactReferences: [] }
    await this.publisher.publish(metadataProjection)
  }

  async readMetadata(index?: string): Promise<unknown> {
    if (!this.reader) throw new Error('brain_reader_unavailable')
    return this.reader.metadata(index)
  }

  async readSelectedEvidence(references: readonly StatusReference[]): Promise<unknown> {
    if (!this.reader) throw new Error('brain_reader_unavailable')
    return this.reader.evidence(references)
  }
}

export function createBrainClient(publisher: LinksitesOversightPublisher, reader: LinksitesOversightReader | undefined, baseline: unknown): BrainClient { return new BrainClient(publisher, reader, baseline) }
