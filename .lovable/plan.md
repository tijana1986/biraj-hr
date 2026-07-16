## Launch-ready upgrade plan za Biraj.HR

Cilj: platforma spremna za javni launch u što kraćem roku. Fokus na monetizaciju, povjerenje, performanse i akviziciju. Predlažem 4 paketa koje isporučujemo redom; svaki je zaokružena vrijednost.

### Paket 1 — Naplata i monetizacija (kritično za launch)
- **Stripe integracija** (built-in Lovable payments, bez BYOK): 5 € pay-per-contact za "Poslovi i usluge" preko Stripe Checkout + webhook koji upisuje `service_contacts` idempotentno po `session.id`.
- **Premium oglasi**: jednokratna naplata (npr. 3 €/7 dana, 7 €/30 dana) za `is_premium=true` — highlight u listi, top pozicija, oznaka.
- **Verifikacija prodavača** (5 €): jednokratna naplata koja podiže `profiles.verified=true` + vidljiva značka.
- **Naplaćivanje objave iznad limita**: prvi oglas besplatan, dalje 1 €/oglas ili paket 5 oglasa za 3 €.
- Sve naplate idu kroz jedan `payments` modul + webhook `/api/public/webhooks/stripe`.

### Paket 2 — Povjerenje i sigurnost (nužno za realne korisnike)
- **Recenzije i ocjene**: tablica `reviews` (rater→ratee, ocjena 1-5, tekst, referenca na transakciju), agregat na profilu prodavača i na `ListingCard`.
- **KYC-lite verifikacija**: upload osobne isprave u privatni bucket, moderator ručno odobrava, značka "Verificiran".
- **Email potvrda + rate limiting**: obavezna potvrda emaila prije objave, rate limit na kreiranje oglasa i poruka (SQL brojač po `owner_id` u prozoru 24h).
- **Password HIBP check** (Lovable Cloud auth setting).
- **Automatski expiry**: `expires_at` na oglasima + pg_cron koji arhivira istekle (`status='expired'`).
- **Anti-spam u porukama**: blokada linkova/telefona u prvih 24h nove konverzacije + prijava dovoljno = auto-skrivanje.

### Paket 3 — Akvizicija, SEO i marketing
- **Dinamički sitemap.xml** (već postoji ruta) — proširiti: sve kategorije, podkategorije, oglasi, `lastmod` iz `updated_at`.
- **JSON-LD**: `Product` schema na `/oglas/$id`, `BreadcrumbList` na svim listama, `LocalBusiness` na profilima prodavača.
- **OG slike po ruti**: koristiti prvu sliku oglasa/kategorije kao `og:image` (već imamo pravilo u `__root`).
- **Hrvatske meta-opise** po svakoj ruti (title < 60, desc < 160), canonical tagovi.
- **Email marketing**: transakcijski mailovi (novi oglas, nova poruka, uspješna naplata) preko Lovable Email na custom domenu.
- **Newsletter opt-in** na footeru + tablica `newsletter_subscribers`.
- **Referral kod**: `?ref=xyz` → 1 € kredit prijavljenom korisniku na verifikaciju.

### Paket 4 — Kvaliteta proizvoda pred launch
- **Wishlist na bazu** (trenutno lokalno): tablica `favorites` + realtime broj lajkova na oglasu.
- **Push obavijesti u appu** (nova poruka, nova ponuda) preko Supabase Realtime + `Notification API`.
- **Napredni filteri po podkategoriji**: cjenovni range slider, županija, sortiranje (najnovije, cijena, popularnost) — konzistentno na svim listama.
- **Skeleton loaderi + optimistic UI** za poruke, wishlist, objavu.
- **Slika: kompresija na uploadu** (canvas resize na max 1600px + WebP) prije upload u Storage.
- **404/500 stranice** s brandingom + retry gumb.
- **Legal**: revidirani Uvjeti, Privatnost (GDPR), Cookie banner s consent modom.
- **Analitika**: Plausible ili GA4 + interni dashboard za moderatore (broj oglasa/dan, konverzija po kategoriji, prihod).

### Redoslijed isporuke
1. **Paket 1** — bez naplate nema launcha. Prvo Stripe pay-per-contact (već pripremljeno), zatim premium i verifikacija.
2. **Paket 2** — recenzije + KYC-lite + expiry cron. Nužno prije marketinga.
3. **Paket 3** — SEO/email/OG. Radimo paralelno s Paketom 2 na frontend strani.
4. **Paket 4** — polish, ide u pre-launch tjedan.

### Tehnički detalji
- Sve nove tablice: `GRANT` blok + RLS + policy u istoj migraciji. `service_role` grant za edge/webhook putanje.
- Stripe webhook: `/api/public/webhooks/stripe` s HMAC verifikacijom (`STRIPE_WEBHOOK_SECRET`).
- Cron: pg_cron za expiry i cleanup starih `subcategory_views` (> 90 dana).
- Storage: novi bucket `kyc-documents` (privatan, samo owner + moderator SELECT preko RLS-a i `has_role`).
- Server functions: sve pod `createServerFn` s `requireSupabaseAuth`; webhook i sitemap kao TSS route u `src/routes/api/public/*`.
- Email: Lovable Email + custom domena, HTML template po tipu događaja.

### Što trebam od tebe prije nego krenem
1. Kojim redoslijedom želiš pakete? Predlažem 1 → 2 → 3 → 4.
2. Cijene u Paketu 1 (5 €/kontakt, 3 €/premium 7d, 5 €/verifikacija) — potvrđuješ ili mijenjaš?
3. Custom domena za Lovable Email — imaš li već (npr. `biraj.hr`) ili ide s lovable.app do kasnije?
4. Krećem odmah s **Paketom 1 (Stripe pay-per-contact + premium)** čim potvrdiš?