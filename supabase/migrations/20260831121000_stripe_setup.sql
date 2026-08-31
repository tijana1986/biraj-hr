-- Customers tablica (za mapping Stripe customer IDs)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX customers_user_id_idx ON public.customers(user_id);

GRANT SELECT, INSERT, UPDATE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own customer record"
  ON public.customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Update payments tablica ako trebam dodatne polja
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT;
