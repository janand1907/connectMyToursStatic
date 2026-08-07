import Hero from "@/components/home/Hero";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import PopularPackages from "@/components/home/PopularPackages";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import FAQPreview from "@/components/home/FAQPreview";
import ContactCTA from "@/components/home/ContactCTA";
import EnquirySection from "@/components/enquiry/EnquirySection";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/");

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyChooseUs />
      <PopularPackages />
      <HowItWorks />
      <Testimonials />
      <EnquirySection sourceLabel="home_page" />
      <FAQPreview />
      <ContactCTA />
    </>
  );
}
