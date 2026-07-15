import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, Breadcrumbs } from "@/components/site/SiteShell";
import { ListingsGrid } from "@/components/site/ListingsGrid";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";

const searchSchema = z.object({ q: fallback(z.string(), "").default("") });

export const Route = createFileRoute("/pretraga")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Pretraga — Biraj.HR" },
      { name: "description", content: "Pretražite provjerene oglase na Biraj.HR — premium hrvatskom marketplaceu." },
      { property: "og:title", content: "Pretraga — Biraj.HR" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q);
  return (
    <SiteShell>
      <section className="border-b border-border bg-[color:var(--cream)]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Breadcrumbs items={[{ label: "Početna", to: "/" }, { label: "Pretraga" }]} />
          <h1 className="mt-4 font-display text-4xl font-semibold">Rezultati pretrage</h1>
          <form action="/pretraga" method="get" className="relative mt-5 max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={q}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Što tražite?"
              className="h-12 rounded-full pl-10"
            />
          </form>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <ListingsGrid base={{ q: query || q }} emptyMessage="Nema rezultata. Pokušajte s drugim pojmom ili pregledajte katalog." />
      </section>
    </SiteShell>
  );


}
