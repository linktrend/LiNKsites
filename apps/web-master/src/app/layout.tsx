import "../styles/globals.css";
import { ReactNode } from "react";
import type { Metadata } from "next";
import { SITE_CONFIG, SEO_CONFIG, getSiteUrl } from "@/config";
import { SiteStructuredData } from "@/components/seo/SiteStructuredData";

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
    icon: [{ url: "/favicon.ico", sizes: "any" }],
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
    <html lang="en">
      <body>
        <SiteStructuredData />
        {children}
      </body>
    </html>
  );
}
