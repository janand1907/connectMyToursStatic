import Breadcrumbs from "@/components/shared/Breadcrumbs";
import ItineraryPlanner from "@/components/shared/ItineraryPlanner";
import ContactCTA from "@/components/home/ContactCTA";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/itinerary-planner");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Itinerary Planner", href: "/itinerary-planner" },
];

export default function ItineraryPlannerPage() {
  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />

      <section className="bg-gradient-to-b from-primary-50 via-white to-white py-14 md:py-20">
        <div className="container-page max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Plan Your Trip</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-primary-900 sm:text-5xl">
            Itinerary Planner
          </h1>
          <p className="mt-4 text-neutral-600">
            Add any city in India as a stop, set nights at each, and see a day-by-day plan and route map
            instantly — then send it to a coordinator to confirm hotels, transfers and dates.
          </p>
        </div>
      </section>

      <ItineraryPlanner />

      <ContactCTA
        heading="Ready to Confirm Your Trip?"
        description="Share your planned itinerary with a travel coordinator and get hotel, transfer and pricing details tailored to your dates."
        whatsappMessage="Hello, I've put together an itinerary and would like help confirming it."
      />
    </>
  );
}
