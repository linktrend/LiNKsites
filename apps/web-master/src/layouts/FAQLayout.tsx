import { CmsFaq } from "@/lib/repository/faq";
import { faqSchema } from "../lib/schemas";
import { getSiteName } from "@/config";

type Props = { lang: string; page: { data: { faqs: CmsFaq[] } } };

export function FAQLayout({ lang, page }: Props) {
  const faqs = page.data.faqs;
  const schema = faqSchema(faqs as any[]);
  const siteName = getSiteName();
  return (
    <div className="container space-y-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header>
        <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">Common questions about {siteName}.</p>
      </header>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="p-4 border rounded-lg">
            <p className="font-semibold">{faq.question}</p>
            <p className="text-sm text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
