import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/racun/povrat-novca")({
  component: RefundPage,
});

async function fetchMyOrders() {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || "",
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
  );

  const { data } = await supabase
    .from("promotion_orders")
    .select("*")
    .eq("payment_status", "completed")
    .order("created_at", { ascending: false });

  return data || [];
}

async function requestRefund(orderId: string, reason: string) {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || "",
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
  );

  const { error } = await supabase
    .from("promotion_orders")
    .update({
      payment_status: "refund_requested",
      refund_reason: reason,
      refund_requested_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) throw error;

  return { success: true };
}

interface Order {
  id: string;
  tier: string;
  price_eur: number;
  created_at: string;
  expires_at: string;
  payment_status: string;
}

function RefundPage() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => fetchMyOrders(),
  });

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [requestedRefunds, setRequestedRefunds] = useState<Set<string>>(new Set());

  const refundMutation = useMutation({
    mutationFn: (data: { orderId: string; reason: string }) =>
      requestRefund(data.orderId, data.reason),
    onSuccess: () => {
      setRequestedRefunds((prev) => new Set([...prev, selectedOrderId as string]));
      refetch();
      setSelectedOrderId(null);
      setRefundReason("");
    },
  });

  return (
    <SiteShell>
      <div className="space-y-6 max-w-2xl mx-auto py-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-semibold">Zahtjev za Povrat Novca</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Zatraži povrat novca za aktivni promotion. Molimo napomeni razlog.
          </p>
        </div>

        {/* Info Box */}
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50/50 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Važna Napomena</p>
              <p>
                Povratci novca se procesiraju u roku od 5-7 radnih dana. Promotion će biti
                odmah deaktiviran nakon odobrenja povrata. Nemojte pokušavati zatražiti više
                povrata za istu narudžbu.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
            Učitavanje vaših narudžbi…
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              Nemate aktivnih promotiona za povrat.
            </p>
            <Button
              onClick={() => navigate({ to: "/racun/placanja" })}
              variant="outline"
              className="mt-4"
            >
              Pogledaj povijest plaćanja
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: Order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">
                      {order.tier.charAt(0).toUpperCase() + order.tier.slice(1)} Promotion
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      ID: {order.id}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-amber-600">
                    €{order.price_eur.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Aktivirano</p>
                    <p className="font-medium">
                      {new Date(order.created_at).toLocaleDateString("hr-HR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ističe</p>
                    <p className="font-medium">
                      {new Date(order.expires_at).toLocaleDateString("hr-HR")}
                    </p>
                  </div>
                </div>

                {requestedRefunds.has(order.id) ? (
                  <div className="rounded-lg bg-green-50 p-3 flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Zahtjev za povrat je poslан - čekajući obradu
                  </div>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        onClick={() => setSelectedOrderId(order.id)}
                        variant="destructive"
                        className="w-full"
                      >
                        Zatraži Povrat Novca
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-md">
                      <AlertDialogTitle>Potvrdi Zahtjev za Povrat</AlertDialogTitle>
                      <AlertDialogDescription>
                        Molimo objasni razlog za povrat. Ovo polje je obavezno.
                      </AlertDialogDescription>

                      <div className="space-y-4 py-4">
                        <Textarea
                          placeholder="Objasni razlog za povrat..."
                          value={refundReason}
                          onChange={(e) => setRefundReason(e.target.value)}
                          className="min-h-24"
                        />
                        <p className="text-xs text-muted-foreground">
                          Zahtjev će biti proslijeđen našem timu na obradu. Razlog je obavezan.
                        </p>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <AlertDialogCancel onClick={() => setRefundReason("")}>
                          Otkaži
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            if (refundReason.trim()) {
                              refundMutation.mutate({
                                orderId: order.id,
                                reason: refundReason,
                              });
                            }
                          }}
                          disabled={!refundReason.trim() || refundMutation.isPending}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {refundMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          Potvrdi Povrat
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        )}

        {/* FAQ Section */}
        <div className="rounded-2xl border border-border bg-muted/30 p-6 mt-8">
          <h3 className="font-semibold mb-4">Često Postavljena Pitanja</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-foreground">Koliko traje obrada povrata?</p>
              <p className="text-muted-foreground">
                Povrati se obrađuju u roku od 5-7 radnih dana na originalnu karticu.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">
                Što se događa s mojim promotionom?
              </p>
              <p className="text-muted-foreground">
                Promotion će biti odmah deaktiviran nakon što zatražiš povrat. Oglas će biti
                uklonjen iz premium sekcije.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Mogu li otkazati povrat?</p>
              <p className="text-muted-foreground">
                Nakon što pošalješ zahtjev, možeš kontaktirati support za otkazivanje u roku
                od 24 sata.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
