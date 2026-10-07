const { test } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID, randomBytes } = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");
const { databaseConfig, authConfig, uploadConfig } = require("../../lib/blog/config");
const { validateCategory, validatePost, validateSchema, serializeJsonLd } = require("../../lib/blog/validation");
const { hashPassword, verifyPassword } = require("../../lib/auth/passwords");
const { prepareBlogImage, saveBlogImage } = require("../../lib/blog/uploads");
const { localStorage } = require("../../lib/blog/storage/local");
const { runMigrations } = require("../../lib/blog/migrations");
const { createFirstAdmin, provisionConfig } = require("../../dist/blog-create-admin.cjs");

const post = { title: "A temple travel guide", slug: "temple-travel-guide", categoryId: randomUUID(), content: "Travel guidance." };

const safeSecret = () => randomBytes(32).toString("hex");
const productionEnv = (overrides = {}) => ({
  NODE_ENV: "production",
  MYSQL_HOST: "127.0.0.1",
  MYSQL_PORT: "3306",
  MYSQL_DATABASE: "u284223597_cmt_blog",
  MYSQL_USER: "u284223597_cmt_blog",
  MYSQL_PASSWORD: "test-only-password",
  APP_ORIGIN: "https://www.connectmytours.com",
  SESSION_SECRET: safeSecret(),
  BLOG_UPLOAD_MAX_BYTES: "5242880",
  ...overrides,
});

test("development and test database configuration remain loopback-only", () => {
  const env = { NODE_ENV: "test", MYSQL_HOST: "127.0.0.1", MYSQL_DATABASE: "connect_my_tours_blog_test", MYSQL_USER: "test", MYSQL_PASSWORD: "test" };
  assert.equal(databaseConfig(env).host, "127.0.0.1");
  assert.equal(databaseConfig({ ...env, NODE_ENV: "development", MYSQL_DATABASE: "connect_my_tours_blog_local" }).database, "connect_my_tours_blog_local");
  for (const host of ["db.hostinger.com", "192.168.1.2", "127.0.0.1.example.com", "127.0.0.2", ""]) {
    assert.throws(() => databaseConfig({ ...env, MYSQL_HOST: host }), { code: "CONFIGURATION" });
  }
  for (const name of ["production", "mysql", "u123456789_connectmytours", "connect_my_tours_blog_local;DROP TABLE x"]) {
    assert.throws(() => databaseConfig({ ...env, MYSQL_DATABASE: name }), { code: "CONFIGURATION" });
  }
});

test("production database configuration requires the exact HTTPS production origin", () => {
  const valid = productionEnv();
  assert.equal(databaseConfig(valid).host, "127.0.0.1");
  for (const origin of [
    "http://www.connectmytours.com",
    "https://www.connectmytours.com/blog",
    "https://www.connectmytours.com?preview=1",
    "https://www.connectmytours.com#preview",
    "https://user@www.connectmytours.com",
    "https://:password@www.connectmytours.com",
    "https://connectmytours.com",
  ]) assert.throws(() => databaseConfig(productionEnv({ APP_ORIGIN: origin })), { code: "CONFIGURATION" });
  for (const host of ["127.0.0.2", "::1", "::ffff:127.0.0.1", "mysql.hostinger.example"]) {
    assert.throws(() => databaseConfig(productionEnv({ MYSQL_HOST: host })), { code: "CONFIGURATION" });
  }
  for (const database of ["connect_my_tours_blog_local", "connect_my_tours_blog_test", "u284223597_other", ""]) {
    assert.throws(() => databaseConfig(productionEnv({ MYSQL_DATABASE: database })), { code: "CONFIGURATION" });
  }
  assert.equal(databaseConfig(productionEnv({ MYSQL_HOST: "localhost" })).host, "127.0.0.1");
  assert.throws(() => databaseConfig(productionEnv({ MYSQL_USER: "u284223597_other" })), { code: "CONFIGURATION" });
  assert.throws(() => databaseConfig(productionEnv({ MYSQL_PASSWORD: "" })), { code: "CONFIGURATION" });
  assert.throws(() => databaseConfig(productionEnv({ MYSQL_USER: "" })), { code: "CONFIGURATION" });
  assert.throws(() => databaseConfig(productionEnv({ MYSQL_PORT: "70000" })), { code: "CONFIGURATION" });
  assert.throws(() => databaseConfig(productionEnv({ BLOG_UPLOAD_MAX_BYTES: "5242881" })), { code: "CONFIGURATION" });
});

test("auth configuration fails closed for placeholder secrets and insecure nonlocal origins", () => {
  const env = { APP_ORIGIN: "http://localhost:3000", SESSION_SECRET: randomBytes(32).toString("hex") };
  assert.equal(authConfig(env).secure, false);
  assert.equal(authConfig({ ...env, APP_ORIGIN: "https://example.com" }).secure, true);
  assert.throws(() => authConfig({ ...env, APP_ORIGIN: "http://example.com" }), { code: "CONFIGURATION" });
  assert.throws(() => authConfig({ ...env, SESSION_SECRET: "replace_with_at_least_32_random_bytes" }), { code: "CONFIGURATION" });
});

test("production upload configuration has an explicit disabled mode", () => {
  const config = uploadConfig(productionEnv({ BLOG_UPLOAD_DIR: "/unsafe/should-not-be-used" }));
  assert.equal(config.enabled, false);
  assert.equal(config.directory, null);
  assert.equal(config.maxBytes, 5242880);
});

test("standalone admin validates production and provisioning before connecting", async () => {
  const password = randomBytes(24).toString("hex");
  const valid = productionEnv({ BLOG_ADMIN_NAME: "First Admin", BLOG_ADMIN_EMAIL: "first@example.test", BLOG_ADMIN_PASSWORD: password, BLOG_ADMIN_ROLE: "admin" });
  assert.equal(provisionConfig(valid).admin.role, "admin");
  let connected = false;
  for (const invalid of [
    { MYSQL_DATABASE: "connect_my_tours_blog_test" },
    { APP_ORIGIN: "https://wrong.example" },
    { BLOG_ADMIN_PASSWORD: "" },
    { BLOG_ADMIN_ROLE: "editor" },
  ]) {
    await assert.rejects(createFirstAdmin({ ...valid, ...invalid }, async () => {
      connected = true;
      throw new Error("Connection should not be attempted.");
    }));
  }
  assert.equal(connected, false);
});

test("migration validation rejects unsafe configuration before opening a connection", async () => {
  const keys = ["NODE_ENV", "MYSQL_HOST", "MYSQL_PORT", "MYSQL_DATABASE", "MYSQL_USER", "MYSQL_PASSWORD", "APP_ORIGIN", "SESSION_SECRET", "BLOG_UPLOAD_MAX_BYTES"];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  let connectionAttempted = false;
  try {
    Object.assign(process.env, productionEnv({ MYSQL_DATABASE: "u284223597_wrong" }));
    await assert.rejects(runMigrations({
      createConnection: async () => {
        connectionAttempted = true;
        throw new Error("A connection must not be attempted for invalid configuration.");
      },
    }), { code: "CONFIGURATION" });
    assert.equal(connectionAttempted, false);
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});

test("required fields, slugs, allowed statuses, canonical URLs, and robots are validated", () => {
  assert.equal(validateCategory({ name: "Travel", slug: "travel" }).status, "active");
  for (const input of [{ name: "", slug: "travel" }, { name: "Travel", slug: "Bad Slug" }, { name: "Travel", slug: "travel", status: "deleted" }]) {
    assert.throws(() => validateCategory(input), { code: "INVALID_INPUT" });
  }
  for (const input of [
    { ...post, title: "" }, { ...post, categoryId: "bad-id" }, { ...post, slug: "category" },
    { ...post, status: "deleted" }, { ...post, robots: "all" }, { ...post, canonicalUrl: "javascript:alert(1)" },
    { ...post, canonicalUrl: "https://user:password@example.com" }, { ...post, status: "published", content: "" },
    { ...post, secondaryKeywords: "not an array" }, { ...post, publishedAt: "2099-01-01T00:00:00Z" },
    { ...post, publishedAt: "2025-02-30T00:00:00Z" },
  ]) assert.throws(() => validatePost(input), { code: "INVALID_INPUT" });
  assert.equal(validatePost({ ...post, status: "published" }).featuredImage, null);
  assert.equal(validatePost({ ...post, canonicalUrl: "https://example.com/guide" }).canonicalUrl, "https://example.com/guide");
});

test("stored media paths cannot contain local paths, external URLs, traversal, or PHP", () => {
  for (const featuredImage of ["/Users/admin/image.jpg", "../image.jpg", "https://example.com/photo.jpg", "/uploads/photo.php", "/media/blog/test.jpg"]) {
    assert.throws(() => validatePost({ ...post, featuredImage }), { code: "INVALID_INPUT" });
  }
  const image = `/media/blog/${randomUUID()}.webp`;
  assert.equal(validatePost({ ...post, featuredImage: image }).featuredImage, image);
});

test("schema JSON is validated and script closing tags are escaped during serialization", () => {
  for (const value of ["{broken", "[]", '{"@context":"https://evil.example"}', '{"@context":"https://schema.org","@type":"Article","__proto__":{}}']) {
    assert.throws(() => validateSchema(value), { code: "INVALID_INPUT" });
  }
  const schema = validateSchema('{"@context":"https://schema.org","@type":"Article","headline":"</script><script>alert(1)</script>"}');
  assert.ok(!serializeJsonLd(schema).includes("<"));
  assert.deepEqual(JSON.parse(serializeJsonLd(schema)), schema);
});

test("password hashes are salted and verify without accepting malformed hashes", async () => {
  const password = randomBytes(24).toString("hex");
  const a = await hashPassword(password);
  const b = await hashPassword(password);
  assert.notEqual(a, b);
  assert.ok(!a.includes(password));
  assert.equal(await verifyPassword(password, a), true);
  assert.equal(await verifyPassword("wrong password", a), false);
  assert.equal(await verifyPassword(password, "malformed"), false);
  assert.equal(await verifyPassword(password, a.replace("32768", "999999999")), false);
  await assert.rejects(hashPassword("short"), { code: "INVALID_INPUT" });
});

test("upload processing accepts real JPEG, PNG, and WEBP and generates safe relative paths", async () => {
  for (const format of ["jpeg", "png", "webp"]) {
    const buffer = await sharp({ create: { width: 3, height: 2, channels: 3, background: "blue" } }).toFormat(format).toBuffer();
    let stored;
    const result = await saveBlogImage({ filename: `my holiday.${format}`, contentType: `image/${format}`, buffer }, { async put(value) { stored = value; } });
    assert.match(result.path, /^\/media\/blog\/[0-9a-f-]+\.(jpg|png|webp)$/);
    assert.equal(result.width, 3);
    assert.equal(result.height, 2);
    assert.ok(!result.path.includes("holiday"));
    assert.equal((await sharp(stored.buffer).metadata()).format, format);
  }
});

test("unsafe, disguised, mismatched, oversized, and corrupt image uploads are blocked", async () => {
  const buffer = await sharp({ create: { width: 2, height: 2, channels: 3, background: "red" } }).png().toBuffer();
  for (const filename of ["x.svg", "x.php", "x.js", "x.html", "x.txt", "x.sql", "x.php.png", "../x.png", "C:\\x.png"]) {
    await assert.rejects(prepareBlogImage({ filename, contentType: "image/png", buffer }), { code: "INVALID_UPLOAD" });
  }
  await assert.rejects(prepareBlogImage({ filename: "x.jpg", contentType: "image/jpeg", buffer }), { code: "INVALID_UPLOAD" });
  await assert.rejects(prepareBlogImage({ filename: "x.png", contentType: "image/png", buffer: Buffer.from("<?php echo 1; ?>") }), { code: "INVALID_UPLOAD" });
  await assert.rejects(prepareBlogImage({ filename: "x.png", contentType: "image/png", buffer: Buffer.alloc(5242881) }), { code: "INVALID_UPLOAD" });
  await assert.rejects(prepareBlogImage({ filename: "x.png", contentType: "text/html", buffer }), { code: "INVALID_UPLOAD" });
  const withPayload = Buffer.concat([buffer, Buffer.from("<?php unsafe_tail ?>")]);
  const cleaned = await prepareBlogImage({ filename: "x.png", contentType: "image/png", buffer: withPayload });
  assert.ok(!cleaned.buffer.includes(Buffer.from("unsafe_tail")));
});

test("local storage is explicit, rejects public/deployment directories, and prevents overwrites", async () => {
  const directory = await fs.realpath(await fs.mkdtemp("/tmp/cmt-blog-storage-"));
  try {
    for (const folder of ["public/uploads/blog", "public_html/uploads/blog", "hbuilds/current/uploads"]) {
      assert.throws(() => localStorage({ directory: path.join(process.cwd(), folder) }), { code: "CONFIGURATION" });
    }
    const adapter = localStorage({ directory });
    const filename = `${randomUUID()}.png`;
    await adapter.put({ filename, buffer: Buffer.from("test adapter bytes") });
    assert.equal((await adapter.read(filename)).toString(), "test adapter bytes");
    await assert.rejects(adapter.put({ filename, buffer: Buffer.from("overwrite") }), { code: "EEXIST" });
    await assert.rejects(adapter.read("../secret"), { code: "INVALID_UPLOAD" });
    await adapter.remove(filename);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});

test("local storage cannot be enabled under production NODE_ENV", () => {
  const previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "production";
    assert.throws(() => localStorage({ directory: "/tmp/cmt-blog-production-disabled" }), { code: "CONFIGURATION" });
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
});
