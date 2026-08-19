import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileText, Loader2 } from "lucide-react";

export const Route = createFileRoute("/racun/racuni")({
  component: InvoicesPage,
});

async function fetchInvoices() {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || "",
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
  );

  const { data: orders } = await supabase
    .from("promotion_orders")
    .select("*")
    .eq("payment_status", "completed")
    .order("created_at", { ascending: false });

  const { data: subscriptions } = await supabase
    .from("subscription_orders")
    .select("*")
    .in("status", ["active", "cancelled"])
    .order("created_at", { ascending: false });

  return {
    orders: orders || [],
    subscriptions: subscriptions || [],
  };
}

function generateInvoiceNumber(date: string, id: string): string {
  const year = new Date(date).getFullYear();
  const month = String(new Date(date).getMonth() + 1).padStart(2, "0");
  const shortId = id.slice(0, 8).toUpperCase();
  return `INV-${year}${month}-${shortId}`;
}

function downloadInvoicePDF(invoice: any, type: "promotion" | "subscription") {
  // Placeholder for PDF generation
  // In production, use jsPDF or similar
  const invoiceNumber = generateInvoiceNumber(
    invoice.created_at,
    invoice.id
  );

  const html = `
    <html>
      <head>
        <title>${invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 40px; }
          .invoice-details { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 40px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f0f0f0; }
          .total { text-align: right; font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>RAČUN</h1>
            <p>${invoiceNumber}</p>
          </div>

          <div class="invoice-details">
            <div>
              <h3>Izdavač</h3>
              <p>Biraj.hr d.o.o.</p>
              <p>Marketplace za oglase</p>
            </div>
            <div>
              <h3>Primatelj</h3>
              <p>Korisnik</p>
              <p>${invoice.user_id}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Opis</th>
                <th>Količina</th>
                <th>Cijena</th>
                <th>Ukupno</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  ${type === "promotion" ? `Promotion - ${invoice.tier}` : `Subscription - ${invoice.tier}`}
                </td>
                <td>1</td>
                <td>€${invoice.price_eur.toFixed(2)}</td>
                <td>€${invoice.price_eur.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="total">
            Ukupno: €${invoice.price_eur.toFixed(2)}
          </div>

          <p style="text-align: center; color: #666; font-size: 12px; margin-top: 40px;">
            Hvala što si korisnik Biraj.hr marketplace-a
          </p>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: "text/html" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${invoiceNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

interface Invoice {
  id: string;
  created_at: string;
  tier: string;
  price_eur: number;
  payment_status?: string;
  status?: string;
  user_id: string;
}

function InvoicesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => fetchInvoices(),
  });

  const orders = data?.orders || [];
  const subscriptions = data?.subscriptions || [];

  if (isLoading) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-4xl px-6 py-12">
          <div className="text-center text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Učitavanje računa…
          </div>
        </section>
      </SiteShell>
    );
  }

  const allInvoices = [
    ...orders.map((o: Invoice) => ({ ...o, type: "promotion" as const })),
    ...subscriptions.map((s: Invoice) => ({ ...s, type: "subscription" as const })),
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <SiteShell>
      <div className="space-y-6 py-8">
        <div>
          <h1 className="font-display text-3xl font-semibold">Moji Računi</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Preuzmi PDF račune za sve svoje promocije i subscription-e
          </p>
        </div>

        {allInvoices.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nemaš računa za preuzimanje</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allInvoices.map((invoice: Invoice & { type: "promotion" | "subscription" }) => {
              const invoiceNumber = generateInvoiceNumber(invoice.created_at, invoice.id);
              const date = new Date(invoice.created_at);

              return (
                <Card
                  key={`${invoice.type}-${invoice.id}`}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{invoiceNumber}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{date.toLocaleDateString("hr-HR")}</span>
                          <span>•</span>
                          <span className="capitalize">
                            {invoice.type === "promotion" ? "Promotion" : "Subscription"}
                          </span>
                          <span>•</span>
                          <span>{invoice.tier}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">€{invoice.price_eur.toFixed(2)}</p>
                        <p className="text-xs text-green-600">Plaćeno</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadInvoicePDF(invoice, invoice.type)}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Preuzmi PDF
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        <div className="rounded-2xl border border-border bg-muted/30 p-6">
          <h3 className="font-semibold mb-3">Važna Informacija</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Svi PDF računi su dostupni za preuzimanje 7 dana nakon transakcije.
          </p>
          <p className="text-sm text-muted-foreground">
            Ako trebaaš starije račune, <a href="mailto:support@biraj.hr" className="text-amber-600 hover:underline">kontaktiraj support</a>.
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
