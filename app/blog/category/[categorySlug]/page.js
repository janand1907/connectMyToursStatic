import { notFound } from "next/navigation";
import BlogCard from "@/components/blog/BlogCard";
import BlogCategoryNav from "@/components/blog/BlogCategoryNav";
import ContactCTA from "@/components/home/ContactCTA";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { getCategoryBySlug } from "@/lib/blog/categories";
import { listPublicCategories, listPublicPosts, availablePublicMediaPath, publicCategory } from "@/lib/blog/public";
import { categoryMetadata } from "@/lib/blog/public-seo";

export const dynamic = "force-dynamic";

async function loadCategory(slug) {
  try { return publicCategory(await getCategoryBySlug(slug, { publicOnly: true })); } catch { return null; }
}

export async function generateMetadata({ params }) {
  const category = await loadCategory(params.categorySlug);
  return category ? categoryMetadata(category) : {};
}

export default async function BlogCategoryPage({ params }) {
  const category = await loadCategory(params.categorySlug);
  if (!category) notFound();
  const [categories, posts] = await Promise.all([listPublicCategories(), listPublicPosts({ categoryId: category.id, limit: 100 })]);
  const cards = await Promise.all(posts.map(async (post) => ({ post, imagePath: await availablePublicMediaPath(post.featuredImage) })));
  return <>
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: category.name, href: `/blog/category/${category.slug}` }]} />
    <section className="bg-primary-50 pb-10 pt-28 sm:pt-32"><div className="container-page"><p className="text-sm font-bold uppercase tracking-widest text-primary-600">Blog category</p><h1 className="mt-2 font-display text-4xl font-bold text-primary-900 sm:text-5xl">{category.name}</h1>{category.description && <p className="mt-4 max-w-2xl text-neutral-700">{category.description}</p>}<div className="mt-6"><BlogCategoryNav categories={categories} currentSlug={category.slug} /></div></div></section>
    <section className="container-page py-10 sm:py-14">
      {cards.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{cards.map(({ post, imagePath }) => <BlogCard key={post.id} post={post} imagePath={imagePath} />)}</div> : <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50 p-8 text-center"><h2 className="font-display text-2xl font-bold text-primary-900">No published guides in this category yet</h2><p className="mt-2 text-neutral-700">Please check back soon for practical travel guidance.</p></div>}
    </section>
    <ContactCTA />
  </>;
}
