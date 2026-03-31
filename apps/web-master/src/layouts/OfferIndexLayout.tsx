"use client";

import Link from "next/link";
import Image from "next/image";
import { CmsOffer } from "@/lib/repository/offers";
import { CmsArticle as CmsResource } from "@/lib/repository/articles";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { getFallbackImage } from "@/lib/imageFallback";
import { routes } from "@/lib/routes";
import * as LucideIcons from "lucide-react";

type Props = { lang: string; page: { data: { offers: CmsOffer[]; resources?: CmsResource[] } } };

export function OfferIndexLayout({ lang, page }: Props) {
  const offers = page.data.offers;
  const resources = page.data.resources ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative bg-cover bg-center"
        style={{ backgroundImage: `url(${getFallbackImage('hero')})` }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Hero Content */}
        <div className="relative z-10 container px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white">
              Solutions Built for Scale
            </h1>
            <p className="text-lg sm:text-xl text-white/90">
              Enterprise-grade products and services designed to accelerate your digital transformation
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
            <span className="text-foreground font-medium" aria-current="page">
              Products & Services
            </span>
          </nav>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="pt-4 sm:pt-6 pb-6 sm:pb-8">
        <div className="container px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                Our Offerings
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                Choose the solution that fits your needs
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className="w-full sm:w-auto">
                  <Link href={routes.contact(lang)}>
                    Talk to Sales
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                  <Link href={routes.pricing(lang)}>
                    View Pricing
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {offers.map((offer, index) => {
                // Map offer types to icons
                const iconMap: Record<string, string> = {
                  "ai-automation": "Bot",
                  "data-insights": "BarChart3",
                  "automation": "Zap",
                  "analytics": "TrendingUp",
                  "integration": "Plug",
                  "consulting": "Users",
                };
                const iconName = iconMap[offer.slug] || "Package";
                const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Package;

                return (
            <Link
              key={offer.slug}
              href={routes.offer(lang, offer.slug)}
                    className="group relative flex flex-col p-8 bg-card rounded-lg border border-border hover:border-primary hover:shadow-lg transition-all duration-200"
                  >
                    {/* Icon */}
                    <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-7 w-7 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                        {offer.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {offer.subtitle}
                      </p>
                    </div>

                    {/* CTA */}
                    <div className="mt-6 flex items-center text-primary font-medium group-hover:translate-x-1 transition-transform">
                      <span>Learn more</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>

                    {/* Hover effect border */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/10 transition-all duration-200 pointer-events-none" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground">
              Connect with our team to discuss your specific needs and find the right solution
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild>
                <Link href={`/${lang}/contact`}>
                  Schedule a Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={`/${lang}/resources`}>
                  Browse Resources
            </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Resources (Optional) */}
      {resources.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="container px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-foreground">
                  Learn More
                </h2>
                <p className="text-muted-foreground">
                  Explore our latest insights and case studies
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.slice(0, 3).map((article) => (
            <Link
              key={article.slug}
              href={`/${lang}/resources/articles/${article.slug}`}
                    className="group flex flex-col bg-card rounded-lg border border-border hover:border-primary hover:shadow-md transition-all duration-200 overflow-hidden"
            >
                    <div className="aspect-[16/9] bg-muted relative overflow-hidden">
                      {article.image && (
                        <Image
                          src={article.image}
                          alt={`${article.title} - Article thumbnail`}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                        {article.excerpt}
                      </p>
                      <div className="mt-4 flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                        <span>Read article</span>
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </div>
                    </div>
            </Link>
          ))}
              </div>
            </div>
        </div>
      </section>
      )}
    </div>
  );
}
