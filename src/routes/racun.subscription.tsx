import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/racun/subscription")({
  component: SubscriptionManagement,
});

async function fetchMySubscriptions() {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || "",
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
  );

  const { data } = await supabase
    .from("subscription_orders")
    .select("*")
    .order("created_at", { ascending: false });

  return data || [];
}

async function cancelSubscription(subscriptionId: string) {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || "",
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
  );

  const { error } = await supabase
    .from("subscription_orders")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", subscriptionId);

  if (error) throw error;
  return { success: true };
}

interface Subscription {
  id: string;
  tier: string;
  price_eur: number;
  status: "active" | "paused" | "cancelled" | "past_due";
  billing_interval: string;
  created_at: string;
  next_billing_date: string;
  current_period_end: string;
}

function SubscriptionManagement() {
  const { data: subscriptions = [], isLoading, refetch } = useQuery({
    queryKey: ["my-subscriptions"],
    queryFn: () => fetchMySubscriptions(),
  });

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const cancelMutation = useMutation({
    mutationFn: (subscriptionId: string) => cancelSubscription(subscriptionId),
    onSuccess: () => {
      setCancellingId(null);
      refetch();
    },
  });

  const activeSubscriptions = subscriptions.filter(
    (s: Subscription) => s.status === "active" || s.status === "paused"
  );
  const cancelledSubscriptions = subscriptions.filter(
    (s: Subscription) => s.status === "cancelled"
  );
  const pastDueSubscriptions = subscriptions.filter(
    (s: Subscription) => s.status === "past_due"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 border-green-200 text-green-800";
      case "past_due":
        return "bg-red-50 border-red-200 text-red-800";
      case "paused":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "cancelled":
        return "bg-gray-50 border-gray-200 text-gray-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "past_due":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "paused":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Aktivno";
      case "past_due":
        return "Zaostalo s Uplatom";
      case "paused":
        return "Pauzirано";
      case "cancelled":
        return "Otkazano";
      default:
        return status;
    }
  };

  return (
    <SiteShell>
      <div className="space-y-8 py-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-semibold">Upravljaj Subscription-ima</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Pregledaj i upravljaj svojim aktivnim subscription-ima
          </p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
            Učitavanje subscription-a…
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Nemaš aktivnih subscription-a. Zainteresiran si?
            </p>
            <Link to="/racun/oglasi">
              <Button>Kreni s Subscription-om</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Subscriptions */}
            {activeSubscriptions.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-semibold text-lg">Aktivni Subscription-i</h2>
                {activeSubscriptions.map((subscription: Subscription) => (
                  <Card
                    key={subscription.id}
                    className={`p-6 border-2 ${getStatusColor(subscription.status)}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(subscription.status)}
                        <div>
                          <h3 className="font-semibold">
                            {subscription.tier.charAt(0).toUpperCase() +
                              subscription.tier.slice(1)}{" "}
                            Subscription
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {getStatusLabel(subscription.status)}
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-bold">
                        €{subscription.price_eur.toFixed(2)}/{subscription.billing_interval === "month" ? "m" : "g"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                      <div>
                        <p className="text-muted-foreground">Aktivirano</p>
                        <p className="font-medium">
                          {new Date(subscription.created_at).toLocaleDateString(
                            "hr-HR"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sljedeća Uplata</p>
                        <p className="font-medium text-amber-600">
                          {new Date(
                            subscription.next_billing_date
                          ).toLocaleDateString("hr-HR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Period Završava</p>
                        <p className="font-medium">
                          {new Date(
                            subscription.current_period_end
                          ).toLocaleDateString("hr-HR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ID Subscription-a</p>
                        <p className="font-mono text-xs">
                          {subscription.id.slice(0, 8)}…
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            onClick={() => setCancellingId(subscription.id)}
                          >
                            Otkaži Subscription
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Otkanji Subscription?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Otkazivanjem subscription-a neće se nastaviti dalje uplate nakon
                            trenutnog perioda. Promocija će ostati aktivna do kraja
                            aktualno plaćenog perioda.
                          </AlertDialogDescription>
                          <div className="flex justify-end gap-2">
                            <AlertDialogCancel>Ponovi</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                cancelMutation.mutate(subscription.id)
                              }
                              disabled={cancelMutation.isPending}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              {cancelMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : null}
                              Potvrdi Otkazivanje
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Past Due Subscriptions */}
            {pastDueSubscriptions.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-semibold text-lg text-red-700">
                  Zaostala s Uplatom
                </h2>
                {pastDueSubscriptions.map((subscription: Subscription) => (
                  <Card
                    key={subscription.id}
                    className="p-6 border-2 bg-red-50 border-red-200"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <h3 className="font-semibold text-red-900">
                          Akcija Potrebna
                        </h3>
                        <p className="text-sm text-red-800">
                          Uplata nije uspjela. Molimo ažuriraj podatke o plaćanju.
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Ažuriraj Podatke o Plaćanju</Button>
                  </Card>
                ))}
              </div>
            )}

            {/* Cancelled Subscriptions */}
            {cancelledSubscriptions.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-semibold text-lg">Otkazani Subscription-i</h2>
                {cancelledSubscriptions.map((subscription: Subscription) => (
                  <Card key={subscription.id} className="p-6 opacity-60">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold line-through">
                          {subscription.tier.charAt(0).toUpperCase() +
                            subscription.tier.slice(1)}{" "}
                          Subscription
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Otkazano{" "}
                          {subscription.current_period_end &&
                            new Date(
                              subscription.current_period_end
                            ).toLocaleDateString("hr-HR")}
                        </p>
                      </div>
                      <span className="text-muted-foreground">
                        €{subscription.price_eur.toFixed(2)}/{subscription.billing_interval === "month" ? "m" : "g"}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="rounded-2xl border border-border bg-muted/30 p-6">
          <h3 className="font-semibold mb-3">Često Postavljena Pitanja</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Kada će se izvršiti sljedeća uplata?</strong> Uplata će se
              izvršiti na datum koji vidiš u "Sljedeća Uplata" sekciji.
            </p>
            <p>
              <strong>Mogu li otkazati subscription?</strong> Da, možeš ga otkazati
              u bilo kojem vremenu. Otkazivanje će biti aktivno od sljedećeg datuma
              naplate.
            </p>
            <p>
              <strong>Što se događa nakon otkazivanja?</strong> Promocija će ostati
              aktivna do kraja aktualno plaćenog perioda, zatim će biti
              deaktivirana.
            </p>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
