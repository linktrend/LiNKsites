import Link from 'next/link';
import { PlatformPageLayout } from '@/components/layouts/PlatformPageLayout';
import { Button } from '@/components/ui/button';
import { buildLocalePath } from '@/lib/locale';

interface RoleSolutionsPageProps {
  params: { locale: string };
}

export default function RoleSolutionsPage({ params }: RoleSolutionsPageProps) {
  const signupPath = buildLocalePath(params?.locale, '/signup');
  return (
    <PlatformPageLayout
      title="Solutions by Role"
      subtitle="Purpose-built tools for every role in your organization to maximize productivity"
      featureSection1b={
        <div className="bg-gradient-to-r from-[hsl(var(--gradient-danger-from))]/15 to-[hsl(var(--gradient-warning-from))]/15 rounded-lg p-8">
          <p className="text-center text-muted-foreground">
            {/* Placeholder for role-based features showcase */}
            Role-based interface preview coming soon
          </p>
        </div>
      }
      mainContent={
        <div className="space-y-12">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-center">Tools Built for Your Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Developers</h3>
                <p className="text-muted-foreground mb-3">
                  Complete API access, SDKs in multiple languages, CLI tools, and extensive documentation. Build faster with our developer-first platform.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• RESTful & GraphQL APIs</li>
                  <li>• Comprehensive SDKs</li>
                  <li>• CI/CD integrations</li>
                  <li>• Local development tools</li>
                </ul>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Product Managers</h3>
                <p className="text-muted-foreground mb-3">
                  Analytics dashboards, feature flagging, user feedback tools, and roadmap planning. Make data-driven decisions with confidence.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• User analytics & insights</li>
                  <li>• Feature management</li>
                  <li>• A/B testing tools</li>
                  <li>• Feedback collection</li>
                </ul>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Designers</h3>
                <p className="text-muted-foreground mb-3">
                  Design systems, component libraries, prototyping tools, and collaboration features. Create beautiful, consistent experiences.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Design system libraries</li>
                  <li>• Figma integration</li>
                  <li>• Real-time collaboration</li>
                  <li>• Version control</li>
                </ul>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Marketing Teams</h3>
                <p className="text-muted-foreground mb-3">
                  Campaign management, email automation, SEO tools, and conversion optimization. Drive growth and engagement at scale.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Campaign automation</li>
                  <li>• SEO optimization</li>
                  <li>• Analytics integration</li>
                  <li>• Lead nurturing</li>
                </ul>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Sales Teams</h3>
                <p className="text-muted-foreground mb-3">
                  CRM integration, pipeline management, proposal automation, and performance tracking. Close deals faster and more efficiently.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• CRM sync</li>
                  <li>• Deal tracking</li>
                  <li>• Quote generation</li>
                  <li>• Sales analytics</li>
                </ul>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Support Teams</h3>
                <p className="text-muted-foreground mb-3">
                  Ticketing system, knowledge base, live chat, and customer history. Deliver exceptional support that delights customers.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ticket management</li>
                  <li>• Live chat & chatbots</li>
                  <li>• Knowledge base</li>
                  <li>• Customer profiles</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      }
      featureSection3a={
        <div className="bg-muted/50 rounded-lg p-8 h-full flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            {/* Placeholder for team collaboration features */}
            Cross-functional collaboration tools preview
          </p>
        </div>
      }
      textSection3b={
        <div>
          <h3 className="text-2xl font-semibold mb-4">Everyone Works Better</h3>
          <p className="text-muted-foreground mb-4">
            When tools are designed for specific roles, productivity soars. Our platform provides tailored interfaces 
            and features for each team member, ensuring everyone has exactly what they need.
          </p>
          <p className="text-muted-foreground mb-4">
            From technical teams who need APIs and integrations to business teams who need intuitive dashboards, 
            we&apos;ve built role-specific experiences that make work effortless.
          </p>
      <p className="text-muted-foreground">
            Empower every role in your organization with purpose-built tools that drive results.
     </p>
      <Button asChild size="lg" className="mt-6">
        <Link href={signupPath}>Get Started</Link>
      </Button>
    </div>
      }
    />
  );
}
