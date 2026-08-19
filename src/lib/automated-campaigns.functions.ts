import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";

// Create campaign schedule
export const createCampaignSchedule = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      campaignId: z.string(),
      scheduleType: z.enum(["once", "daily", "weekly", "monthly", "custom_cron"]),
      scheduledFor: z.string().optional(),
      cronExpression: z.string().optional(),
      recurrenceEnd: z.string().optional(),
    })
  )
  .handler(async ({ campaignId, scheduleType, scheduledFor, cronExpression, recurrenceEnd }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const nextRunAt =
      scheduleType === "once"
        ? scheduledFor
        : new Date(Date.now() + 60000).toISOString(); // Start in 1 minute

    const { data, error } = await supabase
      .from("campaign_schedules")
      .insert({
        campaign_id: campaignId,
        schedule_type: scheduleType,
        scheduled_for: scheduledFor,
        cron_expression: cronExpression,
        recurrence_end: recurrenceEnd,
        next_run_at: nextRunAt,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create schedule: ${error.message}`);
    }

    return data;
  });

// Update campaign segmentation
export const updateCampaignSegmentation = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      campaignId: z.string(),
      segmentName: z.string(),
      criteria: z.record(z.any()),
      isControlGroup: z.boolean().optional(),
      controlGroupPercentage: z.number().optional(),
    })
  )
  .handler(async ({ campaignId, segmentName, criteria, isControlGroup, controlGroupPercentage }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { data, error } = await supabase
      .from("campaign_segmentation")
      .insert({
        campaign_id: campaignId,
        segment_name: segmentName,
        criteria,
        is_control_group: isControlGroup || false,
        control_group_percentage: controlGroupPercentage,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update segmentation: ${error.message}`);
    }

    return data;
  });

// Create A/B test
export const createCampaignABTest = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      campaignId: z.string(),
      testType: z.enum(["subject_line", "email_content", "send_time", "sender_name"]),
      variantAId: z.string(),
      variantBId: z.string(),
      testPercentage: z.number(),
    })
  )
  .handler(async ({ campaignId, testType, variantAId, variantBId, testPercentage }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { data, error } = await supabase
      .from("campaign_ab_tests")
      .insert({
        campaign_id: campaignId,
        test_type: testType,
        variant_a_id: variantAId,
        variant_b_id: variantBId,
        test_percentage: testPercentage,
        test_started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create A/B test: ${error.message}`);
    }

    return data;
  });

// Get campaign performance
export const getCampaignPerformance = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      campaignId: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .handler(async ({ campaignId, startDate, endDate }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    let query = supabase
      .from("campaign_performance_daily")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("report_date", { ascending: false });

    if (startDate) {
      query = query.gte("report_date", startDate);
    }

    if (endDate) {
      query = query.lte("report_date", endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get campaign performance: ${error.message}`);
    }

    // Calculate totals
    const totals = data?.reduce(
      (acc, day) => ({
        totalSent: acc.totalSent + (day.emails_sent || 0),
        totalOpens: acc.totalOpens + (day.opens || 0),
        totalClicks: acc.totalClicks + (day.clicks || 0),
        totalBounced: acc.totalBounced + (day.emails_bounced || 0),
        totalFailed: acc.totalFailed + (day.emails_failed || 0),
      }),
      {
        totalSent: 0,
        totalOpens: 0,
        totalClicks: 0,
        totalBounced: 0,
        totalFailed: 0,
      }
    ) || {};

    const avgOpenRate = totals.totalSent
      ? ((totals.totalOpens / totals.totalSent) * 100).toFixed(2)
      : 0;
    const avgClickRate = totals.totalSent
      ? ((totals.totalClicks / totals.totalSent) * 100).toFixed(2)
      : 0;

    return {
      daily: data || [],
      totals: {
        ...totals,
        avgOpenRate: parseFloat(String(avgOpenRate)),
        avgClickRate: parseFloat(String(avgClickRate)),
      },
    };
  });

// Get recipient engagement
export const getRecipientEngagementMetrics = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      campaignId: z.string(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    })
  )
  .handler(async ({ campaignId, limit, offset }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { data: metrics, count } = await supabase
      .from("recipient_engagement_metrics")
      .select(
        `
        *,
        campaign_recipients (recipient_email, status)
      `,
        { count: "exact" }
      )
      .eq("campaign_recipients.campaign_id", campaignId)
      .order("email_opened_at", { ascending: false })
      .range(offset, offset + limit - 1);

    return {
      metrics: metrics || [],
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil((count || 0) / limit),
    };
  });

// Add to suppression list
export const addToSuppressionList = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      campaignId: z.string(),
      emailAddress: z.string().email(),
      reason: z.string().optional(),
    })
  )
  .handler(async ({ campaignId, emailAddress, reason }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { error } = await supabase
      .from("campaign_suppression_list")
      .insert({
        campaign_id: campaignId,
        email_address: emailAddress,
        reason,
      });

    if (error) {
      throw new Error(`Failed to add to suppression list: ${error.message}`);
    }

    return { success: true };
  });

// Get campaign budget
export const getCampaignBudget = createServerFn({
  method: "POST",
})
  .input(z.object({ campaignId: z.string() }))
  .handler(async ({ campaignId }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { data, error } = await supabase
      .from("campaign_budget")
      .select("*")
      .eq("campaign_id", campaignId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to get budget: ${error.message}`);
    }

    return data || { budgetAmount: 0, costPerRecipient: 0, totalCost: 0 };
  });

// Update campaign budget
export const updateCampaignBudget = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      campaignId: z.string(),
      budgetAmount: z.number(),
      costPerRecipient: z.number(),
      maxRecipients: z.number().optional(),
    })
  )
  .handler(async ({ campaignId, budgetAmount, costPerRecipient, maxRecipients }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { data, error } = await supabase
      .from("campaign_budget")
      .upsert({
        campaign_id: campaignId,
        budget_amount: budgetAmount,
        cost_per_recipient: costPerRecipient,
        max_recipients: maxRecipients,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update budget: ${error.message}`);
    }

    return data;
  });

// Get campaign segmentation
export const getCampaignSegmentation = createServerFn({
  method: "POST",
})
  .input(z.object({ campaignId: z.string() }))
  .handler(async ({ campaignId }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { data, error } = await supabase
      .from("campaign_segmentation")
      .select("*")
      .eq("campaign_id", campaignId);

    if (error) {
      throw new Error(`Failed to get segmentation: ${error.message}`);
    }

    return data || [];
  });

// Get campaign schedules
export const getCampaignSchedules = createServerFn({
  method: "POST",
})
  .input(z.object({ campaignId: z.string() }))
  .handler(async ({ campaignId }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { data, error } = await supabase
      .from("campaign_schedules")
      .select("*")
      .eq("campaign_id", campaignId);

    if (error) {
      throw new Error(`Failed to get schedules: ${error.message}`);
    }

    return data || [];
  });

// Get campaign A/B tests
export const getCampaignABTests = createServerFn({
  method: "POST",
})
  .input(z.object({ campaignId: z.string() }))
  .handler(async ({ campaignId }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { data, error } = await supabase
      .from("campaign_ab_tests")
      .select("*")
      .eq("campaign_id", campaignId);

    if (error) {
      throw new Error(`Failed to get A/B tests: ${error.message}`);
    }

    return data || [];
  });
