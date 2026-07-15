import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Trash2, Plus, RefreshCw } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { formatPrice } from "@/lib/mock/data";
import { listMyListings, deleteListing } from "@/lib/listings.functions";
import placeholderImg from "@/assets/listing-1.jpg";

export const Route = createFileRoute("/racun/oglasi")({
  component: MyListings,
});

const STATUS_LABEL: Record<string, string> = {
  active: "Aktivan",
  draft: "Skica",
  pending: "Na pregledu",
  paused: "Pauziran",
  sold: "Prodano",
  expired: "Isteklo",
};

function MyListings() {
  const list = useServerFn(listMyListings);
  const remove = useServerFn(deleteListing);
  const qc = useQueryClient();

  const { data: mine = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["my-listings"],
    queryFn: () => list(),
  });

  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-listings"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Moji oglasi</h1>
          <p className="text-sm text-muted-foreground">Upravljajte svojim aktivnim i prošlim oglasima.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-secondary" aria-label="Osvježi"><RefreshCw className="h-4 w-4" /></button>
          <Link to="/objavi" className="inline-flex items-center gap-2 rounded-md bg-[color:var(--navy)] px-4 py-2 text-sm font-semibold text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">
            <Plus className="h-4 w-4" /> Novi oglas
          </Link>
        </div>
      </div>

      {isLoading && <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Učitavanje oglasa…</div>}
      {isError && <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">Greška pri dohvaćanju. Pokušajte osvježiti.</div>}
      {!isLoading && !isError && mine.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <div className="font-display text-lg font-semibold">Još nemate oglasa</div>
          <p className="mt-1 text-sm text-muted-foreground">Objavite prvi oglas u nekoliko koraka.</p>
          <Link to="/objavi" className="mt-4 inline-flex items-center gap-2 rounded-md bg-[color:var(--navy)] px-4 py-2 text-sm font-semibold text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">
            <Plus className="h-4 w-4" /> Novi oglas
          </Link>
        </div>
      )}

      {mine.length > 0 && (
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {mine.map((l, i) => (
          <div key={l.id} className={"flex flex-col gap-4 p-4 sm:flex-row sm:items-center " + (i < mine.length - 1 ? "border-b border-border" : "") }>
            <img src={(l.images?.[0] as string) ?? placeholderImg} alt={l.title} className="h-24 w-32 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <Link to="/oglas/$id" params={{ id: l.id }} className="line-clamp-1 font-display text-lg font-semibold hover:text-[color:var(--gold-deep)]">
                {l.title}
              </Link>
              <div className="mt-1 text-xs text-muted-foreground">{l.location} • {new Date(l.created_at).toLocaleDateString("hr-HR")}</div>
              <div className="mt-1 flex items-center gap-3 text-xs">
                <span className="rounded-full bg-secondary px-2 py-0.5 font-medium" style={{ color: "var(--navy)" }}>{STATUS_LABEL[l.status] ?? l.status}</span>
                <span className="text-muted-foreground"><Eye className="mr-1 inline h-3 w-3" />{l.views_count} pregleda</span>
                {l.is_verified && <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ background: "color-mix(in oklab, var(--gold) 20%, transparent)", color: "var(--gold-deep)" }}>Provjeren</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-xl font-semibold" style={{ color: "var(--navy)" }}>{formatPrice(Number(l.price_eur))}</div>
              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={() => {
                    if (window.confirm("Obrisati ovaj oglas? Radnja je nepovratna.")) del.mutate(l.id);
                  }}
                  disabled={del.isPending}
                  className="grid h-8 w-8 place-items-center rounded-md border border-border text-destructive hover:bg-secondary disabled:opacity-50"
                  aria-label="Obriši"
                ><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );

