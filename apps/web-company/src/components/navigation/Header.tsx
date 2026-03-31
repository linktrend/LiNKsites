import Link from "next/link";
import { LanguageSwitcher } from "../shared/LanguageSwitcher";
import { CTA } from "../common/CTA";

export function Header({ lang }: { lang: string }) {
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between py-4 gap-6">
        <Link href={`/${lang}`} className="font-bold text-xl">
          LinkTrend
        </Link>
        <nav className="flex items-center gap-4">
          <Link href={`/${lang}/offers`}>Offers</Link>
          <Link href={`/${lang}/resources`}>Resources</Link>
          <Link href={`/${lang}/about`}>About</Link>
          <Link href={`/${lang}/contact`}>Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLang={lang} />
          <CTA href={`/${lang}/contact`} label="Get started" size="sm" />
        </div>
      </div>
    </header>
  );
}
