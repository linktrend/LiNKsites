"use client";

import { CmsTrust } from "@/lib/contactTypes";
import { Shield, Clock } from "lucide-react";
import Link from "next/link";

interface TrustFooterProps {
  trust: CmsTrust;
  lang: string;
}

export function TrustFooter({ trust, lang }: TrustFooterProps) {
  return (
    <div className="border-t border-border pt-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Response Time */}
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-foreground font-medium">
              {trust.responseTimeText}
            </p>
            {trust.serviceTierNote && (
              <p className="text-xs text-muted-foreground mt-1">
                {trust.serviceTierNote}
              </p>
            )}
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            {trust.reassuranceText}
          </p>
        </div>

        {/* Legal Links */}
        {trust.legalLinks && trust.legalLinks.length > 0 && (
          <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50">
            {trust.legalLinks.map((link) => (
              <Link
                key={link.url}
                href={`/${lang}${link.url}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
