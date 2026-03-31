"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PricingHomepageProps {
  lang: string;
  plans?: PricingPlan[];
  heading?: string;
  subheading?: string;
  monthlyLabel?: string;
  yearlyLabel?: string;
}

type BillingInterval = "year" | "month";

type PricingPlan = {
  name: string;
  description?: string;
  monthlyPrice?: string;
  yearlyPrice?: string;
  ctaText?: string;
  featuresLabel?: string;
  features?: string[];
  popular?: boolean;
};

const defaultPricingPlans: PricingPlan[] = [
  {
    name: "Free",
    description: "Perfect for pilots and proof of value",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    ctaText: "Start Free",
    featuresLabel: "What's included:",
    features: [
      "2 automations",
      "Community support",
      "Basic analytics",
      "Email notifications",
      "Standard templates"
    ],
    popular: false
  },
  {
    name: "Pro",
    description: "Best for teams operationalizing AI-driven workflows",
    monthlyPrice: "$29",
    yearlyPrice: "$290",
    ctaText: "Start Now",
    featuresLabel: "What's included in Free, plus:",
    features: [
      "Unlimited automations",
      "Priority support",
      "100GB secure storage",
      "Advanced insights",
      "Custom integrations",
      "Team collaboration",
      "Advanced analytics",
      "API access"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    description: "For regulated industries and global deployments",
    monthlyPrice: "Custom",
    yearlyPrice: "Custom",
    ctaText: "Contact Sales",
    featuresLabel: "What's included in Pro, plus:",
    features: [
      "Dedicated advisor",
      "Private cloud options",
      "Unlimited storage",
      "Custom SLA",
      "Advanced security",
      "SSO integration",
      "Custom contracts",
      "24/7 phone support"
    ],
    popular: false
  }
];

export function PricingHomepage({ lang, plans, heading, subheading, monthlyLabel, yearlyLabel }: PricingHomepageProps) {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("year");
  const pricingPlans = plans?.length ? plans : defaultPricingPlans;
  const title = heading ?? "Simple Pricing";
  const description = subheading ?? "Choose the plan that fits your automation journey.";
  const monthlyText = monthlyLabel ?? "Monthly";
  const yearlyText = yearlyLabel ?? "Yearly – Save 20%";

  return (
    <div className="container px-4 sm:px-6" data-cms-component="pricing-homepage">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3" data-cms-field="pricing.title">{title}</h2>
        <p className="text-lg text-muted-foreground mb-6" data-cms-field="pricing.subtitle">
          {description}
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center rounded-full border bg-background p-1" data-cms-field="pricing.billingToggle">
          <button
            onClick={() => setBillingInterval("month")}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-colors",
              billingInterval === "month"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            data-cms-field="pricing.monthlyButton"
          >
            {monthlyText}
          </button>
          <button
            onClick={() => setBillingInterval("year")}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-colors",
              billingInterval === "year"
                ? "bg-rose-500 text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
            data-cms-field="pricing.yearlyButton"
          >
            {yearlyText}
          </button>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-8" data-cms-field="pricing.plans">
        {pricingPlans.map((plan, planIndex) => (
          <div key={plan.name} className="relative" data-cms-field={`pricing.plan.${planIndex}`}>
            {plan.popular && (
              <div className="flex justify-center mb-3">
                <span className="inline-flex items-center rounded-full bg-rose-500 px-4 py-1 text-sm font-semibold text-white" data-cms-field="pricing.popularBadge">
                  Most Popular
                </span>
              </div>
            )}
            <Card
              className={cn(
                "relative p-8 flex flex-col h-full",
                plan.popular ? "border-rose-400 shadow-lg" : "border-border"
              )}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2" data-cms-field={`pricing.plan.${planIndex}.name`}>{plan.name}</h3>
                <p className="text-sm text-muted-foreground" data-cms-field={`pricing.plan.${planIndex}.description`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold" data-cms-field={`pricing.plan.${planIndex}.price`}>
                    {billingInterval === "year"
                      ? plan.yearlyPrice ?? plan.monthlyPrice ?? "Custom"
                      : plan.monthlyPrice ?? plan.yearlyPrice ?? "Custom"}
                  </span>
                  {(plan.monthlyPrice ?? plan.yearlyPrice) !== "Custom" && (
                    <span className="text-muted-foreground">
                      /{billingInterval === "year" ? "year" : "month"}
                    </span>
                  )}
                </div>
              </div>

              <Button
                className={cn(
                  "w-full mb-8",
                  plan.popular ? "bg-rose-500 hover:bg-rose-600 text-white" : ""
                )}
                size="lg"
                asChild
                data-cms-field={`pricing.plan.${planIndex}.cta`}
              >
                <Link href={`/${lang}/contact`}>
                  {plan.ctaText ?? "Contact Sales"}
                </Link>
              </Button>

              <div className="space-y-4 flex-1">
                <p className="font-semibold text-sm" data-cms-field={`pricing.plan.${planIndex}.featuresLabel`}>
                  {plan.featuresLabel ?? "What's included:"}
                </p>
                <ul className="space-y-3" data-cms-field={`pricing.plan.${planIndex}.features`}>
                  {(plan.features ?? []).map((feature, idx) => {
                    // Support both CMS objects {feature, included} and plain strings
                    const text =
                      typeof feature === "string"
                        ? feature
                        : typeof feature === "object" && feature
                          ? (feature as any).feature ?? JSON.stringify(feature)
                          : "";
                    return (
                      <li
                        key={idx}
                        className="flex items-start gap-3"
                        data-cms-field={`pricing.plan.${planIndex}.feature.${idx}`}
                      >
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* View detailed pricing link */}
      <div className="text-center mt-12 sm:mt-16">
        <Link 
          href={`/${lang}/pricing`}
          className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
          data-cms-field="pricing.detailedLink"
        >
          View detailed pricing →
        </Link>
      </div>
    </div>
  );
}
