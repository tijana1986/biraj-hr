import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { createInvoice } from "@/lib/invoice.functions";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [{ title: "Pricing - Marketplace" }],
  }),
  component: Pricing,
});

function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<"monthly_subscription" | "featured_listing" | null>(null);

  const packages = [
    {
      id: "monthly_subscription",
      name: "Mesečna Pretplata",
      price: "€30",
      billing: "/mesečno",
      description: "Idealna za pružatelje koji redovito postavljaju oglase",
      features: [
        "Neograničeni oglasi",
        "Trajanje: 30 dana",
        "Automatski obnovljivo",
        "Pregled analitike",
        "Priority support",
      ],
      color: "bg-blue-50 border-blue-200",
    },
    {
      id: "featured_listing",
      name: "Istaknut Oglas",
      price: "€8",
      billing: "jednokratno",
      description: "Dodatna vidljivost za jedan oglas",
      features: [
        "Istaknut na vrhu pretraživanja",
        "Trajanje: 30 dana",
        "Povećana vidljivost",
        "Bolja konverzija",
      ],
      color: "bg-amber-50 border-amber-200",
    },
  ];

  const handleSelectPackage = async (packageId: string) => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    setSelectedPackage(packageId as any);
    setIsLoading(true);

    try {
      const invoice = await createInvoice(user.id, packageId as any, 14);

      if (invoice) {
        navigate({ to: `/invoice/${invoice.id}` });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Odaberi Paket</h1>
        <p className="text-xl text-muted-foreground">
          Jednostavne cijene bez skrivenih troškova
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {packages.map((pkg: any) => (
          <div
            key={pkg.id}
            className={`border rounded-lg p-8 ${pkg.color} flex flex-col`}
          >
            <h2 className="text-2xl font-bold mb-2">{pkg.name}</h2>
            <p className="text-sm text-muted-foreground mb-6">{pkg.description}</p>

            <div className="mb-8">
              <div className="text-4xl font-bold">{pkg.price}</div>
              <div className="text-sm text-muted-foreground">{pkg.billing}</div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {pkg.features.map((feature: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleSelectPackage(pkg.id)}
              disabled={isLoading && selectedPackage === pkg.id}
              className="w-full"
              size="lg"
            >
              {isLoading && selectedPackage === pkg.id ? (
                <Loader2 className="animate-spin mr-2 w-4 h-4" />
              ) : null}
              Zatraži Ponudu
            </Button>
          </div>
        ))}
      </div>

      {/* Payment Info */}
      <div className="max-w-7xl mx-auto mt-16 bg-blue-50 border border-blue-200 rounded-lg p-8">
        <h3 className="text-xl font-bold mb-4">Kako Funkcionira?</h3>
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="font-bold text-blue-600 flex-shrink-0">1.</span>
            <span>Odaberi paket koji te zanima</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-blue-600 flex-shrink-0">2.</span>
            <span>Sustav će ti poslati ponudu sa reference brojem</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-blue-600 flex-shrink-0">3.</span>
            <span>Plati preko svoje banke sa navedenim reference brojem</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-blue-600 flex-shrink-0">4.</span>
            <span>Admin će verificirati plaćanje (obično isti dan)</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-blue-600 flex-shrink-0">5.</span>
            <span>Ponuda će biti aktivirana u tvojoj pretplati</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
