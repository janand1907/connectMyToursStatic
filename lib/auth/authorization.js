require("server-only");

const { authConfig } = require("../blog/config");
const { validateSession } = require("../blog/sessions");
const { BlogError } = require("../blog/errors");

function assertSameOrigin(origin) {
  if (typeof origin !== "string" || origin !== authConfig().origin) {
    throw new BlogError("This request did not originate from the admin website.", "FORBIDDEN", 403);
  }
}

function assertRole(user, allowedRoles = ["admin", "editor"]) {
  if (!user || user.status !== "active") throw new BlogError("Please sign in.", "UNAUTHORIZED", 401);
  if (!allowedRoles.includes(user.role)) throw new BlogError("You do not have permission for this action.", "FORBIDDEN", 403);
  return user;
}

async function requireSession(token, allowedRoles = ["admin", "editor"]) {
  return assertRole(await validateSession(token), allowedRoles);
}

function sessionCookieOptions() {
  const config = authConfig();
  return {
    name: config.secure ? "__Host-cmt-admin" : "cmt-admin-local",
    httpOnly: true,
    secure: config.secure,
    sameSite: "strict",
    path: "/",
    maxAge: config.ttlSeconds,
  };
}

module.exports = { assertSameOrigin, assertRole, requireSession, sessionCookieOptions };
