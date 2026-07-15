import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteShell, Breadcrumbs } from "@/components/site/SiteShell";
import { ListingsGrid } from "@/components/site/ListingsGrid";
import { SubcategoryIcon } from "@/components/site/SubcategoryIcon";
import { trackSubcategoryView } from "@/lib/analytics";
import { getCategory, getSubcategory, countBySubcategory, type Category, type Subcategory } from "@/lib/mock/data";

export const Route = createFileRoute("/kategorija/$category/$subcategory")({
  loader: ({ params }) => {
    const cat = getCategory(params.category);
    const sub = getSubcategory(params.category, params.subcategory);
    if (!cat || !sub) throw notFound();
    return { cat, sub };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.sub.name} — ${loaderData?.cat.name} | Biraj.HR` },
      {
        name: "description",
        content:
          loaderData?.sub.description ??
          `Oglasi u podkategoriji ${loaderData?.sub.name} (${loaderData?.cat.name}) na Biraj.HR — provjereni oglasi, jasne cijene i sigurna komunikacija.`,
      },
      { property: "og:title", content: `${loaderData?.sub.name} — Biraj.HR` },
      { property: "og:description", content: loaderData?.sub.description ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl">Podkategorija ne postoji</h1>
        <Link to="/browse" className="mt-4 inline-block text-[color:var(--gold-deep)]">Otvori katalog →</Link>
      </div>
    </SiteShell>
  ),
  errorComponent: () => <SiteShell><div className="p-12">Greška.</div></SiteShell>,
  component: SubcategoryPage,
});

function SubcategoryPage() {
  const { cat, sub } = Route.useLoaderData() as { cat: Category; sub: Subcategory };
  const count = countBySubcategory(cat.slug, sub.slug);

  useEffect(() => {
    trackSubcategoryView(cat.slug, sub.slug);
  }, [cat.slug, sub.slug]);

  return (
    <SiteShell>
      <section className="border-b border-border bg-[color:var(--cream)]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Breadcrumbs items={[
            { label: "Početna", to: "/" },
            { label: "Katalog", to: "/browse" },
            { label: cat.name, to: "/kategorija/$category", params: { category: cat.slug } },
            { label: sub.name },
          ]} />
          <div className="mt-4 flex items-start gap-4">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--gold)]/40 bg-white text-[color:var(--gold-deep)] shadow-sm sm:flex">
              <SubcategoryIcon name={sub.icon} className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-semibold md:text-5xl">{sub.name}</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                {sub.description ?? `${count} oglasa u podkategoriji ${sub.name}.`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{count}</span> dostupnih oglasa
              </p>
            </div>
          </div>

          {/* Sestrinske podkategorije za brzu navigaciju */}
          <ul className="mt-6 flex flex-wrap gap-2">
            {cat.subcategories.map((s) => {
              const active = s.slug === sub.slug;
              return (
                <li key={s.slug}>
                  <Link
                    to="/kategorija/$category/$subcategory"
                    params={{ category: cat.slug, subcategory: s.slug }}
                    className={
                      "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition " +
                      (active
                        ? "border-[color:var(--gold)] bg-[color:var(--gold)]/15 text-[color:var(--gold-deep)] font-medium shadow-sm"
                        : "border-border bg-background hover:border-[color:var(--gold)] hover:text-[color:var(--gold-deep)]")
                    }
                  >
                    <SubcategoryIcon name={s.icon} className="h-3.5 w-3.5" />
                    {s.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <ListingsGrid base={{ category: cat.slug, subcategory: sub.slug }} />
      </section>
    </SiteShell>
  );
}</content>
