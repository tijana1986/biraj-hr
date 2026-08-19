-- Search & Discovery System for Marketplace

-- Add search-related columns to listings table
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS search_vector tsvector,
ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_listings_search_vector ON listings USING GIN (search_vector);

-- Create performance indexes for common filters
CREATE INDEX IF NOT EXISTS idx_listings_category_active ON listings(category, is_active);
CREATE INDEX IF NOT EXISTS idx_listings_location_active ON listings(location, is_active);
CREATE INDEX IF NOT EXISTS idx_listings_user_id_active ON listings(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_listings_created_desc ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_promotion_tier ON listings(promotion_tier);
CREATE INDEX IF NOT EXISTS idx_listings_rating_desc ON listings(rating DESC);
CREATE INDEX IF NOT EXISTS idx_listings_view_count_desc ON listings(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_listings_is_featured ON listings(is_featured, is_active);

-- Update search vector trigger
CREATE OR REPLACE FUNCTION update_listings_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS listings_search_vector_trigger ON listings;
CREATE TRIGGER listings_search_vector_trigger
BEFORE INSERT OR UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION update_listings_search_vector();

-- Create saved_searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  query TEXT NOT NULL,
  filters JSONB, -- { category, location, min_price, max_price, etc }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for saved searches
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_created_at ON saved_searches(created_at DESC);

-- Enable RLS for saved_searches
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_searches
CREATE POLICY "Users can view own saved searches"
  ON saved_searches
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create saved searches"
  ON saved_searches
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own saved searches"
  ON saved_searches
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own saved searches"
  ON saved_searches
  FOR DELETE
  USING (user_id = auth.uid());

-- Create search_history table for analytics
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  results_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for search history
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);

-- Function to increment view count and update rating
CREATE OR REPLACE FUNCTION increment_listing_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE listings
  SET view_count = view_count + 1
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create listing_views table
CREATE TABLE IF NOT EXISTS listing_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for views
CREATE INDEX IF NOT EXISTS idx_listing_views_listing_id ON listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_user_id ON listing_views(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_viewed_at ON listing_views(viewed_at DESC);

-- Create trigger for view counting
CREATE TRIGGER listing_view_trigger
AFTER INSERT ON listing_views
FOR EACH ROW
EXECUTE FUNCTION increment_listing_views();

-- Create listing_interactions table for analytics
CREATE TABLE IF NOT EXISTS listing_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  interaction_type VARCHAR(50), -- view, save, message, promote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for interactions
CREATE INDEX IF NOT EXISTS idx_listing_interactions_listing_id ON listing_interactions(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_interactions_user_id ON listing_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_interactions_type ON listing_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_listing_interactions_created_at ON listing_interactions(created_at DESC);
