import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const idSchema = z.object({ listing_id: z.string().uuid() });
const importSchema = z.object({ listing_ids: z.array(z.string().uuid()).max(500) });

export const listMyFavorites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("favorites")
      .select("listing_id, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.listing_id);
  });

export const addFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => idSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("favorites")
      .upsert({ user_id: context.userId, listing_id: data.listing_id });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const removeFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => idSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("favorites")
      .delete()
      .eq("user_id", context.userId)
      .eq("listing_id", data.listing_id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const clearFavorites = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("favorites")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** One-shot import of localStorage-cached favourite ids on first sign-in. */
export const importFavorites = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => importSchema.parse(i))
  .handler(async ({ data, context }) => {
    if (!data.listing_ids.length) return { imported: 0 };
    const rows = data.listing_ids.map((id) => ({ user_id: context.userId, listing_id: id }));
    const { error } = await context.supabase.from("favorites").upsert(rows);
    if (error) throw new Error(error.message);
    return { imported: rows.length };
  });
