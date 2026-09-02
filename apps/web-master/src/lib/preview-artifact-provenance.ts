import { createHash } from "node:crypto";

export const PREVIEW_ARTIFACT_PROVENANCE_VERSION = 1 as const;

export interface PreviewArtifactInputs {
  siteId: string;
  locale: string;
  contentSha256: string;
  templateTreeSha1: string;
  rendererSha256: string;
}

export interface PreviewArtifactProvenance extends PreviewArtifactInputs {
  schemaVersion: typeof PREVIEW_ARTIFACT_PROVENANCE_VERSION;
  artifactId: string;
}

export interface PreviewArtifactCache<T> {
  readActive(scope: string): Promise<PreviewArtifactProvenance | undefined>;
  readArtifact(artifactId: string): Promise<T | undefined>;
  writeArtifact(artifactId: string, value: T): Promise<void>;
  activate(scope: string, provenance: PreviewArtifactProvenance): Promise<void>;
  removeArtifact(artifactId: string): Promise<void>;
}

const SHA256 = /^[a-f0-9]{64}$/;
const SHA1 = /^[a-f0-9]{40}$/;

function requireIdentity(label: string, value: string): string {
  const normalized = value.trim();
  if (!normalized || normalized !== value) throw new Error(`${label} must be a non-empty canonical value.`);
  return normalized;
}

export function previewArtifactScope(inputs: Pick<PreviewArtifactInputs, "siteId" | "locale">): string {
  return `${encodeURIComponent(inputs.siteId)}:${encodeURIComponent(inputs.locale)}`;
}

/**
 * Produces the immutable identity of rendered preview bytes. Operational data
 * such as timestamps and cache locations is intentionally outside this hash.
 */
export function createPreviewArtifactProvenance(inputs: PreviewArtifactInputs): PreviewArtifactProvenance {
  const projection = {
    schemaVersion: PREVIEW_ARTIFACT_PROVENANCE_VERSION,
    siteId: requireIdentity("siteId", inputs.siteId),
    locale: requireIdentity("locale", inputs.locale),
    contentSha256: inputs.contentSha256,
    templateTreeSha1: inputs.templateTreeSha1,
    rendererSha256: inputs.rendererSha256,
  };

  if (!SHA256.test(projection.contentSha256)) throw new Error("contentSha256 must be a lowercase SHA-256 digest.");
  if (!SHA1.test(projection.templateTreeSha1)) throw new Error("templateTreeSha1 must be a lowercase SHA-1 digest.");
  if (!SHA256.test(projection.rendererSha256)) throw new Error("rendererSha256 must be a lowercase SHA-256 digest.");

  const digest = createHash("sha256").update(JSON.stringify(projection)).digest("hex");
  return { ...projection, artifactId: `preview-v1-${digest}` };
}

/**
 * Publishes a locally built artifact and removes the formerly active bytes only
 * after the new bytes and pointer are durable. Replaying identical inputs is a
 * cache hit and performs no writes.
 */
export async function publishPreviewArtifact<T>(
  cache: PreviewArtifactCache<T>,
  inputs: PreviewArtifactInputs,
  build: () => Promise<T>,
): Promise<{ provenance: PreviewArtifactProvenance; cacheHit: boolean; invalidatedArtifactId?: string }> {
  const provenance = createPreviewArtifactProvenance(inputs);
  const scope = previewArtifactScope(inputs);
  const active = await cache.readActive(scope);
  const cached = await cache.readArtifact(provenance.artifactId);

  if (active?.artifactId === provenance.artifactId && cached !== undefined) {
    return { provenance, cacheHit: true };
  }

  const artifact = cached ?? (await build());
  if (cached === undefined) await cache.writeArtifact(provenance.artifactId, artifact);
  await cache.activate(scope, provenance);

  if (active && active.artifactId !== provenance.artifactId) {
    await cache.removeArtifact(active.artifactId);
    return { provenance, cacheHit: false, invalidatedArtifactId: active.artifactId };
  }

  return { provenance, cacheHit: false };
}
