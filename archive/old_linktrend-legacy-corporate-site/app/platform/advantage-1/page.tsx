import Link from 'next/link';
import { PlatformPageLayout } from '@/components/layouts/PlatformPageLayout';
import { Button } from '@/components/ui/button';
import { buildLocalePath } from '@/lib/locale';

interface Advantage1PageProps {
  params: { locale: string };
}

export default function Advantage1Page({ params }: Advantage1PageProps) {
  const signupPath = buildLocalePath(params?.locale, '/signup');
  return (
    <PlatformPageLayout
      title="Lightning Fast Performance"
      subtitle="Experience unmatched speed and efficiency with our cutting-edge platform"
      featureSection1b={
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8">
          <p className="text-center text-muted-foreground">
            {/* Placeholder for performance metrics carousel or animation */}
            Interactive performance visualization coming soon
          </p>
        </div>
      }
      mainContent={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Blazing Fast Load Times</h3>
            <p className="text-muted-foreground">
              Our optimized infrastructure ensures your applications load in milliseconds, 
              not seconds. Experience instant page loads and seamless interactions.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Global CDN Network</h3>
            <p className="text-muted-foreground">
              Content delivered from over 200 edge locations worldwide ensures minimal 
              latency regardless of your users&apos; geographic location.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Optimized Caching</h3>
            <p className="text-muted-foreground">
              Intelligent caching strategies reduce server load and deliver content 
              faster than ever before, improving user experience.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Real-Time Updates</h3>
            <p className="text-muted-foreground">
              Push updates to your users instantly with our WebSocket infrastructure, 
              enabling real-time collaboration and notifications.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Auto-Scaling</h3>
            <p className="text-muted-foreground">
              Automatically scale resources based on demand. Handle traffic spikes 
              without manual intervention or performance degradation.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Performance Monitoring</h3>
            <p className="text-muted-foreground">
              Track and optimize performance with built-in analytics and monitoring 
              tools that provide real-time insights.
            </p>
          </div>
        </div>
      }
      featureSection3a={
        <div className="bg-muted/50 rounded-lg p-8 h-full flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            {/* Placeholder for speed comparison chart or interactive demo */}
            Performance comparison visualization
          </p>
        </div>
      }
      textSection3b={
        <div>
          <h3 className="text-2xl font-semibold mb-4">Why Speed Matters</h3>
          <p className="text-muted-foreground mb-4">
            In today&apos;s digital landscape, speed is not just a feature—it&apos;s a necessity. 
            Studies show that even a one-second delay in page load time can result in a 
            7% reduction in conversions.
          </p>
          <p className="text-muted-foreground mb-4">
            Our platform is engineered from the ground up to deliver exceptional performance, 
            ensuring your users have the best possible experience every time they interact 
            with your application.
          </p>
      <p className="text-muted-foreground">
            Join thousands of satisfied customers who have seen dramatic improvements in 
            their application performance and user satisfaction.
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link href={signupPath}>Get Started</Link>
      </Button>
    </div>
      }
    />
  );
}
