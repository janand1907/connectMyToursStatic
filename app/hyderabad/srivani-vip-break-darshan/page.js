import ServiceDetailLayout from "@/components/shared/ServiceDetailLayout";
import { hyderabadPackages } from "@/data/packages";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/hyderabad/srivani-vip-break-darshan");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Hyderabad", href: "/hyderabad" },
  { label: "Srivani VIP Break Darshan", href: "/hyderabad/srivani-vip-break-darshan" },
];

export default function HyderabadSrivaniPage() {
  return (
    <ServiceDetailLayout
      eyebrow="Hyderabad Departure"
      title="Srivani VIP Break Darshan Travel Assistance from Hyderabad"
      intro="Travelling from Hyderabad for Srivani VIP Break Darshan? We coordinate your transportation and accommodation around your break darshan schedule, subject to availability set by the temple authority."
      highlights={[
        "Transportation coordination from Hyderabad to Tirumala",
        "Accommodation coordination close to the darshan queue complex",
        "Guidance on documents and requirements to carry",
        "Coordinator support before and during your visit",
      ]}
      pkg={hyderabadPackages[0]}
      breadcrumbItems={breadcrumbItems}
    />
  );
}
