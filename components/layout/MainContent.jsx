"use client";

import { usePathname } from "next/navigation";

export default function MainContent({ children }) {
  const pathname = usePathname();
  return <main id="main-content" className={pathname === "/" ? "" : "pt-16"}>{children}</main>;
}
