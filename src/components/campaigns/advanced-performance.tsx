import { useSuspenseQuery } from "@tanstack/react-query";
import {
  getCampaignPerformance,
  getRecipientEngagementMetrics,
} from "@/lib/automated-campaigns.functions";
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
import { TrendingUp, Eye, Click2, AlertCircle, Mail } from "lucide-react";

interface AdvancedPerformanceProps {
  campaignId: string;
}

export function AdvancedPerformance({ campaignId }: AdvancedPerformanceProps) {
  const { data: performanceData } = useSuspenseQuery({
    queryKey: ["campaignPerformance", campaignId],
    queryFn: () => getCampaignPerformance({ campaignId }),
  });

  const { data: engagementData } = useSuspenseQuery({
    queryKey: ["recipientEngagement", campaignId],
    queryFn: () => getRecipientEngagementMetrics({ campaignId, limit: 100 }),
  });

  if (!performanceData) return null;

  const { daily, totals } = performanceData;

  const perfCards = [
    {
      label: "Ukupno poslano",
      value: totals.totalSent,
      icon: Mail,
      color: "blue",
    },
    {
      label: "Ukupno otvoreno",
      value: totals.totalOpens,
      icon: Eye,
      color: "green",
    },
    {
      label: "Ukupno klikova",
      value: totals.totalClicks,
      icon: Click2,
      color: "purple",
    },
    {
      label: "Stopa otvaranja",
      value: `${totals.avgOpenRate}%`,
      icon: TrendingUp,
      color: "orange",
    },
    {
      label: "Stopa klikanja",
      value: `${totals.avgClickRate}%`,
      icon: Click2,
      color: "red",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
    orange: "bg-orange-50 border-orange-200",
    red: "bg-red-50 border-red-200",
  };

  const chartData = daily.map((day: any) => ({
    date: new Date(day.report_date).toLocaleDateString("hr-HR", {
      month: "short",
      day: "numeric",
    }),
    poslano: day.emails_sent,
    otvoreno: day.opens,
    klikovi: day.clicks,
  }));

  const engagementByDevice =
    engagementData?.metrics?.reduce(
      (acc: any, m: any) => {
        const device = m.device_type || "nepoznato";
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      },
      {}
    ) || {};

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {perfCards.map((card, index) => {
          const Icon = card.icon;
          const bgClass = colorClasses[card.color as keyof typeof colorClasses];

          return (
            <Card key={index} className={`p-4 border ${bgClass}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold mt-2">{card.value}</p>
                </div>
                <Icon className="h-6 w-6 opacity-50" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Daily Performance Chart */}
      {chartData.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Dnevni rezultati</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="poslano"
                stroke="#3b82f6"
                name="Poslano"
              />
              <Line
                type="monotone"
                dataKey="otvoreno"
                stroke="#10b981"
                name="Otvoreno"
              />
              <Line
                type="monotone"
                dataKey="klikovi"
                stroke="#8b5cf6"
                name="Klikovi"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Device Distribution */}
      {Object.keys(engagementByDevice).length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Otvaranja po uređaju</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={Object.entries(engagementByDevice).map(([device, count]) => ({
                uređaj: device,
                otvaranja: count,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="uređaj" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="otvaranja" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Top Engagers */}
      {engagementData?.metrics && engagementData.metrics.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Aktivni primatelji</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {engagementData.metrics.slice(0, 10).map((metric: any, idx: number) => (
              <div
                key={idx}
                className="flex items-start justify-between p-3 bg-gray-50 rounded"
              >
                <div className="text-sm">
                  <p className="font-medium">
                    {metric.campaign_recipients?.recipient_email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {metric.open_count > 0 && `Otvaranja: ${metric.open_count}`}
                    {metric.open_count > 0 && metric.click_count > 0 && " • "}
                    {metric.click_count > 0 && `Klikovi: ${metric.click_count}`}
                  </p>
                </div>
                <div className="text-xs">
                  {metric.device_type && (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {metric.device_type}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Summary Box */}
      <Card className="p-4 bg-gray-50 border-gray-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Sažetak performansi</p>
            <p className="text-xs text-muted-foreground mt-1">
              Kampanja je poslana {totals.totalSent} primatelja s prosječnom
              stopom otvaranja od {totals.avgOpenRate}% i stopom klikanja od{" "}
              {totals.avgClickRate}%.
              {totals.totalBounced > 0 && ` ${totals.totalBounced} email je odbijeno.`}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
