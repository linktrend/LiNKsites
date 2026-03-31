import { formatDateForSSR } from "@/lib/dateUtils";

interface ArticleData {
  title: string;
  author: string;
  updatedAt: string;
}

interface HelpArticleHeaderProps {
  article: ArticleData;
}

export function HelpArticleHeader({ article }: HelpArticleHeaderProps) {
  return (
    <section
      id="article-header"
      className="pt-6 sm:pt-8 pb-6 sm:pb-8"
      data-cms-section="articleHeader"
    >
      <div className="container px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <h1
            className="text-3xl sm:text-4xl font-bold mb-4"
            data-cms-field="article.title"
          >
            {article.title}
          </h1>
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span data-cms-field="article.author">
              By {article.author}
            </span>
            <span className="hidden sm:inline">·</span>
            <span data-cms-field="article.updatedAt">
              Last updated: {formatDateForSSR(article.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
