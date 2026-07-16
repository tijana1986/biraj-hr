
DROP POLICY "Anyone can record a view" ON public.subcategory_views;

CREATE POLICY "Anyone can record a view"
  ON public.subcategory_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(category_slug) BETWEEN 1 AND 64
    AND char_length(subcategory_slug) BETWEEN 1 AND 64
    AND (referrer IS NULL OR char_length(referrer) <= 512)
    AND (
      (auth.uid() IS NULL AND user_id IS NULL)
      OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
    )
  );
