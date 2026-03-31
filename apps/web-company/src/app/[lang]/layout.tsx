import type { ReactNode } from "react";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { themeFromRequest } from "@/lib/themeManager";
import { languages } from "@/lib/siteConfig";

export async function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { lang: string };
}) {
  const theme = await themeFromRequest();

  return (
    <html lang={params.lang} data-theme={theme.id}>
      <body>
        <Header lang={params.lang} />
        <main>{children}</main>
        <Footer lang={params.lang} />
      </body>
    </html>
  );
}
