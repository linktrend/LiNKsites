'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, MessageSquare, Send, Calendar, FileText, X } from 'lucide-react';

import { FeaturePageLayout } from '@/components/layouts/FeaturePageLayout';
import { Button } from '@/components/ui/button';
import { useLocalePath } from '@/hooks/useLocalePath';

export default function ContactPage() {
  const router = useRouter();
  const { buildPath } = useLocalePath();
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactFormData);
    setIsContactFormOpen(false);
    setContactFormData({
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      subject: '',
      message: '',
    });
  };

  const openHelpAction = (action: 'ticket' | 'live-chat' | 'schedule-call') => {
    const destination = buildPath(`/dashboard/help?action=${action}`);
    router.push(destination);
  };

  return (
    <>
      {isContactFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg border shadow-2xl bg-background">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Contact Our Team</h2>
              </div>
              <button
                onClick={() => setIsContactFormOpen(false)}
                className="p-1 hover:bg-muted rounded-lg transition-all"
                aria-label="Close contact form"
              >
                <X className="h-5 w-5 text-muted-foreground/70" />
              </button>
            </div>
            <form onSubmit={handleContactFormSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={contactFormData.firstName}
                    onChange={(e) => setContactFormData({ ...contactFormData, firstName: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={contactFormData.lastName}
                    onChange={(e) => setContactFormData({ ...contactFormData, lastName: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={contactFormData.email}
                    onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <input
                    type="text"
                    value={contactFormData.company}
                    onChange={(e) => setContactFormData({ ...contactFormData, company: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Your Company"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subject <span className="text-red-500">*</span></label>
                <select
                  value={contactFormData.subject}
                  onChange={(e) => setContactFormData({ ...contactFormData, subject: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select a subject</option>
                  <option value="sales">Sales Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="billing">Billing Question</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message <span className="text-red-500">*</span></label>
                <textarea
                  value={contactFormData.message}
                  onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsContactFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="!bg-[hsl(var(--accent-red))] !text-[hsl(var(--accent-red-foreground))] !hover:bg-[hsl(var(--accent-red))]/90">
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <FeaturePageLayout
        title="Contact Us"
        subtitle="Get in touch with our team—we're here to help you succeed"
        featureSection1b={
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-background rounded-lg border text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email Us</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Send us an email and we&apos;ll respond within 24 hours.
              </p>
              <a href="mailto:hello@ltmstarterkit.com" className="text-primary hover:underline text-sm">
                hello@ltmstarterkit.com
              </a>
            </div>

            <div className="p-6 bg-background rounded-lg border text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fill Out a Form</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Send us your details and we&apos;ll follow up shortly.
              </p>
              <button
                onClick={() => setIsContactFormOpen(true)}
                className="text-primary hover:underline text-sm"
              >
                Open Form →
              </button>
            </div>

            <div className="p-6 bg-background rounded-lg border text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Chat with our support team in real-time.
              </p>
              <button
                onClick={() => openHelpAction('live-chat')}
                className="text-primary hover:underline text-sm"
              >
                Start Chat →
              </button>
            </div>
          </div>
        }
        mainContent={
          <div className="space-y-12">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-8 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-3 mb-4">
                  <Send className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-xl font-semibold">Submit a Support Ticket</h3>
                    <p className="text-sm text-muted-foreground">Existing customers receive priority handling.</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">
                  Share the details of your issue and our support engineers will follow up with next steps. Average response time is under 4 hours.
                </p>
                <Button
                  onClick={() => openHelpAction('ticket')}
                  className="!bg-[hsl(var(--accent-red))] !text-[hsl(var(--accent-red-foreground))] !hover:bg-[hsl(var(--accent-red))]/90"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Ticket
                </Button>
              </div>

              <div className="p-8 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-xl font-semibold">Schedule a Call</h3>
                    <p className="text-sm text-muted-foreground">Speak directly with our success team.</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">
                  Pick a time that works for you and we&apos;ll connect you with a specialist. Perfect for onboarding, architecture reviews, or billing questions.
                </p>
                <Button variant="outline" onClick={() => openHelpAction('schedule-call')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Call
                </Button>
              </div>
            </div>
          </div>
        }
        featureSection3a={
          <div className="bg-gradient-to-br from-[hsl(var(--gradient-accent-from))]/15 to-[hsl(var(--gradient-accent-to))]/15 rounded-lg p-8 h-full flex flex-col gap-4 justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-border bg-background/80 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-red-500" aria-hidden="true" />
                  <span className="text-sm font-medium text-foreground">Support Tickets</span>
                </div>
                <span className="text-xs text-muted-foreground">Issue Detected</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background/80 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-yellow-400" aria-hidden="true" />
                  <span className="text-sm font-medium text-foreground">Call Volume</span>
                </div>
                <span className="text-xs text-muted-foreground">High Load</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background/80 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" aria-hidden="true" />
                  <span className="text-sm font-medium text-foreground">Live Chat</span>
                </div>
                <span className="text-xs text-muted-foreground">Operating Normally</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background/80 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" aria-hidden="true" />
                  <span className="text-sm font-medium text-foreground">Email Response</span>
                </div>
                <span className="text-xs text-muted-foreground">On Track</span>
              </div>
            </div>
            <div className="text-center mt-auto">
              <p className="text-muted-foreground mb-1">
                Average response time: 2 hours
              </p>
              <p className="text-sm text-muted-foreground">
                Customer satisfaction: 4.8/5
              </p>
            </div>
          </div>
        }
        textSection3b={
          <div>
            <h3 className="text-2xl font-semibold mb-4">We&apos;re Here to Help</h3>
            <p className="text-muted-foreground mb-4">
              Whether you&apos;re a prospective customer, current user, or just curious about what we do, we&apos;d love to 
              hear from you. Our team is dedicated to providing excellent support and answering all your questions.
            </p>
            <p className="text-muted-foreground mb-4">
              For urgent technical support issues, existing customers can access our priority support channels 
              through the customer portal. We aim to respond to all inquiries within one business day.
            </p>
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Looking for something specific?</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href={buildPath('/resources/for-customers')} className="text-primary hover:underline">
                    FAQ & Resources →
                  </Link>
                </li>
                <li>
                  <Link href={buildPath('/resources/library')} className="text-primary hover:underline">
                    User Documentation →
                  </Link>
                </li>
                <li>
                  <Link href={buildPath('/enterprise')} className="text-primary hover:underline">
                    Enterprise
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        }
      />
    </>
  );
}
