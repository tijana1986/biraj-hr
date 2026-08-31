# SEO & Redirect plan — prijenos na `biraj.com.hr`

Cilj: zadržati ranking i promet pri prelasku s trenutne `.lovable.app` domene (i bilo koje stare domene koju koristite) na **`https://biraj.com.hr`**, uz jedinstvenu kanonsku varijantu **bez `www`**.

## 1. Kanonska domena

- **Primarna (canonical):** `https://biraj.com.hr`
- **Redirect (301):** `https://www.biraj.com.hr` → `https://biraj.com.hr`
- **Redirect (301):** `http://*` → `https://biraj.com.hr` (HTTPS)
- Stare domene (npr. `*.lovable.app`, `biraj.com.hr` ako se koristi kao zaštita): **301** na ekvivalentnu rutu na `biraj.com.hr` (path-preserving, ne sve na homepage).

## 2. DNS (kod registrara)

Apex `biraj.com.hr` (A record) i `www` (CNAME ili A) prema Lovable hostingu:

| Tip   | Naziv     | Vrijednost          | TTL  |
|-------|-----------|---------------------|------|
| A     | `@`       | `185.158.133.1`     | 3600 |
| A     | `www`     | `185.158.133.1`     | 3600 |
| TXT   | `_lovable`| `lovable_verify=…`  | 3600 |

U Lovableu (Project Settings → Domains) dodajte **oba** unosa (`biraj.com.hr` i `www.biraj.com.hr`) i postavite `biraj.com.hr` kao **Primary** — `www` će se automatski 301-ati na apex.

## 3. Redirect pravila s `.lovable.app` (ili stare domene)

Ako stara domena ostaje pod vašom kontrolom, postavite Cloudflare Page Rule / Worker / `.htaccess` ekvivalent:

```
# Path-preserving 301
https://OLD-DOMAIN/*  →  https://biraj.com.hr/$1   (status 301)
```

Ako stara domena nije pod kontrolom (Lovable preview URL), nakon prebacivanja Primary domene Lovable će automatski preusmjeriti preview na novu domenu — dodatne radnje nisu potrebne.

## 4. Mapiranje ključnih ruta (path-preserving)

Sve postojeće rute ostaju **identične**, pa je dovoljan path-preserving 301. Reference:

| Stara ruta                                | Nova ruta na `biraj.com.hr`                     |
|-------------------------------------------|---------------------------------------------|
| `/`                                       | `/`                                         |
| `/browse`                                 | `/browse`                                   |
| `/kategorija/{slug}`                      | `/kategorija/{slug}`                        |
| `/kategorija/{slug}/{sub}`                | `/kategorija/{slug}/{sub}`                  |
| `/oglas/{id}`                             | `/oglas/{id}`                               |
| `/pretraga?...`                           | `/pretraga?...` (query string sačuvati)     |
| `/prodavac/{userId}`                      | `/prodavac/{userId}`                        |
| `/cjenik`, `/faq`, `/o-nama`, `/kontakt`  | identično                                   |
| `/uvjeti`, `/privatnost`                  | identično                                   |

Ako se kategorija ili podkategorija preimenuje, dodajte eksplicitni 301 unos na novu slug-rutu i ažurirajte sitemap.

## 5. Sitemap i robots

- **Sitemap:** servira se s `/sitemap.xml` (TanStack server route — `src/routes/sitemap[.]xml.ts`), s `BASE_URL = "https://biraj.com.hr"`. Sadrži statičke stranice + sve kategorije i podkategorije iz `CATEGORIES`.
- **Robots:** `public/robots.txt` dopušta crawl, blokira `/racun`, `/prijava`, `/registracija`, `/objavi` i objavljuje sitemap na `https://biraj.com.hr/sitemap.xml`.

Nakon prelaska:
1. U **Google Search Consoleu** dodajte property `https://biraj.com.hr` (Domain property pokriva i `www`).
2. Pošaljite `https://biraj.com.hr/sitemap.xml`.
3. Koristite **Change of address** alat (Settings → Change of address) sa stare property na novu — preduvjet je da 301-i rade i da su obje property verificirane.
4. Isto ponovite u **Bing Webmaster Tools** (Site Move alat).

## 6. Kanonski URL-ovi u kodu

- `__root.tsx`: postavlja `og:site_name=Biraj.HR`, `og:locale=hr_HR`, `<html lang="hr">`.
- Leaf rute postavljaju vlastiti `<link rel="canonical">` i `og:url` na `https://biraj.com.hr/...` (homepage je primjer u `src/routes/index.tsx`). Pri dodavanju nove rute koja je javna i indeksabilna, **uvijek** dodajte canonical na samu rutu (ne u root — TanStack `links` se ne dedupliciraju).
- Za dinamičke rute (`/oglas/$id`, `/kategorija/$category/$subcategory`) gradite canonical iz parametara: `https://biraj.com.hr/oglas/${id}`.

## 7. Kontrolna lista prije prebacivanja DNS-a

- [ ] `biraj.com.hr` i `www.biraj.com.hr` dodani u Lovable Domains, `biraj.com.hr` = Primary.
- [ ] SSL aktivan (status **Active**) za obje varijante.
- [ ] `https://biraj.com.hr/sitemap.xml` vraća XML s `biraj.com.hr` URL-ovima.
- [ ] `https://biraj.com.hr/robots.txt` vraća točan sadržaj i `Sitemap:` red.
- [ ] `https://www.biraj.com.hr` se 301-a na `https://biraj.com.hr` (test `curl -I`).
- [ ] Internal linkovi (Link `to="/..."`) ostaju **relativni** — ne hard-codirati staru domenu.
- [ ] Google Search Console: nova property dodana, Change of address pokrenut.
- [ ] Stare backlinkove (partneri, društvene mreže, Google Business, e-mail potpisi) ažurirati na `https://biraj.com.hr/...`.
- [ ] 30 dana nakon prebacivanja provjeriti **Coverage** i **Performance** izvještaje u GSC-u — pad <15 % je normalan, oporavak unutar 4–8 tjedana.