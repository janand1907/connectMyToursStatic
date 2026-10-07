require("server-only");

const fs = require("node:fs/promises");
const path = require("node:path");
const { createHash } = require("node:crypto");
const mysql = require("mysql2/promise");
const { databaseConfig } = require("./config");
const { BlogError } = require("./errors");

async function runMigrations({
  createDatabase = false,
  directory = path.join(process.cwd(), "db/migrations"),
  createConnection = mysql.createConnection,
} = {}) {
  const config = databaseConfig();
  const connection = await createConnection({ ...config, database: createDatabase ? undefined : config.database });
  const lockName = `${config.database}:migrations`;
  let locked = false;
  const applied = [];
  try {
    await connection.query("SET SESSION time_zone = '+00:00'");
    if (createDatabase) {
      // The name is constrained by databaseConfig, never taken from request data.
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await connection.changeUser({ database: config.database });
      await connection.query("SET SESSION time_zone = '+00:00'");
    }
    const [locks] = await connection.execute("SELECT GET_LOCK(?, 10) AS acquired", [lockName]);
    if (Number(locks[0].acquired) !== 1) throw new BlogError("Another migration is running. Try again later.", "MIGRATION_LOCKED", 409);
    locked = true;
    await connection.query(`CREATE TABLE IF NOT EXISTS blog_schema_migrations (
      version VARCHAR(120) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
      checksum CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
      status ENUM('running', 'applied', 'failed') NOT NULL,
      started_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      applied_at DATETIME(3) NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    const files = (await fs.readdir(directory)).filter((name) => /^\d{3}_[a-z0-9_]+\.sql$/.test(name)).sort();
    if (new Set(files.map((file) => file.slice(0, 3))).size !== files.length) throw new BlogError("Migration version numbers must be unique.", "MIGRATION_INVALID", 500);
    const [records] = await connection.execute("SELECT version, checksum, status FROM blog_schema_migrations ORDER BY version");
    for (const record of records) {
      if (!files.includes(record.version)) throw new BlogError("An applied migration file is missing. Restore it before continuing.", "MIGRATION_CHANGED", 500);
    }
    for (const file of files) {
      const sql = await fs.readFile(path.join(directory, file), "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const existing = records.find((record) => record.version === file);
      if (existing) {
        if (existing.checksum !== checksum) throw new BlogError("A recorded migration was edited. Restore it and add a new migration.", "MIGRATION_CHANGED", 500);
        if (existing.status !== "applied") throw new BlogError("An incomplete migration needs manual inspection before retrying. See the setup guide.", "MIGRATION_INCOMPLETE", 500);
        continue;
      }
      if (records.some((record) => record.version > file)) throw new BlogError("New migrations must follow the latest recorded version.", "MIGRATION_ORDER", 500);
      await connection.execute("INSERT INTO blog_schema_migrations (version, checksum, status) VALUES (?, ?, 'running')", [file, checksum]);
      try {
        // Each file contains one DDL statement. MySQL DDL implicitly commits;
        // a status ledger detects partial/crashed runs instead of faking rollback.
        await connection.query(sql);
        await connection.execute("UPDATE blog_schema_migrations SET status='applied', applied_at=UTC_TIMESTAMP(3) WHERE version=?", [file]);
        applied.push(file);
      } catch (error) {
        await connection.execute("UPDATE blog_schema_migrations SET status='failed' WHERE version=?", [file]);
        throw error;
      }
    }
    return applied;
  } finally {
    try { if (locked) await connection.execute("SELECT RELEASE_LOCK(?)", [lockName]); }
    finally { await connection.end(); }
  }
}

module.exports = { runMigrations };
