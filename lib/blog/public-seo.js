require("server-only");

const { siteConfig } = require("../../config/site");

function absoluteUrl(pathname) {
  return new URL(pathname, siteConfig.domain).toString();
}

function plainText(value, max = 160) {
  const normalized = String(value || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_>`~\[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.length > max ? `${normalized.slice(0, max - 1).trimEnd()}…` : normalized;
}

function robots(value) {
  const choices = String(value || "index,follow").split(",");
  return { index: choices.includes("index"), follow: choices.includes("follow") };
}

function blogMetadata() {
  const title = `Travel guides and pilgrimage planning | ${siteConfig.name}`;
  const description = "Travel guides, pilgrimage planning information, and practical journey advice from Connect My Tours.";
  const canonical = absoluteUrl("/blog");
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, siteName: siteConfig.name, type: "website" } };
}

function categoryMetadata(category) {
  const title = category.metaTitle || `${category.name} travel guides | ${siteConfig.name}`;
  const description = category.metaDescription || plainText(category.description, 160) || `Travel guides in ${category.name} from ${siteConfig.name}.`;
  const canonical = absoluteUrl(`/blog/category/${category.slug}`);
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, siteName: siteConfig.name, type: "website" } };
}

function postMetadata(post, imagePath = null) {
  const title = post.metaTitle || `${post.title} | ${siteConfig.name}`;
  const description = post.metaDescription || plainText(post.excerpt || post.content, 160) || siteConfig.tagline;
  const canonical = post.canonicalUrl || absoluteUrl(`/blog/${post.slug}`);
  const image = imagePath ? absoluteUrl(imagePath) : null;
  const openGraph = {
    title: post.ogTitle || title,
    description: post.ogDescription || description,
    url: canonical,
    siteName: siteConfig.name,
    type: "article",
    publishedTime: post.publishedAt?.toISOString(),
    modifiedTime: post.updatedAt?.toISOString(),
  };
  if (image) openGraph.images = [{ url: image }];
  return { title, description, alternates: { canonical }, robots: robots(post.robots), openGraph };
}

function articleSchema(post, imagePath = null) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: plainText(post.excerpt || post.content, 300),
    mainEntityOfPage: post.canonicalUrl || absoluteUrl(`/blog/${post.slug}`),
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString() || post.publishedAt?.toISOString(),
    author: { "@type": "Organization", name: siteConfig.legalName },
    publisher: { "@type": "Organization", name: siteConfig.legalName },
    articleSection: post.categoryName,
  };
  if (imagePath) data.image = [absoluteUrl(imagePath)];
  return data;
}

module.exports = { absoluteUrl, plainText, blogMetadata, categoryMetadata, postMetadata, articleSchema };
