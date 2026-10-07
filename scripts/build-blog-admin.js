#!/usr/bin/env node
const path = require("node:path");
const esbuild = require("esbuild");

const root = path.resolve(__dirname, "..");
esbuild.build({
  entryPoints: [path.join(root, "scripts/blog-create-admin-standalone.js")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: path.join(root, "dist/blog-create-admin.cjs"),
  legalComments: "none",
  sourcemap: false,
  minify: false,
  plugins: [{
    name: "remove-next-server-guard-for-cli",
    setup(build) {
      build.onResolve({ filter: /^server-only$/ }, () => ({ path: "server-only", namespace: "cli-guard" }));
      build.onLoad({ filter: /.*/, namespace: "cli-guard" }, () => ({ contents: "module.exports = {};", loader: "js" }));
    },
  }],
}).then(() => console.log("Built dist/blog-create-admin.cjs"), (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
