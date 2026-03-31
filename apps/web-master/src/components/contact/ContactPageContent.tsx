"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ContactFormProvider, useContactForm } from "./ContactFormContext";
import { IntentGrid } from "./IntentGrid";
import { ContactChannelList } from "./ContactChannelList";
import { HelpDeflectionSection } from "./HelpDeflectionSection";
import { TrustFooter } from "./TrustFooter";
import { DynamicContactForm } from "./DynamicContactForm";
import { CmsContact, CmsContactForm } from "@/lib/contactTypes";
import { getFallbackImage } from "@/lib/imageFallback";
import { X } from "lucide-react";

interface ContactPageContentProps {
  lang: string;
  contact: CmsContact;
  contactForms: CmsContactForm[];
}

function ContactPageInner({ lang, contact, contactForms }: ContactPageContentProps) {
  const t = useTranslations();
  const { activeFormId, isOpen, closeForm } = useContactForm();

  // Find the active form schema
  const activeForm = contactForms.find((form) => form.id === activeFormId);

  return (
    <>
      {/* Modal for Dynamic Form */}
      {isOpen && activeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg border shadow-2xl bg-background">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">{activeForm.title}</h2>
              <button
                onClick={closeForm}
                className="p-1 hover:bg-muted rounded-lg transition-all"
                aria-label={t("closeForm")}
              >
                <X className="h-5 w-5 text-muted-foreground/70" />
              </button>
            </div>
            <div className="p-6">
              <DynamicContactForm formSchema={activeForm} lang={lang} />
              </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section
          id="contact-hero"
          className="relative bg-cover bg-center"
          style={{ backgroundImage: `url(${getFallbackImage('hero')})` }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 container px-4 sm:px-6 py-16 sm:py-20">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white">
                {contact.page.title}
              </h1>
              <p className="text-lg sm:text-xl text-white/90">
                {contact.page.subtitle}
              </p>
            </div>
          </div>
        </section>

      {/* Breadcrumbs */}
      <section className="pt-8 sm:pt-12 pb-6 sm:pb-8">
        <div className="container px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Link href={`/${lang}`} className="hover:text-foreground transition-colors">
              {t("breadcrumbs.home")}
            </Link>
            <span>›</span>
            <span className="text-foreground font-medium">
              {t("breadcrumbs.contact")}
            </span>
          </nav>
        </div>
      </section>

      {/* Intent Grid Section */}
      <section id="contact-intents" className="pt-4 sm:pt-6 pb-8 sm:pb-12">
          <div className="container px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-3 text-foreground">{t("contact.intents.title")}</h2>
                <p className="text-lg text-muted-foreground">
                  {t("contact.intents.subtitle")}
                      </p>
                    </div>
              <IntentGrid intents={contact.intents} />
            </div>
          </div>
        </section>

        {/* Contact Channels Section */}
        <section id="contact-channels" className="py-8 sm:py-12 bg-muted/30">
          <div className="container px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-3 text-foreground">{t("contact.channels.title")}</h2>
                <p className="text-lg text-muted-foreground">
                  {t("contact.channels.subtitle")}
                </p>
              </div>
              <ContactChannelList channels={contact.channels} />
            </div>
          </div>
        </section>

        {/* Help Deflection Section */}
        {contact.helpDeflection.enabled && (
          <section id="help-deflection" className="py-8 sm:py-12">
            <div className="container px-4 sm:px-6">
              <div className="max-w-5xl mx-auto">
                <HelpDeflectionSection helpDeflection={contact.helpDeflection} lang={lang} />
              </div>
            </div>
          </section>
        )}

        {/* Trust Footer Section */}
        <section id="trust-footer" className="py-8 sm:py-12 bg-muted/30">
          <div className="container px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
              <TrustFooter trust={contact.trust} lang={lang} />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export function ContactPageContent({ lang, contact, contactForms }: ContactPageContentProps) {
  return (
    <ContactFormProvider>
      <ContactPageInner lang={lang} contact={contact} contactForms={contactForms} />
    </ContactFormProvider>
  );
}
