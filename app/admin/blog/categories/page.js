import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin";
import { listCategories } from "@/lib/blog/categories";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminCard from "@/components/admin/AdminCard";
import StatusAction from "@/components/admin/StatusAction";

export const metadata = { title: "Blog categories | Connect My Tours" };

export default async function CategoriesPage() {
  const user = await requireAdminPage();
  const categories = await listCategories();
  return <AdminLayout user={user} title="Categories" description="Organize articles into clear travel topics." actions={<Link href="/admin/blog/categories/new" className="btn-primary text-sm">Add category</Link>}>
    <AdminCard title={`All categories (${categories.length})`}>
      {categories.length ? <ul className="divide-y divide-neutral-100">
        {categories.map((category) => <li key={category.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0"><Link href={`/admin/blog/categories/${category.id}/edit`} className="font-semibold text-primary-800 underline hover:text-primary-600">{category.name}</Link><p className="break-all text-xs text-neutral-600">/blog/category/{category.slug}</p><span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${category.status === "active" ? "bg-green-50 text-green-800" : "bg-neutral-100 text-neutral-700"}`}>{category.status}</span></div>
          <div className="flex flex-wrap gap-2"><Link href={`/admin/blog/categories/${category.id}/edit`} className="inline-flex min-h-10 items-center rounded-xl border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-800 hover:bg-primary-50">Edit</Link><StatusAction kind="categories" id={category.id} status={category.status === "active" ? "inactive" : "active"} label={category.status === "active" ? "Inactivate" : "Activate"} /></div>
        </li>)}
      </ul> : <p className="text-sm text-neutral-700">No categories yet. Add one before creating a post.</p>}
    </AdminCard>
  </AdminLayout>;
}
