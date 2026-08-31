import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/invoice/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Ponuda - ${params.id}` }],
  }),
  component: InvoiceDetail,
});

function InvoiceDetail() {
  const { id } = useParams({ from: "/invoice/$id" });
  const [copied, setCopied] = useState(false);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin" /></div>;
  }

  if (!invoice) {
    return <div className="flex justify-center items-center min-h-screen">Ponuda nije pronađena</div>;
  }

  const ACCOUNT_IBAN = process.env.VITE_ACCOUNT_IBAN || "HR1234567890123456789";
  const ACCOUNT_NAME = process.env.VITE_ACCOUNT_NAME || "Biraj.HR d.o.o.";

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Ponuda za Pretplatu</h1>
          <p className="text-muted-foreground">
            Molimo da ovo sačuvate za vašu evidenciju
          </p>
        </div>

        {/* Invoice Content */}
        <div className="bg-card border rounded-lg p-8 space-y-8">
          {/* Invoice Header */}
          <div className="border-b pb-8">
            <div className="flex justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">PONUDA</h2>
                <p className="text-sm text-muted-foreground">Reference: {invoice.reference_code}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">Datum izdavanja:</p>
                <p className="font-semibold">{new Date(invoice.created_at).toLocaleDateString("hr-HR")}</p>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Od:</p>
              <div>
                <p className="font-semibold">{ACCOUNT_NAME}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Za:</p>
              <p className="font-semibold">Vaš Račun</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Opis</th>
                  <th className="text-right py-2">Iznos</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4">{invoice.description}</td>
                  <td className="text-right py-4 font-semibold">€{invoice.amount}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2 border-t-2">
                <span className="font-bold">UKUPNO:</span>
                <span className="font-bold text-lg">€{invoice.amount}</span>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
            <h3 className="font-bold text-lg">Upute za Plaćanje</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Primatelj:</p>
                <p className="font-semibold">{ACCOUNT_NAME}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">IBAN:</p>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-3 py-2 rounded border font-mono font-bold">
                    {ACCOUNT_IBAN}
                  </code>
                  <button
                    onClick={() => handleCopy(ACCOUNT_IBAN)}
                    className="p-2 hover:bg-white rounded"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Poziv na Broj (Reference):</p>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-3 py-2 rounded border font-mono font-bold text-green-600">
                    {invoice.reference_code}
                  </code>
                  <button
                    onClick={() => handleCopy(invoice.reference_code)}
                    className="p-2 hover:bg-white rounded"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Iznos:</p>
                <p className="font-bold text-lg">€{invoice.amount}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Rok plaćanja:</p>
                <p className="font-semibold">{new Date(invoice.due_date).toLocaleDateString("hr-HR")}</p>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm">
              <span className="font-bold">Važno:</span> Obavezno navedite <span className="font-mono font-bold">{invoice.reference_code}</span> kao "Poziv na broj" pri plaćanju. To omogućava automsku verifikaciju vaše ponude.
            </p>
          </div>

          {/* Status */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm">
              <span className="font-semibold">Status:</span> {" "}
              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-semibold">
                U Tijeku
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Plaćanje će biti verificirano u roku 24h nakon primitka.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Button variant="outline" className="flex-1">
            Ispis / Preuzmite PDF
          </Button>
          <Button className="flex-1">
            Nazad na Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
