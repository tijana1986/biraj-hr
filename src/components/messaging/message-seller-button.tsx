import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { getOrCreateConversation } from "@/lib/messaging.functions";
import { MessageCircle, Loader2 } from "lucide-react";

interface MessageSellerButtonProps {
  listingId: string;
  sellerId: string;
  sellerName?: string;
  currentUserId?: string;
  className?: string;
}

export function MessageSellerButton({
  listingId,
  sellerId,
  sellerName,
  currentUserId,
  className,
}: MessageSellerButtonProps) {
  const navigate = useNavigate();

  // Disable if user is the seller or not logged in
  const isDisabled = !currentUserId || currentUserId === sellerId;

  const mutation = useMutation({
    mutationFn: () =>
      getOrCreateConversation({
        listingId,
        otherUserId: sellerId,
      }),
    onSuccess: (conversationId) => {
      navigate({
        to: "/poruke",
        search: { conversation: conversationId },
      });
    },
  });

  return (
    <Button
      onClick={() => mutation.mutate()}
      disabled={isDisabled || mutation.isPending}
      className={className}
    >
      {mutation.isPending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Učitavanje...
        </>
      ) : (
        <>
          <MessageCircle className="h-4 w-4 mr-2" />
          Kontaktiraj {sellerName ? sellerName : "prodavača"}
        </>
      )}
    </Button>
  );
}
