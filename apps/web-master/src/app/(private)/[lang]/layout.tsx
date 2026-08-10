import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { getThemeFromRequest } from "@/config";
import { normalizeLocale } from "@/lib/locale-context";

// Private previews deliberately use a separate route branch.  The public
// language layout resolves a lifecycle-eligible public tenant; doing that
// before the demo page can validate its token would make a private preview
// depend on public publication.  This branch supplies only presentation and
// locale context.  The demo page remains solely responsible for token-gated
// preview tenant resolution.
export default async function PrivatePreviewLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const [theme, { lang }, messages] = await Promise.all([
    getThemeFromRequest(),
    params,
    getMessages(),
  ]);

  return (
    <div data-theme={theme.id} data-lang={normalizeLocale(lang)}>
      <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
    </div>
  );
}
