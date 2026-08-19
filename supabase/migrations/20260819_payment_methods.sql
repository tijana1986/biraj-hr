-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stripe_payment_method_id VARCHAR UNIQUE NOT NULL,
  card_brand VARCHAR NOT NULL,
  card_last4 VARCHAR NOT NULL,
  card_exp_month INTEGER NOT NULL,
  card_exp_year INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_id ON payment_methods(stripe_payment_method_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(user_id, is_default);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own payment methods"
  ON payment_methods
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own payment methods"
  ON payment_methods
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own payment methods"
  ON payment_methods
  FOR DELETE
  USING (user_id = auth.uid());

-- Create invoices table for record keeping
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_id UUID REFERENCES promotion_orders(id),
  subscription_id UUID REFERENCES subscription_orders(id),
  invoice_number VARCHAR UNIQUE NOT NULL,
  amount_eur DECIMAL(10, 2) NOT NULL,
  description TEXT,
  invoice_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  pdf_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

-- Enable RLS for invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Users can view own invoices"
  ON invoices
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all invoices"
  ON invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to auto-create invoice when order is completed
CREATE OR REPLACE FUNCTION create_invoice_for_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    INSERT INTO invoices (user_id, order_id, invoice_number, amount_eur, description, paid_date)
    VALUES (
      NEW.user_id,
      NEW.id,
      'INV-' || to_char(NOW(), 'YYYYMM') || '-' || SUBSTRING(NEW.id::text, 1, 8),
      NEW.price_eur,
      'Promotion - ' || NEW.tier,
      NOW()
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_creation_trigger
AFTER UPDATE ON promotion_orders
FOR EACH ROW
EXECUTE FUNCTION create_invoice_for_order();

-- Function to auto-create invoice for subscriptions
CREATE OR REPLACE FUNCTION create_invoice_for_subscription()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    INSERT INTO invoices (user_id, subscription_id, invoice_number, amount_eur, description, paid_date)
    VALUES (
      NEW.user_id,
      NEW.id,
      'INV-' || to_char(NOW(), 'YYYYMM') || '-' || SUBSTRING(NEW.id::text, 1, 8),
      NEW.price_eur,
      'Subscription - ' || NEW.tier || ' (' || NEW.billing_interval || ')',
      NOW()
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_invoice_trigger
AFTER INSERT ON subscription_orders
FOR EACH ROW
EXECUTE FUNCTION create_invoice_for_subscription();
