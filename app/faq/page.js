import Breadcrumbs from "@/components/shared/Breadcrumbs";
import ContactCTA from "@/components/home/ContactCTA";
import { faqs } from "@/data/faq";
import { pageMetadata, faqSchema, JsonLd } from "@/lib/seo";

export const metadata = pageMetadata("/faq");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "FAQ", href: "/faq" },
];

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={breadcrumbItems} />
      <section className="container-page py-10">
        <h1 className="font-display text-3xl font-bold text-primary-900 sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <div className="mx-auto mt-8 max-w-3xl divide-y divide-neutral-100">
          {faqs.map((item) => (
            <details key={item.question} className="group py-4">
              <summary className="cursor-pointer list-none font-medium text-primary-800 marker:content-none">
                {item.question}
              </summary>
              <p className="mt-2 text-sm text-neutral-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
