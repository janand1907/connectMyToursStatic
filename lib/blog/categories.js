require("server-only");

const { randomUUID } = require("node:crypto");
const { query, transaction } = require("./db");
const { validateCategory, validateId, validateSlug } = require("./validation");
const { BlogError, duplicateError } = require("./errors");
const { writeAudit } = require("./audit");

async function getCategory(id, executor) {
  validateId(id);
  const rows = await query("SELECT * FROM blog_categories WHERE id = ?", [id], executor);
  return rows[0] || null;
}

async function getCategoryBySlug(slug, { publicOnly = false } = {}) {
  validateSlug(slug);
  const rows = await query(`SELECT * FROM blog_categories WHERE slug = ?${publicOnly ? " AND status = 'active'" : ""}`, [slug]);
  return rows[0] || null;
}

async function listCategories({ publicOnly = false, withPublishedPosts = false } = {}) {
  return query(`SELECT c.* FROM blog_categories c WHERE 1=1
    ${publicOnly ? "AND c.status = 'active'" : ""}
    ${withPublishedPosts ? "AND EXISTS (SELECT 1 FROM blog_posts p WHERE p.category_id = c.id AND p.status = 'published' AND p.published_at <= UTC_TIMESTAMP(3))" : ""}
    ORDER BY c.name ASC`);
}

async function assertCategorySlugAvailable(slug, exceptId = null, executor) {
  validateSlug(slug);
  const rows = await query("SELECT id FROM blog_categories WHERE slug = ? AND (? IS NULL OR id <> ?)", [slug, exceptId, exceptId], executor);
  if (rows.length) throw new BlogError("This category slug is already in use.", "DUPLICATE", 409, { slug: "Choose a different slug." });
}

// Repositories are server-only persistence primitives. A future API must call
// requireAdmin/requireAdminMutation before calling any of these write methods.
async function saveCategory(input, { id = null, actorId, metadata } = {}) {
  validateId(actorId, "actorId");
  if (id) validateId(id);
  const value = validateCategory(input);
  try {
    return await transaction(async (connection) => {
      const previous = id ? await getCategory(id, connection) : null;
      if (id && !previous) throw new BlogError("Category not found.", "NOT_FOUND", 404);
      await assertCategorySlugAvailable(value.slug, id, connection);
      const resultId = id || randomUUID();
      const values = [value.name, value.slug, value.description, value.metaTitle, value.metaDescription, value.status];
      if (id) {
        await query("UPDATE blog_categories SET name=?, slug=?, description=?, meta_title=?, meta_description=?, status=?, updated_at=UTC_TIMESTAMP(3) WHERE id=?", [...values, id], connection);
      } else {
        await query("INSERT INTO blog_categories (name, slug, description, meta_title, meta_description, status, id) VALUES (?, ?, ?, ?, ?, ?, ?)", [...values, resultId], connection);
      }
      await writeAudit({ userId: actorId, action: id ? "category.updated" : "category.created", entityType: "category", entityId: resultId,
        details: { status: value.status, previousStatus: previous?.status }, metadata }, connection);
      return getCategory(resultId, connection);
    });
  } catch (error) { duplicateError(error, "slug"); }
}

module.exports = { getCategory, getCategoryBySlug, listCategories, assertCategorySlugAvailable, saveCategory };
