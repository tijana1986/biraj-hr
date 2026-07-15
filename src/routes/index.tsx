import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Search, MapPin, ShieldCheck, BadgeCheck, Lock, Camera, Sparkles,
  ArrowRight, Star, Quote, Mail,
  Home as HomeIcon, Car, Smartphone, Tv, Briefcase, Hammer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImg from "@/assets/hero.jpg";
import listing1 from "@/assets/listing-1.jpg";
import { SiteShell } from "@/components/site/SiteShell";
import { useQuery } from "@tanstack/react-query";
import { fetchListings } from "@/lib/catalog";
import { ListingCard } from "@/components/site/ListingCard";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Biraj.HR — Kupi i prodaj s povjerenjem" },
      { name: "description", content: "Premium hrvatski marketplace s provjerenim prodavačima i provjerenim oglasima. Bez naknade za kupce — dogovor izravno s prodavateljem." },
      { property: "og:title", content: "Biraj.HR — Kupi i prodaj s povjerenjem" },
      { property: "og:description", content: "Hrvatski marketplace provjerenih oglasa. Provjereni prodavači, transparentne cijene objave, izravni kontakt." },
      { property: "og:url", content: "https://biraj.hr/" },
    ],
    links: [{ rel: "canonical", href: "https://biraj.hr/" }],
  }),
  component: Index,
});

const categories = [
  { icon: HomeIcon, label: "Nekretnine", slug: "nekretnine" },
  { icon: Car, label: "Vozila", slug: "vozila" },
  { icon: Smartphone, label: "Mobiteli", slug: "mobiteli-tableti" },
  { icon: Tv, label: "TV i foto", slug: "tv-audio-foto" },
  { icon: Briefcase, label: "Poslovi", slug: "poslovi-usluge" },
  { icon: Hammer, label: "Usluge", slug: "poslovi-usluge" },
];

const steps = [
  { n: "01", title: "Registracija i verifikacija", desc: "Kreirajte profil i prođite verifikaciju identiteta za pristup zajednici." },
  { n: "02", title: "Pretražite provjerene oglase", desc: "Filtrirajte po kategoriji, lokaciji i cijeni — pretraga je besplatna za kupce." },
  { n: "03", title: "Kontaktirajte prodavatelja", desc: "Razgovor ostaje unutar platforme; uvjete preuzimanja dogovarate izravno s prodavateljem." },
  { n: "04", title: "Dogovor i preuzimanje", desc: "Pregled uživo, dostava ili osobna primopredaja — Biraj.HR ne posreduje u plaćanju." },
];

const features = [
  { icon: BadgeCheck, title: "Samo provjereni korisnici", desc: "Svaki prodavač i kupac prolazi verifikaciju identiteta i adrese." },
  { icon: Lock, title: "Bez naknade za kupce", desc: "Pretraga i kontakt s prodavateljima su uvijek besplatni za kupce." },
  { icon: Camera, title: "Profesionalna fotografija", desc: "Cloudinary pipeline za besprijekoran prikaz svakog oglasa." },
  { icon: Sparkles, title: "Provjereni izbor", desc: "Premium oglasi koji prolaze ručnu kontrolu kvalitete." },
];

const testimonials = [
  { name: "Ana Marić", role: "Kupac, Zagreb", text: "Konačno marketplace gdje znam s kim razgovaram. Sve je transparentno i elegantno." },
  { name: "Luka Horvat", role: "Prodavač, Split", text: "Profesionalne fotografije i provjereni kupci. Prodao sam sat unutar tjedan dana." },
  { name: "Ivana Kovač", role: "Kupac, Dubrovnik", text: "Iskustvo dostojno luksuzne robne marke. Verificirani prodavači daju mir." },
];

function Index() {
  return (
    <SiteShell>
      <Hero />
      <CategoryStrip />
      <FeaturedListings />
      <HowItWorks />
      <WhyBiraj />
      <TrustSafety />
      <Testimonials />
      <Newsletter />
    </SiteShell>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Luksuzni dnevni boravak s pogledom na Jadran"
          width={1920}
          height={1280}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-overlay)" }} />
      </div>
      <div className="mx-auto grid min-h-[78vh] max-w-7xl content-end gap-10 px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)]/50 bg-black/25 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--cream)] backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--gold)" }} />
            Hrvatski marketplace provjerenih oglasa
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] text-[color:var(--cream)] md:text-7xl">
            Kupi i prodaj <em className="not-italic" style={{ color: "var(--gold)" }}>s povjerenjem</em>.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[color:var(--cream)]/85 md:text-lg">
            Premium marketplace za provjerene prodavače i kupce. Provjereni oglasi,
            profesionalne fotografije i izravan kontakt — bez naknade za kupce.
          </p>
        </div>

        {/* Airbnb-style pill search */}
        <form
          action="/pretraga"
          method="get"
          className="flex items-stretch gap-0 rounded-full border border-white/30 bg-white/95 p-2 shadow-[var(--shadow-modal)] backdrop-blur md:max-w-4xl"
        >
          <div className="flex flex-1 items-center gap-2 rounded-full px-5 hover:bg-[color:var(--surface-muted)]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Što tražite? npr. apartman u Splitu"
              className="h-11 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="hidden w-px self-stretch bg-border md:block" />
          <div className="hidden flex-1 items-center gap-2 rounded-full px-5 hover:bg-[color:var(--surface-muted)] md:flex">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Input
              name="grad"
              placeholder="Lokacija (npr. Zagreb)"
              className="h-11 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
            />
          </div>
          <Button
            type="submit"
            className="h-12 shrink-0 rounded-full bg-[color:var(--gold-deep)] px-6 text-sm font-semibold text-white shadow-none hover:bg-[color:var(--gold-darker)]"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Pretraži</span>
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-6 text-[color:var(--cream)]/80">
          <Stat n="12.400+" label="Aktivnih oglasa" />
          <span className="h-6 w-px bg-white/20" />
          <Stat n="98%" label="Zadovoljnih kupaca" />
          <span className="hidden h-6 w-px bg-white/20 sm:block" />
          <Stat n="24/7" label="Podrška korisnicima" />
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-semibold" style={{ color: "var(--gold)" }}>{n}</div>
      <div className="text-xs uppercase tracking-widest">{label}</div>
    </div>
  );
}

function CategoryStrip() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-3 gap-2 px-6 py-8 md:grid-cols-6">
        {categories.map(({ icon: Icon, label, slug }) => (
          <Link
            key={slug}
            to="/kategorija/$category"
            params={{ category: slug }}
            className="group flex flex-col items-center gap-3 rounded-2xl p-3 transition hover:bg-[color:var(--surface-muted)]"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-[color:var(--surface-muted)] transition group-hover:bg-white group-hover:shadow-[var(--shadow-raised)]">
              <Icon className="h-5 w-5" style={{ color: "var(--navy)" }} />
            </span>
            <span className="text-xs font-medium tracking-wide text-foreground/80">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-xs font-medium uppercase tracking-[0.3em]" style={{ color: "var(--gold-deep)" }}>{eyebrow}</div>
      <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">{title}</h2>
      {desc && <p className="mt-4 text-base text-muted-foreground">{desc}</p>}
    </div>
  );
}

function FeaturedListings() {
  const { data: featured = [], isLoading } = useQuery({
    queryKey: ["home-featured"],
    queryFn: () => fetchListings({ sort: "popularnost", verifiedOnly: true, limit: 4 }),
    staleTime: 60_000,
  });
  return (
    <section id="listings" className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.3em]" style={{ color: "var(--gold-deep)" }}>Izdvojeni oglasi</div>
          <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Pažljivo odabrano za vas</h2>
        </div>
        <Link to="/browse" className="group inline-flex items-center gap-2 text-sm font-medium text-foreground">
          Pogledaj sve oglase
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-12 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Učitavanje…
        </div>
      ) : featured.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">Trenutno nema izdvojenih oglasa.</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((l) => <ListingCard key={l.id} l={l} />)}
        </div>
      )}
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="bg-[color:var(--navy)] text-[color:var(--cream)]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-medium uppercase tracking-[0.3em]" style={{ color: "var(--gold)" }}>Kako radi</div>
          <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Četiri koraka do sigurne kupnje</h2>
          <p className="mt-4 text-[color:var(--cream)]/75">Sve što trebate za jednostavnu i sigurnu transakciju — u jednoj platformi.</p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="font-display text-5xl font-light" style={{ color: "var(--gold)" }}>{s.n}</div>
              <h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--cream)]/70">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyBiraj() {
  return (
    <section id="why" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeader
        eyebrow="Zašto Biraj.HR"
        title="Marketplace dostojan vašeg vremena"
        desc="Kvaliteta umjesto količine. Svaki oglas, svaki prodavač i svaka transakcija prolazi naše standarde."
      />
      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="group rounded-2xl border border-border bg-card p-7 transition hover:border-[color:var(--gold)] hover:shadow-[var(--shadow-soft)]">
            <span className="grid h-12 w-12 place-items-center rounded-xl" style={{ background: "var(--gradient-gold)" }}>
              <Icon className="h-5 w-5 text-[color:var(--navy-deep)]" />
            </span>
            <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TrustSafety() {
  const points = [
    { icon: ShieldCheck, title: "Verifikacija identiteta", desc: "Svi korisnici prolaze KYC verifikaciju prije objave i kupnje." },
    { icon: Lock, title: "Transparentne cijene", desc: "Naplaćujemo isključivo objavu oglasa — bez provizije na prodaju." },
    { icon: BadgeCheck, title: "Trust score", desc: "Transparentna ocjena povjerenja na svakom profilu." },
  ];
  return (
    <section id="trust" className="bg-[color:var(--cream)]">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.3em]" style={{ color: "var(--gold-deep)" }}>Sigurnost & povjerenje</div>
          <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Vaša sigurnost je naš standard, ne dodatak.</h2>
          <p className="mt-5 text-muted-foreground">
            Biraj.HR ne posreduje u plaćanju ni isporuci — uvjete dogovarate izravno s prodavateljem.
            Naša uloga je verifikacija korisnika, provjera oglasa i sigurno komunikacijsko okruženje.
          </p>
          <div className="mt-8 space-y-4">
            {points.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[color:var(--gold)]/50 bg-background">
                  <Icon className="h-4 w-4" style={{ color: "var(--gold-deep)" }} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="overflow-hidden rounded-3xl shadow-[var(--shadow-luxe)]">
            <img src={listing1} alt="Sigurno trgovanje" loading="lazy" width={800} height={800} className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border bg-background p-5 shadow-[var(--shadow-soft)] sm:block">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full" style={{ background: "var(--gradient-gold)" }}>
                <ShieldCheck className="h-5 w-5 text-[color:var(--navy-deep)]" />
              </span>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Zaštita kupca</div>
                <div className="font-display text-lg font-semibold">100% pokriveno</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeader eyebrow="Iskustva" title="Zajednica koja bira kvalitetu" />
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.name} className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-soft)]">
            <Quote className="h-6 w-6" style={{ color: "var(--gold)" }} />
            <blockquote className="mt-4 text-base leading-relaxed text-foreground/90">"{t.text}"</blockquote>
            <figcaption className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
              <div className="flex" aria-label="5 zvjezdica">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" style={{ color: "var(--gold)" }} />
                ))}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[color:var(--navy-deep)] p-10 text-[color:var(--cream)] md:p-16">
        <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.3em]" style={{ color: "var(--gold)" }}>Newsletter</div>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              Prvi saznajte za nove provjerene oglase.
            </h2>
            <p className="mt-3 text-[color:var(--cream)]/70">
              Tjedna selekcija najboljih oglasa, dostavljena u vaš inbox. Bez spama, samo ono najbolje.
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--cream)]/50" />
              <Input
                type="email"
                required
                placeholder="vasa@adresa.hr"
                className="h-12 rounded-xl border-white/15 bg-white/5 pl-11 text-[color:var(--cream)] placeholder:text-[color:var(--cream)]/40 focus-visible:ring-[color:var(--gold)]"
              />
            </div>
            <Button type="submit" className="h-12 rounded-xl px-6 text-[color:var(--navy-deep)] hover:opacity-90" style={{ background: "var(--gradient-gold)" }}>
              Pretplati se
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

