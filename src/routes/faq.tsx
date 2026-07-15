import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, Breadcrumbs } from "@/components/site/SiteShell";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Česta pitanja — Biraj.HR" },
      { name: "description", content: "Odgovori na najčešća pitanja o korištenju Biraj.HR marketplacea." },
      { property: "og:title", content: "Česta pitanja — Biraj.HR" },
    ],
  }),
  component: FAQ,
});

const SECTIONS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Kupovanje",
    items: [
      { q: "Kako kontaktiram prodavatelja?", a: "Otvorite oglas i kliknite 'Kontaktiraj prodavatelja'. Razgovor ostaje unutar platforme radi vaše sigurnosti." },
      { q: "Mogu li pregledati artikl uživo?", a: "Da. Termin dogovorite kroz poruke; preporučujemo pregled prije bilo kakve uplate." },
      { q: "Naplaćujete li nešto kupcima?", a: "Ne. Pretraga oglasa, kontakt s prodavateljima i poruke su za kupce uvijek besplatni." },
      { q: "Što ako artikl ne odgovara opisu?", a: "Biraj.HR ne posreduje u kupoprodaji — uvjete dogovarate izravno s prodavateljem. Sumnjive oglase ili korisnike prijavite našoj podršci." },
    ],
  },
  {
    title: "Prodaja i objava oglasa",
    items: [
      { q: "Kako objavim oglas?", a: "Prijavite se i kliknite 'Objavi oglas'. Vodimo vas kroz 5 koraka — od kategorije do pregleda." },
      { q: "Koliko košta objava?", a: "Cijena ovisi o kategoriji i kreće se od besplatne (npr. dječji svijet) do 9,99 € za 30 dana (nekretnine). Cijeli cjenik dostupan je na stranici Cjenik." },
      { q: "Kako se naplaćuje objava?", a: "Naknadu plaćate Biraj.HR-u prilikom kreiranja oglasa, karticom ili IBAN-om. Biraj.HR ne uzima proviziju na prodajnu cijenu." },
      { q: "Što je 'Top' pozicioniranje?", a: "Premium istaknuti oglas pojavljuje se na vrhu kategorije i u izdvojenim sekcijama 7 dana. Cijena ovisi o kategoriji (od 2,99 € do 14,99 €)." },
      { q: "Koliko traje provjera oglasa?", a: "U pravilu do 24 sata. O statusu vas obavještavamo e-poštom." },
    ],
  },
  {
    title: "Sigurnost i povjerenje",
    items: [
      { q: "Kako provjeravate korisnike?", a: "Tražimo verifikaciju identiteta (KYC), potvrđenu e-poštu i broj telefona. Pravne osobe verificiramo dodatno putem OIB-a." },
      { q: "Posredujete li u plaćanju?", a: "Ne. Biraj.HR je platforma za objavu oglasa — kupac i prodavatelj dogovaraju plaćanje i preuzimanje izravno. Preporučujemo pregled uživo prije bilo kakve uplate." },
      { q: "Što je trust score?", a: "Ocjena pouzdanosti korisnika izračunata iz povijesti objava, ocjena drugih korisnika i razine verifikacije." },
      { q: "Kako prijaviti sumnjivi oglas?", a: "Na svakom oglasu nalazi se gumb 'Prijavi'. Naš tim provjerava prijave unutar 24 sata." },
    ],
  },
];

function FAQ() {
  return (
    <SiteShell>
      <section className="border-b border-border bg-[color:var(--cream)]">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <Breadcrumbs items={[{ label: "Početna", to: "/" }, { label: "Česta pitanja" }]} />
          <h1 className="mt-4 font-display text-5xl font-semibold">Česta pitanja</h1>
          <p className="mt-3 text-muted-foreground">Odgovori na najčešća pitanja o korištenju Biraj.HR-a.</p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-6 py-16">
        {SECTIONS.map((sec) => (
          <div key={sec.title} className="mb-10">
            <h2 className="font-display text-2xl font-semibold">{sec.title}</h2>
            <Accordion type="single" collapsible className="mt-3">
              {sec.items.map((it, i) => (
                <AccordionItem key={i} value={`${sec.title}-${i}`}>
                  <AccordionTrigger className="text-left text-base font-medium">{it.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{it.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </section>
    </SiteShell>
  );
}</content>
