import ServiceDetailLayout from "@/components/shared/ServiceDetailLayout";
import { chennaiPackages } from "@/data/packages";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/chennai/srivani-vip-break-darshan");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Chennai", href: "/chennai" },
  { label: "Srivani VIP Break Darshan", href: "/chennai/srivani-vip-break-darshan" },
];

export default function ChennaiSrivaniPage() {
  return (
    <ServiceDetailLayout
      eyebrow="Chennai Departure"
      title="Srivani VIP Break Darshan Travel Assistance from Chennai"
      intro="Travelling from Chennai for Srivani VIP Break Darshan? We coordinate your transportation and accommodation around your break darshan schedule, subject to availability set by the temple authority."
      highlights={[
        "Transportation coordination from Chennai to Tirumala",
        "Accommodation coordination close to the darshan queue complex",
        "Guidance on documents and requirements to carry",
        "Coordinator support before and during your visit",
      ]}
      pkg={chennaiPackages[0]}
      breadcrumbItems={breadcrumbItems}
    />
  );
}
