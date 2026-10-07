import { logout } from "@/lib/auth/service";
import { getAdminToken, clearAdminCookie } from "@/lib/auth/admin";
import { errorResponse } from "@/lib/blog/admin-http";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    await logout(getAdminToken(), { origin: request.headers.get("origin"), metadata: { userAgent: request.headers.get("user-agent") } });
    clearAdminCookie();
    return Response.redirect(new URL("/admin/login?loggedOut=1", request.url), 303);
  } catch (error) { return errorResponse(error); }
}
