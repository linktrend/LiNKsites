"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CmsOffer } from "@/lib/repository/offers";
import { CmsArticle as CmsResource } from "@/lib/repository/articles";
import { CmsCaseStudy as CmsCase } from "@/lib/repository/caseStudies";
import { CmsVideo } from "@/lib/repository/videos";
import { CmsFaq } from "@/lib/repository/faq";
import { productSchema } from "../lib/schemas";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { PricingToggle } from "@/components/pricing/PricingToggle";
import { APP_URLS } from "@/config";
import { getFallbackImage } from "@/lib/imageFallback";
import { routes } from "@/lib/routes";

type Props = {
  lang: string;
  page: { data: { offer?: CmsOffer; resources: CmsResource[]; caseStudies: CmsCase[]; videos: CmsVideo[]; faqs: CmsFaq[] } };
};

// Mock pricing data - will be pulled from CMS pricing collection
const getPricingForOffer = (offerSlug: string) => {
  const pricingData: Record<string, any> = {
    "ai-automation-platform": {
      plans: [
        {
          name: "Free",
          price: "$0",
          period: "forever",
          cta: "Get Started",
          ctaUrl: "/contact",
          popular: false
        },
        {
          name: "Pro",
          price: "$49",
          period: "per month",
          cta: "Start Free Trial",
          ctaUrl: "/contact",
          popular: true
        },
        {
          name: "Enterprise",
          price: "Custom",
          period: "contact sales",
          cta: "Contact Sales",
          ctaUrl: "/contact",
          popular: false
        }
      ]
    },
    "data-analytics-suite": {
      plans: [
        {
          name: "Starter",
          price: "$29",
          period: "per month",
          cta: "Get Started",
          ctaUrl: "/contact",
          popular: false
        },
        {
          name: "Pro",
          price: "$99",
          period: "per month",
          cta: "Start Free Trial",
          ctaUrl: "/contact",
          popular: true
        },
        {
          name: "Enterprise",
          price: "Custom",
          period: "contact sales",
          cta: "Contact Sales",
          ctaUrl: "/contact",
          popular: false
        }
      ]
    },
    "ai-strategy-implementation": {
      plans: [
        {
          name: "Starter",
          price: "$99",
          period: "per month",
          cta: "Get Started",
          ctaUrl: "/contact",
          popular: false
        },
        {
          name: "Professional",
          price: "$299",
          period: "per month",
          cta: "Start Free Trial",
          ctaUrl: "/contact",
          popular: true
        },
        {
          name: "Enterprise",
          price: "Custom",
          period: "contact sales",
          cta: "Contact Sales",
          ctaUrl: "/contact",
          popular: false
        }
      ]
    },
    "data-engineering-integration": {
      plans: [
        {
          name: "Starter",
          price: "$149",
          period: "per month",
          cta: "Get Started",
          ctaUrl: "/contact",
          popular: false
        },
        {
          name: "Professional",
          price: "$499",
          period: "per month",
          cta: "Start Free Trial",
          ctaUrl: "/contact",
          popular: true
        },
        {
          name: "Enterprise",
          price: "Custom",
          period: "contact sales",
          cta: "Contact Sales",
          ctaUrl: "/contact",
          popular: false
        }
      ]
    }
  };
  
  // DEFAULT pricing for all other offers
  const defaultPlans = {
    plans: [
      {
        name: "Starter",
        price: "$99",
        period: "per month",
        cta: "Get Started",
        ctaUrl: "/contact",
        popular: false
      },
      {
        name: "Professional",
        price: "$299",
        period: "per month",
        cta: "Start Free Trial",
        ctaUrl: "/contact",
        popular: true
      },
      {
        name: "Enterprise",
        price: "Custom",
        period: "contact sales",
        cta: "Contact Sales",
        ctaUrl: "/contact",
        popular: false
      }
    ]
  };
  
  return pricingData[offerSlug] || defaultPlans;
};

export function OfferPageLayout({ lang, page }: Props) {
  const { offer, resources, caseStudies, faqs } = page.data;
  const [openFeatureIndex, setOpenFeatureIndex] = useState<number | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");

  // Helper function to calculate price and period based on billing period
  const getPriceDisplay = (monthlyPrice: string) => {
    // Handle edge cases
    if (monthlyPrice === "Custom") return { price: "Custom", period: "contact sales" };
    if (monthlyPrice === "$0") return { price: "$0", period: "forever" };
    
    const price = parseInt(monthlyPrice.replace("$", ""));
    
    if (billingPeriod === "annual") {
      // Calculate total annual price with 20% discount
      const annualTotal = Math.round(price * 12 * 0.8);
      return { price: `$${annualTotal}`, period: "annually" };
    }
    
    return { price: monthlyPrice, period: "monthly" };
  };
  
  if (!offer) return <div className="container py-12">Offer not found.</div>;
  
  const schema = productSchema({
    name: offer.title,
    description: offer.subtitle ?? offer.description ?? '',
    url: `/${lang}/offers/${offer.slug}`
  });

  const pricing = getPricingForOffer(offer.slug);
  
  // MOCK DATA - Ensure sections always show
  const mockCaseStudies = caseStudies.length > 0 ? caseStudies : [
    {
      slug: "case-1",
      title: "How Company X Increased Efficiency by 300%",
      summary: "Learn how this enterprise client transformed their operations using our solution, achieving remarkable results in just 6 months.",
      image: getFallbackImage('case'),
      relatedOffers: [offer.slug]
    },
    {
      slug: "case-2",
      title: "Scaling Success: A Fortune 500 Story",
      summary: "Discover how a Fortune 500 company leveraged our platform to scale their operations globally while reducing costs.",
      image: getFallbackImage('case'),
      relatedOffers: [offer.slug]
    },
    {
      slug: "case-3",
      title: "From Manual to Automated: A Transformation Journey",
      summary: "See how automation helped this mid-sized company eliminate manual processes and focus on strategic growth.",
      image: getFallbackImage('case'),
      relatedOffers: [offer.slug]
    },
    {
      slug: "case-4",
      title: "Driving Innovation with Data-Driven Insights",
      summary: "Learn how data analytics empowered this organization to make better decisions and drive innovation across teams.",
      image: getFallbackImage('case'),
      relatedOffers: [offer.slug]
    }
  ];
  
  const mockResources = resources.length > 0 ? resources : [
    {
      slug: "article-1",
      title: "Getting Started with " + offer.title,
      excerpt: "A comprehensive guide to implementing and maximizing the value of this solution in your organization.",
      image: getFallbackImage('article'),
      offerSlug: offer.slug,
      type: "article"
    },
    {
      slug: "article-2",
      title: "Best Practices for " + offer.title,
      excerpt: "Expert tips and strategies to get the most out of your investment and achieve optimal results.",
      image: getFallbackImage('article'),
      offerSlug: offer.slug,
      type: "article"
    },
    {
      slug: "article-3",
      title: "Advanced Techniques and Use Cases",
      excerpt: "Explore advanced features and real-world use cases that demonstrate the full potential of this solution.",
      image: getFallbackImage('article'),
      offerSlug: offer.slug,
      type: "article"
    },
    {
      slug: "article-4",
      title: "Industry Trends and Future Outlook",
      excerpt: "Stay ahead of the curve with insights into emerging trends and how this solution positions you for success.",
      image: getFallbackImage('article'),
      offerSlug: offer.slug,
      type: "article"
    }
  ];
  
  const mockFaqs = faqs.length > 0 ? faqs : [
    {
      question: "How long does implementation take?",
      answer: "Implementation typically takes 2-4 weeks depending on your organization's size and complexity. Our team provides full support throughout the process."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We offer 24/7 customer support via email, chat, and phone. Enterprise customers also get a dedicated account manager and priority support."
    },
    {
      question: "Can I integrate with my existing tools?",
      answer: "Yes! We offer integrations with over 1,000+ popular tools and services. Custom integrations are also available through our API."
    },
    {
      question: "Is training included?",
      answer: "Yes, we provide comprehensive training materials, video tutorials, and live training sessions for all customers. Enterprise plans include personalized onboarding."
    },
    {
      question: "What about data security?",
      answer: "Security is our top priority. We're SOC 2 Type II certified, use end-to-end encryption, and comply with GDPR, CCPA, and other major data protection regulations."
    }
  ];
  
  // Mock feature descriptions - will come from CMS
  const featureDescriptions: Record<string, string> = {
    "Automated Workflows": "Build powerful automation workflows that connect your tools and streamline repetitive tasks. Our visual workflow builder makes it easy to create complex automations without coding.",
    "AI-Powered Insights": "Leverage advanced machine learning algorithms to gain actionable insights from your data. Our AI models continuously learn and improve to provide increasingly accurate predictions.",
    "Real-time Analytics": "Monitor your business metrics in real-time with our advanced analytics dashboard. Get instant alerts when key metrics change and make data-driven decisions faster.",
    "Custom Integrations": "Connect with over 1,000+ apps and services through our extensive integration library. Build custom integrations using our developer-friendly API and webhooks.",
    "Team Collaboration": "Work together seamlessly with built-in collaboration tools. Share dashboards, comment on insights, and coordinate actions across your entire team.",
    "Enterprise Security": "Bank-level security with SOC 2 Type II compliance, end-to-end encryption, and advanced access controls. Your data is protected at every level."
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ScrollToTop />

      {/* Hero Section - Same as Contact */}
      <section 
        className="relative bg-cover bg-center"
        style={{ backgroundImage: `url(${getFallbackImage('hero')})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 container px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white">
              {offer.title}
            </h1>
            <p className="text-lg sm:text-xl text-white/90">
              {offer.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <section className="pt-8 sm:pt-12 pb-6 sm:pb-8">
        <div className="container px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap" aria-label="Breadcrumb">
            <Link href={routes.home(lang)} className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span aria-hidden="true">›</span>
            <Link href={routes.offers(lang)} className="hover:text-foreground transition-colors">
              Products & Services
            </Link>
            <span aria-hidden="true">›</span>
            <span className="text-foreground font-medium" aria-current="page">
              {offer.title}
            </span>
          </nav>
        </div>
      </section>

      {/* Key Features Section - Collapsible */}
      {offer.features && offer.features.length > 0 && (
        <section className="pt-4 sm:pt-6 pb-12 sm:pb-14">
          <div className="container px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-foreground">Key Features</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {offer.description || "Everything you need to succeed"}
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" asChild>
                    <a href={APP_URLS.signup} target="_blank" rel="noopener noreferrer">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => {
                      const pricingSection = document.getElementById('pricing-section');
                      if (pricingSection) {
                        pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    aria-label="Scroll to pricing section"
                  >
                    View Pricing
                  </Button>
                </div>
              </div>

              {/* Collapsible Features List - TWO COLUMNS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {offer.features.map((feature, idx) => (
                  <div key={idx} className="border border-border rounded-lg bg-card overflow-hidden">
                    <button
                      onClick={() => setOpenFeatureIndex(openFeatureIndex === idx ? null : idx)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                      aria-expanded={openFeatureIndex === idx}
                      aria-controls={`feature-description-${idx}`}
                    >
                      <span className="font-semibold text-foreground">{feature}</span>
                      <ChevronDown 
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                          openFeatureIndex === idx ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    {openFeatureIndex === idx && (
                      <div className="px-6 pb-4 pt-2" id={`feature-description-${idx}`} role="region">
                        <p className="text-muted-foreground leading-relaxed">
                          {featureDescriptions[feature] || "Detailed description of this feature coming soon."}
                        </p>
                      </div>
                    )}
            </div>
          ))}
        </div>
            </div>
          </div>
        </section>
      )}

      {/* Case Studies Section - 2x2 Grid */}
      {mockCaseStudies.length > 0 && (
        <section className="py-12 sm:py-14 bg-muted/30">
          <div className="container px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">Case Studies</h2>
                <p className="text-base text-muted-foreground">Real results from real customers</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockCaseStudies.slice(0, 4).map((caseStudy) => (
                  <Link
                    key={caseStudy.slug}
                    href={routes.caseStudy(lang, caseStudy.slug)}
                    className="group flex flex-col bg-background rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative w-full aspect-[16/10] overflow-hidden">
                      <Image
                        src={'image' in caseStudy ? caseStudy.image : getFallbackImage('case')}
                        alt={`${caseStudy.title} - Case study thumbnail`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 p-6 flex flex-col">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">
                        Case Study
                      </span>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {caseStudy.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                        {caseStudy.summary}
                      </p>
                    </div>
                  </Link>
          ))}
        </div>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section - Redesigned */}
      {pricing.plans.length > 0 && (
        <section id="pricing-section" className="py-12 sm:py-14">
          <div className="container px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-foreground">Pricing Plans</h2>
                <p className="text-lg text-muted-foreground">Choose the plan that fits your needs</p>
              </div>
              
              {/* Pricing Toggle */}
              <div className="flex justify-end mb-6">
                <PricingToggle billingPeriod={billingPeriod} onToggle={setBillingPeriod} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {pricing.plans.map((plan: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={`relative flex flex-col bg-card rounded-lg border-2 overflow-hidden ${
                      idx === 1 
                        ? 'border-primary shadow-xl md:scale-105' 
                        : 'border-border'
                    } ${idx === 1 ? 'md:py-10 py-8' : 'py-8'} px-8`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-0 -left-0">
                        <div className="bg-rose-500 text-white text-xs font-bold px-4 py-1.5 rounded-br-lg">
                          Most Popular
                        </div>
                      </div>
                    )}

                    <div className={`${plan.popular ? 'mt-4' : ''} mb-6`}>
                      <h3 className="text-2xl font-bold mb-4 text-foreground">{plan.name}</h3>
                      <div className="flex items-baseline gap-2 mb-6">
                        {(() => {
                          const { price, period } = getPriceDisplay(plan.price);
                          return (
                            <>
                              <span className="text-4xl font-bold text-foreground">{price}</span>
                              <span className="text-muted-foreground">/ {period}</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex-1"></div>

                    <Button
                      className={`w-full mt-auto ${plan.popular ? 'btn-accent-red' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      asChild
                    >
                      <a href={APP_URLS.signup} target="_blank" rel="noopener noreferrer">
                        Start Now
                      </a>
                    </Button>
            </div>
          ))}
        </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section - Collapsible */}
      {mockFaqs.length > 0 && (
        <section className="py-12 sm:py-14 bg-muted/30">
          <div className="container px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-foreground">Frequently Asked Questions</h2>
                <p className="text-lg text-muted-foreground">Get answers to common questions</p>
              </div>
              <div className="space-y-3">
                {mockFaqs.map((faq, idx) => (
                  <div key={idx} className="border border-border rounded-lg bg-card overflow-hidden">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                      aria-expanded={openFaqIndex === idx}
                      aria-controls={`faq-answer-${idx}`}
                    >
                      <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                      <ChevronDown 
                        className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${
                          openFaqIndex === idx ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    {openFaqIndex === idx && (
                      <div className="px-6 pb-4 pt-2" id={`faq-answer-${idx}`} role="region">
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
            </div>
          ))}
        </div>
            </div>
          </div>
        </section>
      )}

      {/* Related Articles Section - 2x2 Grid */}
      {mockResources.length > 0 && (
        <section className="py-12 sm:py-14">
          <div className="container px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">Related Articles</h2>
                <p className="text-base text-muted-foreground">Learn more about this solution</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockResources.slice(0, 4).map((article) => (
            <Link
              key={article.slug}
              href={routes.article(lang, article.slug)}
                    className="group flex flex-col bg-background rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative w-full aspect-[16/10] overflow-hidden">
                      {article.image && (
                        <Image
                          src={article.image}
                          alt={`${article.title} - Article thumbnail`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="flex-1 p-6 flex flex-col">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">
                        Article
                      </span>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                        {article.excerpt}
                      </p>
                    </div>
            </Link>
          ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA Section */}
      <section className="py-12 sm:py-14 border-t">
        <div className="container px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of teams already using {offer.title} to drive results
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild>
                <a href={APP_URLS.signup} target="_blank" rel="noopener noreferrer">
                  Get Started Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={routes.resources(lang)}>
                  Browse Resources
            </Link>
              </Button>
            </div>
          </div>
        </div>
    </section>
    </div>
  );
}
