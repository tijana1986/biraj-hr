import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase as publicSupabase } from "@/integrations/supabase/client";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const listSchema = z.object({
  ratee_id: z.string().uuid().optional(),
  listing_id: z.string().uuid().optional(),
  limit: z.number().int().positive().max(50).default(20),
});

const createSchema = z.object({
  ratee_id: z.string().uuid(),
  listing_id: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().max(1200).optional(),
});

const deleteSchema = z.object({ id: z.string().uuid() });

export type ReviewRow = {
  id: string;
  rater_id: string;
  ratee_id: string;
  listing_id: string | null;
  rating: number;
  body: string | null;
  created_at: string;
  rater_name: string | null;
  rater_avatar: string | null;
};

/** Public: list reviews for a seller or listing. Two queries so we can attach rater profile names without a Postgres FK to profiles. */
export async function fetchReviews(opts: { ratee_id?: string; listing_id?: string; limit?: number } = {}): Promise<ReviewRow[]> {
  let base = publicSupabase
    .from("reviews")
    .select("id, rater_id, ratee_id, listing_id, rating, body, created_at")
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 20);
  if (opts.ratee_id) base = base.eq("ratee_id", opts.ratee_id);
  if (opts.listing_id) base = base.eq("listing_id", opts.listing_id);
  const { data, error } = await base;
  if (error) throw error;
  const rows = data ?? [];
  if (!rows.length) return [];
  const raterIds = Array.from(new Set(rows.map((r) => r.rater_id)));
  const { data: profs } = await publicSupabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", raterIds);
  const map = new Map((profs ?? []).map((p) => [p.id, p]));
  return rows.map((r) => {
    const p = map.get(r.rater_id);
    return {
      id: r.id,
      rater_id: r.rater_id,
      ratee_id: r.ratee_id,
      listing_id: r.listing_id,
      rating: r.rating,
      body: r.body,
      created_at: r.created_at,
      rater_name: p?.full_name ?? null,
      rater_avatar: p?.avatar_url ?? null,
    };
  });
}

export async function fetchSellerRating(ratee_id: string): Promise<{ avg: number; count: number }> {
  const { data, error } = await publicSupabase
    .from("reviews")
    .select("rating")
    .eq("ratee_id", ratee_id);
  if (error) throw error;
  const rows = data ?? [];
  if (!rows.length) return { avg: 0, count: 0 };
  const sum = rows.reduce((a, r) => a + r.rating, 0);
  return { avg: sum / rows.length, count: rows.length };
}

/** Kept for API parity with other server fns. Same shape as fetchReviews above. */
export const listReviews = createServerFn({ method: "GET" })
  .inputValidator((i) => listSchema.parse(i))
  .handler(async ({ data }) => fetchReviews(data));

export const createReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => createSchema.parse(i))
  .handler(async ({ data, context }) => {
    if (data.ratee_id === context.userId) {
      throw new Error("Ne možete ostaviti recenziju sami sebi.");
    }
    const { error } = await context.supabase.from("reviews").upsert(
      {
        rater_id: context.userId,
        ratee_id: data.ratee_id,
        listing_id: data.listing_id ?? null,
        rating: data.rating,
        body: data.body ?? null,
      },
      { onConflict: "rater_id,ratee_id,listing_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => deleteSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("reviews")
      .delete()
      .eq("id", data.id)
      .eq("rater_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
