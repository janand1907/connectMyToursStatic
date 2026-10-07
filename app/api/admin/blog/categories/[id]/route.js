import { requireAdminMutation } from "@/lib/auth/admin";
import { getCategory, saveCategory } from "@/lib/blog/categories";
import { categoryInputFromRow, isStatusPatch } from "@/lib/blog/admin-input";
import { BlogError } from "@/lib/blog/errors";
import { errorResponse, jsonResponse, readJson } from "@/lib/blog/admin-http";

export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  try {
    const admin = await requireAdminMutation(request);
    const body = await readJson(request);
    let input = body;
    if (isStatusPatch(body, ["active", "inactive"])) {
      const previous = await getCategory(params.id);
      if (!previous) throw new BlogError("Category not found.", "NOT_FOUND", 404);
      input = { ...categoryInputFromRow(previous), status: body.status };
    }
    const category = await saveCategory(input, { id: params.id, actorId: admin.id, metadata: { userAgent: request.headers.get("user-agent") } });
    return jsonResponse({ ok: true, id: category.id });
  } catch (error) { return errorResponse(error); }
}
