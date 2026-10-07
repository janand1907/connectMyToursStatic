import { siteConfig } from "@/config/site";
import { seoConfig } from "@/data/seo.config";
import { listAllPublicPosts, listPublicCategories } from "@/lib/blog/public";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const lastModified = new Date();
  const staticEntries = Object.keys(seoConfig).map((pathname) => ({
    url: `${siteConfig.domain}${pathname === "/" ? "" : pathname}`,
    lastModified,
  }));
  const [categories, posts] = await Promise.all([listPublicCategories(), listAllPublicPosts()]);
  return [
    ...staticEntries,
    { url: `${siteConfig.domain}/blog`, lastModified },
    ...categories.map((category) => ({ url: `${siteConfig.domain}/blog/category/${category.slug}`, lastModified: category.updatedAt || lastModified })),
    ...posts.map((post) => ({ url: `${siteConfig.domain}/blog/${post.slug}`, lastModified: post.updatedAt || post.publishedAt || lastModified })),
  ];
}
