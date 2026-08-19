import { useSuspenseQuery } from "@tanstack/react-query";
import { getSellerPerformanceMetrics } from "@/lib/seller-dashboard.functions";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PerformanceChartProps {
  sellerId: string;
}

export function PerformanceChart({ sellerId }: PerformanceChartProps) {
  const [period, setPeriod] = useState<7 | 30 | 90>(30);

  const { data } = useSuspenseQuery({
    queryKey: ["sellerPerformanceMetrics", sellerId, period],
    queryFn: () =>
      getSellerPerformanceMetrics({ sellerId, days: period }),
  });

  const chartData = data.dailyMetrics.map((metric: any) => ({
    date: new Date(metric.metric_date).toLocaleDateString("hr-HR", {
      month: "short",
      day: "numeric",
    }),
    views: metric.new_views,
    messages: metric.new_messages,
    orders: metric.new_orders,
    revenue: metric.daily_revenue,
  }));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Performanse</h3>
            <p className="text-sm text-muted-foreground">
              Aktivnost posljednjih {period} dana
            </p>
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map((days) => (
              <Button
                key={days}
                size="sm"
                variant={period === days ? "default" : "outline"}
                onClick={() => setPeriod(days as any)}
              >
                {days}d
              </Button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#8b5cf6"
              name="Prikazi"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="messages"
              stroke="#10b981"
              name="Poruke"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#f59e0b"
              name="Redoslijedi"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Dnevni prihod</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#3b82f6" name="Prihod (KM)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Ukupno prikaza</p>
          <p className="text-2xl font-bold">{data.totals.views.toLocaleString()}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Poruke</p>
          <p className="text-2xl font-bold">{data.totals.messages}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Redoslijedi</p>
          <p className="text-2xl font-bold">{data.totals.orders}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Prihod</p>
          <p className="text-2xl font-bold">
            {data.totals.revenue.toFixed(2)} KM
          </p>
        </Card>
      </div>
    </div>
  );
}
