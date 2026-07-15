import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  BadgeCheck, Shield, Mail, MapPin, FileText, Building2, User, Hash,
  Banknote, ScanLine, Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth";
import { CITIES_LIST } from "@/lib/mock/data";

export const Route = createFileRoute("/racun/profil")({
  component: Profile,
});

// ---------- Validacija OIB-a (HR, MOD 11,10) ----------
function isValidOib(oib: string): boolean {
  if (!/^\d{11}$/.test(oib)) return false;
  let a = 10;
  for (let i = 0; i < 10; i++) {
    a = a + Number(oib[i]);
    a = a % 10;
    if (a === 0) a = 10;
    a = (a * 2) % 11;
  }
  const control = (11 - a) % 10;
  return control === Number(oib[10]);
}

type PayerType = "privatna" | "obrt" | "pravna";

const billingSchema = z
  .object({
    payerType: z.enum(["privatna", "obrt", "pravna"]),
    legalName: z.string().trim().min(2, "Unesite naziv (min. 2 znaka)").max(120),
    oib: z
      .string()
      .trim()
      .regex(/^\d{11}$/u, "OIB mora imati točno 11 znamenki")
      .refine(isValidOib, "Neispravan OIB (kontrolna znamenka)"),
    vatRegistered: z.boolean(),
    vatId: z
      .string()
      .trim()
      .max(20)
      .optional()
      .or(z.literal("")),
    street: z.string().trim().min(2, "Unesite ulicu i kućni broj").max(120),
    postalCode: z
      .string()
      .trim()
      .regex(/^\d{5}$/u, "Poštanski broj mora imati 5 znamenki"),
    city: z.string().trim().min(2, "Unesite mjesto").max(80),
    country: z.string().trim().min(2).max(60),
    invoiceEmail: z
      .string()
      .trim()
      .email("Neispravna e-pošta")
      .max(255),
    eInvoiceAddress: z.string().trim().max(120).optional().or(z.literal("")),
    note: z.string().trim().max(300).optional().or(z.literal("")),
  })
  .refine(
    (d) => !(d.vatRegistered && !d.vatId),
    { path: ["vatId"], message: "Unesite PDV ID kad ste u sustavu PDV-a" },
  );

type BillingForm = z.infer<typeof billingSchema>;

const BILLING_STORAGE_KEY = "biraj.billing.v1";

const EMPTY_BILLING: BillingForm = {
  payerType: "privatna",
  legalName: "",
  oib: "",
  vatRegistered: false,
  vatId: "",
  street: "",
  postalCode: "",
  city: "Zagreb",
  country: "Hrvatska",
  invoiceEmail: "",
  eInvoiceAddress: "",
  note: "",
};

function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name ?? "", email: user?.email ?? "", city: user?.city ?? "Zagreb", phone: "" });
  const [saved, setSaved] = useState(false);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Profil i sigurnost</h1>
        <p className="text-sm text-muted-foreground">Upravljajte osobnim podacima, verifikacijom i pristupom računu.</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-semibold">Osobni podaci</h2>
        <form onSubmit={onSave} className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Ime i prezime" icon={<BadgeCheck className="h-4 w-4" />}>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="E-pošta" icon={<Mail className="h-4 w-4" />}>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Telefon">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+385 …" />
          </Field>
          <Field label="Grad" icon={<MapPin className="h-4 w-4" />}>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            >
              {CITIES_LIST.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <div className="md:col-span-2 flex items-center gap-3">
            <Button className="bg-[color:var(--navy)] text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">Spremi promjene</Button>
            {saved && <span className="text-xs text-[color:var(--gold-deep)]">✓ Spremljeno</span>}
          </div>
        </form>
      </section>

      <BillingSection />

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
              <Shield className="h-5 w-5 text-[color:var(--gold-deep)]" /> Verifikacija identiteta
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Verificirani korisnici dobivaju oznaku povjerenja, prioritetni rang u pretrazi i mogućnost objave u svim kategorijama uključujući nekretnine i vozila.
            </p>
          </div>
          <span className={"shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest " + (user?.verified ? "bg-[color:var(--gold)]/20 text-[color:var(--gold-deep)]" : "bg-secondary text-muted-foreground")}>
            {user?.verified ? "Verificiran" : "Nije verificiran"}
          </span>
        </div>
        {!user?.verified && (
          <Button className="mt-4 bg-[color:var(--navy)] text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">Pokreni verifikaciju</Button>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-semibold">Sigurnost</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Trenutna lozinka"><Input type="password" placeholder="••••••••" /></Field>
          <Field label="Nova lozinka"><Input type="password" placeholder="••••••••" /></Field>
        </div>
        <Button variant="outline" className="mt-4">Promijeni lozinku</Button>
      </section>
    </div>
  );
}

function BillingSection() {
  const { user } = useAuth();
  const [data, setData] = useState<BillingForm>(EMPTY_BILLING);
  const [errors, setErrors] = useState<Partial<Record<keyof BillingForm, string>>>({});
  const [saved, setSaved] = useState(false);

  // Učitaj iz localStorage prilikom mounta
  useEffect(() => {
    try {
      const raw = localStorage.getItem(BILLING_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<BillingForm>;
        setData({ ...EMPTY_BILLING, ...parsed });
      } else if (user) {
        // Predlošak iz osnovnog profila
        setData((d) => ({
          ...d,
          legalName: user.name ?? "",
          invoiceEmail: user.email ?? "",
          city: user.city ?? d.city,
        }));
      }
    } catch {
      /* ignore */
    }
  }, [user]);

  const isBusiness = data.payerType !== "privatna";

  function update<K extends keyof BillingForm>(key: K, value: BillingForm[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized: BillingForm = {
      ...data,
      vatId: isBusiness ? data.vatId : "",
      vatRegistered: isBusiness ? data.vatRegistered : false,
    };
    const result = billingSchema.safeParse(normalized);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof BillingForm, string>> = {};
      for (const issue of result.error.issues) {
        const k = issue.path[0] as keyof BillingForm | undefined;
        if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(result.data));
    setData(result.data);
    setErrors({});
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <FileText className="h-5 w-5 text-[color:var(--gold-deep)]" />
            Podaci za izdavanje računa
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Ovi podaci koriste se za izdavanje računa sukladno Zakonu o porezu na
            dodanu vrijednost i Općem poreznom zakonu Republike Hrvatske. Račun
            se izdaje na podatke unesene u ovoj sekciji.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        {/* Vrsta obveznika */}
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Vrsta obveznika računa</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {([
              { v: "privatna", label: "Privatna osoba", icon: User },
              { v: "obrt", label: "Obrt", icon: BadgeCheck },
              { v: "pravna", label: "Pravna osoba (d.o.o., j.d.o.o., ...)", icon: Building2 },
            ] as const).map(({ v, label, icon: Icon }) => {
              const active = data.payerType === v;
              return (
                <label
                  key={v}
                  className={
                    "flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition " +
                    (active
                      ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10 text-[color:var(--gold-deep)] shadow-sm"
                      : "border-border hover:border-[color:var(--gold)]/60")
                  }
                >
                  <input
                    type="radio"
                    name="payerType"
                    className="sr-only"
                    checked={active}
                    onChange={() => update("payerType", v)}
                  />
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="leading-tight">{label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Naziv + OIB */}
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label={isBusiness ? "Naziv tvrtke / obrta" : "Ime i prezime"}
            icon={isBusiness ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
            error={errors.legalName}
          >
            <Input
              value={data.legalName}
              onChange={(e) => update("legalName", e.target.value)}
              maxLength={120}
              autoComplete={isBusiness ? "organization" : "name"}
              placeholder={isBusiness ? "npr. Biraj d.o.o." : "npr. Ana Horvat"}
            />
          </Field>
          <Field label="OIB" icon={<Hash className="h-4 w-4" />} error={errors.oib} hint="11 znamenki">
            <Input
              inputMode="numeric"
              value={data.oib}
              onChange={(e) => update("oib", e.target.value.replace(/\D/g, "").slice(0, 11))}
              maxLength={11}
              placeholder="12345678901"
            />
          </Field>
        </div>

        {/* PDV ID samo za poslovne subjekte */}
        {isBusiness && (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-2 self-end rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <Checkbox
                checked={data.vatRegistered}
                onCheckedChange={(v) => update("vatRegistered", Boolean(v))}
              />
              <span>U sustavu PDV-a</span>
            </label>
            <Field label="PDV ID (VAT ID)" hint="npr. HR12345678901" error={errors.vatId}>
              <Input
                value={data.vatId ?? ""}
                onChange={(e) => update("vatId", e.target.value.toUpperCase().slice(0, 20))}
                disabled={!data.vatRegistered}
                placeholder={data.vatRegistered ? "HR12345678901" : "—"}
              />
            </Field>
          </div>
        )}

        {/* Adresa */}
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label={isBusiness ? "Adresa sjedišta" : "Ulica i kućni broj"}
            icon={<MapPin className="h-4 w-4" />}
            error={errors.street}
          >
            <Input
              value={data.street}
              onChange={(e) => update("street", e.target.value)}
              maxLength={120}
              autoComplete="street-address"
              placeholder="Ilica 1"
            />
          </Field>
          <div className="grid grid-cols-[110px_1fr] gap-3">
            <Field label="Poštanski br." error={errors.postalCode}>
              <Input
                inputMode="numeric"
                value={data.postalCode}
                onChange={(e) => update("postalCode", e.target.value.replace(/\D/g, "").slice(0, 5))}
                maxLength={5}
                placeholder="10000"
                autoComplete="postal-code"
              />
            </Field>
            <Field label="Mjesto" error={errors.city}>
              <Input
                value={data.city}
                onChange={(e) => update("city", e.target.value)}
                maxLength={80}
                autoComplete="address-level2"
              />
            </Field>
          </div>
          <Field label="Država" error={errors.country}>
            <Input
              value={data.country}
              onChange={(e) => update("country", e.target.value)}
              maxLength={60}
              autoComplete="country-name"
            />
          </Field>
          <Field
            label="E-pošta za račun"
            icon={<Mail className="h-4 w-4" />}
            error={errors.invoiceEmail}
            hint="Račun (PDF) šaljemo na ovu adresu"
          >
            <Input
              type="email"
              value={data.invoiceEmail}
              onChange={(e) => update("invoiceEmail", e.target.value)}
              maxLength={255}
              autoComplete="email"
              placeholder="racuni@primjer.hr"
            />
          </Field>
        </div>

        {isBusiness && (
          <Field
            label="Adresa za e-Račun (opcionalno)"
            hint="Za pravne osobe — adresa zaprimanja eRačuna putem servisa (npr. FINA, Moj-eRačun)"
            error={errors.eInvoiceAddress}
          >
            <Input
              value={data.eInvoiceAddress ?? ""}
              onChange={(e) => update("eInvoiceAddress", e.target.value)}
              maxLength={120}
              placeholder="GLN / poštanski sandučić servisa"
            />
          </Field>
        )}

        <Field
          label="Napomena uz račun (opcionalno)"
          hint="Npr. broj narudžbenice, interna oznaka — najviše 300 znakova"
          error={errors.note}
        >
          <textarea
            value={data.note ?? ""}
            onChange={(e) => update("note", e.target.value.slice(0, 300))}
            maxLength={300}
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Npr. PO-2026/123"
          />
        </Field>

        <div className="flex items-center gap-3">
          <Button className="bg-[color:var(--navy)] text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">
            Spremi podatke za račun
          </Button>
          {saved && <span className="text-xs text-[color:var(--gold-deep)]">✓ Spremljeno</span>}
        </div>
      </form>

      {/* Info kartica o načinu plaćanja */}
      <div className="mt-6 rounded-xl border border-[color:var(--gold)]/40 bg-[color:var(--cream)] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[color:var(--gold-deep)] shadow-sm">
            <ScanLine className="h-5 w-5" />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-[color:var(--gold-deep)]" />
              <span className="font-semibold">Plaćanje barkodom (HUB-3A / 2D PDF417)</span>
            </div>
            <p className="text-muted-foreground">
              Po izdavanju računa dostavljamo vam PDF s 2D barkodom za skeniranje
              u mobilnom bankarstvu. Uplata se vrši izravno na transakcijski
              račun Biraj.HR — bez kartica, bez međuposrednika.
            </p>
            <div className="mt-2 grid gap-2 rounded-lg border border-dashed border-border bg-white p-3 text-xs sm:grid-cols-2">
              <div>
                <div className="text-muted-foreground">Primatelj</div>
                <div className="font-medium">NEXORA grupa, vl. Tijana Dusper</div>
              </div>
              <div>
                <div className="text-muted-foreground">IBAN</div>
                <div className="font-medium tabular-nums">HR18 2360 0001 1032 7416 6</div>
                <div className="text-[11px] text-muted-foreground">Raiffeisenbank Austria d.d.</div>
              </div>
              <div>
                <div className="text-muted-foreground">Model</div>
                <div className="font-medium">HR00</div>
              </div>
              <div>
                <div className="text-muted-foreground">Poziv na broj</div>
                <div className="font-medium">broj računa (na PDF-u)</div>
              </div>
            </div>
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Primit ćete barkod (HUB-3A / PDF417) koji sadrži sve podatke za
              plaćanje u korist računa <span className="font-medium text-foreground">HR1823600001103274166</span>,
              čiji je vlasnik <span className="font-medium text-foreground">NEXORA grupa, vl. Tijana Dusper</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label, icon, children, error, hint,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  error?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-sm font-medium">{icon}{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );

