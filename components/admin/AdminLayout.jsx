import Link from "next/link";

const links = [
  { href: "/admin/blog", label: "Overview" },
  { href: "/admin/blog/posts", label: "Posts" },
  { href: "/admin/blog/categories", label: "Categories" },
];

export default function AdminLayout({ user, title, description, actions, children }) {
  return (
    <div className="container-page pb-16 pt-28 sm:pt-32">
      <div className="mb-6 flex flex-col gap-4 border-b border-neutral-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary-600">Blog administration</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-primary-900 sm:text-4xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-sm text-neutral-700">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="Blog admin" className="flex gap-2 overflow-x-auto rounded-2xl border border-neutral-100 bg-white p-2 shadow-soft lg:flex-col">
            {links.map((link) => <Link key={link.href} href={link.href} className="whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-800 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">{link.label}</Link>)}
          </nav>
          <div className="mt-4 rounded-xl bg-primary-50 p-4 text-sm text-primary-900">
            <p className="font-semibold">{user.name}</p>
            <p className="capitalize text-primary-700">{user.role}</p>
            <Link href="/admin/logout" className="mt-3 inline-block font-semibold underline hover:text-primary-600">Sign out</Link>
          </div>
        </aside>
        <div className="min-w-0 space-y-6">{children}</div>
      </div>
    </div>
  );
}
