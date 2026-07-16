import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteShell, Breadcrumbs } from "@/components/site/SiteShell";
import { ListingCard } from "@/components/site/ListingCard";
import { getCategory, getSubcategory, formatPrice, type Category, type Subcategory } from "@/lib/mock/data";
import {
  fetchListingById, fetchListings, fetchSellerProfile, resolveImages, avatarLetter, joinedYear,
  type ListingRow, type SellerProfileRow,
} from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Heart, MapPin, MessageCircle, ShieldCheck, Star } from "lucide-react";
import { ReportButton } from "@/components/site/ReportButton";
import { ReviewsSection } from "@/components/site/ReviewsSection";

export const Route = createFileRoute("/oglas/$id")({
  loader: async ({ params }) => {
    const listing = await fetchListingById(params.id);
    if (!listing) throw notFound();
    const seller = await fetchSellerProfile(listing.owner_id);
    const cat = getCategory(listing.category_slug);
    const sub = cat ? getSubcategory(listing.category_slug, listing.subcategory_slug) : undefined;
    if (!cat || !sub) throw notFound();
    return { listing, seller, cat, sub };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.listing.title} — Biraj.HR` },
      { name: "description", content: loaderData?.listing.description.slice(0, 155) ?? "" },
      { property: "og:title", content: loaderData?.listing.title ?? "" },
      { property: "og:description", content: loaderData?.listing.description.slice(0, 155) ?? "" },
      { property: "og:image", content: `/api/og/listing/${loaderData?.listing.id}` ?? "" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "twitter:image", content: `/api/og/listing/${loaderData?.listing.id}` ?? "" },
      { property: "twitter:card", content: "summary_large_image" },
    ],
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: loaderData.listing.title,
              description: loaderData.listing.description,
              image: resolveImages(loaderData.listing.images),
              category: loaderData.cat.name,
              brand: { "@type": "Brand", name: "Biraj.HR" },
              offers: {
                "@type": "Offer",
                priceCurrency: "EUR",
                price: loaderData.listing.price_eur,
                availability: "https://schema.org/InStock",
                seller: { "@type": "Person", name: loaderData.seller?.full_name ?? "Prodavač" },
                areaServed: loaderData.listing.location,
              },
            }),
          },
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Početna", item: "https://biraj.hr/" },
                { "@type": "ListItem", position: 2, name: "Katalog", item: "https://biraj.hr/browse" },
                { "@type": "ListItem", position: 3, name: loaderData.cat.name, item: `https://biraj.hr/kategorija/${loaderData.cat.slug}` },
                { "@type": "ListItem", position: 4, name: loaderData.sub.name, item: `https://biraj.hr/kategorija/${loaderData.cat.slug}/${loaderData.sub.slug}` },
                { "@type": "ListItem", position: 5, name: loaderData.listing.title },
              ],
            }),
          },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl">Oglas ne postoji</h1>
        <Link to="/browse" className="mt-4 inline-block text-[color:var(--gold-deep)]">Otvori katalog →</Link>
      </div>
    </SiteShell>
  ),
  errorComponent: () => <SiteShell><div className="p-12">Greška.</div></SiteShell>,
  component: ListingDetail,
});

function ListingDetail() {
  const { listing, seller, cat, sub } = Route.useLoaderData() as {
    listing: ListingRow; seller: SellerProfileRow | null; cat: Category; sub: Subcategory;
  };
  const [active, setActive] = useState(0);
  const imgs = resolveImages(listing.images);
  const { data: related = [] } = useQuery({
    queryKey: ["related", listing.id, listing.category_slug],
    queryFn: () => fetchListings({ category: listing.category_slug, excludeId: listing.id, limit: 4 }),
  });
  const specs = (listing.metadata && typeof listing.metadata === "object"
    ? ((listing.metadata as { specs?: Record<string, string> }).specs ?? {})
    : {}) as Record<string, string>;
  const authenticated = Boolean(
    listing.metadata && typeof listing.metadata === "object" && (listing.metadata as { authenticated?: boolean }).authenticated,
  );

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Breadcrumbs items={[
          { label: "Početna", to: "/" },
          { label: "Katalog", to: "/browse" },
          { label: cat.name, to: "/kategorija/$category", params: { category: cat.slug } },
          { label: sub.name, to: "/kategorija/$category/$subcategory", params: { category: cat.slug, subcategory: sub.slug } },
          { label: listing.title },
        ]} />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="overflow-hidden rounded-2xl bg-card">
              <img src={imgs[active] ?? imgs[0]} alt={listing.title} className="aspect-[4/3] w-full object-cover" />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {imgs.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`overflow-hidden rounded-lg border-2 ${i === active ? "border-[color:var(--gold)]" : "border-transparent"}`}
                >
                  <img src={img} alt="" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>

            <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold">Opis</h2>
              <p className="mt-3 leading-relaxed text-foreground/90">{listing.description}</p>
            </div>

            <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold">Specifikacije</h2>
              <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {Object.entries(specs).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-border py-2">
                    <dt className="text-sm text-muted-foreground">{k}</dt>
                    <dd className="text-sm font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold">Lokacija</h2>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {listing.location}{listing.county ? `, ${listing.county}` : ""}
              </div>
              <div className="mt-3 grid h-60 place-items-center rounded-2xl border border-border bg-secondary/40 text-sm text-muted-foreground">
                Karta lokacije ({listing.location})
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
              {listing.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--gold)]/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[color:var(--gold-deep)]">
                  <BadgeCheck className="h-3 w-3" /> {authenticated ? "Autentificirano" : "Verificirano"}
                </span>
              )}
              <h1 className="mt-3 font-display text-3xl font-semibold leading-tight">{listing.title}</h1>
              <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {listing.location}
              </div>
              <div className="mt-5 font-display text-4xl font-semibold" style={{ color: "var(--navy)" }}>
                {formatPrice(listing.price_eur)}
              </div>
              <div className="mt-6 grid gap-2">
                <Button className="bg-[color:var(--navy)] text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">
                  <MessageCircle className="h-4 w-4" /> Kontaktiraj prodavača
                </Button>
                <Button variant="outline">
                  <Heart className="h-4 w-4" /> Spremi oglas
                </Button>
                <ReportButton targetType="listing" targetId={listing.id} label="Prijavi oglas" variant="ghost" className="justify-center text-muted-foreground hover:text-destructive" />
              </div>
              <div className="mt-5 flex items-start gap-2 rounded-xl bg-secondary/40 p-3 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[color:var(--gold-deep)]" />
                <span>Biraj.HR ne posreduje u plaćanju. Cijenu i način preuzimanja dogovarate izravno s prodavateljem.</span>
              </div>
            </div>

            {seller && (
              <Link
                to="/prodavac/$userId"
                params={{ userId: seller.id }}
                className="block rounded-2xl border border-border bg-card p-5 hover:border-[color:var(--gold)]"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--navy)] font-display text-lg text-[color:var(--cream)]">
                    {avatarLetter(seller.full_name)}
                  </span>
                  <div>
                    <div className="font-semibold">{seller.full_name ?? "Prodavač"}</div>
                    <div className="text-xs text-muted-foreground">{seller.city ?? "—"} · od {joinedYear(seller.created_at)}.</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current" style={{ color: "var(--gold)" }} />
                    <span className="text-muted-foreground">Provjereni prodavač</span>
                  </div>
                </div>
              </Link>
            )}
          </aside>
        </div>

        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold">Slični oglasi</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((l) => <ListingCard key={l.id} l={l} />)}
          </div>
        </section>

        {seller && (
          <ReviewsSection rateeId={seller.id} listingId={listing.id} title="Recenzije za ovaj oglas" />
        )}
      </div>
    </SiteShell>
  );


}
