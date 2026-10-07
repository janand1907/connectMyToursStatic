require("server-only");

const { randomUUID } = require("node:crypto");
const path = require("node:path");
const sharp = require("sharp");
const { uploadConfig } = require("./config");
const { BlogError } = require("./errors");

const FORMATS = { jpg: "jpeg", jpeg: "jpeg", png: "png", webp: "webp" };
const MIME_TYPES = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

async function prepareBlogImage({ filename, contentType, buffer }) {
  if (typeof filename !== "string" || filename.length > 255 || /[/\\\0]/.test(filename) ||
      /\.(svg|php\d*|phtml|phar|js|html?|txt|sql)(?:\.|$)/i.test(filename)) {
    throw new BlogError("Choose a JPG, JPEG, PNG, or WEBP image.", "INVALID_UPLOAD", 400);
  }
  const extension = path.extname(filename).slice(1).toLowerCase();
  const format = FORMATS[extension];
  if (!format || contentType !== MIME_TYPES[format]) throw new BlogError("Image extension and type must match JPG, PNG, or WEBP.", "INVALID_UPLOAD", 400);
  if (!Buffer.isBuffer(buffer) || buffer.length === 0 || buffer.length > uploadConfig().maxBytes) {
    throw new BlogError("Image must be non-empty and no larger than the configured limit (maximum 5 MB).", "INVALID_UPLOAD", 400);
  }
  const signatureMatches = format === "jpeg" ? buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) :
    format === "png" ? buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) :
      buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  if (!signatureMatches) throw new BlogError("The file contents do not match the image extension.", "INVALID_UPLOAD", 400);
  let output;
  try {
    const decoder = sharp(buffer, { failOn: "warning", limitInputPixels: 25000000, animated: false });
    const metadata = await decoder.metadata();
    if (metadata.format !== format || (metadata.pages || 1) > 1 || !metadata.width || !metadata.height) throw new Error("Invalid image.");
    // Decoding and re-encoding verifies the actual bytes and strips metadata and
    // appended payloads. The original filename and bytes are never persisted.
    output = await decoder.rotate().toFormat(format).toBuffer({ resolveWithObject: true });
  } catch {
    throw new BlogError("The file is not a valid, supported single-frame image (maximum 25 megapixels).", "INVALID_UPLOAD", 400);
  }
  if (output.data.length > uploadConfig().maxBytes) throw new BlogError("Processed image exceeds the upload size limit.", "INVALID_UPLOAD", 400);
  const safeFilename = `${randomUUID()}.${format === "jpeg" ? "jpg" : format}`;
  return { filename: safeFilename, buffer: output.data, contentType: MIME_TYPES[format], width: output.info.width, height: output.info.height };
}

// Adapter contract: put({ filename, buffer, contentType }) -> void.
// The public URL is derived here; adapters never return private filesystem paths.
async function saveBlogImage(input, storage) {
  if (!storage || typeof storage.put !== "function") throw new BlogError("Image storage is not configured.", "CONFIGURATION", 503);
  const prepared = await prepareBlogImage(input);
  await storage.put(prepared);
  return { path: `/media/blog/${prepared.filename}`, contentType: prepared.contentType, width: prepared.width, height: prepared.height, bytes: prepared.buffer.length };
}

module.exports = { prepareBlogImage, saveBlogImage };
