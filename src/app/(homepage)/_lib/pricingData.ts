export type BillingCycle = "monthly" | "yearly";
export type CtaVariant = "outline" | "filled";
export type PricingVariant = "starter" | "popular" | "enterprise";

export type PricingFeature = {
  text: string;
  enabled: boolean;
};

export type PricingCardData = {
  key: string;
  title: string;
  description: string;
  amount: string;
  periodLabel?: string;
  footnote?: string;
  features: PricingFeature[];
  ctaText: string;
  ctaHref?: string;
  ctaVariant: CtaVariant;
  variant: PricingVariant;
  badgeText?: string;
};

const monthlyCards: PricingCardData[] = [
  {
    key: "starter",
    title: "Starter",
    description: "Best for small classes and educators starting with Zedu.",
    amount: "₦0",
    periodLabel: "/month",
    footnote: "Free forever, no card needed",
    features: [
      { text: "Up to 3 cohorts", enabled: true },
      { text: "Organized learning channels", enabled: true },
      { text: "Basic messaging and threads", enabled: true },
      { text: "File sharing", enabled: true },
      { text: "Basic notifications", enabled: true },
      { text: "Limited AI assistance", enabled: true },
    ],
    ctaText: "Get Started Free",
    ctaHref: "/auth/sign-up",
    ctaVariant: "outline",
    variant: "starter",
  },
  {
    key: "pro",
    title: "Pro",
    description: "Best for bootcamps and structured programs.",
    amount: "₦20K",
    periodLabel: "/month",
    footnote: "Billed monthly",
    features: [
      { text: "Everything in Starter, and", enabled: true },
      { text: "Unlimited cohorts", enabled: true },
      { text: "Live classes and collaboration tools", enabled: true },
      { text: "AI study assistants", enabled: true },
      { text: "Assignment and cohort management", enabled: true },
      { text: "Admin moderation tools", enabled: true },
    ],
    ctaText: "Start Pro Plan",
    ctaHref: "/client/settings/organisation/billing/all-plans",
    ctaVariant: "filled",
    variant: "popular",
    badgeText: "Most Popular",
  },
  {
    key: "enterprise",
    title: "Enterprise",
    description: "Flexible pricing for universities and institutions.",
    amount: "Let's Talk",
    periodLabel: "",
    footnote: "Custom billing & SLA",
    features: [
      { text: "Everything in Pro, and", enabled: true },
      { text: "Advanced AI agents and automation", enabled: true },
      { text: "Institution-level workspace control", enabled: true },
      { text: "Security and compliance tools", enabled: true },
      { text: "Custom integrations", enabled: true },
      { text: "Dedicated onboarding & priority support", enabled: true },
    ],
    ctaText: "Contact Sales",
    ctaHref: "/contact-sales",
    ctaVariant: "outline",
    variant: "enterprise",
  },
];

const yearlyCards: PricingCardData[] = [
  {
    ...monthlyCards[0],
    footnote: "Free forever, no card needed",
  },
  {
    ...monthlyCards[1],
    amount: "₦16K",
    periodLabel: "/month",
    footnote: "Billed annually (₦192,000/yr)",
  },
  {
    ...monthlyCards[2],
  },
];

export const pricingCardsByCycle: Record<BillingCycle, PricingCardData[]> = {
  monthly: monthlyCards,
  yearly: yearlyCards,
};
