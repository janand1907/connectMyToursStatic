import { login } from "@/lib/auth/service";
import { getAdminToken, setAdminCookie } from "@/lib/auth/admin";
import { errorResponse, jsonResponse, readJson } from "@/lib/blog/admin-http";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await readJson(request);
    const result = await login({ email: body.email, password: body.password }, {
      origin: request.headers.get("origin"),
      previousToken: getAdminToken(),
      metadata: { userAgent: request.headers.get("user-agent") },
    });
    setAdminCookie(result);
    return jsonResponse({ ok: true, user: { name: result.user.name, role: result.user.role } });
  } catch (error) { return errorResponse(error); }
}
