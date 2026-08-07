export default function CityTestimonialsSection({ testimonials = [] }) {
  return (
    <section className="bg-neutral-50 py-14">
      <div className="container-page">
        <h2 className="section-heading text-center">What Travellers Say</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote key={t.name} className="card p-6">
              <p className="text-sm italic text-neutral-600">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-4 text-sm font-semibold text-primary-800">
                {t.name} <span className="font-normal text-neutral-500">&middot; {t.location}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
