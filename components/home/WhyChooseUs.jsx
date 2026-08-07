const reasons = [
  {
    title: "Independent & Transparent",
    description:
      "We are a private travel agency, not affiliated with TTD or any government body. We're upfront about what we do and don't control.",
  },
  {
    title: "Dedicated Coordinators",
    description:
      "Every enquiry is followed up by a real travel coordinator who calls you back to understand your needs before anything is confirmed.",
  },
  {
    title: "Multi-City Departure Support",
    description:
      "Travel assistance for pilgrims departing from Chennai, Bangalore, and Hyderabad, plus local support within Tirupati.",
  },
  {
    title: "Coordination, Not Guesswork",
    description:
      "We coordinate transportation and accommodation with third-party providers so you have fewer logistics to manage yourself.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="container-page py-14">
      <h2 className="section-heading text-center">Why Travellers Choose Us</h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((reason) => (
          <div key={reason.title} className="card p-6">
            <h3 className="font-display text-lg font-semibold text-primary-800">{reason.title}</h3>
            <p className="mt-2 text-sm text-neutral-600">{reason.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
