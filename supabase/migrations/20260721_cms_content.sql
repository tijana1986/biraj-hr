-- CMS Content Management Tables

-- FAQ Items table
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL, -- 'kupovanje', 'prodaja', 'sigurnost'
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Site Settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE, -- 'site_title', 'site_description', etc.
  value TEXT NOT NULL,
  value_type TEXT DEFAULT 'string', -- 'string', 'text', 'number', 'boolean'
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users ON DELETE SET NULL
);

-- Admin Users table (for CMS access)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role TEXT DEFAULT 'editor', -- 'admin', 'editor', 'viewer'
  can_manage_faq BOOLEAN DEFAULT TRUE,
  can_manage_settings BOOLEAN DEFAULT FALSE,
  can_manage_users BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for FAQ Items (anyone can read, only admins can write)
CREATE POLICY "Anyone can read active FAQ items" ON faq_items
  FOR SELECT USING (active = TRUE);

CREATE POLICY "Admins can manage FAQ items" ON faq_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid() AND can_manage_faq = TRUE
    )
  );

-- RLS Policies for Site Settings (anyone can read, only admins can write)
CREATE POLICY "Anyone can read site settings" ON site_settings
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage site settings" ON site_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid() AND can_manage_settings = TRUE
    )
  );

-- RLS Policies for Admin Users
CREATE POLICY "Only admins can view admin users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_faq_items_section ON faq_items(section);
CREATE INDEX idx_faq_items_active ON faq_items(active);
CREATE INDEX idx_site_settings_key ON site_settings(key);
CREATE INDEX idx_admin_users_role ON admin_users(role);

-- Initial FAQ data (seeded from hardcoded FAQ)
INSERT INTO faq_items (section, question, answer, sort_order) VALUES
('Kupovanje', 'Kako kontaktiram prodavatelja?', 'Otvorite oglas i kliknite ''Kontaktiraj prodavatelja''. Razgovor ostaje unutar platforme radi vaše sigurnosti.', 1),
('Kupovanje', 'Mogu li pregledati artikl uživo?', 'Da. Termin dogovorite kroz poruke; preporučujemo pregled prije bilo kakve uplate.', 2),
('Kupovanje', 'Naplaćujete li nešto kupcima?', 'Ne. Pretraga oglasa, kontakt s prodavateljima i poruke su za kupce uvijek besplatni.', 3),
('Kupovanje', 'Što ako artikl ne odgovara opisu?', 'Biraj.HR ne posreduje u kupoprodaji — uvjete dogovarate izravno s prodavateljem. Sumnjive oglase ili korisnike prijavite našoj podršci.', 4),
('Prodaja', 'Kako objavim oglas?', 'Prijavite se i kliknite ''Objavi oglas''. Vodimo vas kroz 5 koraka — od kategorije do pregleda.', 1),
('Prodaja', 'Koliko košta objava?', 'Cijena ovisi o kategoriji i kreće se od besplatne (npr. dječji svijet) do 9,99 € za 30 dana (nekretnine). Cijeli cjenik dostupan je na stranici Cjenik.', 2),
('Prodaja', 'Kako se naplaćuje objava?', 'Naknadu plaćate Biraj.HR-u prilikom kreiranja oglasa, karticom ili IBAN-om. Biraj.HR ne uzima proviziju na prodajnu cijenu.', 3),
('Prodaja', 'Što je ''Top'' pozicioniranje?', 'Premium istaknuti oglas pojavljuje se na vrhu kategorije i u izdvojenim sekcijama 7 dana. Cijena ovisi o kategoriji (od 2,99 € do 14,99 €).', 4),
('Prodaja', 'Koliko traje provjera oglasa?', 'U pravilu do 24 sata. O statusu vas obavještavamo e-poštom.', 5),
('Sigurnost', 'Kako provjeravate korisnike?', 'Tražimo verifikaciju identiteta (KYC), potvrđenu e-poštu i broj telefona. Pravne osobe verificiramo dodatno putem OIB-a.', 1),
('Sigurnost', 'Posredujete li u plaćanju?', 'Ne. Biraj.HR je platforma za objavu oglasa — kupac i prodavatelj dogovaraju plaćanje i preuzimanje izravno. Preporučujemo pregled uživo prije bilo kakve uplate.', 2),
('Sigurnost', 'Što je trust score?', 'Ocjena pouzdanosti korisnika izračunata iz povijest objava, ocjena drugih korisnika i razine verifikacije.', 3),
('Sigurnost', 'Kako prijaviti sumnjivi oglas?', 'Na svakom oglasu nalazi se gumb ''Prijavi''. Naš tim provjerava prijave unutar 24 sata.', 4);
