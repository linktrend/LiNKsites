import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Sparkles } from 'lucide-react';
import { buildLocalePath } from '@/lib/locale';

interface PageProps {
  params: { locale: string };
}

export default function PricingSuccessPage({ params }: PageProps) {
  const makeHref = (path: string) => buildLocalePath(params.locale, path);
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--surface-inverse))] via-[hsl(var(--surface-inverse-muted))] to-[hsl(var(--surface-inverse))] text-white flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-3xl bg-white/5 border-white/10">
        <CardContent className="p-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-500/10 p-4 text-green-400">
              <CheckCircle className="h-10 w-10" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-green-300">Payment confirmed</p>
              <h1 className="text-3xl font-semibold">Welcome to LTM Starter Kit</h1>
            </div>
          </div>

          <p className="text-lg text-white/80">
            Your subscription is active and your workspace is ready. We’ve sent a receipt and onboarding tips to your email.
            Use the links below to finish onboarding or jump into the dashboard.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Next steps
              </h2>
              <ul className="space-y-2 text-sm text-white/80 list-disc list-inside">
                <li>Invite your team and assign roles</li>
                <li>Configure billing contacts & alerts</li>
                <li>Enable 2FA and admin whitelisting</li>
              </ul>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-3">
              <h2 className="text-xl font-semibold">Need help?</h2>
              <p className="text-sm text-white/80">
                Our support team is available 24/7 for enterprise customers. Visit the help center or book an onboarding session.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" asChild className="flex-1">
                  <Link href={makeHref('/dashboard/help')}>Help Center</Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href={makeHref('/contact')}>Book Session</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <Button asChild size="lg" className="flex-1">
              <Link href={makeHref('/login')}>Go to Dashboard</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="flex-1 border-white/30 text-white">
              <Link href={makeHref('/pricing')}>Manage Subscription</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
