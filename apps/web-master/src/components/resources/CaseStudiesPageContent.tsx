"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { getFallbackImage } from "@/lib/imageFallback";
import { formatDateForSSR } from "@/lib/dateUtils";
import type { CmsCaseStudy as CmsCase } from "@/lib/repository/caseStudies";

interface Props {
  lang: string;
  cases: CmsCase[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export function CaseStudiesPageContent({ lang, cases: cmsCases }: Props) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const caseStudiesPerPage = 6;
  const formattedDefaultCaseDate = useMemo(
    () => formatDateForSSR("2024-01-01T00:00:00Z"),
    []
  );

  // CMS Data Structure - These will be replaced by CMS content
  const heroData = {
    // CMS: hero object
    title: "Real Solutions", // CMS: hero.title
    subtitle: "Discover how leading companies achieve measurable results with our platform", // CMS: hero.subtitle
  };

  // Convert CMS cases to component format
  const allCaseStudies = useMemo(
    () =>
      (cmsCases || []).map((caseStudy, idx) => ({
        id: `${idx + 1}`,
        slug: caseStudy?.slug || "",
        title: caseStudy?.title || "Case Study",
        excerpt: caseStudy?.summary || "",
        image: getFallbackImage("case"),
        category: "Case Study",
        date: formattedDefaultCaseDate,
      })),
    [cmsCases, formattedDefaultCaseDate]
  );

  const categories: Category[] = [
    {
      id: "all",
      name: "All Case Studies",
      slug: "all",
      image: "",
    },
  ];

  // Old mock data removed - now using CMS data

  // Filter case studies based on search query and selected category
  const filteredCaseStudies = allCaseStudies.filter((caseStudy) => {
    const matchesSearch = caseStudy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseStudy.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseStudy.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || 
      caseStudy.category === categories.find(c => c.slug === selectedCategory)?.name;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredCaseStudies.length / caseStudiesPerPage);
  const startIndex = (currentPage - 1) * caseStudiesPerPage;
  const endIndex = startIndex + caseStudiesPerPage;
  const currentCaseStudies = filteredCaseStudies.slice(startIndex, endIndex);

  // Category change handler
  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setCurrentPage(1); // Reset to first page when category changes
  };

  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  const goToPage = (page: number) => setCurrentPage(page);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* SECTION 1: Hero Section */}
      <section
        id="case-studies-hero"
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
      <section className="pt-8 sm:pt-12 pb-2 sm:pb-3">
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
              {t("navigation.caseStudies")}
            </span>
          </nav>
        </div>
      </section>

      {/* SECTION 2: Categories Section (Horizontally Scrollable) */}
      <section
        id="categories-section"
        className="pt-4 sm:pt-6 pb-6 sm:pb-8"
        data-cms-section="categories"
      >
        <div className="container px-4 sm:px-6">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" data-cms-collection="categories">
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-full font-medium text-sm transition-all ${
                  selectedCategory === category.slug
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
                data-cms-item={`categories[${index}]`}
                data-cms-field={`categories[${index}].name`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Search Field */}
      <section
        id="search-section"
        className="pt-4 sm:pt-6 pb-6 sm:pb-8"
        data-cms-section="search"
      >
        <div className="container px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center">Real Solutions</h2>
            <p className="text-center text-base sm:text-lg text-muted-foreground mb-6">Search through our collection of success stories</p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search case studies..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
                data-cms-field="search.placeholder"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Case Studies Cards Grid */}
      <section
        id="case-studies-grid"
        className="pt-6 sm:pt-8 pb-8 sm:pb-12"
        data-cms-section="caseStudies"
      >
        <div className="container px-4 sm:px-6">
          {currentCaseStudies.length > 0 ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              data-cms-collection="caseStudies"
            >
              {currentCaseStudies.map((caseStudy, index) => (
                <Link
                  key={caseStudy.id}
                  href={`/${lang}/resources/cases/${caseStudy.slug}`}
                  className="group flex flex-col bg-background rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
                  data-cms-item={`caseStudies[${index}]`}
                >
                  {/* Case Study Image */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden">
                    <Image
                      src={caseStudy.image}
                      alt={caseStudy.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      data-cms-field={`caseStudies[${index}].image`}
                    />
                  </div>

                  {/* Case Study Content */}
                  <div className="flex-1 p-6 flex flex-col">
                    {/* Category Tag */}
                    <span
                      className="text-xs font-semibold text-primary uppercase tracking-wide mb-3"
                      data-cms-field={`caseStudies[${index}].category`}
                    >
                      {caseStudy.category}
                    </span>

                    {/* Title */}
                    <h3
                      className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2"
                      data-cms-field={`caseStudies[${index}].title`}
                    >
                      {caseStudy.title}
                    </h3>

                    {/* Excerpt */}
                    <p
                      className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1"
                      data-cms-field={`caseStudies[${index}].excerpt`}
                    >
                      {caseStudy.excerpt}
                    </p>

                    {/* Date */}
                    <p
                      className="text-xs text-muted-foreground"
                      data-cms-field={`caseStudies[${index}].date`}
                    >
                      {caseStudy.date}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No case studies found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Scrollbar Hide Styles */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* SECTION 5: Pagination Bar */}
      {totalPages > 1 && (
        <section
          id="pagination-section"
          className="pt-6 sm:pt-8 pb-12 sm:pb-16"
          data-cms-section="pagination"
        >
          <div className="container px-4 sm:px-6">
            <nav className="flex items-center justify-center gap-2" aria-label="Pagination navigation">
              {/* First Page Button */}
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Go to first page"
              >
                <ChevronsLeft className="h-5 w-5" aria-hidden="true" />
              </button>

              {/* Previous Page Button */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Go to previous page"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-2">
                {getPageNumbers().map((page, index) => (
                  <span key={index}>
                    {page === "..." ? (
                      <span className="px-3 py-2 text-muted-foreground">...</span>
                    ) : (
                      <button
                        onClick={() => goToPage(page as number)}
                        className={`min-w-[40px] px-3 py-2 rounded-lg border transition-colors ${
                          currentPage === page
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:bg-muted"
                        }`}
                        aria-label={`Go to page ${page}`}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {/* Next Page Button */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Go to next page"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>

              {/* Last Page Button */}
              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Go to last page"
              >
                <ChevronsRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>

            {/* Page Info */}
            <div className="text-center mt-4 text-sm text-muted-foreground" role="status" aria-live="polite">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
