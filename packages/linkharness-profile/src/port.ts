import { LINKSITES_PROFILE } from "./profile.ts";
import type { ProfilePort } from "./types.ts";

export function createLinksitesProfilePort(): ProfilePort {
  return {
    identity: () => LINKSITES_PROFILE.identity,
    compatibleHarnessRange: () => LINKSITES_PROFILE.compatibleHarnessRange,
    definition: () => LINKSITES_PROFILE,
    enabledAdapters: () => LINKSITES_PROFILE.adapters,
    redaction: () => LINKSITES_PROFILE.redaction,
    compatibility: () => LINKSITES_PROFILE.compatibility,
  };
}
