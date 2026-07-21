import { createFileRoute } from "@tanstack/react-router";
import { FileText, AlertCircle, CheckCircle2, XCircle, Gavel } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/uvjeti-koristenja")({
  head: () => ({
    meta: [
      { title: "Uvjeti korištenja — Biraj.HR" },
      { name: "description", content: "Uvjeti korištenja i pravila za korisnike platforme Biraj.HR." },
    ],
  }),
  component: TermsOfService,
});

function TermsOfService() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl space-y-8 px-6 py-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-semibold">Uvjeti korištenja</h1>
          <p className="text-muted-foreground">Posljednja ažuriranja: 21. srpnja 2026.</p>
        </div>

        {/* Intro */}
        <section className="rounded-xl border border-border/50 bg-background p-6">
          <div className="flex gap-3">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Molimo pročitajte pažljivo.</p>
              <p className="text-sm text-muted-foreground">Korištenjem platforme Biraj.HR ("Platforma") prihvaćate sve uvjete. Ako se ne slažete s bilo kojim dijelom, molimo vas da ne koristite Platformu. Ovi uvjeti su pravno obvezujući i regulirani hrvatskim zakonom.</p>
            </div>
          </div>
        </section>

        {/* 1. Definicije */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">1. Definicije</h2>
          <div className="space-y-3 text-sm">
            <div><strong>"Platforma"</strong> — Web aplikacija dostupna na https://biraj.hr</div>
            <div><strong>"Vlasnica"</strong> — NEXORA grupa, vl. Tijana Dusper</div>
            <div><strong>"Korisnik"</strong> — Bilo koja osoba koja koristi Platformu (Kupac, Prodavač, Preglednik)</div>
            <div><strong>"Prodavač"</strong> — Korisnik koji objavljuje oglase i nudi proizvode/usluge</div>
            <div><strong>"Kupac"</strong> — Korisnik koji traži ili kupuje proizvode/usluge</div>
            <div><strong>"Oglas"</strong> — Objava proizvoda ili usluge na Platformi</div>
            <div><strong>"Transakcija"</strong> — Kupnja/prodaja preko Platforme</div>
          </div>
        </section>

        {/* 2. Pregled servisa */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">2. Pregled servisa</h2>
          <p className="text-sm text-muted-foreground">Biraj.HR je <strong>tržnica koja povezuje kupce i prodavače</strong>. Nismo prodavač — vi kupujete od drugih korisnika koji su registrirani na Platformi. Vlasnica nije dio svake transakcije i ne može se smatrati nudiocem proizvoda.</p>
        </section>

        {/* 3. Registracija i račun */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">3. Registracija i račun</h2>

          <h3 className="text-base font-medium text-foreground mt-4">3.1. Uvjeti registracije:</h3>
          <ul className="space-y-2 text-sm ml-4">
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Morate biti <strong>najmanje 18 godina</strong> (ili starost punoletnosti u vašoj državi)</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Morate koristiti <strong>stvarna imena i točne podatke</strong></span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Morate biti <strong>pravno sposobni</strong> sklapati ugovore</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Morate <strong>potvrditi e-mail</strong> prije pristupa svim funkcionalnostima</span></li>
          </ul>

          <h3 className="text-base font-medium text-foreground mt-4">3.2. Pristup i odgovornost:</h3>
          <p className="text-sm text-muted-foreground">Odgovorni ste za sve aktivnosti na vašem računu. Zabranjeno je:</p>
          <ul className="space-y-2 text-sm ml-4">
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Dijeliti pristupne podatke s drugima</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Kreirati više računa kako bi obišli ograničenja</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Koristiti lažna imena ili lažne podatke</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Dozvoliti drugima da koriste vaš račun</span></li>
          </ul>

          <h3 className="text-base font-medium text-foreground mt-4">3.3. Suspenzija računa:</h3>
          <p className="text-sm text-muted-foreground">Možemo suspenziju ili trajno brisanje računa ako ste kršili ove uvjete ili zakon, ili ako postoje dokazi o prijevari.</p>
        </section>

        {/* 4. Oglašavanje i sadržaj */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">4. Oglašavanje i sadržaj</h2>

          <h3 className="text-base font-medium text-foreground mt-4">4.1. Dozvoljeni sadržaj:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2 items-start">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Proizvodi i usluge koje su zakonite u Hrvatskoj</span>
            </div>
            <div className="flex gap-2 items-start">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Točni opisi bez varanja ili skrivanja informacija</span>
            </div>
            <div className="flex gap-2 items-start">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Slike proizvoda koje su relevantne i jasne</span>
            </div>
            <div className="flex gap-2 items-start">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Legalno vlasništvo ili pravo prodaje proizvoda</span>
            </div>
          </div>

          <h3 className="text-base font-medium text-foreground mt-4">4.2. Zabranjen sadržaj:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2 items-start">
              <XCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span><strong>Ilegalne proizvode:</strong> Droga, oružje bez dozvole, eksplozivi, krađeni predmeti</span>
            </div>
            <div className="flex gap-2 items-start">
              <XCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span><strong>Seksualnu eksploataciju:</strong> Nasilje, pornografski sadržaj, seksualna zloupotrebljavanje</span>
            </div>
            <div className="flex gap-2 items-start">
              <XCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span><strong>Nasilje i zloupotrebu:</strong> Sadržaj koji ohrabruje nasilje ili zloupotrebu</span>
            </div>
            <div className="flex gap-2 items-start">
              <XCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span><strong>Diskriminaciju:</strong> Sadržaj koji diskriminira na osnovu rase, religije, spola, itd.</span>
            </div>
            <div className="flex gap-2 items-start">
              <XCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span><strong>Falsifikate:</strong> Namjerno ponudene proizvode kao originalne (Zakon o zaštiti potrošača)</span>
            </div>
            <div className="flex gap-2 items-start">
              <XCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span><strong>Spam i prijevare:</strong> Piramidalne sheme, Ponzi sistemi, nevaljane loto i klađenje</span>
            </div>
            <div className="flex gap-2 items-start">
              <XCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span><strong>Zlonamjerni kod:</strong> Linkovi ili datoteke koje sadržavaju štetni kod, malvere ili viruse</span>
            </div>
            <div className="flex gap-2 items-start">
              <XCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span><strong>Intelektualno vlasništvo:</strong> Sadržaj koji krši autorska prava ili prava na znakove</span>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border/50 bg-background p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Sankcije:</span> Objave koje krše ova pravila biti će izbrisane. Ponavljajući prekršaji dovode do suspenzije ili brisanja računa. Ozbiljni prekršaji (korupcija, pranje novca) prijavljuju se nadležnim organima (MUP, FINA).</p>
            </div>
          </div>
        </section>

        {/* 5. Ugovor između kupca i prodavača */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">5. Ugovor između kupca i prodavača</h2>

          <h3 className="text-base font-medium text-foreground mt-4">5.1. Naša uloga:</h3>
          <p className="text-sm text-muted-foreground">Biraj.HR je <strong>samo platformu</strong> — ne sklapamo ugovore s kupcima ili prodavačima. Direktni ugovor je između vas i druge strane. Odgovorna osoba je <strong>strana koja je objavila oglas</strong> (prodavač).</p>

          <h3 className="text-base font-medium text-foreground mt-4">5.2. Garantira i odgovornost:</h3>
          <ul className="space-y-2 text-sm ml-4">
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span><strong>Prodavač garantira:</strong> Ima pravo prodati proizvod, opis je točan, proizvod je u navedenom stanju</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span><strong>Kupac garantira:</strong> Ima namjeru kupiti, može platiti, nije minor</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span><strong>Biraj.HR nije odgovoran:</strong> Za kvalitetu proizvoda, isporuku, sigurnost, bilo što drugo vezano uz transakciju</span></li>
          </ul>

          <h3 className="text-base font-medium text-foreground mt-4">5.3. Plaćanje:</h3>
          <p className="text-sm text-muted-foreground">Plaćanja se obrađuju preko <strong>Stripe</strong>. Vaši podaci kreditne kartice nikad nisu dostupni Platformi — enkripcija je end-to-end. Stripe je odgovoran za sigurnost plaćanja prema <a href="https://stripe.com/en-hr" className="text-[color:var(--gold-deep)] hover:underline font-medium">Stripe Terms</a>.</p>

          <h3 className="text-base font-medium text-foreground mt-4">5.4. Otkazivanja i refundacije:</h3>
          <p className="text-sm text-muted-foreground">Prema Zakonu o zaštiti potrošača, kupci imaju <strong>14 dana za otkaz</strong> nakon primitka proizvoda. Prodavač mora brinuti o povratima i refundacijama. Biraj.HR <strong>nije dio tog procesa</strong> osim kao posrednik koji prosljeđuje informacije.</p>
        </section>

        {/* 6. Naknada i naknade */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">6. Naknada i naknade</h2>

          <h3 className="text-base font-medium text-foreground mt-4">6.1. Naknada za objavu:</h3>
          <ul className="space-y-2 text-sm ml-4">
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span><strong>Standardna oglas:</strong> 9,99 EUR za 30 dana</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span><strong>Premijumska oglas:</strong> 19,99 EUR za 30 dana (viši prioritet, highlights)</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span><strong>Besplatna objava:</strong> Uvijek dostupna — bez naknada za osnovne oglas</span></li>
          </ul>

          <h3 className="text-base font-medium text-foreground mt-4">6.2. Povrat naknade:</h3>
          <p className="text-sm text-muted-foreground">Nema povrata nakon što je oglas objavljena. Ako postoji tehnička greška, kontaktirajte nas na support@biraj.hr.</p>

          <h3 className="text-base font-medium text-foreground mt-4">6.3. Provizije:</h3>
          <p className="text-sm text-muted-foreground">Biraj.HR <strong>ne uzima proviziju</strong> od prodaje između kupca i prodavača. Jedina naknada je za premijumski sadržaj.</p>
        </section>

        {/* 7. Ponašanje korisnika */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">7. Pravila ponašanja korisnika</h2>

          <h3 className="text-base font-medium text-foreground mt-4">7.1. Zabranjeno:</h3>
          <ul className="space-y-2 text-sm ml-4">
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Napadati ili vrijeđati druge korisnike (fizički, seksualni, verbalni napadi)</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Objavljivati osjetljive osobne podatke drugih osoba bez pristanka</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Koristiti Platformu za pranje novca ili AML aktivnosti</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Pokušati hakirati ili napad na Platformu</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Botovi koji automatski kreiraju oglase bez autentičnosti</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Preusmjeravanje korisnika izvan Platforme kako bi izbjegavanje provizija ili bezbjednosti</span></li>
          </ul>

          <h3 className="text-base font-medium text-foreground mt-4">7.2. Izvještavanje:</h3>
          <p className="text-sm text-muted-foreground">Ako primijetite narušavanje ovih pravila, molimo vas da prijavite to e-mailom na <strong>support@biraj.hr</strong> s detaljima. Razmatramo svaku prijavu.</p>
        </section>

        {/* 8. Intelektualno vlasništvo */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">8. Intelektualno vlasništvo</h2>

          <h3 className="text-base font-medium text-foreground mt-4">8.1. Vlasništvo Platforme:</h3>
          <p className="text-sm text-muted-foreground">Svi sadržaj koji je svojstvo Biraj.HR-a (logo, dizajn, kod, tekst) zaštićen je zakonom o autorskim pravima. <strong>Nije dozvoljeno kopirati, distribuirati ili koristiti bez dozvole.</strong></p>

          <h3 className="text-base font-medium text-foreground mt-4">8.2. Vaš sadržaj (oglasi, recenzije, poruke):</h3>
          <p className="text-sm text-muted-foreground">Zadržavate vlasništvo nad sadržajem koji objavite. Davanjem dozvole Platformi da koristi sadržaj u:</p>
          <ul className="space-y-2 text-sm ml-4">
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Prikazu na web stranici i mobilnoj aplikaciji</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Arhiviranje i sigurnosne kopije</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Poboljšanja i analiza (bez korištenja kao promocije bez dozvole)</span></li>
          </ul>

          <h3 className="text-base font-medium text-foreground mt-4">8.3. DMCA i avtorska prava:</h3>
          <p className="text-sm text-muted-foreground">Ako smatrate da je vaša autorska prava narušena, pošaljite pisanu prijavu s dokazima na support@biraj.hr. Postupit ćemo prema zakonu.</p>
        </section>

        {/* 9. Odgovornost i ograničenja */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
            <Gavel className="h-5 w-5 text-muted-foreground" />
            9. Ograničenja odgovornosti
          </h2>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900"><strong>Važno disklaimer:</strong> Platforma se nudi "kakva jeste" bez garantija. Biraj.HR <strong>nije odgovoran za:</strong></p>
          </div>

          <ul className="space-y-2 text-sm ml-4">
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Kvalitete ili sigurnosti proizvoda od drugih korisnika</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Neispunje isporuke ili nečasne prodavače</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Gubitak ili oštećenje podataka zbog greške s naše strane</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Prekidi u servisu, tehnički problemi ili downtime</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Indirektne gubitke ili štete (izgubljeni prihodi, reputacijske štete, itd.)</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Treće osobe koje koriste vaš račun bez dozvole</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span>Logiranje između korisnika ili sporove privatni između njih</span></li>
          </ul>

          <h3 className="text-base font-medium text-foreground mt-4">9.1. Ograničenja odgovornosti:</h3>
          <p className="text-sm text-muted-foreground">Biraj.HR nije odgovorna za indirektne gubitke ili štete koji nastanu korištenjem Platforme, čak i ako smo upozoreni na mogućnost takve štete. Međutim, ova ograničenja se ne primjenjuju u slučajevima gdje je zakonom predviđena neograničena odgovornost.</p>
        </section>

        {/* 10. Rješavanje sporova */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">10. Rješavanje sporova</h2>

          <h3 className="text-base font-medium text-foreground mt-4">10.1. Mediacija:</h3>
          <p className="text-sm text-muted-foreground">Ako imate spor s drugom osobom na Platformi, molimo pokušajte riješiti direktnom komunikacijom. Ako to ne uspije, kontaktirajte nas na support@biraj.hr s detaljima.</p>

          <h3 className="text-base font-medium text-foreground mt-4">10.2. Arbitraža ili sud:</h3>
          <p className="text-sm text-muted-foreground">Ako je spor između vas i Biraj.HR-a, pristanjete na <strong>rješavanje arbitražom</strong> prema pravilima Hrvatske arbitraže. Ako neki spor ne može biti rješen arbitražom, primjenjuje se redovni sudski postupak pred <strong>Trgovačkim sudom u Zagrebu</strong>.</p>

          <h3 className="text-base font-medium text-foreground mt-4">10.3. Odricanje od grupne tužbe:</h3>
          <p className="text-sm text-muted-foreground">Pristanite da se sporovi rješavaju <strong>individualno</strong>, ne kao grupne tužbe (class action). Arbitraža se rješava između vas i Biraj.HR-a kao zasebne strane.</p>
        </section>

        {/* 11. Primjena zakona */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">11. Primjena zakona i nadležnosti</h2>

          <p className="text-sm text-muted-foreground">Ovi uvjeti se reguliraju <strong>zakonima Republike Hrvatske</strong> i <strong>EU zakonodavstvom</strong>:</p>

          <ul className="space-y-2 text-sm ml-4">
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span><strong>Zakon o zaštiti potrošača:</strong> Rješavanje sporova, povrat sredstava i prava potrošača</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span><strong>Zakon o elektroničkoj trgovini:</strong> Međunarodna prodaja</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span><strong>Zakon o plaćanjima:</strong> PSD2 compliance za transakcije</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span><strong>Zakon o sprječavanju pranja novca:</strong> AML/KYC proceduri</span></li>
            <li className="flex gap-2"><span className="text-muted-foreground">•</span><span><strong>Zakon o informacijske sigurnosti:</strong> Zaštita podataka</span></li>
          </ul>

          <p className="text-sm text-muted-foreground mt-4"><strong>Sudska nadležnost:</strong> Svi sporovi rješavati će se pred <strong>Trgovačkim sudom u Zagrebu</strong>.</p>
        </section>

        {/* 12. Izmjene i ažuriranja */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">12. Izmjene ovih uvjeta</h2>

          <p className="text-sm text-muted-foreground">Biraj.HR se može promijeniti ili ažurirati bez prethodne najave. Preporučujemo redovitog pregledavanja. Ako su izmjene materijalne (npr. nove naknadi), obavijestit ćemo vas e-mailom ili obavijestima na Platformi.</p>

          <p className="text-sm text-muted-foreground mt-3"><strong>Nastavak korištenja nakon izmjena znači pristanak novim uvjetima.</strong></p>
        </section>

        {/* 13. Kontakt */}
        <section className="space-y-4 rounded-lg border border-border/50 bg-background p-6 mt-8">
          <h2 className="text-lg font-medium text-foreground">Pitanja ili žalbe?</h2>
          <div className="text-sm space-y-2">
            <p className="text-muted-foreground"><span className="font-medium text-foreground">Email:</span> <a href="mailto:support@biraj.hr" className="text-foreground hover:underline font-medium">support@biraj.hr</a></p>
            <p className="text-muted-foreground"><span className="font-medium text-foreground">Odgovori u roku:</span> 7 radnih dana</p>
            <p className="text-muted-foreground mt-3">Za žalbe o zaštiti potrošača kontaktirajte Ministarstvo gospodarstva, poduzetništva i obrta.</p>
          </div>
        </section>

        <div className="text-xs text-muted-foreground border-t pt-6">
          <p>Verzija: 1.0 | Ažurirana: 21. srpnja 2026. | Primjena zakona: Republika Hrvatska</p>
        </div>
      </article>
    </SiteShell>
  );
}
