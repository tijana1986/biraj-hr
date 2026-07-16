import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fetchReviews, fetchSellerRating, createReview, deleteReview } from "@/lib/reviews.functions";
import { useAuth } from "@/lib/auth";
import { Link } from "@tanstack/react-router";

function StarRow({ value }: { value: number }) {
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${value} od 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= Math.round(value) ? "fill-current" : ""}`}
          style={{ color: "var(--gold)" }}
        />
      ))}
    </div>
  );
}

export function ReviewsSection({
  rateeId,
  listingId,
  title = "Recenzije",
}: {
  rateeId: string;
  listingId?: string;
  title?: string;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["reviews", rateeId, listingId ?? null];
  const ratingKey = ["seller-rating", rateeId];

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: () => fetchReviews({ ratee_id: rateeId, listing_id: listingId }),
  });
  const { data: rating } = useQuery({
    queryKey: ratingKey,
    queryFn: () => fetchSellerRating(rateeId),
  });

  const [rating5, setRating5] = useState(5);
  const [body, setBody] = useState("");

  const create = useMutation({
    mutationFn: async () =>
      createReview({ data: { ratee_id: rateeId, listing_id: listingId, rating: rating5, body: body.trim() || undefined } }),
    onSuccess: () => {
      toast.success("Hvala na recenziji!");
      setBody("");
      setRating5(5);
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: ratingKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => deleteReview({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: ratingKey });
    },
  });

  const isOwner = user?.id === rateeId;

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
        {rating && rating.count > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <StarRow value={rating.avg} />
            <span className="font-semibold">{rating.avg.toFixed(1)}</span>
            <span className="text-muted-foreground">({rating.count})</span>
          </div>
        )}
      </div>

      {!user ? (
        <p className="mt-4 rounded-xl bg-secondary/40 p-4 text-sm text-muted-foreground">
          <Link to="/prijava" className="font-semibold text-[color:var(--gold-deep)]">Prijavite se</Link> kako biste ostavili recenziju.
        </p>
      ) : isOwner ? (
        <p className="mt-4 text-sm text-muted-foreground">Ne možete recenzirati vlastiti profil.</p>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); create.mutate(); }}
          className="mt-4 rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">Ocjena:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating5(n)}
                  aria-label={`${n} zvjezdica`}
                  className="p-0.5"
                >
                  <Star className={"h-6 w-6 " + (n <= rating5 ? "fill-current" : "")} style={{ color: "var(--gold)" }} />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Podijelite svoje iskustvo (opcionalno)…"
            maxLength={1200}
            className="mt-3"
            rows={3}
          />
          <div className="mt-3 flex justify-end">
            <Button type="submit" disabled={create.isPending} className="bg-[color:var(--navy)] text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Objavi recenziju
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Učitavanje…
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Još nema recenzija.</p>
        ) : (
          reviews.map((r) => (
            <article key={r.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--navy)] font-display text-sm text-[color:var(--cream)]">
                    {(r.rater_name?.[0] ?? "?").toUpperCase()}
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{r.rater_name ?? "Korisnik"}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("hr-HR")}
                    </div>
                  </div>
                </div>
                <StarRow value={r.rating} />
              </div>
              {r.body && <p className="mt-3 text-sm leading-relaxed text-foreground/90">{r.body}</p>}
              {user?.id === r.rater_id && (
                <div className="mt-3 text-right">
                  <button
                    type="button"
                    onClick={() => remove.mutate(r.id)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" /> Obriši
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
