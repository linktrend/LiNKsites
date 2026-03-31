'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, Sparkles, HeadphonesIcon, ArrowRight } from 'lucide-react';
import { useLocalePath } from '@/hooks/useLocalePath';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast Performance',
    description: 'Built on cutting-edge technology to deliver blazing fast speeds and instant responses, ensuring your work flows without interruption.',
    href: '/platform/advantage-1',
  },
  {
    icon: TrendingUp,
    title: 'Scale with Confidence',
    description: 'Grow from startup to enterprise without limits. Our infrastructure scales automatically to meet your needs at every stage.',
    href: '/platform/advantage-2',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Intelligence',
    description: 'Advanced AI automates workflows and provides intelligent insights, helping you make better decisions faster.',
    href: '/platform/ai',
  },
  {
    icon: HeadphonesIcon,
    title: 'Innovation & Support',
    description: 'Continuous innovation backed by 24/7 world-class support. We\'re here to help you succeed every step of the way.',
    href: '/platform/innovation-support',
  },
];

/**
 * PlatformFeatures - Displays key platform advantages in a 2x2 grid
 * 
 * Features:
 * - Four feature cards with icons, titles, and descriptions
 * - Hover effects and animations
 * - Links to detailed feature pages
 * - Responsive grid layout
 */
export function PlatformFeatures() {
  const { buildPath } = useLocalePath();
  return (
    <div className="space-y-8 flex flex-col h-full justify-between">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold">
          Platform Built for Success
        </h2>
        <p className="text-lg text-muted-foreground">
          Everything you need to grow your business, all in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.href}
              className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 flex flex-col h-full"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 flex-grow">
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
                <Link
                  href={buildPath(feature.href)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all"
                >
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
    </div>
  );
}
