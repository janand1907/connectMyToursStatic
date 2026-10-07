import { requireAdminMutation } from "@/lib/auth/admin";
import { savePost } from "@/lib/blog/posts";
import { errorResponse, jsonResponse, readJson } from "@/lib/blog/admin-http";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const admin = await requireAdminMutation(request);
    const input = await readJson(request);
    const post = await savePost(input, { actorId: admin.id, metadata: { userAgent: request.headers.get("user-agent") } });
    return jsonResponse({ ok: true, id: post.id }, 201);
  } catch (error) { return errorResponse(error); }
}
