import Link from 'next/link';
import { PlatformPageLayout } from '@/components/layouts/PlatformPageLayout';
import { Button } from '@/components/ui/button';
import { buildLocalePath } from '@/lib/locale';

interface IndustrySolutionsPageProps {
  params: { locale: string };
}

export default function IndustrySolutionsPage({ params }: IndustrySolutionsPageProps) {
  const signupPath = buildLocalePath(params?.locale, '/signup');
  return (
    <PlatformPageLayout
      title="Solutions by Industry"
      subtitle="Tailored solutions designed for your industry's unique challenges and opportunities"
      featureSection1b={
        <div className="bg-gradient-to-r from-[hsl(var(--gradient-accent-from))]/15 to-[hsl(var(--gradient-accent-to))]/15 rounded-lg p-8">
          <p className="text-center text-muted-foreground">
            {/* Placeholder for industry showcase */}
            Industry verticals showcase coming soon
          </p>
        </div>
      }
      mainContent={
        <div className="space-y-12">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-center">Industry-Specific Expertise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Healthcare</h3>
                <p className="text-muted-foreground">
                  HIPAA-compliant solutions for patient management, telemedicine, and health records with the highest security standards.
                </p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Financial Services</h3>
                <p className="text-muted-foreground">
                  Banking-grade security, fraud detection, and compliance tools for fintech, banking, and investment platforms.
                </p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Retail & E-commerce</h3>
                <p className="text-muted-foreground">
                  Complete e-commerce solutions with inventory management, payment processing, and customer engagement tools.
                </p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Education</h3>
                <p className="text-muted-foreground">
                  Learning management systems, virtual classrooms, and student information systems that enhance education delivery.
                </p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Manufacturing</h3>
                <p className="text-muted-foreground">
                  IoT integration, supply chain management, and production optimization tools for modern manufacturing.
                </p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Media & Entertainment</h3>
                <p className="text-muted-foreground">
                  Content delivery, streaming infrastructure, and audience engagement tools for media companies.
                </p>
              </div>
            </div>
          </div>
        </div>
      }
      featureSection3a={
        <div className="bg-muted/50 rounded-lg p-8 h-full flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            {/* Placeholder for industry compliance badges or certifications */}
            Industry certifications and compliance badges
          </p>
        </div>
      }
      textSection3b={
        <div>
          <h3 className="text-2xl font-semibold mb-4">Deep Industry Knowledge</h3>
          <p className="text-muted-foreground mb-4">
            Every industry has unique requirements, regulations, and workflows. Generic solutions don&apos;t cut it when 
            you need to comply with industry-specific standards and deliver specialized features.
          </p>
          <p className="text-muted-foreground mb-4">
            We&apos;ve spent years working with leaders in each industry to build solutions that address real challenges. 
            Our platform comes pre-configured with industry best practices, compliance features, and specialized tools.
          </p>
      <p className="text-muted-foreground">
            Choose a platform that understands your industry and speaks your language.
     </p>
      <Button asChild size="lg" className="mt-6">
        <Link href={signupPath}>Get Started</Link>
      </Button>
    </div>
      }
    />
  );
}
