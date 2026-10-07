"use client";

import { usePathname } from "next/navigation";
import PromoPopup from "@/components/enquiry/PromoPopup";

export default function PromoPopupGate() {
  const pathname = usePathname();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return null;
  }

  return <PromoPopup />;
}
