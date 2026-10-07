require("server-only");

const { randomUUID } = require("node:crypto");
const { query, transaction } = require("./db");
const { validateAdmin, validateId } = require("./validation");
const { hashPassword } = require("../auth/passwords");
const { BlogError, duplicateError } = require("./errors");
const { writeAudit } = require("./audit");

function publicAdmin(user) {
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

async function getAdminByEmailForAuth(email, executor) {
  const rows = await query("SELECT * FROM admin_users WHERE email = ?", [email], executor);
  return rows[0] || null;
}

async function getAdmin(id, executor) {
  validateId(id);
  const rows = await query("SELECT id, name, email, role, status, created_at, updated_at, last_login_at FROM admin_users WHERE id = ?", [id], executor);
  return rows[0] || null;
}

// Trusted CLI/bootstrap primitive, not an HTTP registration endpoint.
async function createAdmin(input, { actorId = null, metadata } = {}) {
  const value = validateAdmin(input);
  const passwordHash = await hashPassword(input.password);
  const id = randomUUID();
  try {
    return await transaction(async (connection) => {
      await query("INSERT INTO admin_users (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)",
        [id, value.name, value.email, passwordHash, value.role, value.status], connection);
      await writeAudit({ userId: actorId || id, action: "admin.created", entityType: "admin_user", entityId: id, details: { role: value.role, status: value.status }, metadata }, connection);
      return getAdmin(id, connection);
    });
  } catch (error) { duplicateError(error, "email"); }
}

async function setAdminAccess(id, { role, status }, { actorId, metadata } = {}) {
  validateId(id); validateId(actorId, "actorId");
  if (!["admin", "editor"].includes(role) || !["active", "inactive"].includes(status)) throw new BlogError("Invalid role or status.");
  return transaction(async (connection) => {
    const rows = await query("SELECT role, status FROM admin_users WHERE id = ? FOR UPDATE", [id], connection);
    if (!rows.length) throw new BlogError("Admin user not found.", "NOT_FOUND", 404);
    await query("UPDATE admin_users SET role=?, status=?, updated_at=UTC_TIMESTAMP(3) WHERE id=?", [role, status, id], connection);
    await query("DELETE FROM admin_sessions WHERE user_id = ?", [id], connection);
    await writeAudit({ userId: actorId, action: "admin.access_changed", entityType: "admin_user", entityId: id,
      details: { role, status, previousRole: rows[0].role, previousStatus: rows[0].status }, metadata }, connection);
  });
}

module.exports = { publicAdmin, getAdminByEmailForAuth, getAdmin, createAdmin, setAdminAccess };
