export default function AdminCard({ title, description, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-neutral-100 bg-white p-5 shadow-soft sm:p-6 ${className}`}>
      {title && <h2 className="font-display text-xl font-bold text-primary-800">{title}</h2>}
      {description && <p className="mt-1 text-sm text-neutral-700">{description}</p>}
      <div className={title || description ? "mt-5" : ""}>{children}</div>
    </section>
  );
}
