import ServiceDetailLayout from "@/components/shared/ServiceDetailLayout";
import { chennaiPackages } from "@/data/packages";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/chennai/nri-darshan-package");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Chennai", href: "/chennai" },
  { label: "NRI Darshan Package", href: "/chennai/nri-darshan-package" },
];

export default function ChennaiNriPage() {
  return (
    <ServiceDetailLayout
      eyebrow="Chennai Departure"
      title="NRI Darshan Travel Package from Chennai"
      intro="Flying into Chennai from abroad for a Tirupati visit? Our NRI Darshan travel package is built around international flight schedules, with airport transfer coordination and support throughout your trip."
      highlights={[
        "Airport pickup and drop coordination in Chennai",
        "Darshan queue assistance, subject to availability",
        "Flexible scheduling around connecting flights",
        "English-speaking travel coordinator support",
      ]}
      pkg={chennaiPackages[1]}
      breadcrumbItems={breadcrumbItems}
    />
  );
}
