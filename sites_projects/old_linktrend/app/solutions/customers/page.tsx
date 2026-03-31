import Link from 'next/link';
import { PlatformPageLayout } from '@/components/layouts/PlatformPageLayout';
import { Button } from '@/components/ui/button';
import { buildLocalePath } from '@/lib/locale';

interface CustomerSolutionsPageProps {
  params: { locale: string };
}

export default function CustomerSolutionsPage({ params }: CustomerSolutionsPageProps) {
  const signupPath = buildLocalePath(params?.locale, '/signup');
  return (
    <PlatformPageLayout
      title="Solutions for Customers"
      subtitle="Build exceptional customer experiences that drive satisfaction and loyalty"
      featureSection1b={
        <div className="bg-gradient-to-r from-[hsl(var(--accent))]/10 to-[hsl(var(--primary))]/10 rounded-lg p-8">
          <p className="text-center text-muted-foreground">
            {/* Placeholder for customer success stories */}
            Customer testimonials carousel coming soon
          </p>
        </div>
      }
      mainContent={
        <div className="space-y-12">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-center">Deliver Outstanding Customer Experiences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Personalized Interactions</h3>
                <p className="text-muted-foreground">
                  Create tailored experiences for each customer based on their history, preferences, and behavior patterns.
                </p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Omnichannel Support</h3>
                <p className="text-muted-foreground">
                  Provide seamless support across all channels—email, chat, phone, social media, and self-service portals.
                </p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Customer Analytics</h3>
                <p className="text-muted-foreground">
                  Gain deep insights into customer behavior, satisfaction, and lifetime value with powerful analytics tools.
                </p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Journey Mapping</h3>
                <p className="text-muted-foreground">
                  Visualize and optimize every touchpoint in your customer journey to reduce friction and increase conversions.
                </p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Feedback Management</h3>
                <p className="text-muted-foreground">
                  Collect, analyze, and act on customer feedback to continuously improve your products and services.
                </p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Loyalty Programs</h3>
                <p className="text-muted-foreground">
                  Build and manage customer loyalty programs that reward engagement and drive repeat business.
                </p>
              </div>
            </div>
          </div>
        </div>
      }
      featureSection3a={
        <div className="bg-muted/50 rounded-lg p-8 h-full flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            {/* Placeholder for customer satisfaction metrics */}
            Customer satisfaction dashboard preview
          </p>
        </div>
      }
      textSection3b={
        <div>
          <h3 className="text-2xl font-semibold mb-4">Customer-Centric Success</h3>
          <p className="text-muted-foreground mb-4">
            In today&apos;s competitive market, customer experience is the ultimate differentiator. Companies that prioritize 
            customer satisfaction see 60% higher profits than their competitors.
          </p>
          <p className="text-muted-foreground mb-4">
            Our customer-focused solutions help you understand, engage, and delight your customers at every stage 
            of their journey. From the first interaction to long-term loyalty, we provide the tools you need.
          </p>
      <p className="text-muted-foreground">
            Join leading brands that trust our platform to deliver exceptional customer experiences.
     </p>
      <Button asChild size="lg" className="mt-6">
        <Link href={signupPath}>Get Started</Link>
      </Button>
    </div>
      }
    />
  );
}
