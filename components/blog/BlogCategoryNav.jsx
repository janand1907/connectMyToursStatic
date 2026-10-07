import Link from "next/link";

export default function BlogCategoryNav({ categories, currentSlug = null }) {
  if (!categories.length) return null;
  return <nav aria-label="Blog categories" className="flex flex-wrap gap-2"><Link href="/blog" className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!currentSlug ? "bg-primary-700 text-white" : "bg-primary-50 text-primary-800 hover:bg-primary-100"}`}>All guides</Link>{categories.map((category) => <Link key={category.id} href={`/blog/category/${category.slug}`} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${currentSlug === category.slug ? "bg-primary-700 text-white" : "bg-primary-50 text-primary-800 hover:bg-primary-100"}`}>{category.name}</Link>)}</nav>;
}
