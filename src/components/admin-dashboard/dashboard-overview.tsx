import { useSuspenseQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "@/lib/admin-dashboard.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
} from "lucide-react";

export function DashboardOverview() {
  const { data } = useSuspenseQuery({
    queryKey: ["adminDashboard"],
    queryFn: () => getAdminDashboard({}),
  });

  const stats = [
    {
      label: "Ukupni korisnici",
      value: data.metrics.totalUsers || 0,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Aktivni prodavači",
      value: data.metrics.activeUsers || 0,
      icon: ShoppingCart,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Ukupni redoslijedi",
      value: data.metrics.totalOrders || 0,
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Bruto volume",
      value: `${(data.metrics.grossVolume / 1000).toFixed(0)}k KM`,
      icon: DollarSign,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "Platformski prihod",
      value: `${data.metrics.platformRevenue.toFixed(0)} KM`,
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Alert Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-orange-200 bg-orange-50">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <p className="font-semibold text-orange-900">Na čekanju moderacije</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {data.pendingModeration.length}
          </p>
          <p className="text-xs text-orange-700 mt-2">
            Čeka se pregled sadržaja
          </p>
        </Card>

        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-red-600" />
            <p className="font-semibold text-red-900">Otvoreni sporovi</p>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {data.openDisputes.length}
          </p>
          <p className="text-xs text-red-700 mt-2">
            Zahtjeva donošenja odluke
          </p>
        </Card>

        <Card className="p-6 border-blue-200 bg-blue-50">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <p className="font-semibold text-blue-900">Suspenzirani korisnici</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {data.recentSuspensions.length}
          </p>
          <p className="text-xs text-blue-700 mt-2">
            Aktivne suspenzije
          </p>
        </Card>
      </div>
    </div>
  );
}
