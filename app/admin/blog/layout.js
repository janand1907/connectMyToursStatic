import { requireAdminPage } from "@/lib/auth/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function ProtectedBlogLayout({ children }) {
  await requireAdminPage();
  return children;
}
