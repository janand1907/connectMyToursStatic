#!/usr/bin/env node
const { loadLocalEnvironment, reportError } = require("./blog-cli");
loadLocalEnvironment();
const { runMigrations } = require("../lib/blog/migrations");

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--create-database")) throw new Error("Unknown migration argument.");
  const applied = await runMigrations({ createDatabase: args.includes("--create-database") });
  console.log(applied.length ? `Applied ${applied.length} local blog migration(s): ${applied.join(", ")}` : "Local blog schema is up to date.");
}

main().catch(reportError);
