import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin";
import { listCategories } from "@/lib/blog/categories";
import { listPosts } from "@/lib/blog/posts";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminCard from "@/components/admin/AdminCard";
import AdminFormGroup from "@/components/admin/AdminFormGroup";
import StatusAction from "@/components/admin/StatusAction";
import { inputClass, selectClass } from "@/components/admin/admin-fields";

export const metadata = { title: "Blog posts | Connect My Tours" };

function textParam(value, limit = 255) { return typeof value === "string" ? value.slice(0, limit) : ""; }

export default async function PostsPage({ searchParams }) {
  const user = await requireAdminPage();
  const categories = await listCategories();
  const search = textParam(searchParams?.search);
  const requestedStatus = textParam(searchParams?.status, 20);
  const status = ["draft", "published", "archived"].includes(requestedStatus) ? requestedStatus : "";
  const requestedCategory = textParam(searchParams?.categoryId, 36);
  const categoryId = categories.some((category) => category.id === requestedCategory) ? requestedCategory : "";
  const page = Math.min(Math.max(Number.parseInt(searchParams?.page || "1", 10) || 1, 1), 50000);
  const posts = await listPosts({ search, status: status || undefined, categoryId: categoryId || undefined, limit: 20, offset: (page - 1) * 20 });
  function pageHref(number) {
    const query = new URLSearchParams({ search, status, categoryId, page: String(number) });
    return `/admin/blog/posts?${query}`;
  }
  return <AdminLayout user={user} title="Posts" description="Find, edit, and change publication status for blog articles." actions={<Link href="/admin/blog/posts/new" className="btn-primary text-sm">Add post</Link>}>
    <AdminCard title="Filter posts">
      <form method="get" action="/admin/blog/posts" className="grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminFormGroup label="Search title or slug" htmlFor="posts-search"><input id="posts-search" name="search" defaultValue={search} maxLength={255} className={inputClass} /></AdminFormGroup>
        <AdminFormGroup label="Status" htmlFor="posts-status"><select id="posts-status" name="status" defaultValue={status} className={selectClass}><option value="">All statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></AdminFormGroup>
        <AdminFormGroup label="Category" htmlFor="posts-category"><select id="posts-category" name="categoryId" defaultValue={categoryId} className={selectClass}><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></AdminFormGroup>
        <button type="submit" className="min-h-10 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">Apply filters</button>
      </form>
    </AdminCard>
    <AdminCard title="All posts">
      {posts.length ? <ul className="divide-y divide-neutral-100">{posts.map((post) => <li key={post.id} className="flex flex-col gap-3 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0"><Link href={`/admin/blog/posts/${post.id}/edit`} className="font-semibold text-primary-800 underline hover:text-primary-600">{post.title}</Link><p className="break-all text-xs text-neutral-600">/blog/{post.slug} · {post.category_name}</p><span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${post.status === "published" ? "bg-green-50 text-green-800" : "bg-neutral-100 text-neutral-700"}`}>{post.status}</span></div>
        <div className="flex flex-wrap gap-2"><Link href={`/admin/blog/posts/${post.id}/edit`} className="inline-flex min-h-10 items-center rounded-xl border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-800 hover:bg-primary-50">Edit</Link>
          {post.status === "draft" && <StatusAction kind="posts" id={post.id} status="published" label="Publish" />}
          {post.status === "published" && <StatusAction kind="posts" id={post.id} status="draft" label="Unpublish" />}
          {post.status === "archived" ? <StatusAction kind="posts" id={post.id} status="draft" label="Restore draft" /> : <StatusAction kind="posts" id={post.id} status="archived" label="Archive" variant="danger" />}
        </div>
      </li>)}</ul> : <p className="text-sm text-neutral-700">No posts match these filters.</p>}
      <nav aria-label="Post pages" className="mt-5 flex gap-4 border-t border-neutral-100 pt-4 text-sm font-semibold">{page > 1 && <Link href={pageHref(page - 1)} className="text-primary-700 underline">Previous page</Link>}{posts.length === 20 && <Link href={pageHref(page + 1)} className="text-primary-700 underline">Next page</Link>}</nav>
    </AdminCard>
  </AdminLayout>;
}
