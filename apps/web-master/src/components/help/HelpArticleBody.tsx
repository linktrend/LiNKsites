interface HelpArticleBodyProps {
  content: string;
}

export function HelpArticleBody({ content }: HelpArticleBodyProps) {
  return (
    <section
      id="article-body"
      className="pt-6 sm:pt-8 pb-8 sm:pb-12"
      data-cms-section="articleBody"
    >
      <div className="container px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div
            className="prose prose-slate max-w-none text-muted-foreground leading-relaxed prose-headings:text-foreground prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-base prose-p:leading-7 prose-p:mb-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-1 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border"
            data-cms-field="article.body"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </section>
  );
}
