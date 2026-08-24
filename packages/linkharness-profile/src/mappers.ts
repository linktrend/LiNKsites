import type { ProfileRecord, WebsiteDomainPayload } from "./types.ts";

function payload(profile: ProfileRecord): WebsiteDomainPayload {
  return profile.domainPayload as unknown as WebsiteDomainPayload;
}

export function siteTransitionMapper(profile: ProfileRecord, from: string, to: string) {
  return payload(profile).siteTransitionMappers.find((mapper) => mapper.from === from && mapper.to === to);
}

export function evidenceMapper(profile: ProfileRecord, domainVerdict: string) {
  return payload(profile).evidenceMappers.find((mapper) => mapper.domainVerdict === domainVerdict);
}
