require("server-only");

const { BlogError } = require("./errors");

const CATEGORY_STATUSES = ["active", "inactive"];
const POST_STATUSES = ["draft", "published", "archived"];
const ROBOTS_VALUES = ["index,follow", "noindex,follow", "index,nofollow", "noindex,nofollow"];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const MEDIA_PATTERN = /^\/media\/blog\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|webp)$/;

function invalid(field, message) {
  throw new BlogError(message, "INVALID_INPUT", 400, { [field]: message });
}

function objectInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(input))) {
    invalid("form", "Provide a valid form object.");
  }
}

function text(value, field, max, required = false) {
  if (value == null) value = "";
  if (typeof value !== "string") invalid(field, `${field} must be text.`);
  const result = value.trim();
  if (required && !result) invalid(field, `${field} is required.`);
  if ([...result].length > max || result.includes("\0")) invalid(field, `${field} is too long or contains invalid characters.`);
  return result;
}

function choice(value, field, values, fallback) {
  const result = value === undefined ? fallback : value;
  if (!values.includes(result)) invalid(field, `Choose a valid ${field}.`);
  return result;
}

function validateId(value, field = "id") {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) invalid(field, `Choose a valid ${field}.`);
  return value;
}

function validateSlug(value, { post = false } = {}) {
  const slug = text(value, "slug", 160, true);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    invalid("slug", "Use lowercase letters, numbers, and single hyphens for the slug.");
  }
  if (post && ["category", "page", "feed", "rss"].includes(slug)) invalid("slug", "This slug is reserved for blog routes.");
  return slug;
}

function validateCanonical(value) {
  const canonical = text(value, "canonicalUrl", 2048);
  if (!canonical) return null;
  let url;
  try { url = new URL(canonical); } catch { invalid("canonicalUrl", "Enter a full HTTP or HTTPS canonical URL."); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.hash) {
    invalid("canonicalUrl", "Canonical URLs must use HTTP or HTTPS, without credentials or fragments.");
  }
  if (url.href.length > 2048) invalid("canonicalUrl", "Canonical URL is too long.");
  return url.href;
}

function validateMediaPath(value, field = "featuredImage") {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !MEDIA_PATTERN.test(value)) {
    invalid(field, "Choose an uploaded blog image using its relative media path.");
  }
  return value;
}

function validateSchema(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") invalid("schemaJson", "Enter schema as JSON text.");
  if (Buffer.byteLength(value) > 32768) invalid("schemaJson", "Schema JSON must be at most 32 KB.");
  let parsed;
  try { parsed = JSON.parse(value); } catch { invalid("schemaJson", "Schema must be valid JSON."); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) invalid("schemaJson", "Schema must be a JSON object.");
  function check(node, depth = 0) {
    if (depth > 20) invalid("schemaJson", "Schema JSON is nested too deeply.");
    if (node && typeof node === "object") {
      for (const [key, child] of Object.entries(node)) {
        if (["__proto__", "prototype", "constructor"].includes(key)) invalid("schemaJson", "Schema contains an unsafe key.");
        check(child, depth + 1);
      }
    }
  }
  check(parsed);
  if (parsed["@context"] !== "https://schema.org" && parsed["@context"] !== "http://schema.org") {
    invalid("schemaJson", "Schema @context must be https://schema.org.");
  }
  if (!parsed["@type"] && !Array.isArray(parsed["@graph"])) invalid("schemaJson", "Schema needs @type or @graph.");
  return parsed;
}

function validateCategory(input) {
  objectInput(input);
  return {
    name: text(input.name, "name", 160, true),
    slug: validateSlug(input.slug),
    description: text(input.description, "description", 5000),
    metaTitle: text(input.metaTitle, "metaTitle", 255),
    metaDescription: text(input.metaDescription, "metaDescription", 500),
    status: choice(input.status, "status", CATEGORY_STATUSES, "active"),
  };
}

function validatePost(input, now = new Date()) {
  objectInput(input);
  const status = choice(input.status, "status", POST_STATUSES, "draft");
  const keywords = input.secondaryKeywords === undefined || input.secondaryKeywords === "" ? [] : input.secondaryKeywords;
  if (!Array.isArray(keywords) || keywords.length > 20) invalid("secondaryKeywords", "Provide an array of up to 20 keywords.");
  let publishedAt = null;
  if (input.publishedAt) {
    if (typeof input.publishedAt !== "string" ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(input.publishedAt)) {
      invalid("publishedAt", "Use an ISO publish date with a timezone.");
    }
    const [year, month, day] = input.publishedAt.slice(0, 10).split("-").map(Number);
    if (month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) {
      invalid("publishedAt", "Publish date is not a valid calendar date.");
    }
    publishedAt = new Date(input.publishedAt);
    if (!Number.isFinite(publishedAt.getTime()) || publishedAt.getUTCFullYear() < 1970 || publishedAt.getUTCFullYear() > 9999) {
      invalid("publishedAt", "Publish date is invalid.");
    }
    // Scheduling is not part of Phase 1; do not silently create future posts.
    if (publishedAt > now) invalid("publishedAt", "Future publication is not supported yet.");
  }
  const robots = input.robots === undefined ? "index,follow" : text(input.robots, "robots", 40).replace(/\s/g, "").toLowerCase();
  return {
    title: text(input.title, "title", 255, true),
    slug: validateSlug(input.slug, { post: true }),
    categoryId: validateId(input.categoryId, "categoryId"),
    excerpt: text(input.excerpt, "excerpt", 2000),
    content: text(input.content, "content", 200000, status === "published"),
    featuredImage: validateMediaPath(input.featuredImage),
    featuredImageAlt: text(input.featuredImageAlt, "featuredImageAlt", 255),
    status,
    metaTitle: text(input.metaTitle, "metaTitle", 255),
    metaDescription: text(input.metaDescription, "metaDescription", 500),
    focusKeyword: text(input.focusKeyword, "focusKeyword", 160),
    secondaryKeywords: [...new Set(keywords.map((word) => text(word, "secondaryKeywords", 160, true)))],
    canonicalUrl: validateCanonical(input.canonicalUrl),
    robots: choice(robots, "robots", ROBOTS_VALUES),
    ogTitle: text(input.ogTitle, "ogTitle", 255),
    ogDescription: text(input.ogDescription, "ogDescription", 500),
    ogImage: validateMediaPath(input.ogImage, "ogImage"),
    schemaJson: validateSchema(input.schemaJson),
    publishedAt,
  };
}

function validateAdmin(input) {
  objectInput(input);
  const email = text(input.email, "email", 254, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) invalid("email", "Enter a valid email address.");
  return {
    name: text(input.name, "name", 120, true),
    email,
    role: choice(input.role, "role", ["admin", "editor"], "editor"),
    status: choice(input.status, "status", ["active", "inactive"], "active"),
  };
}

// Use only when embedding validated JSON in a future JSON-LD script element.
function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

module.exports = {
  CATEGORY_STATUSES, POST_STATUSES, ROBOTS_VALUES, MEDIA_PATTERN,
  validateId, validateSlug, validateCanonical, validateMediaPath, validateSchema,
  validateCategory, validatePost, validateAdmin, serializeJsonLd,
};
