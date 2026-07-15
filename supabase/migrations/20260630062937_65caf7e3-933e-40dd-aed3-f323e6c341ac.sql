
-- LISTINGS
CREATE TABLE public.listings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_slug text NOT NULL,
  subcategory_slug text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  price_eur numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  location text NOT NULL,
  county text,
  images text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  is_premium boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  views_count integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT listings_status_check CHECK (status IN ('draft','pending','active','sold','expired','archived')),
  CONSTRAINT listings_title_len CHECK (char_length(title) BETWEEN 3 AND 160),
  CONSTRAINT listings_desc_len CHECK (char_length(description) BETWEEN 10 AND 8000)
);

GRANT SELECT ON public.listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active listings public read"
  ON public.listings FOR SELECT
  TO anon, authenticated
  USING (status = 'active' OR auth.uid() = owner_id);

CREATE POLICY "Owners insert listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners update listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners delete listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE INDEX listings_category_idx ON public.listings(category_slug, subcategory_slug);
CREATE INDEX listings_owner_idx ON public.listings(owner_id);
CREATE INDEX listings_status_idx ON public.listings(status);
CREATE INDEX listings_created_idx ON public.listings(created_at DESC);

-- SERVICE REQUESTS
CREATE TABLE public.service_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subcategory_slug text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  county text,
  budget_eur numeric(12,2),
  status text NOT NULL DEFAULT 'open',
  contact_fee_eur numeric(6,2) NOT NULL DEFAULT 5.00,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sr_status_check CHECK (status IN ('open','matched','closed')),
  CONSTRAINT sr_title_len CHECK (char_length(title) BETWEEN 3 AND 160)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_requests TO authenticated;
GRANT ALL ON public.service_requests TO service_role;

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read open requests"
  ON public.service_requests FOR SELECT
  TO authenticated
  USING (status = 'open' OR auth.uid() = requester_id);

CREATE POLICY "Requesters insert"
  ON public.service_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Requesters update"
  ON public.service_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = requester_id)
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Requesters delete"
  ON public.service_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = requester_id);

CREATE INDEX service_requests_sub_idx ON public.service_requests(subcategory_slug);
CREATE INDEX service_requests_status_idx ON public.service_requests(status);

-- SERVICE CONTACTS (otključani kontakti)
CREATE TABLE public.service_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paid_eur numeric(6,2) NOT NULL DEFAULT 5.00,
  payment_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, provider_id)
);

GRANT SELECT, INSERT ON public.service_contacts TO authenticated;
GRANT ALL ON public.service_contacts TO service_role;

ALTER TABLE public.service_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers read own contacts"
  ON public.service_contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = provider_id);

CREATE POLICY "Providers insert own contacts"
  ON public.service_contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = provider_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER listings_set_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER service_requests_set_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
