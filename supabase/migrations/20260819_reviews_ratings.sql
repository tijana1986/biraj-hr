-- Reviews & Ratings System for Marketplace Trust

-- Create listings_reviews table
CREATE TABLE IF NOT EXISTS listing_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  order_id UUID REFERENCES promotion_orders(id) ON DELETE SET NULL,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200) NOT NULL,
  comment TEXT,
  photos JSONB, -- Array of { url, description }
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INT DEFAULT 0,
  unhelpful_count INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'published', -- published, flagged, hidden
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seller_ratings table (denormalized for performance)
CREATE TABLE IF NOT EXISTS seller_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  rating_1_count INT DEFAULT 0,
  rating_2_count INT DEFAULT 0,
  rating_3_count INT DEFAULT 0,
  rating_4_count INT DEFAULT 0,
  rating_5_count INT DEFAULT 0,
  response_rate DECIMAL(5, 2) DEFAULT 0, -- % of reviews responded to
  response_time_hours INT DEFAULT 0, -- average hours to respond
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seller_review_responses table
CREATE TABLE IF NOT EXISTS seller_review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES listing_reviews(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create review_flags table for moderation
CREATE TABLE IF NOT EXISTS review_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES listing_reviews(id) ON DELETE CASCADE,
  reported_by_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL, -- spam, offensive, fake, irrelevant
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, reviewed, resolved
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create review_helpful votes table
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES listing_reviews(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, voter_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_listing_reviews_listing_id ON listing_reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_reviews_reviewer_id ON listing_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_listing_reviews_seller_id ON listing_reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_listing_reviews_order_id ON listing_reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_listing_reviews_rating ON listing_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_listing_reviews_created_at ON listing_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_reviews_status ON listing_reviews(status);
CREATE INDEX IF NOT EXISTS idx_listing_reviews_verified ON listing_reviews(is_verified_purchase);

CREATE INDEX IF NOT EXISTS idx_seller_ratings_seller_id ON seller_ratings(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_ratings_average ON seller_ratings(average_rating DESC);

CREATE INDEX IF NOT EXISTS idx_seller_responses_review_id ON seller_review_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_seller_responses_seller_id ON seller_review_responses(seller_id);

CREATE INDEX IF NOT EXISTS idx_review_flags_review_id ON review_flags(review_id);
CREATE INDEX IF NOT EXISTS idx_review_flags_status ON review_flags(status);

CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_voter_id ON review_votes(voter_id);

-- Enable RLS
ALTER TABLE listing_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listing_reviews
CREATE POLICY "Anyone can view published reviews"
  ON listing_reviews
  FOR SELECT
  USING (status = 'published' OR reviewer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Verified buyers can create reviews"
  ON listing_reviews
  FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid() AND
    (
      -- Has purchased from this seller
      EXISTS (
        SELECT 1 FROM promotion_orders
        WHERE user_id = auth.uid()
        AND listing_id = listing_reviews.listing_id
        AND payment_status = 'completed'
      ) OR
      -- Or has active conversation
      EXISTS (
        SELECT 1 FROM conversations
        WHERE buyer_id = auth.uid()
        AND seller_id = listing_reviews.seller_id
      )
    )
  );

CREATE POLICY "Reviewers can update own reviews"
  ON listing_reviews
  FOR UPDATE
  USING (reviewer_id = auth.uid());

CREATE POLICY "Sellers can view their reviews"
  ON listing_reviews
  FOR SELECT
  USING (seller_id = auth.uid());

-- RLS Policies for seller_ratings (public read)
CREATE POLICY "Anyone can view seller ratings"
  ON seller_ratings
  FOR SELECT
  USING (true);

-- RLS Policies for seller_review_responses
CREATE POLICY "Anyone can view responses"
  ON seller_review_responses
  FOR SELECT
  USING (true);

CREATE POLICY "Sellers can create responses to their reviews"
  ON seller_review_responses
  FOR INSERT
  WITH CHECK (
    seller_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM listing_reviews
      WHERE id = review_id
      AND seller_id = auth.uid()
      AND NOT EXISTS (
        SELECT 1 FROM seller_review_responses
        WHERE review_id = listing_reviews.id
      )
    )
  );

CREATE POLICY "Sellers can update their responses"
  ON seller_review_responses
  FOR UPDATE
  USING (seller_id = auth.uid());

-- RLS Policies for review_flags
CREATE POLICY "Users can create flags"
  ON review_flags
  FOR INSERT
  WITH CHECK (reported_by_id = auth.uid());

CREATE POLICY "Users can view their own flags"
  ON review_flags
  FOR SELECT
  USING (reported_by_id = auth.uid());

-- RLS Policies for review_votes
CREATE POLICY "Anyone can vote on reviews"
  ON review_votes
  FOR INSERT
  WITH CHECK (voter_id = auth.uid());

CREATE POLICY "Anyone can view votes"
  ON review_votes
  FOR SELECT
  USING (true);

-- Function to update seller ratings
CREATE OR REPLACE FUNCTION update_seller_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update seller ratings denormalized table
  UPDATE seller_ratings
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM listing_reviews
      WHERE seller_id = NEW.seller_id
      AND status = 'published'
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM listing_reviews
      WHERE seller_id = NEW.seller_id
      AND status = 'published'
    ),
    rating_1_count = (
      SELECT COUNT(*)
      FROM listing_reviews
      WHERE seller_id = NEW.seller_id
      AND rating = 1
      AND status = 'published'
    ),
    rating_2_count = (
      SELECT COUNT(*)
      FROM listing_reviews
      WHERE seller_id = NEW.seller_id
      AND rating = 2
      AND status = 'published'
    ),
    rating_3_count = (
      SELECT COUNT(*)
      FROM listing_reviews
      WHERE seller_id = NEW.seller_id
      AND rating = 3
      AND status = 'published'
    ),
    rating_4_count = (
      SELECT COUNT(*)
      FROM listing_reviews
      WHERE seller_id = NEW.seller_id
      AND rating = 4
      AND status = 'published'
    ),
    rating_5_count = (
      SELECT COUNT(*)
      FROM listing_reviews
      WHERE seller_id = NEW.seller_id
      AND rating = 5
      AND status = 'published'
    ),
    updated_at = NOW()
  WHERE seller_id = NEW.seller_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seller_ratings_on_review_trigger
AFTER INSERT OR UPDATE ON listing_reviews
FOR EACH ROW
EXECUTE FUNCTION update_seller_ratings();

-- Function to ensure seller_ratings record exists
CREATE OR REPLACE FUNCTION ensure_seller_rating_record()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO seller_ratings (seller_id)
  VALUES (NEW.seller_id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_seller_rating_trigger
BEFORE INSERT ON listing_reviews
FOR EACH ROW
EXECUTE FUNCTION ensure_seller_rating_record();

-- Function to update review helpful counts
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE listing_reviews
  SET
    helpful_count = (
      SELECT COUNT(*)
      FROM review_votes
      WHERE review_id = NEW.review_id
      AND is_helpful = true
    ),
    unhelpful_count = (
      SELECT COUNT(*)
      FROM review_votes
      WHERE review_id = NEW.review_id
      AND is_helpful = false
    )
  WHERE id = NEW.review_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_helpful_count_trigger
AFTER INSERT OR UPDATE ON review_votes
FOR EACH ROW
EXECUTE FUNCTION update_review_helpful_count();

-- Add rating columns to listings table
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0;

-- Update listings rating from reviews
CREATE OR REPLACE FUNCTION update_listing_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE listings
  SET
    average_rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM listing_reviews
      WHERE listing_id = NEW.listing_id
      AND status = 'published'
    ), 0),
    review_count = (
      SELECT COUNT(*)
      FROM listing_reviews
      WHERE listing_id = NEW.listing_id
      AND status = 'published'
    )
  WHERE id = NEW.listing_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_listing_rating_trigger
AFTER INSERT OR UPDATE ON listing_reviews
FOR EACH ROW
EXECUTE FUNCTION update_listing_rating();
