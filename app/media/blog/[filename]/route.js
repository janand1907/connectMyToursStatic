import { localStorage } from "@/lib/blog/storage/local";
import { BlogError } from "@/lib/blog/errors";
import { MEDIA_PATTERN } from "@/lib/blog/validation";

export const runtime = "nodejs";

const contentTypes = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(request, { params }) {
  if (process.env.NODE_ENV === "production") return new Response("Not found.", { status: 404 });
  const filename = params.filename;
  if (!MEDIA_PATTERN.test(`/media/blog/${filename}`)) return new Response("Not found.", { status: 404 });
  try {
    const buffer = await localStorage().read(filename);
    const extension = filename.split(".").pop();
    return new Response(buffer, { headers: {
      "Content-Type": contentTypes[extension],
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": `inline; filename="${filename}"`,
    } });
  } catch (error) {
    if (error instanceof BlogError || error.code === "ENOENT") return new Response("Not found.", { status: 404 });
    throw error;
  }
}
