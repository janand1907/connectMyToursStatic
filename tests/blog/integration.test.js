const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { randomBytes, randomUUID } = require("node:crypto");
const { spawn } = require("node:child_process");
const { query, closePool } = require("../../lib/blog/db");
const { runMigrations } = require("../../lib/blog/migrations");
const { createAdmin, getAdminByEmailForAuth, setAdminAccess } = require("../../lib/blog/admin-users");
const { verifyPassword } = require("../../lib/auth/passwords");
const { createSession, validateSession, removeSession, removeExpiredSessions } = require("../../lib/blog/sessions");
const { login, logout } = require("../../lib/auth/service");
const { requireSession, assertRole, sessionCookieOptions } = require("../../lib/auth/authorization");
const { saveCategory, getCategoryBySlug, listCategories } = require("../../lib/blog/categories");
const { savePost, getPost, getPublishedPostBySlug, getPublishedRedirect, listPosts } = require("../../lib/blog/posts");
const { writeAudit } = require("../../lib/blog/audit");

let admin;
let category;
const password = randomBytes(24).toString("hex");
const origin = "http://localhost:3000";

function cli(script, env = {}, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["--conditions=react-server", script, ...args], { env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (data) => { output += data; });
    child.stderr.on("data", (data) => { output += data; });
    child.once("error", reject);
    child.once("exit", (code) => resolve({ code, output }));
  });
}

before(async () => {
  assert.equal(process.env.BLOG_INTEGRATION_TEST, "isolated-local-mysql", "Run npm run blog:test to use an isolated local MySQL instance.");
  assert.equal(process.env.MYSQL_HOST, "127.0.0.1");
  assert.equal(process.env.MYSQL_DATABASE, "connect_my_tours_blog_test");
  const migration = await cli("scripts/blog-migrate.js", {}, ["--create-database"]);
  assert.equal(migration.code, 0, migration.output);
  const created = await cli("scripts/create-blog-admin.js", { BLOG_ADMIN_NAME: "Test Administrator", BLOG_ADMIN_EMAIL: "admin@example.test", BLOG_ADMIN_PASSWORD: password });
  assert.equal(created.code, 0, created.output);
  assert.ok(!created.output.includes(password));
  assert.ok(!created.output.includes(process.env.MYSQL_PASSWORD));
  admin = await getAdminByEmailForAuth("admin@example.test");
});

after(closePool);

test("migrations create all required tables and rerun without changes", async () => {
  assert.equal((await query("SELECT @@session.time_zone AS timezone"))[0].timezone, "+00:00");
  const tables = (await query("SHOW TABLES")).map((row) => Object.values(row)[0]);
  for (const name of ["admin_users", "admin_sessions", "blog_categories", "blog_posts", "blog_redirects", "audit_logs", "admin_login_attempts", "blog_schema_migrations"]) assert.ok(tables.includes(name));
  assert.equal((await query("SELECT * FROM blog_schema_migrations WHERE status='applied'")).length, 7);
  assert.deepEqual(await runMigrations(), []);
  const rerun = await cli("scripts/blog-migrate.js");
  assert.equal(rerun.code, 0, rerun.output);
});

test("admin creation normalizes unique emails and stores a verifiable password hash", async () => {
  assert.equal(admin.role, "admin");
  assert.notEqual(admin.password_hash, password);
  assert.equal(await verifyPassword(password, admin.password_hash), true);
  await assert.rejects(createAdmin({ name: "Duplicate", email: "ADMIN@EXAMPLE.TEST", password }), { code: "DUPLICATE" });
});

test("sessions persist as hashes, expire, revoke, and enforce roles", async () => {
  const session = await createSession(admin.id, { userAgent: "integration test", ipAddress: "127.0.0.1" });
  const rows = await query("SELECT * FROM admin_sessions WHERE user_id=?", [admin.id]);
  assert.ok(!JSON.stringify(rows).includes(session.token));
  assert.equal(rows[0].session_token_hash.length, 64);
  assert.equal((await requireSession(session.token)).id, admin.id);
  assert.throws(() => assertRole({ status: "active", role: "editor" }, ["admin"]), { code: "FORBIDDEN" });
  await query("UPDATE admin_sessions SET expires_at=UTC_TIMESTAMP(3) - INTERVAL 1 MINUTE WHERE user_id=?", [admin.id]);
  assert.equal(await validateSession(session.token), null);
  await removeExpiredSessions();
  const second = await createSession(admin.id);
  await removeSession(second.token);
  assert.equal(await validateSession(second.token), null);
  await assert.rejects(requireSession(second.token), { code: "UNAUTHORIZED" });
  assert.equal(sessionCookieOptions().httpOnly, true);
  assert.equal(sessionCookieOptions().sameSite, "strict");
});

test("login rotates sessions, records last login, and logout revokes access", async () => {
  const previous = await createSession(admin.id);
  const result = await login({ email: admin.email, password }, { origin, previousToken: previous.token });
  assert.equal(result.user.id, admin.id);
  assert.equal(result.user.password_hash, undefined);
  assert.equal(await validateSession(previous.token), null);
  assert.equal((await validateSession(result.token)).id, admin.id);
  assert.ok((await getAdminByEmailForAuth(admin.email)).last_login_at);
  await assert.rejects(logout(result.token, { origin: "https://attacker.example" }), { code: "FORBIDDEN" });
  assert.ok(await validateSession(result.token));
  await logout(result.token, { origin });
  assert.equal(await validateSession(result.token), null);
  await assert.rejects(login({ email: admin.email, password }, { origin: "https://attacker.example" }), { code: "FORBIDDEN" });
});

test("inactive accounts cannot create or retain sessions", async () => {
  const editor = await createAdmin({ name: "Editor", email: "editor@example.test", password, role: "editor" });
  const session = await createSession(editor.id);
  await setAdminAccess(editor.id, { role: "editor", status: "inactive" }, { actorId: admin.id });
  assert.equal(await validateSession(session.token), null);
  await assert.rejects(createSession(editor.id), { code: "UNAUTHORIZED" });
  await assert.rejects(login({ email: editor.email, password }, { origin }), { code: "UNAUTHORIZED" });
});

test("login throttling persists in MySQL and blocks further guesses", async () => {
  for (let attempt = 0; attempt < 8; attempt++) {
    await assert.rejects(login({ email: "missing@example.test", password: "invalid password" }, { origin }), { code: "UNAUTHORIZED" });
  }
  await assert.rejects(login({ email: "missing@example.test", password: "invalid password" }, { origin }), { code: "RATE_LIMITED" });
  const rows = await query("SELECT * FROM admin_login_attempts");
  assert.ok(rows.length > 0);
  assert.ok(!JSON.stringify(rows).includes("missing@example.test"));
});

test("categories persist and concurrent duplicate slugs are prevented", async () => {
  category = await saveCategory({ name: "Travel", slug: "travel", description: "Trip planning." }, { actorId: admin.id });
  assert.equal((await getCategoryBySlug("travel")).id, category.id);
  const results = await Promise.allSettled([
    saveCategory({ name: "Family A", slug: "family" }, { actorId: admin.id }),
    saveCategory({ name: "Family B", slug: "family" }, { actorId: admin.id }),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.find((result) => result.status === "rejected").reason.code, "DUPLICATE");
});

test("draft/published/archived workflow works without an image and preserves publication date", async () => {
  const input = { title: "Travel Guide", slug: "travel-guide", categoryId: category.id, content: "Safe travel guidance.", status: "draft" };
  const draft = await savePost(input, { actorId: admin.id });
  assert.equal(draft.featured_image, null);
  assert.equal(await getPublishedPostBySlug(input.slug), null);
  assert.equal((await listPosts({ publicOnly: true })).length, 0);
  const published = await savePost({ ...input, status: "published" }, { id: draft.id, actorId: admin.id });
  assert.ok(published.published_at);
  assert.equal((await getPublishedPostBySlug(input.slug)).id, draft.id);
  assert.equal((await listCategories({ publicOnly: true, withPublishedPosts: true })).length, 1);
  await savePost({ ...input, status: "archived" }, { id: draft.id, actorId: admin.id });
  assert.equal(await getPublishedPostBySlug(input.slug), null);
  const restored = await savePost(input, { id: draft.id, actorId: admin.id });
  assert.equal(restored.status, "draft");
  assert.equal(restored.published_at.toISOString(), published.published_at.toISOString());
  assert.equal((await listPosts({ status: "draft", search: "Travel", categoryId: category.id })).length, 1);
  assert.equal((await listPosts({ search: "' OR 1=1 --" })).length, 0);
});

test("post slug changes produce flat redirects only to publicly visible posts", async () => {
  const base = { title: "Article", slug: "article-original", categoryId: category.id, content: "Travel content.", status: "published" };
  const post = await savePost(base, { actorId: admin.id });
  await savePost({ ...base, slug: "article-second" }, { id: post.id, actorId: admin.id });
  await savePost({ ...base, slug: "article-third" }, { id: post.id, actorId: admin.id });
  assert.equal((await getPublishedRedirect("article-original")).to_slug, "article-third");
  assert.equal((await getPublishedRedirect("article-second")).status_code, 301);
  await assert.rejects(savePost(base, { actorId: admin.id }), { code: "DUPLICATE" });
  await savePost({ ...base, slug: "article-third", status: "draft" }, { id: post.id, actorId: admin.id });
  assert.equal(await getPublishedRedirect("article-original"), null);
});

test("all SEO fields, optional media paths, and schema JSON survive database round trips", async () => {
  const image = `/media/blog/${randomUUID()}.webp`;
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: "Guide" };
  const input = {
    title: "SEO Guide", slug: "seo-guide", categoryId: category.id, excerpt: "Excerpt", content: "Article content.",
    featuredImage: image, featuredImageAlt: "A temple", metaTitle: "SEO title", metaDescription: "SEO description",
    focusKeyword: "travel", secondaryKeywords: ["temple", "family"], canonicalUrl: "https://example.com/guide",
    robots: "noindex,follow", ogTitle: "Social title", ogDescription: "Social description", ogImage: image,
    schemaJson: JSON.stringify(schema), status: "draft",
  };
  const created = await savePost(input, { actorId: admin.id });
  const saved = await getPost(created.id);
  assert.equal(saved.featured_image, image);
  assert.equal(saved.featured_image_alt, "A temple");
  assert.equal(saved.meta_title, "SEO title");
  assert.equal(saved.meta_description, "SEO description");
  assert.equal(saved.focus_keyword, "travel");
  assert.deepEqual(saved.secondary_keywords, ["temple", "family"]);
  assert.equal(saved.canonical_url, "https://example.com/guide");
  assert.equal(saved.robots, "noindex,follow");
  assert.equal(saved.og_title, "Social title");
  assert.equal(saved.og_description, "Social description");
  assert.equal(saved.og_image, image);
  assert.deepEqual(saved.schema_json, schema);
});

test("inactive categories hide their posts and prevent new publication", async () => {
  const input = { title: "Visible guide", slug: "visible-guide", categoryId: category.id, content: "Guide", status: "published" };
  const post = await savePost(input, { actorId: admin.id });
  await saveCategory({ name: "Travel", slug: "travel", status: "inactive" }, { id: category.id, actorId: admin.id });
  assert.equal(await getCategoryBySlug("travel", { publicOnly: true }), null);
  assert.equal(await getPublishedPostBySlug(input.slug), null);
  await assert.rejects(savePost(input, { id: post.id, actorId: admin.id }), { code: "INVALID_INPUT" });
  await saveCategory({ name: "Travel", slug: "travel", status: "active" }, { id: category.id, actorId: admin.id });
  assert.equal((await getPublishedPostBySlug(input.slug)).id, post.id);
});

test("post duplicate slugs, foreign keys, and write/audit transaction rollback are enforced", async () => {
  const input = { title: "Concurrent", slug: "concurrent", categoryId: category.id, content: "" };
  const results = await Promise.allSettled([savePost(input, { actorId: admin.id }), savePost(input, { actorId: admin.id })]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.find((result) => result.status === "rejected").reason.code, "DUPLICATE");
  await assert.rejects(savePost({ ...input, slug: "missing-category", categoryId: randomUUID() }, { actorId: admin.id }), { code: "INVALID_INPUT" });
  await assert.rejects(saveCategory({ name: "Rollback", slug: "rollback" }, { actorId: randomUUID() }));
  assert.equal(await getCategoryBySlug("rollback"), null);
});

test("audit entries omit secrets and successful mutations leave an audit trail", async () => {
  await writeAudit({ userId: admin.id, action: "test.event", entityType: "test", details: { password, token: "sensitive", status: "draft" } });
  const rows = await query("SELECT * FROM audit_logs");
  assert.ok(rows.some((row) => row.action === "post.created"));
  assert.ok(rows.some((row) => row.action === "auth.logout"));
  assert.ok(!JSON.stringify(rows).includes(password));
  assert.ok(!JSON.stringify(rows).includes("sensitive"));
});

test("migration checksum drift and incomplete migrations fail closed", async () => {
  const rows = await query("SELECT * FROM blog_schema_migrations ORDER BY version LIMIT 1");
  const record = rows[0];
  try {
    await query("UPDATE blog_schema_migrations SET checksum=? WHERE version=?", ["0".repeat(64), record.version]);
    await assert.rejects(runMigrations(), { code: "MIGRATION_CHANGED" });
    await query("UPDATE blog_schema_migrations SET checksum=?, status='running' WHERE version=?", [record.checksum, record.version]);
    await assert.rejects(runMigrations(), { code: "MIGRATION_INCOMPLETE" });
  } finally {
    await query("UPDATE blog_schema_migrations SET checksum=?, status='applied' WHERE version=?", [record.checksum, record.version]);
  }
});
