import ServiceDetailLayout from "@/components/shared/ServiceDetailLayout";
import { hyderabadPackages } from "@/data/packages";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/hyderabad/nri-darshan-package");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Hyderabad", href: "/hyderabad" },
  { label: "NRI Darshan Package", href: "/hyderabad/nri-darshan-package" },
];

export default function HyderabadNriPage() {
  return (
    <ServiceDetailLayout
      eyebrow="Hyderabad Departure"
      title="NRI Darshan Travel Package from Hyderabad"
      intro="Flying into Hyderabad from abroad for a Tirupati visit? Our NRI Darshan travel package is built around international flight schedules, with airport transfer coordination and support throughout your trip."
      highlights={[
        "Airport pickup and drop coordination in Hyderabad",
        "Darshan queue assistance, subject to availability",
        "Flexible scheduling around connecting flights",
        "English-speaking travel coordinator support",
      ]}
      pkg={hyderabadPackages[1]}
      breadcrumbItems={breadcrumbItems}
    />
  );
}
