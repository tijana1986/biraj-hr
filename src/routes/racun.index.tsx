import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Heart, MessageSquare, Package, TrendingUp, Plus } from "lucide-react";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useWishlist } from "@/lib/wishlist";
import { formatPrice } from "@/lib/mock/data";
import { listMyListings, seedDemoListings } from "@/lib/listings.functions";

export const Route = createFileRoute("/racun/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { ids } = useWishlist();
  const list = useServerFn(listMyListings);
  const seed = useServerFn(seedDemoListings);
  const qc = useQueryClient();

  const { data: myListings = [] } = useQuery({
    queryKey: ["my-listings"],
    queryFn: () => list(),
    enabled: !!user,
  });

  // First-login auto-seed of sample listings (idempotent via profiles.demo_seeded).
  useEffect(() => {
    if (!user) return;
    void seed().then((res) => {
      if (!res.skipped) qc.invalidateQueries({ queryKey: ["my-listings"] });
    }).catch(() => { /* ignore */ });
  }, [user, seed, qc]);

  const stats = [
    { label: "Aktivni oglasi", value: myListings.length, icon: Package, hint: "Trenutno objavljeno" },
    { label: "Pregledi (7 dana)", value: 1248, icon: Eye, hint: "+12% u odnosu na prošli tjedan" },
    { label: "Nove poruke", value: 3, icon: MessageSquare, hint: "U inboxu" },
    { label: "Spremljeno", value: ids.length, icon: Heart, hint: "Vaš wishlist" },
  ];

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-border bg-gradient-to-br from-[color:var(--cream)] to-background p-8">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Dobrodošli</div>
        <h1 className="mt-1 font-display text-3xl font-semibold">Pozdrav, {user?.name.split(" ")[0]}.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Ovo je vaš pregled aktivnosti na Biraj.HR — upravljajte oglasima, pratite poruke i nastavite tamo gdje ste stali.
        </p>
        <Link
          to="/objavi"
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-[color:var(--navy)] px-5 py-2.5 text-sm font-semibold text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]"
        >
          <Plus className="h-4 w-4" /> Objavi novi oglas
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-[color:var(--gold-deep)]" />
            </div>
            <div className="mt-3 font-display text-3xl font-semibold">{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold">Vaši zadnji oglasi</h2>
            <p className="text-sm text-muted-foreground">Pregled aktivnih primjeraka u prodaji.</p>
          </div>
          <Link to="/racun/oglasi" className="text-xs font-semibold uppercase tracking-widest text-[color:var(--gold-deep)]">Pogledaj sve →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {myListings.slice(0, 4).map((l) => (
            <Link key={l.id} to="/oglas/$id" params={{ id: l.id }} className="flex gap-3 rounded-xl border border-border bg-card p-3 hover:border-[color:var(--gold-deep)]">
              <img src={(l.images?.[0] as string) ?? ""} alt={l.title} className="h-20 w-24 flex-none rounded-lg object-cover" />
              <div className="min-w-0">
                <div className="line-clamp-1 font-display text-sm font-semibold">{l.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{l.location}</div>
                <div className="mt-1 font-display text-base font-semibold" style={{ color: "var(--navy)" }}>{formatPrice(Number(l.price_eur))}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <TrendingUp className="h-4 w-4 text-[color:var(--gold-deep)]" /> Ukupna procijenjena vrijednost vaših oglasa
        </div>
        <div className="mt-2 font-display text-3xl font-semibold">
          {formatPrice(myListings.reduce((s, l) => s + Number(l.price_eur), 0))}
        </div>
      </section>
    </div>
  );
}</content>
