import { PlatformPageLayout } from '@/components/layouts/PlatformPageLayout';
import Link from 'next/link';
import { buildLocalePath } from '@/lib/locale';

interface PageProps {
  params: { locale: string };
}

export default function PlatformPage({ params }: PageProps) {
  const localized = (path: string) => buildLocalePath(params?.locale, path);
  return (
    <PlatformPageLayout
      title="Platform Overview"
      subtitle="A comprehensive platform built for modern applications with everything you need to succeed"
      featureSection1b={
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href={localized('/platform/advantage-1')} className="p-6 bg-background rounded-lg border hover:border-primary transition-colors">
            <h3 className="font-semibold mb-2">⚡ Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">Unmatched performance</p>
          </Link>
          <Link href={localized('/platform/advantage-2')} className="p-6 bg-background rounded-lg border hover:border-primary transition-colors">
            <h3 className="font-semibold mb-2">📈 Scale with Confidence</h3>
            <p className="text-sm text-muted-foreground">Grow without limits</p>
          </Link>
          <Link href={localized('/platform/ai')} className="p-6 bg-background rounded-lg border hover:border-primary transition-colors">
            <h3 className="font-semibold mb-2">🤖 AI-Powered</h3>
            <p className="text-sm text-muted-foreground">Intelligent features</p>
          </Link>
          <Link href={localized('/platform/innovation-support')} className="p-6 bg-background rounded-lg border hover:border-primary transition-colors">
            <h3 className="font-semibold mb-2">🚀 Innovation & Support</h3>
            <p className="text-sm text-muted-foreground">Always evolving</p>
          </Link>
        </div>
      }
      mainContent={
        <div className="prose prose-lg max-w-none">
          <h2 className="text-3xl font-bold mb-6">Everything You Need in One Platform</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Our platform provides a complete suite of tools and services designed to help you build, deploy, 
            and scale modern applications. From development to production, we&apos;ve got you covered.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 not-prose">
            <div className="p-6 bg-background rounded-lg border">
              <h3 className="text-xl font-semibold mb-3">Developer Tools</h3>
              <p className="text-muted-foreground">
                Complete APIs, SDKs, CLI tools, and comprehensive documentation for developers.
              </p>
            </div>
            
            <div className="p-6 bg-background rounded-lg border">
              <h3 className="text-xl font-semibold mb-3">Infrastructure</h3>
              <p className="text-muted-foreground">
                Enterprise-grade infrastructure with global CDN, auto-scaling, and 99.99% uptime.
              </p>
            </div>
            
            <div className="p-6 bg-background rounded-lg border">
              <h3 className="text-xl font-semibold mb-3">Security & Compliance</h3>
      <p className="text-muted-foreground">
                SOC 2 certified, GDPR compliant with advanced encryption and access controls.
              </p>
            </div>
          </div>
        </div>
      }
      featureSection3a={
        <div className="bg-muted/50 rounded-lg p-8 h-full flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            Platform architecture visualization
      </p>
    </div>
      }
      textSection3b={
        <div>
          <h3 className="text-2xl font-semibold mb-4">Trusted by Developers Worldwide</h3>
          <p className="text-muted-foreground mb-4">
            Thousands of companies rely on our platform to power their most critical applications. 
            Join the community and experience the difference.
          </p>
          <Link href={localized('/contact')} className="text-primary hover:underline font-medium">
            Get Started Today →
          </Link>
        </div>
      }
    />
  );
}
