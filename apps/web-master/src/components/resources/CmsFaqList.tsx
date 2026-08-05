import type { CmsFaq } from "@/lib/repository/faq";

export function CmsFaqList({ faqs }: { faqs: CmsFaq[] }) {
  return (
    <section className="container space-y-6 py-12">
      <h1 className="text-3xl font-bold">{faqs[0]?.title ?? "FAQ"}</h1>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <details className="rounded-lg border p-4" key={faq.id}>
            <summary className="cursor-pointer font-semibold">{faq.question}</summary>
            {faq.answer ? <p className="mt-3 text-muted-foreground">{faq.answer}</p> : null}
          </details>
        ))}
      </div>
    </section>
  );
}
