import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, MapPin } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Marketplace - Pronađite Usluge" },
      { name: "description", content: "Marketplace za pronalaženje usluga od provjerenih pružatelja." },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, loading: authLoading } = useAuth();
  const [searchCategory, setSearchCategory] = useState("");

  const { data: listings, isLoading } = useQuery({
    queryKey: ["listings", searchCategory],
    queryFn: async () => {
      let query = supabase
        .from("marketplace_listings")
        .select("*")
        .eq("status", "active");

      if (searchCategory) {
        query = query.eq("category", searchCategory);
      }

      const { data, error } = await query.order("created_at", { ascending: false }).limit(12);
      if (error) {
        console.error(error);
        return [];
      }
      return data || [];
    },
    enabled: !authLoading,
  });

  if (authLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">Marketplace</div>
          <nav className="flex gap-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost">Moj Dashboard</Button>
                </Link>
                <Link to="/logout">
                  <Button variant="outline">Odjava</Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Prijava</Button>
                </Link>
                <Link to="/register">
                  <Button>Registracija</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">Pronađite Usluge</h1>
        <p className="text-xl text-muted-foreground mb-8">Pregledajte dostupne oglase od provjerenih pružatelja</p>

        <div className="flex gap-2 mb-8">
          <Input
            placeholder="Pretraži po kategoriji..."
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="flex-1"
          />
          <Button><Search className="w-4 h-4" /></Button>
        </div>
      </section>

      {/* Listings */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        {isLoading ? (
          <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
        ) : listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing: any) => (
              <div key={listing.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                <h3 className="text-lg font-semibold mb-2">{listing.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{listing.description.substring(0, 100)}...</p>
                <div className="flex gap-2 mb-4 text-sm">
                  <span className="bg-secondary px-2 py-1 rounded">{listing.category}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {listing.location}</span>
                </div>
                {listing.price_per_unit && (
                  <div className="text-lg font-bold mb-4">€{listing.price_per_unit}</div>
                )}
                <Link to={`/listing/${listing.id}`}>
                  <Button className="w-full">Detalji</Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">Nema dostupnih oglasa</div>
        )}
      </section>

      {/* CTA */}
      {!user && (
        <section className="bg-secondary py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Nudite Usluge?</h2>
            <p className="text-muted-foreground mb-6">Kreirajte profil i počnite postavljati oglase - €30/mjesečno za pristup</p>
            <Link to="/register">
              <Button size="lg">Registracija kao Pružatelj</Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
