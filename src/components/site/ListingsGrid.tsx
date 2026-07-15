import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ListingCard } from "@/components/site/ListingCard";
import { getCategory } from "@/lib/mock/data";
import { fetchListings, fetchCategoryCounts, COUNTIES, type CatalogQuery } from "@/lib/catalog";
import { SubcategoryIcon } from "@/components/site/SubcategoryIcon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SlidersHorizontal, Loader2 } from "lucide-react";

const PAGE_SIZE = 12;

export function ListingsGrid({
  base,
  emptyMessage = "Nema oglasa koji odgovaraju filterima.",
}: {
  base: Pick<CatalogQuery, "category" | "subcategory" | "q">;
  emptyMessage?: string;
}) {
  const [sort, setSort] = useState<CatalogQuery["sort"]>(base.q ? "relevantnost" : "noviji");
  const [county, setCounty] = useState<string | undefined>();
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  // Lokalni filter za podkategoriju aktivan samo kad smo na razini kategorije
  // (base.category postoji, base.subcategory ne).
  const [subFilter, setSubFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = base.category && !base.subcategory ? getCategory(base.category) : undefined;
  const effectiveSub = base.subcategory ?? subFilter;

  const query: CatalogQuery = {
    ...base,
    subcategory: effectiveSub,
    sort,
    county,
    verifiedOnly,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  };

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["catalog", query],
    queryFn: () => fetchListings(query),
    staleTime: 30_000,
  });

  const { data: counts } = useQuery({
    queryKey: ["catalog-counts"],
    queryFn: fetchCategoryCounts,
    staleTime: 60_000,
    enabled: Boolean(category),
  });

  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const slice = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
      {/* Mobile toggle */}
      <div className="flex items-center justify-between gap-2 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFiltersOpen((v) => !v)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {filtersOpen ? "Sakrij filtere" : "Filteri"}
        </Button>
        <Select value={sort} onValueChange={(v) => setSort(v as CatalogQuery["sort"])}>
          <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="relevantnost">Relevantnost</SelectItem>
            <SelectItem value="noviji">Datum: najnoviji</SelectItem>
            <SelectItem value="cijena-asc">Cijena: niže → više</SelectItem>
            <SelectItem value="cijena-desc">Cijena: više → niže</SelectItem>
            <SelectItem value="popularnost">Popularnost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <aside
        className={
          "space-y-6 rounded-2xl border border-border bg-card p-5 lg:block " +
          (filtersOpen ? "block" : "hidden")
        }
      >
        {category && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Podkategorija
            </div>
            <ul className="mt-3 space-y-1.5">
              <li>
                <button
                  type="button"
                  onClick={() => { setSubFilter(undefined); setPage(1); }}
                  className={
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition " +
                    (!subFilter
                      ? "bg-[color:var(--gold)]/15 text-[color:var(--gold-deep)] font-medium"
                      : "hover:bg-muted")
                  }
                >
                  <span>Sve podkategorije</span>
                </button>
              </li>
              {category.subcategories.map((s) => {
                const active = subFilter === s.slug;
                const count = counts?.bySub[`${category.slug}/${s.slug}`] ?? 0;
                return (
                  <li key={s.slug}>
                    <button
                      type="button"
                      onClick={() => { setSubFilter(s.slug); setPage(1); }}
                      className={
                        "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition " +
                        (active
                          ? "bg-[color:var(--gold)]/15 text-[color:var(--gold-deep)] font-medium"
                          : "hover:bg-muted")
                      }
                      aria-pressed={active}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <SubcategoryIcon name={s.icon} className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{s.name}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cijena (€)</div>
          <div className="mt-2 flex gap-2">
            <Input value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(1); }} type="number" placeholder="Od" className="h-9" />
            <Input value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }} type="number" placeholder="Do" className="h-9" />
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Županija</div>
          <Select value={county ?? "_all"} onValueChange={(v) => { setCounty(v === "_all" ? undefined : v); setPage(1); }}>
            <SelectTrigger className="mt-2 h-9"><SelectValue placeholder="Sve županije" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Sve županije</SelectItem>
              {COUNTIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={verifiedOnly} onCheckedChange={(v) => { setVerifiedOnly(Boolean(v)); setPage(1); }} />
          Samo verificirani prodavači
        </label>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => { setMinPrice(""); setMaxPrice(""); setCounty(undefined); setVerifiedOnly(false); setSubFilter(undefined); setPage(1); }}
        >
          Resetiraj filtere
        </Button>
      </aside>

      <div>
        <div className="hidden flex-wrap items-center justify-between gap-3 lg:flex">
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{isLoading ? "…" : results.length}</span> oglasa
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as CatalogQuery["sort"])}>
            <SelectTrigger className="h-9 w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="relevantnost">Relevantnost</SelectItem>
              <SelectItem value="noviji">Datum: najnoviji</SelectItem>
              <SelectItem value="cijena-asc">Cijena: niže → više</SelectItem>
              <SelectItem value="cijena-desc">Cijena: više → niže</SelectItem>
              <SelectItem value="popularnost">Popularnost</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mb-3 text-sm text-muted-foreground lg:hidden">
          <span className="font-semibold text-foreground">{isLoading ? "…" : results.length}</span> oglasa
        </div>

        {isLoading ? (
          <div className="mt-12 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-10 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Učitavanje oglasa…
          </div>
        ) : slice.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground">{emptyMessage}</p>
            <Link to="/browse" className="mt-3 inline-block text-sm font-medium text-[color:var(--gold-deep)]">
              Otvori katalog →
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {slice.map((l) => <ListingCard key={l.id} l={l} />)}
          </div>
        )}

        {pages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={current === 1} onClick={() => setPage(current - 1)}>
              Prethodna
            </Button>
            <span className="text-sm text-muted-foreground">Stranica {current} / {pages}</span>
            <Button variant="outline" size="sm" disabled={current === pages} onClick={() => setPage(current + 1)}>
              Sljedeća
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}