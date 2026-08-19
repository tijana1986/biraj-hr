import { useState } from "react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getListingReviews, voteReviewHelpful, flagReview } from "@/lib/reviews.functions";
import { formatDistanceToNow } from "date-fns";
import { hrHR } from "date-fns/locale";
import { Star, ThumbsUp, ThumbsDown, AlertTriangle, Check } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReviewListProps {
  listingId: string;
  currentUserId?: string;
}

export function ReviewList({ listingId, currentUserId }: ReviewListProps) {
  const [sortBy, setSortBy] = useState<"recent" | "helpful" | "rating-high" | "rating-low">("recent");
  const [ratingFilter, setRatingFilter] = useState<number>();
  const [currentPage, setCurrentPage] = useState(1);
  const [flaggedReviewId, setFlaggedReviewId] = useState<string>();
  const [flagReason, setFlagReason] = useState<"spam" | "offensive" | "fake" | "irrelevant">();

  const queryClient = useQueryClient();
  const limit = 10;

  const { data, isLoading } = useSuspenseQuery({
    queryKey: ["reviews", listingId, sortBy, ratingFilter, currentPage],
    queryFn: () =>
      getListingReviews({
        listingId,
        sortBy,
        ratingFilter,
        limit,
        offset: (currentPage - 1) * limit,
      }),
  });

  const helpfulMutation = useMutation({
    mutationFn: ({ reviewId, isHelpful }: { reviewId: string; isHelpful: boolean }) =>
      voteReviewHelpful({ reviewId, isHelpful }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", listingId] });
    },
  });

  const flagMutation = useMutation({
    mutationFn: () =>
      flagReview({
        reviewId: flaggedReviewId!,
        reason: flagReason!,
      }),
    onSuccess: () => {
      setFlaggedReviewId(undefined);
      setFlagReason(undefined);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (data.reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nema recenzija još.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <Select value={sortBy} onValueChange={(v) => { setSortBy(v as any); setCurrentPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Najnovije</SelectItem>
            <SelectItem value="helpful">Najkorisnije</SelectItem>
            <SelectItem value="rating-high">Najviše zvjezdica</SelectItem>
            <SelectItem value="rating-low">Najmanje zvjezdica</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={ratingFilter ? String(ratingFilter) : "all"}
          onValueChange={(v) => {
            setRatingFilter(v === "all" ? undefined : Number(v));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sve ocjene" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sve ocjene</SelectItem>
            <SelectItem value="5">5 zvjezdica</SelectItem>
            <SelectItem value="4">4 zvjezdice</SelectItem>
            <SelectItem value="3">3 zvjezdice</SelectItem>
            <SelectItem value="2">2 zvjezdice</SelectItem>
            <SelectItem value="1">1 zvjezdica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {data.reviews.map((review) => (
          <Card key={review.id} className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src={review.reviewerAvatar || undefined} />
                  <AvatarFallback>
                    {review.reviewerName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{review.reviewerName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    {review.isVerifiedPurchase && (
                      <Badge variant="secondary" className="ml-2">
                        <Check className="h-3 w-3 mr-1" />
                        Potvrjeni kupac
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(review.createdAt), {
                  locale: hrHR,
                  addSuffix: true,
                })}
              </p>
            </div>

            {/* Title & Comment */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">{review.title}</h4>
              <p className="text-sm text-gray-700">{review.comment}</p>
            </div>

            {/* Seller Response */}
            {review.sellerResponse && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Odgovor prodavača
                </p>
                <p className="text-sm text-blue-800">{review.sellerResponse.response}</p>
              </div>
            )}

            {/* Helpful Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  helpfulMutation.mutate({
                    reviewId: review.id,
                    isHelpful: true,
                  })
                }
                disabled={helpfulMutation.isPending}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ThumbsUp className="h-4 w-4" />
                Korisno ({review.helpfulCount})
              </button>
              <button
                onClick={() =>
                  helpfulMutation.mutate({
                    reviewId: review.id,
                    isHelpful: false,
                  })
                }
                disabled={helpfulMutation.isPending}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ThumbsDown className="h-4 w-4" />
                Nije korisno ({review.unhelpfulCount})
              </button>
              <button
                onClick={() => setFlaggedReviewId(review.id)}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 ml-auto"
              >
                <AlertTriangle className="h-4 w-4" />
                Prijavi
              </button>
            </div>
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

          {Array.from({ length: data.totalPages }, (_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            disabled={currentPage === data.totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Sljedeća
          </Button>
        </div>
      )}

      {/* Flag Dialog */}
      <AlertDialog open={!!flaggedReviewId} onOpenChange={(open) => !open && setFlaggedReviewId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Prijavi recenziju</AlertDialogTitle>
            <AlertDialogDescription>
              Zašto prijaviš ovu recenziju?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            {(["spam", "offensive", "fake", "irrelevant"] as const).map((reason) => (
              <button
                key={reason}
                onClick={() => setFlagReason(reason)}
                className={`w-full text-left px-4 py-2 border rounded-lg hover:bg-accent ${
                  flagReason === reason ? "bg-accent border-primary" : ""
                }`}
              >
                <p className="font-medium">
                  {reason === "spam" && "Spam"}
                  {reason === "offensive" && "Uvredljivo"}
                  {reason === "fake" && "Lažno"}
                  {reason === "irrelevant" && "Nebitno"}
                </p>
              </button>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => flagMutation.mutate()}
              disabled={!flagReason || flagMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              Prijavi
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
