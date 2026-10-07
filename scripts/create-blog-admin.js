#!/usr/bin/env node
const { loadLocalEnvironment, reportError, prompts } = require("./blog-cli");
loadLocalEnvironment();
const { databaseConfig } = require("../lib/blog/config");
const { createAdmin } = require("../lib/blog/admin-users");
const { closePool } = require("../lib/blog/db");
const { BlogError } = require("../lib/blog/errors");

async function main() {
  databaseConfig(); // Reject non-local configuration before asking for credentials.
  if (process.argv.length > 2) throw new BlogError("Use the interactive prompt or private environment variables, not command-line password arguments.");
  const prompt = prompts();
  try {
    const name = process.env.BLOG_ADMIN_NAME || await prompt.ask("Admin name: ");
    const email = process.env.BLOG_ADMIN_EMAIL || await prompt.ask("Admin email: ");
    let password = process.env.BLOG_ADMIN_PASSWORD;
    delete process.env.BLOG_ADMIN_PASSWORD;
    if (!password) {
      password = await prompt.ask("Password (hidden, at least 12 characters): ", true);
      const confirmation = await prompt.ask("Confirm password (hidden): ", true);
      if (password !== confirmation) throw new BlogError("Passwords do not match.");
    }
    await createAdmin({ name, email, password, role: process.env.BLOG_ADMIN_ROLE || "admin", status: "active" });
    password = undefined;
    console.log("Local admin account created. Phase 2 will add the login page.");
  } finally {
    prompt.close();
    await closePool();
  }
}

main().catch(reportError);
