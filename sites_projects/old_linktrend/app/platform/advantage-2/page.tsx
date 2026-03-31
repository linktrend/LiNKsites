import Link from 'next/link';
import { PlatformPageLayout } from '@/components/layouts/PlatformPageLayout';
import { Button } from '@/components/ui/button';
import { buildLocalePath } from '@/lib/locale';

interface Advantage2PageProps {
  params: { locale: string };
}

export default function Advantage2Page({ params }: Advantage2PageProps) {
  const signupPath = buildLocalePath(params?.locale, '/signup');
  return (
    <PlatformPageLayout
      title="Scale with Confidence"
      subtitle="Grow your business without worrying about infrastructure limitations"
      featureSection1b={
        <div className="bg-gradient-to-r from-[hsl(var(--gradient-brand-from))]/15 to-[hsl(var(--gradient-accent-to))]/15 rounded-lg p-8">
          <p className="text-center text-muted-foreground">
            {/* Placeholder for scaling visualization or growth chart */}
            Interactive scaling visualization coming soon
          </p>
        </div>
      }
      mainContent={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Elastic Infrastructure</h3>
            <p className="text-muted-foreground">
              Automatically adjust resources to meet demand. Scale up during peak times 
              and scale down during quiet periods to optimize costs.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Zero Downtime</h3>
            <p className="text-muted-foreground">
              Deploy updates and scale operations without service interruption. Your users 
              stay connected while you grow.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Load Balancing</h3>
            <p className="text-muted-foreground">
              Intelligent traffic distribution ensures optimal resource utilization and 
              consistent performance across all servers.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Database Scaling</h3>
            <p className="text-muted-foreground">
              Handle millions of transactions with horizontal and vertical database scaling 
              options tailored to your needs.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Global Deployment</h3>
            <p className="text-muted-foreground">
              Deploy your application to multiple regions worldwide with a single click. 
              Serve users from the closest location for optimal performance.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Cost Optimization</h3>
            <p className="text-muted-foreground">
              Pay only for what you use with our intelligent resource allocation. Save up 
              to 60% compared to traditional infrastructure.
            </p>
          </div>
        </div>
      }
      featureSection3a={
        <div className="bg-muted/50 rounded-lg p-8 h-full flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            {/* Placeholder for growth metrics or customer success stories */}
            Scaling success stories carousel
          </p>
        </div>
      }
      textSection3b={
        <div>
          <h3 className="text-2xl font-semibold mb-4">Built for Growth</h3>
          <p className="text-muted-foreground mb-4">
            Whether you&apos;re a startup expecting rapid growth or an enterprise handling 
            millions of users, our platform adapts to your needs seamlessly.
          </p>
          <p className="text-muted-foreground mb-4">
            We&apos;ve helped companies scale from 100 to 10 million users without changing 
            a single line of infrastructure code. Our battle-tested architecture handles 
            the complexity so you can focus on building great products.
          </p>
      <p className="text-muted-foreground">
            Trust in an infrastructure that&apos;s proven to scale with companies like yours.
     </p>
      <Button asChild size="lg" className="mt-6">
        <Link href={signupPath}>Get Started</Link>
      </Button>
    </div>
      }
    />
  );
}
