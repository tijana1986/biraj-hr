import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";

// Get admin dashboard overview
export const getAdminDashboard = createServerFn({
  method: "POST",
})
  .input(z.object({}))
  .handler(async () => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    // Get today's metrics
    const { data: todayMetrics } = await supabase
      .from("marketplace_metrics")
      .select("*")
      .eq("metric_date", new Date().toISOString().split("T")[0])
      .single();

    // Get pending moderation items
    const { data: pendingModeration } = await supabase
      .from("moderation_queue")
      .select("*")
      .eq("status", "pending")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(5);

    // Get open disputes
    const { data: openDisputes } = await supabase
      .from("payment_disputes")
      .select(
        `
        id,
        order_id,
        initiated_by_id,
        dispute_type,
        status,
        created_at,
        promotion_orders!inner (
          total_amount,
          buyer_id,
          seller_id,
          listings (title)
        ),
        profiles!initiated_by_id (name)
      `
      )
      .eq("status", "open")
      .order("created_at", { ascending: true })
      .limit(5);

    // Get recent suspended users
    const { data: recentSuspensions } = await supabase
      .from("user_suspensions")
      .select(
        `
        id,
        user_id,
        suspension_type,
        reason,
        status,
        created_at,
        expires_at,
        profiles!user_id (name, email)
      `
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(5);

    return {
      metrics: todayMetrics || {
        totalUsers: 0,
        activeUsers: 0,
        totalListings: 0,
        totalOrders: 0,
        completedOrders: 0,
        grossVolume: 0,
        platformRevenue: 0,
        averageRating: 0,
      },
      pendingModeration: pendingModeration || [],
      openDisputes: openDisputes || [],
      recentSuspensions: recentSuspensions || [],
    };
  });

// Get marketplace metrics for date range
export const getMarketplaceMetrics = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      startDate: z.string(),
      endDate: z.string(),
    })
  )
  .handler(async ({ startDate, endDate }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { data: metrics } = await supabase
      .from("marketplace_metrics")
      .select("*")
      .gte("metric_date", startDate)
      .lte("metric_date", endDate)
      .order("metric_date", { ascending: true });

    return metrics || [];
  });

// Get moderation queue
export const getModerationQueue = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      status: z.enum(["pending", "approved", "rejected", "deleted"]).optional(),
      priority: z.enum(["low", "normal", "high", "critical"]).optional(),
      itemType: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    })
  )
  .handler(async ({ status, priority, itemType, limit, offset }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    let query = supabase.from("moderation_queue").select("*", { count: "exact" });

    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("priority", priority);
    if (itemType) query = query.eq("item_type", itemType);

    const { data, count } = await query
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    return {
      items: data || [],
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil((count || 0) / limit),
    };
  });

// Update moderation item
export const updateModerationItem = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      itemId: z.string(),
      status: z.enum(["approved", "rejected", "deleted"]),
      resolutionNotes: z.string().optional(),
    })
  )
  .handler(async ({ itemId, status, resolutionNotes }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { error } = await supabase
      .from("moderation_queue")
      .update({
        status,
        resolution_notes: resolutionNotes,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId);

    if (error) {
      throw new Error(`Failed to update moderation item: ${error.message}`);
    }

    return { success: true };
  });

// Get payment disputes
export const getPaymentDisputes = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      status: z.enum(["open", "in_progress", "resolved"]).optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    })
  )
  .handler(async ({ status, limit, offset }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    let query = supabase
      .from("payment_disputes")
      .select(
        `
        *,
        initiated_by:initiated_by_id (name, avatar_url),
        assigned_to:assigned_to_id (name)
      `,
        { count: "exact" }
      );

    if (status) query = query.eq("status", status);

    const { data, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    return {
      disputes: data || [],
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil((count || 0) / limit),
    };
  });

// Resolve dispute
export const resolveDispute = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      disputeId: z.string(),
      resolution: z.string(),
      refundAmount: z.number().optional(),
    })
  )
  .handler(async ({ disputeId, resolution, refundAmount }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { error } = await supabase
      .from("payment_disputes")
      .update({
        status: "resolved",
        resolution,
        refund_amount: refundAmount,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", disputeId);

    if (error) {
      throw new Error(`Failed to resolve dispute: ${error.message}`);
    }

    return { success: true };
  });

// Get seller warnings
export const getSellerWarnings = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      sellerId: z.string().optional(),
      severity: z.enum(["low", "medium", "high", "critical"]).optional(),
      limit: z.number().default(50),
    })
  )
  .handler(async ({ sellerId, severity, limit }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    let query = supabase
      .from("seller_warnings")
      .select(
        `
        *,
        seller:seller_id (name, avatar_url, email),
        admin:admin_id (name)
      `
      );

    if (sellerId) query = query.eq("seller_id", sellerId);
    if (severity) query = query.eq("severity", severity);

    const { data } = await query
      .order("created_at", { ascending: false })
      .limit(limit);

    return data || [];
  });

// Issue seller warning
export const issueSellerWarning = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      sellerId: z.string(),
      warningType: z.string(),
      description: z.string(),
      severity: z.enum(["low", "medium", "high", "critical"]),
      actionRequired: z.string().optional(),
      deadlineDays: z.number().optional(),
    })
  )
  .handler(async ({
    sellerId,
    warningType,
    description,
    severity,
    actionRequired,
    deadlineDays,
  }) => {
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

    const deadline = deadlineDays
      ? new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000)
      : null;

    const { error } = await supabase.from("seller_warnings").insert({
      seller_id: sellerId,
      admin_id: user.user.id,
      warning_type: warningType,
      description,
      severity,
      action_required: actionRequired,
      deadline: deadline?.toISOString(),
    });

    if (error) {
      throw new Error(`Failed to issue warning: ${error.message}`);
    }

    return { success: true };
  });

// Get user suspensions
export const getUserSuspensions = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      status: z.enum(["active", "lifted", "expired"]).optional(),
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
      .from("user_suspensions")
      .select(
        `
        *,
        user:user_id (name, email, avatar_url),
        admin:admin_id (name)
      `
      );

    if (status) query = query.eq("status", status);

    const { data } = await query
      .order("created_at", { ascending: false })
      .limit(limit);

    return data || [];
  });

// Suspend user
export const suspendUser = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      userId: z.string(),
      suspensionType: z.enum(["temporary", "permanent"]),
      reason: z.string(),
      durationDays: z.number().optional(),
    })
  )
  .handler(async ({ userId, suspensionType, reason, durationDays }) => {
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

    const expiresAt =
      suspensionType === "temporary" && durationDays
        ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
        : null;

    const { error } = await supabase.from("user_suspensions").insert({
      user_id: userId,
      admin_id: user.user.id,
      suspension_type: suspensionType,
      reason,
      duration_days: durationDays,
      expires_at: expiresAt?.toISOString(),
    });

    if (error) {
      throw new Error(`Failed to suspend user: ${error.message}`);
    }

    return { success: true };
  });

// Get admin logs
export const getAdminLogs = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      actionType: z.string().optional(),
      limit: z.number().default(100),
    })
  )
  .handler(async ({ actionType, limit }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    let query = supabase
      .from("admin_logs")
      .select(
        `
        *,
        admin:admin_id (name)
      `
      );

    if (actionType) query = query.eq("action_type", actionType);

    const { data } = await query
      .order("created_at", { ascending: false })
      .limit(limit);

    return data || [];
  });

// Get user details for admin
export const getUserDetailsAdmin = createServerFn({
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: listings } = await supabase
      .from("listings")
      .select("id, title, created_at, is_active")
      .eq("seller_id", userId);

    const { data: warnings } = await supabase
      .from("seller_warnings")
      .select("*")
      .eq("seller_id", userId);

    const { data: suspensions } = await supabase
      .from("user_suspensions")
      .select("*")
      .eq("user_id", userId);

    const { data: stats } = await supabase
      .from("seller_stats")
      .select("*")
      .eq("seller_id", userId)
      .single();

    return {
      profile,
      stats,
      listings: listings || [],
      warnings: warnings || [],
      suspensions: suspensions || [],
    };
  });
