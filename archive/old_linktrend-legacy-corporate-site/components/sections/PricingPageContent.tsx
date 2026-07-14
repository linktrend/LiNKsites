'use client';

import { useState } from 'react';
import { FeaturePageLayout } from '@/components/layouts/FeaturePageLayout';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import type { ProductWithPrices, SubscriptionWithProduct, Price } from '@starter/types';
import { User } from '@supabase/supabase-js';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe } from '@/utils/stripe/server';
import { getErrorRedirect } from '@/utils/helpers';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { dummyPricing } from '@/config/pricing';
import { cn } from '@/lib/utils';
import { buildLocalePath } from '@/lib/locale';

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
}

type BillingInterval = 'year' | 'month';

export function PricingPageContent({ user, products, subscription }: Props) {
  const router = useRouter();
  const currentPath = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'en';
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('year');
  const [priceIdLoading, setPriceIdLoading] = useState<string>();

  const handleStripeCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push('/signup');
    }

    const { errorRedirect, sessionId } = await checkoutWithStripe(price, currentPath);

    if (errorRedirect) {
      setPriceIdLoading(undefined);
      return router.push(errorRedirect);
    }

    if (!sessionId) {
      setPriceIdLoading(undefined);
      return router.push(
        getErrorRedirect(
          currentPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.'
        )
      );
    }

    const stripe = await getStripe();
    stripe?.redirectToCheckout({ sessionId });

    setPriceIdLoading(undefined);
  };

  const displayProducts = products.length ? products : dummyPricing;

  // Function to format price
  const formatPrice = (price: Price) => {
    const amount = (price.unit_amount || 0) / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency || 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Mock features for demonstration
  const mockFeatures = {
    0: [ // First plan - Basic/Free
      '60MB Storage',
      'Unlimited Tasks',
      'Unlimited Free Plan Members',
      'Two-Factor Authentication',
      'Collaborative Docs',
      'Kanban Boards',
      'Sprint Management',
      'Calendar View',
      'In-App Video Recording',
      '24/7 Support'
    ],
    1: [ // Second plan - Pro/Business
      'Unlimited Storage',
      'Unlimited Folders and Spaces',
      'Unlimited Integrations',
      'Unlimited Gantt Charts',
      'Unlimited Custom Fields',
      'Unlimited Chat Messages',
      'Unlimited Forms',
      'Email Integration',
      'Native Time Tracking',
      'Goals & Portfolios',
      'Resource Management',
      'AI Compatible'
    ],
    2: [ // Third plan - Enterprise
      'Google SSO',
      'Unlimited Message History',
      'Unlimited Mind Maps',
      'Unlimited Activity views',
      'Unlimited Timeline views',
      'Unlimited Dashboards',
      'Unlimited Whiteboards',
      'Sprint Points & Reporting',
      'Automation Integrations',
      'Custom Exporting',
      'Private Whiteboards',
      'Workload Management',
      'SMS 2-Factor Authentication'
    ]
  };

  return (
    <FeaturePageLayout
      title="The best work solution, for the best price"
      subtitle="Trusted by leading businesses worldwide"
      featureSection1b={
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Interactive performance visualization coming soon
          </p>
        </div>
      }
      mainContent={
        <div className="space-y-12">
          {/* Billing Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex items-center rounded-full border bg-background p-1">
              <button
                onClick={() => setBillingInterval('year')}
                className={cn(
                  'px-6 py-2 rounded-full text-sm font-medium transition-colors',
                  billingInterval === 'year'
                    ? 'bg-[hsl(var(--accent-red))] text-[hsl(var(--accent-red-foreground))]'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Yearly
              </button>
              <button
                onClick={() => setBillingInterval('month')}
                className={cn(
                  'px-6 py-2 rounded-full text-sm font-medium transition-colors',
                  billingInterval === 'month'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {displayProducts.map((product, index) => {
              const price = product.prices?.find((p) => p.interval === billingInterval);
              const isPopular = index === 1; // Middle plan is popular
              
              // Try to get features from metadata, fallback to mock data
              let features: string[] = [];
              try {
                const metadata = product.metadata as Record<string, unknown> | null;
                if (metadata && typeof metadata.features === 'string') {
                  features = JSON.parse(metadata.features);
                } else {
                  features = mockFeatures[index as keyof typeof mockFeatures] || [];
                }
              } catch {
                features = mockFeatures[index as keyof typeof mockFeatures] || [];
              }

              return (
                <div
                  key={product.id}
                  className={cn(
                    'relative rounded-2xl border-2 p-8 bg-background',
                    isPopular ? 'border-primary shadow-lg scale-105' : 'border-border'
                  )}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                        Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.description || 'Best for growing teams'}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      {price ? (
                        <>
                          <span className="text-5xl font-bold">
                            {formatPrice(price)}
                          </span>
                          <span className="text-muted-foreground">
                            per {billingInterval === 'year' ? 'year' : 'month'}
                          </span>
                        </>
                      ) : (
                        <span className="text-5xl font-bold">Custom</span>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => price && handleStripeCheckout(price)}
                    disabled={!price || priceIdLoading === price?.id}
                    className={cn(
                      'w-full mb-8',
                      isPopular ? 'bg-primary hover:bg-primary/90' : ''
                    )}
                    size="lg"
                  >
                    {subscription?.prices?.some((p) => p.product_id === product.id)
                      ? 'Current Plan'
                      : priceIdLoading === price?.id
                      ? 'Loading...'
                      : price
                      ? 'Get started'
                      : 'Contact sales'}
                  </Button>

                  <div className="space-y-4">
                    <p className="font-semibold text-sm">
                      {(product.metadata as Record<string, unknown> | null)?.featuresTitle as string || 'Key Features:'}
                    </p>
                    <ul className="space-y-3">
                      {features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Info */}
          {displayProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground mb-4">
                No pricing plans available. Configure them in your admin dashboard.
              </p>
              <Button asChild variant="outline">
                <a href={buildLocalePath(locale, '/console/billing')}>Go to Admin Console</a>
              </Button>
            </div>
          )}
        </div>
      }
      featureSection3a={
        <div className="bg-muted/50 rounded-lg p-8 h-full">
          <h3 className="text-2xl font-semibold mb-6">Why Choose Us?</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
              <span>Cancel anytime with no penalties</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
              <span>100% money-back guarantee within 30 days</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
              <span>24/7 customer support included</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
              <span>Free updates and new features</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
              <span>Enterprise-grade security</span>
            </li>
          </ul>
        </div>
      }
      textSection3b={
        <div className="h-full">
          <h3 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Can I upgrade or downgrade at any time?</h4>
              <p className="text-muted-foreground text-sm">
                Yes! You can change your plan at any time. Upgrades take effect immediately, 
                and downgrades will apply at the end of your current billing period.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
              <p className="text-muted-foreground text-sm">
                We accept all major credit cards and debit cards through our secure payment 
                processor, Stripe.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Is there a free trial?</h4>
              <p className="text-muted-foreground text-sm">
                Yes! All paid plans come with a 14-day free trial. No credit card required 
                to get started.
              </p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Have more questions?
              </p>
              <a href={buildLocalePath(locale, '/contact')} className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                Contact us →
              </a>
            </div>
          </div>
        </div>
      }
    />
  );
}
