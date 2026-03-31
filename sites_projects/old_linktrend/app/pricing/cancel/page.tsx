import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { buildLocalePath } from '@/lib/locale';

interface PageProps {
  params: { locale: string };
}

export default function PricingCancelPage({ params }: PageProps) {
  const makeHref = (path: string) => buildLocalePath(params.locale, path);
  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardContent className="p-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-amber-100 p-4 text-amber-600">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-amber-600">Payment not completed</p>
              <h1 className="text-3xl font-bold">Checkout was cancelled</h1>
            </div>
          </div>

          <p className="text-muted-foreground text-lg">
            No charges were made. You can resume the process at any time, or reach out if something prevented you from finishing.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <h2 className="font-semibold mb-2">Common follow-ups</h2>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Review plan comparisons</li>
                <li>Invite stakeholders to approve</li>
                <li>Schedule a live product tour</li>
              </ul>
            </div>
            <div className="rounded-lg border p-4">
              <h2 className="font-semibold mb-2">Need assistance?</h2>
              <p className="text-sm text-muted-foreground">
                Our team can help with procurement paperwork, security reviews, or custom pricing.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href={makeHref('/pricing')}>Return to Pricing</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href={makeHref('/contact')}>Contact Sales</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
