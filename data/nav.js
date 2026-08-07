export const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "Chennai",
    href: "/chennai",
    children: [
      { label: "Srivani VIP Break Darshan", href: "/chennai/srivani-vip-break-darshan" },
      { label: "NRI Darshan Package", href: "/chennai/nri-darshan-package" },
    ],
  },
  { label: "Bangalore", href: "/bangalore" },
  {
    label: "Hyderabad",
    href: "/hyderabad",
    children: [
      { label: "Srivani VIP Break Darshan", href: "/hyderabad/srivani-vip-break-darshan" },
      { label: "NRI Darshan Package", href: "/hyderabad/nri-darshan-package" },
    ],
  },
  { label: "Tirupati", href: "/tirupati" },
];

export const destinationLinks = [
  { label: "Tirupati Package Chennai", href: "/chennai" },
  { label: "Tirupati Package Bangalore", href: "/bangalore" },
  { label: "Tirupati Package Hyderabad", href: "/hyderabad" },
  { label: "Local Travel in Tirupati", href: "/tirupati" },
];

export const footerLinks = {
  quickLinks: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Cancellation & Refund Policy", href: "/cancellation-refund-policy" },
    { label: "Disclaimer", href: "/disclaimer" },
  ],
  support: [
    { label: "FAQ", href: "/faq" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Contact Us", href: "/contact-us" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ],
};
