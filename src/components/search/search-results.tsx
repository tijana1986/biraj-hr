import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Zap, Star } from "lucide-react";
import { searchListings, recordListingView, type SearchFilters } from "@/lib/search.functions";

interface SearchResultsProps {
  filters: SearchFilters;
}

export function SearchResults({ filters }: SearchResultsProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [savedListings, setSavedListings] = useState<Set<string>>(new Set());

  const { data, isLoading } = useSuspenseQuery({
    queryKey: ["search", filters, currentPage],
    queryFn: () => searchListings({ ...filters, page: currentPage }),
  });

  const handleListingClick = async (listingId: string) => {
    try {
      await recordListingView({ listingId });
    } catch (error) {
      console.error("Error recording view:", error);
    }
    navigate({
      to: "/listing/$id",
      params: { id: listingId },
    });
  };

  const toggleSave = (e: React.MouseEvent, listingId: string) => {
    e.stopPropagation();
    setSavedListings((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(listingId)) {
        newSet.delete(listingId);
      } else {
        newSet.add(listingId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Učitavanje rezultata...</p>
        </div>
      </div>
    );
  }

  if (data.listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-semibold mb-2">Nema rezultata</h3>
          <p className="text-muted-foreground mb-4">
            Nažalost, nismo našli oglase koji odgovaraju vašim kriterijima. Pokušajte promijeniti filtere ili pretraživanje.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Prikazani rezultati{" "}
          <span className="font-semibold">
            {(currentPage - 1) * data.limit + 1}-
            {Math.min(currentPage * data.limit, data.total)}
          </span>{" "}
          od <span className="font-semibold">{data.total}</span>
        </p>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.listings.map((listing) => (
          <Card
            key={listing.id}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleListingClick(listing.id)}
          >
            {/* Image Container */}
            <div className="relative bg-gray-100 aspect-video overflow-hidden">
              {listing.imageUrl ? (
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                  <span className="text-gray-400">Nema slike</span>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-2 left-2 right-2 flex gap-2 flex-wrap">
                {listing.promotionTier && (
                  <Badge
                    variant="default"
                    className="bg-yellow-500 hover:bg-yellow-600 flex items-center gap-1"
                  >
                    <Zap className="h-3 w-3" />
                    {listing.promotionTier}
                  </Badge>
                )}
                {listing.isFeatured && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Star className="h-3 w-3" />
                    Istaknuto
                  </Badge>
                )}
              </div>

              {/* Save Button */}
              <button
                onClick={(e) => toggleSave(e, listing.id)}
                className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                  savedListings.has(listing.id)
                    ? "bg-red-500 text-white"
                    : "bg-white/90 hover:bg-white text-gray-600"
                }`}
              >
                <Heart
                  className="h-5 w-5"
                  fill={savedListings.has(listing.id) ? "currentColor" : "none"}
                />
              </button>
            </div>

            <CardContent className="p-4 space-y-3">
              {/* Title */}
              <div>
                <h3 className="font-semibold line-clamp-2 hover:text-blue-600">
                  {listing.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {listing.description}
              </p>

              {/* Location */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {listing.location}
              </div>

              {/* Rating */}
              {listing.rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.round(listing.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({listing.reviewCount} recenzija)
                  </span>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-bold text-lg">€{listing.price}</span>
                <span className="text-xs text-muted-foreground">
                  👁️ {listing.viewCount}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prethodna
          </Button>

          <div className="flex items-center gap-1">
            {[...Array(data.totalPages)].map((_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            disabled={currentPage === data.totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Sljedeća
          </Button>
        </div>
      )}
    </div>
  );
}
