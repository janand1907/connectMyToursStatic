require("server-only");

const fs = require("node:fs/promises");
const path = require("node:path");
const { uploadConfig } = require("../config");
const { MEDIA_PATTERN } = require("../validation");
const { BlogError } = require("../errors");

function isWithin(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function assertDirectory(directory, projectRoot) {
  const forbidden = ["public", "public_html", "hbuilds", ".next", "out", ".git", "node_modules"];
  if (forbidden.some((part) => directory.split(path.sep).includes(part)) || directory === projectRoot || isWithin(directory, projectRoot)) {
    throw new BlogError("Use a dedicated upload directory outside public and deployment folders.", "CONFIGURATION", 503);
  }
}

function localStorage({ directory = uploadConfig().directory, projectRoot = process.cwd() } = {}) {
  if (process.env.NODE_ENV === "production") {
    throw new BlogError("Production image storage must be confirmed and approved before enabling it.", "CONFIGURATION", 503);
  }
  if (!directory) throw new BlogError("Set BLOG_UPLOAD_DIR for local image storage.", "CONFIGURATION", 503);
  const root = path.resolve(directory);
  const project = path.resolve(projectRoot);
  assertDirectory(root, project);
  function filenamePath(filename) {
    if (!MEDIA_PATTERN.test(`/media/blog/${filename}`)) throw new BlogError("Invalid media filename.", "INVALID_UPLOAD", 400);
    return path.join(root, filename);
  }
  async function ensureDirectory() {
    await fs.mkdir(root, { recursive: true, mode: 0o700 });
    const real = await fs.realpath(root);
    assertDirectory(real, await fs.realpath(project));
    if (real !== root) throw new BlogError("Use the real upload directory path without symlinks.", "CONFIGURATION", 503);
  }
  return {
    async put({ filename, buffer }) {
      const destination = filenamePath(filename);
      await ensureDirectory();
      // wx prevents replacement and following an existing destination symlink.
      await fs.writeFile(destination, buffer, { flag: "wx", mode: 0o600 });
    },
    async read(filename) {
      const destination = filenamePath(filename);
      await ensureDirectory();
      const stats = await fs.lstat(destination);
      if (!stats.isFile() || stats.isSymbolicLink()) throw new BlogError("Image not found.", "NOT_FOUND", 404);
      return fs.readFile(destination);
    },
    async remove(filename) {
      const destination = filenamePath(filename);
      await ensureDirectory();
      await fs.unlink(destination);
    },
  };
}

module.exports = { localStorage };
