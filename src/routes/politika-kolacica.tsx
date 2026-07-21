import { createFileRoute } from "@tanstack/react-router";
import { Cookie, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/politika-kolacica")({
  head: () => ({
    meta: [
      { title: "Politika kolačića — Biraj.HR" },
      { name: "description", content: "Politika korištenja kolačića i sličnih tehnologija na Biraj.HR." },
    ],
  }),
  component: CookiePolicy,
});

function CookiePolicy() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl space-y-8 px-6 py-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-semibold">Politika kolačića</h1>
          <p className="text-muted-foreground">Posljednja ažuriranja: 21. srpnja 2026.</p>
        </div>

        {/* Intro */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex gap-3">
            <Cookie className="h-5 w-5 shrink-0 text-[color:var(--gold-deep)]" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">Što su kolačići?</p>
              <p>Kolačići su male datoteke koje se pohranjuju na vašem uređaju. Pomažu nam da vas prepoznamo, omogućavaju vam da ostanete prijavljeni i poboljšavaju vašu iskustvo. Ova politika objašnjava sve kolačiće koje koristimo.</p>
            </div>
          </div>
        </section>

        {/* 1. Vrste kolačića */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">1. Vrste kolačića koje koristimo</h2>

          <div className="space-y-4">
            {/* Strogo potrebni */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex gap-3 mb-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">1.1. Strogo potrebni kolačići (obvezni)</h3>
                  <p className="text-xs text-green-800 mt-1">MOGU se koristiti bez vašeg pristanka — potrebni su za sigurnost i funkcionalnost.</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Primjeri:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>session_id:</strong> Identifikator sesije — čini vas prijavljenim</li>
                    <li>• <strong>auth_token:</strong> Token autentifikacije — provjera vašeg identiteta</li>
                    <li>• <strong>csrf_token:</strong> Zaštita od Cross-Site Request Forgery — sigurnost forme</li>
                    <li>• <strong>preferences:</strong> Vaš odabrani jezik, tema (tamna/svijetla)</li>
                  </ul>
                </div>
                <p className="text-xs text-green-800 font-medium">✓ Ne trebate dati pristanak za ove kolačiće — oni su essencijalni.</p>
              </div>
            </div>

            {/* Funkcionalni */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex gap-3 mb-3">
                <Cookie className="h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">1.2. Funkcionalni kolačići (opcionalni)</h3>
                  <p className="text-xs text-blue-800 mt-1">TREBATE dati pristanak — poboljšavaju iskustvo.</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Primjeri:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>recently_viewed:</strong> Zapamti nedavno pregledane oglase</li>
                    <li>• <strong>search_filters:</strong> Spremi vašo zadnje pretrage i filtere</li>
                    <li>• <strong>cart_items:</strong> Kolečka s oglasima koji vas zanimaju</li>
                    <li>• <strong>notification_settings:</strong> Vaše preference za obavijesti</li>
                  </ul>
                </div>
                <p className="text-xs text-blue-800 font-medium">⚙️ Možete odbiti ove kolačiće — Platforma će i dalje raditi, ali s manje mogućnosti.</p>
              </div>
            </div>

            {/* Analitički */}
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <div className="flex gap-3 mb-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-purple-900">1.3. Analitički kolačići (opcionalni)</h3>
                  <p className="text-xs text-purple-800 mt-1">TREBATE dati pristanak — pomažu nam razumjeti kako koristite Platformu.</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Što prate:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Koji dijelovi Platforme su najkorišteniji</li>
                    <li>• Gdje korisnici dolaze s interneta (referrer)</li>
                    <li>• Kako dugo ostanete na stranici</li>
                    <li>• Koji linkovi su najčešće klikati</li>
                    <li>• Greške i crash-evi u aplikaciji (debugging)</li>
                  </ul>
                </div>
                <div className="mt-2">
                  <p className="font-medium text-sm">Alati:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground text-xs">
                    <li>• <strong>Google Analytics 4:</strong> Opća analitika korištenja</li>
                    <li>• <strong>Sentry:</strong> Praćenje grešaka i performansi</li>
                  </ul>
                </div>
                <p className="text-xs text-purple-800 font-medium">📊 Možete odbiti — to ne utječe na sigurnost, ali nam pomaže da poboljšamo servis.</p>
              </div>
            </div>

            {/* Marketinški */}
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <div className="flex gap-3 mb-3">
                <XCircle className="h-5 w-5 shrink-0 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-900">1.4. Marketinški kolačići (opcionalni)</h3>
                  <p className="text-xs text-orange-800 mt-1">TREBATE dati pristanak — koriste se za personalizirane oglase.</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Što rade:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Praćenje vašeg ponašanja — koji oglasi vas zanimaju</li>
                    <li>• Kreiranje profila za ciljani marketing</li>
                    <li>• Oglasi koji su relevantni vama (retargeting)</li>
                    <li>• A/B testiranje novih značajki i poruka</li>
                  </ul>
                </div>
                <div className="mt-2">
                  <p className="font-medium text-sm">Alati:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground text-xs">
                    <li>• <strong>Facebook Pixel:</strong> Praćenje za Facebook oglase</li>
                    <li>• <strong>Google Ads:</strong> Praćenje za Google oglase</li>
                  </ul>
                </div>
                <p className="text-xs text-orange-800 font-medium">🎯 Možete odbiti — još uvijek ćete vidjeti oglase, ali neće biti personalizirani.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Kolačići od trećih strana */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">2. Kolačići od trećih strana</h2>

          <p className="text-sm text-muted-foreground">Neki od naših partnera mogu postaviti svoje kolačiće:</p>

          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="font-medium mb-1">Google (Analytics, Ads, reCAPTCHA):</p>
              <p className="text-muted-foreground">Analiza korištenja, oglašavanje, zaštita od botova. <a href="https://policies.google.com/privacy" className="text-[color:var(--gold-deep)] hover:underline font-medium">Google Privacy Policy</a></p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="font-medium mb-1">Stripe (plaćanja):</p>
              <p className="text-muted-foreground">Sigurnost plaćanja i sprječavanje prevare. <a href="https://stripe.com/privacy" className="text-[color:var(--gold-deep)] hover:underline font-medium">Stripe Privacy</a></p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="font-medium mb-1">Facebook Meta (Pixel):</p>
              <p className="text-muted-foreground">Analitika i retargeting za Facebook oglase. <a href="https://www.facebook.com/privacy/explanation" className="text-[color:var(--gold-deep)] hover:underline font-medium">Meta Privacy</a></p>
            </div>
          </div>
        </section>

        {/* 3. Kako upravljati kolačićima */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">3. Kako upravljati kolačićima</h2>

          <h3 className="font-semibold mt-4">3.1. Na našoj Platformi:</h3>
          <p className="text-sm text-muted-foreground">Možete upravljati pristankom za kolačiće preko:</p>
          <ul className="space-y-2 text-sm ml-4">
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Postavke računa:</strong> Račun → Sigurnost → Kolačići i praćenje</span></li>
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Banner pri posjeti:</strong> Prikazan je banner — odaberite "Prihvati sve", "Odbij sve" ili "Prilagođene postavke"</span></li>
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Kontaktirajte nas:</strong> Pošaljite e-mail na support@biraj.hr kako bi povukli pristanak</span></li>
          </ul>

          <h3 className="font-semibold mt-4">3.2. U vašem web pregledniku:</h3>
          <p className="text-sm text-muted-foreground">Većina preglednika omogućava upravljanje kolačićima:</p>
          <ul className="space-y-2 text-sm ml-4">
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Chrome:</strong> Postavke → Sigurnost i privatnost → Kolačići i ostali podaci stranice</span></li>
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Firefox:</strong> Opcije → Privatnost → Kolačići i web lokacija</span></li>
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Safari:</strong> Preferences → Privatnost → Upravljaj podacima</span></li>
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Edge:</strong> Postavke → Privatnost → Kolačići i druge web lokacije</span></li>
          </ul>

          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs text-amber-900"><strong>Napomena:</strong> Ako odbijete strogo potrebne kolačiće, možda nećete moći koristiti sve funkcionalnosti (logiranje, sigurnost).</p>
          </div>
        </section>

        {/* 4. Slični alati */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">4. Slični alati poput kolačića</h2>

          <p className="text-sm text-muted-foreground">Osim kolačića, koristimo i druge tehnologije za slične svrhe:</p>

          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="font-medium mb-1">LocalStorage i SessionStorage:</p>
              <p className="text-muted-foreground">Web stranica čuva podatke na vašem uređaju. Često se koristi za preferencije, a ne može biti pristupačna drugima domenama.</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="font-medium mb-1">Web Beacons (pikseli):</p>
              <p className="text-muted-foreground">Male slike koje vam omogućavaju da potvrdimo je li poruka dostignula (npr. u e-mailima).</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="font-medium mb-1">Fingerprinting:</p>
              <p className="text-muted-foreground">Identifikacija vašeg uređaja prema kombinaciji podataka (OS, browser, rezolucija). Koristimo za sigurnost i prijevare.</p>
            </div>
          </div>
        </section>

        {/* 5. Kolačići i zakoni */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">5. Kolačići i zakoni</h2>

          <p className="text-sm text-muted-foreground">Naša uporaba kolačića sukladno je s:</p>

          <ul className="space-y-2 text-sm ml-4">
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>GDPR (Općoj uredbi o zaštiti podataka):</strong> Trebamo pristanak za većinu kolačića prije postavljanja (osim strogo potrebnih)</span></li>
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>ePrivacy Direktiva (2002/58/EZ):</strong> Zahtijeva pristanak prije postavljanja kolačića — čak i za analitiku</span></li>
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Zakona o zaštiti podataka HR:</strong> Implementira GDPR u hrvatskom zakonodavstvu</span></li>
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Zakon o elektroničkoj trgovini:</strong> Obaveze za web stranice u pogledu privhačanja i transparentnosti</span></li>
          </ul>

          <p className="text-sm text-muted-foreground mt-4"><strong>Naš pristanak:</strong> Prikazujemo banner pri prvoj posjeti koji korisniku omogućava da odabere koji kolačiće želi. Bez eksplicitnog pristanka, postavljamo samo strogo potrebne kolačiće.</p>
        </section>

        {/* 6. Kolačići i sigurnost */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">6. Sigurnost kolačića</h2>

          <p className="text-sm text-muted-foreground">Kolačići su zaštićeni:</p>

          <ul className="space-y-2 text-sm ml-4">
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>HttpOnly flag:</strong> Kolačići nisu dostupni JavaScript-u (zaštita od XSS napada)</span></li>
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Secure flag:</strong> Kolačići se šalju samo preko HTTPS (zaštita od presretanja)</span></li>
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>SameSite atribut:</strong> Sprječava CSRF napade — kolačići se ne šalju s cross-site zahtjevima</span></li>
            <li className="flex gap-2"><span className="text-[color:var(--gold-deep)]">•</span><span><strong>Kratko vrijeme valjanja:</strong> Većina kolačića ističe u roku od 30 dana (osim sesija)</span></li>
          </ul>
        </section>

        {/* 7. Trajanje kolačića */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">7. Koliko dugo čuvamo kolačiće</h2>

          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="font-medium mb-2">Sesijski kolačići (obrisani nakon gašenja preglednika):</p>
              <p className="text-muted-foreground">Session ID, auth token, CSRF token</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="font-medium mb-2">Trajni kolačići (obrisani nakon vremenske grešne):</p>
              <p className="text-muted-foreground">30 dana (preferencije, analitika), 1 godina (marketinški kolačići)</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="font-medium mb-2">Kolačići trećih strana (Google, Stripe, itd.):</p>
              <p className="text-muted-foreground">Vidi njihove politike — obično 1-2 godine</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-4">Možete brisati kolačiće bilo vremenske iz postavki preglednika, ali to vas neće stalno odlogirati iz našeg računa.</p>
        </section>

        {/* 8. Kontakt */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Pitanja ili žalbe?</h2>
          <div className="space-y-2 text-sm">
            <p>Ako imate pitanja o kolačićima ili željite povući pristanak:</p>
            <p><strong>Email:</strong> <a href="mailto:support@biraj.hr" className="text-[color:var(--gold-deep)] hover:underline">support@biraj.hr</a></p>
            <p className="text-muted-foreground">Odgovaramo u roku od 7 radnih dana.</p>
          </div>
        </section>

        <div className="text-xs text-muted-foreground border-t pt-6">
          <p>Verzija: 1.0 | Ažurirana: 21. srpnja 2026. | Primjena zakona: GDPR + Republika Hrvatska</p>
        </div>
      </article>
    </SiteShell>
  );
}
