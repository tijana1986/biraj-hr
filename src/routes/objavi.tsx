import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { SiteShell } from "@/components/site/SiteShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { CATEGORIES, CITIES_LIST } from "@/lib/mock/data";
import { createListing } from "@/lib/listings.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/objavi")({
  head: () => ({
    meta: [
      { title: "Objavi oglas — Biraj.HR" },
      { name: "description", content: "Objavite provjereni oglas u nekoliko jednostavnih koraka." },
    ],
  }),
  component: PostListing,
});

type Form = {
  category: string;
  subcategory: string;
  title: string;
  description: string;
  price: string;
  city: string;
  contactPhone: string;
  agree: boolean;
  images: string[];
};

const STEPS = ["Kategorija", "Detalji", "Lokacija", "Kontakt", "Pregled"] as const;

function PostListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const create = useServerFn(createListing);
  const [form, setForm] = useState<Form>({
    category: "",
    subcategory: "",
    title: "",
    description: "",
    price: "",
    city: "Zagreb",
    contactPhone: "",
    agree: false,
    images: [],
  });
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !user) return;
    setErr(null);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (form.images.length + uploaded.length >= 12) break;
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 8 * 1024 * 1024) { setErr("Slika je veća od 8 MB."); continue; }
        const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("listing-images").upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) { setErr(upErr.message); continue; }
        const { data: signed, error: signErr } = await supabase.storage.from("listing-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
        if (signErr || !signed) { setErr(signErr?.message ?? "Neuspjelo potpisivanje URL-a."); continue; }
        uploaded.push(signed.signedUrl);
      }
      if (uploaded.length) setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (user === null) navigate({ to: "/prijava" });
  }, [user, navigate]);

  if (!user) return <SiteShell><div className="px-6 py-24 text-center text-sm text-muted-foreground">Preusmjeravanje…</div></SiteShell>;

  const cat = CATEGORIES.find((c) => c.slug === form.category);

  const validate = (): string | null => {
    if (step === 0 && (!form.category || !form.subcategory)) return "Odaberite kategoriju i podkategoriju.";
    if (step === 1) {
      if (form.title.trim().length < 6) return "Naslov mora imati barem 6 znakova.";
      if (form.description.trim().length < 20) return "Opis mora imati barem 20 znakova.";
      if (!form.price || Number(form.price) <= 0) return "Unesite ispravnu cijenu u EUR.";
      if (form.images.length === 0) return "Dodajte barem jednu fotografiju.";
    }
    if (step === 2 && !form.city) return "Odaberite grad.";
    if (step === 3 && !/^\+?\d[\d\s\-]{6,}$/.test(form.contactPhone)) return "Unesite ispravan kontakt telefon.";
    if (step === 4 && !form.agree) return "Potrebno je prihvatiti uvjete objave.";
    return null;
  };

  const next = async () => {
    const v = validate();
    if (v) { setErr(v); return; }
    setErr(null);
    if (step < STEPS.length - 1) { setStep(step + 1); return; }
    // Final submit → persist to Supabase
    setSubmitting(true);
    try {
      const row = await create({
        data: {
          category_slug: form.category,
          subcategory_slug: form.subcategory,
          title: form.title.trim(),
          description: form.description.trim(),
          price_eur: Number(form.price),
          location: form.city,
          images: form.images,
          metadata: { contact_phone: form.contactPhone },
        },
      });
      setCreatedId(row?.id ?? null);
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Neuspjelo spremanje oglasa.");
    } finally {
      setSubmitting(false);
    }
  };

  const back = () => { setErr(null); setStep(Math.max(0, step - 1)); };

  if (done) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-xl px-6 py-20 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[color:var(--gold)]/20">
            <Check className="h-8 w-8 text-[color:var(--gold-deep)]" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-semibold">Oglas je objavljen</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Vaš oglas je vidljiv u katalogu i može se pretraživati. Njime upravljate iz kartice "Moji oglasi".
          </p>
          <div className="mt-8 flex justify-center gap-3">
            {createdId && (
              <Link to="/oglas/$id" params={{ id: createdId }} className="inline-flex h-10 items-center rounded-md bg-[color:var(--navy)] px-5 text-sm font-semibold text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">Pogledaj oglas</Link>
            )}
            <Link to="/racun/oglasi" className="inline-flex h-10 items-center rounded-md border border-border px-5 text-sm font-semibold hover:bg-secondary">Moji oglasi</Link>
            <Link to="/browse" className="inline-flex h-10 items-center rounded-md border border-border px-5 text-sm font-semibold hover:bg-secondary">Katalog</Link>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <h1 className="font-display text-3xl font-semibold">Objavi oglas</h1>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Korak {step + 1} / {STEPS.length}</span>
        </div>

        {/* Stepper */}
        <ol className="mb-8 grid grid-cols-5 gap-2">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-col items-center text-center">
              <div className={"grid h-8 w-8 place-items-center rounded-full text-xs font-bold " + (i <= step ? "bg-[color:var(--navy)] text-[color:var(--cream)]" : "bg-secondary text-muted-foreground")}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className="mt-1 hidden text-[10px] uppercase tracking-widest text-muted-foreground sm:block">{label}</span>
            </li>
          ))}
        </ol>

        <div className="rounded-2xl border border-border bg-card p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold">Što prodajete?</h2>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Kategorija</label>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: "" })}
                >
                  <option value="">Odaberite kategoriju…</option>
                  {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Podkategorija</label>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
                  disabled={!cat}
                  value={form.subcategory}
                  onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                >
                  <option value="">{cat ? "Odaberite podkategoriju…" : "Prvo odaberite kategoriju"}</option>
                  {cat?.subcategories.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold">Detalji oglasa</h2>
              <div>
                <label className="text-sm font-medium">Naslov</label>
                <Input className="mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="npr. Rolex Submariner 2022., komplet" maxLength={100} />
              </div>
              <div>
                <label className="text-sm font-medium">Opis</label>
                <Textarea className="mt-1 min-h-32" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Opišite stanje, dokumentaciju, mogućnost pregleda…" maxLength={2000} />
              </div>
              <div>
                <label className="text-sm font-medium">Cijena (EUR)</label>
                <Input className="mt-1" type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="npr. 12000" />
              </div>
              <div>
                <label className="text-sm font-medium">Fotografije ({form.images.length}/12)</label>
                <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center hover:bg-secondary/40">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <div className="mt-2 text-sm font-medium">{uploading ? "Uploadam…" : "Odaberite ili povucite slike"}</div>
                  <div className="text-xs text-muted-foreground">JPG/PNG, do 8 MB po slici</div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={uploading || form.images.length >= 12}
                    onChange={(e) => { void handleFiles(e.target.files); e.target.value = ""; }}
                  />
                </label>
                {form.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {form.images.map((src, i) => (
                      <div key={src} className="relative aspect-square overflow-hidden rounded-lg border border-border">
                        <img src={src} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                          className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-background/90 text-destructive shadow"
                          aria-label="Ukloni sliku"
                        ><X className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold">Lokacija</h2>
              <div>
                <label className="text-sm font-medium">Grad</label>
                <select
                  className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                >
                  {CITIES_LIST.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold">Kontakt podaci</h2>
              <div>
                <label className="text-sm font-medium">Telefon</label>
                <Input className="mt-1" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="+385 91 234 5678" />
              </div>
              <p className="text-xs text-muted-foreground">Broj se prikazuje samo registriranim korisnicima koji vam pošalju upit.</p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold">Pregled prije objave</h2>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Row label="Kategorija" value={`${cat?.name ?? "—"} / ${cat?.subcategories.find((s) => s.slug === form.subcategory)?.name ?? "—"}`} />
                <Row label="Naslov" value={form.title} />
                <Row label="Cijena" value={`${Number(form.price).toLocaleString("hr-HR")} EUR`} />
                <Row label="Grad" value={form.city} />
                <Row label="Telefon" value={form.contactPhone} />
              </dl>
              <p className="rounded-lg bg-secondary/60 p-3 text-sm text-foreground/80">{form.description}</p>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4"
                  checked={form.agree}
                  onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                />
                <span>Prihvaćam <Link to="/uvjeti" className="font-medium text-[color:var(--gold-deep)]">Uvjete objave</Link> i potvrđujem točnost podataka.</span>
              </label>
            </div>
          )}

          {err && <p className="mt-4 text-sm text-destructive">{err}</p>}

          <div className="mt-6 flex items-center justify-between">
            <Button type="button" variant="outline" onClick={back} disabled={step === 0}>
              <ChevronLeft className="h-4 w-4" /> Natrag
            </Button>
            <Button type="button" onClick={next} disabled={submitting} className="bg-[color:var(--navy)] text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">
              {step === STEPS.length - 1 ? (submitting ? "Objavljivanje…" : "Objavi oglas") : <>Dalje <ChevronRight className="h-4 w-4" /></>}
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </>
  );


}
