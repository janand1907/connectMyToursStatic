import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth/admin";
import { getPost } from "@/lib/blog/posts";
import { listCategories } from "@/lib/blog/categories";
import { postInputFromRow } from "@/lib/blog/admin-input";
import AdminLayout from "@/components/admin/AdminLayout";
import PostForm from "@/components/admin/PostForm";

export const metadata = { title: "Edit blog post | Connect My Tours" };

export default async function EditPostPage({ params }) {
  const user = await requireAdminPage();
  let post;
  try { post = await getPost(params.id); } catch (error) { if (error.code !== "INVALID_INPUT") throw error; }
  if (!post) notFound();
  const categories = await listCategories();
  return <AdminLayout user={user} title={`Edit ${post.title}`} actions={<Link href="/admin/blog/posts" className="text-sm font-semibold text-primary-700 underline">Back to posts</Link>}>
    <PostForm post={{ id: post.id, ...postInputFromRow(post) }} categories={categories.map(({ id, name, status }) => ({ id, name, status }))} />
  </AdminLayout>;
}
