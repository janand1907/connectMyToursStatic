import { requireAdminMutation } from "@/lib/auth/admin";
import { getPost, savePost } from "@/lib/blog/posts";
import { postInputFromRow, isStatusPatch } from "@/lib/blog/admin-input";
import { BlogError } from "@/lib/blog/errors";
import { errorResponse, jsonResponse, readJson } from "@/lib/blog/admin-http";

export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  try {
    const admin = await requireAdminMutation(request);
    const body = await readJson(request);
    let input = body;
    if (isStatusPatch(body, ["draft", "published", "archived"])) {
      const previous = await getPost(params.id);
      if (!previous) throw new BlogError("Post not found.", "NOT_FOUND", 404);
      input = { ...postInputFromRow(previous), status: body.status };
    }
    const post = await savePost(input, { id: params.id, actorId: admin.id, metadata: { userAgent: request.headers.get("user-agent") } });
    return jsonResponse({ ok: true, id: post.id });
  } catch (error) { return errorResponse(error); }
}
