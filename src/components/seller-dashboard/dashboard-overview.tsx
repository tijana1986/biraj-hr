import { useSuspenseQuery } from "@tanstack/react-query";
import { getSellerDashboard } from "@/lib/seller-dashboard.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, ShoppingBag, Eye, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface DashboardOverviewProps {
  sellerId: string;
}

export function DashboardOverview({ sellerId }: DashboardOverviewProps) {
  const { data } = useSuspenseQuery({
    queryKey: ["sellerDashboard", sellerId],
    queryFn: () => getSellerDashboard({ sellerId }),
  });

  const stats = [
    {
      label: "Aktivnih oglasa",
      value: data.stats.activeListings,
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
      change: null,
    },
    {
      label: "Prosječna ocjena",
      value: data.stats.averageRating.toFixed(1),
      icon: Star,
      color: "bg-yellow-50 text-yellow-600",
      reviews: data.stats.totalReviews,
    },
    {
      label: "Poruke",
      value: data.stats.totalMessages,
      icon: MessageSquare,
      color: "bg-green-50 text-green-600",
      change: null,
    },
    {
      label: "Prikazi",
      value: formatNumber(data.stats.totalViews),
      icon: Eye,
      color: "bg-purple-50 text-purple-600",
      change: null,
    },
    {
      label: "Površeni redoslijedi",
      value: data.stats.completionRate.toFixed(0) + "%",
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
      change: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  {(stat as any).reviews && (
                    <span className="text-xs text-muted-foreground">
                      ({(stat as any).reviews} recenzija)
                    </span>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
