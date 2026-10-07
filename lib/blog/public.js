require("server-only");

const { listCategories } = require("./categories");
const { getPublishedPostBySlug, getPublishedRedirect, listPosts } = require("./posts");
const { localStorage } = require("./storage/local");
const { MEDIA_PATTERN } = require("./validation");

function normalizeJson(value, fallback = null) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function publicPost(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    categoryId: row.category_id,
    categoryName: row.category_name,
    categorySlug: row.category_slug,
    excerpt: row.excerpt || "",
    content: row.content || "",
    featuredImage: row.featured_image || "",
    featuredImageAlt: row.featured_image_alt || "",
    metaTitle: row.meta_title || "",
    metaDescription: row.meta_description || "",
    canonicalUrl: row.canonical_url || "",
    robots: row.robots || "index,follow",
    ogTitle: row.og_title || "",
    ogDescription: row.og_description || "",
    ogImage: row.og_image || "",
    schemaJson: normalizeJson(row.schema_json),
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  };
}

function publicCategory(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    metaTitle: row.meta_title || "",
    metaDescription: row.meta_description || "",
  };
}

async function listPublicPosts(options = {}) {
  return (await listPosts({ ...options, publicOnly: true })).map(publicPost);
}

async function listPublicCategories() {
  return (await listCategories({ publicOnly: true, withPublishedPosts: true })).map(publicCategory);
}

async function getPublicPost(slug) {
  return publicPost(await getPublishedPostBySlug(slug));
}

async function getPublicRedirect(slug) {
  return getPublishedRedirect(slug);
}

async function listAllPublicPosts() {
  const posts = [];
  for (let offset = 0; offset <= 1000000; offset += 100) {
    const page = await listPublicPosts({ limit: 100, offset });
    posts.push(...page);
    if (page.length < 100) break;
  }
  return posts;
}

function isSafeMediaPath(value) {
  return typeof value === "string" && MEDIA_PATTERN.test(value);
}

async function availablePublicMediaPath(value) {
  if (!isSafeMediaPath(value) || process.env.NODE_ENV === "production") return null;
  try {
    const filename = value.split("/").pop();
    await localStorage().read(filename);
    return value;
  } catch {
    return null;
  }
}

module.exports = {
  publicPost,
  publicCategory,
  listPublicPosts,
  listPublicCategories,
  getPublicPost,
  getPublicRedirect,
  listAllPublicPosts,
  isSafeMediaPath,
  availablePublicMediaPath,
};
