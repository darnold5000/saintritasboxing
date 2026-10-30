import { createHash, randomBytes } from "node:crypto";
import { TABLES } from "@/lib/tables";
import { createServiceClient } from "@/lib/supabase/server";
import { membershipCoversTraining, type TrainingTypeId } from "@/lib/catalog";

export type CustomerRecord = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
};

export async function upsertCustomer(input: {
  fullName: string;
  email: string;
  phone: string;
  partnerName?: string;
  isMinor?: boolean;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  notes?: string;
}): Promise<CustomerRecord> {
  const db = createServiceClient();
  const email = input.email.trim().toLowerCase();
  const payload = {
    full_name: input.fullName.trim(),
    email,
    phone: input.phone.trim(),
    partner_name: input.partnerName?.trim() || null,
    is_minor: Boolean(input.isMinor),
    guardian_name: input.guardianName?.trim() || null,
    guardian_email: input.guardianEmail?.trim().toLowerCase() || null,
    guardian_phone: input.guardianPhone?.trim() || null,
    notes: input.notes?.trim() || null,
  };

  const { data: existing } = await db
    .from(TABLES.customers)
    .select("id, full_name, email, phone")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    const { data, error } = await db
      .from(TABLES.customers)
      .update(payload)
      .eq("id", existing.id)
      .select("id, full_name, email, phone")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Could not update customer");
    return data as CustomerRecord;
  }

  const { data, error } = await db
    .from(TABLES.customers)
    .insert(payload)
    .select("id, full_name, email, phone")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not create customer");
  return data as CustomerRecord;
}

export async function customerCredits(email: string) {
  const db = createServiceClient();
  const normalized = email.trim().toLowerCase();
  const { data: customer } = await db
    .from(TABLES.customers)
    .select("id, full_name, email, phone")
    .eq("email", normalized)
    .maybeSingle();
  if (!customer) return null;

  const { data: purchases } = await db
    .from(TABLES.purchases)
    .select(
      "id, offering_id, training_type, name, sessions_total, sessions_remaining, status, kind",
    )
    .eq("customer_id", customer.id)
    .eq("status", "paid");

  const { data: subscriptions } = await db
    .from(TABLES.subscriptions)
    .select("id, status, offering_id")
    .eq("customer_id", customer.id)
    .eq("status", "active");

  return {
    customer: customer as CustomerRecord,
    purchases: purchases ?? [],
    subscriptions: subscriptions ?? [],
    unlimitedActive: (subscriptions ?? []).some((row) => row.status === "active"),
  };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function issueAccessToken(email: string) {
  const db = createServiceClient();
  const token = randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const { error } = await db.from(TABLES.accessTokens).insert({
    email: email.trim().toLowerCase(),
    token_hash: hashToken(token),
    purpose: "credits",
    expires_at: expires,
  });
  if (error) throw new Error(error.message);
  return token;
}

export async function lookupAccessToken(token: string) {
  const db = createServiceClient();
  const { data } = await db
    .from(TABLES.accessTokens)
    .select("id, email, expires_at, used_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (!data || data.used_at) return null;
  if (data.expires_at && data.expires_at < new Date().toISOString()) return null;
  return { id: String(data.id), email: String(data.email) };
}

export async function consumeAccessToken(token: string) {
  const found = await lookupAccessToken(token);
  if (!found) return null;
  const db = createServiceClient();
  await db
    .from(TABLES.accessTokens)
    .update({ used_at: new Date().toISOString() })
    .eq("id", found.id);
  return found.email;
}

export type UsableCredit = {
  purchaseId: string | null;
  trainingType: TrainingTypeId;
  remaining: number;
  unlimitedActive: boolean;
};

export function pickCreditForType(
  credits: NonNullable<Awaited<ReturnType<typeof customerCredits>>>,
  trainingType: TrainingTypeId,
): UsableCredit | null {
  const membership = (credits.subscriptions ?? []).find(
    (row) => row.status === "active" && membershipCoversTraining(String(row.offering_id), trainingType),
  );
  if (membership) {
    return {
      purchaseId: null,
      trainingType,
      remaining: 0,
      unlimitedActive: true,
    };
  }
  const purchase = (credits.purchases ?? []).find(
    (row) =>
      row.training_type === trainingType &&
      row.kind !== "subscription" &&
      Number(row.sessions_remaining) > 0,
  );
  if (!purchase) return null;
  return {
    purchaseId: String(purchase.id),
    trainingType,
    remaining: Number(purchase.sessions_remaining),
    unlimitedActive: false,
  };
}
