import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import BlogCard from "@/components/blog/BlogCard";
import BlogCategoryNav from "@/components/blog/BlogCategoryNav";
import SafeMarkdown from "@/components/blog/SafeMarkdown";
import ContactCTA from "@/components/home/ContactCTA";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";
import { getPublicPost, getPublicRedirect, listPublicCategories, listPublicPosts, availablePublicMediaPath } from "@/lib/blog/public";
import { articleSchema, postMetadata } from "@/lib/blog/public-seo";

export const dynamic = "force-dynamic";

async function findPost(slug) {
  try { return await getPublicPost(slug); } catch { return null; }
}

export async function generateMetadata({ params }) {
  const post = await findPost(params.postSlug);
  if (!post) return {};
  const image = await availablePublicMediaPath(post.ogImage || post.featuredImage);
  return postMetadata(post, image);
}

function dateLabel(value) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export default async function BlogArticlePage({ params }) {
  let post = await findPost(params.postSlug);
  if (!post) {
    let redirect;
    try { redirect = await getPublicRedirect(params.postSlug); } catch { redirect = null; }
    if (redirect) permanentRedirect(`/blog/${redirect.to_slug}`);
    notFound();
  }
  const [categories, related, imagePath] = await Promise.all([
    listPublicCategories(),
    listPublicPosts({ categoryId: post.categoryId, limit: 4 }),
    availablePublicMediaPath(post.featuredImage),
  ]);
  const relatedCards = await Promise.all(related.filter((item) => item.id !== post.id).slice(0, 3).map(async (item) => ({ post: item, imagePath: await availablePublicMediaPath(item.featuredImage) })));
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: post.categoryName, href: `/blog/category/${post.categorySlug}` }, { label: post.title, href: `/blog/${post.slug}` }];
  return <>
    <Breadcrumbs items={breadcrumbItems} />
    <JsonLd data={articleSchema(post, imagePath)} />
    {post.schemaJson && <JsonLd data={post.schemaJson} />}
    <article>
      <header className="bg-primary-50 pb-10 pt-28 sm:pt-32"><div className="container-page max-w-4xl"><Link href={`/blog/category/${post.categorySlug}`} className="text-sm font-bold uppercase tracking-widest text-primary-600 hover:text-primary-800">{post.categoryName}</Link><h1 className="mt-3 font-display text-4xl font-bold leading-tight text-primary-900 sm:text-5xl">{post.title}</h1>{post.excerpt && <p className="mt-5 text-lg leading-8 text-neutral-700">{post.excerpt}</p>}<time className="mt-5 block text-sm font-medium text-neutral-600" dateTime={post.publishedAt?.toISOString()}>Published {dateLabel(post.publishedAt)}</time></div></header>
      <div className="container-page max-w-4xl py-10 sm:py-14">{imagePath && <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl bg-primary-50 shadow-card"><Image src={imagePath} alt={post.featuredImageAlt || ""} fill sizes="(min-width: 1024px) 896px, 100vw" unoptimized className="object-cover" /></div>}<SafeMarkdown content={post.content} /></div>
    </article>
    <section className="container-page pb-12"><BlogCategoryNav categories={categories} currentSlug={post.categorySlug} /></section>
    {relatedCards.length > 0 && <section className="bg-neutral-50 py-12"><div className="container-page"><h2 className="section-heading">Related guides</h2><div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{relatedCards.map(({ post: relatedPost, imagePath: relatedImage }) => <BlogCard key={relatedPost.id} post={relatedPost} imagePath={relatedImage} />)}</div></div></section>}
    <ContactCTA />
  </>;
}
