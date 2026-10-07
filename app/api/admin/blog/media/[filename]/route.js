import { requireAdmin } from "@/lib/auth/admin";
import { localStorage } from "@/lib/blog/storage/local";
import { errorResponse } from "@/lib/blog/admin-http";
import { BlogError } from "@/lib/blog/errors";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    await requireAdmin();
    if (process.env.NODE_ENV !== "development") throw new BlogError("Local media preview is unavailable.", "NOT_FOUND", 404);
    const filename = params.filename;
    const extension = filename.split(".").pop();
    const types = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
    const buffer = await localStorage().read(filename);
    return new Response(buffer, { headers: {
      "Content-Type": types[extension],
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": `inline; filename="${filename}"`,
    } });
  } catch (error) {
    if (error.code === "ENOENT") return new Response("Image not found.", { status: 404, headers: { "Cache-Control": "no-store" } });
    return errorResponse(error);
  }
}
