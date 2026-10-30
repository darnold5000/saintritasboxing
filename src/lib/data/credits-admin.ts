import { TABLES } from "@/lib/tables";
import { createServiceClient } from "@/lib/supabase/server";

export async function listClientPurchases(clientId: string) {
  const db = createServiceClient();
  const { data, error } = await db
    .from(TABLES.purchases)
    .select(
      "id, offering_id, training_type, name, kind, sessions_total, sessions_remaining, status",
    )
    .eq("customer_id", clientId)
    .eq("status", "paid")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adjustPurchaseCredits(input: {
  purchaseId: string;
  delta: number;
  reason: string;
  staffUserId: string;
}) {
  if (!Number.isInteger(input.delta) || input.delta === 0) {
    throw new Error("Adjustment must be a non-zero whole number.");
  }
  const reason = input.reason.trim();
  if (reason.length < 3) {
    throw new Error("Add a short reason for this adjustment.");
  }

  const db = createServiceClient();
  const { data: purchase, error: loadError } = await db
    .from(TABLES.purchases)
    .select("id, customer_id, sessions_total, sessions_remaining, kind, status")
    .eq("id", input.purchaseId)
    .maybeSingle();

  if (loadError || !purchase) {
    throw new Error("Package not found.");
  }
  if (purchase.status !== "paid") {
    throw new Error("Only paid packages can be adjusted.");
  }
  if (purchase.kind === "subscription") {
    throw new Error("Monthly unlimited is managed through Stripe, not session credits.");
  }

  const current = Number(purchase.sessions_remaining);
  const total = Number(purchase.sessions_total);
  const next = current + input.delta;
  if (next < 0) {
    throw new Error("Cannot reduce credits below zero.");
  }
  if (next > total) {
    throw new Error(`Cannot exceed ${total} sessions on this package.`);
  }

  const { error: updateError } = await db
    .from(TABLES.purchases)
    .update({ sessions_remaining: next })
    .eq("id", input.purchaseId);

  if (updateError) throw new Error(updateError.message);

  const { error: auditError } = await db.from(TABLES.creditAdjustments).insert({
    purchase_id: input.purchaseId,
    customer_id: purchase.customer_id,
    delta: input.delta,
    sessions_remaining_after: next,
    reason,
    staff_user_id: input.staffUserId,
  });

  if (auditError) throw new Error(auditError.message);

  return { sessionsRemaining: next };
}
