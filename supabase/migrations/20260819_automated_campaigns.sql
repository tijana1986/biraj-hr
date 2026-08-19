-- Automated Email Campaigns System

-- campaign_schedules: Scheduled campaign executions
CREATE TABLE IF NOT EXISTS campaign_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,

  -- Scheduling
  schedule_type VARCHAR(50) NOT NULL,
  -- schedule_type: once, daily, weekly, monthly, custom_cron

  scheduled_for TIMESTAMP,
  -- For one-time campaigns

  cron_expression VARCHAR(100),
  -- For recurring campaigns: "0 9 * * MON" = every Monday at 9 AM

  recurrence_end TIMESTAMP,
  -- When to stop recurring, NULL = no end

  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,
  run_count INTEGER DEFAULT 0,

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- campaign_segmentation: Advanced targeting rules
CREATE TABLE IF NOT EXISTS campaign_segmentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,

  -- Segmentation rules
  segment_name VARCHAR(255) NOT NULL,

  -- Targeting criteria (JSONB for flexibility)
  -- Examples:
  -- {"account_age_days": {"min": 30, "max": 365}}
  -- {"last_activity_days": {"max": 60}}
  -- {"seller_rating": {"min": 4.5}}
  -- {"total_reviews": {"min": 10}}
  -- {"user_type": ["seller", "buyer"]}
  criteria JSONB,

  -- A/B Testing
  is_control_group BOOLEAN DEFAULT FALSE,
  control_group_percentage DECIMAL(5, 2),
  -- 5% go to control group, rest get normal email

  estimated_recipient_count INTEGER,
  actual_recipient_count INTEGER,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- campaign_ab_tests: A/B testing configurations
CREATE TABLE IF NOT EXISTS campaign_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,

  -- A/B Test Setup
  test_type VARCHAR(50) NOT NULL,
  -- test_type: subject_line, email_content, send_time, sender_name

  variant_a_id UUID REFERENCES notification_templates(id),
  variant_b_id UUID REFERENCES notification_templates(id),

  -- Test Configuration
  test_percentage DECIMAL(5, 2),
  -- Percentage of recipients for test (rest get winning version)

  winning_variant VARCHAR(1),
  -- 'A' or 'B' or NULL (not determined yet)

  test_started_at TIMESTAMP,
  test_ended_at TIMESTAMP,

  variant_a_open_rate DECIMAL(5, 2),
  variant_a_click_rate DECIMAL(5, 2),
  variant_b_open_rate DECIMAL(5, 2),
  variant_b_click_rate DECIMAL(5, 2),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- campaign_performance_daily: Daily performance aggregation
CREATE TABLE IF NOT EXISTS campaign_performance_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,

  report_date DATE NOT NULL,

  -- Daily metrics
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  emails_failed INTEGER DEFAULT 0,

  opens INTEGER DEFAULT 0,
  unique_opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,

  unsubscribes INTEGER DEFAULT 0,
  complaints INTEGER DEFAULT 0,

  -- Rates
  open_rate DECIMAL(5, 2),
  unique_open_rate DECIMAL(5, 2),
  click_rate DECIMAL(5, 2),
  unique_click_rate DECIMAL(5, 2),
  bounce_rate DECIMAL(5, 2),
  unsubscribe_rate DECIMAL(5, 2),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(campaign_id, report_date)
);

-- recipient_engagement_metrics: Track individual recipient engagement
CREATE TABLE IF NOT EXISTS recipient_engagement_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_recipient_id UUID NOT NULL REFERENCES campaign_recipients(id) ON DELETE CASCADE,

  -- Engagement tracking
  email_delivered_at TIMESTAMP,
  email_opened_at TIMESTAMP,
  email_clicked_at TIMESTAMP,

  clicked_url VARCHAR(2048),
  -- Track which URL was clicked

  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  -- Device info from email opens
  device_type VARCHAR(50),
  -- device_type: desktop, mobile, unknown

  email_client VARCHAR(100),
  -- email_client: Gmail, Outlook, Apple Mail, etc.

  -- Unsubscribe tracking
  unsubscribed_at TIMESTAMP,
  unsubscribe_reason TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- campaign_budget: Track spending for campaign budgets
CREATE TABLE IF NOT EXISTS campaign_budget (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL UNIQUE REFERENCES email_campaigns(id) ON DELETE CASCADE,

  -- Budget settings
  budget_amount DECIMAL(10, 2),
  -- Total budget for campaign

  cost_per_recipient DECIMAL(10, 2),
  -- Cost of sending to each recipient

  max_recipients INTEGER,
  -- Maximum recipients to send to

  total_cost DECIMAL(10, 2) DEFAULT 0,
  -- Actual cost incurred

  budget_exceeded_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- campaign_suppression_list: Addresses to exclude from campaigns
CREATE TABLE IF NOT EXISTS campaign_suppression_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,

  email_address VARCHAR(255) NOT NULL,
  reason VARCHAR(255),
  -- reason: bounced, complained, unsubscribed, manual

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(campaign_id, email_address)
);

-- Indexes for performance
CREATE INDEX idx_campaign_schedules_campaign_id ON campaign_schedules(campaign_id);
CREATE INDEX idx_campaign_schedules_next_run_at ON campaign_schedules(next_run_at);
CREATE INDEX idx_campaign_schedules_active ON campaign_schedules(is_active);
CREATE INDEX idx_campaign_segmentation_campaign_id ON campaign_segmentation(campaign_id);
CREATE INDEX idx_campaign_ab_tests_campaign_id ON campaign_ab_tests(campaign_id);
CREATE INDEX idx_campaign_performance_daily_campaign_id ON campaign_performance_daily(campaign_id);
CREATE INDEX idx_campaign_performance_daily_date ON campaign_performance_daily(report_date DESC);
CREATE INDEX idx_recipient_engagement_metrics_campaign_recipient_id ON recipient_engagement_metrics(campaign_recipient_id);
CREATE INDEX idx_recipient_engagement_metrics_opened ON recipient_engagement_metrics(email_opened_at);
CREATE INDEX idx_recipient_engagement_metrics_clicked ON recipient_engagement_metrics(email_clicked_at);
CREATE INDEX idx_campaign_budget_campaign_id ON campaign_budget(campaign_id);
CREATE INDEX idx_campaign_suppression_list_campaign_id ON campaign_suppression_list(campaign_id);
CREATE INDEX idx_campaign_suppression_list_email ON campaign_suppression_list(email_address);

-- Function to calculate campaign performance
CREATE OR REPLACE FUNCTION calculate_campaign_daily_performance(p_campaign_id UUID, p_report_date DATE)
RETURNS void AS $$
DECLARE
  v_total_sent INTEGER;
  v_total_opened INTEGER;
  v_total_clicked INTEGER;
  v_total_bounced INTEGER;
  v_total_failed INTEGER;
BEGIN
  -- Get metrics from campaign_recipients and recipient_engagement_metrics
  SELECT
    COUNT(cr.id),
    COUNT(CASE WHEN rem.email_opened_at IS NOT NULL THEN 1 END),
    COUNT(CASE WHEN rem.email_clicked_at IS NOT NULL THEN 1 END),
    COUNT(CASE WHEN cr.status = 'bounced' THEN 1 END),
    COUNT(CASE WHEN cr.status = 'failed' THEN 1 END)
  INTO v_total_sent, v_total_opened, v_total_clicked, v_total_bounced, v_total_failed
  FROM campaign_recipients cr
  LEFT JOIN recipient_engagement_metrics rem ON cr.id = rem.campaign_recipient_id
  WHERE cr.campaign_id = p_campaign_id
    AND DATE(cr.created_at) = p_report_date;

  -- Insert or update daily performance
  INSERT INTO campaign_performance_daily (
    campaign_id, report_date, emails_sent, opens, clicks, emails_bounced, emails_failed,
    open_rate, click_rate, bounce_rate
  ) VALUES (
    p_campaign_id, p_report_date, v_total_sent, v_total_opened, v_total_clicked, v_total_bounced, v_total_failed,
    CASE WHEN v_total_sent > 0 THEN ROUND((v_total_opened::DECIMAL / v_total_sent) * 100, 2) ELSE 0 END,
    CASE WHEN v_total_sent > 0 THEN ROUND((v_total_clicked::DECIMAL / v_total_sent) * 100, 2) ELSE 0 END,
    CASE WHEN v_total_sent > 0 THEN ROUND((v_total_bounced::DECIMAL / v_total_sent) * 100, 2) ELSE 0 END
  )
  ON CONFLICT (campaign_id, report_date) DO UPDATE SET
    emails_sent = EXCLUDED.emails_sent,
    opens = EXCLUDED.opens,
    clicks = EXCLUDED.clicks,
    emails_bounced = EXCLUDED.emails_bounced,
    emails_failed = EXCLUDED.emails_failed,
    open_rate = EXCLUDED.open_rate,
    click_rate = EXCLUDED.click_rate,
    bounce_rate = EXCLUDED.bounce_rate,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to process scheduled campaigns
CREATE OR REPLACE FUNCTION process_scheduled_campaigns()
RETURNS TABLE(processed INTEGER, failed INTEGER) AS $$
DECLARE
  v_processed INTEGER := 0;
  v_failed INTEGER := 0;
  v_schedule RECORD;
BEGIN
  FOR v_schedule IN
    SELECT * FROM campaign_schedules
    WHERE is_active = TRUE
      AND (next_run_at IS NULL OR next_run_at <= CURRENT_TIMESTAMP)
    LIMIT 50
  LOOP
    BEGIN
      -- Update campaign to running status
      UPDATE email_campaigns
      SET status = 'running'
      WHERE id = v_schedule.campaign_id;

      -- Queue emails for all recipients in this campaign
      INSERT INTO notification_queue (user_id, template_key, recipient_email, subject, html_body, text_body, scheduled_for)
      SELECT cr.user_id, ec.template_key, cr.recipient_email, nt.subject, nt.html_body, nt.text_body, CURRENT_TIMESTAMP
      FROM campaign_recipients cr
      JOIN email_campaigns ec ON cr.campaign_id = ec.id
      JOIN notification_templates nt ON ec.template_key = nt.template_key
      WHERE cr.campaign_id = v_schedule.campaign_id
        AND cr.status = 'pending'
        AND NOT EXISTS (
          SELECT 1 FROM campaign_suppression_list
          WHERE campaign_id = v_schedule.campaign_id
            AND email_address = cr.recipient_email
        );

      -- Update schedule
      UPDATE campaign_schedules
      SET last_run_at = CURRENT_TIMESTAMP,
          run_count = run_count + 1,
          next_run_at = CASE
            WHEN schedule_type = 'once' THEN NULL
            WHEN schedule_type = 'daily' THEN CURRENT_TIMESTAMP + INTERVAL '1 day'
            WHEN schedule_type = 'weekly' THEN CURRENT_TIMESTAMP + INTERVAL '7 days'
            WHEN schedule_type = 'monthly' THEN CURRENT_TIMESTAMP + INTERVAL '1 month'
            ELSE next_run_at
          END,
          is_active = CASE
            WHEN schedule_type = 'once' THEN FALSE
            WHEN recurrence_end IS NOT NULL AND CURRENT_TIMESTAMP >= recurrence_end THEN FALSE
            ELSE TRUE
          END
      WHERE id = v_schedule.id;

      v_processed := v_processed + 1;
    EXCEPTION WHEN OTHERS THEN
      v_failed := v_failed + 1;
    END;
  END LOOP;

  RETURN QUERY SELECT v_processed, v_failed;
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE campaign_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_segmentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_performance_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipient_engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_suppression_list ENABLE ROW LEVEL SECURITY;
