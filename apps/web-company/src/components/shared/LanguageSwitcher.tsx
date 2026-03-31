import Link from "next/link";
import { languages } from "../../lib/siteConfig";

export function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {languages.map((lang) => (
        <Link key={lang} href={`/${lang}`} className={lang === currentLang ? "font-semibold" : ""}>
          {lang.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
