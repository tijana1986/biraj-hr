import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";

export const Route = createFileRoute("/racun/placanja")({
  component: PaymentHistory,
});

type Order = {
  id: string;
  listingId: string;
  tier: string;
  price: number;
  email: string;
  status: "completed" | "pending" | "failed";
  date: string;
};

function PaymentHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      if (typeof window !== "undefined") {
        const storedOrders = JSON.parse(sessionStorage.getItem("orders") || "[]");
        setOrders(storedOrders.sort((a: Order, b: Order) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      }
      setLoading(false);
    }, 300);
  }, []);

  const stats = {
    total: orders.length,
    completed: orders.filter((o) => o.status === "completed").length,
    totalSpent: orders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + o.price, 0),
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "spotlight":
        return "bg-yellow-500/10 text-yellow-700";
      case "featured":
        return "bg-blue-500/10 text-blue-700";
      case "premium":
        return "bg-purple-500/10 text-purple-700";
      case "vip":
        return "bg-amber-500/10 text-amber-700";
      default:
        return "bg-gray-500/10 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Gotovo";
      case "pending":
        return "Na čekanju";
      case "failed":
        return "Neuspješno";
      default:
        return status;
    }
  };

  return (
    <SiteShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-semibold">历史 plaćanja</h1>
          <p className="text-sm text-muted-foreground">Pregledajte sve svoje uplate i potvrde.</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground">Ukupne uplate</div>
            <div className="font-display text-3xl font-semibold mt-2">€{stats.totalSpent.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">{stats.completed} uspješnih</div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground">Promocije</div>
            <div className="font-display text-3xl font-semibold mt-2">{stats.total}</div>
            <div className="text-xs text-muted-foreground mt-1">Ukupno izdanih</div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground">Prosječna cijena</div>
            <div className="font-display text-3xl font-semibold mt-2">
              €{stats.total > 0 ? (stats.totalSpent / stats.total).toFixed(2) : "0.00"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Po promociji</div>
          </div>
        </div>

        {/* Transactions */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="font-semibold">Sve transakcije</h2>
          </div>

          {loading && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Učitavanje plaćanja…
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Još nemate plaćanja.</p>
              <Link to="/racun/oglasi" className="mt-4 inline-block">
                <Button size="sm">Promotiraj oglas</Button>
              </Link>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Datum</th>
                    <th className="px-6 py-3 text-left font-semibold">Oglas</th>
                    <th className="px-6 py-3 text-left font-semibold">Tier</th>
                    <th className="px-6 py-3 text-right font-semibold">Cijena</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                    <th className="px-6 py-3 text-right font-semibold">Akcija</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr key={order.id} className={i < orders.length - 1 ? "border-b border-border" : ""}>
                      <td className="px-6 py-4">
                        {new Date(order.date).toLocaleDateString("hr-HR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">
                        <div className="font-mono text-xs text-muted-foreground">{order.listingId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getTierBadgeColor(
                            order.tier
                          )}`}
                        >
                          {order.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">€{order.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="p-2 hover:bg-secondary rounded-md transition"
                            title="Pregled"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 hover:bg-secondary rounded-md transition"
                            title="Preuzmi račun"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="rounded-2xl border border-border bg-muted/30 p-6">
          <h3 className="font-semibold mb-2">ℹ️ Potvrde plaćanja</h3>
          <p className="text-sm text-muted-foreground">
            Sve potvrde plaćanja se šalju na vašu e-poštu. Ako ste ih propustili, preuzeti ih možete ovdje kao PDF.
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
