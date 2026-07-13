'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, TrendingUp, UserCheck, ArrowRight } from 'lucide-react';
import { useLocalePath } from '@/hooks/useLocalePath';

const solutions = [
  {
    icon: Users,
    title: 'For Customers',
    description: 'Tailored solutions for businesses of all sizes to serve their customers better with tools designed for exceptional service delivery.',
    href: '/solutions/customers',
  },
  {
    icon: Building2,
    title: 'By Industry',
    description: 'Industry-specific features for retail, healthcare, finance, and technology sectors, with compliance and workflow automation.',
    href: '/solutions/industry',
  },
  {
    icon: TrendingUp,
    title: 'By Company Size',
    description: 'Scalable from startups to enterprises with thousands of users. Grow seamlessly without changing platforms or workflows.',
    href: '/solutions/company-size',
  },
  {
    icon: UserCheck,
    title: 'By Role',
    description: 'Purpose-built tools for developers, designers, analysts, and executives. Each role gets the features they need most.',
    href: '/solutions/role',
  },
];

/**
 * SolutionsOverview - Displays four solution categories in a 2x2 grid
 * 
 * Features:
 * - Four solution cards with icons, titles, and descriptions
 * - Hover effects and animations
 * - Links to detailed solution pages
 * - Responsive grid layout
 */
export function SolutionsOverview() {
  const { buildPath } = useLocalePath();
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold">
          Solutions for Every Need
        </h2>
        <p className="text-lg text-muted-foreground">
          Discover how our platform adapts to your unique requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {solutions.map((solution) => {
          const Icon = solution.icon;
          return (
            <Card
              key={solution.href}
              className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl">{solution.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-base leading-relaxed">
                  {solution.description}
                </CardDescription>
                <Link
                  href={buildPath(solution.href)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all"
                >
                  Explore Solutions
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
