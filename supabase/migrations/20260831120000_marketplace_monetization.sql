-- Marketplace Listings tablica
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price_per_unit DECIMAL(10,2),
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  images JSONB,
  views_count INTEGER NOT NULL DEFAULT 0,
  clicks_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX marketplace_listings_user_id_idx ON public.marketplace_listings(user_id);
CREATE INDEX marketplace_listings_status_idx ON public.marketplace_listings(status);
CREATE INDEX marketplace_listings_category_idx ON public.marketplace_listings(category);

GRANT SELECT ON public.marketplace_listings TO anon, authenticated;
GRANT ALL ON public.marketplace_listings TO service_role;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active listings"
  ON public.marketplace_listings FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Users can manage their own listings"
  ON public.marketplace_listings FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Subscriptions tablica (€30/mesečno)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  next_billing_date TIMESTAMPTZ,
  stripe_subscription_id TEXT UNIQUE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX subscriptions_stripe_id_idx ON public.subscriptions(stripe_subscription_id);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Featured Listings tablica (€8 jednokratno)
CREATE TABLE IF NOT EXISTS public.featured_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings ON DELETE CASCADE,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX featured_listings_listing_id_idx ON public.featured_listings(listing_id);
CREATE INDEX featured_listings_expires_at_idx ON public.featured_listings(expires_at);

GRANT SELECT ON public.featured_listings TO anon, authenticated;
GRANT ALL ON public.featured_listings TO service_role;
ALTER TABLE public.featured_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active featured listings"
  ON public.featured_listings FOR SELECT
  TO anon, authenticated
  USING (status = 'active' AND expires_at > now());

-- Payments tablica
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription', 'featured_listing')),
  description TEXT,
  stripe_payment_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX payments_user_id_idx ON public.payments(user_id);
CREATE INDEX payments_stripe_id_idx ON public.payments(stripe_payment_id);

GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
