import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin";
import { getDashboardData } from "@/lib/blog/admin-data";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminCard from "@/components/admin/AdminCard";

export const metadata = { title: "Blog overview | Connect My Tours" };

const quickLinks = [
  ["Add new post", "/admin/blog/posts/new"], ["All posts", "/admin/blog/posts"],
  ["Add category", "/admin/blog/categories/new"], ["All categories", "/admin/blog/categories"],
];

export default async function BlogDashboardPage() {
  const user = await requireAdminPage();
  const data = await getDashboardData();
  const stats = [
    ["Total posts", data.totalPosts], ["Draft posts", data.draftPosts], ["Published posts", data.publishedPosts],
    ["Archived posts", data.archivedPosts], ["Categories", data.totalCategories],
  ];
  return <AdminLayout user={user} title="Blog overview" description="Manage travel articles and categories for Connect My Tours.">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{stats.map(([label, count]) => <div key={label} className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-soft"><p className="text-sm font-semibold text-primary-700">{label}</p><p className="mt-2 font-display text-3xl font-bold text-primary-900">{count}</p></div>)}</div>
    <AdminCard title="Quick links"><div className="grid gap-3 sm:grid-cols-2">{quickLinks.map(([label, href]) => <Link key={href} href={href} className="rounded-xl border border-primary-100 px-4 py-3 text-sm font-semibold text-primary-800 hover:bg-primary-50">{label} →</Link>)}</div></AdminCard>
    <AdminCard title="Recent activity"><ul className="divide-y divide-neutral-100">{data.activity.length ? data.activity.map((item, index) => <li key={`${item.entity_id}-${index}`} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span><strong className="text-primary-900">{item.actor_name || "Former admin"}</strong> {item.action.replace(/[._]/g, " ")}</span><time dateTime={new Date(item.created_at).toISOString()} className="text-neutral-600">{new Date(item.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}</time></li>) : <li className="py-3 text-sm text-neutral-600">No activity yet.</li>}</ul></AdminCard>
  </AdminLayout>;
}
