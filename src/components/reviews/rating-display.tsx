import { Star } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getSellerRating } from "@/lib/reviews.functions";

interface RatingDisplayProps {
  sellerId: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function RatingDisplay({ sellerId, size = "md", showText = true }: RatingDisplayProps) {
  const { data: rating } = useSuspenseQuery({
    queryKey: ["sellerRating", sellerId],
    queryFn: () => getSellerRating({ sellerId }),
  });

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {stars.map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= Math.round(rating.averageRating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
      {showText && (
        <div className={`${textClasses[size]} text-muted-foreground`}>
          <span className="font-semibold text-foreground">
            {rating.averageRating.toFixed(1)}
          </span>
          <span> ({rating.totalReviews})</span>
        </div>
      )}
    </div>
  );
}
