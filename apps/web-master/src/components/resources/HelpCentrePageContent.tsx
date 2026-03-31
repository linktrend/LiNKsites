"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Search, BookOpen, Zap, CreditCard, Wrench, HelpCircle, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFallbackImage } from "@/lib/imageFallback";

interface Props {
  lang: string;
}

interface CategoryCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  href: string;
}

export function HelpCentrePageContent({ lang }: Props) {
  const t = useTranslations();
  // CMS Data Structure - These will be replaced by CMS content
  const heroData = {
    // CMS: hero object
    title: "Help Centre", // CMS: hero.title
    subtitle: "Find answers, guides, and support to help you succeed", // CMS: hero.subtitle
  };

  const searchData = {
    // CMS: search object
    heading: "How can we help you?", // CMS: search.heading
    placeholder: "Search for help articles, guides, and FAQs...", // CMS: search.placeholder
  };

  const categoryCards: CategoryCard[] = [
    // CMS: categoryCards[] array
    {
      id: "1",
      icon: "BookOpen", // CMS: categoryCards[0].icon
      title: "Getting Started / Onboarding", // CMS: categoryCards[0].title
      description: "Learn how to set up your account, configure essentials, and understand the core workflow.", // CMS: categoryCards[0].description
      href: `/${lang}/resources/faq/getting-started`, // CMS: categoryCards[0].href
    },
    {
      id: "2",
      icon: "Zap",
      title: "Using the Product / Core Features",
      description: "Step-by-step guides and best practices for all main features of the platform.",
      href: `/${lang}/resources/faq/core-features`,
    },
    {
      id: "3",
      icon: "CreditCard",
      title: "Account & Billing Management",
      description: "Manage your profile, subscriptions, invoices, and account settings.",
      href: `/${lang}/resources/faq/billing`,
    },
    {
      id: "4",
      icon: "Wrench",
      title: "Troubleshooting",
      description: "Fix common errors and solve issues quickly without contacting support.",
      href: `/${lang}/resources/faq/troubleshooting`,
    },
    {
      id: "5",
      icon: "HelpCircle",
      title: "FAQs",
      description: "Quick answers to the most frequently asked questions.",
      href: `/${lang}/resources/faq/faqs`,
    },
    {
      id: "6",
      icon: "Code",
      title: "Integrations & API Documentation",
      description: "Connect external tools, use the API, and extend your workflow.",
      href: `/${lang}/resources/faq/integrations`,
    },
  ];

  const supportSection = {
    // CMS: supportSection object
    heading: "Still Need Help?", // CMS: supportSection.heading
    subheading: "Our support team is ready to assist you. Whether you're exploring our platform or need technical assistance, we're here for you.", // CMS: supportSection.subheading
    leftColumn: {
      // CMS: supportSection.leftColumn object
      text: "Can't find what you're looking for? Our team is always here to help.", // CMS: supportSection.leftColumn.text
      buttonText: "Contact Us", // CMS: supportSection.leftColumn.buttonText
      buttonHref: `/${lang}/contact`, // CMS: supportSection.leftColumn.buttonHref
    },
    rightColumn: {
      // CMS: supportSection.rightColumn object
      text: "Already a customer? Log in and open a support ticket.", // CMS: supportSection.rightColumn.text
      buttonText: "Login to Support", // CMS: supportSection.rightColumn.buttonText
      buttonHref: "#", // CMS: supportSection.rightColumn.buttonHref (placeholder for future update)
    },
  };

  // Icon mapping
  const getIcon = (iconName: string) => {
    const icons = {
      BookOpen,
      Zap,
      CreditCard,
      Wrench,
      HelpCircle,
      Code,
    };
    return icons[iconName as keyof typeof icons] || HelpCircle;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* SECTION 1: Hero Section */}
      <section
        id="help-centre-hero"
        className="relative bg-cover bg-center"
        data-cms-section="hero"
        style={{ backgroundImage: `url(${getFallbackImage('hero')})` }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Hero Content */}
        <div className="relative z-10 container px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white"
              data-cms-field="hero.title"
            >
              {heroData.title}
            </h1>
            <p
              className="text-lg sm:text-xl text-white/90"
              data-cms-field="hero.subtitle"
            >
              {heroData.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <section className="pt-8 sm:pt-12 pb-6 sm:pb-8">
        <div className="container px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Link href={`/${lang}`} className="hover:text-foreground transition-colors">
              {t("breadcrumbs.home")}
            </Link>
            <span>›</span>
            <Link href={`/${lang}/resources`} className="hover:text-foreground transition-colors">
              {t("navigation.resources")}
            </Link>
            <span>›</span>
            <span className="text-foreground font-medium">
              {t("navigation.helpCentre")}
            </span>
          </nav>
        </div>
      </section>

      {/* SECTION 2: Search Field */}
      <section
        id="search-section"
        className="pt-4 sm:pt-6 pb-6 sm:pb-8"
        data-cms-section="search"
      >
        <div className="container px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            {/* Search Heading */}
            <h2
              className="text-2xl sm:text-3xl font-bold mb-6"
              data-cms-field="search.heading"
            >
              {searchData.heading}
            </h2>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={searchData.placeholder}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
                data-cms-field="search.placeholder"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Category Cards Grid (3×3 with 6 cards) */}
      <section
        id="category-cards"
        className="pt-4 sm:pt-6 pb-12 sm:pb-14"
        data-cms-section="categoryCards"
      >
        <div className="container px-4 sm:px-6">
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto"
            data-cms-collection="categoryCards"
          >
            {categoryCards.map((card, index) => {
              const IconComponent = getIcon(card.icon);
              
              return (
                <Link
                  key={card.id}
                  href={card.href}
                  className="group p-6 bg-background rounded-lg border border-border hover:shadow-lg hover:border-primary/50 transition-all"
                  data-cms-item={`categoryCards[${index}]`}
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                    data-cms-field={`categoryCards[${index}].icon`}
                  >
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>

                  {/* Title */}
                  <h3
                    className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors"
                    data-cms-field={`categoryCards[${index}].title`}
                  >
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-sm text-muted-foreground"
                    data-cms-field={`categoryCards[${index}].description`}
                  >
                    {card.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: Support Section (Two Cards) */}
      <section
        id="support-section"
        className="pt-12 sm:pt-14 pb-12 sm:pb-14 bg-muted/30"
        data-cms-section="supportSection"
      >
        <div className="container px-4 sm:px-6">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2
              className="text-2xl sm:text-3xl font-bold mb-6"
              data-cms-field="supportSection.heading"
            >
              Still Need Help?
            </h2>
            <p
              className="text-base sm:text-lg text-muted-foreground mb-3"
              data-cms-field="supportSection.subheading"
            >
              Our support team is ready to assist you. Whether you&apos;re exploring our platform or need technical assistance, we&apos;re here for you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* LEFT CARD */}
            <div
              className="p-8 bg-background rounded-lg border border-border flex flex-col"
              data-cms-element="supportSection.leftColumn"
            >
              <div className="flex-1">
                <p
                  className="text-lg font-medium mb-6"
                  data-cms-field="supportSection.leftColumn.text"
                >
                  {supportSection.leftColumn.text}
                </p>
              </div>
              <div className="mt-auto">
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                  asChild
                >
                  <Link
                    href={supportSection.leftColumn.buttonHref}
                    data-cms-field="supportSection.leftColumn.buttonHref"
                  >
                    <span data-cms-field="supportSection.leftColumn.buttonText">
                      {supportSection.leftColumn.buttonText}
                    </span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* RIGHT CARD */}
            <div
              className="p-8 bg-background rounded-lg border border-border flex flex-col"
              data-cms-element="supportSection.rightColumn"
            >
              <div className="flex-1">
                <p
                  className="text-lg font-medium mb-6"
                  data-cms-field="supportSection.rightColumn.text"
                >
                  {supportSection.rightColumn.text}
                </p>
              </div>
              <div className="mt-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  asChild
                >
                  <Link
                    href={supportSection.rightColumn.buttonHref}
                    data-cms-field="supportSection.rightColumn.buttonHref"
                  >
                    <span data-cms-field="supportSection.rightColumn.buttonText">
                      {supportSection.rightColumn.buttonText}
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
