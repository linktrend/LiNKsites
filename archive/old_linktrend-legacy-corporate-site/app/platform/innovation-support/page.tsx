import Link from 'next/link';
import { PlatformPageLayout } from '@/components/layouts/PlatformPageLayout';
import { Button } from '@/components/ui/button';
import { buildLocalePath } from '@/lib/locale';

interface InnovationSupportPageProps {
  params: { locale: string };
}

export default function InnovationSupportPage({ params }: InnovationSupportPageProps) {
  const signupPath = buildLocalePath(params?.locale, '/signup');
  return (
    <PlatformPageLayout
      title="Innovation and Support That Never Stops"
      subtitle="Continuous improvement meets world-class support, giving your business the reliability and agility it deserves."
      featureSection1b={
        <div className="bg-gradient-to-r from-[hsl(var(--gradient-success-from))]/15 to-[hsl(var(--gradient-brand-from))]/15 rounded-lg p-8">
          <p className="text-center text-muted-foreground">
            {/* Placeholder for support statistics or innovation timeline */}
            Support metrics and innovation timeline coming soon
          </p>
        </div>
      }
      mainContent={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">24/7 Expert Help</h3>
            <p className="text-muted-foreground">
              Reach our global support team any time, any day. Real people, real expertise, ready to keep your platform running smoothly.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Continuous Innovation</h3>
            <p className="text-muted-foreground">
              Our engineers release regular updates, performance upgrades, and security enhancements to keep your product ahead of the curve.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Customer Success Partnership</h3>
            <p className="text-muted-foreground">
              Enterprise clients are paired with a dedicated success manager who aligns platform growth with your business goals.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Rapid Response</h3>
            <p className="text-muted-foreground">
              Critical issues are prioritized immediately. Our average response time for urgent matters is under 15 minutes.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Knowledge Hub</h3>
            <p className="text-muted-foreground">
              Explore our growing library of guides, documentation, and community discussions. Learn faster and build better.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Your Voice Matters</h3>
            <p className="text-muted-foreground">
              Submit feature ideas and vote on priorities. Every improvement starts with user feedback, and we act on it quickly.
            </p>
          </div>
        </div>
      }
      featureSection3a={
        <div className="bg-muted/50 rounded-lg p-8 h-full flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            {/* Placeholder for support channels or customer testimonials */}
            Support channels and testimonials carousel
          </p>
        </div>
      }
      textSection3b={
        <div>
          <h3 className="text-2xl font-semibold mb-4">Always Moving Forward</h3>
          <p className="text-muted-foreground mb-4">
            Technology never stands still, and neither do we. Our platform evolves constantly through research, innovation, and your feedback.
            Behind every update is a team committed to reliability, speed, and user success. Experience the confidence of working with a partner who builds, improves, and supports without pause.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href={signupPath}>Get Started</Link>
          </Button>
    </div>
      }
    />
  );
}
