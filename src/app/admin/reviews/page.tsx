import { ReviewsAdmin } from "@/components/admin/reviews-admin";
import { listAllReviews } from "@/lib/data/reviews";
import { isServiceRoleConfigured } from "@/lib/supabase/server";

export default async function AdminReviewsPage() {
  const live = isServiceRoleConfigured();
  let reviews: Awaited<ReturnType<typeof listAllReviews>> = [];
  let loadError = "";
  if (live) {
    try {
      reviews = await listAllReviews();
    } catch (error) {
      loadError = error instanceof Error ? error.message : "Could not load reviews.";
    }
  }

  return (
    <section>
      <h1 className="font-heading text-3xl">Reviews</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Add, edit, or remove quotes shown on the home page. Hidden reviews stay in this list
        until you delete them.
      </p>
      {!live ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Connect Supabase and apply migration 003 before managing reviews.
        </p>
      ) : loadError ? (
        <p className="mt-4 text-sm text-red-700">
          {loadError.includes("srb_reviews")
            ? "Apply supabase/migrations/003_srb_reviews.sql, then reload this page."
            : loadError}
        </p>
      ) : (
        <div className="mt-6">
          <ReviewsAdmin reviews={reviews} />
        </div>
      )}
    </section>
  );
}
