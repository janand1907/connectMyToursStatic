require("server-only");

const { randomUUID } = require("node:crypto");
const { query, transaction } = require("./db");
const { databaseConfig } = require("./config");
const { validatePost, validateId, validateSlug, POST_STATUSES } = require("./validation");
const { BlogError, duplicateError } = require("./errors");
const { writeAudit } = require("./audit");

const PUBLIC_WHERE = "p.status = 'published' AND p.published_at <= UTC_TIMESTAMP(3) AND c.status = 'active'";
const COLUMNS = ["title", "slug", "category_id", "excerpt", "content", "featured_image", "featured_image_alt", "status", "meta_title", "meta_description", "focus_keyword", "secondary_keywords", "canonical_url", "robots", "og_title", "og_description", "og_image", "schema_json", "published_at"];

function postValues(value, publishedAt) {
  return [value.title, value.slug, value.categoryId, value.excerpt, value.content, value.featuredImage,
    value.featuredImageAlt, value.status, value.metaTitle, value.metaDescription, value.focusKeyword,
    JSON.stringify(value.secondaryKeywords), value.canonicalUrl, value.robots, value.ogTitle,
    value.ogDescription, value.ogImage, value.schemaJson ? JSON.stringify(value.schemaJson) : null, publishedAt];
}

async function getPost(id, executor) {
  validateId(id);
  const rows = await query("SELECT * FROM blog_posts WHERE id = ?", [id], executor);
  return rows[0] || null;
}

async function getPublishedPostBySlug(slug) {
  validateSlug(slug, { post: true });
  const rows = await query(`SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM blog_posts p JOIN blog_categories c ON c.id = p.category_id
    WHERE p.slug = ? AND ${PUBLIC_WHERE}`, [slug]);
  return rows[0] || null;
}

async function listPosts({ publicOnly = false, status, categoryId, search = "", limit = 20, offset = 0 } = {}) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isInteger(offset) || offset < 0 || offset > 1000000) {
    throw new BlogError("Invalid pagination.");
  }
  if (typeof search !== "string" || search.length > 255) throw new BlogError("Search is too long.");
  const conditions = [publicOnly ? PUBLIC_WHERE : "1=1"];
  const values = [];
  if (status) {
    if (!POST_STATUSES.includes(status)) throw new BlogError("Invalid post status.");
    conditions.push("p.status = ?"); values.push(status);
  }
  if (categoryId) { validateId(categoryId); conditions.push("p.category_id = ?"); values.push(categoryId); }
  if (search.trim()) {
    const pattern = `%${search.trim().replace(/[!%_]/g, (char) => `!${char}`)}%`;
    conditions.push("(p.title LIKE ? ESCAPE '!' OR p.slug LIKE ? ESCAPE '!')"); values.push(pattern, pattern);
  }
  return query(`SELECT p.id, p.title, p.slug, p.category_id, p.excerpt, p.featured_image, p.featured_image_alt,
      p.status, p.published_at, p.updated_at, c.name AS category_name, c.slug AS category_slug
    FROM blog_posts p JOIN blog_categories c ON c.id = p.category_id
    WHERE ${conditions.join(" AND ")} ORDER BY p.published_at DESC, p.created_at DESC, p.id ASC
    LIMIT ${limit} OFFSET ${offset}`, values);
}

async function assertPostSlugAvailable(slug, exceptId = null, executor) {
  validateSlug(slug, { post: true });
  const rows = await query("SELECT id FROM blog_posts WHERE slug = ? AND (? IS NULL OR id <> ?)", [slug, exceptId, exceptId], executor);
  const redirects = await query("SELECT id FROM blog_redirects WHERE from_slug = ?", [slug], executor);
  if (rows.length || redirects.length) throw new BlogError("This post slug is already used or reserved by a redirect.", "DUPLICATE", 409, { slug: "Choose a different slug." });
}

async function savePost(input, { id = null, actorId, metadata } = {}) {
  validateId(actorId, "actorId");
  if (id) validateId(id);
  const value = validatePost(input);
  try {
    // Serialize post slug changes with redirect reservations. The advisory lock
    // is held through commit, including across concurrent Node processes.
    return await transaction(async (connection) => {
      const previous = id ? await getPost(id, connection) : null;
      if (id && !previous) throw new BlogError("Post not found.", "NOT_FOUND", 404);
      const categories = await query("SELECT status FROM blog_categories WHERE id = ? FOR UPDATE", [value.categoryId], connection);
      if (!categories.length) throw new BlogError("Choose an existing category.", "INVALID_INPUT", 400, { categoryId: "Category not found." });
      if (value.status === "published" && categories[0].status !== "active") {
        throw new BlogError("Activate the category before publishing.", "INVALID_INPUT", 400, { categoryId: "Category is inactive." });
      }
      await assertPostSlugAvailable(value.slug, id, connection);
      const resultId = id || randomUUID();
      const publishedAt = value.publishedAt || previous?.published_at || (value.status === "published" ? new Date() : null);
      const values = postValues(value, publishedAt);
      if (id) {
        await query(`UPDATE blog_posts SET ${COLUMNS.map((column) => `${column}=?`).join(", ")}, updated_at=UTC_TIMESTAMP(3) WHERE id=?`, [...values, id], connection);
      } else {
        await query(`INSERT INTO blog_posts (${COLUMNS.join(", ")}, id) VALUES (${[...values, resultId].map(() => "?").join(", ")})`, [...values, resultId], connection);
      }
      if (previous && previous.slug !== value.slug && previous.published_at) {
        // Flatten older aliases rather than building redirect chains.
        await query("UPDATE blog_redirects SET to_slug = ? WHERE to_slug = ?", [value.slug, previous.slug], connection);
        await query("INSERT INTO blog_redirects (id, from_slug, to_slug, status_code) VALUES (?, ?, ?, 301)", [randomUUID(), previous.slug, value.slug], connection);
      }
      await writeAudit({ userId: actorId, action: id ? "post.updated" : "post.created", entityType: "post", entityId: resultId,
        details: { status: value.status, previousStatus: previous?.status, fromSlug: previous?.slug, toSlug: value.slug }, metadata }, connection);
      return getPost(resultId, connection);
    }, `${databaseConfig().database}:post-slugs`);
  } catch (error) { duplicateError(error, "slug"); }
}

async function getPublishedRedirect(slug) {
  validateSlug(slug, { post: true });
  const rows = await query(`SELECT r.to_slug, r.status_code FROM blog_redirects r
    JOIN blog_posts p ON p.slug = r.to_slug JOIN blog_categories c ON c.id = p.category_id
    WHERE r.from_slug = ? AND ${PUBLIC_WHERE}`, [slug]);
  return rows[0] || null;
}

module.exports = { getPost, getPublishedPostBySlug, listPosts, assertPostSlugAvailable, savePost, getPublishedRedirect };
