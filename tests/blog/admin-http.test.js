const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
const sharp = require("sharp");
const { createAdmin } = require("../../lib/blog/admin-users");
const { closePool } = require("../../lib/blog/db");

const origin = process.env.BLOG_TEST_ORIGIN;
const password = randomBytes(24).toString("hex");
const email = "http-test-admin@example.test";
let cookie;
let categoryId;
let postId;

async function request(path, { method = "GET", data, session = true, originHeader = true, body, headers = {}, redirect = "manual" } = {}) {
  const requestHeaders = { ...headers };
  if (session && cookie) requestHeaders.Cookie = cookie;
  if (originHeader && method !== "GET" && !requestHeaders.Origin) requestHeaders.Origin = origin;
  if (data !== undefined) { requestHeaders["Content-Type"] = "application/json"; body = JSON.stringify(data); }
  return fetch(`${origin}${path}`, { method, body, headers: requestHeaders, redirect, signal: AbortSignal.timeout(30000) });
}

async function json(path, options) {
  const response = await request(path, options);
  const body = await response.json();
  return { response, body };
}

before(async () => {
  assert.equal(process.env.BLOG_INTEGRATION_TEST, "isolated-local-mysql");
  await createAdmin({ name: "HTTP Test Admin", email, password, role: "admin" });
});
after(closePool);

test("login page is reachable; protected pages and writes reject anonymous requests", async () => {
  const loginPage = await request("/admin/login");
  assert.equal(loginPage.status, 200);
  assert.match(await loginPage.text(), /Sign in/);
  const dashboard = await request("/admin/blog", { session: false });
  assert.equal(dashboard.status, 307);
  assert.match(dashboard.headers.get("location"), /\/admin\/login/);
  const write = await json("/api/admin/blog/categories", { method: "POST", session: false, data: { name: "Unauthorized", slug: "unauthorized" } });
  assert.equal(write.response.status, 401);
});

test("admin login rejects wrong password, accepts real account, and sets private cookie", async () => {
  const invalid = await json("/api/admin/auth/login", { method: "POST", session: false, data: { email, password: "wrong password" } });
  assert.equal(invalid.response.status, 401);
  const valid = await json("/api/admin/auth/login", { method: "POST", session: false, data: { email, password } });
  assert.equal(valid.response.status, 200);
  assert.equal(valid.body.user.role, "admin");
  const setCookie = valid.response.headers.get("set-cookie");
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=strict/i);
  assert.ok(!setCookie.includes(password));
  cookie = setCookie.split(";")[0];
  const dashboard = await request("/admin/blog");
  assert.equal(dashboard.status, 200);
  assert.match(await dashboard.text(), /Blog overview/);
});

test("valid session without matching origin cannot write", async () => {
  const missing = await json("/api/admin/blog/categories", { method: "POST", originHeader: false, data: { name: "Bad", slug: "bad" } });
  assert.equal(missing.response.status, 403);
  const foreign = await json("/api/admin/blog/categories", { method: "POST", headers: { Origin: "https://attacker.example" }, data: { name: "Bad", slug: "bad" } });
  assert.equal(foreign.response.status, 403);
});

test("category create, duplicate prevention, edit, inactive and active transitions", async () => {
  const created = await json("/api/admin/blog/categories", { method: "POST", data: { name: "Local Trips", slug: "local-trips", status: "active" } });
  assert.equal(created.response.status, 201, JSON.stringify(created.body));
  categoryId = created.body.id;
  const duplicate = await json("/api/admin/blog/categories", { method: "POST", data: { name: "Duplicate", slug: "local-trips" } });
  assert.equal(duplicate.response.status, 409);
  const page = await request(`/admin/blog/categories/${categoryId}/edit`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Local Trips/);
  const edited = await json(`/api/admin/blog/categories/${categoryId}`, { method: "PATCH", data: { name: "Local Travel", slug: "local-trips", description: "Guides", status: "active" } });
  assert.equal(edited.response.status, 200, JSON.stringify(edited.body));
  const inactive = await json(`/api/admin/blog/categories/${categoryId}`, { method: "PATCH", data: { status: "inactive" } });
  assert.equal(inactive.response.status, 200, JSON.stringify(inactive.body));
  const active = await json(`/api/admin/blog/categories/${categoryId}`, { method: "PATCH", data: { status: "active" } });
  assert.equal(active.response.status, 200, JSON.stringify(active.body));
  const list = await request("/admin/blog/categories");
  assert.equal(list.status, 200);
  assert.match(await list.text(), /Local Travel/);
});

test("post creation without image, editing, publishing, unpublishing, archiving and restoring", async () => {
  const input = { title: "Local Travel Guide", slug: "local-travel-guide", categoryId, content: "First draft.", status: "draft" };
  const created = await json("/api/admin/blog/posts", { method: "POST", data: input });
  assert.equal(created.response.status, 201, JSON.stringify(created.body));
  postId = created.body.id;
  const editPage = await request(`/admin/blog/posts/${postId}/edit`);
  assert.equal(editPage.status, 200);
  assert.match(await editPage.text(), /Local Travel Guide/);
  const edited = await json(`/api/admin/blog/posts/${postId}`, { method: "PATCH", data: { ...input, content: "Updated draft.", excerpt: "A local guide." } });
  assert.equal(edited.response.status, 200, JSON.stringify(edited.body));
  const published = await json(`/api/admin/blog/posts/${postId}`, { method: "PATCH", data: { status: "published" } });
  assert.equal(published.response.status, 200, JSON.stringify(published.body));
  const list = await request("/admin/blog/posts?status=published&search=Local");
  assert.equal(list.status, 200);
  assert.match(await list.text(), /Local Travel Guide/);
  const draft = await json(`/api/admin/blog/posts/${postId}`, { method: "PATCH", data: { status: "draft" } });
  assert.equal(draft.response.status, 200, JSON.stringify(draft.body));
  const archived = await json(`/api/admin/blog/posts/${postId}`, { method: "PATCH", data: { status: "archived" } });
  assert.equal(archived.response.status, 200, JSON.stringify(archived.body));
  const restored = await json(`/api/admin/blog/posts/${postId}`, { method: "PATCH", data: { status: "draft" } });
  assert.equal(restored.response.status, 200, JSON.stringify(restored.body));
});

test("local upload accepts an image, protects preview, and blocks unsafe files", async () => {
  const png = await sharp({ create: { width: 4, height: 3, channels: 3, background: "blue" } }).png().toBuffer();
  const form = new FormData();
  form.append("image", new Blob([png], { type: "image/png" }), "travel.png");
  const uploaded = await json("/api/admin/blog/uploads", { method: "POST", body: form });
  assert.equal(uploaded.response.status, 201, JSON.stringify(uploaded.body));
  assert.match(uploaded.body.image.path, /^\/media\/blog\/[0-9a-f-]+\.png$/);
  const filename = uploaded.body.image.path.split("/").pop();
  const preview = await request(`/api/admin/blog/media/${filename}`);
  assert.equal(preview.status, 200);
  assert.equal(preview.headers.get("content-type"), "image/png");
  const denied = await request(`/api/admin/blog/media/${filename}`, { session: false });
  assert.equal(denied.status, 401);
  const bad = new FormData();
  bad.append("image", new Blob([Buffer.from("<?php echo 1; ?>")], { type: "image/png" }), "travel.php.png");
  const blocked = await json("/api/admin/blog/uploads", { method: "POST", body: bad });
  assert.equal(blocked.response.status, 400);
  const updated = await json(`/api/admin/blog/posts/${postId}`, { method: "PATCH", data: { title: "Local Travel Guide", slug: "local-travel-guide", categoryId, content: "Updated draft.", status: "draft", featuredImage: uploaded.body.image.path, featuredImageAlt: "Blue sample" } });
  assert.equal(updated.response.status, 200, JSON.stringify(updated.body));
});

test("dashboard shows counts and activity; logout revokes the session", async () => {
  const dashboard = await request("/admin/blog");
  const html = await dashboard.text();
  assert.equal(dashboard.status, 200);
  assert.match(html, /Total posts/);
  assert.match(html, /Recent activity/);
  const logout = await request("/api/admin/auth/logout", { method: "POST" });
  assert.equal(logout.status, 303);
  const denied = await request("/admin/blog");
  assert.equal(denied.status, 307);
});
