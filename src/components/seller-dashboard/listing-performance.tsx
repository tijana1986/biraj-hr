import { useSuspenseQuery } from "@tanstack/react-query";
import { getSellerListingPerformance } from "@/lib/seller-dashboard.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, MessageSquare, Star, TrendingUp, Archive } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface ListingPerformanceProps {
  sellerId: string;
}

export function ListingPerformance({ sellerId }: ListingPerformanceProps) {
  const { data: listings } = useSuspenseQuery({
    queryKey: ["sellerListingPerformance", sellerId],
    queryFn: () => getSellerListingPerformance({ sellerId }),
  });

  const activeListings = listings.filter((l: any) => l.isActive);
  const archivedListings = listings.filter((l: any) => !l.isActive);

  const ListingTable = ({ items, isArchived = false }: { items: any[]; isArchived?: boolean }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Oglas</TableHead>
            <TableHead>Kategorija</TableHead>
            <TableHead className="text-right">Prikazi</TableHead>
            <TableHead className="text-right">Sprema</TableHead>
            <TableHead className="text-right">Recenzije</TableHead>
            <TableHead className="text-right">Ocjena</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length > 0 ? (
            items.map((listing: any) => (
              <TableRow key={listing.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {listing.imageUrl && (
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    <span className="font-medium text-sm max-w-[200px] truncate">
                      {listing.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {listing.category}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    {listing.views.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    {listing.saves}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {listing.reviewCount > 0 && (
                    <span className="text-sm">{listing.reviewCount}</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {listing.avgReviewRating > 0 && (
                    <div className="flex items-center justify-end gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{listing.avgReviewRating}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {isArchived ? (
                    <Badge variant="secondary">Arhiviran</Badge>
                  ) : (
                    <Badge variant="default">Aktivan</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  {isArchived ? "Nema arhiviranih oglasa" : "Nema aktivnih oglasa"}
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Aktivnih oglasa</p>
          <p className="text-3xl font-bold">{activeListings.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Arhiviranih oglasa</p>
          <p className="text-3xl font-bold">{archivedListings.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Ukupni prikazi</p>
          <p className="text-3xl font-bold">
            {listings
              .reduce((sum: number, l: any) => sum + l.views, 0)
              .toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Active Listings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Aktivni oglasi</h3>
        <ListingTable items={activeListings} />
      </Card>

      {/* Archived Listings */}
      {archivedListings.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Arhivirani oglasi</h3>
          <ListingTable items={archivedListings} isArchived />
        </Card>
      )}

      {/* Top Performing Listings */}
      {listings.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Najbolje se performantnih oglasa</h3>
          <div className="space-y-4">
            {listings
              .sort((a: any, b: any) => b.views - a.views)
              .slice(0, 5)
              .map((listing: any) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {listing.imageUrl && (
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-sm">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {listing.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Prikazi</p>
                      <p className="text-lg font-bold">
                        {listing.views.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}
