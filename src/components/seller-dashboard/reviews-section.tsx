import { useSuspenseQuery } from "@tanstack/react-query";
import { getSellerReviewsAndRatings } from "@/lib/seller-dashboard.functions";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MessageCircle, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { hrHR } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ReviewsSectionProps {
  sellerId: string;
}

export function ReviewsSection({ sellerId }: ReviewsSectionProps) {
  const { data } = useSuspenseQuery({
    queryKey: ["sellerReviewsAndRatings", sellerId],
    queryFn: () => getSellerReviewsAndRatings({ sellerId }),
  });

  const ratingDistribution = [
    { rating: 5, count: data.rating.rating5Count },
    { rating: 4, count: data.rating.rating4Count },
    { rating: 3, count: data.rating.rating3Count },
    { rating: 2, count: data.rating.rating2Count },
    { rating: 1, count: data.rating.rating1Count },
  ];

  const colors = [
    "#10b981", // 5 stars - green
    "#84cc16", // 4 stars - lime
    "#eab308", // 3 stars - yellow
    "#f97316", // 2 stars - orange
    "#ef4444", // 1 star - red
  ];

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Ocjene i recenzije</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Average Rating */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold">
                  {data.rating.averageRating.toFixed(1)}
                </span>
                <div className="flex flex-col">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i <=
                          Math.round(data.rating.averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {data.rating.totalReviews} recenzija
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Response Rate */}
          <div className="flex flex-col justify-center">
            <p className="text-sm text-muted-foreground mb-1">
              Odgovori na recenzije
            </p>
            <p className="text-3xl font-bold text-green-600">
              {data.rating.responseRate.toFixed(0)}%
            </p>
          </div>

          {/* Total Reviews */}
          <div className="flex flex-col justify-center">
            <p className="text-sm text-muted-foreground mb-1">
              Ukupne recenzije
            </p>
            <p className="text-3xl font-bold">{data.rating.totalReviews}</p>
          </div>
        </div>
      </Card>

      {/* Rating Distribution Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Distribucija ocjena</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ratingDistribution.reverse()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="rating"
              label={{ value: "Zvjezdice", position: "right", offset: 10 }}
            />
            <YAxis label={{ value: "Broj recenzija", angle: -90 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6">
              {ratingDistribution.reverse().map((item, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[4 - index]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Reviews */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Nedavne recenzije</h3>
          <Button variant="ghost" size="sm">
            Vidi sve
          </Button>
        </div>

        <div className="space-y-4">
          {data.recentReviews.length > 0 ? (
            data.recentReviews.map((review: any) => (
              <div
                key={review.id}
                className="pb-4 border-b last:border-0"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={review.profiles?.avatar_url || undefined}
                      />
                      <AvatarFallback>
                        {review.profiles?.name?.slice(0, 2).toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {review.profiles?.name || "Anonimni korisnik"}
                        </p>
                        {review.is_verified_purchase && (
                          <Badge variant="secondary" className="text-xs">
                            Potvrjeni kupac
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.created_at), {
                            locale: hrHR,
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="ml-11">
                  <p className="font-medium text-sm mb-1">{review.title}</p>
                  <p className="text-sm text-gray-700 mb-2">{review.comment}</p>

                  {/* Seller Response */}
                  {review.seller_review_responses?.[0] && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                      <p className="text-xs font-semibold text-blue-900 mb-1">
                        Odgovor prodavača
                      </p>
                      <p className="text-sm text-blue-800">
                        {review.seller_review_responses[0].response}
                      </p>
                    </div>
                  )}

                  {/* Helpful Count */}
                  <div className="flex items-center gap-2 mt-2">
                    <button className="text-xs text-muted-foreground hover:text-foreground">
                      👍 Korisno ({review.helpful_count})
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nema recenzija
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
