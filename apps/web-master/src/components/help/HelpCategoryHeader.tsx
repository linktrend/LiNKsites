import { formatDateForSSR } from "@/lib/dateUtils";

interface CategoryData {
  title: string;
  slogan: string;
  author: string;
  articleCount: number;
  lastUpdated: string;
}

interface HelpCategoryHeaderProps {
  category: CategoryData;
  isArticlePage?: boolean;
}

export function HelpCategoryHeader({ category, isArticlePage = false }: HelpCategoryHeaderProps) {
  const HeadingTag = isArticlePage ? "h2" : "h1";
  const formattedLastUpdated = category.lastUpdated
    ? formatDateForSSR(category.lastUpdated)
    : null;
  
  return (
    <section
      id="category-header"
      className="pt-6 sm:pt-8 pb-6 sm:pb-8"
      data-cms-section="categoryHeader"
    >
      <div className="container px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <HeadingTag
            className={isArticlePage ? "text-2xl sm:text-3xl font-bold mb-3" : "text-3xl sm:text-4xl font-bold mb-3"}
            data-cms-field="category.title"
          >
            {category.title}
          </HeadingTag>
          
          {/* Slogan */}
          <p
            className="text-base sm:text-lg text-muted-foreground mb-4"
            data-cms-field="category.slogan"
          >
            {category.slogan}
          </p>
          
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span data-cms-field="category.author">
              By {category.author}
            </span>
            <span className="hidden sm:inline">·</span>
            <span data-cms-field="category.articleCount">
              {category.articleCount} {category.articleCount === 1 ? 'article' : 'articles'}
            </span>
            {formattedLastUpdated && (
              <>
                <span className="hidden sm:inline">·</span>
                <span data-cms-field="category.lastUpdated">
                  Last updated: {formattedLastUpdated}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
