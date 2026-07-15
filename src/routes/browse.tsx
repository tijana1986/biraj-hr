import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell, Breadcrumbs } from "@/components/site/SiteShell";
import { CATEGORIES, countByCategory } from "@/lib/mock/data";
import { SubcategoryIcon } from "@/components/site/SubcategoryIcon";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Katalog kategorija — Biraj.HR" },
      { name: "description", content: "Pregledajte sve kategorije i podkategorije na Biraj.HR — hrvatskom marketplaceu provjerenih oglasa." },
      { property: "og:title", content: "Katalog kategorija — Biraj.HR" },
      { property: "og:description", content: "Pregledajte sve kategorije na Biraj.HR." },
    ],
  }),
  component: BrowsePage,
});

function BrowsePage() {
  return (
    <SiteShell>
      <section className="border-b border-border bg-[color:var(--cream)]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <Breadcrumbs items={[{ label: "Početna", to: "/" }, { label: "Katalog" }]} />
          <h1 className="mt-4 font-display text-4xl font-semibold md:text-5xl">Pregledajte cijeli katalog</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {CATEGORIES.length} glavnih kategorija, po 5 podkategorija (uključujući „Ostalo") — pregledno i bez nepotrebnog šuma.
          </p>
          <form action="/pretraga" method="get" className="relative mt-6 max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" placeholder="Pretraži po nazivu, gradu ili brendu..." className="h-12 rounded-full pl-10" />
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <article
              key={c.slug}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-baseline justify-between gap-3 border-b border-border px-6 py-4">
                <h2 className="font-display text-xl font-semibold">
                  <Link
                    to="/kategorija/$category"
                    params={{ category: c.slug }}
                    className="hover:text-[color:var(--gold-deep)]"
                  >
                    {c.name}
                  </Link>
                </h2>
                <span className="shrink-0 text-[11px] uppercase tracking-widest text-muted-foreground">
                  {countByCategory(c.slug)} oglasa
                </span>
              </div>
              <p className="px-6 pt-4 text-sm text-muted-foreground">{c.tagline}</p>
              <ul className="mt-3 grid grid-cols-1 gap-1 px-3 pb-4">
                {c.subcategories.map((s) => (
                  <li key={s.slug}>
                    <Link
                      to="/kategorija/$category/$subcategory"
                      params={{ category: c.slug, subcategory: s.slug }}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-[color:var(--cream)] hover:text-[color:var(--gold-deep)]"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[color:var(--gold)]/40 bg-[color:var(--cream)] text-[color:var(--gold-deep)]">
                        <SubcategoryIcon name={s.icon} className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 truncate">{s.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-auto border-t border-border px-6 py-3">
                <Link
                  to="/kategorija/$category"
                  params={{ category: c.slug }}
                  className="text-xs font-medium text-[color:var(--gold-deep)] hover:underline"
                >
                  Otvori kategoriju →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
