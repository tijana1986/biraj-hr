import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { createReview } from "@/lib/reviews.functions";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface ReviewFormProps {
  listingId: string;
  sellerId: string;
  orderId?: string;
  onSuccess?: () => void;
}

export function ReviewForm({ listingId, sellerId, orderId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      createReview({
        listingId,
        sellerId,
        orderId,
        rating,
        title,
        comment,
      }),
    onSuccess: () => {
      setRating(5);
      setTitle("");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["reviews", listingId] });
      toast.success("Recenzija je objavljena!");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Greška pri objavljivanju");
    },
  });

  const canSubmit = title.trim().length >= 5 && comment.trim().length >= 10;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Opiši svoju iskustvo</h3>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Ocjena</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-8 w-8 transition-colors cursor-pointer ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Naslov (najmanje 5 znakova)
        </label>
        <Input
          id="title"
          placeholder="Npr. Sjajan proizvod, brza isporuka!"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          disabled={mutation.isPending}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {title.length}/200
        </p>
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Recenzija (najmanje 10 znakova)
        </label>
        <Textarea
          id="comment"
          placeholder="Detaljno opiši svoju iskustvo s ovim proizvodom..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={2000}
          disabled={mutation.isPending}
          rows={6}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {comment.length}/2000
        </p>
      </div>

      {/* Submit */}
      <div className="flex gap-2">
        <Button
          onClick={() => mutation.mutate()}
          disabled={!canSubmit || mutation.isPending}
          className="w-full"
        >
          {mutation.isPending ? "Objavljujem..." : "Objavi recenziju"}
        </Button>
      </div>

      {/* Info */}
      <p className="text-xs text-muted-foreground mt-4">
        Recenzije su vidljive javnosti i mogu pomoći drugima da donesu bolju odluku.
        {orderId && " Ova recenzija je označena kao potvrjeni kupac."}
      </p>
    </Card>
  );
}
