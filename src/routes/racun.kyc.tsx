import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, Check, Clock, Upload, Loader2 } from "lucide-react";
import { SiteShell, Breadcrumbs } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { submitKYCData, getKYCStatus } from "@/lib/kyc.functions";

export const Route = createFileRoute("/racun/kyc")({
  head: () => ({
    meta: [
      { title: "KYC Verifikacija — Biraj.HR" },
      { name: "description", content: "Provjera identiteta i povećanje povjerenja" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: KYCPage,
});

type Form = {
  id_type: "passport" | "id_card" | "driver_license";
  id_number: string;
  full_name: string;
  date_of_birth: string;
  country: string;
  address: string;
  city: string;
  postal_code: string;
};

function KYCPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"loading" | "pending" | "approved" | "rejected" | "form">("loading");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [form, setForm] = useState<Form>({
    id_type: "id_card",
    id_number: "",
    full_name: "",
    date_of_birth: "",
    country: "HR",
    address: "",
    city: "",
    postal_code: "",
  });

  const submit = useServerFn(submitKYCData);
  const checkStatus = useServerFn(getKYCStatus);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const result = await checkStatus();
        if (result.submission) {
          setStatus(result.submission.status);
          if (result.submission.status === "rejected") {
            setRejectionReason(result.submission.rejection_reason || "");
          }
        } else {
          setStatus("form");
        }
      } catch {
        setStatus("form");
      }
    };
    loadStatus();
  }, [checkStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await submit({
        ...form,
      });
      setStatus("pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri slanju");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <SiteShell>
        <div className="px-6 py-24 text-center text-sm text-muted-foreground">
          Preusmjeravanje…
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-6 py-10">
        <Breadcrumbs
          items={[
            { label: "Početna", to: "/" },
            { label: "Moj račun", to: "/racun" },
            { label: "KYC Verifikacija" },
          ]}
        />

        <div className="mt-8">
          <h1 className="font-display text-3xl font-semibold">Provjera identiteta</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Potvrdi svoj identitet da bi povećao povjerenje i pristup naprednim mogućnostima.
          </p>

          {status === "loading" && (
            <div className="mt-8 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[color:var(--gold-deep)]" />
            </div>
          )}

          {status === "pending" && (
            <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
              <div className="flex gap-4">
                <Clock className="h-6 w-6 shrink-0 text-amber-600" />
                <div>
                  <h2 className="font-display text-xl font-semibold">Na čekanju</h2>
                  <p className="mt-1 text-sm text-foreground/80">
                    Vaši podaci su poslani na provjeru. Obično traje 1-3 dana.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Dobit ćete email obavijest kada bude završeno.
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === "approved" && (
            <div className="mt-8 rounded-2xl border border-green-500/30 bg-green-500/5 p-6">
              <div className="flex gap-4">
                <Check className="h-6 w-6 shrink-0 text-green-600" />
                <div>
                  <h2 className="font-display text-xl font-semibold">Identitet potvrđen ✓</h2>
                  <p className="mt-1 text-sm text-foreground/80">
                    Hvala što ste potvrdili identitet. Sada vam je dostupan "Trusted Seller" badge.
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === "rejected" && (
            <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
              <div className="flex gap-4">
                <AlertCircle className="h-6 w-6 shrink-0 text-red-600" />
                <div>
                  <h2 className="font-display text-xl font-semibold">Odbijeno</h2>
                  <p className="mt-1 text-sm text-foreground/80">{rejectionReason}</p>
                  <Button
                    onClick={() => setStatus("form")}
                    variant="outline"
                    className="mt-3"
                  >
                    Pokušaj ponovno
                  </Button>
                </div>
              </div>
            </div>
          )}

          {status === "form" && (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Vrsta dokumenta</label>
                  <select
                    value={form.id_type}
                    onChange={(e) => setForm({ ...form, id_type: e.target.value as any })}
                    className="mt-1 h-10 w-full rounded-md border border-input px-3 text-sm"
                  >
                    <option value="id_card">Osobna iskaznica</option>
                    <option value="passport">Putovnica</option>
                    <option value="driver_license">Vozačka dozvola</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Broj dokumenta</label>
                  <Input
                    type="text"
                    value={form.id_number}
                    onChange={(e) => setForm({ ...form, id_number: e.target.value })}
                    className="mt-1"
                    placeholder="ABC123456"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Ime i prezime</label>
                <Input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="mt-1"
                  placeholder="Marko Marković"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Datum rođenja</label>
                  <Input
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Država</label>
                  <Input
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value.toUpperCase() })}
                    className="mt-1"
                    placeholder="HR"
                    maxLength={2}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Adresa</label>
                <Input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="mt-1"
                  placeholder="Ulica 123"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Grad</label>
                  <Input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Poštanski broj</label>
                  <Input
                    type="text"
                    value={form.postal_code}
                    onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-secondary/30 p-4 text-sm">
                <p className="font-medium">Trebam fotografije dokumenta</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Nakon slanja, trebat ćete uploadirati jasne fotografije prednje i stražnje strane dokumenta.
                </p>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[color:var(--navy)] text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Slanje…
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Pošalji podatke na provjeru
                  </>
                )}
              </Button>

              <p className="text-[11px] text-muted-foreground">
                Podaci se šifriraju i čuvaju sigurno. Koriste se isključivo za provjeru identiteta.
              </p>
            </form>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
