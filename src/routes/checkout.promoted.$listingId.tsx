import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LISTINGS, PROMOTION_PRICING } from "@/lib/mock/data";
import { Zap, Shield, TrendingUp, Star } from "lucide-react";

export const Route = createFileRoute("/checkout/promoted/$listingId")({
  component: CheckoutPromoted,
});

function CheckoutPromoted() {
  const { listingId } = Route.useParams();
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<"spotlight" | "featured" | "premium" | "vip">("featured");
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listing = LISTINGS.find((l) => l.id === listingId);
  if (!listing) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-2xl px-6 py-20">
          <h1 className="text-2xl font-bold text-destructive">Oglas nije pronađen</h1>
        </section>
      </SiteShell>
    );
  }

  const pricing = PROMOTION_PRICING[selectedTier];
  const weeklyPrice = pricing.price;
  const monthlyPrice = (weeklyPrice * 4.33).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.includes("@")) {
      setError("Unesite ispravnu e-poštu");
      return;
    }
    if (!cardNumber || cardNumber.length < 10) {
      setError("Unesite ispravnu karticu");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const order = {
      id: `order-${Date.now()}`,
      listingId,
      tier: selectedTier,
      price: weeklyPrice,
      email,
      status: "completed",
      date: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      const orders = JSON.parse(sessionStorage.getItem("orders") || "[]");
      orders.push(order);
      sessionStorage.setItem("orders", JSON.stringify(orders));
    }

    navigate({ to: "/checkout/success", search: { orderId: order.id } });
  };

  return (
    <SiteShell>
      <section className="mx-auto grid max-w-4xl gap-8 px-6 py-12 md:grid-cols-2">
        {/* Listing Info */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl font-semibold mb-4">Promotion za oglas</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{listing.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">ID: {listing.id}</p>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="font-semibold mb-3">Odaberi promotion tier:</h4>
              <div className="space-y-2">
                {(["spotlight", "featured", "premium", "vip"] as const).map((tier) => {
                  const t = PROMOTION_PRICING[tier];
                  return (
                    <label
                      key={tier}
                      className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-secondary"
                      style={{
                        borderColor: selectedTier === tier ? "var(--gold-deep)" : "var(--border)",
                        backgroundColor: selectedTier === tier ? "rgba(212, 175, 55, 0.05)" : "transparent",
                      }}
                    >
                      <input
                        type="radio"
                        name="tier"
                        value={tier}
                        checked={selectedTier === tier}
                        onChange={(e) => setSelectedTier(e.target.value as typeof tier)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          {tier === "spotlight" && <Zap className="h-4 w-4" />}
                          {tier === "featured" && <Star className="h-4 w-4" />}
                          {tier === "premium" && <Shield className="h-4 w-4" />}
                          {tier === "vip" && <TrendingUp className="h-4 w-4" />}
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">{t.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">€{t.price}/week</div>
                        <div className="text-xs text-muted-foreground">~€{monthlyPrice}/month</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between">
                <span>Cijena tjedno:</span>
                <span className="font-semibold">€{weeklyPrice}</span>
              </div>
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Osnovna cijena (4 tjedna):</span>
                <span>€{(weeklyPrice * 4).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl font-semibold mb-6">Plaćanje</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">E-pošta</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.com"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Broj kartice</label>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                placeholder="4242 4242 4242 4242"
                className="mt-1 font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">Test: 4242 4242 4242 4242</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">MM/YY</label>
                <Input placeholder="12/25" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">CVC</label>
                <Input placeholder="123" className="mt-1" />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[color:var(--gold-deep)] text-white hover:bg-[color:var(--gold-darker)]"
            >
              {loading ? "Obrada..." : `Kupi za €${weeklyPrice}`}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Novac će biti upućen na Nexora grupu račun.
            </p>
          </form>

          <div className="mt-6 border-t border-border pt-4">
            <h3 className="text-sm font-semibold mb-2">Primjena promocije:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              {pricing.benefits.map((b, i) => (
                <li key={i}>✓ {b}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
