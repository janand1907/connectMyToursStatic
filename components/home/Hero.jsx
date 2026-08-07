import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import HeroEnquiryForm from "@/components/home/HeroEnquiryForm";
import { CheckCircleIcon, WhatsAppIcon } from "@/components/icons";

const checklist = [
  "Chennai to Tirupati travel coordination",
  "Hyderabad to Tirupati travel coordination",
  "Bangalore to Tirupati travel coordination",
  "Airport pickup & drop coordination",
  "Hotel stay & itinerary coordination",
  "Family, senior citizen & NRI-friendly support",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/hero-temple.jpg"
          alt="Sri Venkateswara Temple, Tirumala"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 via-primary-900/85 to-primary-900/50" />
      </div>

      <div className="container-page relative grid gap-10 py-16 lg:grid-cols-3 lg:items-center lg:py-24">
        <div className="lg:col-span-2">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm">
            <CheckCircleIcon className="h-5 w-5 shrink-0 text-primary-200" />
            Independent pilgrimage travel assistance from Chennai, Bangalore &amp; Hyderabad
          </div>

          <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            Plan Your Tirupati Pilgrimage With Confidence
          </h1>

          <p className="mt-4 max-w-lg text-lg font-medium text-primary-100">
            Complete travel assistance with private car coordination, flight-based plans, hotel
            stay and trip coordination.
          </p>
          <p className="mt-2 max-w-lg text-white/80">
            Get package details, itinerary options and coordinator support on WhatsApp.
          </p>

          <div className="mt-6 rounded-2xl bg-black/25 p-5 backdrop-blur-sm">
            <p className="text-sm font-semibold text-primary-200">
              Coordination support for domestic and international (NRI) pilgrims.
            </p>
            <ul className="mt-3 grid gap-x-6 gap-y-2 text-sm text-white sm:grid-cols-2">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappDefaultMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Chat on WhatsApp
            </a>
            <Link href="/contact-us" className="btn-primary">
              Plan My Trip
            </Link>
            <Link
              href="#packages"
              className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              View Packages
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-modal sm:p-8 lg:col-span-1">
          <h2 className="font-display text-xl font-semibold text-primary-900">Quick Enquiry</h2>
          <p className="mt-1 text-sm text-neutral-500">Share your details and we&apos;ll call you back shortly.</p>
          <HeroEnquiryForm sourceLabel="home_hero" />
        </div>
      </div>
    </section>
  );
}
