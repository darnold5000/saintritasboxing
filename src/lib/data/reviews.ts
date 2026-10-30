import { TABLES } from "@/lib/tables";
import { createServiceClient } from "@/lib/supabase/server";

export type ReviewRecord = {
  id: string;
  reviewer_name: string;
  reviewer_description: string | null;
  rating: number;
  review_text: string;
  published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

const COLUMNS =
  "id, reviewer_name, reviewer_description, rating, review_text, published, display_order, created_at, updated_at";

export async function listPublishedReviews(): Promise<ReviewRecord[]> {
  const db = createServiceClient();
  const { data, error } = await db
    .from(TABLES.reviews)
    .select(COLUMNS)
    .eq("published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ReviewRecord[];
}

export async function listAllReviews(): Promise<ReviewRecord[]> {
  const db = createServiceClient();
  const { data, error } = await db
    .from(TABLES.reviews)
    .select(COLUMNS)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ReviewRecord[];
}

export type ReviewInput = {
  reviewerName: string;
  reviewerDescription?: string | null;
  rating: number;
  reviewText: string;
  published: boolean;
  displayOrder?: number;
};

function payload(input: ReviewInput) {
  return {
    reviewer_name: input.reviewerName.trim(),
    reviewer_description: input.reviewerDescription?.trim() || null,
    rating: input.rating,
    review_text: input.reviewText.trim(),
    published: input.published,
    display_order: input.displayOrder ?? 0,
    updated_at: new Date().toISOString(),
  };
}

export async function createReview(input: ReviewInput) {
  const db = createServiceClient();
  const { data, error } = await db
    .from(TABLES.reviews)
    .insert(payload(input))
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateReview(id: string, input: ReviewInput) {
  const db = createServiceClient();
  const { error } = await db.from(TABLES.reviews).update(payload(input)).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteReview(id: string) {
  const db = createServiceClient();
  const { error } = await db.from(TABLES.reviews).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
