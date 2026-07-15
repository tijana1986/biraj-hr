import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Briefcase, Plus, MapPin, EuroIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteShell } from "@/components/site/SiteShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { CATEGORIES, CITIES_LIST } from "@/lib/mock/data";
import { createServiceRequest, listOpenServiceRequests } from "@/lib/services.functions";

export const Route = createFileRoute("/poslovi")({
  head: () => ({
    meta: [
      { title: "Poslovi i usluge — Biraj.HR" },
      { name: "description", content: "Investitori objavljuju upite besplatno. Izvođači radova plaćaju 5 € po kontaktu." },
    ],
  }),
  component: JobsPage,
});

// All service subcategories from the "poslovi-i-usluge" category
const CAT_SLUG = "poslovi-i-usluge";

function JobsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const listFn = useServerFn(listOpenServiceRequests);
  const createFn = useServerFn(createServiceRequest);
  const qc = useQueryClient();

  const jobsCat = useMemo(() => CATEGORIES.find((c) => c.slug === CAT_SLUG), []);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["service-requests-open"],
    queryFn: () => listFn(),
    enabled: !!user,
  });

  const [form, setForm] = useState({
    subcategory_slug: jobsCat?.subcategories[0]?.slug ?? "",
    title: "",
    description: "",
    location: "Zagreb",
    budget_eur: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          subcategory_slug: form.subcategory_slug,
          title: form.title.trim(),
          description: form.description.trim(),
          location: form.location,
          budget_eur: form.budget_eur ? Number(form.budget_eur) : undefined,
        },
      }),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["service-requests-open"] });
      setShowForm(false);
      setForm({ ...form, title: "", description: "", budget_eur: "" });
      if (row?.id) navigate({ to: "/poslovi/$id", params: { id: row.id } });
    },
    onError: (e) => setErr(e instanceof Error ? e.message : "Neuspjelo spremanje."),
  });

  const subMap = new Map((jobsCat?.subcategories ?? []).map((s) => [s.slug, s.name]));

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[color:var(--gold-deep)]">
              <Briefcase className="h-3.5 w-3.5" /> Poslovi i usluge
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold">Otvorene potrebe investitora</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Investitori objavljuju upite <strong>besplatno</strong>. Izvođači radova plaćaju <strong>5,00 €</strong> po kontaktu — prvi koji otključa vidi napomenu "Vi ste prvi aplicirali".
            </p>
          </div>
          {user && (
            <Button onClick={() => setShowForm((v) => !v)} className="bg-[color:var(--navy)] text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">
              <Plus className="h-4 w-4" /> {showForm ? "Zatvori" : "Objavi upit (besplatno)"}
            </Button>
          )}
          {!user && (
            <Link to="/prijava" className="inline-flex h-10 items-center rounded-md bg-[color:var(--navy)] px-5 text-sm font-semibold text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">Prijavite se za objavu</Link>
          )}
        </header>

        {showForm && user && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-xl font-semibold">Novi upit</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Vrsta radova</label>
                <select
                  className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.subcategory_slug}
                  onChange={(e) => setForm({ ...form, subcategory_slug: e.target.value })}
                >
                  {jobsCat?.subcategories.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Lokacija</label>
                <select
                  className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                >
                  {CITIES_LIST.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Naslov</label>
                <Input className="mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="npr. Traži se električar za kompletno spajanje" maxLength={120} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Opis posla</label>
                <Textarea className="mt-1 min-h-32" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Opseg radova, lokacija objekta, rok, materijal…" maxLength={2000} />
              </div>
              <div>
                <label className="text-sm font-medium">Okvirni budžet (EUR, opcionalno)</label>
                <Input className="mt-1" type="number" min="0" value={form.budget_eur} onChange={(e) => setForm({ ...form, budget_eur: e.target.value })} placeholder="npr. 1500" />
              </div>
            </div>
            {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
            <div className="mt-4 flex justify-end">
              <Button onClick={() => { setErr(null); create.mutate(); }} disabled={create.isPending} className="bg-[color:var(--navy)] text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">
                {create.isPending ? "Objavljivanje…" : "Objavi upit"}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-8">
          {isLoading && <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Učitavanje upita…</div>}
          {!isLoading && rows.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              Trenutno nema otvorenih upita. Budite prvi koji objavljuje potrebu.
            </div>
          )}
          {rows.length > 0 && (
            <ul className="grid gap-3">
              {rows.map((r) => (
                <li key={r.id}>
                  <Link
                    to="/poslovi/$id"
                    params={{ id: r.id }}
                    className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition hover:border-[color:var(--gold-deep)] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                        <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold">{subMap.get(r.subcategory_slug) ?? r.subcategory_slug}</span>
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.location}</span>
                      </div>
                      <h3 className="mt-2 font-display text-lg font-semibold">{r.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right">
                      {r.budget_eur != null && (
                        <span className="inline-flex items-center gap-1 font-display text-lg font-semibold" style={{ color: "var(--navy)" }}>
                          <EuroIcon className="h-4 w-4" /> {Number(r.budget_eur).toLocaleString("hr-HR")}
                        </span>
                      )}
                      <span className="rounded-full bg-[color:var(--gold)]/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[color:var(--gold-deep)]">
                        Kontakt {Number(r.contact_fee_eur).toFixed(2)} €
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </SiteShell>
  );

