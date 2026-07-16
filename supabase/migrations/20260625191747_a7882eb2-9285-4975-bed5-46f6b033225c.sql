
-- Subcategories catalog (mirror of in-app taxonomy, ready for CMS use)
CREATE TABLE public.subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_slug TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_slug, slug)
);

GRANT SELECT ON public.subcategories TO anon, authenticated;
GRANT ALL ON public.subcategories TO service_role;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subcategories are public"
  ON public.subcategories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Analytics: subcategory page views
CREATE TABLE public.subcategory_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_slug TEXT NOT NULL,
  subcategory_slug TEXT NOT NULL,
  user_id UUID,
  referrer TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX subcategory_views_lookup_idx
  ON public.subcategory_views (category_slug, subcategory_slug, viewed_at DESC);

GRANT INSERT ON public.subcategory_views TO anon, authenticated;
GRANT SELECT ON public.subcategory_views TO authenticated;
GRANT ALL ON public.subcategory_views TO service_role;
ALTER TABLE public.subcategory_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a view"
  ON public.subcategory_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Signed-in users can read aggregated views"
  ON public.subcategory_views FOR SELECT
  TO authenticated
  USING (true);
