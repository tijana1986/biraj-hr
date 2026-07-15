import { supabase } from "@/integrations/supabase/client";

/** Bilježi posjet podkategoriji u Lovable Cloud (analitika). */
export async function trackSubcategoryView(
  categorySlug: string,
  subcategorySlug: string,
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("subcategory_views").insert({
      category_slug: categorySlug,
      subcategory_slug: subcategorySlug,
      user_id: user?.id ?? null,
      referrer:
        typeof document !== "undefined" && document.referrer
          ? document.referrer.slice(0, 512)
          : null,
    });
  } catch (err) {
    // Tihi pad — analitika ne smije rušiti UX.
    if (import.meta.env.DEV) console.warn("trackSubcategoryView failed", err);
  }
}
