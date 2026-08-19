import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";

// Get seller dashboard overview
export const getSellerDashboard = createServerFn({
  method: "POST",
})
  .input(z.object({ sellerId: z.string() }))
  .handler(async ({ sellerId }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { data: stats } = await supabase
      .from("seller_stats")
      .select("*")
      .eq("seller_id", sellerId)
      .single();

    const { data: recentOrders } = await supabase
      .from("promotion_orders")
      .select(
        `
        id,
        created_at,
        payment_status,
        total_amount,
        listings (title),
        buyer:profiles!buyer_id (name, avatar_url)
      `
      )
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: recentMessages } = await supabase
      .from("conversations")
      .select(
        `
        id,
        last_message_at,
        buyer:buyer_id (name, avatar_url),
        messages!last (content, created_at)
      `
      )
      .eq("seller_id", sellerId)
      .order("last_message_at", { ascending: false })
      .limit(5);

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, avatar_url, email")
      .eq("id", sellerId)
      .single();

    return {
      stats: stats || {
        totalListings: 0,
        activeListings: 0,
        averageRating: 0,
        totalReviews: 0,
        totalMessages: 0,
        totalOrders: 0,
        completedOrders: 0,
        completionRate: 0,
        totalRevenue: 0,
        totalViews: 0,
        totalSaves: 0,
      },
      profile,
      recentOrders: recentOrders || [],
      recentMessages: recentMessages || [],
    };
  });

// Get seller earnings
export const getSellerEarnings = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      sellerId: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .handler(async ({ sellerId, startDate, endDate }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    let q = supabase
      .from("seller_earnings")
      .select("*")
      .eq("seller_id", sellerId)
      .order("transaction_date", { ascending: false });

    if (startDate) {
      q = q.gte("transaction_date", startDate);
    }

    if (endDate) {
      q = q.lte("transaction_date", endDate);
    }

    const { data: earnings } = await q;

    const { data: stats } = await supabase
      .from("seller_stats")
      .select("total_revenue, pending_payout")
      .eq("seller_id", sellerId)
      .single();

    return {
      earnings: earnings || [],
      totalRevenue: stats?.total_revenue || 0,
      pendingPayout: stats?.pending_payout || 0,
    };
  });

// Get seller performance metrics (for charts)
export const getSellerPerformanceMetrics = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      sellerId: z.string(),
      days: z.number().default(30),
    })
  )
  .handler(async ({ sellerId, days }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: dailyMetrics } = await supabase
      .from("seller_daily_metrics")
      .select("*")
      .eq("seller_id", sellerId)
      .gte("metric_date", startDate.toISOString().split("T")[0])
      .order("metric_date", { ascending: true });

    // Calculate totals
    const totals = (dailyMetrics || []).reduce(
      (acc, metric) => ({
        views: acc.views + (metric.new_views || 0),
        messages: acc.messages + (metric.new_messages || 0),
        orders: acc.orders + (metric.new_orders || 0),
        revenue: acc.revenue + (metric.daily_revenue || 0),
      }),
      { views: 0, messages: 0, orders: 0, revenue: 0 }
    );

    return {
      dailyMetrics: dailyMetrics || [],
      totals,
      period: {
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
        days,
      },
    };
  });

// Get seller reviews and ratings
export const getSellerReviewsAndRatings = createServerFn({
  method: "POST",
})
  .input(z.object({ sellerId: z.string() }))
  .handler(async ({ sellerId }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { data: rating } = await supabase
      .from("seller_ratings")
      .select("*")
      .eq("seller_id", sellerId)
      .single();

    const { data: recentReviews } = await supabase
      .from("listing_reviews")
      .select(
        `
        id,
        rating,
        title,
        comment,
        created_at,
        is_verified_purchase,
        helpful_count,
        seller_review_responses (response, created_at),
        profiles!reviewer_id (name, avatar_url)
      `
      )
      .eq("seller_id", sellerId)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(10);

    return {
      rating: rating || {
        averageRating: 0,
        totalReviews: 0,
        rating1Count: 0,
        rating2Count: 0,
        rating3Count: 0,
        rating4Count: 0,
        rating5Count: 0,
        responseRate: 0,
      },
      recentReviews: recentReviews || [],
    };
  });

// Get seller badges
export const getSellerBadges = createServerFn({
  method: "POST",
})
  .input(z.object({ sellerId: z.string() }))
  .handler(async ({ sellerId }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { data: badges } = await supabase
      .from("seller_badges")
      .select("*")
      .eq("seller_id", sellerId);

    return badges || [];
  });

// Get seller insights and recommendations
export const getSellerInsights = createServerFn({
  method: "POST",
})
  .input(z.object({ sellerId: z.string() }))
  .handler(async ({ sellerId }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { data: insights } = await supabase
      .from("seller_insights")
      .select("*")
      .eq("seller_id", sellerId)
      .single();

    return (
      insights || {
        ratingVsMarketAvg: 0,
        responseTimeVsMarketAvg: 0,
        ratingTrend: "stable",
        salesTrend: "stable",
        actionNeeded: false,
        actionType: null,
        actionPriority: null,
      }
    );
  });

// Get seller listing performance
export const getSellerListingPerformance = createServerFn({
  method: "POST",
})
  .input(z.object({ sellerId: z.string() }))
  .handler(async ({ sellerId }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { data: listings } = await supabase
      .from("listings")
      .select(
        `
        id,
        title,
        image_url,
        category,
        created_at,
        is_active,
        average_rating,
        view_count,
        listing_views:listing_views(count),
        listing_interactions:listing_interactions(count),
        listing_reviews:listing_reviews(count, rating)
      `
      )
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });

    return (
      listings?.map((listing: any) => ({
        id: listing.id,
        title: listing.title,
        imageUrl: listing.image_url,
        category: listing.category,
        isActive: listing.is_active,
        rating: listing.average_rating || 0,
        views: listing.view_count || 0,
        saves: listing.listing_interactions?.[0]?.count || 0,
        reviewCount: listing.listing_reviews?.[0]?.count || 0,
        avgReviewRating:
          listing.listing_reviews?.length > 0
            ? (
                listing.listing_reviews.reduce(
                  (sum: number, r: any) => sum + r.rating,
                  0
                ) / listing.listing_reviews.length
              ).toFixed(1)
            : 0,
        createdAt: listing.created_at,
      })) || []
    );
  });

// Update seller profile settings
export const updateSellerProfile = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      sellerId: z.string(),
      bio: z.string().optional(),
      responseTime: z.number().optional(),
      shippingInfo: z.string().optional(),
      returnPolicy: z.string().optional(),
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

    if (!user?.user || user.user.id !== input.sellerId) {
      throw new Error("Unauthorized");
    }

    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const { error } = await supabase
      .from("profiles")
      .update({
        bio: input.bio,
        metadata: {
          responseTime: input.responseTime,
          shippingInfo: input.shippingInfo,
          returnPolicy: input.returnPolicy,
        },
      })
      .eq("id", input.sellerId);

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return { success: true };
  });

// Get seller comparison with market averages
export const getMarketComparison = createServerFn({
  method: "POST",
})
  .input(z.object({ sellerId: z.string(), category: z.string().optional() }))
  .handler(async ({ sellerId, category }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    // Get seller's stats
    const { data: sellerStats } = await supabase
      .from("seller_stats")
      .select("average_rating, total_reviews, total_messages_sent, completion_rate")
      .eq("seller_id", sellerId)
      .single();

    // Get market averages
    let marketQuery = supabase
      .from("seller_stats")
      .select("average_rating, total_reviews, completion_rate");

    if (category) {
      // Join with listings to get category-specific averages
      marketQuery = supabase.rpc("get_market_stats_by_category", {
        p_category: category,
      });
    }

    const { data: marketStats } = await marketQuery;

    const avgStats = Array.isArray(marketStats)
      ? {
          avgRating:
            marketStats.reduce(
              (sum: number, s: any) => sum + (s.average_rating || 0),
              0
            ) / marketStats.length || 0,
          avgReviews:
            marketStats.reduce((sum: number, s: any) => sum + (s.total_reviews || 0), 0) /
              marketStats.length || 0,
          avgCompletionRate:
            marketStats.reduce(
              (sum: number, s: any) => sum + (s.completion_rate || 0),
              0
            ) / marketStats.length || 0,
        }
      : { avgRating: 0, avgReviews: 0, avgCompletionRate: 0 };

    return {
      seller: {
        rating: sellerStats?.average_rating || 0,
        reviews: sellerStats?.total_reviews || 0,
        completionRate: sellerStats?.completion_rate || 0,
      },
      market: avgStats,
      comparison: {
        ratingDiff: (sellerStats?.average_rating || 0) - avgStats.avgRating,
        reviewsDiff: (sellerStats?.total_reviews || 0) - avgStats.avgReviews,
        completionRateDiff:
          (sellerStats?.completion_rate || 0) - avgStats.avgCompletionRate,
      },
    };
  });
