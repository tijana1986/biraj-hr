import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/subscribe")({
  component: Subscribe,
});

function Subscribe() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    handleSubscribe();
  }, [user, loading]);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);

      // Get or create Stripe customer
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("stripe_customer_id")
        .eq("user_id", user!.id)
        .single();

      let customerId = customer?.stripe_customer_id;

      if (!customerId) {
        // Create new customer via server function
        const response = await fetch("/api/stripe/create-customer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user!.id, email: user!.email }),
        });

        const data = await response.json();
        if (data.error) {
          setError(data.error);
          return;
        }
        customerId = data.customerId;
      }

      // Create checkout session
      const checkoutResponse = await fetch("/api/stripe/create-subscription-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });

      const checkoutData = await checkoutResponse.json();
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        setError(checkoutData.error || "Greška pri kreiranju checkout-a");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Greška pri kreiranju pretplate");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Greška</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <Button onClick={() => navigate({ to: "/dashboard" })}>
            Nazad na Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
