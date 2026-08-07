import {
  ShieldCheckIcon,
  HeadsetIcon,
  MapPinIcon,
  RouteIcon,
  CarIcon,
  BusIcon,
  TrainIcon,
  PlaneIcon,
  HotelIcon,
  ClockIcon,
  CompassIcon,
  BackpackIcon,
  LightBulbIcon,
  CheckCircleIcon,
  SparklesIcon,
  UsersIcon,
} from "@/components/icons";

export const hyderabadCity = {
  slug: "hyderabad",
  name: "Hyderabad",
  hero: {
    eyebrow: "Departing from Hyderabad",
    title: "Tirupati Tour Package from Hyderabad",
    description:
      "Independent travel assistance for pilgrims heading to Tirumala from Hyderabad — coordinated transportation, accommodation, and darshan queue assistance, subject to availability and TTD's own processes.",
    image: "/images/maha-dwaram.jpg",
    imageAlt: "Maha Dwaram entrance near Tirumala temple",
    badges: ["Approx. 555 km from Hyderabad", "Dedicated coordinator", "WhatsApp support"],
  },
  whyChooseUs: {
    heading: "Why Choose Connect My Tours",
    subheading:
      "Straightforward, honest coordination for pilgrims travelling from Hyderabad — no inflated promises, just real support.",
    items: [
      {
        icon: ShieldCheckIcon,
        title: "Transparent & Independent",
        description:
          "We're a privately operated travel agency, not affiliated with TTD or any government body — we're upfront about what we do and don't control.",
      },
      {
        icon: HeadsetIcon,
        title: "Dedicated Coordinators",
        description:
          "Every enquiry from Hyderabad is followed up by a real coordinator who calls back to understand your plans before anything is confirmed.",
      },
      {
        icon: MapPinIcon,
        title: "NRI & Overseas Support",
        description:
          "English-speaking coordinator support and airport transfer coordination, tailored to overseas travellers flying via Hyderabad.",
      },
      {
        icon: RouteIcon,
        title: "Coordination, Not Guesswork",
        description:
          "We coordinate transportation, accommodation, and third-party providers so there's less logistics for you to manage yourself.",
      },
    ],
  },
  comparisonRows: [
    {
      name: "Srivani VIP Break Darshan",
      duration: "2 Days / 1 Night",
      darshanAssistance: "Break darshan queue assistance*",
      bestFor: "Pilgrims seeking a shorter queue wait",
      price: "On Request",
    },
    {
      name: "NRI Darshan Package",
      duration: "2 Days / 1 Night",
      darshanAssistance: "NRI-quota darshan assistance*",
      bestFor: "Overseas & NRI travellers on a schedule",
      price: "On Request",
    },
    {
      name: "Custom Multi-Day Itinerary",
      duration: "Flexible",
      darshanAssistance: "Standard queue assistance*",
      bestFor: "Families wanting a relaxed, extended trip",
      price: "On Request",
    },
  ],
  included: [
    "Round-trip transportation coordination from Hyderabad",
    "Airport pickup and drop coordination for flight travellers",
    "Accommodation coordination near Tirumala",
    "Darshan queue assistance, subject to availability",
    "Dedicated travel coordinator on call throughout your trip",
    "English-speaking coordinator support for NRI and overseas pilgrims",
  ],
  excluded: [
    "Darshan tickets themselves — issued solely by TTD as per their process",
    "Personal shopping, donations, or temple offerings",
    "Meals not explicitly listed in your confirmed itinerary",
    "Travel insurance (can be arranged separately on request)",
    "Any charges arising from personal delays or missed flight connections",
  ],
  travelOptions: {
    heading: "Travel Options from Hyderabad to Tirupati",
    subheading:
      "Approximate distance is about 555 km — given the distance, flying is usually the most practical option from Hyderabad.",
    items: [
      {
        icon: PlaneIcon,
        title: "By Flight",
        description: "The fastest option — around 1 hour 20 minutes, subject to airline schedules.",
        bullets: ["Recommended for time-constrained travellers", "Ideal for NRI and overseas pilgrims", "Airport transfer coordination available"],
      },
      {
        icon: TrainIcon,
        title: "By Train",
        description: "Several trains connect Hyderabad to Tirupati, typically an overnight journey of 11–13 hours.",
        bullets: ["Comfortable overnight option", "Sleeper and AC classes available", "Advance booking strongly recommended"],
      },
      {
        icon: BusIcon,
        title: "By Bus",
        description: "Overnight sleeper buses run between Hyderabad and Tirupati, roughly 10–11 hours.",
        bullets: ["Budget-friendly overnight travel", "Multiple private operators", "Good for travellers avoiding flights"],
      },
      {
        icon: CarIcon,
        title: "By Car",
        description: "A long drive of roughly 9–10 hours via Kurnool/Kadapa — best split with a rest stop.",
        bullets: ["Suited for those who prefer their own vehicle", "Flexible stops en route", "Coordinated pickup from your Hyderabad location"],
      },
    ],
  },
  journeyTimeline: {
    heading: "Journey Timeline from Hyderabad",
    steps: [
      { time: "Day 1 · Morning", title: "Depart / Fly from Hyderabad", description: "Start your journey by flight, overnight train, or bus toward Tirupati." },
      { time: "Day 1 · Afternoon", title: "Reach Tirumala / Tirupati", description: "Check in to your coordinated accommodation and rest before darshan." },
      { time: "Day 1 · Evening", title: "Darshan Queue Process", description: "Proceed for darshan as per your slot and TTD's queue process, subject to availability." },
      { time: "Day 2 · Morning", title: "Local Sightseeing (Optional)", description: "Optionally visit nearby temples and attractions with local transportation coordination." },
      { time: "Day 2 · Afternoon", title: "Return to Hyderabad", description: "Begin your return journey with transportation coordinated in advance." },
    ],
  },
  darshanInfo: {
    standard: {
      title: "Standard Darshan Information",
      description:
        "General darshan access follows TTD's own queue system and token/slot process, which can vary by season and demand.",
      points: [
        "Queue timing varies by day and season",
        "TTD's own counters and online systems govern token allocation",
        "We assist with coordination and guidance, not ticket issuance",
      ],
    },
    vip: {
      title: "Srivani VIP Break Darshan Information",
      description:
        "The Srivani Trust scheme is a TTD-run initiative that can offer a shorter queue wait, subject to eligibility and availability set by TTD.",
      points: [
        "Eligibility and slots are entirely controlled by TTD",
        "We help coordinate travel and accommodation around your scheduled slot",
        "Not a guarantee of darshan — always subject to TTD's process",
      ],
    },
  },
  accommodation: {
    heading: "Accommodation Assistance",
    subheading: "We help coordinate a comfortable stay near Tirumala so you're not left arranging it last-minute.",
    items: [
      { icon: HotelIcon, title: "Hotel Coordination", description: "Coordination with hotels near Tirumala and Tirupati across a range of budgets." },
      { icon: ClockIcon, title: "Timed to Your Darshan Slot", description: "Stay arrangements timed around your travel and darshan schedule where possible." },
      { icon: UsersIcon, title: "Family & Group Friendly", description: "Options coordinated for solo pilgrims, families, and larger groups travelling together." },
    ],
  },
  faqs: [
    {
      question: "How far is Tirupati from Hyderabad?",
      answer:
        "Tirupati is approximately 555 km from Hyderabad by road. Given the distance, most pilgrims choose to fly (around 1 hour 20 minutes) or take an overnight train or bus.",
    },
    {
      question: "What is the fastest way to reach Tirupati from Hyderabad?",
      answer:
        "Flying is the fastest option from Hyderabad, taking roughly 1 hour 20 minutes, subject to airline schedules. We can help coordinate airport transfers on arrival.",
    },
    {
      question: "Does Connect My Tours book darshan tickets from Hyderabad?",
      answer:
        "No. Darshan tickets and slots are issued solely by TTD through their own systems. We assist with travel coordination and general guidance around your visit, subject to TTD's availability and process.",
    },
    {
      question: "Do you support NRI and overseas travellers flying into Hyderabad?",
      answer:
        "Yes. Our NRI Darshan Package is designed around international flight schedules, with airport transfer coordination and English-speaking coordinator support throughout the journey.",
    },
    {
      question: "Is Connect My Tours affiliated with TTD?",
      answer:
        "No. We are an independently owned and privately operated travel agency, not affiliated with, endorsed by, or officially connected with TTD or any government body.",
    },
    {
      question: "Can you arrange group travel from Hyderabad?",
      answer:
        "Yes, we coordinate travel for families and larger groups departing from Hyderabad, including shared transportation and group accommodation coordination.",
    },
  ],
  testimonials: [
    {
      name: "Verified Traveler",
      location: "Hyderabad",
      quote: "Placeholder quote — replace with a real, verifiable customer review from a Hyderabad traveller before launch.",
    },
    {
      name: "Verified Traveler",
      location: "Hyderabad",
      quote: "Placeholder quote — replace with a real, verifiable customer review from a Hyderabad traveller before launch.",
    },
    {
      name: "Verified Traveler",
      location: "Hyderabad",
      quote: "Placeholder quote — replace with a real, verifiable customer review from a Hyderabad traveller before launch.",
    },
  ],
  whyBookWithUs: {
    heading: "Why Book With Us",
    subheading: "A no-pressure, coordinator-led process built around your schedule from Hyderabad.",
    items: [
      { icon: CheckCircleIcon, title: "No-Obligation Enquiry", description: "Submitting an enquiry doesn't commit you to booking anything." },
      { icon: HeadsetIcon, title: "Real Coordinator Callback", description: "A dedicated coordinator calls you back to discuss your specific needs." },
      { icon: SparklesIcon, title: "Honest Communication", description: "We're upfront about what's included, what's not, and what's subject to TTD's process." },
      { icon: RouteIcon, title: "End-to-End Coordination", description: "From flight transfers to stay, we coordinate the moving pieces so you don't have to." },
    ],
  },
  travelTips: {
    heading: "Important Travel Tips",
    subheading: "A few pointers to help your journey from Hyderabad go smoothly.",
    items: [
      { icon: ClockIcon, title: "Book Flights Early", description: "Flight fares and seat availability tighten closer to weekends and festival dates." },
      { icon: BackpackIcon, title: "Carry ID Proof", description: "Keep a valid photo ID handy — it's required at various checkpoints and for darshan queues." },
      { icon: LightBulbIcon, title: "Check Weather", description: "Tirumala's hill weather can differ from Hyderabad's — pack accordingly." },
      { icon: UsersIcon, title: "Elderly & Children", description: "Let your coordinator know in advance if you're travelling with elderly members or young children." },
    ],
  },
  thingsToCarry: {
    heading: "Things to Carry",
    subheading: "A general checklist for your Tirupati trip from Hyderabad.",
    items: [
      { icon: BackpackIcon, title: "Valid Photo ID / Passport", description: "Government-issued ID for verification, and passport for NRI travellers." },
      { icon: BackpackIcon, title: "Comfortable Footwear", description: "For walking and standing during queues and temple visits." },
      { icon: BackpackIcon, title: "Light Woollens", description: "Tirumala can get cool, especially in the evenings and early mornings." },
      { icon: BackpackIcon, title: "Traditional Attire", description: "Follow TTD's prescribed dress code for darshan." },
      { icon: BackpackIcon, title: "Water & Snacks", description: "Useful during layovers and waiting periods." },
      { icon: BackpackIcon, title: "Printed Confirmations", description: "Flight tickets, booking confirmations, and coordinator communication, printed or saved offline." },
    ],
  },
  nearbyAttractions: {
    heading: "Nearby Attractions",
    subheading: "If time permits, these nearby places are worth considering as part of your trip.",
    items: [
      { icon: CompassIcon, title: "Srikalahasti Temple", description: "A significant Shiva temple roughly 35–40 km from Tirupati, known for its Vayu Linga." },
      { icon: CompassIcon, title: "Kanipakam Vinayaka Temple", description: "A well-known Ganesha temple around 70 km from Tirupati." },
      { icon: CompassIcon, title: "Chandragiri Fort", description: "A historic fort with palaces, located close to Tirupati town." },
      { icon: CompassIcon, title: "ISKCON Tirupati", description: "A peaceful Krishna temple within Tirupati town, worth a short visit." },
    ],
  },
  ourProcess: [
    { title: "Choose Package", description: "Browse packages for departures from Hyderabad and pick what fits your plans." },
    { title: "Submit Enquiry", description: "Share your travel dates and details through our form or WhatsApp." },
    { title: "Coordinator Calls", description: "A coordinator calls you back to confirm details and answer questions." },
    { title: "Confirm Plan", description: "Review the coordinated travel plan and confirm it with your coordinator." },
    { title: "Travel from Hyderabad", description: "Begin your pilgrimage with transportation and support arranged in advance." },
  ],
  enquiry: {
    subtitle:
      "Share your travel dates and we'll help coordinate flights or overnight travel, accommodation, and darshan queue assistance for your trip from Hyderabad.",
  },
  crossLinks: [
    { label: "Home", href: "/" },
    { label: "Tirupati Package Chennai", href: "/chennai" },
    { label: "Tirupati Package Bangalore", href: "/bangalore" },
    { label: "Local Travel Assistance in Tirupati", href: "/tirupati" },
    { label: "Frequently Asked Questions", href: "/faq" },
    { label: "Contact Our Coordinators", href: "/contact-us" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ],
};
