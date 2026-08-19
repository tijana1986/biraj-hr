-- Create subscription_orders table
CREATE TABLE IF NOT EXISTS subscription_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  listing_id UUID REFERENCES listings(id),
  tier VARCHAR NOT NULL,
  price_eur DECIMAL(10, 2) NOT NULL,
  currency VARCHAR DEFAULT 'EUR',
  stripe_subscription_id VARCHAR UNIQUE,
  stripe_session_id VARCHAR,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'past_due')),
  billing_interval VARCHAR DEFAULT 'month' CHECK (billing_interval IN ('month', 'year')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for subscription_orders
CREATE INDEX IF NOT EXISTS idx_subscription_orders_user_id ON subscription_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_listing_id ON subscription_orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_stripe_sub_id ON subscription_orders(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_status ON subscription_orders(status);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_created_at ON subscription_orders(created_at DESC);

-- Enable RLS for subscription_orders
ALTER TABLE subscription_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_orders
CREATE POLICY "Users can view own subscriptions"
  ON subscription_orders
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own subscriptions"
  ON subscription_orders
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscriptions"
  ON subscription_orders
  FOR UPDATE
  USING (user_id = auth.uid());

-- Function to automatically update subscription listing
CREATE OR REPLACE FUNCTION handle_subscription_listing()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND NEW.listing_id IS NOT NULL THEN
    UPDATE listings
    SET
      subscription_tier = NEW.tier,
      subscription_active = true,
      subscription_expires_at = NEW.next_billing_date
    WHERE id = NEW.listing_id;
  ELSIF NEW.status IN ('cancelled', 'past_due') AND NEW.listing_id IS NOT NULL THEN
    UPDATE listings
    SET
      subscription_active = false,
      subscription_tier = NULL
    WHERE id = NEW.listing_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_listing_trigger
AFTER INSERT OR UPDATE ON subscription_orders
FOR EACH ROW
EXECUTE FUNCTION handle_subscription_listing();

-- Add subscription columns to listings table if they don't exist
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR,
ADD COLUMN IF NOT EXISTS subscription_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;
