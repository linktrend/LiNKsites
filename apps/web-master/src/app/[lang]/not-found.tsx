"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function NotFound() {
  const locale = useLocale();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-bold text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild>
            <Link href={routes.home(locale)}>Go Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={routes.contact(locale)}>Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
