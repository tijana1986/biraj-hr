import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, Breadcrumbs } from "@/components/site/SiteShell";

export const Route = createFileRoute("/uvjeti")({
  head: () => ({
    meta: [
      { title: "Uvjeti korištenja — Biraj.HR" },
      { name: "description", content: "Uvjeti korištenja Biraj.HR marketplacea — verzija od lipnja 2026." },
      { property: "og:title", content: "Uvjeti korištenja — Biraj.HR" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <Breadcrumbs items={[{ label: "Početna", to: "/" }, { label: "Uvjeti korištenja" }]} />
        <h1 className="mt-4 font-display text-4xl font-semibold">Uvjeti korištenja</h1>
        <p className="mt-2 text-sm text-muted-foreground">Verzija 1.0 · Lipanj 2026.</p>
        <div className="mt-8 space-y-6">
          <Section n="1" title="Opće odredbe">
            Ovi uvjeti uređuju korištenje platforme Biraj.HR. Korištenjem usluga prihvaćate ove uvjete u cijelosti.
          </Section>
          <Section n="2" title="Registracija i račun">
            Za objavu oglasa i kontakt s prodavateljima potrebna je registracija. Obvezujete se davati točne podatke i čuvati pristupne podatke u tajnosti.
          </Section>
          <Section n="3" title="Pravila oglašavanja">
            Oglasi moraju biti istiniti, jasni i u skladu s hrvatskim zakonodavstvom. Zadržavamo pravo uklanjanja oglasa koji ne odgovaraju standardima kvalitete.
          </Section>
          <Section n="4" title="Naknada za objavu">
            Biraj.HR naplaćuje isključivo objavu oglasa prema važećem Cjeniku po kategorijama. Naknadu plaća oglašivač prilikom objave. Biraj.HR ne posreduje u plaćanju između kupca i prodavatelja niti naplaćuje proviziju na prodajnu cijenu.
          </Section>
          <Section n="5" title="Odnos kupca i prodavatelja">
            Kupoprodajni ugovor sklapa se izravno između kupca i prodavatelja. Biraj.HR nije strana u ugovoru, ne jamči za istinitost oglasa ni za ispunjenje obveza ugovornih strana, ali aktivno štiti korisnike kroz verifikaciju, moderiranje sadržaja i sustav prijava.
          </Section>
          <Section n="6" title="Povrat naknade za objavu">
            Naknada za objavu vraća se isključivo ako Biraj.HR odbije oglas zbog neusklađenosti s Pravilima, a oglas nije bio aktivno objavljen. Naknada se ne vraća nakon što je oglas objavljen.
          </Section>
          <Section n="7" title="Izmjene uvjeta">
            Uvjete možemo izmijeniti. O bitnim promjenama obavještavamo korisnike e-poštom najmanje 14 dana unaprijed.
          </Section>
        </div>
      </article>
    </SiteShell>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold">{n}. {title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </section>
  );

