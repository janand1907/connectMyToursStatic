require("server-only");

const { BlogError } = require("./errors");

function categoryInputFromRow(row) {
  return {
    name: row.name, slug: row.slug, description: row.description || "",
    metaTitle: row.meta_title || "", metaDescription: row.meta_description || "",
    status: row.status,
  };
}

function postInputFromRow(row) {
  return {
    title: row.title, slug: row.slug, categoryId: row.category_id,
    excerpt: row.excerpt || "", content: row.content || "",
    featuredImage: row.featured_image || "", featuredImageAlt: row.featured_image_alt || "",
    status: row.status, metaTitle: row.meta_title || "", metaDescription: row.meta_description || "",
    focusKeyword: row.focus_keyword || "", secondaryKeywords: row.secondary_keywords || [],
    canonicalUrl: row.canonical_url || "", robots: row.robots,
    ogTitle: row.og_title || "", ogDescription: row.og_description || "",
    ogImage: row.og_image || "",
    schemaJson: row.schema_json ? JSON.stringify(row.schema_json, null, 2) : "",
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : "",
  };
}

function isStatusPatch(body, allowed) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  const keys = Object.keys(body);
  if (keys.length !== 1 || keys[0] !== "status") return false;
  if (!allowed.includes(body.status)) throw new BlogError("Choose a valid status.", "INVALID_INPUT", 400, { status: "Choose a valid status." });
  return true;
}

module.exports = { categoryInputFromRow, postInputFromRow, isStatusPatch };
