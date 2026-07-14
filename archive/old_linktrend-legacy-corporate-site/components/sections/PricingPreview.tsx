'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react'; // Import useState
import { useLocalePath } from '@/hooks/useLocalePath';

const pricingTiers = [
  {
    name: 'Free',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [],
    href: '/signup',
    cta: 'Sign Up',
    highlighted: false,
  },
  {
    name: 'Pro',
    monthlyPrice: '$29',
    yearlyPrice: '$290', // $29 * 10 (approx. 2 months free)
    period: '/month',
    description: 'For growing teams',
    features: [
      'All Free features',
      'Unlimited users',
      'Priority support',
      '100GB storage',
      'Enhanced Security',
      'Advanced analytics',
    ],
    href: '/signup',
    cta: 'Sign Up',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    monthlyPrice: 'Custom',
    yearlyPrice: 'Custom',
    period: '',
    description: 'For large organizations',
    features: [],
    href: '/signup',
    cta: 'Sign Up',
    highlighted: false,
  },
];

/**
 * PricingPreview - Displays three pricing tiers vertically
 * 
 * Features:
 * - Free, Pro (highlighted), and Enterprise tiers
 * - Feature lists with checkmarks
 * - Call-to-action buttons
 * - Responsive design
 */
export function PricingPreview() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly'); // Default to yearly
  const { buildPath } = useLocalePath();

  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 h-full p-8 md:p-12 space-y-6 rounded-lg">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold">
          Simple Pricing
        </h2>
        <p className="text-lg text-muted-foreground">
          Choose the plan that fits your needs.
        </p>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mt-6">
          <div className="inline-flex items-center rounded-full border bg-background p-1">
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={cn(
                'px-6 py-2 rounded-full text-sm font-medium transition-colors',
                billingPeriod === 'yearly'
                  ? 'bg-[hsl(var(--accent-red))] text-[hsl(var(--accent-red-foreground))]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Yearly
            </button>
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                'px-6 py-2 rounded-full text-sm font-medium transition-colors',
                billingPeriod === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 flex-grow">
        {/* Free Plan - 30% */}
        <Card
          className="transition-all duration-300 hover:shadow-md flex-[30]"
        >
          <CardHeader className="pt-3 pb-3 flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{pricingTiers[0].name}</CardTitle>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-auto"
              >
                <Link href={buildPath(pricingTiers[0].href)}>{pricingTiers[0].cta}</Link>
              </Button>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-bold">{pricingTiers[0][`${billingPeriod}Price`]}</span>
              <span className="text-sm text-muted-foreground">{billingPeriod === 'monthly' ? '/month' : '/year'}</span>
            </div>
            <CardDescription className="text-xs mt-2">{pricingTiers[0].description}</CardDescription>
          </CardHeader>
          
            
            
          
        </Card>

        {/* Pro Plan - 40% */}
        <Card
          className="transition-all duration-300 border-[hsl(var(--accent-red))] shadow-lg flex-[40]"
        >
          <CardHeader className="pt-3 pb-3 flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{pricingTiers[1].name}</CardTitle>
              </div>
              <Button
                asChild
                size="sm"
                className="w-auto !bg-[hsl(var(--accent-red))] !text-[hsl(var(--accent-red-foreground))] !hover:bg-[hsl(var(--accent-red))]/90"
              >
                <Link href={buildPath(pricingTiers[1].href)}>{pricingTiers[1].cta}</Link>
              </Button>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-bold">{pricingTiers[1][`${billingPeriod}Price`]}</span>
              <span className="text-sm text-muted-foreground">{billingPeriod === 'monthly' ? '/month' : '/year'}</span>
            </div>
            <CardDescription className="text-xs mt-2">{pricingTiers[1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {pricingTiers[1].features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                  <span className="text-xs">{feature}</span>
                </li>
              ))}
            </ul>
            
          </CardContent>
        </Card>

        {/* Enterprise Plan - 30% */}
        <Card
          className="transition-all duration-300 hover:shadow-md flex-[30]"
        >
          <CardHeader className="pt-3 pb-3 flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{pricingTiers[2].name}</CardTitle>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-auto"
              >
                <Link href={buildPath(pricingTiers[2].href)}>{pricingTiers[2].cta}</Link>
              </Button>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-bold">$ {pricingTiers[2][`${billingPeriod}Price`]}</span>
              <span className="text-sm text-muted-foreground">{billingPeriod === 'monthly' ? '/month' : '/year'}</span>
            </div>
            <CardDescription className="text-xs mt-2">{pricingTiers[2].description}</CardDescription>
          </CardHeader>
          
            
            
          
        </Card>
      </div>

      <div className="text-center pt-4">
        <Link
          href={buildPath('/pricing')}
          className="text-sm font-medium text-primary hover:underline"
        >
          View detailed pricing →
        </Link>
      </div>
    </div>
  );
}
