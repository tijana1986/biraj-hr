import { supabase } from "@/integrations/supabase/client";
import listing1 from "@/assets/listing-1.jpg";
import listing2 from "@/assets/listing-2.jpg";
import listing3 from "@/assets/listing-3.jpg";
import listing4 from "@/assets/listing-4.jpg";
import heroImg from "@/assets/hero.jpg";

const IMG_MAP: Record<string, string> = {
  "asset:listing-1": listing1,
  "asset:listing-2": listing2,
  "asset:listing-3": listing3,
  "asset:listing-4": listing4,
  "asset:hero": heroImg,
};

/** Resolve an image marker (`asset:hero`) or URL string to a usable src. */
export function resolveImage(src: string | undefined | null): string {
  if (!src) return heroImg;
  return IMG_MAP[src] ?? src;
}

export function resolveImages(list: string[] | null | undefined): string[] {
  const arr = (list ?? []).map(resolveImage);
  return arr.length ? arr : [heroImg];
}

/** 20 hrvatskih županija + Grad Zagreb. */
export const COUNTIES = [
  "Grad Zagreb",
  "Bjelovarsko-bilogorska",
  "Brodsko-posavska",
  "Dubrovačko-neretvanska",
  "Istarska",
  "Karlovačka",
  "Koprivničko-križevačka",
  "Krapinsko-zagorska",
  "Ličko-senjska",
  "Međimurska",
  "Osječko-baranjska",
  "Požeško-slavonska",
  "Primorsko-goranska",
  "Sisačko-moslavačka",
  "Splitsko-dalmatinska",
  "Šibensko-kninska",
  "Varaždinska",
  "Virovitičko-podravska",
  "Vukovarsko-srijemska",
  "Zadarska",
  "Zagrebačka",
] as const;

export type ListingRow = {
  id: string;
  title: string;
  description: string;
  price_eur: number;
  currency: string;
  location: string;
  county: string | null;
  category_slug: string;
  subcategory_slug: string;
  images: string[];
  owner_id: string;
  is_verified: boolean;
  is_premium: boolean;
  views_count: number;
  metadata: Record<string, unknown> | null;
  published_at: string | null;
  created_at: string;
};

export type CatalogQuery = {
  category?: string;
  subcategory?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  county?: string;
  verifiedOnly?: boolean;
  sort?: "relevantnost" | "noviji" | "cijena-asc" | "cijena-desc" | "popularnost";
  limit?: number;
  excludeId?: string;
};

const COLS =
  "id, title, description, price_eur, currency, location, county, category_slug, subcategory_slug, images, owner_id, is_verified, is_premium, views_count, metadata, published_at, created_at";

function sanitize(term: string) {
  return term.replace(/[%,()]/g, " ").trim();
}

export async function fetchListings(q: CatalogQuery = {}): Promise<ListingRow[]> {
  let query = supabase
    .from("listings")
    .select(COLS)
    .eq("status", "active")
    .limit(q.limit ?? 200);

  if (q.category) query = query.eq("category_slug", q.category);
  if (q.subcategory) query = query.eq("subcategory_slug", q.subcategory);
  if (q.county) query = query.eq("county", q.county);
  if (q.verifiedOnly) query = query.eq("is_verified", true);
  if (q.minPrice != null) query = query.gte("price_eur", q.minPrice);
  if (q.maxPrice != null) query = query.lte("price_eur", q.maxPrice);
  if (q.excludeId) query = query.neq("id", q.excludeId);
  if (q.q && q.q.trim()) {
    const p = sanitize(q.q);
    if (p) query = query.or(`title.ilike.%${p}%,description.ilike.%${p}%,location.ilike.%${p}%`);
  }

  switch (q.sort) {
    case "cijena-asc":
      query = query.order("price_eur", { ascending: true });
      break;
    case "cijena-desc":
      query = query.order("price_eur", { ascending: false });
      break;
    case "popularnost":
      query = query
        .order("is_verified", { ascending: false })
        .order("views_count", { ascending: false });
      break;
    case "noviji":
    case "relevantnost":
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ListingRow[];
}

export async function fetchListingById(id: string): Promise<ListingRow | null> {
  const { data, error } = await supabase
    .from("listings")
    .select(COLS)
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  return (data as ListingRow | null) ?? null;
}

export type CategoryCounts = {
  total: number;
  byCategory: Record<string, number>;
  bySub: Record<string, number>; // key = `${category}/${sub}`
};

export async function fetchCategoryCounts(): Promise<CategoryCounts> {
  const { data, error } = await supabase
    .from("listings")
    .select("category_slug, subcategory_slug")
    .eq("status", "active")
    .limit(5000);
  if (error) throw error;
  const byCategory: Record<string, number> = {};
  const bySub: Record<string, number> = {};
  for (const r of data ?? []) {
    byCategory[r.category_slug] = (byCategory[r.category_slug] ?? 0) + 1;
    const k = `${r.category_slug}/${r.subcategory_slug}`;
    bySub[k] = (bySub[k] ?? 0) + 1;
  }
  return { total: data?.length ?? 0, byCategory, bySub };
}

export type SellerProfileRow = {
  id: string;
  full_name: string | null;
  city: string | null;
  avatar_url: string | null;
  verified: boolean;
  created_at: string;
};

export async function fetchSellerProfile(userId: string): Promise<SellerProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, city, avatar_url, verified, created_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as SellerProfileRow | null) ?? null;
}

export function joinedYear(iso: string | undefined | null): number {
  if (!iso) return new Date().getFullYear();
  return new Date(iso).getFullYear();
}

export function avatarLetter(name: string | null | undefined): string {
  return (name?.trim()?.[0] ?? "?").toUpperCase();
}
