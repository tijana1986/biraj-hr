-- Promotion system for marketplace listings

-- Add promotion columns to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS promotion_tier VARCHAR(50) DEFAULT 'none';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS promotion_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS promotion_activated_at TIMESTAMP WITH TIME ZONE;

-- Create promotion_orders table for payment tracking
CREATE TABLE IF NOT EXISTS promotion_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  tier VARCHAR(50) NOT NULL,
  price_eur DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  period_days INT DEFAULT 7,
  stripe_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_method VARCHAR(50), -- card, stripe, bank_transfer
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE promotion_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promotion_orders
CREATE POLICY "Users can view their own promotion orders" ON promotion_orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create promotion orders" ON promotion_orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all promotion orders" ON promotion_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update promotion orders" ON promotion_orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX idx_promotion_orders_user_id ON promotion_orders(user_id);
CREATE INDEX idx_promotion_orders_listing_id ON promotion_orders(listing_id);
CREATE INDEX idx_promotion_orders_stripe_session_id ON promotion_orders(stripe_session_id);
CREATE INDEX idx_promotion_orders_payment_status ON promotion_orders(payment_status);
CREATE INDEX idx_promotion_orders_created_at ON promotion_orders(created_at DESC);
CREATE INDEX idx_listings_promotion_tier ON listings(promotion_tier);
CREATE INDEX idx_listings_promotion_expires_at ON listings(promotion_expires_at);

-- Function to auto-expire promotions
CREATE OR REPLACE FUNCTION expire_promotions()
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET promotion_tier = 'none'
  WHERE promotion_expires_at IS NOT NULL
    AND promotion_expires_at <= NOW()
    AND promotion_tier != 'none';
END;
$$ LANGUAGE plpgsql;
