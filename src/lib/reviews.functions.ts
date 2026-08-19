import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";

// Get reviews for a listing
export const getListingReviews = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      listingId: z.string(),
      sortBy: z.enum(["recent", "helpful", "rating-high", "rating-low"]).optional(),
      ratingFilter: z.number().optional(),
      limit: z.number().default(10),
      offset: z.number().default(0),
    })
  )
  .handler(async ({ listingId, sortBy = "recent", ratingFilter, limit, offset }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    let q = supabase
      .from("listing_reviews")
      .select(
        `
        id,
        listing_id,
        reviewer_id,
        rating,
        title,
        comment,
        photos,
        is_verified_purchase,
        helpful_count,
        unhelpful_count,
        created_at,
        seller_review_responses (response, created_at),
        profiles!reviewer_id (name, avatar_url)
      `,
        { count: "exact" }
      )
      .eq("listing_id", listingId)
      .eq("status", "published");

    if (ratingFilter) {
      q = q.eq("rating", ratingFilter);
    }

    switch (sortBy) {
      case "helpful":
        q = q.order("helpful_count", { ascending: false });
        break;
      case "rating-high":
        q = q.order("rating", { ascending: false });
        break;
      case "rating-low":
        q = q.order("rating", { ascending: true });
        break;
      case "recent":
      default:
        q = q.order("created_at", { ascending: false });
    }

    q = q.range(offset, offset + limit - 1);

    const { data: reviews, error, count } = await q;

    if (error) {
      throw new Error(`Failed to get reviews: ${error.message}`);
    }

    return {
      reviews: reviews?.map((r: any) => ({
        id: r.id,
        listingId: r.listing_id,
        reviewerId: r.reviewer_id,
        reviewerName: r.profiles?.name || "Anonimni korisnik",
        reviewerAvatar: r.profiles?.avatar_url,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        photos: r.photos || [],
        isVerifiedPurchase: r.is_verified_purchase,
        helpfulCount: r.helpful_count,
        unhelpfulCount: r.unhelpful_count,
        createdAt: r.created_at,
        sellerResponse: r.seller_review_responses?.[0] || null,
      })) || [],
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil((count || 0) / limit),
    };
  });

// Get seller rating summary
export const getSellerRating = createServerFn({
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", sellerId)
      .single();

    return {
      sellerId,
      sellerName: profile?.name || "Prodavač",
      sellerAvatar: profile?.avatar_url,
      averageRating: rating?.average_rating || 0,
      totalReviews: rating?.total_reviews || 0,
      rating1Count: rating?.rating_1_count || 0,
      rating2Count: rating?.rating_2_count || 0,
      rating3Count: rating?.rating_3_count || 0,
      rating4Count: rating?.rating_4_count || 0,
      rating5Count: rating?.rating_5_count || 0,
      responseRate: rating?.response_rate || 0,
    };
  });

// Create review
export const createReview = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      listingId: z.string(),
      sellerId: z.string(),
      orderId: z.string().optional(),
      rating: z.number().min(1).max(5),
      title: z.string().min(5).max(200),
      comment: z.string().min(10).max(2000),
      photos: z.array(z.object({
        url: z.string(),
        description: z.string().optional(),
      })).optional(),
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

    const { data: existing } = await supabase
      .from("listing_reviews")
      .select("id")
      .eq("listing_id", input.listingId)
      .eq("reviewer_id", user.user.id)
      .single();

    if (existing) {
      throw new Error("Već si dao recenziju za ovaj oglas");
    }

    const { data: review, error } = await supabase
      .from("listing_reviews")
      .insert({
        listing_id: input.listingId,
        order_id: input.orderId,
        reviewer_id: user.user.id,
        seller_id: input.sellerId,
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        photos: input.photos || [],
        is_verified_purchase: !!input.orderId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create review: ${error.message}`);
    }

    return {
      success: true,
      reviewId: review.id,
    };
  });

// Update review
export const updateReview = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      reviewId: z.string(),
      rating: z.number().min(1).max(5),
      title: z.string().min(5).max(200),
      comment: z.string().min(10).max(2000),
      photos: z.array(z.object({
        url: z.string(),
        description: z.string().optional(),
      })).optional(),
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

    const { error } = await supabase
      .from("listing_reviews")
      .update({
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        photos: input.photos || [],
      })
      .eq("id", input.reviewId)
      .eq("reviewer_id", user.user.id);

    if (error) {
      throw new Error(`Failed to update review: ${error.message}`);
    }

    return { success: true };
  });

// Respond to review
export const respondToReview = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      reviewId: z.string(),
      response: z.string().min(10).max(1000),
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

    const { error } = await supabase.from("seller_review_responses").insert({
      review_id: input.reviewId,
      seller_id: user.user.id,
      response: input.response,
    });

    if (error) {
      throw new Error(`Failed to respond: ${error.message}`);
    }

    return { success: true };
  });

// Vote review helpful
export const voteReviewHelpful = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      reviewId: z.string(),
      isHelpful: z.boolean(),
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

    const { error } = await supabase
      .from("review_votes")
      .upsert({
        review_id: input.reviewId,
        voter_id: user.user.id,
        is_helpful: input.isHelpful,
      }, {
        onConflict: "review_id,voter_id",
      });

    if (error) {
      throw new Error(`Failed to vote: ${error.message}`);
    }

    return { success: true };
  });

// Flag review
export const flagReview = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      reviewId: z.string(),
      reason: z.enum(["spam", "offensive", "fake", "irrelevant"]),
      description: z.string().optional(),
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

    const { error } = await supabase.from("review_flags").insert({
      review_id: input.reviewId,
      reported_by_id: user.user.id,
      reason: input.reason,
      description: input.description,
    });

    if (error) {
      throw new Error(`Failed to flag review: ${error.message}`);
    }

    return { success: true };
  });
