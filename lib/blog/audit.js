require("server-only");

const { randomUUID } = require("node:crypto");
const { isIP } = require("node:net");
const { query } = require("./db");
const { validateId } = require("./validation");

function requestMetadata(metadata = {}) {
  // Caller must supply an IP from a trusted proxy policy; never blindly trust
  // arbitrary X-Forwarded-For headers. Phase 1 defaults to no recorded IP.
  return {
    ipAddress: typeof metadata.ipAddress === "string" && isIP(metadata.ipAddress) ? metadata.ipAddress : null,
    userAgent: typeof metadata.userAgent === "string" ? metadata.userAgent.slice(0, 512) : null,
  };
}

async function writeAudit({ userId = null, action, entityType, entityId = null, details = {}, metadata }, executor) {
  if (userId) validateId(userId, "userId");
  if (!/^[a-z_.]{1,80}$/.test(action) || !/^[a-z_]{1,40}$/.test(entityType)) throw new Error("Invalid audit event type.");
  // An allowlist prevents accidentally logging a password, token, content, or
  // arbitrary request payload in an audit record.
  const safeDetails = {};
  for (const key of ["status", "previousStatus", "role", "previousRole", "changedFields", "reason", "fromSlug", "toSlug"]) {
    if (details[key] !== undefined) safeDetails[key] = details[key];
  }
  const encoded = JSON.stringify(safeDetails);
  if (Buffer.byteLength(encoded) > 4096) throw new Error("Audit details are too large.");
  const context = requestMetadata(metadata);
  await query(
    "INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [randomUUID(), userId, action, entityType, entityId, encoded, context.ipAddress, context.userAgent], executor
  );
}

module.exports = { writeAudit, requestMetadata };
