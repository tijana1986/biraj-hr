import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { useAuth } from "@/lib/auth";
import { DashboardOverview } from "@/components/seller-dashboard/dashboard-overview";
import { PerformanceChart } from "@/components/seller-dashboard/performance-chart";
import { RecentActivity } from "@/components/seller-dashboard/recent-activity";
import { ReviewsSection } from "@/components/seller-dashboard/reviews-section";
import { ListingPerformance } from "@/components/seller-dashboard/listing-performance";

export const Route = createFileRoute("/racun/dashboard")({
  component: SellerDashboard,
});

function SellerDashboard() {
  const { user } = useAuth();

  if (!user) {
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
        <h1 className="font-display text-3xl font-semibold">Kontrolna ploča prodavača</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Praćenje performansi vaših oglasa, prihoda, poruka i ocjena.
        </p>
      </div>

      {/* Overview Stats */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 animate-pulse h-24 rounded-lg"
              />
            ))}
          </div>
        }
      >
        <DashboardOverview sellerId={user.id} />
      </Suspense>

      {/* Performance Charts */}
      <Suspense
        fallback={
          <div className="bg-gray-200 animate-pulse h-96 rounded-lg" />
        }
      >
        <PerformanceChart sellerId={user.id} />
      </Suspense>

      {/* Recent Activity */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 animate-pulse h-96 rounded-lg"
              />
            ))}
          </div>
        }
      >
        <RecentActivity sellerId={user.id} />
      </Suspense>

      {/* Reviews and Ratings */}
      <Suspense
        fallback={
          <div className="bg-gray-200 animate-pulse h-96 rounded-lg" />
        }
      >
        <ReviewsSection sellerId={user.id} />
      </Suspense>

      {/* Listing Performance */}
      <Suspense
        fallback={
          <div className="bg-gray-200 animate-pulse h-96 rounded-lg" />
        }
      >
        <ListingPerformance sellerId={user.id} />
      </Suspense>
    </div>
  );
}
