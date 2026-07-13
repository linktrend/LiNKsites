import { PlatformPageLayout } from '@/components/layouts/PlatformPageLayout';
import Link from 'next/link';
import { buildLocalePath } from '@/lib/locale';

interface PageProps {
  params: { locale: string };
}

export default function SolutionsPage({ params }: PageProps) {
  const localized = (path: string) => buildLocalePath(params?.locale, path);
  return (
    <PlatformPageLayout
      title="Solutions Overview"
      subtitle="Tailored solutions for every business, industry, and role"
      featureSection1b={
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href={localized('/solutions/customers')} className="p-6 bg-background rounded-lg border hover:border-primary transition-colors">
            <h3 className="font-semibold mb-2">👥 For Customers</h3>
            <p className="text-sm text-muted-foreground">Customer-focused solutions</p>
          </Link>
          <Link href={localized('/solutions/industry')} className="p-6 bg-background rounded-lg border hover:border-primary transition-colors">
            <h3 className="font-semibold mb-2">🏢 By Industry</h3>
            <p className="text-sm text-muted-foreground">Industry-specific features</p>
          </Link>
          <Link href={localized('/solutions/company-size')} className="p-6 bg-background rounded-lg border hover:border-primary transition-colors">
            <h3 className="font-semibold mb-2">📊 By Company Size</h3>
            <p className="text-sm text-muted-foreground">Right-sized for you</p>
          </Link>
          <Link href={localized('/solutions/role')} className="p-6 bg-background rounded-lg border hover:border-primary transition-colors">
            <h3 className="font-semibold mb-2">🎯 By Role</h3>
            <p className="text-sm text-muted-foreground">Tools for your role</p>
          </Link>
        </div>
      }
      mainContent={
        <div className="prose prose-lg max-w-none">
          <h2 className="text-3xl font-bold mb-6">Solutions Built for Your Success</h2>
          <p className="text-muted-foreground text-lg mb-8">
            We understand that every business has unique needs. That&apos;s why we&apos;ve created specialized solutions 
            designed to address the specific challenges faced by different industries, company sizes, and roles.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
            <div className="p-6 bg-background rounded-lg border">
              <h3 className="text-xl font-semibold mb-3">Customer Experience</h3>
              <p className="text-muted-foreground mb-4">
                Build exceptional customer experiences with personalization, omnichannel support, and analytics.
              </p>
              <Link href={localized('/solutions/customers')} className="text-primary hover:underline text-sm">
                Learn More →
              </Link>
            </div>
            
            <div className="p-6 bg-background rounded-lg border">
              <h3 className="text-xl font-semibold mb-3">Industry Expertise</h3>
              <p className="text-muted-foreground mb-4">
                Specialized solutions for healthcare, finance, retail, education, and more industries.
              </p>
              <Link href={localized('/solutions/industry')} className="text-primary hover:underline text-sm">
                Explore Industries →
              </Link>
            </div>
            
            <div className="p-6 bg-background rounded-lg border">
              <h3 className="text-xl font-semibold mb-3">Scale Your Business</h3>
              <p className="text-muted-foreground mb-4">
                From startups to enterprises, we have the right solution for your company size.
              </p>
              <Link href={localized('/solutions/company-size')} className="text-primary hover:underline text-sm">
                Find Your Fit →
              </Link>
            </div>
            
            <div className="p-6 bg-background rounded-lg border">
              <h3 className="text-xl font-semibold mb-3">Role-Based Tools</h3>
              <p className="text-muted-foreground mb-4">
                Purpose-built tools for developers, product managers, designers, and more roles.
              </p>
              <Link href={localized('/solutions/role')} className="text-primary hover:underline text-sm">
                View by Role →
              </Link>
            </div>
          </div>
        </div>
      }
      featureSection3a={
        <div className="bg-muted/50 rounded-lg p-8 h-full flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            Success stories carousel
      </p>
    </div>
      }
      textSection3b={
        <div>
          <h3 className="text-2xl font-semibold mb-4">Ready to Get Started?</h3>
          <p className="text-muted-foreground mb-4">
            Discover how our solutions can help you achieve your business goals. Schedule a demo 
            or contact our team to learn more.
          </p>
          <Link href={localized('/contact')} className="text-primary hover:underline font-medium">
            Contact Sales →
          </Link>
        </div>
      }
    />
  );
}
