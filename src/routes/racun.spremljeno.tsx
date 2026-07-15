import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useWishlist } from "@/lib/wishlist";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "@/components/site/ListingCard";
import type { ListingRow } from "@/lib/catalog";

export const Route = createFileRoute("/racun/spremljeno")({
  component: Saved,
});

function Saved() {
  const { ids, clear } = useWishlist();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["wishlist-items", ids],
    queryFn: async (): Promise<ListingRow[]> => {
      if (!ids.length) return [];
      const { data, error } = await supabase
        .from("listings")
        .select("id, title, description, price_eur, currency, location, county, category_slug, subcategory_slug, images, owner_id, is_verified, is_premium, views_count, metadata, published_at, created_at")
        .in("id", ids);
      if (error) throw error;
      return (data ?? []) as ListingRow[];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Spremljeni oglasi</h1>
          <p className="text-sm text-muted-foreground">Vaš osobni wishlist — spremljeni primjerci koje pratite.</p>
        </div>
        {items.length > 0 && (
          <button onClick={clear} className="text-xs font-semibold uppercase tracking-widest text-destructive">Obriši sve</button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card p-10 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Učitavanje…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <Heart className="mx-auto h-10 w-10 text-[color:var(--gold-deep)]" />
          <h2 className="mt-4 font-display text-xl font-semibold">Još ništa nije spremljeno</h2>
          <p className="mt-2 text-sm text-muted-foreground">Kliknite srce na bilo kojem oglasu da ga dodate u vaš wishlist.</p>
          <Link to="/browse" className="mt-5 inline-flex h-10 items-center rounded-md bg-[color:var(--navy)] px-5 text-sm font-semibold text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">
            Otvori katalog
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((l) => <ListingCard key={l.id} l={l} />)}
        </div>
      )}
    </div>
  );

