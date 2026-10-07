require("server-only");

const { randomBytes, randomUUID, createHmac } = require("node:crypto");
const { query } = require("./db");
const { authConfig } = require("./config");
const { validateId } = require("./validation");
const { requestMetadata } = require("./audit");
const { BlogError } = require("./errors");

function tokenHash(token) {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  return createHmac("sha256", authConfig().secret).update(token).digest("hex");
}

async function createSession(userId, metadata = {}, executor) {
  validateId(userId, "userId");
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + authConfig().ttlSeconds * 1000);
  const context = requestMetadata(metadata);
  // INSERT ... SELECT prevents creation for a missing/inactive account.
  const result = await query(`INSERT INTO admin_sessions (id, user_id, session_token_hash, expires_at, user_agent, ip_address)
    SELECT ?, id, ?, ?, ?, ? FROM admin_users WHERE id = ? AND status = 'active'`,
  [randomUUID(), tokenHash(token), expiresAt, context.userAgent, context.ipAddress, userId], executor);
  if (result.affectedRows !== 1) throw new BlogError("Account is not active.", "UNAUTHORIZED", 401);
  return { token, expiresAt };
}

async function validateSession(token, executor) {
  const hash = tokenHash(token);
  if (!hash) return null;
  const rows = await query(`SELECT s.id AS session_id, s.expires_at, u.id, u.name, u.email, u.role, u.status
    FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id
    WHERE s.session_token_hash = ? AND s.expires_at > UTC_TIMESTAMP(3) AND u.status = 'active'`, [hash], executor);
  return rows[0] || null;
}

async function removeSession(token, executor) {
  const hash = tokenHash(token);
  if (hash) await query("DELETE FROM admin_sessions WHERE session_token_hash = ?", [hash], executor);
}

async function removeUserSessions(userId, executor) {
  validateId(userId, "userId");
  await query("DELETE FROM admin_sessions WHERE user_id = ?", [userId], executor);
}

async function removeExpiredSessions() {
  return query("DELETE FROM admin_sessions WHERE expires_at <= UTC_TIMESTAMP(3)");
}

module.exports = { createSession, validateSession, removeSession, removeUserSessions, removeExpiredSessions };
