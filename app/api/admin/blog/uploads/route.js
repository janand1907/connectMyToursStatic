import { requireAdminMutation } from "@/lib/auth/admin";
import { saveBlogImage } from "@/lib/blog/uploads";
import { localStorage } from "@/lib/blog/storage/local";
import { uploadConfig } from "@/lib/blog/config";
import { BlogError } from "@/lib/blog/errors";
import { errorResponse, jsonResponse } from "@/lib/blog/admin-http";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    await requireAdminMutation(request);
    if (process.env.NODE_ENV !== "development") {
      throw new BlogError("Uploads are available in local development only.", "CONFIGURATION", 503);
    }
    const type = request.headers.get("content-type") || "";
    if (!/^multipart\/form-data;.*boundary=/i.test(type)) throw new BlogError("Choose an image file.", "INVALID_UPLOAD", 415);
    const maxRequestBytes = uploadConfig().maxBytes + 65536;
    if (Number(request.headers.get("content-length") || 0) > maxRequestBytes) throw new BlogError("Image upload is too large.", "INVALID_UPLOAD", 413);
    const reader = request.body?.getReader();
    if (!reader) throw new BlogError("Image upload is empty.", "INVALID_UPLOAD", 400);
    const chunks = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxRequestBytes) {
        await reader.cancel();
        throw new BlogError("Image upload is too large.", "INVALID_UPLOAD", 413);
      }
      chunks.push(value);
    }
    let form;
    try {
      form = await new Request(request.url, { method: "POST", headers: { "content-type": type }, body: Buffer.concat(chunks) }).formData();
    } catch { throw new BlogError("Image upload is invalid.", "INVALID_UPLOAD", 400); }
    const files = form.getAll("image");
    const file = files[0];
    if (files.length !== 1 || !file || typeof file.name !== "string" || typeof file.arrayBuffer !== "function") {
      throw new BlogError("Choose one image file.", "INVALID_UPLOAD", 400);
    }
    const saved = await saveBlogImage({ filename: file.name, contentType: file.type, buffer: Buffer.from(await file.arrayBuffer()) }, localStorage());
    return jsonResponse({ ok: true, image: saved }, 201);
  } catch (error) { return errorResponse(error); }
}
