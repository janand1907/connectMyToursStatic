const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const sharp = require("sharp");
const { createAdmin } = require("../../lib/blog/admin-users");
const { saveCategory } = require("../../lib/blog/categories");
const { savePost } = require("../../lib/blog/posts");
const { localStorage } = require("../../lib/blog/storage/local");
const { closePool } = require("../../lib/blog/db");

const origin = process.env.BLOG_TEST_ORIGIN;
let admin;
let category;
let publicPost;
let redirectedOldSlug;
let imagePath;
let inactivePostSlug;

async function page(path) {
  return fetch(`${origin}${path}`, { redirect: "manual", signal: AbortSignal.timeout(30000) });
}

before(async () => {
  assert.equal(process.env.BLOG_INTEGRATION_TEST, "isolated-local-mysql");
  admin = await createAdmin({ name: "Public Test Admin", email: "public-test-admin@example.test", password: "Public test password with enough length" });
  category = await saveCategory({ name: "Public Travel Guides", slug: "public-travel-guides", description: "Published local guides.", status: "active" }, { actorId: admin.id });
  await saveCategory({ name: "Empty Guides", slug: "empty-guides", status: "active" }, { actorId: admin.id });
  const inactive = await saveCategory({ name: "Private Guides", slug: "private-guides", status: "active" }, { actorId: admin.id });
  const filename = `${randomUUID()}.png`;
  imagePath = `/media/blog/${filename}`;
  const image = await sharp({ create: { width: 4, height: 3, channels: 3, background: "blue" } }).png().toBuffer();
  await localStorage().put({ filename, buffer: image });
  publicPost = await savePost({
    title: "Published Local Guide", slug: "published-local-guide", categoryId: category.id,
    excerpt: "A public guide excerpt.",
    content: "# Guide heading\n\nA [safe link](https://example.com) and <script>alert('unsafe')</script> [bad link](javascript:alert(1)).",
    featuredImage: imagePath, featuredImageAlt: "Blue sample image", metaTitle: "Public guide metadata title",
    metaDescription: "Public guide metadata description.", canonicalUrl: "https://www.connectmytours.com/blog/published-local-guide",
    robots: "index,follow", schemaJson: '{"@context":"https://schema.org","@type":"Article","headline":"Extra guide schema"}', status: "published",
  }, { actorId: admin.id });
  await savePost({ title: "Draft Local Guide", slug: "draft-local-guide", categoryId: category.id, content: "Private", status: "draft" }, { actorId: admin.id });
  await savePost({ title: "Archived Local Guide", slug: "archived-local-guide", categoryId: category.id, content: "Private", status: "archived" }, { actorId: admin.id });
  const inactivePost = await savePost({ title: "Inactive Category Guide", slug: "inactive-category-guide", categoryId: inactive.id, content: "Private", status: "published" }, { actorId: admin.id });
  inactivePostSlug = inactivePost.slug;
  await saveCategory({ name: "Private Guides", slug: "private-guides", status: "inactive" }, { id: inactive.id, actorId: admin.id });
  const redirectPost = await savePost({ title: "Redirected guide", slug: "redirected-guide-old", categoryId: category.id, content: "Visible", status: "published" }, { actorId: admin.id });
  redirectedOldSlug = redirectPost.slug;
  await savePost({ title: "Redirected guide", slug: "redirected-guide-new", categoryId: category.id, content: "Visible", status: "published" }, { id: redirectPost.id, actorId: admin.id });
});

after(closePool);

test("public listing and category pages only expose eligible content", async () => {
  const listing = await page("/blog");
  const listingHtml = await listing.text();
  assert.equal(listing.status, 200);
  assert.match(listingHtml, /Published Local Guide/);
  assert.doesNotMatch(listingHtml, /Draft Local Guide|Archived Local Guide|Private Guides|Empty Guides/);

  const categoryPage = await page("/blog/category/public-travel-guides");
  assert.equal(categoryPage.status, 200);
  assert.match(await categoryPage.text(), /Published Local Guide/);

  const emptyCategory = await page("/blog/category/empty-guides");
  assert.equal(emptyCategory.status, 200);
  assert.match(await emptyCategory.text(), /No published guides in this category yet/);

  const inactiveCategory = await page("/blog/category/private-guides");
  assert.equal(inactiveCategory.status, 404);
});

test("article rendering is safe and carries metadata and schemas", async () => {
  const article = await page(`/blog/${publicPost.slug}`);
  const html = await article.text();
  assert.equal(article.status, 200);
  assert.match(html, /Public guide metadata title/);
  assert.match(html, /Public guide metadata description/);
  assert.match(html, /BreadcrumbList/);
  assert.match(html, /\"@type\":\"Article\"/);
  assert.match(html, new RegExp(imagePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(html, /&lt;script&gt;alert/);
  assert.doesNotMatch(html, /<script>alert\('unsafe'\)<\/script>/);
  assert.doesNotMatch(html, /javascript:alert/);

  const image = await page(imagePath);
  assert.equal(image.status, 200);
  assert.equal(image.headers.get("content-type"), "image/png");
});

test("drafts, archived posts, inactive-category posts, and unknown posts return 404", async () => {
  for (const slug of ["draft-local-guide", "archived-local-guide", inactivePostSlug, "unknown-guide"]) {
    const response = await page(`/blog/${slug}`);
    assert.equal(response.status, 404, slug);
  }
});

test("published slug aliases redirect while sitemap exposes only canonical public URLs", async () => {
  const redirect = await page(`/blog/${redirectedOldSlug}`);
  assert.equal(redirect.status, 308);
  assert.equal(redirect.headers.get("location"), "/blog/redirected-guide-new");

  const sitemap = await page("/sitemap.xml");
  const xml = await sitemap.text();
  assert.equal(sitemap.status, 200);
  assert.match(xml, /\/blog<\/loc>/);
  assert.match(xml, /published-local-guide/);
  assert.match(xml, /public-travel-guides/);
  assert.doesNotMatch(xml, /draft-local-guide|archived-local-guide|inactive-category-guide|private-guides|empty-guides|redirected-guide-old/);
});
