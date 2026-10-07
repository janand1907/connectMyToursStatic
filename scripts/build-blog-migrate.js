#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");

const root = path.resolve(__dirname, "..");
const migrationDirectory = path.join(root, "db/migrations");
const migrationFiles = fs.readdirSync(migrationDirectory)
  .filter((name) => /^\d{3}_[a-z0-9_]+\.sql$/.test(name))
  .sort()
  .map((version) => ({
    version,
    sql: fs.readFileSync(path.join(migrationDirectory, version), "utf8"),
  }));

const embedded = JSON.stringify(migrationFiles);
const source = `
const { runMigrations } = require(${JSON.stringify(path.join(root, "lib/blog/migrations.js"))});
const migrationFiles = ${embedded};

function reportError(error) {
  console.error(error && error.message ? error.message : "Blog migration failed.");
  process.exitCode = 1;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1 || args[0] !== "migrate") throw new Error("Usage: node dist/blog-migrate.cjs migrate");
  const applied = await runMigrations({ migrationFiles });
  console.log(applied.length ? \`Applied \${applied.length} blog migration(s): \${applied.join(", ")}\` : "Blog schema is up to date.");
}

main().catch(reportError);
`;

fs.mkdirSync(path.join(root, "dist"), { recursive: true });
esbuild.buildSync({
  stdin: { contents: source, resolveDir: root, sourcefile: "blog-migrate-standalone.js" },
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: path.join(root, "dist/blog-migrate.cjs"),
  legalComments: "none",
  sourcemap: false,
  minify: false,
});
console.log("Built dist/blog-migrate.cjs");
