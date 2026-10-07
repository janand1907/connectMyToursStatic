#!/usr/bin/env node
// Starts and destroys an isolated local MySQL instance. This harness deliberately
// does not load .env.local and never connects to the user's existing database.
const fs = require("node:fs/promises");
const path = require("node:path");
const net = require("node:net");
const { spawn } = require("node:child_process");
const { randomBytes } = require("node:crypto");
const mysql = require("mysql2/promise");

const project = path.resolve(__dirname, "..");
const SAFE_ENV_KEYS = ["PATH", "HOME", "USER", "LOGNAME", "SHELL", "TMPDIR", "TMP", "TEMP", "SystemRoot", "WINDIR", "LANG", "LC_ALL", "TERM", "CI"];

function isolatedEnvironment(overrides = {}) {
  const env = {};
  for (const key of SAFE_ENV_KEYS) if (process.env[key] !== undefined) env[key] = process.env[key];
  return { ...env, ...overrides };
}

function run(command, args, { env = isolatedEnvironment(), visible = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: project, env, stdio: visible ? "inherit" : ["ignore", "pipe", "pipe"] });
    let stderr = "";
    if (!visible) child.stderr.on("data", (data) => { stderr += data; });
    child.once("error", reject);
    child.once("exit", (code, signal) => code === 0 ? resolve() : reject(new Error(`Local test process failed (${command}${signal ? `, ${signal}` : ""}).${stderr ? ` ${stderr.trim()}` : ""}`)));
  });
}

async function resolveMysqld() {
  const candidates = [
    process.env.TEST_MYSQLD_PATH,
    process.arch === "arm64" ? "/opt/homebrew/opt/mysql@8.4/bin/mysqld" : null,
    "/usr/local/opt/mysql@8.4/bin/mysqld",
    "mysqld",
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (candidate === "mysqld") return candidate;
    try { await fs.access(candidate); return candidate; } catch { /* Try the next known installation. */ }
  }
  throw new Error("No usable isolated MySQL binary was found. Set TEST_MYSQLD_PATH to a compatible local mysqld binary.");
}

async function mysqlLog(directory) {
  const log = await fs.readFile(path.join(directory, "mysql.log"), "utf8").catch(() => "");
  const matches = log.split("\n").filter((line) => /\[ERROR\]|signal \d+|SIG[A-Z]+|crash/i.test(line));
  return matches.slice(0, 3).join(" ");
}

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function main() {
  const directory = await fs.realpath(await fs.mkdtemp("/tmp/cmt-blog-test-"));
  const datadir = path.join(directory, "data");
  const socketPath = path.join(directory, "mysql.sock");
  const mysqld = await resolveMysqld();
  const maria = path.basename(mysqld) === "mariadbd";
  const initializer = maria ? path.join(path.dirname(mysqld), "mariadb-install-db") : mysqld;
  let server;
  let root;
  let serverFailure;
  let serverExited;
  let webServer;
  let webServerExited;
  try {
    await fs.mkdir(datadir, { mode: 0o700 });
    try {
      const initArgs = maria
        ? ["--no-defaults", `--datadir=${datadir}`, "--auth-root-authentication-method=normal", "--skip-test-db"]
        : ["--no-defaults", "--initialize-insecure", `--datadir=${datadir}`, `--log-error=${directory}/mysql.log`];
      await run(initializer, initArgs);
    } catch (error) {
      const detail = await mysqlLog(directory);
      throw new Error(`Temporary MySQL initialization failed. ${detail || error.message}`);
    }
    const port = await freePort();
    const serverArgs = ["--no-defaults", `--datadir=${datadir}`, `--socket=${socketPath}`, `--port=${port}`,
      "--bind-address=127.0.0.1", "--skip-log-bin", `--pid-file=${directory}/mysql.pid`,
      `--log-error=${directory}/mysql.log`];
    if (!maria) serverArgs.splice(5, 0, "--mysqlx=0");
    server = spawn(mysqld, serverArgs, { stdio: "ignore" });
    serverExited = new Promise((resolve) => { server.once("exit", resolve); server.once("error", (error) => { serverFailure = error; resolve(); }); });
    for (let attempt = 0; attempt < 200; attempt++) {
      if (serverFailure || server.exitCode !== null) throw new Error("Temporary MySQL could not start.");
      try { root = await mysql.createConnection({ socketPath, user: "root", connectTimeout: 500 }); break; }
      catch { await new Promise((resolve) => setTimeout(resolve, 100)); }
    }
    if (!root) throw new Error("Temporary MySQL did not become ready.");
    const password = randomBytes(32).toString("hex");
    await root.query("CREATE USER 'cmt_blog_test'@'127.0.0.1' IDENTIFIED BY ?", [password]);
    await root.query("GRANT ALL PRIVILEGES ON connect_my_tours_blog_test.* TO 'cmt_blog_test'@'127.0.0.1'");
    const env = isolatedEnvironment({
      MYSQL_HOST: "127.0.0.1", MYSQL_PORT: String(port), MYSQL_DATABASE: "connect_my_tours_blog_test",
      MYSQL_USER: "cmt_blog_test", MYSQL_PASSWORD: password,
      APP_ORIGIN: "http://localhost:3000", SESSION_SECRET: randomBytes(48).toString("hex"),
      BLOG_UPLOAD_DIR: path.join(directory, "uploads"), BLOG_UPLOAD_MAX_BYTES: "5242880",
      NODE_ENV: "test", BLOG_INTEGRATION_TEST: "isolated-local-mysql",
    });
    console.log("Testing against an isolated temporary MySQL instance on loopback; no existing database is used.");
    await run(process.execPath, ["scripts/build-blog-admin.js"], { env, visible: true });
    await run(process.execPath, ["--conditions=react-server", "--test", "tests/blog/unit.test.js", "tests/blog/integration.test.js"], { env, visible: true });
    const webPort = await freePort();
    const webOrigin = `http://127.0.0.1:${webPort}`;
    const webEnv = { ...env, NODE_ENV: "development", APP_ORIGIN: webOrigin };
    webServer = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", String(webPort), "-H", "127.0.0.1"],
      { cwd: project, env: webEnv, stdio: "ignore" });
    webServerExited = new Promise((resolve) => { webServer.once("exit", resolve); webServer.once("error", resolve); });
    let ready = false;
    for (let attempt = 0; attempt < 180; attempt++) {
      if (webServer.exitCode !== null) break;
      try {
        const response = await fetch(`${webOrigin}/admin/login`, { signal: AbortSignal.timeout(1000) });
        if (response.ok) { ready = true; break; }
      } catch { /* Wait for the local Next.js compiler. */ }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (!ready) throw new Error("Local Next.js admin server did not become ready.");
    await run(process.execPath, ["--conditions=react-server", "--test", "tests/blog/admin-http.test.js"],
      { env: { ...webEnv, BLOG_TEST_ORIGIN: webOrigin, NODE_ENV: "test" }, visible: true });
    await run(process.execPath, ["--conditions=react-server", "--test", "tests/blog/public-http.test.js"],
      { env: { ...webEnv, BLOG_TEST_ORIGIN: webOrigin, NODE_ENV: "test" }, visible: true });
  } finally {
    if (webServer && webServer.exitCode === null) {
      webServer.kill("SIGTERM");
      const timeout = setTimeout(() => webServer.kill("SIGKILL"), 10000);
      await webServerExited;
      clearTimeout(timeout);
    }
    if (!server) { const detail = await mysqlLog(directory); if (detail) console.error(detail); }
    if (root) {
      try { await root.query("SHUTDOWN"); } catch { /* SHUTDOWN can close the socket before responding. */ }
      await root.end().catch(() => {});
    }
    if (server && server.exitCode === null && !serverFailure) {
      server.kill("SIGTERM");
      const timeout = setTimeout(() => server.kill("SIGKILL"), 10000);
      await serverExited;
      clearTimeout(timeout);
    }
    await fs.rm(directory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(`Blog tests failed: ${error.message || "unknown test failure"}. No existing database was changed.`);
  process.exitCode = 1;
});
