-- Add refund support to promotion_orders table
ALTER TABLE promotion_orders ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE promotion_orders ADD COLUMN IF NOT EXISTS refund_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE promotion_orders ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE promotion_orders ADD COLUMN IF NOT EXISTS stripe_refund_id VARCHAR;

-- Update payment_status type to include refund_requested
ALTER TABLE promotion_orders
ADD CONSTRAINT payment_status_check
CHECK (payment_status IN ('completed', 'pending', 'failed', 'refunded', 'refund_requested'));

-- Create refund_requests table for better tracking
CREATE TABLE IF NOT EXISTS refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES promotion_orders(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for refund requests
CREATE INDEX IF NOT EXISTS idx_refund_requests_order_id ON refund_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_user_id ON refund_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);

-- RLS Policies for refund_requests
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own refund requests
CREATE POLICY "Users can view own refund requests"
  ON refund_requests
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create refund requests for their own orders
CREATE POLICY "Users can create refund requests for own orders"
  ON refund_requests
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    order_id IN (
      SELECT id FROM promotion_orders WHERE user_id = auth.uid()
    )
  );

-- Admins can view all refund requests
CREATE POLICY "Admins can view all refund requests"
  ON refund_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update refund requests
CREATE POLICY "Admins can update refund requests"
  ON refund_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically create refund request when status changes
CREATE OR REPLACE FUNCTION handle_refund_request()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'refund_requested' AND OLD.payment_status != 'refund_requested' THEN
    INSERT INTO refund_requests (order_id, user_id, reason)
    VALUES (NEW.id, NEW.user_id, COALESCE(NEW.refund_reason, 'No reason provided'))
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refund_request_trigger
AFTER UPDATE ON promotion_orders
FOR EACH ROW
EXECUTE FUNCTION handle_refund_request();
