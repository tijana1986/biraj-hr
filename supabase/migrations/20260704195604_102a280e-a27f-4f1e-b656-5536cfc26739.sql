
ALTER TABLE public.reports ALTER COLUMN target_id TYPE TEXT USING target_id::text;
