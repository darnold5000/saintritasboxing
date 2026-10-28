export const TRAINING_TYPE_IDS = ["private", "partner"] as const;
export type TrainingTypeId = (typeof TRAINING_TYPE_IDS)[number];

export const PACKAGE_KIND = ["single", "package", "subscription"] as const;
export type PackageKind = (typeof PACKAGE_KIND)[number];

export type TrainingType = {
  id: TrainingTypeId;
  name: string;
  shortName: string;
  eyebrow: string;
  summary: string;
  startingPriceCents: number;
  priceQualifier: string;
  participants: 1 | 2;
};

export type CatalogOffering = {
  id: string;
  trainingType: TrainingTypeId;
  kind: PackageKind;
  name: string;
  sessions: number | null;
  priceCents: number;
  interval: "month" | null;
  cta: string;
  description: string;
};

export const TRAINING_TYPES: Record<TrainingTypeId, TrainingType> = {
  private: {
    id: "private",
    name: "1-on-1 Private Training",
    shortName: "1-on-1 Training",
    eyebrow: "Individual focus",
    summary:
      "Personalized boxing coaching built around your goals, pace, and fitness level.",
    startingPriceCents: 5000,
    priceQualifier: "per session",
    participants: 1,
  },
  partner: {
    id: "partner",
    name: "2-on-1 Partner Training",
    shortName: "2-on-1 Training",
    eyebrow: "Train together",
    summary:
      "Share a session with a partner. Prices below are the TOTAL for both participants, not per person.",
    startingPriceCents: 7000,
    priceQualifier: "total for two",
    participants: 2,
  },
};

export const OFFERINGS: CatalogOffering[] = [
  {
    id: "private-single",
    trainingType: "private",
    kind: "single",
    name: "Single Session",
    sessions: 1,
    priceCents: 5000,
    interval: null,
    cta: "Book session",
    description: "One 60-minute private training session.",
  },
  {
    id: "private-5",
    trainingType: "private",
    kind: "package",
    name: "5 Session Package",
    sessions: 5,
    priceCents: 22500,
    interval: null,
    cta: "Buy package",
    description: "Five private sessions. Credits stay on your account.",
  },
  {
    id: "private-10",
    trainingType: "private",
    kind: "package",
    name: "10 Session Package",
    sessions: 10,
    priceCents: 40000,
    interval: null,
    cta: "Buy package",
    description: "Ten private sessions. Credits stay on your account.",
  },
  {
    id: "private-20",
    trainingType: "private",
    kind: "package",
    name: "20 Session Package",
    sessions: 20,
    priceCents: 70000,
    interval: null,
    cta: "Buy package",
    description: "Twenty private sessions. Credits stay on your account.",
  },
  {
    id: "private-unlimited",
    trainingType: "private",
    kind: "subscription",
    name: "Monthly Unlimited PT",
    sessions: null,
    priceCents: 80000,
    interval: "month",
    cta: "Join monthly",
    description:
      "Recurring monthly unlimited 1-on-1 personal training. Manage or cancel in the Stripe customer portal.",
  },
  {
    id: "partner-single",
    trainingType: "partner",
    kind: "single",
    name: "Single Session",
    sessions: 1,
    priceCents: 7000,
    interval: null,
    cta: "Book session",
    description:
      "One 60-minute partner session. Price is the TOTAL for two participants.",
  },
  {
    id: "partner-5",
    trainingType: "partner",
    kind: "package",
    name: "5 Session Package",
    sessions: 5,
    priceCents: 32500,
    interval: null,
    cta: "Buy package",
    description:
      "Five partner sessions. One credit covers both participants. Price is TOTAL.",
  },
  {
    id: "partner-10",
    trainingType: "partner",
    kind: "package",
    name: "10 Session Package",
    sessions: 10,
    priceCents: 60000,
    interval: null,
    cta: "Buy package",
    description:
      "Ten partner sessions. One credit covers both participants. Price is TOTAL.",
  },
];

export const REGISTRATION_FEE = {
  amountCents: 2500,
  autoCharge: false,
  flyerNotes: [
    "The supplied flyer lists a $25 one-time registration fee.",
    "Current members: fee waived.",
    "New-client promotion: fee waived.",
  ],
  publicExplanation:
    "A $25 one-time registration fee appears on the training flyer. Current members are waived, and a new-client promotion may also waive the fee. We do not add this fee at checkout until the owner confirms whether the promotion is still active.",
} as const;

export const CREDIT_POLICY = {
  expiration: "none" as const,
  bookingLimits: "none" as const,
  note: "Expiration dates and booking limits are left unset until the owner confirms them.",
};

export function offeringById(id: string | null | undefined) {
  return OFFERINGS.find((item) => item.id === id) ?? null;
}

export function offeringsForType(type: TrainingTypeId) {
  return OFFERINGS.filter((item) => item.trainingType === type);
}

export function singleOfferingForType(type: TrainingTypeId) {
  return OFFERINGS.find((item) => item.trainingType === type && item.kind === "single") ?? null;
}

export function packageOfferingsForType(type: TrainingTypeId) {
  return OFFERINGS.filter(
    (item) => item.trainingType === type && item.kind === "package",
  );
}

export function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function singleSessionPrice(type: TrainingTypeId) {
  const single = OFFERINGS.find(
    (item) => item.trainingType === type && item.kind === "single",
  );
  return single?.priceCents ?? TRAINING_TYPES[type].startingPriceCents;
}

export function packageSavings(offering: CatalogOffering) {
  if (offering.kind !== "package" || !offering.sessions) return null;
  const compared = singleSessionPrice(offering.trainingType) * offering.sessions;
  const saved = compared - offering.priceCents;
  if (saved <= 0) return null;
  return { comparedCents: compared, savedCents: saved };
}

export function creditsDeductedPerBooking(type: TrainingTypeId) {
  void type;
  return 1;
}

export function isValidOfferingId(id: string): boolean {
  return OFFERINGS.some((item) => item.id === id);
}
