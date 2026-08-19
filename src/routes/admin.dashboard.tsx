import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CreditCard, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

async function fetchPaymentStats() {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || "",
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
  );

  const { data: orders } = await supabase
    .from("promotion_orders")
    .select("*")
    .order("created_at", { ascending: false });

  return orders || [];
}

interface PaymentOrder {
  id: string;
  created_at: string;
  tier: string;
  price_eur: number;
  payment_status: "completed" | "pending" | "failed" | "refunded";
}

function AdminDashboard() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-payment-stats"],
    queryFn: () => fetchPaymentStats(),
  });

  const stats = {
    totalRevenue: orders
      .filter((o: PaymentOrder) => o.payment_status === "completed")
      .reduce((sum, o: PaymentOrder) => sum + o.price_eur, 0),
    totalOrders: orders.filter((o: PaymentOrder) => o.payment_status === "completed").length,
    failedOrders: orders.filter((o: PaymentOrder) => o.payment_status === "failed").length,
    refundedAmount: orders
      .filter((o: PaymentOrder) => o.payment_status === "refunded")
      .reduce((sum, o: PaymentOrder) => sum + o.price_eur, 0),
  };

  // Group by tier for pie chart
  const tierData = Object.entries(
    orders
      .filter((o: PaymentOrder) => o.payment_status === "completed")
      .reduce(
        (acc, order: PaymentOrder) => {
          acc[order.tier] = (acc[order.tier] || 0) + order.price_eur;
          return acc;
        },
        {} as Record<string, number>
      )
  ).map(([tier, revenue]) => ({
    name: tier,
    value: revenue,
  }));

  // Group by date for line chart
  const dateData = Object.entries(
    orders
      .filter((o: PaymentOrder) => o.payment_status === "completed")
      .reduce(
        (acc, order: PaymentOrder) => {
          const date = new Date(order.created_at).toLocaleDateString("en-US");
          acc[date] = (acc[date] || 0) + order.price_eur;
          return acc;
        },
        {} as Record<string, number>
      )
  )
    .map(([date, revenue]) => ({
      date,
      revenue,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Payment status breakdown
  const statusData = [
    { name: "Completed", value: orders.filter((o: PaymentOrder) => o.payment_status === "completed").length, fill: "#10b981" },
    { name: "Failed", value: orders.filter((o: PaymentOrder) => o.payment_status === "failed").length, fill: "#ef4444" },
    { name: "Refunded", value: orders.filter((o: PaymentOrder) => o.payment_status === "refunded").length, fill: "#3b82f6" },
    { name: "Pending", value: orders.filter((o: PaymentOrder) => o.payment_status === "pending").length, fill: "#f59e0b" },
  ];

  if (isLoading) {
    return (
      <SiteShell>
        <div className="p-8 text-center text-muted-foreground">Učitavanje podataka...</div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="space-y-8 py-8">
        <div>
          <h1 className="font-display text-4xl font-semibold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Pregled plaćanja i analitike</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-6 border-0 bg-gradient-to-br from-emerald-50 to-emerald-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">Ukupan Prihod</p>
                <p className="text-3xl font-bold mt-2 text-emerald-900">€{stats.totalRevenue.toFixed(2)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-emerald-600" />
            </div>
          </Card>

          <Card className="p-6 border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Uspješnih Plaćanja</p>
                <p className="text-3xl font-bold mt-2 text-blue-900">{stats.totalOrders}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6 border-0 bg-gradient-to-br from-red-50 to-red-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Neuspješna Plaćanja</p>
                <p className="text-3xl font-bold mt-2 text-red-900">{stats.failedOrders}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6 border-0 bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Vraćeni Novac</p>
                <p className="text-3xl font-bold mt-2 text-orange-900">€{stats.refundedAmount.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue">Prihod po Vremenskom Periodu</TabsTrigger>
            <TabsTrigger value="tier">Prihod po Tieru</TabsTrigger>
            <TabsTrigger value="status">Status Plaćanja</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="mt-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Dnevni Prihod</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#d4af37" dot={{ fill: "#d4af37" }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="tier" className="mt-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Prihod po Tieru</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={tierData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: €${value.toFixed(2)}`} outerRadius={80} fill="#8884d8" dataKey="value">
                    <Cell fill="#d4af37" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="status" className="mt-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Distribucija Statusa Plaćanja</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Orders Table */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Najnovija Plaćanja</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Datum</th>
                  <th className="px-4 py-2 text-left font-semibold">Tier</th>
                  <th className="px-4 py-2 text-right font-semibold">Iznos</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order: PaymentOrder) => (
                  <tr key={order.id} className="border-b border-border">
                    <td className="px-4 py-2">
                      {new Date(order.created_at).toLocaleDateString("hr-HR")}
                    </td>
                    <td className="px-4 py-2 capitalize font-medium">{order.tier}</td>
                    <td className="px-4 py-2 text-right font-semibold">€{order.price_eur.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          order.payment_status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.payment_status === "failed"
                              ? "bg-red-100 text-red-800"
                              : order.payment_status === "refunded"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </SiteShell>
  );
}
