import Image from "next/image";
import Link from "next/link";

function dateLabel(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export default function BlogCard({ post, imagePath = null }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
      {imagePath && <div className="relative aspect-[16/9] overflow-hidden bg-primary-50"><Image src={imagePath} alt={post.featuredImageAlt || ""} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" unoptimized className="object-cover transition duration-300 group-hover:scale-[1.02]" /></div>}
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-wide text-primary-600">
          <Link href={`/blog/category/${post.categorySlug}`} className="hover:text-primary-800">{post.categoryName}</Link>
          {post.publishedAt && <time dateTime={new Date(post.publishedAt).toISOString()} className="text-neutral-500">{dateLabel(post.publishedAt)}</time>}
        </div>
        <h2 className="mt-3 font-display text-xl font-bold text-primary-900"><Link href={`/blog/${post.slug}`} className="hover:text-primary-600">{post.title}</Link></h2>
        {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-700">{post.excerpt}</p>}
        <Link href={`/blog/${post.slug}`} className="mt-4 inline-flex text-sm font-bold text-primary-700 underline underline-offset-4 hover:text-primary-500">Read article</Link>
      </div>
    </article>
  );
}
