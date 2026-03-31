import { ResourcePageLayout } from '@/components/layouts/ResourcePageLayout';
import Link from 'next/link';
import { buildLocalePath } from '@/lib/locale';

interface PageProps {
  params: { locale: string };
}

export default function ResourcesPage({ params }: PageProps) {
  const localized = (path: string) => buildLocalePath(params?.locale, path);
  return (
    <ResourcePageLayout
      title="Resources"
      subtitle="Everything you need to learn, build, and succeed with our platform"
      mainContent={
        <div className="space-y-12">
          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href={localized('/resources/library')} className="p-8 bg-primary/5 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <h3 className="text-2xl font-semibold mb-3">📚 Resource Library</h3>
              <p className="text-muted-foreground">
                Browse our comprehensive library of guides, templates, case studies, and whitepapers.
              </p>
            </Link>

            <Link href={localized('/resources/for-customers')} className="p-8 bg-muted/30 rounded-lg border hover:border-primary/40 transition-colors">
              <h3 className="text-2xl font-semibold mb-3">🎯 For Customers</h3>
      <p className="text-muted-foreground">
                Access customer-specific resources, support materials, and account management tools.
              </p>
            </Link>
          </div>

          {/* Resource Categories */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Explore by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Documentation</h3>
                <p className="text-muted-foreground mb-4">
                  Complete technical documentation, API references, and integration guides.
                </p>
                <Link href={localized('/docs')} className="text-primary hover:underline text-sm font-medium">
                  View Docs →
                </Link>
              </div>

              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Tutorials</h3>
                <p className="text-muted-foreground mb-4">
                  Step-by-step tutorials and video guides for common use cases and features.
                </p>
                <Link href={localized('/resources/library#tutorials')} className="text-primary hover:underline text-sm font-medium">
                  Browse Tutorials →
                </Link>
              </div>

              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Best Practices</h3>
                <p className="text-muted-foreground mb-4">
                  Learn industry best practices for security, performance, and scalability.
                </p>
                <Link href={localized('/resources/library#best-practices')} className="text-primary hover:underline text-sm font-medium">
                  Read Guides →
                </Link>
              </div>

              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Case Studies</h3>
                <p className="text-muted-foreground mb-4">
                  Real-world success stories from companies using our platform.
                </p>
                <Link href={localized('/resources/library#case-studies')} className="text-primary hover:underline text-sm font-medium">
                  View Case Studies →
                </Link>
              </div>

              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Webinars & Events</h3>
                <p className="text-muted-foreground mb-4">
                  Join our live webinars and events to learn from experts.
                </p>
                <Link href={localized('/resources/library#events')} className="text-primary hover:underline text-sm font-medium">
                  View Schedule →
                </Link>
              </div>

              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Help Center</h3>
                <p className="text-muted-foreground mb-4">
                  Find answers to frequently asked questions and get support.
                </p>
                <Link href={localized('/help-center')} className="text-primary hover:underline text-sm font-medium">
                  Get Help →
                </Link>
              </div>
            </div>
          </div>
        </div>
      }
      featureSection3a={
        <div className="bg-muted/50 rounded-lg p-8 h-full flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            Featured resources and trending content
      </p>
    </div>
      }
      textSection3b={
        <div>
          <h3 className="text-2xl font-semibold mb-4">Stay Updated</h3>
          <p className="text-muted-foreground mb-4">
            Subscribe to our newsletter to receive the latest resources, product updates, and industry insights 
            directly to your inbox.
          </p>
          <p className="text-muted-foreground mb-6">
            Have a suggestion for new content or can&apos;t find what you&apos;re looking for? We&apos;d love to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="#newsletter" className="text-primary hover:underline font-medium">
              Subscribe to Newsletter →
            </Link>
            <Link href={localized('/contact')} className="text-primary hover:underline font-medium">
              Contact Us →
            </Link>
          </div>
        </div>
      }
    />
  );
}
