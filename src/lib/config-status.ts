export type IntegrationStatus = {
  supabase: boolean;
  stripe: boolean;
  resend: boolean;
  ownerEmail: boolean;
  siteUrl: string;
};

export function getIntegrationStatus(): IntegrationStatus {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
  return {
    supabase: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() &&
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
    ),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
    resend: Boolean(
      process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim(),
    ),
    ownerEmail: Boolean(
      process.env.OWNER_EMAIL?.trim() || process.env.STAFF_NOTIFICATION_EMAIL?.trim(),
    ),
    siteUrl,
  };
}

export function publicConfigBanner(status: IntegrationStatus) {
  if (status.supabase && status.stripe) return null;
  const missing: string[] = [];
  if (!status.supabase) missing.push("Supabase");
  if (!status.stripe) missing.push("Stripe");
  if (!status.resend) missing.push("Resend");
  return `Demo mode: ${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} not configured. Reservations and payments are sample until St. Rita's credentials are added.`;
}

export function ownerNotifyEmail() {
  return (
    process.env.OWNER_EMAIL?.trim() ||
    process.env.STAFF_NOTIFICATION_EMAIL?.trim() ||
    ""
  );
}
