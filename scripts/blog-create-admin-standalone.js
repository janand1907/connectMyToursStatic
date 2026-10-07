// Bundled for the Hostinger command runner; never execute this source file there.
const { randomUUID } = require("node:crypto");
const mysql = require("mysql2/promise");
const { databaseConfig } = require("../lib/blog/config");
const { validateAdmin } = require("../lib/blog/validation");
const { hashPassword, validatePassword } = require("../lib/auth/passwords");

function provisionConfig(env = process.env) {
  if (env.NODE_ENV !== "production" && env.NODE_ENV !== "test") {
    throw new Error("Admin provisioning requires production or isolated test mode.");
  }
  const database = databaseConfig(env); // All production gates precede any DB connection.
  const name = env.BLOG_ADMIN_NAME;
  const email = env.BLOG_ADMIN_EMAIL;
  const password = env.BLOG_ADMIN_PASSWORD;
  const role = env.BLOG_ADMIN_ROLE;
  if (!name || !email || !password || !role) {
    throw new Error("Set BLOG_ADMIN_NAME, BLOG_ADMIN_EMAIL, BLOG_ADMIN_PASSWORD, and BLOG_ADMIN_ROLE privately.");
  }
  const admin = validateAdmin({ name, email, role, status: "active" });
  if (admin.role !== "admin" || role !== "admin") {
    throw new Error("The first account must use BLOG_ADMIN_ROLE=admin.");
  }
  validatePassword(password);
  return { database, admin, password };
}

async function createFirstAdmin(env = process.env, connect = mysql.createConnection) {
  const { database, admin, password } = provisionConfig(env);
  const connection = await connect(database);
  let locked = false;
  try {
    const [lockRows] = await connection.execute("SELECT GET_LOCK(?, 10) AS acquired", ["cmt-blog-first-admin"]);
    if (Number(lockRows[0]?.acquired) !== 1) throw new Error("Admin provisioning lock unavailable.");
    locked = true;
    await connection.beginTransaction();
    const [rows] = await connection.execute("SELECT COUNT(*) AS total FROM admin_users");
    if (Number(rows[0]?.total) !== 0) throw new Error("An admin account already exists; no account was created.");
    const id = randomUUID();
    const passwordHash = await hashPassword(password);
    await connection.execute(
      "INSERT INTO admin_users (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)",
      [id, admin.name, admin.email, passwordHash, admin.role, admin.status]
    );
    await connection.execute(
      "INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)",
      [randomUUID(), id, "admin.created", "admin_user", id, JSON.stringify({ role: admin.role, status: admin.status })]
    );
    await connection.commit();
    return { created: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    try { if (locked) await connection.execute("SELECT RELEASE_LOCK(?)", ["cmt-blog-first-admin"]); }
    finally { await connection.end(); }
  }
}

async function main() {
  if (process.argv.length !== 3 || process.argv[2] !== "create") {
    throw new Error("Usage: node dist/blog-create-admin.cjs create");
  }
  await createFirstAdmin();
  console.log("First blog admin created.");
}

if (require.main === module) {
  main().catch((error) => {
    // Avoid echoing database driver errors that might contain configuration.
    const safe = /^(Admin provisioning requires|Set BLOG_ADMIN_|The first account|An admin account already exists|Admin provisioning lock unavailable|Usage:)/.test(error.message);
    console.error(safe ? error.message : "Admin provisioning failed; check private Hostinger configuration and database access.");
    process.exitCode = 1;
  });
}

module.exports = { provisionConfig, createFirstAdmin };
