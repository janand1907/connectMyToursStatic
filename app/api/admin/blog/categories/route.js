import { requireAdminMutation } from "@/lib/auth/admin";
import { saveCategory } from "@/lib/blog/categories";
import { errorResponse, jsonResponse, readJson } from "@/lib/blog/admin-http";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const admin = await requireAdminMutation(request);
    const input = await readJson(request);
    const category = await saveCategory(input, { actorId: admin.id, metadata: { userAgent: request.headers.get("user-agent") } });
    return jsonResponse({ ok: true, id: category.id }, 201);
  } catch (error) { return errorResponse(error); }
}
