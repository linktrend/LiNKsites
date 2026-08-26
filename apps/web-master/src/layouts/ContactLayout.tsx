"use client";

import { ContactForm } from "../components/contact/ContactForm";
import { CmsContact } from "@/lib/repository/contact";

type Props = { lang: string; page: { data: { contact: CmsContact } } };

export function ContactLayout({ page }: Props) {
  const contact = page.data.contact;
  const pageContent = contact?.page ?? {};
  const title = pageContent.title;
  if (!title) {
    return (
      <div className="container py-12">
        <p className="text-muted-foreground">Contact details are not published for this site.</p>
      </div>
    );
  }

  return (
    <div className="container space-y-10 py-12">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Contact</p>
        <h1 className="text-4xl font-bold">{title}</h1>
        {pageContent.subtitle ? <p className="text-lg text-muted-foreground">{pageContent.subtitle}</p> : null}
      </header>

      <div className="grid gap-8 md:grid-cols-5">
        <div className="md:col-span-3 space-y-6">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
