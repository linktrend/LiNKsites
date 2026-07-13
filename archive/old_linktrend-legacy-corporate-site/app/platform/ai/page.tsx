import Link from 'next/link';
import { PlatformPageLayout } from '@/components/layouts/PlatformPageLayout';
import { Button } from '@/components/ui/button';
import { buildLocalePath } from '@/lib/locale';

interface AIPageProps {
  params: { locale: string };
}

export default function AIPage({ params }: AIPageProps) {
  const signupPath = buildLocalePath(params?.locale, '/signup');
  return (
    <PlatformPageLayout
      title="Built for the Intelligent Era"
      subtitle="Every feature is powered by AI to make your work faster, decisions smarter, and experiences more human."
      featureSection1b={
        <div className="bg-gradient-to-r from-[hsl(var(--gradient-accent-from))]/15 to-[hsl(var(--gradient-danger-from))]/15 rounded-lg p-8">
          <p className="text-center text-muted-foreground">
            {/* Placeholder for AI capabilities showcase */}
            Interactive AI capabilities demo coming soon
          </p>
        </div>
      }
      mainContent={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Adaptive Intelligence</h3>
            <p className="text-muted-foreground">
              Our system learns from every interaction, continuously improving accuracy, relevance, and user experience over time.
            </p>
          </div>

          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Contextual Automation</h3>
            <p className="text-muted-foreground">
              Automate repetitive actions while keeping full control. The platform understands context, intent, and priority before acting.
            </p>
          </div>

          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Predictive Insights</h3>
            <p className="text-muted-foreground">
              Anticipate outcomes before they happen. Built-in analytics surface trends and opportunities hidden in your data.
            </p>
          </div>

          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Conversational Understanding</h3>
            <p className="text-muted-foreground">
              Use natural language to search, create, and control. Communicate with your app as easily as you talk to a colleague.
            </p>
          </div>

          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Personalized Experiences</h3>
            <p className="text-muted-foreground">
              Every workflow and dashboard adapts to each user’s habits, goals, and preferred way of working.
            </p>
          </div>

          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Trustworthy AI</h3>
            <p className="text-muted-foreground">
              Ethically trained models, transparent decision logic, and enterprise-grade security ensure every action is reliable and compliant.
            </p>
          </div>
        </div>
      }
      featureSection3a={
        <div className="bg-muted/50 rounded-lg p-8 h-full flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            {/* Placeholder for AI model showcase or use cases */}
            AI model performance visualization
          </p>
        </div>
      }
      textSection3b={
        <div>
          <h3 className="text-2xl font-semibold mb-4">The Future Works With You</h3>
          <p className="text-muted-foreground mb-4">
            Artificial intelligence is no longer a tool. It is a partner in every decision, process, and customer interaction. Our platform puts AI at the core of your operations so you can move faster, think clearer, and create impact at scale. Start building applications that evolve with every user and improve with every use.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href={signupPath}>Get Started</Link>
          </Button>
    </div>
      }
    />
  );
}
