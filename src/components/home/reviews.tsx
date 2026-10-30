import { Star } from "lucide-react";
import type { ReviewRecord } from "@/lib/data/reviews";

export function HomeReviews({ reviews }: { reviews: ReviewRecord[] }) {
  const allFive =
    reviews.length > 0 && reviews.every((review) => review.rating === 5);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
          Client reviews
        </p>
        <h2 className="mt-3 font-heading text-4xl tracking-wide text-white sm:text-5xl">
          {allFive ? "100% Recommend" : "What clients say"}
        </h2>
        {reviews.length > 0 ? (
          <p className="mt-2 text-sm font-semibold text-white/60">
            {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
          </p>
        ) : null}
        <p className="mt-3 text-white/70">
          Notes from people who train at St. Rita&apos;s Boxing.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-white/15 bg-surface p-8 text-center">
          <p className="text-white/60">Reviews coming soon.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <blockquote
              key={review.id}
              className="rounded-xl border border-brand/40 bg-surface p-6"
            >
              <div className="mb-3 flex gap-1" aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`size-4 ${
                      index < review.rating ? "fill-gold text-gold" : "text-white/20"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-white">“{review.review_text}”</p>
              <footer className="mt-4 text-sm">
                <cite className="font-bold text-gold not-italic">{review.reviewer_name}</cite>
                {review.reviewer_description ? (
                  <p className="text-white/55">{review.reviewer_description}</p>
                ) : null}
              </footer>
            </blockquote>
          ))}
        </div>
      )}
    </section>
  );
}
