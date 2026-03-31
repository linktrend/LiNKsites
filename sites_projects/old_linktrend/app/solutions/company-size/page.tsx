import Link from 'next/link';
import { PlatformPageLayout } from '@/components/layouts/PlatformPageLayout';
import { Button } from '@/components/ui/button';
import { buildLocalePath } from '@/lib/locale';

interface CompanySizeSolutionsPageProps {
  params: { locale: string };
}

export default function CompanySizeSolutionsPage({ params }: CompanySizeSolutionsPageProps) {
  const signupPath = buildLocalePath(params?.locale, '/signup');
  return (
    <PlatformPageLayout
      title="Solutions by Company Size"
      subtitle="Right-sized solutions that grow with your business from startup to enterprise"
      featureSection1b={
        <div className="bg-gradient-to-r from-[hsl(var(--gradient-success-from))]/15 to-[hsl(var(--accent))]/15 rounded-lg p-8">
          <p className="text-center text-muted-foreground">
            {/* Placeholder for company size comparison */}
            Company size comparison chart coming soon
          </p>
        </div>
      }
      mainContent={
        <div className="space-y-12">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-center">The Perfect Fit for Your Business</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-background rounded-lg border">
                <div className="mb-4">
                  <h3 className="text-2xl font-semibold mb-2">Startups</h3>
                  <p className="text-sm text-muted-foreground">1-50 employees</p>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Quick setup and deployment</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Flexible pricing that scales with growth</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Essential features to get started fast</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Community support and documentation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Room to grow without limitations</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-8 bg-background rounded-lg border border-primary">
                <div className="mb-4">
                  <h3 className="text-2xl font-semibold mb-2">Mid-Market</h3>
                  <p className="text-sm text-muted-foreground">50-500 employees</p>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Advanced features and integrations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Dedicated account management</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Enhanced security and compliance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Priority support with SLA guarantees</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Custom training and onboarding</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-8 bg-background rounded-lg border">
                <div className="mb-4">
                  <h3 className="text-2xl font-semibold mb-2">Enterprise</h3>
                  <p className="text-sm text-muted-foreground">500+ employees</p>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Unlimited scalability and customization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Dedicated success and technical teams</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Enterprise-grade security and compliance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>24/7 premium support with 15-min SLA</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Custom contracts and pricing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      }
      featureSection3a={
        <div className="bg-muted/50 rounded-lg p-8 h-full flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            {/* Placeholder for growth journey visualization */}
            Growth journey visualization
          </p>
        </div>
      }
      textSection3b={
        <div>
          <h3 className="text-2xl font-semibold mb-4">One Platform, All Stages</h3>
          <p className="text-muted-foreground mb-4">
            Your business will evolve, and your technology should evolve with it. Unlike platforms that force you 
            to migrate as you grow, our solution scales seamlessly from day one to enterprise scale.
          </p>
          <p className="text-muted-foreground mb-4">
            Start with what you need today, and unlock advanced capabilities as your requirements grow. No 
            disruptive migrations, no data transfers, no downtime—just smooth, continuous growth.
          </p>
      <p className="text-muted-foreground">
            Join companies at every stage who trust us to support their journey.
     </p>
      <Button asChild size="lg" className="mt-6">
        <Link href={signupPath}>Get Started</Link>
      </Button>
    </div>
      }
    />
  );
}
