import Link from "next/link";

export function Footer({ lang }: { lang: string }) {
  return (
    <footer className="border-t mt-12">
      <div className="container py-8 grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <p className="font-semibold">LinkTrend</p>
          <p className="text-sm text-muted-foreground">AI-first digital transformation.</p>
        </div>
        <div>
          <p className="font-semibold mb-2">Sitemap</p>
          <div className="flex flex-col gap-1 text-sm">
            <Link href={`/${lang}/offers`}>Offers</Link>
            <Link href={`/${lang}/resources`}>Resources</Link>
            <Link href={`/${lang}/about`}>About</Link>
            <Link href={`/${lang}/contact`}>Contact</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold mb-2">Legal</p>
          <div className="flex flex-col gap-1 text-sm">
            <Link href={`/${lang}/legal/privacy-policy`}>Privacy</Link>
            <Link href={`/${lang}/legal/terms-of-use`}>Terms</Link>
            <Link href={`/${lang}/legal/cookies-policy`}>Cookies</Link>
            <Link href={`/${lang}/legal/gdpr`}>GDPR</Link>
            <Link href={`/${lang}/legal/disclaimer`}>Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
