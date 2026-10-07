import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin";
import { listCategories } from "@/lib/blog/categories";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminCard from "@/components/admin/AdminCard";
import PostForm from "@/components/admin/PostForm";

export const metadata = { title: "Add blog post | Connect My Tours" };

export default async function NewPostPage() {
  const user = await requireAdminPage();
  const categories = await listCategories();
  return <AdminLayout user={user} title="Add post" actions={<Link href="/admin/blog/posts" className="text-sm font-semibold text-primary-700 underline">Back to posts</Link>}>
    {categories.length ? <PostForm categories={categories.map(({ id, name, status }) => ({ id, name, status }))} /> : <AdminCard title="Add a category first"><p className="text-sm text-neutral-700">Posts need a category before they can be saved.</p><Link href="/admin/blog/categories/new" className="mt-3 inline-block font-semibold text-primary-700 underline">Add category</Link></AdminCard>}
  </AdminLayout>;
}
