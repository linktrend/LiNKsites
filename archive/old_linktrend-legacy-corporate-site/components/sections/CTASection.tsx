'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useLocalePath } from '@/hooks/useLocalePath';

/**
 * CTASection - Call-to-action section encouraging users to get started
 * 
 * Features:
 * - Compelling headline and supporting text
 * - Large CTA button
 * - Trust indicators
 * - Navigates to localized signup page on click
 */
export function CTASection() {
  const { buildPath } = useLocalePath();

  const trustIndicators = [
    'No credit card required',
    'Free forever plan',
    'Cancel anytime',
  ];

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 h-full rounded-lg">
      <CardContent className="p-8 md:p-12 space-y-6">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            Ready to get started?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of teams already using our platform to grow their business. Start for free today.
          </p>
        </div>

        <Button
          size="lg"
          asChild
          className="w-full text-lg py-6 !bg-[hsl(var(--accent-red))] !text-[hsl(var(--accent-red-foreground))] !hover:bg-[hsl(var(--accent-red))]/90"
        >
          <Link href={buildPath('/signup')}>Get Started Free</Link>
        </Button>

        <div className="space-y-3 pt-4">
          {trustIndicators.map((indicator) => (
            <div key={indicator} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{indicator}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

