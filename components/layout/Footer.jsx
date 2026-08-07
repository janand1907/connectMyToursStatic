import Link from "next/link";
import { footerLinks, destinationLinks } from "@/data/nav";
import { siteConfig } from "@/config/site";
import { footerDisclaimer } from "@/data/legal";

export default function Footer() {
  return (
    <footer className="mt-16 bg-primary-900 text-white">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <h3 className="font-display text-lg font-semibold">About</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            Connect My Tours is an independently owned and operated travel agency assisting
            pilgrims with Tirupati travel planning. We are not affiliated with, endorsed by, or
            officially connected with TTD or any government body.
          </p>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            {footerLinks.quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold">Popular Destinations</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            {destinationLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold">Support</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            {footerLinks.support.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>
              Phone:{" "}
              <a href={`tel:${siteConfig.phone}`} className="hover:text-white">
                {siteConfig.phoneDisplay}
              </a>
            </li>
            <li>
              WhatsApp:{" "}
              <a
                href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappDefaultMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                Chat with us
              </a>
            </li>
            <li>
              Email:{" "}
              <a href={`mailto:${siteConfig.email}`} className="hover:text-white">
                {siteConfig.email}
              </a>
            </li>
            <li>{siteConfig.officeHours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="container-page pt-6 text-xs leading-relaxed text-white/70">
          {footerDisclaimer}
        </p>
        <p className="container-page pb-6 pt-3 text-[11px] leading-relaxed text-white/50">
          Temple photography via Wikimedia Commons — Adityamadhav83, Nikhilb239, eclicks_by_bunny,
          and Chandrashekhar Basumatary (CC BY-SA / CC BY); Bhaskaranaidu and Vimalkalyan (public
          domain). Images are unmodified in content, cropped only for display.
        </p>
      </div>
    </footer>
  );
}
