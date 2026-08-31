import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getActiveListing } from "@/lib/marketplace.functions";
import { Loader2, MapPin, Phone, Mail } from "lucide-react";

export const Route = createFileRoute("/listing/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Oglas - ${params.id}` }],
  }),
  component: ListingDetail,
});

function ListingDetail() {
  const { id } = useParams({ from: "/listing/$id" });

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => getActiveListing(id),
  });

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin" /></div>;
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Oglas nije pronađen</h1>
          <Link to="/">
            <Button>Nazad na Početnu</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost">← Nazad</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Images */}
            {listing.images && listing.images.length > 0 ? (
              <div className="bg-gray-200 aspect-video rounded-lg mb-6 flex items-center justify-center">
                [Slike oglasa]
              </div>
            ) : (
              <div className="bg-gray-100 aspect-video rounded-lg mb-6 flex items-center justify-center text-muted-foreground">
                Nema slika
              </div>
            )}

            {/* Details */}
            <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
            <div className="flex gap-4 mb-6 text-sm">
              <span className="bg-secondary px-3 py-1 rounded">{listing.category}</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {listing.location}
              </span>
            </div>

            {listing.price_per_unit && (
              <div className="text-3xl font-bold mb-6">€{listing.price_per_unit}/sat</div>
            )}

            <div className="prose max-w-none mb-8">
              <h2 className="text-xl font-semibold mb-4">Opis</h2>
              <p className="whitespace-pre-wrap">{listing.description}</p>
            </div>

            {/* Stats */}
            <div className="bg-secondary rounded-lg p-4 space-y-2 text-sm">
              <p>Pregledi: <span className="font-semibold">{listing.views_count}</span></p>
              <p>Klikovi: <span className="font-semibold">{listing.clicks_count}</span></p>
              <p>Objavljeno: <span className="font-semibold">{new Date(listing.created_at).toLocaleDateString("hr-HR")}</span></p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="border rounded-lg p-6 space-y-4 sticky top-4">
              <h3 className="text-lg font-semibold">Kontaktiraj Pružatelja</h3>

              <Button className="w-full" size="lg">
                <Mail className="w-4 h-4 mr-2" />
                Pošalji Poruku
              </Button>

              <Button variant="outline" className="w-full" size="lg">
                <Phone className="w-4 h-4 mr-2" />
                Pozovi
              </Button>

              <div className="text-sm text-muted-foreground pt-4 border-t">
                <p>Sigurna komunikacija kroz platformu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
