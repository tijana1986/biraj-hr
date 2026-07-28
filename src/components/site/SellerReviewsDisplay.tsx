import { Star, ThumbsUp } from "lucide-react";
import { getSellerReviews, getReviewStats } from "@/lib/mock/data";

export function SellerReviewsDisplay({ sellerId }: { sellerId: string }) {
  const reviews = getSellerReviews(sellerId);
  const stats = getReviewStats(sellerId);

  if (stats.count === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-8">
        <h2 className="font-display text-2xl font-semibold">Recenzije</h2>
        <p className="mt-4 text-muted-foreground">Ovaj prodavač još nema recenzija.</p>
      </section>
    );
  }

  const percentage = (count: number, total: number) => Math.round((count / total) * 100);

  return (
    <section className="space-y-8">
      {/* Summary */}
      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="grid gap-8 md:grid-cols-[auto_1fr]">
          {/* Rating Summary */}
          <div className="space-y-3">
            <div className="text-center">
              <div className="font-display text-4xl font-semibold">{stats.average.toFixed(1)}</div>
              <div className="mt-1 flex justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className="h-4 w-4"
                    fill={n <= Math.round(stats.average) ? "var(--gold-deep)" : "none"}
                    stroke={n <= Math.round(stats.average) ? "var(--gold-deep)" : "currentColor"}
                  />
                ))}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{stats.count} recenzija</div>
            </div>
          </div>

          {/* Distribution */}
          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.distribution[rating as 1 | 2 | 3 | 4 | 5];
              const pct = percentage(count, stats.count);
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="w-6 text-right text-sm font-medium">{rating}</span>
                    <Star className="h-3.5 w-3.5 fill-[color:var(--gold-deep)]" style={{ color: "var(--gold-deep)" }} />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--gold-deep)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-10 text-right text-sm text-muted-foreground">{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verified Indicator */}
        <div className="mt-6 border-t border-border pt-4">
          <div className="text-sm">
            <strong>{stats.verified}</strong> od <strong>{stats.count}</strong> recenzija je od verificiranih kupaca
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-semibold">Sve recenzije ({stats.count})</h3>
        <div className="space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-[color:var(--navy)] font-display text-sm font-semibold text-[color:var(--cream)]">
                    {review.buyerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold">{review.buyerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("hr-HR")}
                      {review.verified && (
                        <span className="ml-2 inline-block rounded-full bg-[color:var(--gold)]/10 px-2 py-0.5 font-medium text-[color:var(--gold-deep)]">
                          Verificirana kupnja
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-shrink-0 gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className="h-4 w-4"
                      fill={n <= review.rating ? "var(--gold-deep)" : "none"}
                      stroke={n <= review.rating ? "var(--gold-deep)" : "currentColor"}
                    />
                  ))}
                </div>
              </div>

              {review.title && (
                <h4 className="mt-3 font-semibold">{review.title}</h4>
              )}

              {review.text && (
                <p className="mt-2 leading-relaxed text-foreground/85">{review.text}</p>
              )}

              {review.listingTitle && (
                <div className="mt-3 text-xs text-muted-foreground">
                  Za: <strong>{review.listingTitle}</strong>
                </div>
              )}

              {review.helpful > 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <button className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 hover:bg-secondary">
                    <ThumbsUp className="h-3 w-3" />
                    {review.helpful} {review.helpful === 1 ? "osoba je ovo smatrala korisnom" : "osoba je ovo smatralo korisnom"}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
