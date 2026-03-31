"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Globe, Sparkles, ChevronDown, Moon, Sun } from "lucide-react";
import { CmsNavigation } from "@/lib/repository/navigation";
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, APP_URLS, getSiteName } from "@/config";
import { Button } from "@/components/ui/button";
import { FriesIcon } from "@/components/icons/FriesIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type Props = {
  lang: string;
  navigation?: CmsNavigation | null;
};

export function Header({ lang, navigation }: Props) {
  const t = useTranslations();
  const tCommon = useTranslations();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [navOpenStates, setNavOpenStates] = useState<Record<string, boolean>>({});
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const siteName = getSiteName();
  const navItems = navigation?.items ?? [];

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const initialTheme = (savedTheme === "dark" || savedTheme === "light") ? savedTheme : "light";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
    document.body?.setAttribute("data-theme", initialTheme);
  }, []);

  const handleThemeChange = (value: "light" | "dark") => {
    setTheme(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", value);
    }
    document.documentElement.setAttribute("data-theme", value);
    document.body?.setAttribute("data-theme", value);
  };

  const handleSheetClose = () => {
    setSheetOpen(false);
  };

  if (!isMounted) {
    return (
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top">
        <div className="container flex h-14 sm:h-16 items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-primary/20 rounded animate-pulse" />
            <div className="h-6 w-24 bg-foreground/10 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-16 bg-foreground/10 rounded animate-pulse" />
            <div className="h-9 w-20 bg-foreground/10 rounded animate-pulse hidden md:block" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top" suppressHydrationWarning>
      <div className="container flex h-14 sm:h-16 items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6">
        <Link href={`/${lang}`} className="flex items-center gap-2 min-w-0" aria-label={`${siteName} - Home`}>
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" aria-hidden="true" />
          <span className="text-base sm:text-lg font-semibold truncate">{siteName}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) =>
            item.children && item.children.length > 0 ? (
              <DropdownMenu key={item.id}>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors focus:outline-none focus-visible:outline-none">
                  {item.label}
                  <ChevronDown className="h-4 w-4 transition-transform" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {item.children?.map((child) => (
                    <DropdownMenuItem key={child.id} asChild>
                      <Link href={child.url} target={child.external ? "_blank" : undefined}>
                        {child.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={item.id}
                href={item.url}
                target={item.external ? "_blank" : undefined}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md hover:bg-accent transition-colors touch-target">
                <Globe className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium uppercase hidden xs:inline">{lang}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SUPPORTED_LANGUAGES.map((locale) => (
                <DropdownMenuItem key={locale} asChild>
                  <Link href={`/${locale}`}>
                    {LANGUAGE_NAMES[locale] || locale.toUpperCase()}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center justify-center px-2 sm:px-3 py-2 rounded-md hover:bg-accent transition-colors touch-target"
                aria-label="Theme selection"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(["light", "dark"] as const).map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => handleThemeChange(option)}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="capitalize">{option}</span>
                  {theme === option && <span className="text-xs text-primary font-semibold">●</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" className="hidden md:inline-flex touch-target" asChild>
            <a href={APP_URLS.login} target="_blank" rel="noopener noreferrer">{tCommon('buttons.login')}</a>
          </Button>
          <Button className="hidden md:inline-flex btn-accent-red touch-target" asChild>
            <a href={APP_URLS.signup} target="_blank" rel="noopener noreferrer">{tCommon('buttons.signup')}</a>
          </Button>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden touch-target" aria-label="Open navigation menu">
                <FriesIcon className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-80 safe-right">
              <div className="mt-6 flex flex-col gap-2 text-sm font-medium text-slate-700">
                {navItems.map((item) => (
                  <div key={item.id} className="flex flex-col">
                    <button
                      onClick={() =>
                        setNavOpenStates((prev) => ({
                          ...prev,
                          [item.id]: !prev[item.id],
                        }))
                      }
                      className="rounded-md px-4 py-3 hover:bg-slate-100 touch-target active:bg-slate-200 transition-colors flex items-center justify-between w-full text-left"
                      aria-expanded={Boolean(navOpenStates[item.id])}
                      aria-controls={`mobile-nav-${item.id}`}
                    >
                      <span>{item.label}</span>
                      {item.children && item.children.length > 0 && (
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${navOpenStates[item.id] ? "rotate-180" : ""}`}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                    {item.children && item.children.length > 0 ? (
                      navOpenStates[item.id] && (
                        <div
                          className="flex flex-col gap-1 mt-1 ml-4"
                          id={`mobile-nav-${item.id}`}
                          role="region"
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              href={child.url}
                              target={child.external ? "_blank" : undefined}
                              onClick={handleSheetClose}
                              className="rounded-md px-4 py-2 hover:bg-slate-100 touch-target active:bg-slate-200 transition-colors text-slate-600"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )
                    ) : (
                      <Link
                        href={item.url}
                        target={item.external ? "_blank" : undefined}
                        onClick={handleSheetClose}
                        className="rounded-md px-4 py-3 hover:bg-slate-100 touch-target active:bg-slate-200 transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
