import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell, Breadcrumbs } from "@/components/site/SiteShell";
import { ListingsGrid } from "@/components/site/ListingsGrid";
import { SubcategoryIcon } from "@/components/site/SubcategoryIcon";
import { getCategory, countByCategory, countBySubcategory, type Category } from "@/lib/mock/data";

export const Route = createFileRoute("/kategorija/$category")({
  loader: ({ params }) => {
    const cat = getCategory(params.category);
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.cat.name} — Biraj.HR` },
      { name: "description", content: `${loaderData?.cat.tagline}. Pregledajte sve oglase u kategoriji ${loaderData?.cat.name}.` },
      { property: "og:title", content: `${loaderData?.cat.name} — Biraj.HR` },
      { property: "og:description", content: loaderData?.cat.tagline ?? "" },
      { property: "og:image", content: `/api/og/category/${loaderData?.cat.slug}` ?? "" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "twitter:image", content: `/api/og/category/${loaderData?.cat.slug}` ?? "" },
      { property: "twitter:card", content: "summary_large_image" },
    ],
  }),
  notFoundComponent: () => (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl">Kategorija ne postoji</h1>
        <Link to="/browse" className="mt-4 inline-block text-[color:var(--gold-deep)]">Otvori katalog →</Link>
      </div>
    </SiteShell>
  ),
  errorComponent: () => <SiteShell><div className="p-12">Greška pri učitavanju.</div></SiteShell>,
  component: CategoryPage,
});

function CategoryPage() {
  const { cat } = Route.useLoaderData() as { cat: Category };
  const count = countByCategory(cat.slug);
  return (
    <SiteShell>
      <section className="border-b border-border bg-[color:var(--cream)]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Breadcrumbs items={[
            { label: "Početna", to: "/" },
            { label: "Katalog", to: "/browse" },
            { label: cat.name },
          ]} />
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-semibold md:text-5xl">{cat.name}</h1>
              <p className="mt-2 text-muted-foreground">{cat.tagline} · <span className="font-medium">{count} oglasa</span></p>
            </div>
          </div>

          {/* Bogate kartice podkategorija s ikonama i kratkim opisima */}
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {cat.subcategories.map((s) => {
              const c = countBySubcategory(cat.slug, s.slug);
              return (
                <li key={s.slug}>
                  <Link
                    to="/kategorija/$category/$subcategory"
                    params={{ category: cat.slug, subcategory: s.slug }}
                    className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-background p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--gold)] hover:shadow-md"
                  >
                    <span className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color:var(--gold)]/40 bg-[color:var(--cream)] text-[color:var(--gold-deep)]">
                        <SubcategoryIcon name={s.icon} className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium leading-snug group-hover:text-[color:var(--gold-deep)]">
                          {s.name}
                        </span>
                        {s.description && (
                          <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                            {s.description}
                          </span>
                        )}
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {c} {c === 1 ? "oglas" : "oglasa"}
                        </span>
                      </span>
                    </span>
                    <span className="mt-auto inline-flex items-center justify-between rounded-full border border-[color:var(--gold)]/40 bg-[color:var(--cream)] px-3 py-1.5 text-xs font-medium text-[color:var(--gold-deep)] transition group-hover:bg-[color:var(--gold)] group-hover:text-white">
                      Pogledaj {s.name}
                      <span aria-hidden>→</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <ListingsGrid base={{ category: cat.slug }} />
      </section>
    </SiteShell>
  );


}
