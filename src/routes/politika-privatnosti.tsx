import { createFileRoute } from "@tanstack/react-router";
import { Mail, Building2, Shield, Eye, Lock, FileText, AlertCircle } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/politika-privatnosti")({
  head: () => ({
    meta: [
      { title: "Politika privatnosti — Biraj.HR" },
      { name: "description", content: "Politika privatnosti i zaštite podataka na Biraj.HR u skladu s GDPR-om i hrvatskim zakonodavstvom." },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl space-y-8 px-6 py-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-semibold">Politika privatnosti</h1>
          <p className="text-muted-foreground">Posljednja ažuriranja: 21. srpnja 2026.</p>
        </div>

        {/* Intro */}
        <section className="rounded-lg border border-border/50 bg-background p-6">
          <div className="flex gap-3">
            <Shield className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Važno:</p>
              <p className="text-sm text-muted-foreground">Vaša privatnost je naša prioriteta. Ova politika objašnjava kako prikupljamo, koristimo, čuvamo i štitimo vaše osobne podatke u skladu s Uredbom (EU) 2016/679 (GDPR) i Zakonom o zaštiti podataka Republike Hrvatske.</p>
            </div>
          </div>
        </section>

        {/* 1. Voditelj podataka */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            1. Voditelj podataka
          </h2>
          <div className="space-y-3 rounded-lg border border-border bg-background p-4 text-sm">
            <div>
              <p className="font-medium text-foreground">NEXORA grupa</p>
              <p className="text-muted-foreground">Vlasnica: Tijana Dusper</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Kontakt:</p>
              <div className="flex items-start gap-2 text-sm">
                <Mail className="h-4 w-4 shrink-0 mt-0.5 text-[color:var(--gold-deep)]" />
                <div>
                  <p><span className="font-medium">Email:</span> support@biraj.hr</p>
                  <p><span className="font-medium">Podaci za naplatu:</span> HR1823600001103274166</p>
                  <p><span className="font-medium">Mjesto registracije:</span> Republika Hrvatska</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Koje podatke prikupljamo */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
            <Eye className="h-5 w-5 text-muted-foreground" />
            2. Prikupljanje podataka
          </h2>
          <p className="text-sm text-muted-foreground">Prikupljamo podatke koje nam proslijedite ili koje nastanu korištenjem naše platforme:</p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">2.1. Podaci koje nam direktno proslijedite:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Registracija i profil:</strong> Ime, prezime, e-mail, telefonski broj, mjesto boravka</span></li>
                <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Verifikacija identiteta (KYC):</strong> Tip dokumenta, broj dokumenta, datum rođenja, adresa, mjesto boravka (samo nakon eksplicitnog pristanka)</span></li>
                <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Podaci za izdavanje računa:</strong> OIB, naziv tvrtke, PDV ID, adresa sjedišta, e-mail za račun, IBAN</span></li>
                <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Oglasi i sadržaj:</strong> Nazivi oglasa, opisi, kategorije, slike, cijena, lokacija</span></li>
                <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Plaćanje:</strong> Podaci o kreditnoj kartici (obrada preko Stripe — mi ne čuvamo brojeve kartice)</span></li>
                <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Komunikacija:</strong> Poruke između korisnika, recenzije, ocjene</span></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2.2. Podaci prikupljeni automatski:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Tehnički podaci:</strong> IP adresa, tip preglednika, uređaja, operacijskog sustava</span></li>
                <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Kolačići i slični alati:</strong> Identifikatori sesije, preference, statistika korištenja (vidi Politika kolačića)</span></li>
                <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Analitika:</strong> Podaci o vašoj interakciji s platformom, vremenske oznake aktivnosti</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Pravna osnova */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
            <FileText className="h-5 w-5 text-muted-foreground" />
            3. Pravna osnova za obradu podataka
          </h2>
          <p className="text-sm text-muted-foreground">Obradu podataka temeljimo na sljedećim pravnim osnovama prema GDPR članu 6:</p>

          <div className="space-y-3">
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium text-sm mb-2">Ugovor (Član 6(1)(b) GDPR):</p>
              <p className="text-sm text-muted-foreground">Podaci potrebni za izvršenje ugovora (registracija, oglašavanje, plaćanja, dostava računa).</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium text-sm mb-2">Pravni naziv (Član 6(1)(c) GDPR):</p>
              <p className="text-sm text-muted-foreground">Skladištenje dokaza o transakcijama, izdavanje računa (Zakon o PDV-u, Opći porezni zakon).</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium text-sm mb-2">Legitimni interes (Član 6(1)(f) GDPR):</p>
              <p className="text-sm text-muted-foreground">Sprječavanje prijevare, sigurnost sustava, poboljšanja servisa, analitika.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium text-sm mb-2">Pristanak (Član 6(1)(a) GDPR):</p>
              <p className="text-sm text-muted-foreground">Verifikacija identiteta, dodatni marketing materijali (samo nakon eksplicitnog pristanka).</p>
            </div>
          </div>
        </section>

        {/* 4. Kako koristimo podatke */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
            <Lock className="h-5 w-5 text-muted-foreground" />
            4. Namjena obrade podataka
          </h2>

          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">Pružanje usluga:</p>
              <p className="text-muted-foreground">Registracija, kreiranja profila, objavljivanja oglasa, uređivanja oglednog kataloga.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">Plaćanja i naplata:</p>
              <p className="text-muted-foreground">Obrada plaćanja preko Stripe, izdavanje računa, upravljanje transakcijama.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">Sigurnost i zaštita od prijevare:</p>
              <p className="text-muted-foreground">Detekcija neobičnih aktivnosti, sprječavanje zlouporabe, compliance s regulativom.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">Komunikacija:</p>
              <p className="text-muted-foreground">Odgovori na upite, obavijesti o statusu računa, verifikacijski e-mailovi.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">Poboljšanje servisa:</p>
              <p className="text-muted-foreground">Analiza korištenja, razvoj novih funkcionalnosti, optimizacija korisničkog doživljaja.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">Compliance i zakonski obaveze:</p>
              <p className="text-muted-foreground">Zadovoljavanje zakonskih obveza, sprječavanje pranja novca (AML), KYC verifikacija.</p>
            </div>
          </div>
        </section>

        {/* 5. Dijeljenje podataka */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">5. Dijeljenje podataka s trećim stranama</h2>

          <p className="text-sm text-muted-foreground">Vaše podatke dijelimo samo s:</p>

          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">Stripe (američki procesor plaćanja):</p>
              <p className="text-muted-foreground">Obrada kreditnih kartica i plaćanja. Stripe podaci se obrađuju u skladu s njihovom <a href="https://stripe.com/privacy" className="font-medium text-[color:var(--gold-deep)] hover:underline">politikom privatnosti</a>.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">Resend (usluga e-mailiranja):</p>
              <p className="text-muted-foreground">Slanje verifikacijskih e-mailova, obavijesti o oglasima, potvrde plaćanja.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">Supabase (baza podataka):</p>
              <p className="text-muted-foreground">Hosting i skladištenje podataka. Supabase koristi infrastrukturu s razumnom zaštitom podataka.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">Vercel (hosting platform):</p>
              <p className="text-muted-foreground">Hosting web aplikacije i izvođenje server-side funkcija.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">Vlasti i sudski zahtjevi:</p>
              <p className="text-muted-foreground">Ako je zakonom obavezno, možemo proslijediti podatke nadležnim organima (FINA, MUP, sud, itd.) bez vašeg pristanka.</p>
            </div>
          </div>
        </section>

        {/* 6. Transfer podataka */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">6. Međunarodni transfer podataka</h2>

          <p className="text-sm text-muted-foreground">Neki od naših procesora (Stripe, Vercel) nalaze se u SAD-u. EU je zaključila da SAD ne pruža odgovarajuću razinu zaštite (slično kao pre-Schrems II). Koristi se sljedeće:</p>

          <ul className="space-y-2 text-sm ml-4">
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Standardne ugovorne klauzule (SCC):</strong> Ugovori s procesorima koji sadrže standarde EU-a za zaštitu.</span></li>
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Dodatni tehnički i organizacijski mjere:</strong> Enkripcija, pseudonimizacija.</span></li>
          </ul>

          <div className="mt-3 rounded-lg border border-border/50 bg-background p-4">
            <p className="text-xs text-muted-foreground">Prenošenjem podataka u SAD, znate da tu razinu zaštite prihvaćate. Ako se ne slažete, možete odbiti dostavu određenih podataka, ali onda ne možete koristiti sve funkcionalnosti platforme.</p>
          </div>
        </section>

        {/* 7. Čuvanje podataka */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">7. Razdoblje čuvanja podataka</h2>

          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">Korisnički profil i podaci:</p>
              <p className="text-muted-foreground">Čuvamo dok je račun aktivan. Nakon brisanja računa, izbrisani su u roku od 30 dana osim ako zakonska obveza zahtijeva drugačije.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">Podaci za izdavanje računa i plaćanja:</p>
              <p className="text-muted-foreground">Sukladno Zakonu o PDV-u i Općem poreznom zakonu — najmanje 8 godina.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">Podaci o oglasima:</p>
              <p className="text-muted-foreground">Čuvamo kako bi očuvali integritet platforme. Arhiviraju se nakon 12 mjeseci neaktivnosti.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">Analitički i tehnički podaci:</p>
              <p className="text-muted-foreground">Čuvamo 12 mjeseci, zatim anonimiziramo.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">Podatke o verifikaciji identiteta (KYC/AML):</p>
              <p className="text-muted-foreground">Minimum 5 godina nakon završetka poslovanja s vama (zakonska obveza za sprječavanje pranja novca).</p>
            </div>
          </div>
        </section>

        {/* 8. Vaša prava */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">8. Vaša prava kao osoba čiji se podaci obrađuju</h2>

          <p className="text-sm text-muted-foreground mb-4">U skladu s GDPR-om, imate pravo na:</p>

          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">🔍 Pravo na pristup (Član 15 GDPR):</p>
              <p className="text-muted-foreground">Možete tražiti koje podatke o vama čuvamo i kako ih obrađujemo.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">✏️ Pravo na ispravak (Član 16 GDPR):</p>
              <p className="text-muted-foreground">Ako su vaši podaci netočni ili nepotpuni, možete ih zahtjevati ispraviti.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">🗑️ Pravo na brisanje (Član 17 GDPR):</p>
              <p className="text-muted-foreground">Možete tražiti brisanje podataka, osim ako postoji zakonska obveza čuvanja (npr. računi, KYC).</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">🛑 Pravo na ograničenje obrade (Član 18 GDPR):</p>
              <p className="text-muted-foreground">Možete tražiti ograničenje obrade dok se vaš prigovor razriješi.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">📊 Pravo na prenosivost podataka (Član 20 GDPR):</p>
              <p className="text-muted-foreground">Možete tražiti svoje podatke u strojnom čitljivom formatu (CSV, JSON) kako bi ih prebacili drugdje.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">❌ Pravo na prigovor (Član 21 GDPR):</p>
              <p className="text-muted-foreground">Možete se suprotstaviti obradi podataka koja se temelji na legitimnom interesu.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background p-3">
              <p className="font-medium mb-1">⚖️ Pravo na podnošenje tužbe:</p>
              <p className="text-muted-foreground">Ako smatrate da su vaša prava povrijeđena, možete podnijeti tužbu nadležnom sudu ili Povjereniku za informacijsku sigurnost (AZOP).</p>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-900"><strong>Kako postaviti zahtjev:</strong> Pošaljite e-mail na <strong>support@biraj.hr</strong> s jasnom specifikacijom što tražite. Odgovor dajemo u roku od 30 dana.</p>
          </div>
        </section>

        {/* 9. Sigurnost podataka */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
            <Shield className="h-5 w-5 text-muted-foreground" />
            9. Sigurnost i zaštita podataka
          </h2>

          <p className="text-sm text-muted-foreground">Primjenjujemo sljedeće mjere zaštite:</p>

          <ul className="space-y-2 text-sm ml-4">
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Enkripcija:</strong> Svi podaci se prosleđuju i čuvaju koristeći HTTPS i šifriranje.</span></li>
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Kontrola pristupa:</strong> Samo autorizirani zaposlenici imaju pristup osjetljivim podacima.</span></li>
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Sigurnosne kopije:</strong> Redovito se kreiraju sigurnosne kopije.</span></li>
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Monitoring:</strong> Sustav se kontinuirano prati za neobične aktivnosti.</span></li>
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Procjena rizika:</strong> Redovito provodimo analizu rizika i ažuriramo mjere zaštite.</span></li>
          </ul>

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-900">Premda primjenjujemo sve dostupne mjere zaštite, nijedan sustav nije 100% bezopasan. Ako primijetite neobičnu aktivnost na svom računu, odmah nas kontaktirajte na support@biraj.hr.</p>
            </div>
          </div>
        </section>

        {/* 10. Kolačići i slični alati */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">10. Kolačići i slični alati</h2>

          <p className="text-sm text-muted-foreground">Vidi detaljan opis u našoj <a href="/politika-kolacica" className="font-medium text-[color:var(--gold-deep)] hover:underline">Politici kolačića</a>.</p>

          <p className="text-sm text-muted-foreground">Kraće: Koristimo:</p>
          <ul className="space-y-2 text-sm ml-4">
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Funkcionalni kolačići:</strong> Logiranje, preference, sigurnost sesije (potrebni).</span></li>
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Analitički kolačići:</strong> Razumijevanje kako korisnici koriste platformu (možete odbiti).</span></li>
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Marketinški kolačići:</strong> Preporučivanje sadržaja (možete odbiti).</span></li>
          </ul>
        </section>

        {/* 11. Odgovorna osoba za zaštitu podataka */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">11. Odgovorna osoba za zaštitu podataka (DPO)</h2>

          <div className="rounded-lg border border-border bg-background p-4 text-sm">
            <p className="text-muted-foreground">U skladu s GDPR članak 37, čitavo poduzeće je odgovorna za zaštitu podataka. Kontaktirajte nas na <strong>support@biraj.hr</strong> za sve zahtjeve vezane uz zaštitu podataka.</p>
          </div>
        </section>

        {/* 12. Izmjene politike */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">12. Izmjene ove politike</h2>

          <p className="text-sm text-muted-foreground">Ova politika se može promijeniti bez prethodne najave. Preporučujemo da je redovito provjerite. Ako su izmjene materijalne, obavijestit ćemo vas e-mailom. Nastavkom korištenja platforme nakon izmjena potvrđujete pristanak novoj politici.</p>
        </section>

        {/* 13. Primjena zakona i sudna nadležnost */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">13. Primjena zakona i sudna nadležnost</h2>

          <p className="text-sm text-muted-foreground">Ova politika se regulira zakonima Republike Hrvatske i EU-a (GDPR). Sve sporove rješavamo u skladu s hrvatskim zakonom i Zakonom o informacijske sigurnosti podataka.</p>
        </section>

        {/* Kontakt */}
        <section className="space-y-4 rounded-lg border border-border/50 bg-background p-6 mt-8">
          <h2 className="text-lg font-medium text-foreground">Kontaktirajte nas</h2>
          <p className="text-sm text-muted-foreground">
            Ako imate pitanja ili željete postaviti zahtjev u vezi s vašim podacima:
          </p>
          <div className="text-sm">
            <p><strong>Email:</strong> <a href="mailto:support@biraj.hr" className="text-[color:var(--gold-deep)] hover:underline">support@biraj.hr</a></p>
            <p><strong>Vremenski okvir odgovora:</strong> 30 dana</p>
          </div>
        </section>

        <div className="text-xs text-muted-foreground border-t pt-6">
          <p>Verzija: 1.0 | Ažurirana: 21. srpnja 2026.</p>
        </div>
      </article>
    </SiteShell>
  );
}
