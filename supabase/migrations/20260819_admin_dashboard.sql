-- Admin Dashboard Tables

-- admin_logs: Track all admin actions for audit trail
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL,
  -- action_type: 'suspend_seller', 'approve_kyc', 'remove_review', 'warn_user', 'refund', etc.
  target_type VARCHAR(50) NOT NULL,
  -- target_type: 'user', 'listing', 'review', 'conversation', 'order'
  target_id UUID,
  details JSONB,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- moderation_queue: Reviews, listings, and content flagged for moderation
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type VARCHAR(50) NOT NULL,
  -- item_type: 'review', 'listing', 'message', 'profile_photo'
  item_id UUID NOT NULL,
  flagged_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason VARCHAR(100),
  -- reason: 'spam', 'offensive', 'fake', 'inappropriate', 'scam'
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  -- status: 'pending', 'approved', 'rejected', 'deleted', 'archived'
  priority VARCHAR(20) DEFAULT 'normal',
  -- priority: 'low', 'normal', 'high', 'critical'
  assigned_to_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- seller_warnings: Track warnings issued to sellers for policy violations
CREATE TABLE IF NOT EXISTS seller_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  warning_type VARCHAR(100) NOT NULL,
  -- warning_type: 'false_listings', 'poor_ratings', 'unresponsive', 'scam_attempt', 'policy_violation'
  description TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium',
  -- severity: 'low', 'medium', 'high', 'critical'
  action_required VARCHAR(100),
  -- action_required: 'improve_response_time', 'remove_listing', 'verify_items'
  deadline TIMESTAMP,
  acknowledged_at TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- user_suspensions: Track user account suspensions
CREATE TABLE IF NOT EXISTS user_suspensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  suspension_type VARCHAR(50) NOT NULL,
  -- suspension_type: 'temporary', 'permanent'
  reason TEXT NOT NULL,
  duration_days INTEGER,
  status VARCHAR(50) DEFAULT 'active',
  -- status: 'active', 'lifted', 'expired', 'appeals_pending'
  appeal_reason TEXT,
  appeal_status VARCHAR(50),
  -- appeal_status: 'pending', 'approved', 'rejected'
  lift_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lifted_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- marketplace_metrics: Daily marketplace statistics
CREATE TABLE IF NOT EXISTS marketplace_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL UNIQUE,

  -- User metrics
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_sellers INTEGER DEFAULT 0,
  active_buyers INTEGER DEFAULT 0,
  suspended_users INTEGER DEFAULT 0,

  -- Listing metrics
  total_listings INTEGER DEFAULT 0,
  new_listings INTEGER DEFAULT 0,
  listings_flagged INTEGER DEFAULT 0,
  listings_removed INTEGER DEFAULT 0,

  -- Transaction metrics
  total_orders INTEGER DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  canceled_orders INTEGER DEFAULT 0,
  disputed_orders INTEGER DEFAULT 0,

  -- Revenue metrics
  gross_volume DECIMAL(19, 4) DEFAULT 0,
  platform_revenue DECIMAL(19, 4) DEFAULT 0,
  seller_payouts DECIMAL(19, 4) DEFAULT 0,
  refunds DECIMAL(19, 4) DEFAULT 0,

  -- Quality metrics
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  reviews_flagged INTEGER DEFAULT 0,

  -- Support metrics
  total_messages INTEGER DEFAULT 0,
  moderation_items INTEGER DEFAULT 0,
  resolved_disputes INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- payment_disputes: Track and manage payment disputes
CREATE TABLE IF NOT EXISTS payment_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES promotion_orders(id) ON DELETE SET NULL,
  initiated_by_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  dispute_type VARCHAR(100) NOT NULL,
  -- dispute_type: 'item_not_received', 'item_not_matching', 'damaged_item', 'seller_unresponsive', 'payment_issue'
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  -- status: 'open', 'in_progress', 'resolved', 'appealed', 'closed'
  assigned_to_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolution TEXT,
  refund_amount DECIMAL(19, 4),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- admin_settings: Configurable admin panel settings
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action_type ON admin_logs(action_type);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX idx_moderation_queue_priority ON moderation_queue(priority);
CREATE INDEX idx_moderation_queue_item_id ON moderation_queue(item_id);
CREATE INDEX idx_moderation_queue_created_at ON moderation_queue(created_at DESC);
CREATE INDEX idx_seller_warnings_seller_id ON seller_warnings(seller_id);
CREATE INDEX idx_seller_warnings_status ON seller_warnings(status);
CREATE INDEX idx_user_suspensions_user_id ON user_suspensions(user_id);
CREATE INDEX idx_user_suspensions_status ON user_suspensions(status);
CREATE INDEX idx_user_suspensions_expires_at ON user_suspensions(expires_at);
CREATE INDEX idx_marketplace_metrics_date ON marketplace_metrics(metric_date DESC);
CREATE INDEX idx_payment_disputes_status ON payment_disputes(status);
CREATE INDEX idx_payment_disputes_assigned_to ON payment_disputes(assigned_to_id);
CREATE INDEX idx_payment_disputes_created_at ON payment_disputes(created_at DESC);

-- Auto-log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action_type VARCHAR,
  p_target_type VARCHAR,
  p_target_id UUID,
  p_details JSONB DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO admin_logs (admin_id, action_type, target_type, target_id, details, reason)
  VALUES (p_admin_id, p_action_type, p_target_type, p_target_id, p_details, p_reason)
  RETURNING id INTO v_log_id;
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Auto-create marketplace metrics row for each day
CREATE OR REPLACE FUNCTION ensure_daily_metrics()
RETURNS VOID AS $$
BEGIN
  INSERT INTO marketplace_metrics (metric_date)
  VALUES (CURRENT_DATE)
  ON CONFLICT (metric_date) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Update marketplace metrics daily (trigger would run at midnight)
CREATE OR REPLACE FUNCTION update_daily_marketplace_metrics()
RETURNS VOID AS $$
BEGIN
  UPDATE marketplace_metrics SET
    total_users = (SELECT COUNT(*) FROM profiles),
    new_users = (SELECT COUNT(*) FROM profiles WHERE created_at::DATE = CURRENT_DATE),
    active_sellers = (SELECT COUNT(*) FROM seller_stats WHERE total_listings > 0),
    total_listings = (SELECT COUNT(*) FROM listings),
    new_listings = (SELECT COUNT(*) FROM listings WHERE created_at::DATE = CURRENT_DATE),
    total_orders = (SELECT COUNT(*) FROM promotion_orders),
    completed_orders = (SELECT COUNT(*) FROM promotion_orders WHERE payment_status = 'completed'),
    canceled_orders = (SELECT COUNT(*) FROM promotion_orders WHERE payment_status = 'canceled'),
    gross_volume = (SELECT COALESCE(SUM(total_amount), 0) FROM promotion_orders WHERE payment_status = 'completed'),
    average_rating = (SELECT AVG(average_rating) FROM seller_stats),
    total_reviews = (SELECT COUNT(*) FROM listing_reviews WHERE status = 'published'),
    total_messages = (SELECT COUNT(*) FROM messages),
    moderation_items = (SELECT COUNT(*) FROM moderation_queue WHERE status = 'pending'),
    updated_at = CURRENT_TIMESTAMP
  WHERE metric_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Automatically create suspension expiry log entries
CREATE OR REPLACE FUNCTION check_suspension_expiry()
RETURNS VOID AS $$
BEGIN
  UPDATE user_suspensions SET
    status = 'expired'
  WHERE status = 'active'
    AND expires_at <= CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Row-level security
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_suspensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_disputes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can access (future: implement admin role checks)
CREATE POLICY "Admins view all logs" ON admin_logs
  FOR SELECT USING (true)
  WITH CHECK (false);

CREATE POLICY "Admins manage moderation" ON moderation_queue
  FOR ALL USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins view warnings" ON seller_warnings
  FOR SELECT USING (true)
  WITH CHECK (false);

CREATE POLICY "Admins manage suspensions" ON user_suspensions
  FOR ALL USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins view marketplace metrics" ON marketplace_metrics
  FOR SELECT USING (true)
  WITH CHECK (false);

CREATE POLICY "Admins manage disputes" ON payment_disputes
  FOR ALL USING (true)
  WITH CHECK (true);
