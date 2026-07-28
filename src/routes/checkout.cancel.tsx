import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export const Route = createFileRoute("/checkout/cancel")({
  component: CheckoutCancel,
});

function CheckoutCancel() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-2xl px-6 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>

          <h1 className="font-display text-4xl font-semibold mb-2">Plaćanje otkazano</h1>
          <p className="text-muted-foreground mb-8">Promotion nije aktiviiran jer je plaćanje otkazano.</p>

          <div className="rounded-2xl border border-border bg-card p-8 mb-8">
            <h2 className="font-semibold mb-4">Što se desilo?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Plaćanje je otkazano tijekom procesa. Novac nije upućen. Možeš pokušati ponovno ili odabrati drugačiji tier.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ Tvoj oglas je i dalje vidljiv na marketplace-u</p>
              <p>✓ Nema dodatnih naknada</p>
              <p>✓ Možeš pokušati promotirati kad god želiš</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link to="/racun/oglasi">
              <Button variant="outline">Moji oglasi</Button>
            </Link>
            <Link to="/">
              <Button className="bg-[color:var(--navy)] text-white hover:bg-[color:var(--navy-deep)]">
                Povratak na početnu
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
