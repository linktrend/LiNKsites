import type { PlanId } from "@/components/page-renderer/layout-packs";

export const RESOLVED_SHELL_BEHAVIOR = ["header", "footer", "mobile", "locale", "actions"] as const;

export type ShellAction = "contact" | "primary-cta";

export type ResolvedShell = Readonly<{
  header: "brand-nav-locale";
  footer: "five-zone";
  mobile: "accessible-disclosure";
  locale: string;
  actions: readonly ShellAction[];
  typeLIsolation: true;
  typeLShellMode: "isolated" | "not-applicable";
  noPlaceholders: true;
}>;

export class ResolvedShellError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResolvedShellError";
  }
}

export function resolveShell(input: { locale: string; planId: PlanId }): ResolvedShell {
  if (!input.locale || typeof input.locale !== "string") {
    throw new ResolvedShellError("resolvedShell.locale missing");
  }
  const typeL = input.planId === "L";
  const shell: ResolvedShell = Object.freeze({
    header: "brand-nav-locale",
    footer: "five-zone",
    mobile: "accessible-disclosure",
    locale: input.locale,
    actions: Object.freeze(typeL ? (["contact"] as const) : (["contact", "primary-cta"] as const)),
    typeLIsolation: true,
    typeLShellMode: typeL ? "isolated" : "not-applicable",
    noPlaceholders: true,
  });
  if (shell.header === ("placeholder" as string) || shell.footer === ("placeholder" as string)) {
    throw new ResolvedShellError("resolvedShell uses placeholder header/footer");
  }
  return shell;
}

export type ResolvedSocialLink = Readonly<{ name: string; href: string }>;

export function resolvedSocialLinks(social: {
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
}): readonly ResolvedSocialLink[] {
  const links: ResolvedSocialLink[] = [];
  const push = (name: string, href: unknown) => {
    if (typeof href !== "string") return;
    const trimmed = href.trim();
    if (!trimmed) return;
    if (trimmed.startsWith("@")) {
      if (trimmed === "@company") return;
      links.push({ name, href: `https://twitter.com/${trimmed.slice(1)}` });
      return;
    }
    if (!/^https:\/\//i.test(trimmed)) return;
    links.push({ name, href: trimmed });
  };
  push("LinkedIn", social.linkedin);
  push("Facebook", social.facebook);
  push("Instagram", social.instagram);
  push("YouTube", social.youtube);
  push("Twitter", social.twitter);
  return links;
}

export const FOOTER_ZONES = ["brand", "navigation", "contact", "social", "policy"] as const;
export type FooterZone = (typeof FOOTER_ZONES)[number];
