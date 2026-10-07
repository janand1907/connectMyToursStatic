const path = require("node:path");
const { BlogError } = require("./errors");

const APPROVED_LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);
const LOCAL_DATABASE_PATTERN = /^connect_my_tours_blog_(?:local|test(?:_[a-z0-9]{1,12})?)$/;
const DATABASE_IDENTIFIER_PATTERN = /^[A-Za-z0-9$_]+$/;
const PRODUCTION_ORIGIN = "https://www.connectmytours.com";

function configError(message) {
  throw new BlogError(message, "CONFIGURATION", 503);
}

function runtimeEnvironment(env) {
  const value = env.NODE_ENV || "development";
  if (!["development", "test", "production"].includes(value)) {
    configError("NODE_ENV must be development, test, or production.");
  }
  return value;
}

function isLoopbackHost(host) {
  const normalized = typeof host === "string" ? host.trim().toLowerCase().replace(/^\[|\]$/g, "") : "";
  return normalized === "localhost" || normalized === "::1" || normalized === "0:0:0:0:0:0:0:1" ||
    /^127(?:\.\d{1,3}){3}$/.test(normalized) || /^::ffff:127(?:\.\d{1,3}){3}$/.test(normalized);
}

function isApprovedLocalHost(host) {
  return APPROVED_LOCAL_HOSTS.has(host);
}

function databaseConfig(env = process.env) {
  const environment = runtimeEnvironment(env);
  const host = typeof env.MYSQL_HOST === "string" ? env.MYSQL_HOST.trim() : "";
  const database = typeof env.MYSQL_DATABASE === "string" ? env.MYSQL_DATABASE.trim() : "";

  // Local development and all tests fail closed to loopback databases. This
  // prevents a developer or test process from reaching a production database.
  if (environment !== "production") {
    if (!isApprovedLocalHost(host)) configError("Local and test database connections require an approved loopback MYSQL_HOST.");
    if (!LOCAL_DATABASE_PATTERN.test(database)) {
      configError("Use connect_my_tours_blog_local or connect_my_tours_blog_test for local and test databases.");
    }
  } else {
    // Production is deliberately tied to this application's canonical HTTPS
    // origin. authConfig also rejects paths, credentials, queries, and hashes.
    const auth = authConfig(env);
    if (auth.origin !== PRODUCTION_ORIGIN) configError("Production APP_ORIGIN must be https://www.connectmytours.com.");
    if (!host || isLoopbackHost(host)) configError("Production MYSQL_HOST must be a non-loopback host.");
    if (!database || LOCAL_DATABASE_PATTERN.test(database) || !DATABASE_IDENTIFIER_PATTERN.test(database)) {
      configError("Production MYSQL_DATABASE must be a non-local, valid database identifier.");
    }
    if (!env.MYSQL_USER || typeof env.MYSQL_USER !== "string" || !env.MYSQL_USER.trim()) {
      configError("Set MYSQL_USER before connecting to the production database.");
    }
    if (typeof env.MYSQL_PASSWORD !== "string" || !env.MYSQL_PASSWORD) {
      configError("Set MYSQL_PASSWORD privately before connecting to the production database.");
    }
    // Validate the upload limit while retaining production's disabled storage
    // mode. This makes every production configuration fail closed up front.
    uploadConfig(env);
  }
  const port = Number(env.MYSQL_PORT || 3306);
  if (!Number.isInteger(port) || port < 1 || port > 65535) configError("MYSQL_PORT is invalid.");
  if (!env.MYSQL_USER || typeof env.MYSQL_PASSWORD !== "string") {
    configError("Set MYSQL_USER and MYSQL_PASSWORD privately before connecting.");
  }
  return {
    host: host === "localhost" ? "127.0.0.1" : host,
    port,
    database,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    charset: "utf8mb4",
    timezone: "Z",
    multipleStatements: false,
    connectTimeout: 5000,
    supportBigNumbers: true,
    bigNumberStrings: true,
  };
}

function authConfig(env = process.env) {
  let origin;
  try {
    origin = new URL(env.APP_ORIGIN);
  } catch {
    configError("Set APP_ORIGIN to the application's origin.");
  }
  if (!["http:", "https:"].includes(origin.protocol) || origin.username || origin.password ||
      origin.pathname !== "/" || origin.search || origin.hash) {
    configError("APP_ORIGIN must contain only a scheme, host, and optional port.");
  }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
  if (origin.protocol !== "https:" && !local) configError("Non-local APP_ORIGIN must use HTTPS.");
  const secret = env.SESSION_SECRET || "";
  if (Buffer.byteLength(secret) < 32 || /replace|placeholder|change.me/i.test(secret)) {
    configError("Set SESSION_SECRET to a privately generated random value of at least 32 bytes.");
  }
  return { origin: origin.origin, secret, secure: origin.protocol === "https:", ttlSeconds: 8 * 60 * 60 };
}

function uploadConfig(env = process.env) {
  const maxBytes = Number(env.BLOG_UPLOAD_MAX_BYTES || 5 * 1024 * 1024);
  if (!Number.isInteger(maxBytes) || maxBytes < 1 || maxBytes > 5 * 1024 * 1024) {
    configError("BLOG_UPLOAD_MAX_BYTES must be between 1 and 5242880.");
  }
  // Production storage remains disabled even if a directory variable was set.
  // An explicitly configured directory is required only by the local adapter.
  if (runtimeEnvironment(env) === "production") return { maxBytes, directory: null, enabled: false };
  const directory = env.BLOG_UPLOAD_DIR ? path.resolve(env.BLOG_UPLOAD_DIR) : null;
  return { maxBytes, directory, enabled: true };
}

module.exports = { databaseConfig, authConfig, uploadConfig, isLoopbackHost, PRODUCTION_ORIGIN };
