-- Email Notification System

-- notification_templates: Email template definitions
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key VARCHAR(100) UNIQUE NOT NULL,
  -- Keys: order_confirmation, review_received, message_received, payment_dispute, seller_warning, suspension_notice, etc.
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  variables JSONB,
  -- Variables that can be used in template: {order_id}, {buyer_name}, {seller_name}, {amount}, etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- notification_queue: Pending emails to be sent
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_key VARCHAR(100) NOT NULL REFERENCES notification_templates(template_key),
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  html_body TEXT,
  text_body TEXT,
  variables JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  -- status: pending, sent, failed, bounced, unsubscribed
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  sent_at TIMESTAMP,
  scheduled_for TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- notification_preferences: User email preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,

  -- Email preferences by category
  order_notifications BOOLEAN DEFAULT TRUE,
  review_notifications BOOLEAN DEFAULT TRUE,
  message_notifications BOOLEAN DEFAULT TRUE,
  payment_notifications BOOLEAN DEFAULT TRUE,
  promotion_notifications BOOLEAN DEFAULT FALSE,
  system_notifications BOOLEAN DEFAULT TRUE,
  weekly_digest BOOLEAN DEFAULT TRUE,

  -- Frequency settings
  immediate_critical BOOLEAN DEFAULT TRUE,
  -- Send immediately for critical issues (suspension, payment problems)
  batch_daily BOOLEAN DEFAULT FALSE,
  -- Batch non-critical emails daily
  batch_weekly BOOLEAN DEFAULT TRUE,

  -- Unsubscribe
  unsubscribed_at TIMESTAMP,
  unsubscribe_reason TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- notification_logs: History of sent emails
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_key VARCHAR(100),
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  status VARCHAR(50),
  -- status: sent, failed, bounced, opened, clicked
  resend_message_id VARCHAR(255),
  -- Track with Resend provider
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- email_campaigns: Marketing and re-engagement campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50),
  -- campaign_type: promotional, reengagement, educational, announcement
  template_key VARCHAR(100) NOT NULL,
  target_segment VARCHAR(100),
  -- target_segment: inactive_sellers, new_sellers, high_value_buyers, all_users

  status VARCHAR(50) DEFAULT 'draft',
  -- status: draft, scheduled, running, paused, completed, canceled

  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  completed_at TIMESTAMP,

  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  open_rate DECIMAL(5, 2) DEFAULT 0,
  click_rate DECIMAL(5, 2) DEFAULT 0,

  created_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- campaign_recipients: Track campaign email recipients
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,

  status VARCHAR(50) DEFAULT 'pending',
  -- status: pending, sent, failed, opened, clicked

  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(campaign_id, user_id)
);

-- notification_unsubscribe: Track unsubscribe tokens
CREATE TABLE IF NOT EXISTS notification_unsubscribe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  unsubscribe_token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notification_queue_status ON notification_queue(status);
CREATE INDEX idx_notification_queue_user_id ON notification_queue(user_id);
CREATE INDEX idx_notification_queue_scheduled ON notification_queue(scheduled_for);
CREATE INDEX idx_notification_queue_created ON notification_queue(created_at DESC);
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_notification_logs_sent_at ON notification_logs(sent_at DESC);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_created_at ON email_campaigns(created_at DESC);
CREATE INDEX idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_user_id ON campaign_recipients(user_id);
CREATE INDEX idx_campaign_recipients_status ON campaign_recipients(status);

-- Auto-create notification preferences for new users
CREATE OR REPLACE FUNCTION create_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_created_notifications
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_notification_preferences();

-- Process notification queue (called by scheduler)
CREATE OR REPLACE FUNCTION process_notification_queue()
RETURNS TABLE(processed INTEGER, failed INTEGER) AS $$
DECLARE
  v_processed INTEGER := 0;
  v_failed INTEGER := 0;
  v_queue RECORD;
BEGIN
  FOR v_queue IN
    SELECT * FROM notification_queue
    WHERE status = 'pending'
      AND (scheduled_for IS NULL OR scheduled_for <= CURRENT_TIMESTAMP)
      AND attempt_count < max_attempts
    LIMIT 100
  LOOP
    BEGIN
      -- Here would integrate with Resend API
      -- For now, just mark as sent
      UPDATE notification_queue
      SET status = 'sent', sent_at = CURRENT_TIMESTAMP, attempt_count = attempt_count + 1
      WHERE id = v_queue.id;
      v_processed := v_processed + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE notification_queue
      SET status = 'failed', error_message = SQLERRM, attempt_count = attempt_count + 1
      WHERE id = v_queue.id;
      v_failed := v_failed + 1;
    END;
  END LOOP;

  RETURN QUERY SELECT v_processed, v_failed;
END;
$$ LANGUAGE plpgsql;

-- Retry failed notifications
CREATE OR REPLACE FUNCTION retry_failed_notifications()
RETURNS VOID AS $$
BEGIN
  UPDATE notification_queue
  SET status = 'pending', attempt_count = 0
  WHERE status = 'failed'
    AND attempt_count < max_attempts
    AND updated_at < CURRENT_TIMESTAMP - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Row-level security
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users view own preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users view own notification logs" ON notification_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Default templates
INSERT INTO notification_templates (template_key, name, subject, html_body, text_body) VALUES
('order_confirmation', 'Order Confirmation', 'Order #{order_id} Confirmed', '<h1>Order Confirmed</h1><p>Your order #{order_id} for {amount} KM has been confirmed.</p>', 'Order #{order_id} confirmed for {amount} KM'),
('review_received', 'Review Received', 'New Review on {listing_title}', '<h1>New Review</h1><p>{reviewer_name} left a review on your listing {listing_title}.</p>', '{reviewer_name} reviewed: {listing_title}'),
('message_received', 'New Message', 'New message from {sender_name}', '<h1>New Message</h1><p>You have a new message from {sender_name}.</p>', 'New message from {sender_name}'),
('payment_received', 'Payment Received', 'Payment of {amount} KM Received', '<h1>Payment Received</h1><p>Payment of {amount} KM has been received for order #{order_id}.</p>', 'Payment received: {amount} KM'),
('seller_warning', 'Account Warning', 'Action Required on Your Account', '<h1>Account Warning</h1><p>Your account requires attention: {warning_reason}</p>', 'Account warning: {warning_reason}'),
('suspension_notice', 'Account Suspended', 'Your Account Has Been Suspended', '<h1>Account Suspended</h1><p>Your account has been suspended. Reason: {suspension_reason}</p>', 'Account suspended: {suspension_reason}'),
('weekly_digest', 'Weekly Summary', 'Your Weekly Summary on Biraj.HR', '<h1>Weekly Summary</h1><p>Here is your weekly activity summary.</p>', 'Your weekly summary'),
('password_reset', 'Reset Your Password', 'Password Reset Request', '<h1>Reset Your Password</h1><p>Click the link to reset your password.</p>', 'Reset your password'),
('email_verification', 'Verify Your Email', 'Verify Your Email Address', '<h1>Verify Email</h1><p>Click to verify your email address.</p>', 'Verify your email');

-- Trigger to log sent notifications
CREATE OR REPLACE FUNCTION log_sent_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'sent' AND OLD.status != 'sent' THEN
    INSERT INTO notification_logs (user_id, template_key, recipient_email, subject, status, sent_at)
    VALUES (NEW.user_id, NEW.template_key, NEW.recipient_email, NEW.subject, 'sent', CURRENT_TIMESTAMP);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_notification_sent
AFTER UPDATE ON notification_queue
FOR EACH ROW
EXECUTE FUNCTION log_sent_notification();
