import "../styles/globals.css";
import { ReactNode } from "react";
import type { Metadata } from "next";
import { SITE_CONFIG, SEO_CONFIG, getSiteUrl } from "@/config";
import { SiteStructuredData } from "@/components/seo/SiteStructuredData";
import { ThemeContractStyle } from "@/components/master-template/ThemeContractStyle";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_CONFIG.siteName,
    template: `%s | ${SITE_CONFIG.siteName}`,
  },
  description: SITE_CONFIG.description,
  keywords: [...SEO_CONFIG.defaultKeywords],
  authors: [{ name: SITE_CONFIG.author }],
  creator: SITE_CONFIG.author,
  publisher: SITE_CONFIG.siteName,
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: [{ url: "ltfx.fix2.url.6c08f37a0809.v1", sizes: "any" }],
  },
  openGraph: {
    type: "website",
    locale: SEO_CONFIG.openGraph.locale,
    url: getSiteUrl(),
    title: SITE_CONFIG.siteName,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.siteName,
    images: [
      {
        url: SEO_CONFIG.openGraph.images.default,
        width: SEO_CONFIG.openGraph.images.width,
        height: SEO_CONFIG.openGraph.images.height,
        alt: SITE_CONFIG.siteName,
      },
    ],
  },
  twitter: {
    card: SEO_CONFIG.twitter.card,
    site: SEO_CONFIG.twitter.site,
    creator: SEO_CONFIG.twitter.creator,
    title: SITE_CONFIG.siteName,
    description: SITE_CONFIG.description,
    images: [SEO_CONFIG.openGraph.images.default],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {},
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="default">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Sans+3:wght@400;600&display=swap"
        />
      </head>
      <body>
        <ThemeContractStyle />
        <SiteStructuredData />
        {children}
      </body>
    </html>
  );
}
