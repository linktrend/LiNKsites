'use client';

import { useState } from 'react';
import { FeaturePageLayout } from '@/components/layouts/FeaturePageLayout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ContactSalesModal from '@/components/modals/ContactSalesModal';
import { useLocalePath } from '@/hooks/useLocalePath';

export default function EnterprisePage() {
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const { buildPath } = useLocalePath();

  return (
    <>
      <FeaturePageLayout
        title="Enterprise Solutions"
        subtitle="Scalable, secure, and intelligent infrastructure built for the demands of modern enterprises."
        featureSection1b={
          <div className="bg-gradient-to-r from-[hsl(var(--surface-inverse-muted))]/15 to-[hsl(var(--surface-inverse))]/10 rounded-lg p-8">
            <p className="text-center text-muted-foreground">
              {/* Placeholder for enterprise customer logos */}
              Trusted by leading enterprises worldwide
            </p>
          </div>
        }
        mainContent={
          <div className="space-y-16">
            {/* Enterprise Features */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-center">Ready to Scale Your Enterprise?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="p-6 bg-background rounded-lg border">
                  <h3 className="text-xl font-semibold mb-3">Advanced Security</h3>
                  <p className="text-muted-foreground">
                    Protect every layer of your operation with enterprise-grade encryption, granular access control, and continuous compliance monitoring. SOC 2 Type II and GDPR ready.
                  </p>
                </div>
                
                <div className="p-6 bg-background rounded-lg border">
                  <h3 className="text-xl font-semibold mb-3">Dedicated Infrastructure</h3>
                  <p className="text-muted-foreground">
                    Deploy on a private cloud with custom configurations, guaranteed SLAs, and dedicated resources tuned to your organization’s scale.
                  </p>
                </div>
                
                <div className="p-6 bg-background rounded-lg border">
                  <h3 className="text-xl font-semibold mb-3">Premium Support</h3>
                  <p className="text-muted-foreground">
                    Access 24/7 global support from senior engineers and account managers who understand your environment inside out. Average response time under 15 minutes.
                  </p>
                </div>
                
                <div className="p-6 bg-background rounded-lg border">
                  <h3 className="text-xl font-semibold mb-3">Custom Integrations</h3>
                  <p className="text-muted-foreground">
                    Connect seamlessly with your existing systems. Our engineers build tailored APIs and workflows that adapt to your enterprise stack.
                  </p>
                </div>
                
                <div className="p-6 bg-background rounded-lg border">
                  <h3 className="text-xl font-semibold mb-3">Compliance and Governance</h3>
                  <p className="text-muted-foreground">
                    Meet global and industry-specific regulations with built-in data residency, audit logging, and policy management tools.
                  </p>
                </div>
                
                <div className="p-6 bg-background rounded-lg border">
                  <h3 className="text-xl font-semibold mb-3">Intelligent Analytics</h3>
                  <p className="text-muted-foreground">
                    Gain visibility and foresight with AI-powered dashboards, predictive insights, and custom reports designed for strategic decisions.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <h2 className="text-3xl font-bold mb-4">Ready to Scale Your Enterprise?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Schedule a demo with our enterprise team to discuss your specific requirements and learn how we can help your organization succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href={buildPath('/contact')}>Schedule a Demo</Link>
                </Button>
                <Button variant="outline" size="lg" onClick={() => setIsSalesModalOpen(true)}>
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        }
      featureSection3a={
        <div className="bg-muted/50 rounded-lg p-8 h-full">
          <h3 className="text-2xl font-semibold mb-6">What&apos;s Included</h3>
          <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-3 text-primary">✓</span>
                <span>Unlimited users and projects</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-primary">✓</span>
                <span>Custom SLA agreements</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-primary">✓</span>
                <span>Dedicated success manager</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-primary">✓</span>
                <span>Priority feature requests</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-primary">✓</span>
                <span>On-site training available</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-primary">✓</span>
                <span>Custom contract terms</span>
              </li>
            </ul>
          </div>
        }
        textSection3b={
          <div className="h-full">
            <h3 className="text-2xl font-semibold mb-4">Trusted by Industry Leaders</h3>
            <p className="text-muted-foreground mb-4">
              Fortune 500 companies and fast-growing enterprises trust our platform to power their mission-critical applications. 
              With 99.99% uptime SLA and enterprise-grade security, we provide the reliability your business demands.
            </p>
            <p className="text-muted-foreground mb-6">
              Our enterprise customers benefit from dedicated support teams, custom onboarding programs, and strategic guidance 
              to ensure maximum ROI from day one. We&apos;re not just a vendor—we&apos;re your long-term technology partner.
            </p>
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Contact Our Enterprise Team</h4>
              <Button onClick={() => setIsSalesModalOpen(true)}>
                Contact Sales
              </Button>
            </div>
          </div>
        }
      />
      <ContactSalesModal isOpen={isSalesModalOpen} onClose={() => setIsSalesModalOpen(false)} />
    </>
  );
}
