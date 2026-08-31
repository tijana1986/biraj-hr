# Biraj.HR - Admin & CMS Vodič

Ovaj dokument objašnjava kako koristiti admin panel i CMS za upravljanje sadržajem Biraj.HR aplikacije.

## 🚀 Početni Postup

### 1. Inicijalizacija Admin Korisnika (prvi put)

Kada se aplikacija prvi put pokreće, trebate postaviti admin korisnika:

1. Prijavite se na aplikaciju (`/prijava`)
2. Idite na `/admin-setup`
3. Kliknite "Postavite kao admin"
4. Sad ste admin i možete pristupiti `/admin` panelu

⚠️ **Važno:** Ovaj korak se može obaviti samo jednom! Budite sigurni da je ovo ispravan korisnik.

---

## 📋 Admin Panel (`/admin`)

Admin panel je centralizovano mjesto za upravljanje sadržajem aplikacije.

### Dostupne Sekcije

#### 1. **Pregled** (`/admin`)
- Početna stranica admin panela
- Brzi pregled svih mogućnosti

#### 2. **Česta Pitanja** (`/admin/faq`)
- Upravljanje FAQ stavkama
- Dodavanje novih pitanja i odgovora
- Uređivanje postojećih Q&A
- Brisanje zastarjelih pitanja

**Kako koristiti:**
- FAQ se automatski učitava na `/faq` stranicu
- Promjene se vide odmah bez potrebe za restartom

#### 3. **Postavke** (`/admin/settings`)
- Upravljanje osnovnim postavkama stranice
- Editable polja:
  - Site Title
  - Site Description
  - Contact Email
  - Support Email

#### 4. **Korisnici** (`/admin/users`)
- Upravljanje admin korisnicima
- Dodijelite admin pristup drugim korisnicima
- Postavite razine dozvola:
  - **Admin** - Puna kontrola
  - **Editor** - Može editovati sadržaj
  - **Viewer** - Samo može čitati

**Kako dodijeliti admin pristup:**
1. Idite na `/admin/users`
2. Unesite e-mail korisnika
3. Odaberite razinu dozvole
4. Kliknite "Dodijelite pristup"

#### 5. **Testimonijali** (`/admin/testimonials`)
- Upravljanje korisničkim recenzijama
- Dodavanje novih testimonijala
- Markiranje kao "istaknutih" (prikazuje se na početnoj stranici)
- Ocjenjivanje (1-5 zvjezdica)

---

## 🔐 Razine Dozvola

| Uloga | FAQ | Postavke | Korisnici | Testimonijali |
|-------|-----|----------|-----------|---------------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Editor | ✅ | ❌ | ❌ | ✅ |
| Viewer | ❌ | ❌ | ❌ | ❌ |

---

## 📱 Dostupne Funkcionalnosti

### Upravljanje Sadržajem

- ✅ FAQ upravljanje
- ✅ Testimonijali
- ✅ Site Settings
- ✅ Admin User Management
- ✅ Role-based Access Control

### Dashboard za Korisnike

Obični korisnici mogu pristupiti svojem dashboard-u na `/racun`:

- 📊 **Dashboard** - Pregled aktivnosti
- 📝 **Moji Oglasi** - Upravljanje oglasima
- 💬 **Poruke** - Komunikacija s kupcima/prodavačima
- ❤️ **Spremljeno** - Wishlist
- 👤 **Profil** - Osobni podaci i sigurnost

---

## 🛠️ Tehnički Detalji

### Database
- Koristi se Supabase PostgreSQL
- Tablica `faq_items` - FAQ stavke
- Tablica `site_settings` - Postavke
- Tablica `admin_users` - Admin dozvole
- Tablica `testimonials` - Recenzije

### Security
- Row Level Security (RLS) omogućen na svim tablicama
- Samo autentificirani korisnici mogu pristupiti admin panelu
- Samo admin korisnici mogu pisati/brisati sadržaj

### Server Functions
Sve rad sa bazom ide kroz server functions:
- `fetchFAQItems()` - Dohvati FAQ
- `updateFAQItem()` - Uredi FAQ
- `createFAQItem()` - Kreiraj FAQ
- `deleteFAQItem()` - Obriši FAQ
- Similar za testimonijale, settings, i korisnike

---

## 📚 Stranice Aplikacije

### Javne Stranice
- `/` - Početna stranica
- `/browse` - Pretraživanje oglasa
- `/objavi` - Objava novog oglasa
- `/o-nama` - O nama
- `/kontakt` - Kontakt forma
- `/cjenik` - Cjenik objave
- `/faq` - Česta pitanja (iz baze!)
- `/uvjeti-koristenja` - Uvjeti korištenja
- `/politika-privatnosti` - Politika privatnosti
- `/politika-kolacica` - Politika kolačića

### Protected Stranice (zahtijeva login)
- `/racun` - Dashboard
- `/racun/oglasi` - Moji oglasi
- `/racun/poruke` - Poruke
- `/racun/spremljeno` - Spremljeno
- `/racun/profil` - Profil

### Admin Stranice (zahtijeva admin pristup)
- `/admin` - Admin panel
- `/admin-setup` - Admin inicijalizacija (samo prvi put)
- `/admin/faq` - FAQ upravljanje
- `/admin/settings` - Postavke
- `/admin/users` - Upravljanje korisnicima
- `/admin/testimonials` - Upravljanje testimonijala

---

## ✅ Što je Implementirano

### ✨ Novosti u ovoj verziji:
1. **CMS Admin Panel** - Kompletna admin konzola za upravljanje sadržajem
2. **FAQ iz baze** - FAQ sada čita iz Supabase umjesto hardkodiranih podataka
3. **Testimonijali** - Upravljanje korisničkim recenzijama
4. **User Management** - Dodijelite admin pristup drugim korisnicima
5. **Role-based Access** - Admin, Editor, Viewer razine
6. **Unified Design** - Elegantna, konzistentna vizualna identitet svih stranica
7. **GDPR Compliant** - Sve politike u skladu s GDPR i hrvatskim zakonima

---

## 🔧 Troubleshooting

### Admin panel ne učitava podatke
- Provjerite je li Supabase dostupan
- Provjerite je li korisnik stvarno admin (u `admin_users` tablici)

### FAQ se ne ažurira
- Provjerite je li FAQ item označen kao `active = true`
- Očistite browser cache

### Novi admin korisnik ne može pristupiti panelu
- Provjerite je li postavljen kao `role = 'admin'` u `admin_users` tablici
- Korisnik se mora odjaviti i ponovo prijaviti

---

## 📞 Podrška

Za dodatne upite ili probleme, kontaktirajte support@biraj.com.hr

---

**Zadnja ažuriranja:** 21. srpnja 2026.
