import { LINKSITES_PROFILE } from "./profile.ts";
import type { ConfigurationRedactionPort, ProfileRecord } from "./types.ts";

const PLACEHOLDER = "[REDACTED]";

function containsDeniedToken(path: string, deniedPaths: readonly string[]): boolean {
  const lower = path.toLowerCase();
  return deniedPaths.some((token) => lower.includes(token.toLowerCase()));
}

export function createConfigurationRedactionPort(
  profile: ProfileRecord = LINKSITES_PROFILE,
): ConfigurationRedactionPort {
  const denied = profile.redaction.deniedPaths;

  const redact = (value: unknown, path = ""): unknown => {
    if (path && containsDeniedToken(path, denied)) return PLACEHOLDER;
    if (Array.isArray(value)) return value.map((item, index) => redact(item, `${path}[${index}]`));
    if (value && typeof value === "object") {
      const out: Record<string, unknown> = {};
      for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
        const nextPath = path ? `${path}.${key}` : key;
        out[key] = containsDeniedToken(nextPath, denied) ? PLACEHOLDER : redact(nested, nextPath);
      }
      return out;
    }
    return value;
  };

  return {
    deniedPaths() {
      return [...denied];
    },
    redact,
  };
}
