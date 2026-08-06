import { getContactPage } from "@/lib/pageService";
import { ContactLayout } from "@/layouts/ContactLayout";

type Props = { params: { lang: string } };

export default async function ContactPage({ params }: Props) {
  const page = await getContactPage(params.lang);
  return <ContactLayout lang={params.lang} page={page} />;
}
