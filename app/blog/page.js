import BlogCard from "@/components/blog/BlogCard";
import BlogCategoryNav from "@/components/blog/BlogCategoryNav";
import ContactCTA from "@/components/home/ContactCTA";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { listPublicCategories, listPublicPosts, availablePublicMediaPath } from "@/lib/blog/public";
import { blogMetadata } from "@/lib/blog/public-seo";

export const dynamic = "force-dynamic";
export const metadata = blogMetadata();

export default async function BlogPage() {
  const [categories, posts] = await Promise.all([listPublicCategories(), listPublicPosts({ limit: 100 })]);
  const cards = await Promise.all(posts.map(async (post) => ({ post, imagePath: await availablePublicMediaPath(post.featuredImage) })));
  return <>
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }]} />
    <section className="bg-primary-50 pb-10 pt-28 sm:pt-32"><div className="container-page"><p className="text-sm font-bold uppercase tracking-widest text-primary-600">Connect My Tours journal</p><h1 className="mt-2 font-display text-4xl font-bold text-primary-900 sm:text-5xl">Travel guides for a more prepared journey</h1><p className="mt-4 max-w-2xl text-neutral-700">Practical pilgrimage and travel-planning guidance from the Connect My Tours team.</p><div className="mt-6"><BlogCategoryNav categories={categories} /></div></div></section>
    <section className="container-page py-10 sm:py-14">
      {cards.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{cards.map(({ post, imagePath }) => <BlogCard key={post.id} post={post} imagePath={imagePath} />)}</div> : <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50 p-8 text-center"><h2 className="font-display text-2xl font-bold text-primary-900">Guides are on the way</h2><p className="mt-2 text-neutral-700">There are no published travel guides yet. Please check back soon.</p></div>}
    </section>
    <ContactCTA />
  </>;
}
