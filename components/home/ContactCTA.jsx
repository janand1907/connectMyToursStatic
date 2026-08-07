import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function ContactCTA() {
  return (
    <section className="bg-white py-14">
      <div className="container-page flex flex-col items-center gap-4 text-center">
        <h2 className="font-display text-3xl font-bold text-primary-900 sm:text-4xl">Ready to Plan Your Pilgrimage?</h2>
        <p className="max-w-xl text-neutral-600">
          Talk to a travel coordinator today and get travel assistance tailored to your departure
          city and schedule.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link href="/contact-us" className="btn-primary">
            Contact Us
          </Link>
          <a
            href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappDefaultMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
