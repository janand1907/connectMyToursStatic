import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth/admin";
import { getCategory } from "@/lib/blog/categories";
import { categoryInputFromRow } from "@/lib/blog/admin-input";
import AdminLayout from "@/components/admin/AdminLayout";
import CategoryForm from "@/components/admin/CategoryForm";

export const metadata = { title: "Edit blog category | Connect My Tours" };

export default async function EditCategoryPage({ params }) {
  const user = await requireAdminPage();
  let category;
  try { category = await getCategory(params.id); } catch (error) { if (error.code !== "INVALID_INPUT") throw error; }
  if (!category) notFound();
  return <AdminLayout user={user} title={`Edit ${category.name}`} actions={<Link href="/admin/blog/categories" className="text-sm font-semibold text-primary-700 underline">Back to categories</Link>}><CategoryForm category={{ id: category.id, ...categoryInputFromRow(category) }} /></AdminLayout>;
}
