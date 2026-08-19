import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/checkout/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    sessionId: (search.session_id as string) || "",
  }),
  component: CheckoutSuccess,
});

async function fetchOrderBySessionId(sessionId: string) {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || "",
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
  );

  const { data } = await supabase
    .from("promotion_orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .limit(1)
    .single();

  return data;
}

function CheckoutSuccess() {
  const { sessionId } = useSearch({ from: "/checkout/success" });
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchOrderBySessionId(sessionId)
        .then((data) => setOrder(data))
        .finally(() => setLoading(false));
    }
  }, [sessionId]);

  if (loading) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-2xl px-6 py-20">
          <div className="text-center text-muted-foreground">
            Učitavanje podataka o plaćanju…
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

          <h1 className="font-display text-4xl font-semibold mb-2">Plaćanje je uspješno!</h1>
          <p className="text-muted-foreground mb-8">Hvala što ste odabrali promotion za svoj oglas.</p>

          {order ? (
            <div className="rounded-2xl border border-border bg-card p-8 mb-8 text-left">
              <h2 className="font-semibold mb-4">Detalji narudžbe</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Broj narudžbe:</span>
                  <span className="font-mono">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tier:</span>
                  <span className="capitalize font-semibold">{order.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cijena:</span>
                  <span className="font-semibold">€{order.price_eur}/week</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="capitalize font-semibold text-green-600">{order.payment_status}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Datum:</span>
                  <span>{new Date(order.completed_at).toLocaleDateString("hr-HR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ističe:</span>
                  <span>{new Date(order.expires_at).toLocaleDateString("hr-HR")}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 mb-8">
              <p className="text-muted-foreground">Narudžba nije pronađena.</p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Promotion će biti aktivna u roku od 1 sata. Tvoj oglas će biti vidljiv u "Premium oglasi" sekciji na početnoj stranici.
            </p>

            <div className="flex gap-3 justify-center">
              <Link to="/racun/oglasi">
                <Button variant="outline">Moji oglasi</Button>
              </Link>
              <Link to="/">
                <Button className="bg-[color:var(--gold-deep)] text-white hover:bg-[color:var(--gold-darker)]">
                  Povratak na početnu
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-muted/50 border border-border">
            <h3 className="font-semibold mb-2">📧 Potvrda plaćanja</h3>
            <p className="text-sm text-muted-foreground">
              Potvrda je poslana na <strong>{order?.email}</strong>. Provjeri spam mapu ako je ne vidiš.
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
