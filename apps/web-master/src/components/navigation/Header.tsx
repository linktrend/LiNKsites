"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { CmsNavigation } from "@/lib/repository/navigation";
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, getSiteName } from "@/config";
import { Button } from "@/components/ui/button";
import { FriesIcon } from "@/components/icons/FriesIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { routes } from "@/lib/routes";
import type { PlanId } from "@/components/page-renderer/layout-packs";
import { resolveShell, type ShellAction } from "@/components/shell/resolved-shell";

type Props = {
  lang: string;
  navigation?: CmsNavigation | null;
  planId: PlanId;
  actions?: readonly ShellAction[];
};

export function Header({ lang, navigation, planId, actions }: Props) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [navOpenStates, setNavOpenStates] = useState<Record<string, boolean>>({});
  const siteName = getSiteName();
  const shell = resolveShell({ locale: lang, planId });
  const isolated = shell.typeLShellMode === "isolated";
  const navItems = isolated ? [] : navigation?.items ?? [];
  const resolvedActions = actions ?? shell.actions;

  const localeHref = (next: string) => {
    const parts = (pathname || `/${lang}`).split("/").filter(Boolean);
    if (parts.length === 0) return `/${next}`;
    parts[0] = next;
    return `/${parts.join("/")}`;
  };

  return (
    <header
      data-shell-region="site-header"
      data-shell-header={shell.header}
      data-type-l={isolated ? "isolated" : "not-applicable"}
      className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top"
    >
      <div className="container flex h-14 sm:h-16 items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6">
        <Link href={routes.home(lang)} className="flex items-center gap-2 min-w-0" aria-label={`${siteName} - Home`}>
          <span className="text-base sm:text-lg font-semibold truncate">{siteName}</span>
        </Link>

        {!isolated ? (
          <nav className="hidden lg:flex items-center gap-6" aria-label="Primary">
            {navItems.map((item) =>
              item.children && item.children.length > 0 ? (
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger className="flex items-center gap-1 rounded-sm text-sm font-medium hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
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
                  className="rounded-sm text-sm font-medium hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        ) : null}

        <div className="flex items-center gap-2 sm:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md hover:bg-accent transition-colors touch-target"
                aria-label="Select language"
              >
                <Globe className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium uppercase hidden xs:inline">{lang}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SUPPORTED_LANGUAGES.map((locale) => (
                <DropdownMenuItem key={locale} asChild>
                  <Link href={localeHref(locale)} hrefLang={locale} lang={locale}>
                    {LANGUAGE_NAMES[locale] || locale.toUpperCase()}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {resolvedActions.includes("contact") ? (
            <Button variant="outline" className="hidden md:inline-flex touch-target" asChild>
              <Link href={routes.contact(lang)}>Contact</Link>
            </Button>
          ) : null}
          {!isolated && resolvedActions.includes("primary-cta") ? (
            <Button className="hidden md:inline-flex touch-target" asChild>
              <Link href={routes.contact(lang)}>Get started</Link>
            </Button>
          ) : null}

          {!isolated ? (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden touch-target"
                  aria-label="Open navigation menu"
                  aria-expanded={sheetOpen}
                  aria-controls="mobile-navigation"
                >
                  <FriesIcon className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-80 safe-right" id="mobile-navigation">
                <nav className="mt-6 flex flex-col gap-2 text-sm font-medium" aria-label="Mobile">
                  {navItems.map((item) => (
                    <div key={item.id} className="flex flex-col">
                      {item.children && item.children.length > 0 ? (
                        <>
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
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${navOpenStates[item.id] ? "rotate-180" : ""}`}
                              aria-hidden="true"
                            />
                          </button>
                          {navOpenStates[item.id] ? (
                            <div className="flex flex-col gap-1 mt-1 ml-4" id={`mobile-nav-${item.id}`} role="region">
                              {item.children.map((child) => (
                                <Link
                                  key={child.id}
                                  href={child.url}
                                  target={child.external ? "_blank" : undefined}
                                  onClick={() => setSheetOpen(false)}
                                  className="rounded-md px-4 py-2 hover:bg-slate-100 touch-target active:bg-slate-200 transition-colors text-slate-600"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <Link
                          href={item.url}
                          target={item.external ? "_blank" : undefined}
                          onClick={() => setSheetOpen(false)}
                          className="rounded-md px-4 py-3 hover:bg-slate-100 touch-target active:bg-slate-200 transition-colors"
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          ) : null}
        </div>
      </div>
    </header>
  );
}
