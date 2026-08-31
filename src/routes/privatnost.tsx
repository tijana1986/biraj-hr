import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, Breadcrumbs } from "@/components/site/SiteShell";

export const Route = createFileRoute("/privatnost")({
  head: () => ({
    meta: [
      { title: "Politika privatnosti — Biraj.HR" },
      { name: "description", content: "Kako Biraj.HR prikuplja, koristi i štiti vaše osobne podatke — u skladu s GDPR-om." },
      { property: "og:title", content: "Politika privatnosti — Biraj.HR" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <Breadcrumbs items={[{ label: "Početna", to: "/" }, { label: "Privatnost" }]} />
        <h1 className="mt-4 font-display text-4xl font-semibold">Politika privatnosti</h1>
        <p className="mt-2 text-sm text-muted-foreground">U skladu s Uredbom (EU) 2016/679 (GDPR).</p>
        <div className="mt-8 space-y-6">
          <S t="Koje podatke prikupljamo">
            Ime, e-poštu, broj telefona, lokaciju (grad), podatke o transakcijama te tehničke podatke (uređaj, IP, kolačići).
          </S>
          <S t="Kako koristimo podatke">
            Za pružanje usluga, identifikaciju korisnika, sigurnost transakcija, komunikaciju i poboljšanje platforme.
          </S>
          <S t="Kolačići">
            Koristimo nužne i analitičke kolačiće. Postavke možete promijeniti u svom pregledniku ili kroz banner za privolu.
          </S>
          <S t="Vaša prava">
            Pravo na pristup, ispravak, brisanje, ograničenje obrade, prenosivost podataka i prigovor. Zahtjev možete poslati na privatnost@biraj.com.hr.
          </S>
          <S t="Voditelj obrade">
            Biraj.HR d.o.o., Ilica 1, 10000 Zagreb. Kontakt: privatnost@biraj.com.hr.
          </S>
        </div>
      </article>
    </SiteShell>
  );
}

function S({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold">{t}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </section>
  );


}
