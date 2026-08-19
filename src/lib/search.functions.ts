import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";

// Schemas
export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  promotion: z.boolean().optional(),
  featured: z.boolean().optional(),
  sortBy: z.enum(["newest", "popular", "rating", "price-asc", "price-desc"]).optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;

export const searchListingsSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  location: z.string(),
  price: z.number(),
  imageUrl: z.string().nullable(),
  promotionTier: z.string().nullable(),
  rating: z.number(),
  reviewCount: z.number(),
  viewCount: z.number(),
  isFeatured: z.boolean(),
  createdAt: z.string(),
});

export type SearchListing = z.infer<typeof searchListingsSchema>;

// Search listings
export const searchListings = createServerFn({
  method: "POST",
})
  .input(searchFiltersSchema)
  .handler(async (input) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    const {
      query,
      category,
      location,
      minPrice,
      maxPrice,
      promotion,
      featured,
      sortBy = "newest",
      page = 1,
      limit = 20,
    } = input;

    let q = supabase
      .from("listings")
      .select(
        `
        id,
        title,
        description,
        category,
        location,
        price,
        image_url,
        promotion_tier,
        rating,
        review_count,
        view_count,
        is_featured,
        created_at
      `,
        { count: "exact" }
      )
      .eq("is_active", true);

    // Full-text search
    if (query && query.trim()) {
      q = q.or(
        `title.ilike.%${query}%,description.ilike.%${query}%`
      );
    }

    // Category filter
    if (category && category !== "all") {
      q = q.eq("category", category);
    }

    // Location filter
    if (location && location !== "all") {
      q = q.eq("location", location);
    }

    // Price range filter
    if (minPrice !== undefined) {
      q = q.gte("price", minPrice);
    }
    if (maxPrice !== undefined) {
      q = q.lte("price", maxPrice);
    }

    // Promotion filter
    if (promotion === true) {
      q = q.not("promotion_tier", "is", null);
    }

    // Featured filter
    if (featured === true) {
      q = q.eq("is_featured", true);
    }

    // Sorting
    switch (sortBy) {
      case "popular":
        q = q.order("view_count", { ascending: false });
        break;
      case "rating":
        q = q.order("rating", { ascending: false });
        break;
      case "price-asc":
        q = q.order("price", { ascending: true });
        break;
      case "price-desc":
        q = q.order("price", { ascending: false });
        break;
      case "newest":
      default:
        q = q.order("created_at", { ascending: false });
    }

    // Pagination
    const offset = (page - 1) * limit;
    q = q.range(offset, offset + limit - 1);

    const { data: listings, error, count } = await q;

    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }

    // Record search in analytics (non-blocking)
    if (query && query.trim()) {
      supabase
        .from("search_history")
        .insert({
          query: query.trim(),
          results_count: count || 0,
        })
        .then()
        .catch(() => {
          // Silently fail analytics
        });
    }

    return {
      listings: listings?.map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        category: l.category,
        location: l.location,
        price: l.price,
        imageUrl: l.image_url,
        promotionTier: l.promotion_tier,
        rating: l.rating,
        reviewCount: l.review_count,
        viewCount: l.view_count,
        isFeatured: l.is_featured,
        createdAt: l.created_at,
      })) || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  });

// Get search suggestions
export const getSearchSuggestions = createServerFn({
  method: "POST",
})
  .input(z.object({ query: z.string().min(2) }))
  .handler(async ({ query }) => {
    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    // Get matching titles and categories
    const { data } = await supabase
      .from("listings")
      .select("title, category")
      .eq("is_active", true)
      .or(`title.ilike.%${query}%`)
      .limit(10);

    if (!data) return [];

    const suggestions = new Set<string>();
    data.forEach((item) => {
      if (item.title?.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(item.title);
      }
      if (item.category?.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(item.category);
      }
    });

    return Array.from(suggestions).slice(0, 8);
  });

// Get categories
export const getCategories = createServerFn({
  method: "GET",
}).handler(async () => {
  const supabase = await import("@supabase/supabase-js")
    .then((m) =>
      m.createClient(
        process.env.VITE_SUPABASE_URL || "",
        process.env.SUPABASE_PUBLISHABLE_KEY || ""
      )
    );

  const { data } = await supabase
    .from("listings")
    .select("category", { count: "exact" })
    .eq("is_active", true);

  if (!data) return [];

  const categories = new Map<string, number>();
  data.forEach((item) => {
    if (item.category) {
      categories.set(item.category, (categories.get(item.category) || 0) + 1);
    }
  });

  return Array.from(categories.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
});

// Get locations
export const getLocations = createServerFn({
  method: "GET",
}).handler(async () => {
  const supabase = await import("@supabase/supabase-js")
    .then((m) =>
      m.createClient(
        process.env.VITE_SUPABASE_URL || "",
        process.env.SUPABASE_PUBLISHABLE_KEY || ""
      )
    );

  const { data } = await supabase
    .from("listings")
    .select("location", { count: "exact" })
    .eq("is_active", true);

  if (!data) return [];

  const locations = new Map<string, number>();
  data.forEach((item) => {
    if (item.location) {
      locations.set(item.location, (locations.get(item.location) || 0) + 1);
    }
  });

  return Array.from(locations.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
});

// Save search
export const saveSearch = createServerFn({
  method: "POST",
})
  .input(
    z.object({
      name: z.string(),
      query: z.string().optional(),
      filters: z.record(z.any()).optional(),
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

    const { data, error } = await supabase
      .from("saved_searches")
      .insert({
        user_id: user.user.id,
        name: input.name,
        query: input.query || "",
        filters: input.filters || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save search: ${error.message}`);
    }

    return data;
  });

// Get saved searches
export const getSavedSearches = createServerFn({
  method: "GET",
}).handler(async () => {
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

  const { data, error } = await supabase
    .from("saved_searches")
    .select("*")
    .eq("user_id", user.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get saved searches: ${error.message}`);
  }

  return data || [];
});

// Delete saved search
export const deleteSavedSearch = createServerFn({
  method: "POST",
})
  .input(z.object({ id: z.string() }))
  .handler(async ({ id }) => {
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
      .from("saved_searches")
      .delete()
      .eq("id", id)
      .eq("user_id", user.user.id);

    if (error) {
      throw new Error(`Failed to delete search: ${error.message}`);
    }

    return { success: true };
  });

// Record listing view
export const recordListingView = createServerFn({
  method: "POST",
})
  .input(z.object({ listingId: z.string() }))
  .handler(async ({ listingId }) => {
    const { data: user } = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      )
      .then((client) => client.auth.getUser());

    const supabase = await import("@supabase/supabase-js")
      .then((m) =>
        m.createClient(
          process.env.VITE_SUPABASE_URL || "",
          process.env.SUPABASE_PUBLISHABLE_KEY || ""
        )
      );

    await supabase.from("listing_views").insert({
      listing_id: listingId,
      user_id: user?.user?.id || null,
    });

    // Also record interaction
    await supabase.from("listing_interactions").insert({
      listing_id: listingId,
      user_id: user?.user?.id || null,
      interaction_type: "view",
    });
  });
