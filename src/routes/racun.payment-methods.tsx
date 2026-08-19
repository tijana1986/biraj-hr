import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CreditCard, Loader2, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/racun/payment-methods")({
  component: PaymentMethods,
});

async function fetchPaymentMethods() {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || "",
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
  );

  const { data } = await supabase
    .from("payment_methods")
    .select("*")
    .order("created_at", { ascending: false });

  return data || [];
}

async function deletePaymentMethod(methodId: string) {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || "",
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
  );

  const { error } = await supabase
    .from("payment_methods")
    .delete()
    .eq("id", methodId);

  if (error) throw error;
  return { success: true };
}

interface PaymentMethod {
  id: string;
  stripe_payment_method_id: string;
  card_brand: string;
  card_last4: string;
  card_exp_month: number;
  card_exp_year: number;
  is_default: boolean;
  created_at: string;
}

function PaymentMethods() {
  const { data: methods = [], isLoading, refetch } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => fetchPaymentMethods(),
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (methodId: string) => deletePaymentMethod(methodId),
    onSuccess: () => {
      setDeletingId(null);
      refetch();
    },
  });

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "visa":
        return "💳 Visa";
      case "mastercard":
        return "💳 Mastercard";
      case "amex":
        return "💳 American Express";
      default:
        return "💳 Card";
    }
  };

  return (
    <SiteShell>
      <div className="space-y-6 max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold">Načini Plaćanja</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Upravljaj svojom kartama i metodama plaćanja
            </p>
          </div>
          <Button className="gap-2 bg-[color:var(--gold-deep)] text-white hover:bg-[color:var(--gold-darker)]">
            <Plus className="h-4 w-4" />
            Dodaj Karticu
          </Button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
            Učitavanje metoda plaćanja…
          </div>
        ) : methods.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nema dodanih kartica</p>
            <Button className="bg-[color:var(--gold-deep)] text-white hover:bg-[color:var(--gold-darker)]">
              Dodaj Prvu Karticu
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {methods.map((method: PaymentMethod) => (
              <Card key={method.id} className="p-6 border-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{getCardIcon(method.card_brand)}</div>
                    <div>
                      <p className="font-semibold">
                        {method.card_brand} •••• {method.card_last4}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ističe: {method.card_exp_month}/{method.card_exp_year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {method.is_default && (
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Zadana
                      </span>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingId(method.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Obriši Karticu?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ova kartica ({method.card_brand} •••• {method.card_last4}) će biti
                          permanentno obrisana. Nećeš je moći koristiti za plaćanja.
                        </AlertDialogDescription>
                        <div className="flex justify-end gap-2">
                          <AlertDialogCancel>Ponovi</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              deleteMutation.mutate(method.id)
                            }
                            disabled={deleteMutation.isPending}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : null}
                            Obriši
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="rounded-2xl border border-border bg-muted/30 p-6">
          <h3 className="font-semibold mb-3">Sigurnost</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>✓ Sve kartice su šifranes sa SSL 256-bit šifrenjem</li>
            <li>✓ Brojevi kartica se nikad ne čuvaju na našim serverima</li>
            <li>✓ Koristimo Stripe za sigurno procesiranje plaćanja</li>
            <li>✓ Možeš obrisati karticu u bilo kojem trenutku</li>
          </ul>
        </div>
      </div>
    </SiteShell>
  );
}
