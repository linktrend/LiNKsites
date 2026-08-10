import { ContactForm } from "../components/contact/ContactForm";
import { GoogleMapEmbed } from "../components/contact/GoogleMapEmbed";
import { CTA } from "../components/common/CTA";

export function ContactLayout({ lang, page }: { lang: string; page: any }) {
  return (
    <div className="container space-y-10 py-12">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Contact</p>
        <h1 className="text-4xl font-bold">[Contact Title]</h1>
        <p className="text-lg text-muted-foreground">[Contact subtitle]</p>
      </header>
      <div className="grid gap-8 md:grid-cols-5">
        <div className="md:col-span-3 space-y-6">
          <ContactForm />
        </div>
        <div className="md:col-span-2 space-y-4">
          <GoogleMapEmbed coordinates="[lat,lng]" />
          <CTA href="https://calendly.com" label="Schedule a call" />
          <div className="p-4 border rounded-lg">
            <p className="font-semibold">Support</p>
            <a className="text-primary" href="mailto:support@example.com">
              support@example.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
