import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireSession, assertSameOrigin, sessionCookieOptions } from "./authorization";

export function getAdminToken() {
  return cookies().get(sessionCookieOptions().name)?.value || null;
}

export async function requireAdmin(roles = ["admin", "editor"]) {
  return requireSession(getAdminToken(), roles);
}

export async function requireAdminPage(roles = ["admin", "editor"]) {
  try {
    return await requireAdmin(roles);
  } catch (error) {
    if (error.code === "UNAUTHORIZED") redirect("/admin/login");
    throw error;
  }
}

// Use inside every future mutation handler; guarding a layout alone is insufficient.
export async function requireAdminMutation(request, roles = ["admin", "editor"]) {
  assertSameOrigin(request.headers.get("origin"));
  return requireAdmin(roles);
}

// Cookie writes are only valid from Next.js Route Handlers or Server Actions.
export function setAdminCookie({ token, expiresAt }) {
  const { name, ...options } = sessionCookieOptions();
  cookies().set(name, token, { ...options, expires: expiresAt });
}

export function clearAdminCookie() {
  const { name, ...options } = sessionCookieOptions();
  cookies().set(name, "", { ...options, maxAge: 0, expires: new Date(0) });
}
