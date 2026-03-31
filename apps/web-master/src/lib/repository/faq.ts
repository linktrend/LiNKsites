import { payloadFind } from "@/lib/payload-client";
import { siteLocaleFilter } from "@/lib/repository/shared-filters";
import { CmsPageBlock } from "@/lib/repository/pages";
import { lexicalToPlainText } from "@/lib/lexical-plain-text";

export interface CmsFaq {
  id: string;
  site: string;
  locale: string;
  slug: string;
  title: string;
  layout?: CmsPageBlock[];
  question?: string;
  answer?: string;
  status?: string;
}

type FAQPageDoc = {
  id: string;
  site: string;
  locale: string;
  slug?: string;
  title?: string;
  status?: string;
  content?: Array<any>;
};

export const listFaq = async ({
  siteId,
  locale,
}: {
  siteId: string;
  locale: string;
}): Promise<CmsFaq[]> => {
  const where = siteLocaleFilter(siteId, locale);

  // CMS stores FAQs as a page with an FAQ block; we flatten into a simple Q/A list.
  const result = await payloadFind<FAQPageDoc>({
    collection: "faq-pages",
    where,
    depth: 2,
    locale,
    site: siteId,
  });

  const docs = result.docs ?? [];
  const out: CmsFaq[] = [];

  for (const doc of docs) {
    const blocks = Array.isArray(doc.content) ? doc.content : [];
    const faqBlock = blocks.find((b: any) => b?.blockType === "faq");
    const questions = Array.isArray(faqBlock?.questions) ? faqBlock.questions : [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const question = typeof q?.question === "string" ? q.question : "";
      const answer = lexicalToPlainText(q?.answer);
      if (!question && !answer) continue;

      out.push({
        id: `${doc.id}:${i}`,
        site: String(doc.site),
        locale: String(doc.locale),
        slug: doc.slug ?? "faq",
        title: doc.title ?? "FAQ",
        question,
        answer,
        status: doc.status,
      });
    }
  }

  return out;
};
