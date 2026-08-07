import Breadcrumbs from "./Breadcrumbs";
import PackageCard from "./PackageCard";
import ContactCTA from "@/components/home/ContactCTA";

export default function ServiceDetailLayout({ eyebrow, title, intro, highlights, pkg, breadcrumbItems }) {
  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <section className="container-page grid gap-10 py-10 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">{eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-primary-900 sm:text-4xl">{title}</h1>
          <p className="mt-4 text-neutral-600">{intro}</p>
          <ul className="mt-6 space-y-2 text-sm text-neutral-600">
            {highlights.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="mt-0.5 text-primary-500" aria-hidden="true">
                  ✓
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <PackageCard {...pkg} />
      </section>
      <ContactCTA />
    </>
  );
}
