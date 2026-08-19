-- API Integration System

-- api_keys: API key management
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  description TEXT,

  key_hash VARCHAR(255) UNIQUE NOT NULL,
  -- Hashed version of the key for storage (never store plain keys!)

  key_prefix VARCHAR(10),
  -- First 10 chars for identification without exposing full key

  permissions JSONB DEFAULT '["read:listings", "read:orders", "read:messages"]'::jsonb,
  -- List of allowed permissions/scopes

  rate_limit INTEGER DEFAULT 1000,
  -- Requests per hour

  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP,

  expires_at TIMESTAMP,
  -- Optional expiration date

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- api_rate_limits: Track rate limiting per key
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,

  hour TIMESTAMP NOT NULL,
  -- Hour boundary for rate limiting

  request_count INTEGER DEFAULT 0,
  -- Number of requests in this hour

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(api_key_id, hour)
);

-- api_webhooks: Webhook subscriptions
CREATE TABLE IF NOT EXISTS api_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  webhook_url VARCHAR(2048) NOT NULL,
  description TEXT,

  events JSONB,
  -- Events to subscribe to: ["order.created", "order.completed", "message.received", "listing.created"]

  is_active BOOLEAN DEFAULT TRUE,
  verify_ssl BOOLEAN DEFAULT TRUE,

  retry_count INTEGER DEFAULT 3,
  -- Number of retries on failure

  secret VARCHAR(255),
  -- Secret for HMAC signature verification

  last_triggered_at TIMESTAMP,
  last_error TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- api_webhook_logs: Log of webhook deliveries
CREATE TABLE IF NOT EXISTS api_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES api_webhooks(id) ON DELETE CASCADE,

  event_type VARCHAR(100) NOT NULL,
  payload JSONB,

  http_status INTEGER,
  response TEXT,

  attempt_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP,

  delivered_at TIMESTAMP,
  failed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- api_usage_logs: Track all API calls
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,

  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  -- GET, POST, PUT, DELETE, etc.

  status_code INTEGER,

  response_time_ms INTEGER,
  -- Time to process request

  request_size_bytes INTEGER,
  response_size_bytes INTEGER,

  ip_address VARCHAR(45),
  user_agent TEXT,

  error_message TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- api_integrations: Third-party app registrations
CREATE TABLE IF NOT EXISTS api_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  app_name VARCHAR(255) NOT NULL,
  app_description TEXT,

  icon_url VARCHAR(2048),
  website_url VARCHAR(2048),

  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,

  status VARCHAR(50) DEFAULT 'active',
  -- active, paused, revoked

  sync_frequency VARCHAR(50),
  -- hourly, daily, weekly, manual

  last_sync_at TIMESTAMP,
  next_sync_at TIMESTAMP,

  sync_config JSONB,
  -- Configuration for this specific integration

  error_count INTEGER DEFAULT 0,
  last_error TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_rate_limits_api_key_id ON api_rate_limits(api_key_id);
CREATE INDEX idx_api_rate_limits_hour ON api_rate_limits(hour);
CREATE INDEX idx_api_webhooks_user_id ON api_webhooks(user_id);
CREATE INDEX idx_api_webhook_logs_webhook_id ON api_webhook_logs(webhook_id);
CREATE INDEX idx_api_webhook_logs_created_at ON api_webhook_logs(created_at DESC);
CREATE INDEX idx_api_usage_logs_api_key_id ON api_usage_logs(api_key_id);
CREATE INDEX idx_api_usage_logs_created_at ON api_usage_logs(created_at DESC);
CREATE INDEX idx_api_integrations_user_id ON api_integrations(user_id);

-- Function to check API rate limit
CREATE OR REPLACE FUNCTION check_api_rate_limit(p_api_key_id UUID)
RETURNS TABLE(limit_exceeded BOOLEAN, requests_remaining INTEGER) AS $$
DECLARE
  v_rate_limit INTEGER;
  v_request_count INTEGER;
BEGIN
  -- Get the rate limit for this key
  SELECT rate_limit INTO v_rate_limit FROM api_keys WHERE id = p_api_key_id;

  IF v_rate_limit IS NULL THEN
    RETURN QUERY SELECT TRUE, 0;
    RETURN;
  END IF;

  -- Get request count for current hour
  SELECT COALESCE(request_count, 0) INTO v_request_count
  FROM api_rate_limits
  WHERE api_key_id = p_api_key_id
    AND hour = DATE_TRUNC('hour', CURRENT_TIMESTAMP);

  -- Check if limit exceeded
  RETURN QUERY SELECT
    v_request_count >= v_rate_limit,
    GREATEST(0, v_rate_limit - v_request_count);
END;
$$ LANGUAGE plpgsql;

-- Function to increment API usage
CREATE OR REPLACE FUNCTION increment_api_usage(
  p_api_key_id UUID,
  p_endpoint VARCHAR,
  p_method VARCHAR,
  p_status_code INTEGER,
  p_response_time_ms INTEGER,
  p_request_size INTEGER,
  p_response_size INTEGER,
  p_ip_address VARCHAR,
  p_error_message VARCHAR DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_current_hour TIMESTAMP;
BEGIN
  v_current_hour := DATE_TRUNC('hour', CURRENT_TIMESTAMP);

  -- Insert or update rate limit record
  INSERT INTO api_rate_limits (api_key_id, hour, request_count)
  VALUES (p_api_key_id, v_current_hour, 1)
  ON CONFLICT (api_key_id, hour) DO UPDATE SET
    request_count = request_count + 1;

  -- Update last used time
  UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = p_api_key_id;

  -- Log the usage
  INSERT INTO api_usage_logs (
    api_key_id, endpoint, method, status_code, response_time_ms,
    request_size_bytes, response_size_bytes, ip_address, error_message
  ) VALUES (
    p_api_key_id, p_endpoint, p_method, p_status_code, p_response_time_ms,
    p_request_size, p_response_size, p_ip_address, p_error_message
  );
END;
$$ LANGUAGE plpgsql;

-- Function to retry failed webhooks
CREATE OR REPLACE FUNCTION retry_failed_webhooks()
RETURNS TABLE(retried INTEGER, failed INTEGER) AS $$
DECLARE
  v_retried INTEGER := 0;
  v_failed INTEGER := 0;
  v_webhook RECORD;
BEGIN
  FOR v_webhook IN
    SELECT * FROM api_webhook_logs
    WHERE delivered_at IS NULL
      AND failed_at IS NULL
      AND next_retry_at <= CURRENT_TIMESTAMP
      AND attempt_count < 3
    LIMIT 100
  LOOP
    BEGIN
      -- In production, this would actually send the webhook
      -- For now, just mark as processed
      UPDATE api_webhook_logs
      SET attempt_count = attempt_count + 1,
          next_retry_at = CURRENT_TIMESTAMP + (INTERVAL '1 minute' * power(2, attempt_count))
      WHERE id = v_webhook.id;

      v_retried := v_retried + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE api_webhook_logs
      SET failed_at = CURRENT_TIMESTAMP,
          attempt_count = attempt_count + 1
      WHERE id = v_webhook.id;

      v_failed := v_failed + 1;
    END;
  END LOOP;

  RETURN QUERY SELECT v_retried, v_failed;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_integrations ENABLE ROW LEVEL SECURITY;

-- Users can manage their own API keys
CREATE POLICY "Users manage own API keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Users can view their own webhooks
CREATE POLICY "Users manage own webhooks" ON api_webhooks
  FOR ALL USING (auth.uid() = user_id);

-- Users can view their own webhook logs
CREATE POLICY "Users view own webhook logs" ON api_webhook_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM api_webhooks w WHERE w.id = api_webhook_logs.webhook_id AND w.user_id = auth.uid()
    )
  );

-- Users can view their own usage logs
CREATE POLICY "Users view own usage logs" ON api_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM api_keys k WHERE k.id = api_usage_logs.api_key_id AND k.user_id = auth.uid()
    )
  );

-- Users can manage their own integrations
CREATE POLICY "Users manage own integrations" ON api_integrations
  FOR ALL USING (auth.uid() = user_id);
