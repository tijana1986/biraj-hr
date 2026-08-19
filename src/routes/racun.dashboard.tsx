import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { getSellerAnalytics, listingsBySeller, SELLERS, formatPrice } from "@/lib/mock/data";
import {
  TrendingUp,
  Package,
  Eye,
  MessageSquare,
  BarChart3,
  DollarSign,
} from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/racun/dashboard")({
  component: SellerDashboard,
});

function SellerDashboard() {
  const { user } = useAuth();

  // Map user to seller for demo purposes
  // In production, this would be stored in the user's profile
  const analytics = useMemo(() => {
    if (!user) return null;
    // Use the first seller's data as demo (user 1 -> seller 1)
    const sellerId = `s1`;
    return getSellerAnalytics(sellerId);
  }, [user]);


  if (!analytics) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        Podaci nisu dostupni.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold">Analitika i prodaja</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Praćenje performansi vaših oglasa, prihoda i trendova.
        </p>
      </div>

      {/* Immediate Wins Section */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-[color:var(--gold)]/10 to-transparent p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Zarada ove godine
            </span>
            <DollarSign className="h-5 w-5 text-[color:var(--gold-deep)]" />
          </div>
          <div className="mt-3 font-display text-3xl font-semibold">
            {formatPrice(analytics.totalEarningsYear)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Ukupno earnings
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-gradient-to-br from-[color:var(--navy)]/10 to-transparent p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Aktivni oglasi
            </span>
            <Package className="h-5 w-5 text-[color:var(--navy)]" />
          </div>
          <div className="mt-3 font-display text-3xl font-semibold">
            {analytics.activeListings}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Trenutno objavljeno
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Pregledi (7 dana)
            </span>
            <Eye className="h-5 w-5 text-[color:var(--gold-deep)]" />
          </div>
          <div className="mt-3 font-display text-3xl font-semibold">
            {analytics.totalViews}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Ukupno pregleda
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Nove poruke
            </span>
            <MessageSquare className="h-5 w-5 text-[color:var(--gold-deep)]" />
          </div>
          <div className="mt-3 font-display text-3xl font-semibold">
            {analytics.totalInquiries}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Upiti kupaca
          </div>
        </div>
      </section>

      {/* Revenue and Views Trends */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[color:var(--gold-deep)]" />
            <h2 className="font-display text-lg font-semibold">Prihod po mjesecima</h2>
          </div>

          <div className="space-y-3">
            {analytics.revenueByMonth.slice(-6).map((item) => {
              const maxRevenue = Math.max(
                ...analytics.revenueByMonth.map((m) => m.revenue)
              );
              const percentage = (item.revenue / maxRevenue) * 100;
              return (
                <div key={item.month}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.month}</span>
                    <span className="font-semibold">
                      {formatPrice(item.revenue)}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--gold-deep)]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Prosječan prihod</span>
              <span className="font-display font-semibold">
                {formatPrice(
                  analytics.revenueByMonth.reduce((s, m) => s + m.revenue, 0) /
                  analytics.revenueByMonth.length
                )}
              </span>
            </div>
          </div>
        </section>

        {/* Conversion Metrics */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[color:var(--gold-deep)]" />
            <h2 className="font-display text-lg font-semibold">Metrike konverzije</h2>
          </div>

          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Stopa konverzije</span>
                <span className="font-display font-semibold">
                  {analytics.conversionRate.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[color:var(--navy)] to-[color:var(--navy-deep)]"
                  style={{
                    width: `${Math.min(100, analytics.conversionRate)}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Ukupni pregledi
                </span>
                <span className="font-semibold">{analytics.totalViews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Upiti kupaca
                </span>
                <span className="font-semibold">{analytics.totalInquiries}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Prosječna cijena
                </span>
                <span className="font-semibold">
                  {formatPrice(
                    analytics.topProducts.length > 0
                      ? analytics.topProducts.reduce((s, p) => s + p.price, 0) /
                      analytics.topProducts.length
                      : 0
                  )}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Top Products */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Top oglasi</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Najbolje performing oglasi po pregledima
            </p>
          </div>
          <Link
            to="/racun/oglasi"
            className="text-xs font-semibold uppercase tracking-widest text-[color:var(--gold-deep)]"
          >
            Pogledaj sve →
          </Link>
        </div>

        <div className="space-y-4">
          {analytics.topProducts.map((product) => (
            <div
              key={product.listingId}
              className="rounded-xl border border-border bg-secondary/30 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-semibold line-clamp-1">
                    {product.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm">
                    <div className="text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {product.views}
                      </span>{" "}
                      pregleda
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {product.inquiries}
                      </span>{" "}
                      upita
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {product.conversionRate.toFixed(1)}%
                      </span>{" "}
                      konverzije
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-display font-semibold">
                    {formatPrice(product.price)}
                  </div>
                  {product.revenue > 0 && (
                    <div className="mt-1 text-xs font-medium text-[color:var(--gold-deep)]">
                      {formatPrice(product.revenue)} zarada
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Views Trend Chart */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center gap-2">
          <Eye className="h-5 w-5 text-[color:var(--gold-deep)]" />
          <h2 className="font-display text-lg font-semibold">Trendovi pregleda</h2>
        </div>

        <div className="space-y-2">
          {analytics.viewsTrend.slice(-14).map((item) => {
            const maxViews = Math.max(...analytics.viewsTrend.map((v) => v.views));
            const percentage = (item.views / maxViews) * 100;
            return (
              <div key={item.day} className="flex items-center gap-3">
                <span className="w-16 text-xs text-muted-foreground">
                  {item.day}
                </span>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--gold-deep)]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <span className="w-12 text-right text-xs font-medium">
                  {item.views}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
