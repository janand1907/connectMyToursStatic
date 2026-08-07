import Link from "next/link";
import { breadcrumbSchema, JsonLd } from "@/lib/seo";

export default function Breadcrumbs({ items }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema(items)} />
      <nav aria-label="Breadcrumb" className="container-page pt-6 text-sm text-neutral-500">
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 && <span aria-hidden="true">/</span>}
              {index === items.length - 1 ? (
                <span className="text-neutral-700">{item.label}</span>
              ) : (
                <Link href={item.href} className="hover:text-primary-600">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
