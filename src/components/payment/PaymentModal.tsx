import { useState } from "react";
import { CardElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

interface PaymentModalProps {
  isOpen: boolean;
  listingTitle: string;
  amount: number;
  listingType: "standard" | "premium";
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function PaymentModal({
  isOpen,
  listingTitle,
  amount,
  listingType,
  onClose,
  onSuccess,
  onError,
}: PaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-w-md rounded-2xl bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Potvrda plaćanja</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Elements stripe={stripePromise}>
          <PaymentForm
            amount={amount}
            listingTitle={listingTitle}
            listingType={listingType}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      </div>
    </div>
  );
}

interface PaymentFormProps {
  amount: number;
  listingTitle: string;
  listingType: "standard" | "premium";
  onSuccess: () => void;
  onError: (error: string) => void;
}

function PaymentForm({
  amount,
  listingTitle,
  listingType,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError("Stripe nije dostupan");
      return;
    }

    setIsProcessing(true);
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        onError("Greška pri učitavanju kartice");
        return;
      }

      // For now, just simulate success
      // In production, this would call the backend to create a payment intent
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onSuccess();
    } catch (err) {
      onError(
        err instanceof Error ? err.message : "Greška pri obrada plaćanja"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-border bg-secondary/30 p-3">
        <p className="text-xs text-muted-foreground">Oglas</p>
        <p className="font-medium">{listingTitle}</p>
      </div>

      <div className="rounded-lg border border-border bg-secondary/30 p-3">
        <p className="text-xs text-muted-foreground">Tip objave</p>
        <p className="font-medium">
          {listingType === "premium"
            ? "TOP istaknut oglas (7 dana)"
            : "Standardna objava (30 dana)"}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-secondary/30 p-3">
        <p className="text-xs text-muted-foreground">Iznos</p>
        <p className="font-display text-2xl font-semibold text-[color:var(--gold-deep)]">
          {amount.toFixed(2)} €
        </p>
      </div>

      <div className="rounded-lg border border-input p-3">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "14px",
                color: "hsl(var(--foreground))",
                "::placeholder": {
                  color: "hsl(var(--muted-foreground))",
                },
              },
            },
          }}
        />
      </div>

      <Button
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Obrada...
          </>
        ) : (
          `Plati ${amount.toFixed(2)} €`
        )}
      </Button>

      <p className="text-center text-[11px] text-muted-foreground">
        Plaćanje je sigurno i šifrirano. Nema skrivenih troškova.
      </p>
    </form>
  );
}
