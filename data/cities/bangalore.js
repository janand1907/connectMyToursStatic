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

export const bangaloreCity = {
  slug: "bangalore",
  name: "Bangalore",
  hero: {
    eyebrow: "Departing from Bangalore",
    title: "Tirupati Tour Package from Bangalore",
    description:
      "Independent travel assistance for pilgrims heading to Tirumala from Bangalore — coordinated transportation, accommodation, and darshan queue assistance, subject to availability and TTD's own processes.",
    image: "/images/ghat-road.jpg",
    imageAlt: "Ghat road leading up to Tirumala hills",
    badges: ["Approx. 255 km from Bangalore", "Dedicated coordinator", "WhatsApp support"],
  },
  whyChooseUs: {
    heading: "Why Choose Connect My Tours",
    subheading:
      "Straightforward, honest coordination for pilgrims travelling from Bangalore — no inflated promises, just real support.",
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
          "Every enquiry from Bangalore is followed up by a real coordinator who calls back to understand your plans before anything is confirmed.",
      },
      {
        icon: MapPinIcon,
        title: "Bangalore Route Experience",
        description:
          "Familiar with the Bangalore–Tirumala route via Chittoor and the travel options pilgrims from Bangalore usually prefer.",
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
      name: "Tirumala Darshan Travel Assistance",
      duration: "2 Days / 1 Night",
      darshanAssistance: "Standard queue assistance*",
      bestFor: "Solo travellers and couples",
      price: "On Request",
    },
    {
      name: "Group Pilgrimage Travel Assistance",
      duration: "2 Days / 1 Night",
      darshanAssistance: "Standard queue assistance*",
      bestFor: "Families and group travellers",
      price: "On Request",
    },
    {
      name: "Custom Multi-Day Itinerary",
      duration: "Flexible",
      darshanAssistance: "Standard queue assistance*",
      bestFor: "Travellers wanting a relaxed, extended trip",
      price: "On Request",
    },
  ],
  included: [
    "Round-trip transportation coordination from Bangalore",
    "Accommodation coordination near Tirumala",
    "Darshan queue assistance, subject to availability",
    "Dedicated travel coordinator on call throughout your trip",
    "Guidance on documents and ID proofs to carry",
    "On-ground support for elderly and first-time pilgrims",
  ],
  excluded: [
    "Darshan tickets themselves — issued solely by TTD as per their process",
    "Personal shopping, donations, or temple offerings",
    "Meals not explicitly listed in your confirmed itinerary",
    "Travel insurance (can be arranged separately on request)",
    "Any charges arising from personal delays or itinerary changes",
  ],
  travelOptions: {
    heading: "Travel Options from Bangalore to Tirupati",
    subheading: "Approximate distance is about 255 km via Chittoor — here's how pilgrims from Bangalore usually travel.",
    items: [
      {
        icon: CarIcon,
        title: "By Car",
        description: "A flexible option, roughly 5 hours via NH716/Chittoor, depending on traffic.",
        bullets: ["Door-to-door convenience", "Good for families and small groups", "Coordinated pickup from your Bangalore location"],
      },
      {
        icon: BusIcon,
        title: "By Bus",
        description: "KSRTC and APSRTC buses connect Bangalore to Tirupati, roughly 5–6 hours.",
        bullets: ["Budget-friendly", "Day and overnight sleeper options", "Frequent daily departures"],
      },
      {
        icon: TrainIcon,
        title: "By Train",
        description: "Several trains run from Bangalore to Tirupati, roughly 5–6 hours depending on the service.",
        bullets: ["Comfortable for solo and group travel", "Multiple weekly departures", "Advance booking recommended"],
      },
      {
        icon: PlaneIcon,
        title: "By Flight",
        description: "Short flights connect Bangalore to Tirupati airport in around 1 hour, subject to airline schedules.",
        bullets: ["Fastest option", "Good for time-constrained travellers", "Limited daily frequency"],
      },
    ],
  },
  journeyTimeline: {
    heading: "Journey Timeline from Bangalore",
    steps: [
      { time: "Day 1 · Early Morning", title: "Depart from Bangalore", description: "Start your journey toward Tirumala by your chosen mode of transport." },
      { time: "Day 1 · Afternoon", title: "Reach Tirumala / Tirupati", description: "Check in to your coordinated accommodation and rest before darshan." },
      { time: "Day 1 · Evening", title: "Darshan Queue Process", description: "Proceed for darshan as per your slot and TTD's queue process, subject to availability." },
      { time: "Day 2 · Morning", title: "Local Sightseeing (Optional)", description: "Optionally visit nearby temples and attractions with local transportation coordination." },
      { time: "Day 2 · Afternoon", title: "Return to Bangalore", description: "Begin your return journey with transportation coordinated in advance." },
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
      question: "How far is Tirupati from Bangalore?",
      answer:
        "Tirupati is approximately 255 km from Bangalore by road via Chittoor, typically around 5 hours by car depending on traffic. Bus and train journeys usually take 5–6 hours.",
    },
    {
      question: "Can I do a one-day trip from Bangalore to Tirupati?",
      answer:
        "It's possible but tiring given the distance. Most pilgrims from Bangalore prefer an overnight stay for a more comfortable darshan experience. We can help coordinate either option.",
    },
    {
      question: "Does Connect My Tours book darshan tickets from Bangalore?",
      answer:
        "No. Darshan tickets and slots are issued solely by TTD through their own systems. We assist with travel coordination and general guidance around your visit, subject to TTD's availability and process.",
    },
    {
      question: "What is the best way to travel from Bangalore to Tirupati?",
      answer:
        "Car and bus are popular for flexibility and budget, trains suit advance-booked travellers, and flights are fastest for time-constrained pilgrims. We can help you weigh the options based on your schedule.",
    },
    {
      question: "Is Connect My Tours affiliated with TTD?",
      answer:
        "No. We are an independently owned and privately operated travel agency, not affiliated with, endorsed by, or officially connected with TTD or any government body.",
    },
    {
      question: "Can you arrange group travel from Bangalore?",
      answer:
        "Yes, we coordinate travel for families and larger groups departing from Bangalore, including shared transportation and group accommodation coordination.",
    },
  ],
  testimonials: [
    {
      name: "Verified Traveler",
      location: "Bangalore",
      quote: "Placeholder quote — replace with a real, verifiable customer review from a Bangalore traveller before launch.",
    },
    {
      name: "Verified Traveler",
      location: "Bangalore",
      quote: "Placeholder quote — replace with a real, verifiable customer review from a Bangalore traveller before launch.",
    },
    {
      name: "Verified Traveler",
      location: "Bangalore",
      quote: "Placeholder quote — replace with a real, verifiable customer review from a Bangalore traveller before launch.",
    },
  ],
  whyBookWithUs: {
    heading: "Why Book With Us",
    subheading: "A no-pressure, coordinator-led process built around your schedule from Bangalore.",
    items: [
      { icon: CheckCircleIcon, title: "No-Obligation Enquiry", description: "Submitting an enquiry doesn't commit you to booking anything." },
      { icon: HeadsetIcon, title: "Real Coordinator Callback", description: "A dedicated coordinator calls you back to discuss your specific needs." },
      { icon: SparklesIcon, title: "Honest Communication", description: "We're upfront about what's included, what's not, and what's subject to TTD's process." },
      { icon: RouteIcon, title: "End-to-End Coordination", description: "From transportation to stay, we coordinate the moving pieces so you don't have to." },
    ],
  },
  travelTips: {
    heading: "Important Travel Tips",
    subheading: "A few pointers to help your journey from Bangalore go smoothly.",
    items: [
      { icon: ClockIcon, title: "Start Early", description: "Leaving Bangalore before sunrise helps you avoid peak traffic near Chittoor." },
      { icon: BackpackIcon, title: "Carry ID Proof", description: "Keep a valid photo ID handy — it's required at various checkpoints and for darshan queues." },
      { icon: LightBulbIcon, title: "Check Weather", description: "Tirumala's hill weather can differ from Bangalore's — pack accordingly." },
      { icon: UsersIcon, title: "Elderly & Children", description: "Let your coordinator know in advance if you're travelling with elderly members or young children." },
    ],
  },
  thingsToCarry: {
    heading: "Things to Carry",
    subheading: "A general checklist for your Tirupati trip from Bangalore.",
    items: [
      { icon: BackpackIcon, title: "Valid Photo ID", description: "Aadhaar, passport, or other government-issued ID for verification." },
      { icon: BackpackIcon, title: "Comfortable Footwear", description: "For walking and standing during queues and temple visits." },
      { icon: BackpackIcon, title: "Light Woollens", description: "Tirumala can get cool, especially in the evenings and early mornings." },
      { icon: BackpackIcon, title: "Traditional Attire", description: "Follow TTD's prescribed dress code for darshan." },
      { icon: BackpackIcon, title: "Water & Snacks", description: "Useful for the road journey and waiting periods." },
      { icon: BackpackIcon, title: "Printed Confirmations", description: "Any booking confirmations or coordinator communication, printed or saved offline." },
    ],
  },
  nearbyAttractions: {
    heading: "Nearby Attractions",
    subheading: "If time permits, these nearby places are worth considering as part of your trip.",
    items: [
      { icon: CompassIcon, title: "Srikalahasti Temple", description: "A significant Shiva temple roughly 35–40 km from Tirupati, known for its Vayu Linga." },
      { icon: CompassIcon, title: "Kanipakam Vinayaka Temple", description: "A well-known Ganesha temple around 70 km from Tirupati, en route from Bangalore." },
      { icon: CompassIcon, title: "Chandragiri Fort", description: "A historic fort with palaces, located close to Tirupati town." },
      { icon: CompassIcon, title: "Horsley Hills", description: "A hill station in Chittoor district, a possible detour for nature lovers." },
    ],
  },
  ourProcess: [
    { title: "Choose Package", description: "Browse packages for departures from Bangalore and pick what fits your plans." },
    { title: "Submit Enquiry", description: "Share your travel dates and details through our form or WhatsApp." },
    { title: "Coordinator Calls", description: "A coordinator calls you back to confirm details and answer questions." },
    { title: "Confirm Plan", description: "Review the coordinated travel plan and confirm it with your coordinator." },
    { title: "Travel from Bangalore", description: "Begin your pilgrimage with transportation and support arranged in advance." },
  ],
  enquiry: {
    subtitle:
      "Share your travel dates and we'll help coordinate transportation, accommodation, and darshan queue assistance for your trip from Bangalore.",
  },
  crossLinks: [
    { label: "Home", href: "/" },
    { label: "Tirupati Package Chennai", href: "/chennai" },
    { label: "Tirupati Package Hyderabad", href: "/hyderabad" },
    { label: "Local Travel Assistance in Tirupati", href: "/tirupati" },
    { label: "Frequently Asked Questions", href: "/faq" },
    { label: "Contact Our Coordinators", href: "/contact-us" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ],
};
