require("server-only");

const mysql = require("mysql2/promise");
const { databaseConfig } = require("./config");

const poolKey = Symbol.for("connect-my-tours.blog.mysql-pool");

function getPool() {
  // Lazy initialization allows the existing site to build without blog secrets.
  if (!globalThis[poolKey]) {
    const pool = mysql.createPool({
      ...databaseConfig(),
      connectionLimit: 5,
      maxIdle: 5,
      idleTimeout: 60000,
      waitForConnections: true,
      queueLimit: 50,
    });
    // mysql2's timezone option controls Date encoding; the server session must
    // also use UTC so CURRENT_TIMESTAMP defaults and reads mean the same thing.
    pool.on("connection", (connection) => {
      connection.query("SET SESSION time_zone = '+00:00'", (error) => {
        if (error) connection.destroy();
      });
    });
    globalThis[poolKey] = pool;
  }
  return globalThis[poolKey];
}

async function query(sql, values = [], executor = getPool()) {
  const [rows] = await executor.execute(sql, values);
  return rows;
}

async function transaction(callback, lockName = null) {
  const connection = await getPool().getConnection();
  let locked = false;
  try {
    if (lockName) {
      const [rows] = await connection.execute("SELECT GET_LOCK(?, 10) AS acquired", [lockName]);
      if (Number(rows[0].acquired) !== 1) throw new Error("Blog write lock unavailable; retry shortly.");
      locked = true;
    }
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    try { if (locked) await connection.execute("SELECT RELEASE_LOCK(?)", [lockName]); }
    finally { connection.release(); }
  }
}

async function closePool() {
  if (globalThis[poolKey]) {
    const pool = globalThis[poolKey];
    delete globalThis[poolKey];
    await pool.end();
  }
}

module.exports = { getPool, query, transaction, closePool };
