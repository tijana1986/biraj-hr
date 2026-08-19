import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/racun/subscription-potvrda")({
  validateSearch: (search: Record<string, unknown>) => ({
    sessionId: (search.session_id as string) || "",
  }),
  component: SubscriptionSuccess,
});

async function fetchSubscriptionBySessionId(sessionId: string) {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || "",
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
  );

  const { data } = await supabase
    .from("subscription_orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .limit(1)
    .single();

  return data;
}

interface SubscriptionOrder {
  id: string;
  tier: string;
  price_eur: number;
  status: string;
  billing_interval: string;
  created_at: string;
  next_billing_date: string;
  email?: string;
}

function SubscriptionSuccess() {
  const { sessionId } = useSearch({ from: "/racun/subscription-potvrda" });
  const [subscription, setSubscription] = useState<SubscriptionOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchSubscriptionBySessionId(sessionId)
        .then((data) => setSubscription(data))
        .catch((err) => console.error("Failed to fetch subscription:", err))
        .finally(() => setLoading(false));
    }
  }, [sessionId]);

  if (loading) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-2xl px-6 py-20">
          <div className="text-center text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Učitavanje podataka o subscription-u…
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-2xl px-6 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>

          <h1 className="font-display text-4xl font-semibold mb-2">Subscription je Aktiviran!</h1>
          <p className="text-muted-foreground mb-8">
            Hvala što ste odabrali mjesečni subscription za svoj oglas.
          </p>

          {subscription ? (
            <div className="rounded-2xl border border-border bg-card p-8 mb-8 text-left">
              <h2 className="font-semibold mb-4">Detalji Subscription-a</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Broj Subscription-a:</span>
                  <span className="font-mono">{subscription.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tier:</span>
                  <span className="capitalize font-semibold">{subscription.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mjesečna Cijena:</span>
                  <span className="font-semibold">€{subscription.price_eur.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interval Naplate:</span>
                  <span className="capitalize font-semibold">{subscription.billing_interval}o</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Aktivirano:</span>
                  <span>{new Date(subscription.created_at).toLocaleDateString("hr-HR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sljedeća Uplata:</span>
                  <span className="font-semibold text-amber-600">
                    {new Date(subscription.next_billing_date).toLocaleDateString("hr-HR")}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 mb-8">
              <p className="text-muted-foreground">Subscription nije pronađen.</p>
            </div>
          )}

          <div className="space-y-3 mb-6">
            <p className="text-sm text-muted-foreground">
              Tvoj subscription je sada aktivan. Oglas će biti vidljiv u "Premium oglasi" sekciji
              tijekom trajanja subscription-a. Automatska uplata će se izvršiti na dan navedene "Sljedeće Uplate".
            </p>

            <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Važna Napomena:</strong> Možeš otkazati subscription u bilo kojem vremenu
                iz postavki računa. Otkazivanje će biti aktivno od sljedećeg datuma naplate.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link to="/racun/oglasi">
              <Button variant="outline">Moji Oglasi</Button>
            </Link>
            <Link to="/racun/subscription">
              <Button className="bg-[color:var(--gold-deep)] text-white hover:bg-[color:var(--gold-darker)]">
                Upravljaj Subscription-ima
              </Button>
            </Link>
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-muted/50 border border-border">
            <h3 className="font-semibold mb-2">📧 Potvrda E-mail</h3>
            <p className="text-sm text-muted-foreground">
              Potvrda je poslana na <strong>{subscription?.email || "vašu e-mail adresu"}</strong>.
              Ako je nema, provjeri spam mapu.
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
