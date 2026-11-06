import { cache } from "react";
import {
  OFFERINGS,
  TRAINING_TYPE_IDS,
  type CatalogOffering,
  type PackageKind,
  type TrainingTypeId,
} from "@/lib/catalog";
import { TABLES } from "@/lib/tables";
import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/server";

export type OfferingDraft = {
  trainingType: TrainingTypeId;
  kind: PackageKind;
  name: string;
  sessions: number | null;
  priceCents: number;
  description: string;
  published: boolean;
};

type OfferingRow = {
  id: string;
  training_type: string;
  kind: string;
  name: string;
  sessions: number | null;
  price_cents: number;
  billing_interval: string | null;
  cta: string;
  description: string;
  published: boolean;
  sort_order: number;
};

function fromRow(row: OfferingRow): CatalogOffering {
  return {
    id: row.id,
    trainingType: row.training_type as TrainingTypeId,
    kind: row.kind as PackageKind,
    name: row.name,
    sessions: row.sessions,
    priceCents: row.price_cents,
    interval: row.billing_interval === "month" ? "month" : null,
    cta: row.cta,
    description: row.description,
    published: row.published,
    sortOrder: row.sort_order,
  };
}

function missingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return error.code === "PGRST205" || error.message?.includes("srb_offerings") === true;
}

export const loadOfferings = cache(async function loadOfferings(
  includeHidden = false,
): Promise<CatalogOffering[]> {
  if (!isServiceRoleConfigured()) return fallback(includeHidden);
  const db = createServiceClient();
  const { data, error } = await db
    .from(TABLES.offerings)
    .select(
      "id, training_type, kind, name, sessions, price_cents, billing_interval, cta, description, published, sort_order",
    )
    .order("sort_order", { ascending: true });
  if (error || !data) {
    if (!missingTable(error)) console.error("[offerings]", error?.message);
    return fallback(includeHidden);
  }
  const offerings = (data as OfferingRow[]).map(fromRow);
  if (includeHidden) return offerings;
  return offerings.filter((item) => item.published !== false);
});

function fallback(includeHidden?: boolean) {
  const seeded = OFFERINGS.map((item) => ({ ...item, published: true }));
  return includeHidden ? seeded : seeded.filter((item) => item.published !== false);
}

export async function getOffering(id: string) {
  const offerings = await loadOfferings(true);
  return offerings.find((item) => item.id === id) ?? null;
}

function ctaFor(kind: PackageKind) {
  if (kind === "single") return "Book session";
  if (kind === "subscription") return "Join monthly";
  return "Buy package";
}

function slugId(trainingType: string, name: string) {
  const nameSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const base = `${trainingType}-${nameSlug || "package"}`.slice(0, 60);
  return base.replace(/-+$/g, "");
}

export async function createOffering(input: OfferingDraft) {
  if (!TRAINING_TYPE_IDS.includes(input.trainingType)) {
    throw new Error("Choose a training type.");
  }
  const db = createServiceClient();
  const existing = await loadOfferings(true);
  let id = slugId(input.trainingType, input.name);
  let suffix = 2;
  while (existing.some((item) => item.id === id)) {
    id = `${slugId(input.trainingType, input.name)}-${suffix}`;
    suffix += 1;
  }
  const sortOrder =
    existing
      .filter((item) => item.trainingType === input.trainingType)
      .reduce((max, item) => Math.max(max, item.sortOrder ?? 0), -1) + 1;
  const sessions = input.kind === "subscription" ? null : input.kind === "single" ? 1 : input.sessions;
  const { data, error } = await db
    .from(TABLES.offerings)
    .insert({
      id,
      training_type: input.trainingType,
      kind: input.kind,
      name: input.name.trim(),
      sessions,
      price_cents: input.priceCents,
      billing_interval: input.kind === "subscription" ? "month" : null,
      cta: ctaFor(input.kind),
      description: input.description.trim(),
      published: input.published,
      sort_order: sortOrder,
    })
    .select(
      "id, training_type, kind, name, sessions, price_cents, billing_interval, cta, description, published, sort_order",
    )
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not add the package.");
  return fromRow(data as OfferingRow);
}

export async function updateOffering(input: {
  id: string;
  name: string;
  sessions: number | null;
  priceCents: number;
  description: string;
  published: boolean;
}) {
  const current = await getOffering(input.id);
  if (!current) throw new Error("Package not found.");
  const sessions =
    current.kind === "subscription" ? null : current.kind === "single" ? 1 : input.sessions;
  const db = createServiceClient();
  const { data, error } = await db
    .from(TABLES.offerings)
    .update({
      name: input.name.trim(),
      sessions,
      price_cents: input.priceCents,
      description: input.description.trim(),
      published: input.published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .select(
      "id, training_type, kind, name, sessions, price_cents, billing_interval, cta, description, published, sort_order",
    )
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not update the package.");
  return fromRow(data as OfferingRow);
}
