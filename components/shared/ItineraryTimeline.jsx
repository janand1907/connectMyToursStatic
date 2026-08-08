export default function ItineraryTimeline({ heading, days = [] }) {
  return (
    <section className="container-page py-14">
      <h2 className="section-heading text-center">{heading}</h2>
      <div className="mx-auto mt-10 max-w-2xl space-y-10">
        {days.map((day) => (
          <div key={day.label}>
            <p className="text-sm font-semibold uppercase tracking-wide text-secondary-600">{day.label}</p>
            <ol className="mt-4 space-y-6 border-l-2 border-secondary-100 pl-6">
              {day.items.map((item, index) => (
                <li key={item.title} className="relative">
                  <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-secondary-500 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <h3 className="font-display text-base font-semibold text-primary-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600">{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
