import RameshwaramLanding from "@/components/rameshwaram/RameshwaramLanding";
import { JsonLd, breadcrumbSchema, faqSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/rameshwaram-tour-packages", { image: "/images/rameshwaram/ramanathaswamy-temple.jpg" });

const faqData = [
  { question: "How can I book a Rameshwaram tour package?", answer: "Send an enquiry with your dates and pickup point. A coordinator will share an itinerary, vehicle options and a quotation before you confirm." },
  { question: "Can I book a one-day Rameshwaram trip from Madurai?", answer: "Yes. A same-day Madurai–Rameshwaram–Madurai trip can be planned around your pickup time and the places you wish to cover." },
  { question: "Is pickup available from Madurai Airport?", answer: "Yes, Madurai Airport pickup can be requested. Share your arrival time so the route can be planned sensibly." },
  { question: "Can I customise my itinerary?", answer: "Yes. Stops, overnight locations, pickup city and airport drop can be adapted for your group." },
  { question: "Are temple darshan tickets included?", answer: "Temple entry and darshan tickets are not assumed. Any applicable arrangements depend on current temple rules and are stated in the quote." },
];

export default function RameshwaramTourPackagesPage() {
  return <><JsonLd data={breadcrumbSchema([{ label: "Home", href: "/" }, { label: "Rameshwaram Tour Packages", href: "/rameshwaram-tour-packages" }])} /><JsonLd data={faqSchema(faqData)} /><JsonLd data={{ "@context": "https://schema.org", "@type": "TouristTrip", name: "Rameshwaram Tour Packages", url: "https://www.connectmytours.com/rameshwaram-tour-packages", description: "Private cab and custom pilgrimage tour planning for Rameshwaram and South India.", provider: { "@type": "TravelAgency", name: "Connect My Tours", url: "https://www.connectmytours.com" } }} /><RameshwaramLanding /></>;
}
