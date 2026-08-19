import { useSuspenseQuery } from "@tanstack/react-query";
import { getApiUsageStats } from "@/lib/api-integration.functions";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp, AlertTriangle, Clock } from "lucide-react";

interface ApiUsageAnalyticsProps {
  apiKeyId: string;
}

export function ApiUsageAnalytics({ apiKeyId }: ApiUsageAnalyticsProps) {
  const { data: usageData } = useSuspenseQuery({
    queryKey: ["apiUsage", apiKeyId],
    queryFn: () => getApiUsageStats({ apiKeyId }),
  });

  if (!usageData) return null;

  const { stats, logs } = usageData;

  // Group by endpoint
  const endpointStats = logs?.reduce((acc: any, log: any) => {
    if (!acc[log.endpoint]) {
      acc[log.endpoint] = { count: 0, errors: 0, avgTime: 0, totalTime: 0 };
    }
    acc[log.endpoint].count++;
    if (log.status_code && log.status_code >= 400) {
      acc[log.endpoint].errors++;
    }
    acc[log.endpoint].totalTime += log.response_time_ms || 0;
    acc[log.endpoint].avgTime = Math.round(
      acc[log.endpoint].totalTime / acc[log.endpoint].count
    );
    return acc;
  }, {});

  const statCards = [
    {
      label: "Ukupni zahtjevi",
      value: stats.totalRequests,
      icon: Activity,
      color: "blue",
    },
    {
      label: "Uspješni zahtjevi",
      value: stats.successfulRequests,
      icon: TrendingUp,
      color: "green",
    },
    {
      label: "Stopa uspjeha",
      value: `${stats.successRate}%`,
      icon: Activity,
      color: "green",
    },
    {
      label: "Prosječno vrijeme",
      value: `${stats.avgResponseTime}ms`,
      icon: Clock,
      color: "purple",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
    red: "bg-red-50 border-red-200",
  };

  // Prepare chart data - group by date
  const chartData = logs?.reduce((acc: any, log: any) => {
    const date = new Date(log.created_at).toLocaleDateString("hr-HR", {
      month: "short",
      day: "numeric",
    });
    if (!acc[date]) {
      acc[date] = { date, zahtjevi: 0, greške: 0 };
    }
    acc[date].zahtjevi++;
    if (log.status_code && log.status_code >= 400) {
      acc[date].greške++;
    }
    return acc;
  }, {});

  const chartDataArray = Object.values(chartData || {}).slice(-30);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const bgClass = colorClasses[card.color as keyof typeof colorClasses];

          return (
            <Card key={index} className={`p-4 border ${bgClass}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">{card.label}</p>
                  <p className="text-2xl font-bold mt-2">{card.value}</p>
                </div>
                <Icon className="h-6 w-6 opacity-50" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Daily Requests Chart */}
      {chartDataArray && chartDataArray.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Dnevni zahtjevi</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartDataArray as any}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="zahtjevi" fill="#3b82f6" name="Zahtjevi" />
              <Bar dataKey="greške" fill="#ef4444" name="Greške" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Endpoints Performance */}
      {endpointStats && Object.keys(endpointStats).length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Performanse po krajnjoj točki</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Object.entries(endpointStats).map(([endpoint, stats]: [string, any]) => (
              <div
                key={endpoint}
                className="flex items-start justify-between p-3 bg-gray-50 rounded"
              >
                <div className="text-sm flex-1">
                  <p className="font-medium truncate">{endpoint}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.count} zahtjeva
                    {stats.errors > 0 && ` • ${stats.errors} grešaka`}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">{stats.avgTime}ms</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((stats.errors / stats.count) * 100)}% greške
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Summary */}
      {stats.failedRequests > 0 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-900">Upozorenje: Neuspješni zahtjevi</p>
              <p className="text-xs text-yellow-700 mt-1">
                Imali ste {stats.failedRequests} neuspješnih zahtjeva u
                perioduu. Provjerite ponos i grešku logove.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
