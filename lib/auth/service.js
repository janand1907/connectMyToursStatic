require("server-only");

const { transaction, query } = require("../blog/db");
const { getAdminByEmailForAuth, publicAdmin } = require("../blog/admin-users");
const { createSession, validateSession, removeSession } = require("../blog/sessions");
const { writeAudit } = require("../blog/audit");
const { BlogError } = require("../blog/errors");
const { verifyPassword, DUMMY_HASH } = require("./passwords");
const { consumeLoginAttempt } = require("./throttle");
const { assertSameOrigin } = require("./authorization");

async function login({ email, password }, { origin, metadata = {}, previousToken = null } = {}) {
  assertSameOrigin(origin);
  if (typeof email !== "string" || email.length > 254 || typeof password !== "string" || Buffer.byteLength(password) > 1024) {
    throw new BlogError("Email or password is incorrect.", "UNAUTHORIZED", 401);
  }
  const normalizedEmail = email.trim().toLowerCase();
  await consumeLoginAttempt(normalizedEmail, metadata);
  const user = await getAdminByEmailForAuth(normalizedEmail);
  const matches = await verifyPassword(password, user?.password_hash || DUMMY_HASH);
  if (!matches || !user || user.status !== "active") {
    await writeAudit({ userId: user?.id || null, action: "auth.login_failed", entityType: "admin_user", entityId: user?.id || null,
      details: { reason: "invalid_credentials" }, metadata });
    throw new BlogError("Email or password is incorrect.", "UNAUTHORIZED", 401);
  }
  return transaction(async (connection) => {
    // Lock/recheck after password verification so a concurrent account change
    // cannot create a session for stale credentials or an inactive account.
    const rows = await query("SELECT password_hash, status, role FROM admin_users WHERE id=? FOR UPDATE", [user.id], connection);
    if (!rows.length || rows[0].status !== "active" || rows[0].password_hash !== user.password_hash) {
      throw new BlogError("Email or password is incorrect.", "UNAUTHORIZED", 401);
    }
    if (previousToken) await removeSession(previousToken, connection);
    const session = await createSession(user.id, metadata, connection);
    await query("UPDATE admin_users SET last_login_at=UTC_TIMESTAMP(3) WHERE id=?", [user.id], connection);
    await writeAudit({ userId: user.id, action: "auth.login", entityType: "admin_user", entityId: user.id, metadata }, connection);
    return { user: publicAdmin({ ...user, role: rows[0].role }), ...session };
  });
}

async function logout(token, { origin, metadata = {} } = {}) {
  assertSameOrigin(origin);
  await transaction(async (connection) => {
    const session = await validateSession(token, connection);
    await removeSession(token, connection);
    if (session) await writeAudit({ userId: session.id, action: "auth.logout", entityType: "admin_user", entityId: session.id, metadata }, connection);
  });
}

module.exports = { login, logout };
