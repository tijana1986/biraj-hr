REVOKE EXECUTE ON FUNCTION public.enforce_listing_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_message_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.expire_stale_listings() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_default_listing_expiry() FROM PUBLIC, anon, authenticated;