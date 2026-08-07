import Link from "next/link";
import { faqs } from "@/data/faq";

export default function FAQPreview() {
  const preview = faqs.slice(0, 4);

  return (
    <section className="container-page py-14">
      <h2 className="section-heading text-center">Frequently Asked Questions</h2>
      <div className="mx-auto mt-10 max-w-3xl divide-y divide-neutral-100">
        {preview.map((item) => (
          <details key={item.question} className="group py-4">
            <summary className="cursor-pointer list-none font-medium text-primary-800 marker:content-none">
              {item.question}
            </summary>
            <p className="mt-2 text-sm text-neutral-600">{item.answer}</p>
          </details>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href="/faq" className="btn-secondary">
          View All FAQs
        </Link>
      </div>
    </section>
  );
}
