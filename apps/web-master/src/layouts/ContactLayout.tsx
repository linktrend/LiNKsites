"use client";

import { useState } from "react";
import { ContactForm } from "../components/contact/ContactForm";
import { GoogleMapEmbed } from "../components/contact/GoogleMapEmbed";
import { CTA } from "../components/common/CTA";
import { Modal } from "../components/common/Modal";
import { CmsContact } from "@/lib/repository/contact";
import { Button } from "../components/ui/button";

type Props = { lang: string; page: { data: { contact: CmsContact } } };

export function ContactLayout({ lang, page }: Props) {
  const contact = page.data.contact;
  const pageContent = contact?.page ?? {};
  const [showMap, setShowMap] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  return (
    <div className="container space-y-10 py-12">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Contact</p>
        <h1 className="text-4xl font-bold">{pageContent.title ?? "Contact Us"}</h1>
        <p className="text-lg text-muted-foreground">{pageContent.subtitle ?? ""}</p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => setShowMap(true)}>
          View Map
        </Button>
        <Button onClick={() => setShowForm(true)}>Open Contact Form</Button>
        <Button variant="secondary" onClick={() => setShowSchedule(true)}>
          Schedule a Call
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-5">
        <div className="md:col-span-3 space-y-6">
          <ContactForm />
        </div>
        <div className="md:col-span-2 space-y-4">
          {/* <GoogleMapEmbed coordinates={contact.coordinates} /> */}
          {/* <CTA href={contact.ctaUrl} label={contact.ctaLabel} /> */}
          <div className="p-4 border rounded-lg">
            <p className="font-semibold">Support</p>
            <p className="text-sm text-muted-foreground">Contact us for assistance</p>
          </div>
        </div>
      </div>

      <Modal open={showMap} onClose={() => setShowMap(false)} title="Our Location">
        {/* <GoogleMapEmbed coordinates={contact.coordinates} /> */}
        <p>Map placeholder</p>
      </Modal>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Contact Us">
        <ContactForm />
      </Modal>

      <Modal open={showSchedule} onClose={() => setShowSchedule(false)} title="Schedule a Call">
        <p className="text-sm text-muted-foreground">Pick a time and we will send a calendar invite.</p>
        <CTA href="https://cal.example.com" label="Open Scheduler" />
      </Modal>
    </div>
  );
}
