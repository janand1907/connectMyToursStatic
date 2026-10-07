require("server-only");

const { randomBytes, scrypt, timingSafeEqual } = require("node:crypto");
const { promisify } = require("node:util");
const { BlogError } = require("../blog/errors");

const derive = promisify(scrypt);
const PARAMETERS = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };

function validatePassword(password) {
  if (typeof password !== "string" || [...password].length < 12 || Buffer.byteLength(password) > 1024) {
    throw new BlogError("Use a password of at least 12 characters and at most 1024 bytes.", "INVALID_INPUT", 400, { password: "Use a long, unique password or passphrase." });
  }
}

async function hashPassword(password) {
  validatePassword(password);
  const salt = randomBytes(16).toString("hex");
  const key = await derive(password, salt, 64, PARAMETERS);
  return `scrypt$32768$8$3$${salt}$${key.toString("hex")}`;
}

async function verifyPassword(password, stored) {
  if (typeof password !== "string" || Buffer.byteLength(password) > 1024 || typeof stored !== "string") return false;
  const parts = stored.split("$");
  if (parts.length !== 6 || parts.slice(0, 4).join("$") !== "scrypt$32768$8$3" ||
      !/^[0-9a-f]{32}$/.test(parts[4]) || !/^[0-9a-f]{128}$/.test(parts[5])) return false;
  const key = await derive(password, parts[4], 64, PARAMETERS);
  return timingSafeEqual(key, Buffer.from(parts[5], "hex"));
}

// Unknown accounts perform the same expensive operation as existing accounts.
const DUMMY_HASH = `scrypt$32768$8$3$${"0".repeat(32)}$${"0".repeat(128)}`;

module.exports = { hashPassword, verifyPassword, validatePassword, DUMMY_HASH };
