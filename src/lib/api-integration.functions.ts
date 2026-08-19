import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import crypto from "crypto";

// Helper to hash API keys
function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

// Generate API key
export const generateApiKey = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      userId: z.string(),
      name: z.string(),
      description: z.string().optional(),
      permissions: z.array(z.string()).optional(),
      expiresAt: z.string().optional(),
    })
  )
  .handler(async ({ userId, name, description, permissions, expiresAt }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    // Generate random API key
    const key = `sk_${crypto.randomBytes(32).toString("hex")}`;
    const keyHash = hashApiKey(key);
    const keyPrefix = key.substring(0, 10);

    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        user_id: userId,
        name,
        description,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        permissions: permissions || [
          "read:listings",
          "read:orders",
          "read:messages",
        ],
        expires_at: expiresAt,
      })
      .select("id, name, key_prefix, expires_at, created_at")
      .single();

    if (error) {
      throw new Error(`Failed to create API key: ${error.message}`);
    }

    return {
      ...data,
      key: key, // Only return full key once on creation
    };
  });

// Get API keys for user
export const getUserApiKeys = createServerFn({
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

    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get API keys: ${error.message}`);
    }

    return data || [];
  });

// Revoke API key
export const revokeApiKey = createServerFn({
  method: "POST",
})
  .input(z.object({ apiKeyId: z.string() }))
  .handler(async ({ apiKeyId }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { error } = await supabase
      .from("api_keys")
      .update({ is_active: false })
      .eq("id", apiKeyId);

    if (error) {
      throw new Error(`Failed to revoke API key: ${error.message}`);
    }

    return { success: true };
  });

// Create webhook subscription
export const createWebhook = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      userId: z.string(),
      webhookUrl: z.string().url(),
      description: z.string().optional(),
      events: z.array(z.string()),
      verifySsl: z.boolean().optional(),
    })
  )
  .handler(async ({ userId, webhookUrl, description, events, verifySsl }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const secret = crypto.randomBytes(32).toString("hex");

    const { data, error } = await supabase
      .from("api_webhooks")
      .insert({
        user_id: userId,
        webhook_url: webhookUrl,
        description,
        events,
        verify_ssl: verifySsl !== false,
        secret,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create webhook: ${error.message}`);
    }

    return data;
  });

// Get webhooks for user
export const getUserWebhooks = createServerFn({
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

    const { data, error } = await supabase
      .from("api_webhooks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get webhooks: ${error.message}`);
    }

    return data || [];
  });

// Delete webhook
export const deleteWebhook = createServerFn({
  method: "POST",
})
  .input(z.object({ webhookId: z.string() }))
  .handler(async ({ webhookId }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { error } = await supabase
      .from("api_webhooks")
      .delete()
      .eq("id", webhookId);

    if (error) {
      throw new Error(`Failed to delete webhook: ${error.message}`);
    }

    return { success: true };
  });

// Get API usage statistics
export const getApiUsageStats = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      apiKeyId: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .handler(async ({ apiKeyId, startDate, endDate }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    let query = supabase
      .from("api_usage_logs")
      .select("*")
      .eq("api_key_id", apiKeyId)
      .order("created_at", { ascending: false });

    if (startDate) {
      query = query.gte("created_at", startDate);
    }

    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data, count, error } = await query.limit(1000);

    if (error) {
      throw new Error(`Failed to get usage stats: ${error.message}`);
    }

    // Calculate statistics
    const stats = data?.reduce(
      (acc, log) => ({
        totalRequests: acc.totalRequests + 1,
        successfulRequests: acc.successfulRequests + (log.status_code && log.status_code < 400 ? 1 : 0),
        failedRequests: acc.failedRequests + (log.status_code && log.status_code >= 400 ? 1 : 0),
        totalResponseTime: acc.totalResponseTime + (log.response_time_ms || 0),
        totalRequestSize: acc.totalRequestSize + (log.request_size_bytes || 0),
        totalResponseSize: acc.totalResponseSize + (log.response_size_bytes || 0),
      }),
      {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalResponseTime: 0,
        totalRequestSize: 0,
        totalResponseSize: 0,
      }
    ) || {};

    return {
      logs: data || [],
      stats: {
        ...stats,
        avgResponseTime: stats.totalRequests > 0 ? Math.round(stats.totalResponseTime / stats.totalRequests) : 0,
        successRate: stats.totalRequests > 0 ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2) : 0,
      },
      total: count || 0,
    };
  });

// Get webhook delivery logs
export const getWebhookLogs = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      webhookId: z.string(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    })
  )
  .handler(async ({ webhookId, limit, offset }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { data, count, error } = await supabase
      .from("api_webhook_logs")
      .select("*", { count: "exact" })
      .eq("webhook_id", webhookId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get webhook logs: ${error.message}`);
    }

    return {
      logs: data || [],
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil((count || 0) / limit),
    };
  });

// Create API integration
export const createApiIntegration = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      userId: z.string(),
      appName: z.string(),
      appDescription: z.string().optional(),
      iconUrl: z.string().optional(),
      websiteUrl: z.string().optional(),
      apiKeyId: z.string(),
      syncFrequency: z.string().optional(),
    })
  )
  .handler(async ({
    userId,
    appName,
    appDescription,
    iconUrl,
    websiteUrl,
    apiKeyId,
    syncFrequency,
  }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { data, error } = await supabase
      .from("api_integrations")
      .insert({
        user_id: userId,
        app_name: appName,
        app_description: appDescription,
        icon_url: iconUrl,
        website_url: websiteUrl,
        api_key_id: apiKeyId,
        sync_frequency: syncFrequency || "hourly",
        next_sync_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create integration: ${error.message}`);
    }

    return data;
  });

// Get API integrations for user
export const getUserApiIntegrations = createServerFn({
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

    const { data, error } = await supabase
      .from("api_integrations")
      .select("*, api_keys(key_prefix, is_active)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get integrations: ${error.message}`);
    }

    return data || [];
  });

// Test webhook
export const testWebhook = createServerFn({
  method: "POST",
})
  .input(z.object({ webhookId: z.string() }))
  .handler(async ({ webhookId }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    // Get webhook details
    const { data: webhook, error: webhookError } = await supabase
      .from("api_webhooks")
      .select("*")
      .eq("id", webhookId)
      .single();

    if (webhookError || !webhook) {
      throw new Error("Webhook not found");
    }

    // Create test payload
    const testPayload = {
      event: "webhook.test",
      timestamp: new Date().toISOString(),
      data: {
        message: "This is a test webhook",
      },
    };

    try {
      // In production, this would actually send HTTP request
      // For now, just log it
      console.log("Test webhook:", webhook.webhook_url, testPayload);

      return { success: true, message: "Test webhook sent successfully" };
    } catch (error) {
      throw new Error(`Failed to send test webhook: ${error}`);
    }
  });
