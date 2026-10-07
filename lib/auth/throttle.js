require("server-only");

const { createHmac } = require("node:crypto");
const { query, transaction } = require("../blog/db");
const { authConfig } = require("../blog/config");
const { requestMetadata } = require("../blog/audit");
const { BlogError } = require("../blog/errors");

async function consumeLoginAttempt(email, metadata = {}) {
  const secret = authConfig().secret;
  const buckets = [{ key: `email:${email}`, limit: 8 }];
  const { ipAddress } = requestMetadata(metadata);
  if (ipAddress) buckets.push({ key: `ip:${ipAddress}`, limit: 30 });
  const cutoff = new Date(Date.now() - 15 * 60 * 1000);
  await transaction(async (connection) => {
    for (const bucket of buckets) {
      const hash = createHmac("sha256", secret).update(bucket.key).digest("hex");
      await query(`INSERT INTO admin_login_attempts (bucket_hash, attempts, window_started_at) VALUES (?, 1, UTC_TIMESTAMP(3))
        ON DUPLICATE KEY UPDATE attempts = IF(window_started_at <= ?, 1, attempts + 1),
        window_started_at = IF(window_started_at <= ?, UTC_TIMESTAMP(3), window_started_at)`, [hash, cutoff, cutoff], connection);
      const rows = await query("SELECT attempts FROM admin_login_attempts WHERE bucket_hash = ?", [hash], connection);
      if (rows[0].attempts > bucket.limit) throw new BlogError("Too many login attempts. Try again in 15 minutes.", "RATE_LIMITED", 429);
    }
  });
}

async function removeOldLoginAttempts() {
  return query("DELETE FROM admin_login_attempts WHERE window_started_at < UTC_TIMESTAMP(3) - INTERVAL 1 DAY");
}

module.exports = { consumeLoginAttempt, removeOldLoginAttempts };
