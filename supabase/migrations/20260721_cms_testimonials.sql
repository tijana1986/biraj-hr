-- Testimonials/Reviews table for CMS

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_title TEXT, -- e.g., "Kupac", "Prodavač", etc.
  content TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read active testimonials" ON testimonials
  FOR SELECT USING (active = TRUE);

CREATE POLICY "Admins can manage testimonials" ON testimonials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Index
CREATE INDEX idx_testimonials_featured ON testimonials(featured);
CREATE INDEX idx_testimonials_active ON testimonials(active);
CREATE INDEX idx_testimonials_sort_order ON testimonials(sort_order);

-- Initial testimonials data
INSERT INTO testimonials (author_name, author_title, content, rating, featured, sort_order) VALUES
('Marko Horvat', 'Kupac', 'Jako brz i siguran proces kupnje. Prodavač je bio profesionalan i pouzdljiv. Preporučujem!', 5, true, 1),
('Ana Babić', 'Prodavač', 'Odličan marketplace za prodaju. Korisničko sučelje je intuitivno, a tim je vrlo responzivan.', 5, true, 2),
('Petar Nikolić', 'Kupac', 'Pronašao sam upravo ono što sam tražio. Transakcija je bila bezbolna od početka do kraja.', 5, false, 3);
