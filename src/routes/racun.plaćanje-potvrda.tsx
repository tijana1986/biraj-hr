import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { createListing } from "@/lib/listings.functions";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/racun/plaćanje-potvrda")({
  head: () => ({
    meta: [
      { title: "Potvrda plaćanja — Biraj.HR" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PaymentConfirmation,
});

type PaymentParams = {
  session_id?: string;
  payment_intent?: string;
};

function PaymentConfirmation() {
  const { user } = useAuth();
  const search = useSearch({ from: Route.id });
  const params = search as PaymentParams;
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState<string>("");
  const createListingFn = useServerFn(createListing);

  useEffect(() => {
    const processPendingListing = async () => {
      try {
        // Get pending listing data from sessionStorage
        const pendingData = sessionStorage.getItem("pendingListing");
        if (!pendingData) {
          setStatus("error");
          setMessage("Nema podataka o oglasu. Molimo pokušajte ponovno.");
          return;
        }

        const listingData = JSON.parse(pendingData);

        // In production, verify payment with Stripe backend
        // For now, we'll assume payment is confirmed if they reached this page
        if (!params.session_id && !params.payment_intent) {
          setStatus("error");
          setMessage("Plaćanje nije potvrđeno. Molimo kontaktirajte podršku.");
          return;
        }

        // Create the listing
        await createListingFn({
          data: {
            category_slug: listingData.category_slug,
            subcategory_slug: listingData.subcategory_slug,
            title: listingData.title,
            description: listingData.description,
            price_eur: listingData.price_eur,
            location: listingData.location,
            images: listingData.images,
            metadata: {
              ...listingData.metadata,
              listing_type: listingData.listingType,
              payment_session_id: params.session_id || params.payment_intent,
            },
          },
        });

        // Clear sessionStorage
        sessionStorage.removeItem("pendingListing");

        setStatus("success");
        setMessage("Oglas je uspješno objavljen!");

        // Redirect to listings after 2 seconds
        setTimeout(() => {
          window.location.href = "/racun/oglasi";
        }, 2000);
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Došlo je do greške. Molimo kontaktirajte podršku.");
      }
    };

    processPendingListing();
  }, [params.session_id, params.payment_intent, createListingFn]);

  if (!user) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-md px-6 py-20 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Morate biti prijavljeni</h1>
          <p className="mt-2 text-sm text-muted-foreground">Molimo prijavite se kako bi završili proces.</p>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-md px-6 py-20 text-center">
        {status === "processing" && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[color:var(--gold-deep)]" />
            <h1 className="mt-4 font-display text-2xl font-semibold">Obrada plaćanja…</h1>
            <p className="mt-2 text-sm text-muted-foreground">Molimo čekajte dok potvrđujemo vašu narudžbu.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[color:var(--gold)]/20">
              <Check className="h-8 w-8 text-[color:var(--gold-deep)]" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-semibold">Plaćanje je potvrđeno!</h1>
            <p className="mt-2 text-sm text-muted-foreground">Vaš oglas je objavljen i vidljiv u katalogu.</p>
            <p className="mt-4 text-xs text-muted-foreground">Preusmjeravanje na moje oglase...</p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="mt-4 font-display text-2xl font-semibold">Greška pri obradi</h1>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <a
              href="/racun/oglasi"
              className="mt-6 inline-flex h-10 items-center rounded-md bg-[color:var(--navy)] px-6 text-sm font-semibold text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]"
            >
              Moji oglasi
            </a>
          </>
        )}
      </section>
    </SiteShell>
  );
}
