-- Seller Dashboard Analytics Tables

-- seller_stats: Denormalized seller performance data
CREATE TABLE IF NOT EXISTS seller_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,

  -- Listing metrics
  total_listings INTEGER DEFAULT 0,
  active_listings INTEGER DEFAULT 0,
  archived_listings INTEGER DEFAULT 0,

  -- Rating and review metrics (from reviews system)
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,

  -- Message metrics
  total_messages_sent INTEGER DEFAULT 0,
  total_conversations INTEGER DEFAULT 0,
  average_response_time_minutes INTEGER DEFAULT 0,

  -- Order metrics
  total_orders INTEGER DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  canceled_orders INTEGER DEFAULT 0,

  -- Interaction metrics
  total_views INTEGER DEFAULT 0,
  total_saves INTEGER DEFAULT 0,
  total_inquiries INTEGER DEFAULT 0,

  -- Financial metrics
  total_revenue DECIMAL(19, 4) DEFAULT 0,
  pending_payout DECIMAL(19, 4) DEFAULT 0,
  last_payout_date TIMESTAMP,

  -- Performance metrics
  completion_rate DECIMAL(5, 2) DEFAULT 0, -- percentage 0-100
  cancellation_rate DECIMAL(5, 2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily seller metrics for trend analysis
CREATE TABLE IF NOT EXISTS seller_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,

  -- Daily counts
  new_listings INTEGER DEFAULT 0,
  new_messages INTEGER DEFAULT 0,
  new_orders INTEGER DEFAULT 0,
  new_views INTEGER DEFAULT 0,
  new_inquiries INTEGER DEFAULT 0,

  -- Daily revenue
  daily_revenue DECIMAL(19, 4) DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(seller_id, metric_date)
);

-- Seller performance flags (badges for achievements)
CREATE TABLE IF NOT EXISTS seller_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  -- badge_type: 'top_rated', 'fast_responder', 'popular', 'trustworthy', 'power_seller'
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(seller_id, badge_type)
);

-- Seller earnings history for transactions
CREATE TABLE IF NOT EXISTS seller_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES promotion_orders(id) ON DELETE SET NULL,

  amount DECIMAL(19, 4) NOT NULL,
  platform_fee DECIMAL(19, 4) DEFAULT 0,
  net_amount DECIMAL(19, 4) NOT NULL,

  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, paid_out, disputed
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_date TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seller performance insights (aggregated metrics)
CREATE TABLE IF NOT EXISTS seller_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,

  -- Comparison with market average
  rating_vs_market_avg DECIMAL(3, 2),
  response_time_vs_market_avg DECIMAL(5, 2),

  -- Trend indicators
  rating_trend VARCHAR(20), -- 'increasing', 'stable', 'decreasing'
  sales_trend VARCHAR(20),

  -- Recommended actions
  action_needed BOOLEAN DEFAULT FALSE,
  action_type VARCHAR(100), -- e.g., 'improve_ratings', 'faster_response', 'list_more_items'
  action_priority VARCHAR(20), -- 'high', 'medium', 'low'

  last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_seller_stats_seller_id ON seller_stats(seller_id);
CREATE INDEX idx_seller_stats_rating ON seller_stats(average_rating DESC);
CREATE INDEX idx_seller_stats_reviews ON seller_stats(total_reviews DESC);
CREATE INDEX idx_seller_stats_revenue ON seller_stats(total_revenue DESC);
CREATE INDEX idx_seller_daily_metrics_seller_id ON seller_daily_metrics(seller_id);
CREATE INDEX idx_seller_daily_metrics_date ON seller_daily_metrics(metric_date);
CREATE INDEX idx_seller_badges_seller_id ON seller_badges(seller_id);
CREATE INDEX idx_seller_earnings_seller_id ON seller_earnings(seller_id);
CREATE INDEX idx_seller_earnings_status ON seller_earnings(status);
CREATE INDEX idx_seller_insights_seller_id ON seller_insights(seller_id);

-- Auto-create seller_stats when profile is created
CREATE OR REPLACE FUNCTION create_seller_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO seller_stats (seller_id) VALUES (NEW.id)
  ON CONFLICT (seller_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_created
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_seller_stats();

-- Update seller_stats when seller ratings change
CREATE OR REPLACE FUNCTION update_seller_stats_on_review()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE seller_stats
  SET
    average_rating = (
      SELECT AVG(rating)::DECIMAL(3, 2) FROM listing_reviews
      WHERE seller_id = NEW.seller_id AND status = 'published'
    ),
    total_reviews = (
      SELECT COUNT(*) FROM listing_reviews
      WHERE seller_id = NEW.seller_id AND status = 'published'
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE seller_id = NEW.seller_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seller_stats_on_new_review
AFTER INSERT OR UPDATE ON listing_reviews
FOR EACH ROW
EXECUTE FUNCTION update_seller_stats_on_review();

-- Update seller_stats when messages are sent
CREATE OR REPLACE FUNCTION update_seller_stats_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE seller_stats
  SET
    total_messages_sent = total_messages_sent + 1,
    updated_at = CURRENT_TIMESTAMP
  WHERE seller_id = NEW.sender_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seller_stats_on_new_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_seller_stats_on_message();

-- Update seller_stats when listings are created
CREATE OR REPLACE FUNCTION update_seller_stats_on_listing()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE seller_stats
    SET
      total_listings = total_listings + 1,
      active_listings = active_listings + 1,
      updated_at = CURRENT_TIMESTAMP
    WHERE seller_id = NEW.seller_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.is_active != NEW.is_active THEN
    UPDATE seller_stats
    SET
      active_listings = active_listings + (CASE WHEN NEW.is_active THEN 1 ELSE -1 END),
      archived_listings = archived_listings + (CASE WHEN NEW.is_active THEN -1 ELSE 1 END),
      updated_at = CURRENT_TIMESTAMP
    WHERE seller_id = NEW.seller_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seller_stats_on_listing_change
AFTER INSERT OR UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION update_seller_stats_on_listing();

-- Update seller_stats when views are recorded
CREATE OR REPLACE FUNCTION update_seller_stats_on_view()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE seller_stats
  SET
    total_views = total_views + 1,
    updated_at = CURRENT_TIMESTAMP
  WHERE seller_id = (
    SELECT seller_id FROM listings WHERE id = NEW.listing_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seller_stats_on_new_view
AFTER INSERT ON listing_views
FOR EACH ROW
EXECUTE FUNCTION update_seller_stats_on_view();

-- Update seller_stats when orders are created
CREATE OR REPLACE FUNCTION update_seller_stats_on_order()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE seller_stats
  SET
    total_orders = total_orders + 1,
    total_inquiries = total_inquiries + 1,
    updated_at = CURRENT_TIMESTAMP
  WHERE seller_id = NEW.seller_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seller_stats_on_new_order
AFTER INSERT ON promotion_orders
FOR EACH ROW
EXECUTE FUNCTION update_seller_stats_on_order();

-- Update seller_stats completion rates
CREATE OR REPLACE FUNCTION update_seller_completion_rate()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE seller_stats
  SET
    completed_orders = (
      SELECT COUNT(*) FROM promotion_orders
      WHERE seller_id = NEW.seller_id AND payment_status = 'completed'
    ),
    canceled_orders = (
      SELECT COUNT(*) FROM promotion_orders
      WHERE seller_id = NEW.seller_id AND payment_status = 'canceled'
    ),
    completion_rate = (
      SELECT
        CASE
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND((SUM(CASE WHEN payment_status = 'completed' THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) * 100)::NUMERIC, 2)
        END
      FROM promotion_orders
      WHERE seller_id = NEW.seller_id
    ),
    cancellation_rate = (
      SELECT
        CASE
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND((SUM(CASE WHEN payment_status = 'canceled' THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) * 100)::NUMERIC, 2)
        END
      FROM promotion_orders
      WHERE seller_id = NEW.seller_id
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE seller_id = NEW.seller_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seller_completion_on_order_update
AFTER UPDATE ON promotion_orders
FOR EACH ROW
EXECUTE FUNCTION update_seller_completion_rate();

-- Row-level security
ALTER TABLE seller_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Sellers can see their own stats, public can see basic stats
CREATE POLICY "Sellers view own stats" ON seller_stats
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Public views basic stats" ON seller_stats
  FOR SELECT USING (true)
  WITH CHECK (false);

CREATE POLICY "Sellers view own daily metrics" ON seller_daily_metrics
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers view own badges" ON seller_badges
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Public views badges" ON seller_badges
  FOR SELECT USING (true)
  WITH CHECK (false);

CREATE POLICY "Sellers view own earnings" ON seller_earnings
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers view own insights" ON seller_insights
  FOR SELECT USING (auth.uid() = seller_id);
