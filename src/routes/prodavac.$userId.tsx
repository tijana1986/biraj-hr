import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell, Breadcrumbs } from "@/components/site/SiteShell";
import { ListingCard } from "@/components/site/ListingCard";
import {
  fetchSellerProfile, fetchListings, avatarLetter, joinedYear,
  type SellerProfileRow, type ListingRow,
} from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { BadgeCheck, MessageCircle, Star } from "lucide-react";
import { ReviewsSection } from "@/components/site/ReviewsSection";

export const Route = createFileRoute("/prodavac/$userId")({
  loader: async ({ params }) => {
    const seller = await fetchSellerProfile(params.userId);
    if (!seller) throw notFound();
    const listings = await fetchListings({ limit: 60 }).then((rows) =>
      rows.filter((r) => r.owner_id === seller.id),
    );
    return { seller, listings };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.seller.full_name ?? "Prodavač"} — Profil prodavača | Biraj.HR` },
      { name: "description", content: `Pregledajte oglase prodavača ${loaderData?.seller.full_name ?? ""} na Biraj.HR.` },
      { property: "og:title", content: `${loaderData?.seller.full_name ?? "Prodavač"} — Biraj.HR` },
      { property: "og:description", content: `Pregledajte oglase prodavača ${loaderData?.seller.full_name ?? ""} na Biraj.HR.` },
      { property: "og:image", content: `/api/og/seller/${loaderData?.seller.id}` ?? "" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "twitter:image", content: `/api/og/seller/${loaderData?.seller.id}` ?? "" },
      { property: "twitter:card", content: "summary_large_image" },
    ],
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: loaderData.seller.full_name ?? "Prodavač",
              address: { "@type": "PostalAddress", addressLocality: loaderData.seller.city ?? "", addressCountry: "HR" },
              memberOf: { "@type": "Organization", name: "Biraj.HR" },
            }),
          },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <SiteShell><div className="mx-auto max-w-3xl px-6 py-24 text-center"><h1 className="font-display text-3xl">Prodavač ne postoji</h1></div></SiteShell>
  ),
  errorComponent: () => <SiteShell><div className="p-12">Greška.</div></SiteShell>,
  component: SellerPage,
});

function SellerPage() {
  const { seller, listings } = Route.useLoaderData() as { seller: SellerProfileRow; listings: ListingRow[] };
  return (
    <SiteShell>
      <section className="border-b border-border bg-[color:var(--cream)]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Breadcrumbs items={[{ label: "Početna", to: "/" }, { label: "Prodavač" }, { label: seller.full_name ?? "Prodavač" }]} />
          <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-[color:var(--navy)] font-display text-3xl text-[color:var(--cream)]">
              {avatarLetter(seller.full_name)}
            </span>
            <div>
              <h1 className="font-display text-3xl font-semibold">
                {seller.full_name ?? "Prodavač"}
                {seller.verified && <BadgeCheck className="ml-2 inline h-5 w-5" style={{ color: "var(--gold-deep)" }} />}
              </h1>
              <div className="mt-1 text-sm text-muted-foreground">{seller.city ?? "—"} · član od {joinedYear(seller.created_at)}.</div>
              <p className="mt-3 max-w-xl text-sm">Verificirani prodavač na Biraj.HR marketplaceu.</p>
              <div className="mt-3 flex gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current" style={{ color: "var(--gold)" }} />
                  <span className="font-semibold">{seller.verified ? "Provjereni" : "Novi"}</span> profil
                </div>
                <div><span className="font-semibold">{listings.length}</span> aktivnih oglasa</div>
              </div>
            </div>
            <Button className="bg-[color:var(--navy)] text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]">
              <MessageCircle className="h-4 w-4" /> Kontaktiraj
            </Button>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="font-display text-2xl font-semibold">Oglasi prodavača</h2>
        {listings.length === 0 ? (
          <p className="mt-6 text-muted-foreground">Prodavač trenutno nema aktivnih oglasa.</p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {listings.map((l) => <ListingCard key={l.id} l={l} />)}
          </div>
        )}
        <div className="mt-12">
          <Link to="/browse" className="text-sm text-[color:var(--gold-deep)]">← Natrag u katalog</Link>
        </div>
        <ReviewsSection rateeId={seller.id} title="Recenzije prodavača" />
      </section>
    </SiteShell>
  );


}
