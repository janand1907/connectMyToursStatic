import Link from "next/link";
import { CarIcon, PlaneIcon } from "@/components/icons";

const cities = [
  {
    name: "Chennai",
    href: "/chennai",
    distance: "~135 km",
    mode: "Car",
    icon: CarIcon,
    duration: "About 3 hours by road via NH716 — the shortest of our three departure routes.",
  },
  {
    name: "Bangalore",
    href: "/bangalore",
    distance: "~255 km",
    mode: "Car",
    icon: CarIcon,
    duration: "About 5 hours via Chittoor, with train and bus options also available.",
  },
  {
    name: "Hyderabad",
    href: "/hyderabad",
    distance: "~555 km",
    mode: "Flight",
    icon: PlaneIcon,
    duration: "Around 1 hour 20 minutes by air — the most practical option over this distance.",
  },
];

export default function TravelInformation() {
  return (
    <section className="bg-neutral-50 py-14">
      <div className="container-page">
        <h2 className="section-heading text-center">Travel Options From Your City</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
          A quick look at how pilgrims typically reach Tirumala from each of our departure cities.
          Full route, vehicle, and duration details are on each city page.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {cities.map((city) => {
            const Icon = city.icon;
            return (
              <div key={city.name} className="card p-6">
                <Icon className="h-8 w-8 text-primary-500" />
                <h3 className="mt-4 font-display text-lg font-semibold text-primary-800">
                  {city.name} to Tirupati
                </h3>
                <p className="mt-1 text-sm font-medium text-primary-600">
                  {city.distance} · Recommended: {city.mode}
                </p>
                <p className="mt-2 text-sm text-neutral-600">{city.duration}</p>
                <Link
                  href={city.href}
                  className="mt-4 inline-block text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  View travel options from {city.name} →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
