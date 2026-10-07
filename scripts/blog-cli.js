const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");
const { Writable } = require("node:stream");

function loadLocalEnvironment() {
  // Hostinger injects production variables into the process. Never read local
  // dotenv files in production, and never let a file override an injected key.
  if (process.env.NODE_ENV === "production") return;
  const project = path.resolve(__dirname, "..");
  for (const filename of [".env.local", ".env"]) {
    const file = path.join(project, filename);
    let contents;
    try { contents = fs.readFileSync(file, "utf8"); } catch { continue; }
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || process.env[match[1]] !== undefined) continue;
      let value = match[2];
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      process.env[match[1]] = value;
    }
  }
}

function reportError(error) {
  // Never print raw driver errors, SQL parameters, environment values, or stacks.
  const { BlogError } = require("../lib/blog/errors");
  if (error instanceof BlogError) console.error(error.message);
  else if (error.code === "ECONNREFUSED") console.error("Local MySQL is not reachable. Start it and check the local port.");
  else if (error.code === "ER_ACCESS_DENIED_ERROR") console.error("Local database authentication failed. Check your private local credentials.");
  else if (error.code === "ER_BAD_DB_ERROR") console.error("Local database does not exist. Run migrations with --create-database using a local account with permission.");
  else console.error("Local blog setup failed. Check the setup guide and database permissions; no credentials were logged.");
  process.exitCode = 1;
}

function prompts() {
  let hidden = false;
  const output = new Writable({ write(chunk, encoding, callback) { if (!hidden) process.stdout.write(chunk, encoding); callback(); } });
  const input = readline.createInterface({ input: process.stdin, output, terminal: Boolean(process.stdin.isTTY) });
  return {
    ask(label, secret = false) {
      if (!process.stdin.isTTY) return Promise.reject(new Error("Interactive terminal required."));
      return new Promise((resolve, reject) => {
        hidden = secret;
        if (secret) process.stdout.write(label);
        const interrupted = () => { hidden = false; reject(new Error("Prompt cancelled.")); input.close(); };
        input.once("SIGINT", interrupted);
        input.question(secret ? "" : label, (answer) => {
          input.removeListener("SIGINT", interrupted);
          hidden = false;
          if (secret) process.stdout.write("\n");
          resolve(answer);
        });
      });
    },
    close() { hidden = false; input.close(); },
  };
}

module.exports = { loadLocalEnvironment, reportError, prompts };
