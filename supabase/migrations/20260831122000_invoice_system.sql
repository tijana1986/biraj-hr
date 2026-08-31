-- Invoices tablica (ponude za pretplatu)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  reference_code TEXT NOT NULL UNIQUE,
  package_type TEXT NOT NULL CHECK (package_type IN ('monthly_subscription', 'featured_listing')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'activated', 'cancelled')),
  due_date TIMESTAMPTZ NOT NULL,
  payment_date TIMESTAMPTZ,
  verified_by_admin UUID REFERENCES auth.users,
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX invoices_user_id_idx ON public.invoices(user_id);
CREATE INDEX invoices_reference_code_idx ON public.invoices(reference_code);
CREATE INDEX invoices_status_idx ON public.invoices(status);

GRANT SELECT ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  ));

-- Payment verification log (za audit trail)
CREATE TABLE IF NOT EXISTS public.payment_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users,
  status TEXT NOT NULL CHECK (status IN ('verified', 'rejected')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.payment_verifications TO service_role;
ALTER TABLE public.payment_verifications ENABLE ROW LEVEL SECURITY;

-- Obriši stare customers i stripe-related tablice (ako trebaju)
DROP TABLE IF EXISTS public.customers CASCADE;
