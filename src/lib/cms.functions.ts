import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export interface FAQItem {
  id: string;
  section: string;
  question: string;
  answer: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  value_type: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_title: string;
  content: string;
  rating: number;
  active: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Fetch all active FAQ items (public, no auth required)
export const fetchFAQItems = createServerFn({ method: "GET" }).handler(async () => {
  // Create a minimal Supabase client for public reads
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(
    import.meta.env.VITE_SUPABASE_URL || "",
    import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  );

  const { data, error } = await sb
    .from("faq_items")
    .select("*")
    .eq("active", true)
    .order("section")
    .order("sort_order");

  if (error) throw new Error(`Failed to fetch FAQ: ${error.message}`);

  // Group by section
  const grouped: Record<string, FAQItem[]> = {};
  for (const item of data || []) {
    if (!grouped[item.section]) {
      grouped[item.section] = [];
    }
    grouped[item.section].push(item);
  }

  return grouped;
});

// Update FAQ (requires admin)
export const updateFAQItem = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      id: z.string(),
      question: z.string(),
      answer: z.string(),
    }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase
      .from("admin_users")
      .select("role")
      .eq("id", context.userId)
      .maybeSingle();

    if (!admin || (admin.role !== "admin" && admin.role !== "editor")) {
      throw new Error("Unauthorized");
    }

    const { data: result, error } = await context.supabase
      .from("faq_items")
      .update({ question: data.question, answer: data.answer, updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update FAQ: ${error.message}`);
    return result;
  });

// Create FAQ (requires admin)
export const createFAQItem = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      section: z.string(),
      question: z.string(),
      answer: z.string(),
      sort_order: z.number(),
    }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase
      .from("admin_users")
      .select("role")
      .eq("id", context.userId)
      .maybeSingle();

    if (!admin || (admin.role !== "admin" && admin.role !== "editor")) {
      throw new Error("Unauthorized");
    }

    const { data: result, error } = await context.supabase
      .from("faq_items")
      .insert([{ section: data.section, question: data.question, answer: data.answer, sort_order: data.sort_order, active: true }])
      .select()
      .single();

    if (error) throw new Error(`Failed to create FAQ: ${error.message}`);
    return result;
  });

// Delete FAQ (requires admin)
export const deleteFAQItem = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase
      .from("admin_users")
      .select("role")
      .eq("id", context.userId)
      .maybeSingle();

    if (!admin || (admin.role !== "admin" && admin.role !== "editor")) {
      throw new Error("Unauthorized");
    }

    const { error } = await context.supabase
      .from("faq_items")
      .update({ active: false })
      .eq("id", data.id);

    if (error) throw new Error(`Failed to delete FAQ: ${error.message}`);
    return { success: true };
  });

// Check if user is admin
export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("admin_users")
      .select("role")
      .eq("id", context.userId)
      .maybeSingle();

    return data?.role === "admin" || data?.role === "editor";
  });

// Fetch site setting
export const fetchSiteSetting = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ key: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(
      import.meta.env.VITE_SUPABASE_URL || "",
      import.meta.env.VITE_SUPABASE_ANON_KEY || "",
    );

    const { data: setting, error } = await sb
      .from("site_settings")
      .select("*")
      .eq("key", data.key)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw new Error(`Failed to fetch setting: ${error.message}`);
    return setting || null;
  });

// Update site setting (requires admin)
export const updateSiteSetting = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      key: z.string(),
      value: z.string(),
      value_type: z.string().optional(),
    }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase
      .from("admin_users")
      .select("role")
      .eq("id", context.userId)
      .maybeSingle();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const { data: result, error } = await context.supabase
      .from("site_settings")
      .upsert([{ key: data.key, value: data.value, value_type: data.value_type || "string", updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw new Error(`Failed to update setting: ${error.message}`);
    return result;
  });

// Fetch all testimonials (public)
export const fetchTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(
    import.meta.env.VITE_SUPABASE_URL || "",
    import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  );

  const { data, error } = await sb
    .from("testimonials")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  if (error) throw new Error(`Failed to fetch testimonials: ${error.message}`);
  return data || [];
});

// Fetch featured testimonials only
export const fetchFeaturedTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(
    import.meta.env.VITE_SUPABASE_URL || "",
    import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  );

  const { data, error } = await sb
    .from("testimonials")
    .select("*")
    .eq("active", true)
    .eq("featured", true)
    .order("sort_order");

  if (error) throw new Error(`Failed to fetch testimonials: ${error.message}`);
  return data || [];
});

// Create testimonial (requires admin)
export const createTestimonial = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      author_name: z.string().min(1),
      author_title: z.string().optional(),
      content: z.string().min(1),
      rating: z.number().min(1).max(5),
      featured: z.boolean().optional(),
      sort_order: z.number().optional(),
    }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase
      .from("admin_users")
      .select("role")
      .eq("id", context.userId)
      .maybeSingle();

    if (!admin || (admin.role !== "admin" && admin.role !== "editor")) {
      throw new Error("Unauthorized");
    }

    const { data: result, error } = await context.supabase
      .from("testimonials")
      .insert([{
        author_name: data.author_name,
        author_title: data.author_title || null,
        content: data.content,
        rating: data.rating,
        featured: data.featured || false,
        sort_order: data.sort_order || 0,
        active: true,
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to create testimonial: ${error.message}`);
    return result;
  });

// Update testimonial (requires admin)
export const updateTestimonial = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      id: z.string(),
      author_name: z.string().optional(),
      author_title: z.string().optional(),
      content: z.string().optional(),
      rating: z.number().min(1).max(5).optional(),
      featured: z.boolean().optional(),
    }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase
      .from("admin_users")
      .select("role")
      .eq("id", context.userId)
      .maybeSingle();

    if (!admin || (admin.role !== "admin" && admin.role !== "editor")) {
      throw new Error("Unauthorized");
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (data.author_name) updateData.author_name = data.author_name;
    if (data.author_title !== undefined) updateData.author_title = data.author_title;
    if (data.content) updateData.content = data.content;
    if (data.rating) updateData.rating = data.rating;
    if (data.featured !== undefined) updateData.featured = data.featured;

    const { data: result, error } = await context.supabase
      .from("testimonials")
      .update(updateData)
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update testimonial: ${error.message}`);
    return result;
  });

// Delete testimonial (soft delete - set active to false)
export const deleteTestimonial = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase
      .from("admin_users")
      .select("role")
      .eq("id", context.userId)
      .maybeSingle();

    if (!admin || (admin.role !== "admin" && admin.role !== "editor")) {
      throw new Error("Unauthorized");
    }

    const { error } = await context.supabase
      .from("testimonials")
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq("id", data.id);

    if (error) throw new Error(`Failed to delete testimonial: ${error.message}`);
    return { success: true };
  });
