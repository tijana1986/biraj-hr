import { useSuspenseQuery } from "@tanstack/react-query";
import { getCampaignStats } from "@/lib/email-notifications.functions";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Mail, Eye, Click2, AlertCircle } from "lucide-react";

interface CampaignAnalyticsProps {
  campaignId: string;
}

export function CampaignAnalytics({ campaignId }: CampaignAnalyticsProps) {
  const { data: campaignData } = useSuspenseQuery({
    queryKey: ["campaignStats", campaignId],
    queryFn: () => getCampaignStats({ campaignId }),
  });

  if (!campaignData) return null;

  const { campaign, stats } = campaignData;

  const chartData = [
    {
      name: "Rezultati",
      poslano: stats.sent,
      otvoreno: stats.opened,
      klikovi: stats.clicked,
      neuspješno: stats.failed,
    },
  ];

  const statCards = [
    {
      label: "Ukupno poslano",
      value: stats.sent,
      icon: Mail,
      color: "blue",
    },
    {
      label: "Otvoreno",
      value: stats.opened,
      icon: Eye,
      color: "green",
    },
    {
      label: "Klikovi",
      value: stats.clicked,
      icon: Click2,
      color: "purple",
    },
    {
      label: "Stopa otvaranja",
      value: `${stats.openRate}%`,
      icon: Mail,
      color: "orange",
    },
    {
      label: "Stopa klikanja",
      value: `${stats.clickRate}%`,
      icon: Click2,
      color: "red",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    green: "bg-green-50 border-green-200 text-green-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900",
    orange: "bg-orange-50 border-orange-200 text-orange-900",
    red: "bg-red-50 border-red-200 text-red-900",
  };

  const iconColorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    red: "text-red-600",
  };

  return (
    <div className="space-y-6">
      {/* Campaign Header */}
      <div>
        <h3 className="text-lg font-semibold">{campaign?.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {campaign?.description}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const bgClass =
            colorClasses[card.color as keyof typeof colorClasses];
          const iconClass =
            iconColorClasses[card.color as keyof typeof iconColorClasses];

          return (
            <Card key={index} className={`p-4 border ${bgClass}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold mt-2">{card.value}</p>
                </div>
                <Icon className={`h-6 w-6 ${iconClass}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Chart */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Detaljni prikaz</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="poslano" fill="#3b82f6" />
            <Bar dataKey="otvoreno" fill="#10b981" />
            <Bar dataKey="klikovi" fill="#8b5cf6" />
            <Bar dataKey="neuspješno" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Summary */}
      <Card className="p-6 bg-gray-50">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Sažetak performansi
        </h4>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Ukupno primatelja:</span> {stats.total}
          </p>
          <p>
            <span className="font-medium">Uspješno poslano:</span> {stats.sent} (
            {stats.total > 0 ? ((stats.sent / stats.total) * 100).toFixed(1) : 0}
            %)
          </p>
          <p>
            <span className="font-medium">Neuspješno:</span> {stats.failed}
          </p>
          <p>
            <span className="font-medium">Stopa otvaranja:</span>{" "}
            {stats.openRate}% ({stats.opened} otvaranja)
          </p>
          <p>
            <span className="font-medium">Stopa klikanja:</span>{" "}
            {stats.clickRate}% ({stats.clicked} klikova)
          </p>
        </div>
      </Card>
    </div>
  );
}
