import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, ShieldCheck, Handshake } from "lucide-react";
import { SiteShell, Breadcrumbs } from "@/components/site/SiteShell";
import { CATEGORIES } from "@/lib/mock/data";

export const Route = createFileRoute("/cjenik")({
  head: () => ({
    meta: [
      { title: "Cjenik objave oglasa — Biraj.HR" },
      { name: "description", content: "Transparentan cjenik objave oglasa po kategorijama. Bez provizije na prodaju — naplaćuje se samo objava." },
      { property: "og:title", content: "Cjenik objave oglasa — Biraj.HR" },
      { property: "og:description", content: "Transparentan cjenik objave po kategorijama. Bez provizije na prodajnu cijenu." },
    ],
  }),
  component: Cjenik,
});

function Cjenik() {
  return (
    <SiteShell>
      <section className="border-b border-border bg-[color:var(--cream)]">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <Breadcrumbs items={[{ label: "Početna", to: "/" }, { label: "Cjenik" }]} />
          <span className="mt-4 inline-block text-xs font-medium uppercase tracking-[0.3em]" style={{ color: "var(--gold-deep)" }}>
            Transparentne cijene
          </span>
          <h1 className="mt-2 font-display text-5xl font-semibold md:text-6xl">Cjenik objave oglasa</h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Biraj.HR naplaćuje isključivo objavu oglasa. <strong>Ne uzimamo proviziju na prodajnu cijenu</strong>, ne posredujemo u plaćanju
            i ne naplaćujemo kupcima ništa — pretraga i kontakt s prodavateljima su uvijek besplatni.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <article key={c.slug} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
              <header>
                <h2 className="font-display text-xl font-semibold">{c.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{c.tagline}</p>
              </header>

              {c.specialModel === "services-contact" ? (
                <>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="font-display text-3xl font-semibold" style={{ color: "var(--gold-deep)" }}>Besplatno</span>
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">Objava potražnje posla / usluge</div>
                  <ul className="mt-5 space-y-2 text-sm">
                    <Item>Investitori / naručitelji posla objavljuju <strong>besplatno</strong></Item>
                    <Item>Izvođači (obrti i tvrtke) plaćaju <strong>{formatPriceDecimal(c.contactFee ?? 5)}</strong> za otključavanje kontakta</Item>
                    <Item>Prvi izvođač koji uplati dobiva prioritetnu obavijest „možeš aplicirati prvi"</Item>
                    <Item>Ostali izvođači ne vide informaciju o prioritetu</Item>
                  </ul>
                  <div className="mt-6 rounded-xl border border-dashed border-[color:var(--gold)]/40 bg-[color:var(--gold)]/5 p-3 text-xs">
                    <div className="flex items-center gap-1 font-semibold text-[color:var(--gold-deep)]">
                      <Handshake className="h-3.5 w-3.5" /> Pay-per-contact model
                    </div>
                    <div className="mt-1 text-foreground/80">
                      Naplaćuje se isključivo otključavanje kontakta investitora. Bez mjesečne pretplate i bez provizije na ugovoreni posao.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="font-display text-3xl font-semibold" style={{ color: "var(--navy)" }}>
                      {formatPriceDecimal(c.listingFee)}
                    </span>
                    <span className="text-xs text-muted-foreground">/ 30 dana</span>
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">Standardna objava</div>
                  <ul className="mt-5 space-y-2 text-sm">
                    <Item>Vidljivost u kategoriji i pretrazi 30 dana</Item>
                    <Item>Do 10 fotografija po oglasu</Item>
                    <Item>Razmjena poruka unutar platforme</Item>
                    <Item>{c.subcategories.length} podkategorija dostupno</Item>
                  </ul>
                  <div className="mt-6 rounded-xl border border-dashed border-[color:var(--gold)]/40 bg-[color:var(--gold)]/5 p-3 text-xs">
                    <div className="flex items-center gap-1 font-semibold text-[color:var(--gold-deep)]">
                      <Sparkles className="h-3.5 w-3.5" /> TOP istaknut oglas
                    </div>
                    <div className="mt-1 text-foreground/80">
                      {formatPriceDecimal(c.premiumFee)} za 7 dana — prikaz na vrhu kategorije i u izdvojenim sekcijama.
                    </div>
                  </div>
                </>
              )}

              <Link
                to="/kategorija/$category"
                params={{ category: c.slug }}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-border text-sm font-semibold hover:border-[color:var(--gold)] hover:bg-secondary"
              >
                Pogledaj kategoriju
              </Link>
            </article>
          ))}
        </div>

        <section className="mt-16 rounded-2xl border border-border bg-card p-8">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[color:var(--gold-deep)]" />
            <div className="space-y-3 text-sm text-foreground/85">
              <p>
                <strong>Bez provizije na prodaju.</strong> Naplaćujemo isključivo objavu oglasa prema cjeniku iznad. Kada se kupac i prodavatelj dogovore, transakcija ide
                izravno između njih — Biraj.HR ne uzima postotak od prodajne cijene.
              </p>
              <p>
                <strong>Bez skrivenih troškova.</strong> Cijena navedena uz kategoriju je konačna cijena objave za 30 dana. PDV je uključen.
              </p>
              <p>
                <strong>Načini plaćanja.</strong> Karticom (Visa, Mastercard, Maestro) ili općom uplatnicom / IBAN-om prilikom kreiranja oglasa.
              </p>
              <p className="text-xs text-muted-foreground">
                Cijene mogu biti predmet promjene. Aktualan cjenik uvijek je dostupan na ovoj stranici. Za poslovne korisnike i agencije nudimo paketne tarife — kontaktirajte nas putem
                <Link to="/kontakt" className="ml-1 font-medium text-[color:var(--gold-deep)]">kontakt forme</Link>.
              </p>
            </div>
          </div>
        </section>
      </section>
    </SiteShell>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gold-deep)]" />
      <span className="text-foreground/85">{children}</span>
    </li>
  );
}

function formatPriceDecimal(n: number) {
  return new Intl.NumberFormat("hr-HR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
</content>
