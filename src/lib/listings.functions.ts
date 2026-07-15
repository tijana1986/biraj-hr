import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { LISTINGS, CATEGORIES } from "@/lib/mock/data";
import type { Database } from "@/integrations/supabase/types";

type ListingInsert = Database["public"]["Tables"]["listings"]["Insert"];

// ---------- Schemas ----------
const createSchema = z.object({
  category_slug: z.string().min(1).max(60),
  subcategory_slug: z.string().min(1).max(60),
  title: z.string().trim().min(6).max(120),
  description: z.string().trim().min(20).max(4000),
  price_eur: z.number().nonnegative().max(100_000_000),
  location: z.string().trim().min(2).max(80),
  county: z.string().trim().max(80).optional(),
  images: z.array(z.string().url().or(z.string().startsWith("/"))).max(12).default([]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const idSchema = z.object({ id: z.string().uuid() });

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["draft", "pending", "active", "paused", "sold", "expired"]),
});

// ---------- CRUD ----------
export const listMyListings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("listings")
      .select("id, title, price_eur, currency, location, category_slug, subcategory_slug, status, is_premium, is_verified, views_count, images, created_at")
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("listings")
      .insert({
        owner_id: context.userId,
        category_slug: data.category_slug,
        subcategory_slug: data.subcategory_slug,
        title: data.title,
        description: data.description,
        price_eur: data.price_eur,
        location: data.location,
        county: data.county ?? null,
        images: data.images,
        status: "active",
        published_at: new Date().toISOString(),
        metadata: (data.metadata ?? {}) as ListingInsert["metadata"],
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateListingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateStatusSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("listings")
      .update({ status: data.status })
      .eq("id", data.id)
      .eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("listings")
      .delete()
      .eq("id", data.id)
      .eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ---------- Demo seed ----------
// Insert ~24 sample listings for the current user the first time they call this.
// Uses `profiles.demo_seeded` as an idempotency flag so refreshes are cheap.
export const seedDemoListings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("demo_seeded")
      .eq("id", userId)
      .maybeSingle();
    if (profile?.demo_seeded) return { seeded: 0, skipped: true as const };

    // Pick 2 listings from each of the first 12 subcategories with a title (~24)
    const seedRows: ListingInsert[] = [];
    let taken = 0;
    for (const cat of CATEGORIES) {
      for (const sub of cat.subcategories) {
        const matches = LISTINGS.filter((l) => l.category === cat.slug && l.subcategory === sub.slug).slice(0, 2);
        for (const l of matches) {
          seedRows.push({
            owner_id: userId,
            category_slug: l.category,
            subcategory_slug: l.subcategory,
            title: l.title,
            description: l.description,
            price_eur: l.price,
            location: l.city,
            images: l.images,
            status: "active",
            is_verified: l.verified,
            published_at: new Date().toISOString(),
          metadata: { specs: l.specs, source: "demo-seed" } as ListingInsert["metadata"],
          });
          taken++;
          if (taken >= 24) break;
        }
        if (taken >= 24) break;
      }
      if (taken >= 24) break;
    }

    if (seedRows.length > 0) {
      const { error } = await supabase.from("listings").insert(seedRows);
      if (error) throw new Error(error.message);
    }

    await supabase.from("profiles").update({ demo_seeded: true }).eq("id", userId);

    return { seeded: seedRows.length, skipped: false as const };
  });
