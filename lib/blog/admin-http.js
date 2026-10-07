import "server-only";

import { BlogError } from "./errors";

const JSON_LIMIT = 256 * 1024;

export function jsonResponse(body, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function errorResponse(error) {
  if (error instanceof BlogError) {
    return jsonResponse({ ok: false, error: error.message, fields: error.fields || {} }, error.status);
  }
  console.error("[blog admin] request failed:", error.code || error.name || "unknown");
  return jsonResponse({ ok: false, error: "The request could not be completed. Please try again." }, 500);
}

export async function readJson(request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new BlogError("Send JSON data.", "INVALID_INPUT", 415);
  }
  if (Number(request.headers.get("content-length") || 0) > JSON_LIMIT) {
    throw new BlogError("Form data is too large.", "INVALID_INPUT", 413);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new BlogError("Form data is required.");
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > JSON_LIMIT) {
      await reader.cancel();
      throw new BlogError("Form data is too large.", "INVALID_INPUT", 413);
    }
    chunks.push(value);
  }
  let parsed;
  try { parsed = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new BlogError("Form data is invalid JSON."); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new BlogError("Send a form object.");
  return parsed;
}
