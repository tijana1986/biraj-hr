import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";

// Send notification email
export const sendNotification = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      userId: z.string(),
      templateKey: z.string(),
      variables: z.record(z.any()).optional(),
      scheduledFor: z.string().optional(),
    })
  )
  .handler(async ({ userId, templateKey, variables, scheduledFor }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    // Get user email
    const { data: user } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single();

    if (!user?.email) {
      throw new Error("User email not found");
    }

    // Get template
    const { data: template } = await supabase
      .from("notification_templates")
      .select("*")
      .eq("template_key", templateKey)
      .single();

    if (!template) {
      throw new Error("Template not found");
    }

    // Check user preferences
    const { data: preferences } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Map template key to preference field
    const preferenceMap: Record<string, keyof typeof preferences> = {
      order_confirmation: "order_notifications",
      review_received: "review_notifications",
      message_received: "message_notifications",
      payment_received: "payment_notifications",
      seller_warning: "system_notifications",
      suspension_notice: "system_notifications",
      weekly_digest: "weekly_digest",
    };

    const prefField = preferenceMap[templateKey];
    if (
      prefField &&
      preferences &&
      !preferences[prefField] &&
      preferences.unsubscribed_at
    ) {
      throw new Error("User unsubscribed from this notification type");
    }

    // Render template with variables
    let subject = template.subject;
    let htmlBody = template.html_body;
    let textBody = template.text_body;

    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{${key}}`;
        subject = subject.replace(placeholder, String(value));
        htmlBody = htmlBody.replace(placeholder, String(value));
        if (textBody) {
          textBody = textBody.replace(placeholder, String(value));
        }
      });
    }

    // Add to notification queue
    const { error } = await supabase
      .from("notification_queue")
      .insert({
        user_id: userId,
        template_key: templateKey,
        recipient_email: user.email,
        subject,
        html_body: htmlBody,
        text_body: textBody,
        variables,
        scheduled_for: scheduledFor,
      });

    if (error) {
      throw new Error(`Failed to queue notification: ${error.message}`);
    }

    return { success: true };
  });

// Get notification preferences
export const getNotificationPreferences = createServerFn({
  method: "POST",
})
  .input(z.object({ userId: z.string() }))
  .handler(async ({ userId }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { data: preferences } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    return (
      preferences || {
        orderNotifications: true,
        reviewNotifications: true,
        messageNotifications: true,
        paymentNotifications: true,
        promotionNotifications: false,
        systemNotifications: true,
        weeklyDigest: true,
        immediateCritical: true,
        batchDaily: false,
        batchWeekly: true,
      }
    );
  });

// Update notification preferences
export const updateNotificationPreferences = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      userId: z.string(),
      preferences: z.record(z.boolean()).optional(),
      unsubscribeAll: z.boolean().optional(),
    })
  )
  .handler(async ({ userId, preferences, unsubscribeAll }) => {
    const { data: user } = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      )
      .then((client) => client.auth.getUser());

    if (!user?.user || user.user.id !== userId) {
      throw new Error("Unauthorized");
    }

    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    if (unsubscribeAll) {
      const { error } = await supabase
        .from("notification_preferences")
        .update({
          unsubscribed_at: new Date().toISOString(),
          order_notifications: false,
          review_notifications: false,
          message_notifications: false,
          payment_notifications: false,
          promotion_notifications: false,
          system_notifications: false,
          weekly_digest: false,
        })
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Failed to unsubscribe: ${error.message}`);
      }
    } else if (preferences) {
      const updates: Record<string, any> = preferences;
      const { error } = await supabase
        .from("notification_preferences")
        .update(updates)
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Failed to update preferences: ${error.message}`);
      }
    }

    return { success: true };
  });

// Get notification logs
export const getNotificationLogs = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      userId: z.string(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    })
  )
  .handler(async ({ userId, limit, offset }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { data: logs, count } = await supabase
      .from("notification_logs")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("sent_at", { ascending: false })
      .range(offset, offset + limit - 1);

    return {
      logs: logs || [],
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil((count || 0) / limit),
    };
  });

// Send bulk campaign emails
export const createEmailCampaign = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      campaignType: z.string(),
      templateKey: z.string(),
      targetSegment: z.string(),
      scheduledAt: z.string().optional(),
    })
  )
  .handler(async (input) => {
    const { data: user } = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      )
      .then((client) => client.auth.getUser());

    if (!user?.user) {
      throw new Error("Not authenticated");
    }

    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("email_campaigns")
      .insert({
        name: input.name,
        description: input.description,
        campaign_type: input.campaignType,
        template_key: input.templateKey,
        target_segment: input.targetSegment,
        scheduled_at: input.scheduledAt,
        created_by_id: user.user.id,
      })
      .select()
      .single();

    if (campaignError) {
      throw new Error(`Failed to create campaign: ${campaignError.message}`);
    }

    // Get target users based on segment
    let query = supabase.from("profiles").select("id, email");

    if (input.targetSegment === "inactive_sellers") {
      query = query.lt("last_login", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    } else if (input.targetSegment === "new_sellers") {
      query = query.gt("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    }

    const { data: users } = await query;

    if (!users || users.length === 0) {
      throw new Error("No users found for target segment");
    }

    // Create campaign recipients
    const recipients = users.map((u: any) => ({
      campaign_id: campaign.id,
      user_id: u.id,
      recipient_email: u.email,
    }));

    const { error: recipientError } = await supabase
      .from("campaign_recipients")
      .insert(recipients);

    if (recipientError) {
      throw new Error(`Failed to add recipients: ${recipientError.message}`);
    }

    // Update campaign recipient count
    await supabase
      .from("email_campaigns")
      .update({ total_recipients: users.length })
      .eq("id", campaign.id);

    return {
      campaignId: campaign.id,
      recipientCount: users.length,
    };
  });

// Get email campaigns
export const getEmailCampaigns = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      status: z.enum(["draft", "scheduled", "running", "completed"]).optional(),
      limit: z.number().default(50),
    })
  )
  .handler(async ({ status, limit }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    let query = supabase
      .from("email_campaigns")
      .select(
        `
        *,
        created_by:created_by_id (name)
      `
      );

    if (status) {
      query = query.eq("status", status);
    }

    const { data: campaigns } = await query
      .order("created_at", { ascending: false })
      .limit(limit);

    return campaigns || [];
  });

// Get campaign statistics
export const getCampaignStats = createServerFn({
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

    const { data: campaign } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    const { data: recipients } = await supabase
      .from("campaign_recipients")
      .select("status")
      .eq("campaign_id", campaignId);

    const stats = {
      total: recipients?.length || 0,
      sent: recipients?.filter((r: any) => r.status === "sent").length || 0,
      opened: recipients?.filter((r: any) => r.status === "opened").length || 0,
      clicked: recipients?.filter((r: any) => r.status === "clicked").length || 0,
      failed: recipients?.filter((r: any) => r.status === "failed").length || 0,
    };

    return {
      campaign,
      stats: {
        ...stats,
        openRate: stats.total > 0 ? ((stats.opened / stats.total) * 100).toFixed(2) : 0,
        clickRate: stats.total > 0 ? ((stats.clicked / stats.total) * 100).toFixed(2) : 0,
      },
    };
  });
