import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import MarketingHeader from "@/components/layout/MarketingHeader";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "LTM Starter Kit - Launch to Market Faster",
  description: "A complete & open-source Next.js 14 Subscription Starter template using Supabase, Stripe, Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col w-full">
            <MarketingHeader user={null} showNavigation={true} />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
