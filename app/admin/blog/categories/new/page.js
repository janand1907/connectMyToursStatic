import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin";
import AdminLayout from "@/components/admin/AdminLayout";
import CategoryForm from "@/components/admin/CategoryForm";

export const metadata = { title: "Add blog category | Connect My Tours" };

export default async function NewCategoryPage() {
  const user = await requireAdminPage();
  return <AdminLayout user={user} title="Add category" actions={<Link href="/admin/blog/categories" className="text-sm font-semibold text-primary-700 underline">Back to categories</Link>}><CategoryForm /></AdminLayout>;
}
