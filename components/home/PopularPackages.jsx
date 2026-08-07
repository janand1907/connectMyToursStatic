import { homePackages } from "@/data/packages";
import PackageCard from "@/components/shared/PackageCard";

export default function PopularPackages() {
  return (
    <section id="packages" className="bg-neutral-50 py-14">
      <div className="container-page">
        <h2 className="section-heading text-center">Popular Travel Packages</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-600">
          A sample of the travel assistance packages our coordinators help arrange most often.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {homePackages.map((pkg) => (
            <PackageCard key={pkg.slug} {...pkg} />
          ))}
        </div>
      </div>
    </section>
  );
}
