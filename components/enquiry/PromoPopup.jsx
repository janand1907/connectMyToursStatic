"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { WhatsAppIcon, XMarkIcon, CheckCircleIcon, SparklesIcon } from "@/components/icons";

// Timer-based reopen behaviour — no sessionStorage/localStorage/cookies, so the
// popup keeps resurfacing for the whole visit rather than being dismissed forever.
const POPUP_INITIAL_DELAY = 6000;
const POPUP_REOPEN_INTERVAL = 60000;
const EXIT_ANIMATION_MS = 200;

const departureCities = ["Chennai", "Bangalore", "Hyderabad"];

const coordinationPoints = [
  "Transportation coordination for your journey",
  "Accommodation coordination near Tirumala",
  "Darshan queue assistance, subject to availability",
  "VIP Break Darshan coordination",
  "Dedicated coordinator on call",
  "WhatsApp support throughout",
];

export default function PromoPopup() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  function openPopup() {
    setMounted(true);
  }

  useEffect(() => {
    timerRef.current = setTimeout(openPopup, POPUP_INITIAL_DELAY);
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (!mounted) return undefined;
    const raf = requestAnimationFrame(() => setVisible(true));
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  function close() {
    setVisible(false);
    timerRef.current = setTimeout(() => {
      setMounted(false);
      timerRef.current = setTimeout(openPopup, POPUP_REOPEN_INTERVAL);
    }, EXIT_ANIMATION_MS);
  }

  function handlePlanTrip(event) {
    event.preventDefault();
    close();
    const target = document.getElementById("enquiry");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.href = "/#enquiry";
    }
  }

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-primary-900/60 p-4 backdrop-blur-sm transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-popup-heading"
      onClick={close}
    >
      <div
        className={`relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-3xl bg-white shadow-modal transition-all duration-200 sm:max-w-md ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close popup"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary-900 shadow-soft transition hover:bg-white"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="relative aspect-[16/9] w-full">
          <Image
            src="/images/hero-temple.jpg"
            alt="Sri Venkateswara Temple gopuram at Tirumala"
            fill
            sizes="(min-width: 640px) 448px, 100vw"
            className="object-cover"
            priority={false}
          />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-center gap-2">
            <Image src="/logo.svg" alt="Connect My Tours logo" width={120} height={42} className="h-6 w-auto" />
            <span className="text-primary-200" aria-hidden="true">
              •
            </span>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
              Independent Pilgrimage Assistance
            </p>
          </div>

          <h2
            id="promo-popup-heading"
            className="mt-3 text-center font-display text-2xl font-bold text-primary-900 sm:text-3xl"
          >
            Get Free Tirupati Travel Assistance
          </h2>

          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white">
              <SparklesIcon className="h-4 w-4" />
              Multi-City Departures • Dedicated Coordinator Support
            </span>
          </div>

          <div className="mt-6 rounded-2xl bg-primary-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-primary-700">
              Plan Your Tirupati Pilgrimage From
            </p>
            <ul className="mt-3 space-y-2">
              {departureCities.map((city) => (
                <li key={city} className="flex items-start gap-2 text-sm text-neutral-700">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                  <span>Tirupati travel packages from {city}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 rounded-2xl bg-neutral-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">What We Help Coordinate</p>
            <ul className="mt-3 space-y-2">
              {coordinationPoints.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-neutral-700">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-5 text-center text-sm italic text-neutral-500">
            Clarity, coordination, and peace of mind — every step of your pilgrimage.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <a href="#enquiry" onClick={handlePlanTrip} className="btn-primary w-full">
              Plan My Trip
            </a>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappDefaultMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="btn-whatsapp w-full"
            >
              <WhatsAppIcon className="h-5 w-5" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
